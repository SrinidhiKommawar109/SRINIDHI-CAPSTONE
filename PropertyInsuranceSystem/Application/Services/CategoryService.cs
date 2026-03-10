using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IRepository<PropertySubCategory> _subCategoryRepository;
    private readonly IRepository<PropertyPlans> _plansRepository;

    public CategoryService(
        ICategoryRepository categoryRepository,
        IRepository<PropertySubCategory> subCategoryRepository,
        IRepository<PropertyPlans> plansRepository)
    {
        _categoryRepository = categoryRepository;
        _subCategoryRepository = subCategoryRepository;
        _plansRepository = plansRepository;
    }

    public async Task<List<CategoryResponseDto>> GetAllCategoriesAsync()
    {
        var categories = await _categoryRepository.GetAllWithSubCategoriesAndPlansAsync();

        return categories.Select(c => new CategoryResponseDto
        {
            Id = c.Id,
            Name = c.Name,
            SubCategories = (c.SubCategories ?? []).Select(s => new SubCategoryResponseDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                Plans = (s.Plans ?? []).Select(p => new PlanResponseDto
                {
                    Id = p.Id,
                    PlanName = p.PlanName,
                    BaseCoverageAmount = p.BaseCoverageAmount,
                    CoverageRate = p.CoverageRate,
                    BasePremium = p.BasePremium,
                    AgentCommission = p.AgentCommission,
                    Frequency = (int)p.Frequency
                }).ToList()
            }).ToList()
        }).ToList();
    }
    public async Task AddSubCategoryAsync(CreateSubCategoryDto dto)
    {
        var subCategory = new PropertySubCategory
        {
            Code = dto.Code,
            Name = dto.Name,
            CategoryId = dto.CategoryId,
           };

        await _subCategoryRepository.AddAsync(subCategory);
        await _subCategoryRepository.SaveChangesAsync();
    }

    public async Task AddPlanAsync(CreatePlanDto dto)
    {
        var plan = new PropertyPlans
        {
            PlanName = dto.PlanName,
            BaseCoverageAmount = dto.BaseCoverageAmount,
            CoverageRate = dto.CoverageRate,
            BasePremium = dto.BasePremium,
            AgentCommission = dto.AgentCommission,
            Frequency = (Domain.Enums.PremiumFrequency)dto.Frequency,
            SubCategoryId = dto.SubCategoryId,
        };

        await _plansRepository.AddAsync(plan);
        await _plansRepository.SaveChangesAsync();
    }

}