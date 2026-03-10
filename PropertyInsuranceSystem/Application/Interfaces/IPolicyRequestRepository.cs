using Domain.Entities;

namespace Application.Interfaces;

public interface IPolicyRequestRepository
{
    Task<PropertyPlans?> GetPlanByIdAsync(int planId);
    Task<PolicyRequest?> GetByIdAsync(int id);
    Task<PolicyRequest?> GetByIdWithPlanAsync(int id);
    Task<List<PolicyRequest>> GetPendingRequestsAsync();
    Task<List<PolicyRequest>> GetAssignedForAgentAsync(int agentId);
    Task<List<PolicyRequest>> GetMyRequestsAsync(int customerId);
    Task<List<PolicyRequest>> GetApprovedForAgentAsync(int agentId);
    Task<List<ApplicationUser>> GetAdminsAsync();
    Task<List<PolicyRequest>> GetAllRequestsWithClaimsAsync();
}
