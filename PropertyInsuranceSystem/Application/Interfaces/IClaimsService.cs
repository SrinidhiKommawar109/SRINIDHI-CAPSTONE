using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IClaimsService
{
    Task FileClaimAsync(CreateClaimDto dto, int userId);
    Task<List<Claim>> GetPendingClaimsAsync(int? officerId = null);
    Task<List<Claim>> GetClaimsHistoryAsync(int? officerId = null);
    Task<string> VerifyClaimAsync(int id, VerifyClaimDto dto);
}
