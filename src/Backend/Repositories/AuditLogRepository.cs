using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SoftwareUpdateManagement.API.DTOs.AuditLog;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly string _connectionString;

        public AuditLogRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<AuditLogPagedResponse> GetAuditLogs(
            int? userId = null,
            string? entityType = null,
            int? entityId = null,
            string? action = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            int pageNumber = 1,
            int pageSize = 50)
        {
            var logs = new List<AuditLogDto>();
            int totalCount = 0;

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetAuditLogs", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@UserId", userId ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EntityType", entityType ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EntityId", entityId ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Action", action ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@StartDate", startDate ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EndDate", endDate ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@PageNumber", pageNumber);
                    command.Parameters.AddWithValue("@PageSize", pageSize);

                    var totalCountParam = new SqlParameter("@TotalCount", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    command.Parameters.Add(totalCountParam);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            logs.Add(MapAuditLogDto(reader));
                        }
                    }

                    totalCount = (int)totalCountParam.Value;
                }
            }

            return new AuditLogPagedResponse
            {
                Logs = logs,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<IEnumerable<AuditLogDto>> GetAuditLogsByEntity(string entityType, int entityId)
        {
            var logs = new List<AuditLogDto>();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetAuditLogsByEntity", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@EntityType", entityType);
                    command.Parameters.AddWithValue("@EntityId", entityId);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            logs.Add(MapAuditLogDto(reader));
                        }
                    }
                }
            }

            return logs;
        }

        public async Task<IEnumerable<AuditLogDto>> GetUserActivity(
            int userId,
            DateTime? startDate = null,
            DateTime? endDate = null,
            int maxResults = 100)
        {
            var logs = new List<AuditLogDto>();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetUserActivity", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@UserId", userId);
                    command.Parameters.AddWithValue("@StartDate", startDate ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EndDate", endDate ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@MaxResults", maxResults);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            logs.Add(MapAuditLogDto(reader));
                        }
                    }
                }
            }

            return logs;
        }

        public async Task<AuditLogStatisticsDto> GetAuditLogStatistics(
            DateTime? startDate = null,
            DateTime? endDate = null)
        {
            var statistics = new AuditLogStatisticsDto
            {
                StartDate = startDate,
                EndDate = endDate
            };

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetAuditLogStatistics", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@StartDate", startDate ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EndDate", endDate ?? (object)DBNull.Value);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Summary statistics
                        if (await reader.ReadAsync())
                        {
                            statistics.TotalActions = reader.GetInt32(reader.GetOrdinal("TotalActions"));
                            statistics.UniqueUsers = reader.GetInt32(reader.GetOrdinal("UniqueUsers"));
                        }

                        // Second result set: Actions by type
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var actionType = reader.GetString(reader.GetOrdinal("Action"));
                                var count = reader.GetInt32(reader.GetOrdinal("ActionCount"));
                                statistics.ActionsByType[actionType] = count;
                            }
                        }

                        // Third result set: Actions by entity
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var entityType = reader.GetString(reader.GetOrdinal("EntityType"));
                                var count = reader.GetInt32(reader.GetOrdinal("EntityCount"));
                                statistics.ActionsByEntity[entityType] = count;
                            }
                        }

                        // Fourth result set: Most active users
                        if (await reader.NextResultAsync())
                        {
                            var users = new List<TopUserActivity>();
                            while (await reader.ReadAsync())
                            {
                                users.Add(new TopUserActivity
                                {
                                    UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                                    Username = reader.GetString(reader.GetOrdinal("Username")),
                                    ActionCount = reader.GetInt32(reader.GetOrdinal("ActionCount"))
                                });
                            }
                            statistics.MostActiveUsers = users;
                        }
                    }
                }
            }

            return statistics;
        }

        public async Task<int> CreateAuditLog(CreateAuditLogDto auditLog)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_CreateAuditLog", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@UserId", auditLog.UserId ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Action", auditLog.Action);
                    command.Parameters.AddWithValue("@EntityType", auditLog.EntityType);
                    command.Parameters.AddWithValue("@EntityId", auditLog.EntityId ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Details", auditLog.Details ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@OldValue", auditLog.OldValue ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@NewValue", auditLog.NewValue ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@IpAddress", auditLog.IpAddress ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@UserAgent", auditLog.UserAgent ?? (object)DBNull.Value);

                    await connection.OpenAsync();
                    var result = await command.ExecuteScalarAsync();
                    return Convert.ToInt32(result);
                }
            }
        }

        private AuditLogDto MapAuditLogDto(SqlDataReader reader)
        {
            return new AuditLogDto
            {
                AuditLogId = reader.GetInt32(reader.GetOrdinal("AuditLogId")),
                UserId = reader.IsDBNull(reader.GetOrdinal("UserId"))
                    ? null : reader.GetInt32(reader.GetOrdinal("UserId")),
                Username = reader.IsDBNull(reader.GetOrdinal("Username"))
                    ? null : reader.GetString(reader.GetOrdinal("Username")),
                Action = reader.GetString(reader.GetOrdinal("Action")),
                EntityType = reader.GetString(reader.GetOrdinal("EntityType")),
                EntityId = reader.IsDBNull(reader.GetOrdinal("EntityId"))
                    ? null : reader.GetInt32(reader.GetOrdinal("EntityId")),
                Details = reader.IsDBNull(reader.GetOrdinal("Details"))
                    ? null : reader.GetString(reader.GetOrdinal("Details")),
                OldValue = reader.IsDBNull(reader.GetOrdinal("OldValue"))
                    ? null : reader.GetString(reader.GetOrdinal("OldValue")),
                NewValue = reader.IsDBNull(reader.GetOrdinal("NewValue"))
                    ? null : reader.GetString(reader.GetOrdinal("NewValue")),
                IpAddress = reader.IsDBNull(reader.GetOrdinal("IpAddress"))
                    ? null : reader.GetString(reader.GetOrdinal("IpAddress")),
                UserAgent = reader.IsDBNull(reader.GetOrdinal("UserAgent"))
                    ? null : reader.GetString(reader.GetOrdinal("UserAgent")),
                Timestamp = reader.GetDateTime(reader.GetOrdinal("Timestamp"))
            };
        }
    }
}
