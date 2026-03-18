using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class PolicyTransferRepository : Repository<PolicyOwnershipTransfer>, IPolicyTransferRepository
    {
        private readonly ApplicationDbContext _context;

        public PolicyTransferRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PolicyOwnershipTransfer>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.PolicyOwnershipTransfers
                .Include(t => t.Policy)
                    .ThenInclude(p => p.Plan)
                .Include(t => t.Documents)
                .Where(t => t.CurrentOwnerId == customerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<PolicyOwnershipTransfer>> GetPendingTransfersAsync()
        {
            return await _context.PolicyOwnershipTransfers
                .Include(t => t.Policy)
                    .ThenInclude(p => p.Plan)
                .Include(t => t.CurrentOwner)
                .Include(t => t.Documents)
                .Where(t => t.Status == Domain.Enums.TransferStatus.Pending || t.Status == Domain.Enums.TransferStatus.UnderReview)
                .ToListAsync();
        }

        public async Task AddDocumentAsync(PolicyTransferDocument document)
        {
            await _context.PolicyTransferDocuments.AddAsync(document);
            await _context.SaveChangesAsync();
        }

        public async Task<PolicyTransferDocument?> GetDocumentByIdAsync(int id)
        {
            return await _context.PolicyTransferDocuments.FindAsync(id);
        }

        public async Task UpdateDocumentAsync(PolicyTransferDocument document)
        {
            _context.PolicyTransferDocuments.Update(document);
            await _context.SaveChangesAsync();
        }

        public async Task<PolicyOwnershipTransfer> GetByIdWithDocumentsAsync(int id)
        {
            return await _context.PolicyOwnershipTransfers
                .Include(t => t.Documents)
                .Include(t => t.Policy)
                    .ThenInclude(p => p.Plan)
                .FirstOrDefaultAsync(t => t.Id == id);
        }
    }
}
