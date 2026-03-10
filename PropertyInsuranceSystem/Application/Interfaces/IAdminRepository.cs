using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IAdminRepository
{
    Task<List<object>> GetActiveAgentsAsync();
    Task<List<object>> GetActiveStaffAsync();
    Task<List<PropertyPlans>> GetAllPlansAsync();
    Task<AdminStatsDto> GetStatsAsync();
}
