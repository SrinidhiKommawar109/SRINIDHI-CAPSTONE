using Domain.Enums;

namespace Application.DTOs;

public class PolicyRequestResponseDto
{
    public int Id { get; set; }
    public int PlanId { get; set; }
    public string PlanName { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; }
    public int? AgentId { get; set; }
    public string? AgentName { get; set; }
    public PolicyRequestStatus Status { get; set; }
    public string? PropertyAddress { get; set; }
    public decimal? PropertyValue { get; set; }
    public int? PropertyAge { get; set; }
    public decimal? RiskScore { get; set; }
    public decimal PremiumAmount { get; set; }
    
    // Visibility controlled in mapping
    public decimal? AgentCommissionAmount { get; set; }

    public int? ClaimsOfficerId { get; set; }
    public string? ClaimsOfficerName { get; set; }
    public int? ClaimId { get; set; }
    public string? ClaimStatus { get; set; }
}
