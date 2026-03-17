using SoftwareUpdateManagement.API.DTOs.Notifications;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface INotificationRepository
    {
        Task<IEnumerable<NotificationDto>> GetUserNotifications(int userId, bool includeRead = false, int maxResults = 50);
        Task<int> GetUnreadNotificationCount(int userId);
        Task<NotificationDto> CreateNotification(CreateNotificationDto notification);
        Task<bool> MarkNotificationAsRead(int notificationId);
        Task<int> MarkAllNotificationsAsRead(int userId);
        Task<bool> DeleteNotification(int notificationId);
    }
}
