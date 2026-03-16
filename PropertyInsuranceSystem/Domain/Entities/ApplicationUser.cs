using Domain.Common;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ApplicationUser : BaseEntity
    {
        public string FullName { get; set; }

        public string Email { get; set; }

        public string PasswordHash { get; set; }

        public UserRole Role { get; set; }
        public string ReferralCode { get; set; } = string.Empty;
        public decimal ReferralBalance { get; set; } = 0;
        public int ReferralsCount { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }
}
