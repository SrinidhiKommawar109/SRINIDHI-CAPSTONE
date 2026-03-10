using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly ApplicationDbContext _context;

    public InvoiceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Invoice>> GetByCustomerIdAsync(int customerId)
    {
        return await _context.Invoices
            .Where(i => i.CustomerId == customerId)
            .ToListAsync();
    }
}
