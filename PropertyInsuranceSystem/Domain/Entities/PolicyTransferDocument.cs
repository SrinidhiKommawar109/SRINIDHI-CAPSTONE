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

        // AI Analysis Results
        public string? ExtractedText { get; set; }
        public string? ExtractedDataJson { get; set; }
        public string? AiSummary { get; set; }
    }
}
