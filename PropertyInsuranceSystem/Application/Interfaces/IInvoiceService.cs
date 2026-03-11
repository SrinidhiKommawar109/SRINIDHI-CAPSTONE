using Domain.Entities;

namespace Application.Interfaces;

public interface IInvoiceService
{
    Task<List<Invoice>> GetMyInvoicesAsync(int customerId);
    Task GenerateInvoiceAsync(PolicyRequest request, decimal claimAmount = 0);
}
