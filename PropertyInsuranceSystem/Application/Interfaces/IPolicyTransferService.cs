using Application.DTOs;
using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IPolicyTransferService
    {
        Task<int> CreateTransferRequestAsync(CreateTransferRequestDto dto, int currentOwnerId);
        Task<int> UploadTransferDocumentAsync(int transferRequestId, string documentType, string filePath);
        Task<IEnumerable<TransferRequestResponseDto>> GetCustomerTransferRequestsAsync(int customerId);
        Task<IEnumerable<TransferRequestResponseDto>> GetPendingTransferRequestsAsync();
        Task ApproveTransferRequestAsync(int id, string? officerNotes);
        Task RejectTransferRequestAsync(int id, string? officerNotes);
        Task SaveDocumentAnalysisAsync(int documentId, string extractedText, string extractedDataJson, string aiSummary);
    }
}
