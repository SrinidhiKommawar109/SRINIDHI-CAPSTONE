using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using System.Text.Json;

namespace Application.Services;

public class PolicyRequestService : IPolicyRequestService
{
    private readonly IRepository<PolicyRequest> _policyRequestRepository;
    private readonly IRepository<Notification> _notificationRepository;
    private readonly IPolicyRequestRepository _policyRequestReadRepository;
    private readonly IRepository<ApplicationUser> _userRepository;
    private readonly IInvoiceService _invoiceService;

    public PolicyRequestService(
        IRepository<PolicyRequest> policyRequestRepository,
        IRepository<Notification> notificationRepository,
        IPolicyRequestRepository policyRequestReadRepository,
        IRepository<ApplicationUser> userRepository,
        IInvoiceService invoiceService)
    {
        _policyRequestRepository = policyRequestRepository;
        _notificationRepository = notificationRepository;
        _policyRequestReadRepository = policyRequestReadRepository;
        _userRepository = userRepository;
        _invoiceService = invoiceService;
    }

    public async Task CreateRequestAsync(CreatePolicyRequestDto dto, int customerId)
    {
        var plan = await _policyRequestReadRepository.GetPlanByIdAsync(dto.PlanId);
        if (plan == null)
            throw new InvalidOperationException("Invalid Plan ID.");

        var request = new PolicyRequest
        {
            PlanId = dto.PlanId,
            CustomerId = customerId,
            Status = PolicyRequestStatus.PendingAdmin
        };

        await _policyRequestRepository.AddAsync(request);
        await _policyRequestRepository.SaveChangesAsync();
    }

    public Task<List<PolicyRequest>> GetPendingRequestsAsync() =>
        _policyRequestReadRepository.GetPendingRequestsAsync();

    public async Task AssignAgentAsync(int requestId, int agentId, string? adminNotes)
    {
        var request = await _policyRequestReadRepository.GetByIdAsync(requestId);
        if (request == null)
            throw new InvalidOperationException("Request not found.");

        var agentExists = await _userRepository.AnyAsync(u => u.Id == agentId && u.Role == UserRole.Agent);
        if (!agentExists)
            throw new InvalidOperationException("Invalid Agent ID.");

        request.AgentId = agentId;
        request.AdminNotes = adminNotes;
        request.Status = PolicyRequestStatus.AgentAssigned;

        await _notificationRepository.AddAsync(new Notification
        {
            UserId = agentId,
            Title = "New Request Assigned",
            Message = $"Admin assigned a new policy request (ID: {request.Id}) to you.",
            Type = "info"
        });

        await _notificationRepository.AddAsync(new Notification
        {
            UserId = request.CustomerId,
            Title = "Agent Assigned",
            Message = $"An agent has been assigned to your policy request (ID: {request.Id}).",
            Type = "success"
        });

        await _policyRequestRepository.SaveChangesAsync();
    }

    public Task<List<PolicyRequest>> GetAssignedRequestsAsync(int agentId) =>
        _policyRequestReadRepository.GetAssignedForAgentAsync(agentId);

    public async Task SendFormToCustomerAsync(int requestId, string formType)
    {
        var request = await _policyRequestReadRepository.GetByIdAsync(requestId);
        if (request == null)
            throw new InvalidOperationException("Request not found.");

        if (request.Status != PolicyRequestStatus.AgentAssigned)
            throw new InvalidOperationException("Agent not assigned yet.");

        request.Status = PolicyRequestStatus.FormSent;
        request.FormType = formType;

        await _notificationRepository.AddAsync(new Notification
        {
            UserId = request.CustomerId,
            Title = "Action Required: Property Details",
            Message = "Please submit your property details as requested by the agent.",
            Type = "info"
        });

        await _policyRequestRepository.SaveChangesAsync();
    }

    public async Task SubmitPropertyDetailsAsync(int requestId, SubmitPropertyDto dto)
    {
        var request = await _policyRequestReadRepository.GetByIdAsync(requestId);
        if (request == null)
            throw new InvalidOperationException("Request not found.");

        if (request.Status != PolicyRequestStatus.FormSent)
            throw new InvalidOperationException("Form not sent yet.");

        if (string.IsNullOrWhiteSpace(dto.PropertyAddress))
            throw new InvalidOperationException("Property address is required.");
        if (dto.PropertyValue <= 0 && request.FormType != "Contents")
            throw new InvalidOperationException("Property value must be greater than zero.");
        if (dto.PropertyAge < 0)
            throw new InvalidOperationException("Property age cannot be negative.");

        request.PropertyAddress = dto.PropertyAddress;
        request.PropertyValue = dto.PropertyValue;
        request.PropertyAge = dto.PropertyAge;
        request.PropertyDetailsJson = dto.PropertyDetailsJson;
        request.Status = PolicyRequestStatus.FormSubmitted;

        if (request.AgentId.HasValue)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                UserId = request.AgentId.Value,
                Title = "Form Submitted",
                Message = $"Customer has submitted property details for request ID {request.Id}.",
                Type = "info"
            });
        }

        await _policyRequestRepository.SaveChangesAsync();
    }

    public async Task<CalculateRiskResultDto> CalculateRiskAsync(int requestId)
    {
        try
        {
            var request = await _policyRequestReadRepository.GetByIdWithPlanAsync(requestId);
            if (request == null)
                throw new InvalidOperationException("Request not found.");

            if (request.Status != PolicyRequestStatus.FormSubmitted)
                throw new InvalidOperationException("Form not submitted yet.");

            decimal riskScore = 0;

            // Deserialize property details safely
            var details = !string.IsNullOrEmpty(request.PropertyDetailsJson)
                ? JsonSerializer.Deserialize<Dictionary<string, object>>(request.PropertyDetailsJson)
                : new Dictionary<string, object>();

            decimal propertyAge = request.PropertyAge ?? 0;
            decimal propertyValue = request.PropertyValue ?? 0;

            if (request.FormType == "Residential")
            {
                bool floodZone = details.ContainsKey("floodZone") && details["floodZone"]?.ToString()?.ToLower() == "yes";
                int claims = (int)GetDetailValueAsDecimal(details!, "previousInsuranceClaims");
                bool securitySystem = details.ContainsKey("securitySystemAvailable") && details["securitySystemAvailable"]?.ToString()?.ToLower() == "yes";

                riskScore = (propertyAge * 0.2m)
                  + (propertyValue / 10000m)
                  + (floodZone ? 5m : 0m)
                  + (claims * 2m)
                  - (securitySystem ? 2m : 0m);
            }
            else if (request.FormType == "Commercial")
            {
                bool flammableMaterial = details.ContainsKey("storageOfFlammableMaterials") && details["storageOfFlammableMaterials"]?.ToString()?.ToLower() == "yes";
                int claims = (int)GetDetailValueAsDecimal(details!, "previousInsuranceClaims");
                string crimeRateStr = details.ContainsKey("crimeRateInArea") ? details["crimeRateInArea"]?.ToString()?.ToLower() ?? "" : "";
                decimal crimeRateScore = crimeRateStr == "low" ? 1m : crimeRateStr == "medium" ? 3m : crimeRateStr == "high" ? 5m : 0m;
                bool fireSafety = details.ContainsKey("fireSafetySystem") && details["fireSafetySystem"]?.ToString()?.ToLower() == "yes";
                bool securitySystem = details.ContainsKey("securitySystemCCTV") && details["securitySystemCCTV"]?.ToString()?.ToLower() == "yes";

                riskScore = (propertyAge * 0.3m)
                  + (propertyValue / 10000m)
                  + (flammableMaterial ? 6m : 0m)
                  + (claims * 3m)
                  + crimeRateScore
                  - (fireSafety ? 3m : 0m)
                  - (securitySystem ? 2m : 0m);
                    }
            else if (request.FormType == "Industrial")
            {
                decimal machineryValue = GetDetailValueAsDecimal(details!, "machineryValue");
                bool hazardousMaterial = details.ContainsKey("hazardousMaterialStorage") && details["hazardousMaterialStorage"]?.ToString()?.ToLower() == "yes";
                int accidentHistory = (int)GetDetailValueAsDecimal(details!, "accidentHistory");
                string envRiskStr = details.ContainsKey("environmentalRisk") ? details["environmentalRisk"]?.ToString()?.ToLower() ?? "" : "";
                decimal envRiskScore = envRiskStr == "low" ? 2m : envRiskStr == "medium" ? 5m : envRiskStr == "high" ? 8m : 0m;
                bool fireProtection = details.ContainsKey("fireProtectionSystem") && details["fireProtectionSystem"]?.ToString()?.ToLower() == "yes";

                riskScore = (propertyAge * 0.4m)
                  + (propertyValue / 10000m)
                  + (machineryValue / 10000m)
                  + (hazardousMaterial ? 8m : 0m)
                  + (accidentHistory * 3m)
                  + envRiskScore
                  - (fireProtection ? 4m : 0m);
            }
            else if (request.FormType == "Contents")
            {
                decimal contentValue = details.ContainsKey("totalContentValue") ? GetDetailValueAsDecimal(details!, "totalContentValue") : propertyValue;
                int claims = (int)GetDetailValueAsDecimal(details!, "previousTheftClaims");
                string securityLevelStr = details.ContainsKey("buildingSecurityLevel") ? details["buildingSecurityLevel"]?.ToString()?.ToLower() ?? "" : "";
                decimal securityLevelScore = securityLevelStr == "low" ? 5m : securityLevelStr == "medium" ? 3m : securityLevelStr == "high" ? 1m : 0m;
                bool fireProtection = details.ContainsKey("fireProtectionSystem") && details["fireProtectionSystem"]?.ToString()?.ToLower() == "yes";
                bool theftProtection = details.ContainsKey("theftProtection") && details["theftProtection"]?.ToString()?.ToLower() == "yes";

                riskScore = (contentValue / 10000m)
                   + (claims * 3m)
                   + securityLevelScore
                   - (fireProtection ? 2m : 0m)
                   - (theftProtection ? 2m : 0m);
            }
            else
            {
                // Fallback backward compatibility calculation
                if (request.PropertyAge > 10) riskScore += 30;
                if (request.PropertyValue > 250000) riskScore += 40;
            }

            request.RiskScore = Math.Round(riskScore, 2);

            decimal basePremium = request.Plan.BasePremium;

            // To match premium calculation "Premium = BasePremium * RiskFactor" where possible.
            decimal riskMultiplier = 1 + (riskScore / 100);
            decimal finalPremium = basePremium * riskMultiplier;

            request.PremiumAmount = finalPremium;
            request.TotalPremium = finalPremium;
            request.Frequency = request.Plan.Frequency;

            int installmentCount = request.Plan.Frequency switch
            {
                PremiumFrequency.Quarterly => 4,
                PremiumFrequency.HalfYearly => 2,
                PremiumFrequency.Yearly => 1,
                _ => 1
            };

            request.InstallmentCount = installmentCount;
            request.InstallmentAmount = finalPremium / installmentCount;
            request.AgentCommissionAmount = request.Plan.AgentCommission;
            request.Status = PolicyRequestStatus.RiskCalculated;

            await _notificationRepository.AddAsync(new Notification
            {
                UserId = request.CustomerId,
                Title = "Premium Calculated",
                Message = $"Your premium has been calculated: {request.TotalPremium:C}. Please review and confirm purchase.",
                Type = "success"
            });

            await _policyRequestRepository.SaveChangesAsync();

            return new CalculateRiskResultDto
            {
                Id = request.Id,
                PlanId = request.PlanId,
                PlanName = request.Plan.PlanName,
                RiskScore = request.RiskScore,
                TotalPremium = request.TotalPremium,
                Frequency = request.Frequency,
                InstallmentCount = request.InstallmentCount,
                InstallmentAmount = request.InstallmentAmount,
                AgentCommissionAmount = request.AgentCommissionAmount,
                Status = request.Status
            };
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException($"Invalid property details format: {ex.Message}");
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            throw new InvalidOperationException($"An error occurred during risk calculation: {ex.Message}");
        }
    }

    private decimal GetDetailValueAsDecimal(Dictionary<string, object> details, string key)
    {
        if (!details.ContainsKey(key) || details[key] == null)
            return 0;

        var val = details[key];

        if (val is JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.Number)
                return element.GetDecimal();
            if (element.ValueKind == JsonValueKind.String && decimal.TryParse(element.GetString(), out var d))
                return d;
        }
        else if (val is string s && decimal.TryParse(s, out var d))
        {
            return d;
        }
        else if (val is int i)
        {
            return i;
        }
        else if (val is decimal dec)
        {
            return dec;
        }
        else if (val is double db)
        {
            return (decimal)db;
        }

        return 0;
    }

    public async Task BuyPolicyAsync(int requestId)
    {
        var request = await _policyRequestReadRepository.GetByIdAsync(requestId);
        if (request == null)
            throw new InvalidOperationException("Request not found.");

        if (request.Status != PolicyRequestStatus.RiskCalculated)
            throw new InvalidOperationException("Risk not calculated yet.");

        request.Status = PolicyRequestStatus.CustomerConfirmed;

        var admins = await _policyRequestReadRepository.GetAdminsAsync();
        foreach (var admin in admins)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                UserId = admin.Id,
                Title = "Action Required: Final Approval",
                Message = $"Customer has confirmed purchase for request ID {request.Id}. Please provide final approval.",
                Type = "info"
            });
        }

        await _policyRequestRepository.SaveChangesAsync();
    }

    public async Task AdminApproveAsync(int requestId)
    {
        var request = await _policyRequestReadRepository.GetByIdWithPlanAsync(requestId);
        if (request == null)
            throw new InvalidOperationException("Request not found.");

        if (request.Status != PolicyRequestStatus.CustomerConfirmed)
            throw new InvalidOperationException("Customer has not confirmed yet.");

        request.Status = PolicyRequestStatus.PolicyApproved;

        await _notificationRepository.AddAsync(new Notification
        {
            UserId = request.CustomerId,
            Title = "Policy Approved",
            Message = "Your policy has been officially approved. Congratulations!",
            Type = "success"
        });

        // Generate invoice upon final admin approval
        await _invoiceService.GenerateInvoiceAsync(request);

        await _policyRequestRepository.SaveChangesAsync();
    }

    public Task<List<PolicyRequest>> GetMyRequestsAsync(int customerId) =>
        _policyRequestReadRepository.GetMyRequestsAsync(customerId);

    public Task<List<PolicyRequest>> GetApprovedForAgentAsync(int agentId) =>
        _policyRequestReadRepository.GetApprovedForAgentAsync(agentId);

    public async Task<List<PolicyRequestResponseDto>> GetAllRequestsAsync()
    {
        var requests = await _policyRequestReadRepository.GetAllRequestsWithClaimsAsync();
        return requests.Select(r =>
        {
            var latestClaim = r.Claims.OrderByDescending(c => c.Id).FirstOrDefault();
            return new PolicyRequestResponseDto
            {
                Id = r.Id,
                PlanId = r.PlanId,
                PlanName = r.Plan.PlanName,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                AgentId = r.AgentId,
                AgentName = r.Agent?.FullName,
                Status = r.Status,
                PropertyAddress = r.PropertyAddress,
                PropertyValue = r.PropertyValue,
                PropertyAge = r.PropertyAge,
                RiskScore = r.RiskScore,
                PremiumAmount = r.PremiumAmount,
                AgentCommissionAmount = r.AgentCommissionAmount,
                ClaimId = latestClaim?.Id,
                ClaimStatus = latestClaim?.Status.ToString(),
                ClaimsOfficerId = latestClaim?.AssignedOfficerId,
                ClaimsOfficerName = latestClaim?.AssignedOfficer?.FullName
            };
        }).ToList();
    }
}
