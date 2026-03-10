using API.Controllers;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;
using SecurityClaim = System.Security.Claims.Claim;

namespace API.Tests.Controllers;

public class InvoicesControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly InvoicesController _controller;

    public InvoicesControllerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        var invoiceRepository = new InvoiceRepository(_context);
        var invoiceBaseRepository = new Repository<Invoice>(_context);
        IInvoiceService invoiceService = new InvoiceService(invoiceRepository, invoiceBaseRepository);
        _controller = new InvoicesController(invoiceService);
    }

    private void SetupUser(string userId, string role)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new SecurityClaim[]
        {
            new SecurityClaim(ClaimTypes.NameIdentifier, userId),
            new SecurityClaim(ClaimTypes.Role, role),
        }, "mock"));
        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    [Fact]
    public async Task GetMyInvoices_ReturnsOk_WithInvoices()
    {
        int userId = 3;
        SetupUser(userId.ToString(), "Customer");
        _context.Invoices.Add(new Invoice
        {
            Id = 1,
            CustomerId = userId,
            TotalPremium = 100,
            GeneratedDate = DateTime.UtcNow,
            InvoiceNumber = "INV-001",
            PlanName = "Plan A"
        });
        await _context.SaveChangesAsync();

        var result = await _controller.GetMyInvoices();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var invoices = Assert.IsType<List<Invoice>>(okResult.Value);
        Assert.Single(invoices);
        Assert.Equal(userId, invoices[0].CustomerId);
    }
}
