using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ClaimRepository : IClaimRepository
{
    private readonly ApplicationDbContext _context;

    public ClaimRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ApplicationUser>> GetClaimsOfficersAsync()
    {
        return await _context.Users
            .Where(u => u.Role == UserRole.ClaimsOfficer)
            .ToListAsync();
    }

    public async Task<PolicyRequest?> GetPolicyRequestByIdAsync(int id)
    {
        return await _context.PolicyRequests
            .Include(p => p.Plan)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Claim?> GetByIdAsync(int id)
    {
        return await _context.Claims.FindAsync(id);
    }

    public async Task<Claim?> GetByIdWithPolicyRequestAsync(int id)
    {
        return await _context.Claims
            .Include(c => c.PolicyRequest)
            .Include(c => c.AssignedOfficer)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Claim>> GetPendingClaimsAsync(int? officerId = null)
    {
        var query = _context.Claims
            .Include(c => c.PolicyRequest!)
                .ThenInclude(p => p!.Plan)
            .Include(c => c.PolicyRequest!)
                .ThenInclude(p => p!.Customer)
            .Include(c => c.AssignedOfficer)
            .Where(c => c.Status == ClaimStatus.Pending);

        if (officerId.HasValue)
            query = query.Where(c => c.AssignedOfficerId == officerId);

        return await query.ToListAsync();
    }

    public async Task<List<Claim>> GetClaimsHistoryAsync(int? officerId = null)
    {
        var query = _context.Claims
            .Include(c => c.PolicyRequest!)
                .ThenInclude(p => p!.Plan)
            .Include(c => c.PolicyRequest!)
                .ThenInclude(p => p!.Customer)
            .Include(c => c.AssignedOfficer)
            .Where(c => c.Status != ClaimStatus.Pending);

        if (officerId.HasValue)
            query = query.Where(c => c.AssignedOfficerId == officerId);

        return await query.OrderByDescending(c => c.Id).ToListAsync();
    }

    public async Task<List<ClaimsOfficerAssignmentDto>> GetOfficersWithApprovedClaimsCountAsync()
    {
        var officers = await _context.Users
            .Where(u => u.Role == UserRole.ClaimsOfficer && u.IsActive)
            .ToListAsync();

        var approvedClaims = await _context.Claims
            .Where(c => c.Status == ClaimStatus.Approved && c.AssignedOfficerId != null)
            .ToListAsync();

        return officers.Select(o => new ClaimsOfficerAssignmentDto
        {
            Officer = o,
            ApprovedClaimsCount = approvedClaims.Count(c => c.AssignedOfficerId == o.Id)
        }).ToList();
    }
}
