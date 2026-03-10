using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("dashboard")]
    public IActionResult AdminDashboard()
    {
        return Ok(_adminService.GetAdminDashboardMessage());
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("agents")]
    public async Task<IActionResult> GetAgents()
    {
        var agents = await _adminService.GetAgentsAsync();
        return Ok(agents);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff()
    {
        var users = await _adminService.GetStaffAsync();
        return Ok(users);
    }

    [Authorize(Roles = "Agent")]
    [HttpGet("agent-area")]
    public IActionResult AgentArea()
    {
        return Ok(_adminService.GetAgentAreaMessage());
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("customer-area")]
    public async Task<IActionResult> CustomerArea()
    {
        var plans = await _adminService.GetCustomerAreaPlansAsync();
        return Ok(plans);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _adminService.GetStatsAsync();
        return Ok(new
        {
            stats.TotalCustomers,
            stats.TotalAgents,
            stats.TotalClaimsOfficers,
            stats.TotalPolicies,
            stats.TotalClaims,
            stats.TotalRevenue,
            stats.RevenueGrowth,
            stats.TopPlans,
            stats.TopAgents
        });
    }
}