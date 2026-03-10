namespace Application.DTOs;

public class AdminStatsDto
{
    public int TotalCustomers { get; set; }
    public int TotalAgents { get; set; }
    public int TotalClaimsOfficers { get; set; }
    public int TotalPolicies { get; set; }
    public int TotalClaims { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal RevenueGrowth { get; set; }
    public object TopPlans { get; set; } = null!;
    public object TopAgents { get; set; } = null!;
}
