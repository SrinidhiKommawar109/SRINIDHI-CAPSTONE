using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Enums;
namespace Domain.Entities
{
    public class Claim
    {
        public int Id { get; set; }
        public int PolicyRequestId { get; set; } // linked to policy
        public PolicyRequest PolicyRequest { get; set; }

        public string PropertyAddress { get; set; }
        public decimal PropertyValue { get; set; }
        public int PropertyAge { get; set; }

        public decimal ClaimAmount { get; set; }
        public ClaimStatus Status { get; set; } = ClaimStatus.Pending;

        public string? Remarks { get; set; } // for officer comments
        public int? AssignedOfficerId { get; set; }
        public ApplicationUser? AssignedOfficer { get; set; }
        public string? PhotoUrls { get; set; } // comma separated paths
    }
}
