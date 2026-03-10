using System;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IRepository<Invoice> _invoiceBaseRepository;

    public InvoiceService(IInvoiceRepository invoiceRepository, IRepository<Invoice> invoiceBaseRepository)
    {
        _invoiceRepository = invoiceRepository;
        _invoiceBaseRepository = invoiceBaseRepository;
    }

    public Task<List<Invoice>> GetMyInvoicesAsync(int customerId) =>
        _invoiceRepository.GetByCustomerIdAsync(customerId);

    public async Task GenerateInvoiceAsync(PolicyRequest request)
    {
        var invoice = new Invoice
        {
            PolicyRequestId = request.Id,
            CustomerId = request.CustomerId,
            InvoiceNumber = $"INV-{DateTime.Now:yyyyMMdd}-{request.Id}",
            GeneratedDate = DateTime.UtcNow,
            TotalPremium = request.TotalPremium,
            InstallmentAmount = request.InstallmentAmount,
            InstallmentCount = request.InstallmentCount,
            PlanName = request.Plan?.PlanName ?? "Comprehensive Property Plan",
            ClaimAmount = 0
        };

        await _invoiceBaseRepository.AddAsync(invoice);
        await _invoiceBaseRepository.SaveChangesAsync();
    }
}
