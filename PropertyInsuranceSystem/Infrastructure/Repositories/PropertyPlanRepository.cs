using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PropertyPlanRepository : IPropertyPlanRepository
{
    private readonly ApplicationDbContext _context;

    public PropertyPlanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PropertyPlans>> GetAllPlansAsync(int? subCategoryId = null)
    {
        var query = _context.PropertyPlans.AsQueryable();
        if (subCategoryId.HasValue)
            query = query.Where(p => p.SubCategoryId == subCategoryId.Value);
        return await query.ToListAsync();
    }
}
