using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ApplicationDbContext _context;

    public CategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PropertyCategory>> GetAllWithSubCategoriesAndPlansAsync()
    {
        return await _context.PropertyCategories
            .Include(c => c.SubCategories)
                .ThenInclude(s => s.Plans)
            .ToListAsync();
    }
}
