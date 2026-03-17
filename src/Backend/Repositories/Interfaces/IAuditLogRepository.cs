using SoftwareUpdateManagement.API.DTOs.AuditLog;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IAuditLogRepository
    {
        Task<AuditLogPagedResponse> GetAuditLogs(
            int? userId = null,
            string? entityType = null,
            int? entityId = null,
            string? action = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            int pageNumber = 1,
            int pageSize = 50);

        Task<IEnumerable<AuditLogDto>> GetAuditLogsByEntity(string entityType, int entityId);

        Task<IEnumerable<AuditLogDto>> GetUserActivity(
            int userId,
            DateTime? startDate = null,
            DateTime? endDate = null,
            int maxResults = 100);

        Task<AuditLogStatisticsDto> GetAuditLogStatistics(
            DateTime? startDate = null,
            DateTime? endDate = null);

        Task<int> CreateAuditLog(CreateAuditLogDto auditLog);
    }
}
