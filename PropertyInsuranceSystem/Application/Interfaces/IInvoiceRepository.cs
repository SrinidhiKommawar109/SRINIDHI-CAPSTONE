using Domain.Entities;

namespace Application.Interfaces;

public interface IInvoiceRepository
{
    Task<List<Invoice>> GetByCustomerIdAsync(int customerId);
}
