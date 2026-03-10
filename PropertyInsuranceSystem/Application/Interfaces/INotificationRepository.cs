using Domain.Entities;

namespace Application.Interfaces;

public interface INotificationRepository
{
    Task<List<Notification>> GetByUserIdAsync(int userId, int take = 50);
    Task<List<Notification>> GetAllByUserIdAsync(int userId);
}
