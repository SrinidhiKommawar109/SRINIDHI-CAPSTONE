using Domain.Enums;
using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class TransferRequestResponseDto
    {
        public int Id { get; set; }
        public int PolicyId { get; set; }
        public string PolicyPlanName { get; set; }
        public int CurrentOwnerId { get; set; }
        public string CurrentOwnerName { get; set; }
        public string NewOwnerName { get; set; }
        public string NewOwnerEmail { get; set; }
        public string NewOwnerPhone { get; set; }
        public TransferReason TransferReason { get; set; }
        public TransferStatus Status { get; set; }
        public DateTime RequestedAt { get; set; }
        public string? OfficerNotes { get; set; }
        public List<TransferDocumentDto> Documents { get; set; } = new List<TransferDocumentDto>();
    }

    public class TransferDocumentDto
    {
        public int Id { get; set; }
        public string DocumentType { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedAt { get; set; }
        public string? ExtractedText { get; set; }
        public string? ExtractedDataJson { get; set; }
        public string? AiSummary { get; set; }
    }
}
