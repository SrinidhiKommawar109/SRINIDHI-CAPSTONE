using Domain.Entities;

namespace Application.Interfaces;

public interface IPropertyPlanRepository
{
    Task<List<PropertyPlans>> GetAllPlansAsync(int? subCategoryId = null);
}
