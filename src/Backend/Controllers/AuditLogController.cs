using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SoftwareUpdateManagement.API.Controllers
{
    [Authorize(Roles = "DevOps")]
    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogRepository _auditLogRepository;

        public AuditLogController(IAuditLogRepository auditLogRepository)
        {
            _auditLogRepository = auditLogRepository;
        }

        /// <summary>
        /// Get audit logs with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<AuditLogPagedResponse>> GetAuditLogs(
            [FromQuery] int? userId = null,
            [FromQuery] string? entityType = null,
            [FromQuery] int? entityId = null,
            [FromQuery] string? action = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            var result = await _auditLogRepository.GetAuditLogs(
                userId, entityType, entityId, action, startDate, endDate, pageNumber, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get audit logs for a specific entity
        /// </summary>
        [HttpGet("entity/{entityType}/{entityId}")]
        public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAuditLogsByEntity(
            string entityType,
            int entityId)
        {
            var logs = await _auditLogRepository.GetAuditLogsByEntity(entityType, entityId);
            return Ok(logs);
        }

        /// <summary>
        /// Get user activity history
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetUserActivity(
            int userId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int maxResults = 100)
        {
            var activity = await _auditLogRepository.GetUserActivity(userId, startDate, endDate, maxResults);
            return Ok(activity);
        }

        /// <summary>
        /// Get audit log statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<ActionResult<AuditLogStatisticsDto>> GetStatistics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var stats = await _auditLogRepository.GetAuditLogStatistics(startDate, endDate);
            return Ok(stats);
        }

        /// <summary>
        /// Export audit logs (for compliance)
        /// </summary>
        [HttpGet("export")]
        public async Task<ActionResult> ExportAuditLogs(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var logs = await _auditLogRepository.GetAuditLogs(
                null, null, null, null, startDate, endDate, 1, int.MaxValue);
            
            // In a real implementation, this would generate a CSV or PDF
            // For now, returning JSON
            return Ok(logs);
        }
    }
}
