using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PropertyPlansController : ControllerBase
{
    private readonly IPropertyPlanService _propertyPlanService;

    public PropertyPlansController(IPropertyPlanService propertyPlanService)
    {
        _propertyPlanService = propertyPlanService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreatePlan([FromBody] CreatePropertyPlanDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _propertyPlanService.CreatePlanAsync(dto);
            return Ok(new
            {
                result.Id,
                result.PlanName,
                result.BaseCoverageAmount,
                result.CoverageRate,
                result.BasePremium,
                result.AgentCommission,
                result.Frequency,
                result.SubCategoryId
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPlans([FromQuery] int? subCategoryId)
    {
        var plans = await _propertyPlanService.GetAllPlansAsync(subCategoryId);
        return Ok(plans);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlanById(int id)
    {
        var plan = await _propertyPlanService.GetPlanByIdAsync(id);
        if (plan == null)
            return NotFound();

        return Ok(plan);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePlan(int id)
    {
        try
        {
            await _propertyPlanService.DeletePlanAsync(id);
            return Ok(new { message = "Plan deleted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
