using System;

namespace Domain.Entities
{
    public class PolicyTransferDocument
    {
        public int Id { get; set; }
        public int TransferRequestId { get; set; }
        public virtual PolicyOwnershipTransfer TransferRequest { get; set; }

        public string DocumentType { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
