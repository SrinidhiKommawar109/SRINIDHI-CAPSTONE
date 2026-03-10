using Application.DTOs;
using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces;

public interface IClaimRepository
{
    Task<List<ApplicationUser>> GetClaimsOfficersAsync();
    Task<PolicyRequest?> GetPolicyRequestByIdAsync(int id);
    Task<Claim?> GetByIdAsync(int id);
    Task<Claim?> GetByIdWithPolicyRequestAsync(int id);
    Task<List<Claim>> GetPendingClaimsAsync(int? officerId = null);
    Task<List<Claim>> GetClaimsHistoryAsync(int? officerId = null);
    Task<List<ClaimsOfficerAssignmentDto>> GetOfficersWithApprovedClaimsCountAsync();
}
