using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly ApplicationDbContext _context;

    public AdminRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<object>> GetActiveAgentsAsync()
    {
        var agents = await _context.Users
            .Where(u => u.Role == UserRole.Agent && u.IsActive)
            .Select(u => new { u.Id, u.FullName, u.Email })
            .ToListAsync();
        return agents.Select(a => (object)a).ToList();
    }

    public async Task<List<object>> GetActiveStaffAsync()
    {
        return await _context.Users
            .Where(u => u.Role != UserRole.Admin)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Role
            })
            .OrderBy(u => u.Id)
            .ToListAsync<object>();
    }

    public async Task<List<PropertyPlans>> GetAllPlansAsync()
    {
        return await _context.PropertyPlans.ToListAsync();
    }

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var totalCustomers = await _context.Users.CountAsync(u => u.Role == UserRole.Customer);
        var totalAgents = await _context.Users.CountAsync(u => u.Role == UserRole.Agent);
        var totalClaimsOfficers = await _context.Users.CountAsync(u => u.Role == UserRole.ClaimsOfficer);
        var totalPolicies = await _context.PolicyRequests.CountAsync(r => r.Status == PolicyRequestStatus.PolicyApproved);
        var totalClaims = await _context.Claims.CountAsync();

        var totalRevenue = await _context.Invoices.SumAsync(i => i.TotalPremium);

        var now = DateTime.UtcNow;
        var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
        var startOfLastMonth = startOfThisMonth.AddMonths(-1);

        var thisMonthRevenue = await _context.Invoices
            .Where(i => i.GeneratedDate >= startOfThisMonth)
            .SumAsync(i => i.TotalPremium);

        var lastMonthRevenue = await _context.Invoices
            .Where(i => i.GeneratedDate >= startOfLastMonth && i.GeneratedDate < startOfThisMonth)
            .SumAsync(i => i.TotalPremium);

        decimal revenueGrowth = 0;
        if (lastMonthRevenue > 0)
            revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        else if (thisMonthRevenue > 0)
            revenueGrowth = 100;

        var topPlans = await _context.PolicyRequests
            .Where(r => r.Status == PolicyRequestStatus.PolicyApproved)
            .GroupBy(r => r.Plan.PlanName)
            .Select(g => new { PlanName = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync();

        var topAgents = await _context.PolicyRequests
            .Where(r => r.Status == PolicyRequestStatus.PolicyApproved && r.AgentId != null)
            .GroupBy(r => new { r.AgentId, r.Agent!.FullName })
            .Select(g => new
            {
                Name = g.Key.FullName ?? "Agent #" + g.Key.AgentId,
                PoliciesSold = g.Count()
            })
            .OrderByDescending(x => x.PoliciesSold)
            .Take(5)
            .ToListAsync();

        return new AdminStatsDto
        {
            TotalCustomers = totalCustomers,
            TotalAgents = totalAgents,
            TotalClaimsOfficers = totalClaimsOfficers,
            TotalPolicies = totalPolicies,
            TotalClaims = totalClaims,
            TotalRevenue = totalRevenue,
            RevenueGrowth = Math.Round(revenueGrowth, 1),
            TopPlans = topPlans,
            TopAgents = topAgents
        };
    }
}
