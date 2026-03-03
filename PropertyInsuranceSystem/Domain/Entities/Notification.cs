using Domain.Common;
using Domain.Enums;
using System;

namespace Domain.Entities
{
    public class Notification : BaseEntity
    {
        public int UserId { get; set; }
        public ApplicationUser User { get; set; }

        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; } // success, error, info
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
