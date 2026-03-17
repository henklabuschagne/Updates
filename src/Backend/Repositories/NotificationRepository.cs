using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SoftwareUpdateManagement.API.DTOs.Notifications;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly string _connectionString;

        public NotificationRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotifications(int userId, bool includeRead = false, int maxResults = 50)
        {
            var notifications = new List<NotificationDto>();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetUserNotifications", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@UserId", userId);
                    command.Parameters.AddWithValue("@IncludeRead", includeRead);
                    command.Parameters.AddWithValue("@MaxResults", maxResults);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            notifications.Add(new NotificationDto
                            {
                                NotificationId = reader.GetInt32(reader.GetOrdinal("NotificationId")),
                                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                                Title = reader.GetString(reader.GetOrdinal("Title")),
                                Message = reader.GetString(reader.GetOrdinal("Message")),
                                Type = reader.GetString(reader.GetOrdinal("Type")),
                                Priority = reader.GetString(reader.GetOrdinal("Priority")),
                                IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead")),
                                RelatedEntityType = reader.IsDBNull(reader.GetOrdinal("RelatedEntityType"))
                                    ? null : reader.GetString(reader.GetOrdinal("RelatedEntityType")),
                                RelatedEntityId = reader.IsDBNull(reader.GetOrdinal("RelatedEntityId"))
                                    ? null : reader.GetInt32(reader.GetOrdinal("RelatedEntityId")),
                                ActionUrl = reader.IsDBNull(reader.GetOrdinal("ActionUrl"))
                                    ? null : reader.GetString(reader.GetOrdinal("ActionUrl")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                                ReadAt = reader.IsDBNull(reader.GetOrdinal("ReadAt"))
                                    ? null : reader.GetDateTime(reader.GetOrdinal("ReadAt")),
                                ExpiresAt = reader.IsDBNull(reader.GetOrdinal("ExpiresAt"))
                                    ? null : reader.GetDateTime(reader.GetOrdinal("ExpiresAt"))
                            });
                        }
                    }
                }
            }

            return notifications;
        }

        public async Task<int> GetUnreadNotificationCount(int userId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetUnreadNotificationCount", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@UserId", userId);

                    var countParam = new SqlParameter("@UnreadCount", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    command.Parameters.Add(countParam);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();

                    return (int)countParam.Value;
                }
            }
        }

        public async Task<NotificationDto> CreateNotification(CreateNotificationDto notification)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_CreateNotification", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@UserId", notification.UserId);
                    command.Parameters.AddWithValue("@Title", notification.Title);
                    command.Parameters.AddWithValue("@Message", notification.Message);
                    command.Parameters.AddWithValue("@Type", notification.Type);
                    command.Parameters.AddWithValue("@Priority", notification.Priority);
                    command.Parameters.AddWithValue("@RelatedEntityType",
                        notification.RelatedEntityType ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@RelatedEntityId",
                        notification.RelatedEntityId ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@ActionUrl",
                        notification.ActionUrl ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@ExpiresAt",
                        notification.ExpiresAt ?? (object)DBNull.Value);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new NotificationDto
                            {
                                NotificationId = reader.GetInt32(reader.GetOrdinal("NotificationId")),
                                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                                Title = reader.GetString(reader.GetOrdinal("Title")),
                                Message = reader.GetString(reader.GetOrdinal("Message")),
                                Type = reader.GetString(reader.GetOrdinal("Type")),
                                Priority = reader.GetString(reader.GetOrdinal("Priority")),
                                IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead")),
                                RelatedEntityType = reader.IsDBNull(reader.GetOrdinal("RelatedEntityType"))
                                    ? null : reader.GetString(reader.GetOrdinal("RelatedEntityType")),
                                RelatedEntityId = reader.IsDBNull(reader.GetOrdinal("RelatedEntityId"))
                                    ? null : reader.GetInt32(reader.GetOrdinal("RelatedEntityId")),
                                ActionUrl = reader.IsDBNull(reader.GetOrdinal("ActionUrl"))
                                    ? null : reader.GetString(reader.GetOrdinal("ActionUrl")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                                ReadAt = reader.IsDBNull(reader.GetOrdinal("ReadAt"))
                                    ? null : reader.GetDateTime(reader.GetOrdinal("ReadAt")),
                                ExpiresAt = reader.IsDBNull(reader.GetOrdinal("ExpiresAt"))
                                    ? null : reader.GetDateTime(reader.GetOrdinal("ExpiresAt"))
                            };
                        }
                    }
                }
            }

            throw new Exception("Failed to create notification");
        }

        public async Task<bool> MarkNotificationAsRead(int notificationId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_MarkNotificationAsRead", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@NotificationId", notificationId);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                    return true;
                }
            }
        }

        public async Task<int> MarkAllNotificationsAsRead(int userId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_MarkAllNotificationsAsRead", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@UserId", userId);

                    var countParam = new SqlParameter("@UpdatedCount", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    command.Parameters.Add(countParam);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();

                    return (int)countParam.Value;
                }
            }
        }

        public async Task<bool> DeleteNotification(int notificationId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_DeleteNotification", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@NotificationId", notificationId);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                    return true;
                }
            }
        }
    }
}
