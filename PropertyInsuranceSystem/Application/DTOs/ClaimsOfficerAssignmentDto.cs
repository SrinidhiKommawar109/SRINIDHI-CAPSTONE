using Domain.Entities;

namespace Application.DTOs;

public class ClaimsOfficerAssignmentDto
{
    public ApplicationUser Officer { get; set; } = null!;
    public int ApprovedClaimsCount { get; set; }
}
