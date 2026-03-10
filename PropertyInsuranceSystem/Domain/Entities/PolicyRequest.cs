using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Enums;
namespace Domain.Entities
{
    public class PolicyRequest : BaseEntity
    {
        public int PlanId { get; set; }
        public PropertyPlans Plan { get; set; }

        public int CustomerId { get; set; }
        public ApplicationUser Customer { get; set; }

        public int? AgentId { get; set; }
        public ApplicationUser Agent { get; set; }

        public PolicyRequestStatus Status { get; set; }
        public string? PropertyAddress { get; set; }
        public decimal? PropertyValue { get; set; }
        public int? PropertyAge { get; set; }
        public decimal? RiskScore { get; set; }
        public string? FormType { get; set; }
        public string? PropertyDetailsJson { get; set; }

        public decimal PremiumAmount { get; set; }
        public decimal TotalPremium { get; set; }

        public decimal InstallmentAmount { get; set; }

        public PremiumFrequency Frequency { get; set; }

        public int InstallmentCount { get; set; }
        public decimal AgentCommissionAmount { get; set; }
        public string? AdminNotes { get; set; }

        public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();
    }
}
