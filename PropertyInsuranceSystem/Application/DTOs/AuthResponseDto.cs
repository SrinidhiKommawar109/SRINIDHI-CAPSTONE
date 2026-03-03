using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; }

        public string RefreshToken { get; set; }

        public string Role { get; set; }
        public string ReferralCode { get; set; }
        public decimal ReferralBalance { get; set; }
        public int ReferralsCount { get; set; }
        public DateTime Expiration { get; set; }
    }
}
