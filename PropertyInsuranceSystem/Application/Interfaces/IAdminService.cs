using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IAdminService
{
    string GetAdminDashboardMessage();
    Task<List<object>> GetAgentsAsync();
    Task<List<object>> GetStaffAsync();
    string GetAgentAreaMessage();
    Task<List<PropertyPlans>> GetCustomerAreaPlansAsync();
    Task<AdminStatsDto> GetStatsAsync();
}
