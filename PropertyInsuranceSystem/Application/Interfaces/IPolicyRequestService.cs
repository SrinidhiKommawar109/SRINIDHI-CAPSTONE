using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IPolicyRequestService
{
    Task CreateRequestAsync(CreatePolicyRequestDto dto, int customerId);
    Task<List<PolicyRequest>> GetPendingRequestsAsync();
    Task AssignAgentAsync(int requestId, int agentId, string? adminNotes);
    Task<List<PolicyRequest>> GetAssignedRequestsAsync(int agentId);
    Task SendFormToCustomerAsync(int requestId, string formType);
    Task SubmitPropertyDetailsAsync(int requestId, SubmitPropertyDto dto);
    Task<CalculateRiskResultDto> CalculateRiskAsync(int requestId);
    Task BuyPolicyAsync(int requestId);
    Task AdminApproveAsync(int requestId);
    Task<List<PolicyRequest>> GetMyRequestsAsync(int customerId);
    Task<List<PolicyRequest>> GetApprovedForAgentAsync(int agentId);
    Task<List<PolicyRequestResponseDto>> GetAllRequestsAsync();
}
