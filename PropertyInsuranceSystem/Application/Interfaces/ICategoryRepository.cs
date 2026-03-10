using Domain.Entities;

namespace Application.Interfaces;

public interface ICategoryRepository
{
    Task<List<PropertyCategory>> GetAllWithSubCategoriesAndPlansAsync();
}
