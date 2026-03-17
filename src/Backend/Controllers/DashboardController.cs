using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.Dashboard;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardRepository _repository;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(IDashboardRepository repository, ILogger<DashboardController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<ApiResponse<DashboardStatisticsDto>>> GetStatistics()
        {
            try
            {
                var statistics = await _repository.GetDashboardStatistics();
                return Ok(ApiResponse<DashboardStatisticsDto>.SuccessResponse(statistics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard statistics");
                return StatusCode(500, ApiResponse<DashboardStatisticsDto>.ErrorResponse("An error occurred while retrieving dashboard statistics"));
            }
        }

        [HttpGet("overview")]
        public async Task<ActionResult<ApiResponse<SystemOverviewDto>>> GetOverview()
        {
            try
            {
                var overview = await _repository.GetSystemOverview();
                return Ok(ApiResponse<SystemOverviewDto>.SuccessResponse(overview));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system overview");
                return StatusCode(500, ApiResponse<SystemOverviewDto>.ErrorResponse("An error occurred while retrieving system overview"));
            }
        }

        [HttpGet("recent-activities")]
        public async Task<ActionResult<ApiResponse<List<RecentActivityDto>>>> GetRecentActivities([FromQuery] int maxResults = 20)
        {
            try
            {
                var activities = await _repository.GetRecentActivities(maxResults);
                return Ok(ApiResponse<List<RecentActivityDto>>.SuccessResponse(activities));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent activities");
                return StatusCode(500, ApiResponse<List<RecentActivityDto>>.ErrorResponse("An error occurred while retrieving recent activities"));
            }
        }

        [HttpGet("upcoming-deployments")]
        public async Task<ActionResult<ApiResponse<List<UpcomingDeploymentDto>>>> GetUpcomingDeployments([FromQuery] int days = 7)
        {
            try
            {
                var deployments = await _repository.GetUpcomingDeployments(days);
                return Ok(ApiResponse<List<UpcomingDeploymentDto>>.SuccessResponse(deployments));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming deployments");
                return StatusCode(500, ApiResponse<List<UpcomingDeploymentDto>>.ErrorResponse("An error occurred while retrieving upcoming deployments"));
            }
        }

        [HttpGet("critical-alerts")]
        public async Task<ActionResult<ApiResponse<List<CriticalAlertDto>>>> GetCriticalAlerts()
        {
            try
            {
                var alerts = await _repository.GetCriticalAlerts();
                return Ok(ApiResponse<List<CriticalAlertDto>>.SuccessResponse(alerts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting critical alerts");
                return StatusCode(500, ApiResponse<List<CriticalAlertDto>>.ErrorResponse("An error occurred while retrieving critical alerts"));
            }
        }

        [HttpGet("workflow-metrics")]
        public async Task<ActionResult<ApiResponse<WorkflowMetricsDto>>> GetWorkflowMetrics()
        {
            try
            {
                var metrics = await _repository.GetWorkflowMetrics();
                return Ok(ApiResponse<WorkflowMetricsDto>.SuccessResponse(metrics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workflow metrics");
                return StatusCode(500, ApiResponse<WorkflowMetricsDto>.ErrorResponse("An error occurred while retrieving workflow metrics"));
            }
        }

        [HttpGet("version-adoption")]
        public async Task<ActionResult<ApiResponse<VersionAdoptionDto>>> GetVersionAdoption()
        {
            try
            {
                var adoption = await _repository.GetVersionAdoption();
                return Ok(ApiResponse<VersionAdoptionDto>.SuccessResponse(adoption));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting version adoption");
                return StatusCode(500, ApiResponse<VersionAdoptionDto>.ErrorResponse("An error occurred while retrieving version adoption"));
            }
        }
    }
}
