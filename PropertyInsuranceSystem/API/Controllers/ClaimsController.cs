using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Domain.Entities;
using Domain.Enums;
using Application.DTOs;
using System.Security.Claims;
using ClaimEntity = Domain.Entities.Claim;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClaimsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClaimsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================================
        // 1️⃣ Customer files a claim
        // ================================
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> FileClaim(CreateClaimDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            var userId = int.Parse(userIdClaim.Value);

            var policy = await _context.PolicyRequests
                .FirstOrDefaultAsync(p => p.Id == dto.PolicyRequestId);

            if (policy == null || policy.Status != PolicyRequestStatus.PolicyApproved)
                return BadRequest("Invalid or unapproved policy.");

            var claim = new ClaimEntity
            {
                PolicyRequestId = dto.PolicyRequestId,
                PropertyAddress = dto.PropertyAddress,
                PropertyValue = dto.PropertyValue,
                PropertyAge = dto.PropertyAge,
                ClaimAmount = policy.PremiumAmount,
                Status = ClaimStatus.Pending,
                Remarks = ""
            };

            _context.Claims.Add(claim);
            
            var claimsOfficers = await _context.Users.Where(u => u.Role == UserRole.ClaimsOfficer).ToListAsync();
            foreach (var co in claimsOfficers)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = co.Id,
                    Title = "New Claim Filed",
                    Message = $"A new claim has been filed for policy ID {dto.PolicyRequestId}.",
                    Type = "info"
                });
            }

            await _context.SaveChangesAsync();

            return Ok("Claim request sent successfully.");
        }

        // ================================
        // 2️⃣ Claims Officer views pending claims
        // ================================
        [HttpGet("pending")]
        [Authorize(Roles = "ClaimsOfficer")]
        public async Task<IActionResult> GetPendingClaims()
        {
            var claims = await _context.Claims
                .Include(c => c.PolicyRequest)
                    .ThenInclude(p => p.Plan)
                .Include(c => c.PolicyRequest)
                    .ThenInclude(p => p.Customer)
                .Where(c => c.Status == ClaimStatus.Pending)
                .ToListAsync();

            return Ok(claims);
        }

        [HttpGet("history")]
        [Authorize(Roles = "ClaimsOfficer")]
        public async Task<IActionResult> GetClaimsHistory()
        {
            var claims = await _context.Claims
                .Include(c => c.PolicyRequest)
                    .ThenInclude(p => p.Plan)
                .Include(c => c.PolicyRequest)
                    .ThenInclude(p => p.Customer)
                .Where(c => c.Status != ClaimStatus.Pending)
                .OrderByDescending(c => c.Id)
                .ToListAsync();

            return Ok(claims);
        }

        // ================================
        // 3️⃣ Claims Officer verifies claim
        // ================================
        [HttpPut("{id}/verify")]
        [Authorize(Roles = "ClaimsOfficer")]
        public async Task<IActionResult> VerifyClaim(int id, [FromBody] VerifyClaimDto dto)
        {
            var claim = await _context.Set<ClaimEntity>().FindAsync(id);
            if (claim == null)
                return NotFound();

            if (claim.Status != ClaimStatus.Pending)
                return BadRequest("Claim already processed.");

            if (dto.IsAccepted)
            {
                claim.Status = ClaimStatus.Approved;
                var policy = await _context.PolicyRequests
    .Include(p => p.Plan)
    .FirstOrDefaultAsync(p => p.Id == claim.PolicyRequestId);

                var invoice = new Invoice
                {
                    PolicyRequestId = policy.Id,
                    InvoiceNumber = "INV-" + Guid.NewGuid().ToString().Substring(0, 8),
                    GeneratedDate = DateTime.UtcNow,
                    TotalPremium = policy.TotalPremium,
                    InstallmentAmount = policy.InstallmentAmount,
                    InstallmentCount = policy.InstallmentCount,
                    ClaimAmount = claim.ClaimAmount,
                    PlanName = policy.Plan.PlanName,
                    CustomerId = policy.CustomerId
                };

                _context.Invoices.Add(invoice);

                _context.Notifications.Add(new Notification
                {
                    UserId = policy.CustomerId,
                    Title = "Claim Approved",
                    Message = $"Your claim for {policy.Plan.PlanName} has been approved. Invoice {invoice.InvoiceNumber} generated.",
                    Type = "success"
                });

                await _context.SaveChangesAsync();
                claim.Remarks = dto.Remarks ?? "Claim accepted";
                await _context.SaveChangesAsync();
                return Ok("Insurance has been claimed ✅");
            }
            else
            {
                claim.Status = ClaimStatus.Rejected;
                claim.Remarks = dto.Remarks ?? "Claim rejected";

                var claimRequest = await _context.Claims
                    .Include(c => c.PolicyRequest)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (claimRequest != null)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = claimRequest.PolicyRequest.CustomerId,
                        Title = "Claim Rejected",
                        Message = $"Your claim for request ID {claimRequest.PolicyRequestId} has been rejected. Remarks: {claim.Remarks}",
                        Type = "error"
                    });
                }

                await _context.SaveChangesAsync();
                return Ok("Claim rejected ❌");
            }
        }
    }
}