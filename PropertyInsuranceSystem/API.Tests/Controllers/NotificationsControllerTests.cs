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
        var notificationRepo = new Repository<Notification>(_context);
        var notificationReadRepo = new NotificationRepository(_context);
        INotificationService notificationService = new NotificationService(notificationRepo, notificationReadRepo);
        _controller = new NotificationsController(notificationService);
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
        int userId = 1;
        await CreateUser(userId);
        SetupUser(userId.ToString());
        _context.Notifications.Add(new Notification { Id = 1, UserId = userId, Message = "Test 1", Title = "T", Type = "I", CreatedAt = DateTime.UtcNow });
        _context.Notifications.Add(new Notification { Id = 2, UserId = userId, Message = "Test 2", Title = "T", Type = "I", CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        var result = await _controller.GetMyNotifications();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var notifications = Assert.IsType<List<Notification>>(okResult.Value);
        Assert.Equal(2, notifications.Count);
    }

    [Fact]
    public async Task MarkAsRead_ReturnsOk_WhenSuccessful()
    {
        int userId = 2;
        await CreateUser(userId);
        SetupUser(userId.ToString());
        var notification = new Notification { Id = 1, UserId = userId, Message = "Test", Title = "T", Type = "I", IsRead = false };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var result = await _controller.MarkAsRead(1);

        Assert.IsType<OkResult>(result);
        var updated = await _context.Notifications.FindAsync(1);
        Assert.NotNull(updated);
        Assert.True(updated.IsRead);
    }

    [Fact]
    public async Task ClearAll_ReturnsOk_AndRemovesNotifications()
    {
        int userId = 3;
        await CreateUser(userId);
        SetupUser(userId.ToString());
        _context.Notifications.Add(new Notification { Id = 1, UserId = userId, Message = "Test 1", Title = "T", Type = "I" });
        _context.Notifications.Add(new Notification { Id = 2, UserId = userId, Message = "Test 2", Title = "T", Type = "I" });
        await _context.SaveChangesAsync();

        var result = await _controller.ClearAll();

        Assert.IsType<OkResult>(result);
        Assert.Empty(await _context.Notifications.Where(n => n.UserId == userId).ToListAsync());
    }
}
