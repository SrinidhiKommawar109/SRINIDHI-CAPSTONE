using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryResponseDto>> GetAllCategoriesAsync()
    {
        var categories = await _context.PropertyCategories
            .Include(c => c.SubCategories)
                .ThenInclude(s => s.Plans)
            .ToListAsync();

        return categories.Select(c => new CategoryResponseDto
        {
            Id = c.Id,
            Name = c.Name,
            SubCategories = c.SubCategories.Select(s => new SubCategoryResponseDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                Plans = s.Plans.Select(p => new PlanResponseDto
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

        _context.PropertySubCategories.Add(subCategory);
        await _context.SaveChangesAsync();
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

        _context.PropertyPlans.Add(plan);
        await _context.SaveChangesAsync();
    }

}