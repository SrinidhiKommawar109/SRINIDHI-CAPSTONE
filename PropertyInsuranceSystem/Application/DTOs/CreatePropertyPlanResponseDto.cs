using Domain.Enums;

namespace Application.DTOs;

public class CreatePropertyPlanResponseDto
{
    public int Id { get; set; }
    public string PlanName { get; set; } = null!;
    public decimal BaseCoverageAmount { get; set; }
    public decimal CoverageRate { get; set; }
    public decimal BasePremium { get; set; }
    public decimal AgentCommission { get; set; }
    public PremiumFrequency Frequency { get; set; }
    public int SubCategoryId { get; set; }
}
