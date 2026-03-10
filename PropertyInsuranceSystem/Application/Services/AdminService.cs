using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;

    public AdminService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public string GetAdminDashboardMessage() => "Welcome Admin";

    public Task<List<object>> GetAgentsAsync() => _adminRepository.GetActiveAgentsAsync();

    public Task<List<object>> GetStaffAsync() => _adminRepository.GetActiveStaffAsync();

    public string GetAgentAreaMessage() => "Welcome Agent";

    public Task<List<PropertyPlans>> GetCustomerAreaPlansAsync() => _adminRepository.GetAllPlansAsync();

    public Task<AdminStatsDto> GetStatsAsync() => _adminRepository.GetStatsAsync();
}
