using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IPolicyTransferRepository
    {
        Task<PolicyOwnershipTransfer?> GetByIdAsync(int id);
        Task<IEnumerable<PolicyOwnershipTransfer>> GetByCustomerIdAsync(int customerId);
        Task<IEnumerable<PolicyOwnershipTransfer>> GetPendingTransfersAsync();
        Task AddDocumentAsync(PolicyTransferDocument document);
        Task<PolicyOwnershipTransfer> GetByIdWithDocumentsAsync(int id);
    }
}
