using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _notificationRepository;
    private readonly INotificationRepository _notificationReadRepository;

    public NotificationService(
        IRepository<Notification> notificationRepository,
        INotificationRepository notificationReadRepository)
    {
        _notificationRepository = notificationRepository;
        _notificationReadRepository = notificationReadRepository;
    }

    public Task<List<Notification>> GetMyNotificationsAsync(int userId) =>
        _notificationReadRepository.GetByUserIdAsync(userId);

    public async Task MarkAsReadAsync(int id, int userId)
    {
        var notification = await _notificationRepository.GetByIdAsync(id);
        if (notification == null)
            throw new InvalidOperationException("Notification not found");

        if (notification.UserId != userId)
            throw new UnauthorizedAccessException("Not authorized");

        notification.IsRead = true;
        await _notificationRepository.SaveChangesAsync();
    }

    public async Task ClearAllAsync(int userId)
    {
        var notifications = await _notificationReadRepository.GetAllByUserIdAsync(userId);
        _notificationRepository.RemoveRange(notifications);
        await _notificationRepository.SaveChangesAsync();
    }
}
