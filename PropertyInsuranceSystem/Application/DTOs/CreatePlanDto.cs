using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreatePlanDto
    {
        public string PlanName { get; set; }
        public decimal BaseCoverageAmount { get; set; }
        public decimal CoverageRate { get; set; }
        public decimal BasePremium { get; set; }
        public decimal AgentCommission { get; set; }
        public int Frequency { get; set; }
        public int SubCategoryId { get; set; }
    }
}
