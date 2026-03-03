using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.Persistence;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("dashboard")]
    public IActionResult AdminDashboard()
    {
        return Ok("Welcome Admin");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("agents")]
    public async Task<IActionResult> GetAgents()
    {
        var agents = await _context.Users
            .Where(u => u.Role == UserRole.Agent && u.IsActive)
            .Select(u => new { u.Id, u.FullName, u.Email })
            .ToListAsync();
        return Ok(agents);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff()
    {
        var users = await _context.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.Role)
            .Select(u => new { u.Id, u.FullName, u.Email, u.Role })
            .ToListAsync();
        return Ok(users);
    }

    [Authorize(Roles = "Agent")]
    [HttpGet("agent-area")]
    public IActionResult AgentArea()
    {
        return Ok("Welcome Agent");
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("customer-area")]
    public async Task<IActionResult> CustomerArea()
    {
        var plans = await _context.PropertyPlans.ToListAsync();
        return Ok(plans);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalCustomers = await _context.Users.CountAsync(u => u.Role == UserRole.Customer);
        var totalAgents = await _context.Users.CountAsync(u => u.Role == UserRole.Agent);
        var totalClaimsOfficers = await _context.Users.CountAsync(u => u.Role == UserRole.ClaimsOfficer);
        var totalPolicies = await _context.PolicyRequests.CountAsync(r => r.Status == PolicyRequestStatus.PolicyApproved);
        var totalClaims = await _context.Claims.CountAsync();

        var totalRevenue = await _context.Invoices.SumAsync(i => i.TotalPremium);

        // Calculate Revenue Growth (this month vs last month)
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
        {
            revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        }
        else if (thisMonthRevenue > 0)
        {
            revenueGrowth = 100;
        }

        var topPlans = await _context.PolicyRequests
            .Where(r => r.Status == PolicyRequestStatus.PolicyApproved)
            .GroupBy(r => r.Plan.PlanName)
            .Select(g => new { PlanName = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync();

        var topAgents = await _context.PolicyRequests
            .Where(r => r.Status == PolicyRequestStatus.PolicyApproved && r.AgentId != null)
            .GroupBy(r => new { r.AgentId, r.Agent.FullName })
            .Select(g => new 
            { 
               Name = g.Key.FullName ?? "Agent #" + g.Key.AgentId, 
               PoliciesSold = g.Count() 
            })
            .OrderByDescending(x => x.PoliciesSold)
            .Take(5)
            .ToListAsync();

        return Ok(new
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
        });
    }
}