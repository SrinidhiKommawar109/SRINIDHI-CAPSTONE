using API.Controllers;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace API.Tests.Controllers
{
    public class AdminControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly AdminController _controller;

        public AdminControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _controller = new AdminController(_context);
        }

        [Fact]
        public void AdminDashboard_ReturnsOk()
        {
            // Act
            var result = _controller.AdminDashboard();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Welcome Admin", okResult.Value);
        }

        [Fact]
        public async Task GetAgents_ReturnsOnlyActiveAgents()
        {
            // Arrange
            _context.Users.Add(new ApplicationUser { Id = 1, FullName = "Agent 1", Role = UserRole.Agent, IsActive = true, Email = "a1@a.com", PasswordHash = "hash" });
            _context.Users.Add(new ApplicationUser { Id = 2, FullName = "Admin", Role = UserRole.Admin, IsActive = true, Email = "ad@a.com", PasswordHash = "hash" });
            _context.Users.Add(new ApplicationUser { Id = 3, FullName = "Inactive Agent", Role = UserRole.Agent, IsActive = false, Email = "a2@a.com", PasswordHash = "hash" });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAgents();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var agents = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value);
            int count = 0;
            foreach (var a in agents) count++;
            Assert.Equal(1, count);
        }
    }
}
