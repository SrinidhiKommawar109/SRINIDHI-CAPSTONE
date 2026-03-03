using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreatePropertyPlanDto
{
    [Required]
    public string PlanName { get; set; }

    [Required]
    public decimal BaseCoverageAmount { get; set; }

    [Required]
    public decimal CoverageRate { get; set; }

    [Required]
    public decimal BasePremium { get; set; }

    [Required]
    public decimal AgentCommission { get; set; }

    [Required]
    public int Frequency { get; set; }

    [Required]
    public int SubCategoryId { get; set; }
}