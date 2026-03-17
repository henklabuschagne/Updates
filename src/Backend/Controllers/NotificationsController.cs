using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SoftwareUpdateManagement.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IAuditLogRepository _auditLogRepository;

        public NotificationsController(
            INotificationRepository notificationRepository,
            IAuditLogRepository auditLogRepository)
        {
            _notificationRepository = notificationRepository;
            _auditLogRepository = auditLogRepository;
        }

        /// <summary>
        /// Get all notifications for the current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUserNotifications(
            [FromQuery] bool includeRead = false,
            [FromQuery] int maxResults = 50)
        {
            var userId = GetCurrentUserId();
            var notifications = await _notificationRepository.GetUserNotifications(userId, includeRead, maxResults);
            return Ok(notifications);
        }

        /// <summary>
        /// Get unread notification count
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            var count = await _notificationRepository.GetUnreadNotificationCount(userId);
            return Ok(count);
        }

        /// <summary>
        /// Create a new notification
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] CreateNotificationDto request)
        {
            var notification = await _notificationRepository.CreateNotification(request);
            
            await _auditLogRepository.CreateAuditLog(new CreateAuditLogDto
            {
                UserId = GetCurrentUserId(),
                Action = "Create",
                EntityType = "Notification",
                EntityId = notification.NotificationId,
                Details = $"Created notification: {notification.Title}"
            });

            return CreatedAtAction(nameof(GetUserNotifications), notification);
        }

        /// <summary>
        /// Mark notification as read
        /// </summary>
        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _notificationRepository.MarkNotificationAsRead(id);
            return NoContent();
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("mark-all-read")]
        public async Task<ActionResult<int>> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            var count = await _notificationRepository.MarkAllNotificationsAsRead(userId);
            return Ok(count);
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            await _notificationRepository.DeleteNotification(id);
            
            await _auditLogRepository.CreateAuditLog(new CreateAuditLogDto
            {
                UserId = GetCurrentUserId(),
                Action = "Delete",
                EntityType = "Notification",
                EntityId = id
            });

            return NoContent();
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
}
