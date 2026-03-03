using API.Controllers;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;
using SecurityClaim = System.Security.Claims.Claim;

namespace API.Tests.Controllers
{
    public class PolicyRequestsControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly PolicyRequestsController _controller;

        public PolicyRequestsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _controller = new PolicyRequestsController(_context);
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
        public async Task CreateRequest_ReturnsOk_WhenValid()
        {
            // Arrange
            SetupUser("1", "Customer");
            _context.PropertyPlans.Add(new PropertyPlans { Id = 1, PlanName = "Plan1" });
            await _context.SaveChangesAsync();

            var dto = new CreatePolicyRequestDto { PlanId = 1 };

            // Act
            var result = await _controller.CreateRequest(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            Assert.True(await _context.PolicyRequests.AnyAsync(r => r.PlanId == 1));
        }

        [Fact]
        public async Task AdminApprove_UpdatesStatus()
        {
            // Arrange
            var request = new PolicyRequest { Id = 1, Status = PolicyRequestStatus.CustomerConfirmed, CustomerId = 1 };
            _context.PolicyRequests.Add(request);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.AdminApprove(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(PolicyRequestStatus.PolicyApproved, request.Status);
        }
    }
}
