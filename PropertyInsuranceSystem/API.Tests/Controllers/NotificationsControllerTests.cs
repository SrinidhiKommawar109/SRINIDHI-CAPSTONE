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
    public class NotificationsControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly NotificationsController _controller;

        public NotificationsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _controller = new NotificationsController(_context);
        }

        private void SetupUser(string userId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new SecurityClaim[]
            {
                new SecurityClaim(ClaimTypes.NameIdentifier, userId),
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

        private async Task<ApplicationUser> CreateUser(int id)
        {
            var user = new ApplicationUser { Id = id, FullName = "User " + id, Email = id + "@u.com", PasswordHash = "h" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        [Fact]
        public async Task GetMyNotifications_ReturnsOk_WithNotifications()
        {
            // Arrange
            int userId = 1;
            await CreateUser(userId);
            SetupUser(userId.ToString());
            _context.Notifications.Add(new Notification { Id = 1, UserId = userId, Message = "Test 1", Title = "T", Type = "I", CreatedAt = DateTime.UtcNow });
            _context.Notifications.Add(new Notification { Id = 2, UserId = userId, Message = "Test 2", Title = "T", Type = "I", CreatedAt = DateTime.UtcNow });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetMyNotifications();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var notifications = Assert.IsType<List<Notification>>(okResult.Value);
            Assert.Equal(2, notifications.Count);
        }

        [Fact]
        public async Task MarkAsRead_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            int userId = 2;
            await CreateUser(userId);
            SetupUser(userId.ToString());
            var notification = new Notification { Id = 1, UserId = userId, Message = "Test", Title = "T", Type = "I", IsRead = false };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.MarkAsRead(1);

            // Assert
            Assert.IsType<OkResult>(result);
            Assert.True(notification.IsRead);
        }

        [Fact]
        public async Task ClearAll_ReturnsOk_AndRemovesNotifications()
        {
            // Arrange
            int userId = 3;
            await CreateUser(userId);
            SetupUser(userId.ToString());
            _context.Notifications.Add(new Notification { Id = 1, UserId = userId, Message = "Test 1", Title = "T", Type = "I" });
            _context.Notifications.Add(new Notification { Id = 2, UserId = userId, Message = "Test 2", Title = "T", Type = "I" });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.ClearAll();

            // Assert
            Assert.IsType<OkResult>(result);
            Assert.Empty(await _context.Notifications.Where(n => n.UserId == userId).ToListAsync());
        }
    }
}
