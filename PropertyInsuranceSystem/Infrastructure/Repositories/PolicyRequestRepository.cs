using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PolicyRequestRepository : IPolicyRequestRepository
{
    private readonly ApplicationDbContext _context;

    public PolicyRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PropertyPlans?> GetPlanByIdAsync(int planId)
    {
        return await _context.PropertyPlans.FirstOrDefaultAsync(p => p.Id == planId);
    }

    public async Task<PolicyRequest?> GetByIdAsync(int id)
    {
        return await _context.PolicyRequests.FindAsync(id);
    }

    public async Task<PolicyRequest?> GetByIdWithPlanAsync(int id)
    {
        return await _context.PolicyRequests
            .Include(r => r.Plan)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<List<PolicyRequest>> GetPendingRequestsAsync()
    {
        return await _context.PolicyRequests
            .Include(r => r.Plan)
            .Include(r => r.Customer)
            .Where(r => r.Status == PolicyRequestStatus.PendingAdmin || r.Status == PolicyRequestStatus.CustomerConfirmed)
            .ToListAsync();
    }

    public async Task<List<PolicyRequest>> GetAssignedForAgentAsync(int agentId)
    {
        return await _context.PolicyRequests
            .Include(r => r.Plan)
            .Include(r => r.Customer)
            .Where(r => r.AgentId == agentId &&
                (r.Status == PolicyRequestStatus.AgentAssigned ||
                 r.Status == PolicyRequestStatus.FormSent ||
                 r.Status == PolicyRequestStatus.FormSubmitted ||
                 r.Status == PolicyRequestStatus.RiskCalculated))
            .OrderByDescending(r => r.Id)
            .ToListAsync();
    }

    public async Task<List<PolicyRequest>> GetMyRequestsAsync(int customerId)
    {
        return await _context.PolicyRequests
            .Include(r => r.Plan)
            .Where(r => r.CustomerId == customerId)
            .ToListAsync();
    }

    public async Task<List<PolicyRequest>> GetApprovedForAgentAsync(int agentId)
    {
        return await _context.PolicyRequests
            .Include(r => r.Plan)
            .Where(r => r.AgentId == agentId && r.Status == PolicyRequestStatus.PolicyApproved)
            .ToListAsync();
    }

    public async Task<List<ApplicationUser>> GetAdminsAsync()
    {
        return await _context.Users.Where(u => u.Role == UserRole.Admin).ToListAsync();
    }

    public async Task<List<PolicyRequest>> GetAllRequestsWithClaimsAsync()
    {
        return await _context.PolicyRequests
            .Include(r => r.Plan)
            .Include(r => r.Customer)
            .Include(r => r.Claims)
                .ThenInclude(c => c.AssignedOfficer)
            .OrderByDescending(r => r.Id)
            .ToListAsync();
    }
}
