using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Domain.Entities;
using Domain.Enums;
using Application.DTOs;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PolicyRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PolicyRequestsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // 1️⃣ CUSTOMER CREATES POLICY REQUEST
        // =====================================================
        [HttpPost("create")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateRequest(CreatePolicyRequestDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid request data.");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim.Value);

            var plan = await _context.PropertyPlans
                .FirstOrDefaultAsync(p => p.Id == dto.PlanId);

            if (plan == null)
                return BadRequest("Invalid Plan ID.");

            var request = new PolicyRequest
            {
                PlanId = dto.PlanId,
                CustomerId = userId,
                Status = PolicyRequestStatus.PendingAdmin
            };

            _context.PolicyRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok("Policy request created successfully.");
        }

        // =====================================================
        // 2️⃣ ADMIN - VIEW PENDING REQUESTS
        // =====================================================
        [HttpGet("admin/pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var requests = await _context.PolicyRequests
                .Include(r => r.Plan)
                .Include(r => r.Customer)
                .Where(r =>
                    r.Status == PolicyRequestStatus.PendingAdmin ||
                    r.Status == PolicyRequestStatus.CustomerConfirmed)
                .ToListAsync();

            return Ok(requests);
        }

        // =====================================================
        // 3️⃣ ADMIN - ASSIGN AGENT
        // =====================================================
        [HttpPut("{id}/assign-agent/{agentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignAgent(int id, int agentId, [FromBody] string? adminNotes)
        {
            var request = await _context.PolicyRequests.FindAsync(id);
            if (request == null)
                return NotFound("Request not found.");
 
            var agentExists = await _context.Users
                .AnyAsync(u => u.Id == agentId && u.Role == UserRole.Agent);
 
            if (!agentExists)
                return BadRequest("Invalid Agent ID.");
 
            request.AgentId = agentId;
            request.AdminNotes = adminNotes;
            request.Status = PolicyRequestStatus.AgentAssigned;
 
            // Notifications
            _context.Notifications.Add(new Notification
            {
                UserId = agentId,
                Title = "New Request Assigned",
                Message = $"Admin assigned a new policy request (ID: {request.Id}) to you.",
                Type = "info"
            });

            _context.Notifications.Add(new Notification
            {
                UserId = request.CustomerId,
                Title = "Agent Assigned",
                Message = $"An agent has been assigned to your policy request (ID: {request.Id}).",
                Type = "success"
            });

            await _context.SaveChangesAsync();
 
            return Ok("Agent assigned successfully.");
        }
 
        // =====================================================
        // 3.1️⃣ AGENT - VIEW ASSIGNED REQUESTS
        // =====================================================
        [HttpGet("agent/assigned")]
        [Authorize(Roles = "Agent")]
        public async Task<IActionResult> GetAssignedRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");
 
            if (!int.TryParse(userIdClaim.Value, out int userId))
                return BadRequest("Invalid user ID in token.");
 
            var requests = await _context.PolicyRequests
                .Include(r => r.Plan)
                .Include(r => r.Customer)
                .Where(r => r.AgentId == userId && 
                           (r.Status == PolicyRequestStatus.AgentAssigned || 
                            r.Status == PolicyRequestStatus.FormSent || 
                            r.Status == PolicyRequestStatus.FormSubmitted || 
                            r.Status == PolicyRequestStatus.RiskCalculated))
                .OrderByDescending(r => r.Id)
                .ToListAsync();
 
            return Ok(requests);
        }

        // =====================================================
        // 4️⃣ AGENT - SEND FORM TO CUSTOMER
        // =====================================================
        [HttpPut("{id}/send-form")]
        [Authorize(Roles = "Agent")]
        public async Task<IActionResult> SendFormToCustomer(int id)
        {
            var request = await _context.PolicyRequests.FindAsync(id);
            if (request == null)
                return NotFound("Request not found.");

            if (request.Status != PolicyRequestStatus.AgentAssigned)
                return BadRequest("Agent not assigned yet.");

            request.Status = PolicyRequestStatus.FormSent;

            _context.Notifications.Add(new Notification
            {
                UserId = request.CustomerId,
                Title = "Action Required: Property Details",
                Message = "Please submit your property details as requested by the agent.",
                Type = "info"
            });
 
            await _context.SaveChangesAsync();

            return Ok("Form sent to customer.");
        }

        // =====================================================
        // 5️⃣ CUSTOMER SUBMITS PROPERTY DETAILS
        // =====================================================
        [HttpPut("{id}/submit-form")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> SubmitPropertyDetails(int id, SubmitPropertyDto dto)
        {
            var request = await _context.PolicyRequests.FindAsync(id);

            if (request == null)
                return NotFound("Request not found.");

            if (request.Status != PolicyRequestStatus.FormSent)
                return BadRequest("Form not sent yet.");

            request.PropertyAddress = dto.PropertyAddress;
            request.PropertyValue = dto.PropertyValue;
            request.PropertyAge = dto.PropertyAge;

            request.Status = PolicyRequestStatus.FormSubmitted;

            if (request.AgentId.HasValue)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = request.AgentId.Value,
                    Title = "Form Submitted",
                    Message = $"Customer has submitted property details for request ID {request.Id}.",
                    Type = "info"
                });
            }
 
            await _context.SaveChangesAsync();

            return Ok("Property details submitted successfully.");
        }

        // =====================================================
        // 6️⃣ AGENT CALCULATES RISK + PREMIUM + INSTALLMENTS
        // =====================================================
        [HttpPut("{id}/calculate-risk")]
        [Authorize(Roles = "Agent")]
        public async Task<IActionResult> CalculateRisk(int id)
        {
            var request = await _context.PolicyRequests
                .Include(r => r.Plan)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
                return NotFound("Request not found.");

            if (request.Status != PolicyRequestStatus.FormSubmitted)
                return BadRequest("Form not submitted yet.");

            // Risk Calculation
            decimal riskScore = 0;

            if (request.PropertyAge.HasValue && request.PropertyAge > 10)
                riskScore += 30;

            if (request.PropertyValue.HasValue && request.PropertyValue > 250000)
                riskScore += 40;

            request.RiskScore = riskScore;

            // Premium Calculation
            decimal basePremium = request.Plan.BasePremium;
            decimal riskMultiplier = 500;

            decimal finalPremium = basePremium + (riskScore * riskMultiplier);

            request.PremiumAmount = finalPremium;
            request.TotalPremium = finalPremium;

            // Installment Calculation
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

            // Agent Commission
            request.AgentCommissionAmount = request.Plan.AgentCommission;

            request.Status = PolicyRequestStatus.RiskCalculated;

            _context.Notifications.Add(new Notification
            {
                UserId = request.CustomerId,
                Title = "Premium Calculated",
                Message = $"Your premium has been calculated: {request.TotalPremium:C}. Please review and confirm purchase.",
                Type = "success"
            });
 
            await _context.SaveChangesAsync();
 
            return Ok(new
            {
                request.Id,
                request.PlanId,
                PlanName = request.Plan.PlanName,
                request.RiskScore,
                request.TotalPremium,
                request.Frequency,
                request.InstallmentCount,
                request.InstallmentAmount,
                request.AgentCommissionAmount,
                request.Status
            });
        }

        // =====================================================
        // 7️⃣ CUSTOMER CONFIRMS PURCHASE
        // =====================================================
        [HttpPut("{id}/buy")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> BuyPolicy(int id)
        {
            var request = await _context.PolicyRequests.FindAsync(id);

            if (request == null)
                return NotFound("Request not found.");

            if (request.Status != PolicyRequestStatus.RiskCalculated)
                return BadRequest("Risk not calculated yet.");

            request.Status = PolicyRequestStatus.CustomerConfirmed;

            var admins = await _context.Users.Where(u => u.Role == UserRole.Admin).ToListAsync();
            foreach (var admin in admins)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = admin.Id,
                    Title = "Action Required: Final Approval",
                    Message = $"Customer has confirmed purchase for request ID {request.Id}. Please provide final approval.",
                    Type = "info"
                });
            }
 
            await _context.SaveChangesAsync();

            return Ok("Customer confirmed. Waiting for admin approval.");
        }

        // =====================================================
        // 8️⃣ ADMIN FINAL APPROVAL
        // =====================================================
        [HttpPut("{id}/admin-approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminApprove(int id)
        {
            var request = await _context.PolicyRequests.FindAsync(id);

            if (request == null)
                return NotFound("Request not found.");

            if (request.Status != PolicyRequestStatus.CustomerConfirmed)
                return BadRequest("Customer has not confirmed yet.");

            request.Status = PolicyRequestStatus.PolicyApproved;

            _context.Notifications.Add(new Notification
            {
                UserId = request.CustomerId,
                Title = "Policy Approved",
                Message = "Your policy has been officially approved. Congratulations!",
                Type = "success"
            });
 
            await _context.SaveChangesAsync();
 
            return Ok("Policy officially approved.");
        }

        // =====================================================
        // 9️⃣ CUSTOMER - VIEW MY REQUESTS
        // =====================================================
        [HttpGet("customer/my-requests")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim.Value);

            var requests = await _context.PolicyRequests
                .Include(r => r.Plan)
                .Where(r => r.CustomerId == userId)
                .ToListAsync();

            return Ok(requests);
        }

        // =====================================================
        // 🔟 AGENT - VIEW APPROVED REQUESTS (COMMISSION EARNED)
        // =====================================================
        [HttpGet("agent/approved")]
        [Authorize(Roles = "Agent")]
        public async Task<IActionResult> GetApprovedForAgent()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim.Value);

            var requests = await _context.PolicyRequests
                .Include(r => r.Plan)
                .Where(r => r.AgentId == userId && r.Status == PolicyRequestStatus.PolicyApproved)
                .ToListAsync();

            return Ok(requests);
        }
    }
}