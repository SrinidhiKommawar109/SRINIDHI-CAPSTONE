using Domain.Common;
using Domain.Enums;
using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class PolicyOwnershipTransfer : BaseEntity
    {
        public int PolicyId { get; set; }
        public virtual PolicyRequest Policy { get; set; }

        public int CurrentOwnerId { get; set; }
        public virtual ApplicationUser CurrentOwner { get; set; }

        public string NewOwnerName { get; set; }
        public string NewOwnerEmail { get; set; }
        public string NewOwnerPhone { get; set; }

        public TransferReason TransferReason { get; set; }
        public TransferStatus Status { get; set; } = TransferStatus.Pending;

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public string? OfficerNotes { get; set; }

        public virtual ICollection<PolicyTransferDocument> Documents { get; set; } = new List<PolicyTransferDocument>();
    }
}
