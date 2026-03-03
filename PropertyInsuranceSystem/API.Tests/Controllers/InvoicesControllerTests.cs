using API.Controllers;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

using SecurityClaim = System.Security.Claims.Claim;

namespace API.Tests.Controllers
{
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

            _controller = new InvoicesController(_context);
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
            // Arrange
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

            // Act
            var result = await _controller.GetMyInvoices();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var invoices = Assert.IsType<List<Invoice>>(okResult.Value);
            Assert.Single(invoices);
        }
    }
}
