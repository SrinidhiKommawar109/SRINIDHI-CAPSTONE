using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("User ID not found in token.");

        var notifications = await _notificationService.GetMyNotificationsAsync(userId.Value);
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("User ID not found in token.");

        try
        {
            await _notificationService.MarkAsReadAsync(id, userId.Value);
            return Ok();
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearAll()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("User ID not found in token.");

        await _notificationService.ClearAllAsync(userId.Value);
        return Ok();
    }
}
