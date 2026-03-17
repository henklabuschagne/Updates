using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.SystemHealth;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SystemHealthController : ControllerBase
    {
        private readonly ISystemHealthRepository _healthRepository;
        private readonly ILogger<SystemHealthController> _logger;

        public SystemHealthController(
            ISystemHealthRepository healthRepository,
            ILogger<SystemHealthController> logger)
        {
            _healthRepository = healthRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get comprehensive system health information
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<SystemHealthDto>>> GetSystemHealth()
        {
            try
            {
                var metrics = await _healthRepository.GetSystemMetricsAsync();
                var services = await _healthRepository.GetServiceStatusesAsync();
                var cpuHistory = await _healthRepository.GetCpuHistoryAsync(24);
                var memoryHistory = await _healthRepository.GetMemoryHistoryAsync(24);

                // Determine overall status
                var overallStatus = "healthy";
                if (services.Any(s => s.Status == "down"))
                    overallStatus = "down";
                else if (services.Any(s => s.Status == "degraded"))
                    overallStatus = "degraded";

                var health = new SystemHealthDto
                {
                    Metrics = metrics,
                    Services = services,
                    CpuHistory = cpuHistory,
                    MemoryHistory = memoryHistory,
                    OverallStatus = overallStatus
                };

                return Ok(new ApiResponse<SystemHealthDto>
                {
                    Success = true,
                    Data = health,
                    Message = "System health retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system health");
                return StatusCode(500, new ApiResponse<SystemHealthDto>
                {
                    Success = false,
                    Message = "Error retrieving system health",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get current system metrics
        /// </summary>
        [HttpGet("metrics")]
        public async Task<ActionResult<ApiResponse<SystemMetricsDto>>> GetMetrics()
        {
            try
            {
                var metrics = await _healthRepository.GetSystemMetricsAsync();
                return Ok(new ApiResponse<SystemMetricsDto>
                {
                    Success = true,
                    Data = metrics,
                    Message = "System metrics retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system metrics");
                return StatusCode(500, new ApiResponse<SystemMetricsDto>
                {
                    Success = false,
                    Message = "Error retrieving system metrics",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get service statuses
        /// </summary>
        [HttpGet("services")]
        public async Task<ActionResult<ApiResponse<List<ServiceStatusDto>>>> GetServiceStatuses()
        {
            try
            {
                var services = await _healthRepository.GetServiceStatusesAsync();
                return Ok(new ApiResponse<List<ServiceStatusDto>>
                {
                    Success = true,
                    Data = services,
                    Message = "Service statuses retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving service statuses");
                return StatusCode(500, new ApiResponse<List<ServiceStatusDto>>
                {
                    Success = false,
                    Message = "Error retrieving service statuses",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get CPU usage history
        /// </summary>
        [HttpGet("metrics/cpu")]
        public async Task<ActionResult<ApiResponse<List<MetricHistoryDto>>>> GetCpuHistory([FromQuery] int hours = 24)
        {
            try
            {
                var history = await _healthRepository.GetCpuHistoryAsync(hours);
                return Ok(new ApiResponse<List<MetricHistoryDto>>
                {
                    Success = true,
                    Data = history,
                    Message = "CPU history retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving CPU history");
                return StatusCode(500, new ApiResponse<List<MetricHistoryDto>>
                {
                    Success = false,
                    Message = "Error retrieving CPU history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get memory usage history
        /// </summary>
        [HttpGet("metrics/memory")]
        public async Task<ActionResult<ApiResponse<List<MetricHistoryDto>>>> GetMemoryHistory([FromQuery] int hours = 24)
        {
            try
            {
                var history = await _healthRepository.GetMemoryHistoryAsync(hours);
                return Ok(new ApiResponse<List<MetricHistoryDto>>
                {
                    Success = true,
                    Data = history,
                    Message = "Memory history retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving memory history");
                return StatusCode(500, new ApiResponse<List<MetricHistoryDto>>
                {
                    Success = false,
                    Message = "Error retrieving memory history",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get database health information
        /// </summary>
        [HttpGet("database")]
        public async Task<ActionResult<ApiResponse<DatabaseHealthDto>>> GetDatabaseHealth()
        {
            try
            {
                var health = await _healthRepository.GetDatabaseHealthAsync();
                return Ok(new ApiResponse<DatabaseHealthDto>
                {
                    Success = true,
                    Data = health,
                    Message = "Database health retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving database health");
                return StatusCode(500, new ApiResponse<DatabaseHealthDto>
                {
                    Success = false,
                    Message = "Error retrieving database health",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get API health information
        /// </summary>
        [HttpGet("api")]
        public async Task<ActionResult<ApiResponse<ApiHealthDto>>> GetApiHealth()
        {
            try
            {
                var health = await _healthRepository.GetApiHealthAsync();
                return Ok(new ApiResponse<ApiHealthDto>
                {
                    Success = true,
                    Data = health,
                    Message = "API health retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving API health");
                return StatusCode(500, new ApiResponse<ApiHealthDto>
                {
                    Success = false,
                    Message = "Error retrieving API health",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Lightweight health check endpoint (no auth required)
        /// </summary>
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                version = "1.0.0"
            });
        }
    }
}
