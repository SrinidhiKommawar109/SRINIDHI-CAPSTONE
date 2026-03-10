using Domain.Entities;

namespace Application.Interfaces;

public interface INotificationService
{
    Task<List<Notification>> GetMyNotificationsAsync(int userId);
    Task MarkAsReadAsync(int id, int userId);
    Task ClearAllAsync(int userId);
}
