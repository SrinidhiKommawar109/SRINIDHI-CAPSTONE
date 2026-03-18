using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class PolicyTransferService : IPolicyTransferService
    {
        private readonly IRepository<PolicyOwnershipTransfer> _transferWriteRepository;
        private readonly IPolicyTransferRepository _transferReadRepository;
        private readonly IRepository<PolicyRequest> _policyRepository;
        private readonly IRepository<ApplicationUser> _userRepository;
        private readonly IRepository<Notification> _notificationRepository;

        public PolicyTransferService(
            IRepository<PolicyOwnershipTransfer> transferWriteRepository,
            IPolicyTransferRepository transferReadRepository,
            IRepository<PolicyRequest> policyRepository,
            IRepository<ApplicationUser> userRepository,
            IRepository<Notification> notificationRepository)
        {
            _transferWriteRepository = transferWriteRepository;
            _transferReadRepository = transferReadRepository;
            _policyRepository = policyRepository;
            _userRepository = userRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<int> CreateTransferRequestAsync(CreateTransferRequestDto dto, int currentOwnerId)
        {
            var policy = await _policyRepository.GetByIdAsync(dto.PolicyId);
            if (policy == null) throw new InvalidOperationException("Policy not found.");
            if (policy.CustomerId != currentOwnerId) throw new InvalidOperationException("You are not the owner of this policy.");
            if (policy.Status != PolicyRequestStatus.PolicyApproved) throw new InvalidOperationException("Only approved policies can be transferred.");

            var transferRequest = new PolicyOwnershipTransfer
            {
                PolicyId = dto.PolicyId,
                CurrentOwnerId = currentOwnerId,
                NewOwnerName = dto.NewOwnerName,
                NewOwnerEmail = dto.NewOwnerEmail,
                NewOwnerPhone = dto.NewOwnerPhone,
                TransferReason = dto.TransferReason,
                Status = TransferStatus.Pending,
                RequestedAt = DateTime.UtcNow
            };

            await _transferWriteRepository.AddAsync(transferRequest);
            await _transferWriteRepository.SaveChangesAsync();

            return transferRequest.Id;
        }

        public async Task<int> UploadTransferDocumentAsync(int transferRequestId, string documentType, string filePath)
        {
            var request = await _transferReadRepository.GetByIdAsync(transferRequestId);
            if (request == null) throw new InvalidOperationException("Transfer request not found.");

            var document = new PolicyTransferDocument
            {
                TransferRequestId = transferRequestId,
                DocumentType = documentType,
                FilePath = filePath,
                UploadedAt = DateTime.UtcNow
            };

            await _transferReadRepository.AddDocumentAsync(document);
            return document.Id;
        }

        public async Task<IEnumerable<TransferRequestResponseDto>> GetCustomerTransferRequestsAsync(int customerId)
        {
            var requests = await _transferReadRepository.GetByCustomerIdAsync(customerId);
            return requests.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<TransferRequestResponseDto>> GetPendingTransferRequestsAsync()
        {
            var requests = await _transferReadRepository.GetPendingTransfersAsync();
            return requests.Select(MapToResponseDto);
        }

        public async Task ApproveTransferRequestAsync(int id, string? officerNotes)
        {
            var request = await _transferReadRepository.GetByIdWithDocumentsAsync(id);
            if (request == null) throw new InvalidOperationException("Transfer request not found.");
            if (request.Status != TransferStatus.Pending && request.Status != TransferStatus.UnderReview)
                throw new InvalidOperationException("Transfer request is already processed.");

            // Find new owner by email
            var newOwner = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.NewOwnerEmail);
            if (newOwner == null)
            {
                throw new InvalidOperationException($"New owner with email {request.NewOwnerEmail} not found in the system. They must have an account first.");
            }

            // Validate documents based on reason
            ValidateDocuments(request);

            // Update Policy
            var policy = request.Policy;
            if (policy == null) policy = await _policyRepository.GetByIdAsync(request.PolicyId);
            
            policy.CustomerId = newOwner.Id;
            policy.AdminNotes = officerNotes ?? "Ownership Transferred";

            // Update Request Status
            request.Status = TransferStatus.Approved;
            request.OfficerNotes = officerNotes;

            await _transferWriteRepository.SaveChangesAsync();
            await _policyRepository.SaveChangesAsync();

            // Notify both parties
            await _notificationRepository.AddAsync(new Notification
            {
                UserId = request.CurrentOwnerId,
                Title = "Policy Transferred",
                Message = $"Your policy {policy.Id} has been successfully transferred to {request.NewOwnerName}.",
                Type = "success"
            });

            await _notificationRepository.AddAsync(new Notification
            {
                UserId = newOwner.Id,
                Title = "Policy Ownership Received",
                Message = $"You are now the owner of policy {policy.Id}.",
                Type = "success"
            });

            await _notificationRepository.SaveChangesAsync();
        }

        public async Task RejectTransferRequestAsync(int id, string? officerNotes)
        {
            var request = await _transferWriteRepository.GetByIdAsync(id);
            if (request == null) throw new InvalidOperationException("Transfer request not found.");

            request.Status = TransferStatus.Rejected;
            request.OfficerNotes = officerNotes;

            await _transferWriteRepository.SaveChangesAsync();

            await _notificationRepository.AddAsync(new Notification
            {
                UserId = request.CurrentOwnerId,
                Title = "Transfer Request Rejected",
                Message = $"Your transfer request for policy {request.PolicyId} has been rejected. Notes: {officerNotes}",
                Type = "error"
            });

            await _notificationRepository.SaveChangesAsync();
        }

        public async Task SaveDocumentAnalysisAsync(int documentId, string extractedText, string extractedDataJson, string aiSummary)
        {
            var document = await _transferReadRepository.GetDocumentByIdAsync(documentId);
            if (document == null) throw new InvalidOperationException("Document not found.");

            document.ExtractedText = extractedText;
            document.ExtractedDataJson = extractedDataJson;
            document.AiSummary = aiSummary;

            await _transferReadRepository.UpdateDocumentAsync(document);
        }

        private void ValidateDocuments(PolicyOwnershipTransfer request)
        {
            var docs = request.Documents.Select(d => d.DocumentType.ToLower()).ToList();
            bool isValid = request.TransferReason switch
            {
                TransferReason.Sale => docs.Contains("sale deed") && docs.Contains("new owner id proof"),
                TransferReason.Inheritance => docs.Contains("death certificate") && docs.Contains("legal heir certificate"),
                TransferReason.Gift => docs.Contains("gift deed") && docs.Contains("new owner id proof"),
                _ => true
            };

            if (!isValid)
            {
                throw new InvalidOperationException($"Required documents for {request.TransferReason} are missing.");
            }
        }

        private TransferRequestResponseDto MapToResponseDto(PolicyOwnershipTransfer t)
        {
            return new TransferRequestResponseDto
            {
                Id = t.Id,
                PolicyId = t.PolicyId,
                PolicyPlanName = t.Policy?.Plan?.PlanName ?? "Unknown Plan",
                CurrentOwnerId = t.CurrentOwnerId,
                CurrentOwnerName = t.CurrentOwner?.FullName ?? "Unknown",
                NewOwnerName = t.NewOwnerName,
                NewOwnerEmail = t.NewOwnerEmail,
                NewOwnerPhone = t.NewOwnerPhone,
                TransferReason = t.TransferReason,
                Status = t.Status,
                RequestedAt = t.RequestedAt,
                OfficerNotes = t.OfficerNotes,
                Documents = t.Documents.Select(d => new TransferDocumentDto
                {
                    Id = d.Id,
                    DocumentType = d.DocumentType,
                    FilePath = d.FilePath,
                    UploadedAt = d.UploadedAt,
                    ExtractedText = d.ExtractedText,
                    ExtractedDataJson = d.ExtractedDataJson,
                    AiSummary = d.AiSummary
                }).ToList()
            };
        }
    }
}
