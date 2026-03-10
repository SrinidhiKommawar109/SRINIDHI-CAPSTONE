using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services;

public class PropertyPlanService : IPropertyPlanService
{
    private readonly IRepository<PropertyPlans> _planRepository;
    private readonly IRepository<PropertySubCategory> _subCategoryRepository;
    private readonly IPropertyPlanRepository _propertyPlanReadRepository;

    public PropertyPlanService(
        IRepository<PropertyPlans> planRepository,
        IRepository<PropertySubCategory> subCategoryRepository,
        IPropertyPlanRepository propertyPlanReadRepository)
    {
        _planRepository = planRepository;
        _subCategoryRepository = subCategoryRepository;
        _propertyPlanReadRepository = propertyPlanReadRepository;
    }

    public async Task<CreatePropertyPlanResponseDto> CreatePlanAsync(CreatePropertyPlanDto dto)
    {
        var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(s => s.Id == dto.SubCategoryId);
        if (subCategory == null)
            throw new InvalidOperationException("SubCategory not found");

        var plan = new PropertyPlans
        {
            PlanName = dto.PlanName,
            BaseCoverageAmount = dto.BaseCoverageAmount,
            CoverageRate = dto.CoverageRate,
            BasePremium = dto.BasePremium,
            AgentCommission = dto.AgentCommission,
            Frequency = (PremiumFrequency)dto.Frequency,
            SubCategoryId = dto.SubCategoryId,
        };

        await _planRepository.AddAsync(plan);
        await _planRepository.SaveChangesAsync();

        return new CreatePropertyPlanResponseDto
        {
            Id = plan.Id,
            PlanName = plan.PlanName,
            BaseCoverageAmount = plan.BaseCoverageAmount,
            CoverageRate = plan.CoverageRate,
            BasePremium = plan.BasePremium,
            AgentCommission = plan.AgentCommission,
            Frequency = plan.Frequency,
            SubCategoryId = plan.SubCategoryId
        };
    }

    public Task<List<PropertyPlans>> GetAllPlansAsync(int? subCategoryId = null) =>
        _propertyPlanReadRepository.GetAllPlansAsync(subCategoryId);

    public Task<PropertyPlans?> GetPlanByIdAsync(int id) => _planRepository.GetByIdAsync(id);

    public async Task DeletePlanAsync(int id)
    {
        var plan = await _planRepository.GetByIdAsync(id);
        if (plan == null)
            throw new InvalidOperationException("Plan not found");

        _planRepository.Remove(plan);
        await _planRepository.SaveChangesAsync();
    }
}
