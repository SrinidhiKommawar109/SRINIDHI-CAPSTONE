using Domain.Enums;

namespace Application.DTOs;

public class CalculateRiskResultDto
{
    public int Id { get; set; }
    public int PlanId { get; set; }
    public string PlanName { get; set; } = null!;
    public decimal? RiskScore { get; set; }
    public decimal TotalPremium { get; set; }
    public PremiumFrequency Frequency { get; set; }
    public int InstallmentCount { get; set; }
    public decimal InstallmentAmount { get; set; }
    public decimal AgentCommissionAmount { get; set; }
    public PolicyRequestStatus Status { get; set; }
}
