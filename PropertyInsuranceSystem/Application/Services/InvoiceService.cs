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

    public async Task GenerateInvoiceAsync(PolicyRequest request, decimal claimAmount = 0)
    {
        // For premium invoices (claimAmount == 0), check if any premium invoice already exists for this requestId.
        // For claim invoices (claimAmount > 0), check if an identical claim invoice already exists.
        var alreadyExists = await _invoiceBaseRepository.AnyAsync(i => 
            i.PolicyRequestId == request.Id && 
            i.ClaimAmount == claimAmount &&
            (claimAmount > 0 || i.ClaimAmount == 0)); // Double check it's definitely a premium vs claim match

        if (alreadyExists) return;

        var invoice = new Invoice
        {
            PolicyRequestId = request.Id,
            CustomerId = request.CustomerId,
            InvoiceNumber = claimAmount > 0 
                ? $"INV-{Guid.NewGuid().ToString().Substring(0, 8)}"
                : $"INV-{DateTime.Now:yyyyMMdd}-{request.Id}",
            GeneratedDate = DateTime.UtcNow,
            TotalPremium = request.TotalPremium,
            InstallmentAmount = request.InstallmentAmount,
            InstallmentCount = request.InstallmentCount,
            PlanName = request.Plan?.PlanName ?? "Comprehensive Property Plan",
            ClaimAmount = claimAmount
        };

        await _invoiceBaseRepository.AddAsync(invoice);
        await _invoiceBaseRepository.SaveChangesAsync();
    }
}
