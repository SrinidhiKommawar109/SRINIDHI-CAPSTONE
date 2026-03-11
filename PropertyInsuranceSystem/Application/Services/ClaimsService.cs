using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using ClaimEntity = Domain.Entities.Claim;

namespace Application.Services;

public class ClaimsService : IClaimsService
{
    private readonly IRepository<ClaimEntity> _claimRepository;
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<Notification> _notificationRepository;
    private readonly IClaimRepository _claimReadRepository;
    private readonly IPolicyRequestRepository _policyRequestRepository;
    private readonly IInvoiceService _invoiceService;

    public ClaimsService(
        IRepository<ClaimEntity> claimRepository,
        IRepository<Invoice> invoiceRepository,
        IRepository<Notification> notificationRepository,
        IClaimRepository claimReadRepository,
        IPolicyRequestRepository policyRequestRepository,
        IInvoiceService invoiceService)
    {
        _claimRepository = claimRepository;
        _invoiceRepository = invoiceRepository;
        _notificationRepository = notificationRepository;
        _claimReadRepository = claimReadRepository;
        _policyRequestRepository = policyRequestRepository;
        _invoiceService = invoiceService;
    }

    public async Task FileClaimAsync(CreateClaimDto dto, int userId)
    {
        var policy = await _claimReadRepository.GetPolicyRequestByIdAsync(dto.PolicyRequestId);
        if (policy == null || policy.Status != PolicyRequestStatus.PolicyApproved)
            throw new InvalidOperationException("Invalid or unapproved policy.");

        // Validation: Impacted value should not exceed coverage rate
        decimal propertyValue = policy.PropertyValue ?? 0m;
        decimal coverageAmount = propertyValue * policy.Plan.CoverageRate;
        if (dto.ClaimAmount > coverageAmount)
            throw new InvalidOperationException($"Claim amount ₹{dto.ClaimAmount} exceeds the maximum coverage of ₹{coverageAmount} ({policy.Plan.CoverageRate * 100}% of property value).");

        var claim = new ClaimEntity
        {
            PolicyRequestId = dto.PolicyRequestId,
            PropertyAddress = dto.PropertyAddress,
            PropertyValue = dto.PropertyValue,
            PropertyAge = dto.PropertyAge,
            ClaimAmount = dto.ClaimAmount,
            Status = ClaimStatus.Pending,
            Remarks = "",
            PhotoUrls = dto.PhotoPaths
        };
        //Officer Assignment
        var officersWithCounts = await _claimReadRepository.GetOfficersWithApprovedClaimsCountAsync();
        if (officersWithCounts.Any())
        {
            var selectedOfficer = officersWithCounts
                .OrderBy(o => o.ApprovedClaimsCount)
                .ThenBy(o => o.Officer.Id)
                .First().Officer;

            claim.AssignedOfficerId = selectedOfficer.Id;
        }

        await _claimRepository.AddAsync(claim);

        var claimsOfficers = await _claimReadRepository.GetClaimsOfficersAsync();
        foreach (var co in claimsOfficers)
        {
            // Only notify the officer if they are the assigned officer, or if no officer is assigned (notifying all)
            if (claim.AssignedOfficerId == null || claim.AssignedOfficerId == co.Id)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    UserId = co.Id,
                    Title = "New Claim Filed",
                    Message = $"A new claim has been filed for policy ID {dto.PolicyRequestId}.",
                    Type = "info"
                });
            }
        }

        await _claimRepository.SaveChangesAsync();
    }

    public Task<List<Claim>> GetPendingClaimsAsync(int? officerId = null) =>
        _claimReadRepository.GetPendingClaimsAsync(officerId);

    public Task<List<Claim>> GetClaimsHistoryAsync(int? officerId = null) =>
        _claimReadRepository.GetClaimsHistoryAsync(officerId);

    public async Task<string> VerifyClaimAsync(int id, VerifyClaimDto dto)
    {
        var claim = await _claimReadRepository.GetByIdAsync(id);
        if (claim == null)
            throw new InvalidOperationException("Claim not found");

        if (claim.Status != ClaimStatus.Pending)
            throw new InvalidOperationException("Claim already processed.");

        if (dto.IsAccepted)
        {
            claim.Status = ClaimStatus.Approved;
            var policy = await _policyRequestRepository.GetByIdWithPlanAsync(claim.PolicyRequestId);
            if (policy == null)
                throw new InvalidOperationException("Policy not found.");

            await _invoiceService.GenerateInvoiceAsync(policy, claim.ClaimAmount);

            await _notificationRepository.AddAsync(new Notification
            {
                UserId = policy.CustomerId,
                Title = "Claim Approved",
                Message = $"Your claim for {policy.Plan.PlanName} has been approved.",
                Type = "success"
            });

            await _claimRepository.SaveChangesAsync();
            claim.Remarks = dto.Remarks ?? "Claim accepted";
            await _claimRepository.SaveChangesAsync();
            return "Insurance has been claimed ✅";
        }
        else
        {
            claim.Status = ClaimStatus.Rejected;
            claim.Remarks = dto.Remarks ?? "Claim rejected";

            var claimRequest = await _claimReadRepository.GetByIdWithPolicyRequestAsync(id);
            if (claimRequest != null)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    UserId = claimRequest.PolicyRequest!.CustomerId,
                    Title = "Claim Rejected",
                    Message = $"Your claim for request ID {claimRequest.PolicyRequestId} has been rejected. Remarks: {claim.Remarks}",
                    Type = "error"
                });
            }

            await _claimRepository.SaveChangesAsync();
            return "Claim rejected ❌";
        }
    }
}
