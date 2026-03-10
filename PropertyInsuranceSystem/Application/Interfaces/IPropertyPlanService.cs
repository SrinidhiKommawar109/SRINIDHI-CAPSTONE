using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IPropertyPlanService
{
    Task<CreatePropertyPlanResponseDto> CreatePlanAsync(CreatePropertyPlanDto dto);
    Task<List<PropertyPlans>> GetAllPlansAsync(int? subCategoryId = null);
    Task<PropertyPlans?> GetPlanByIdAsync(int id);
    Task DeletePlanAsync(int id);
}
