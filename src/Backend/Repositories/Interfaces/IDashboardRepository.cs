using SoftwareUpdateManagement.API.DTOs.Dashboard;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IDashboardRepository
    {
        Task<DashboardStatisticsDto> GetDashboardStatistics();
        Task<SystemOverviewDto> GetSystemOverview();
        Task<List<RecentActivityDto>> GetRecentActivities(int maxResults = 20);
        Task<List<UpcomingDeploymentDto>> GetUpcomingDeployments(int days = 7);
        Task<List<CriticalAlertDto>> GetCriticalAlerts();
        Task<WorkflowMetricsDto> GetWorkflowMetrics();
        Task<VersionAdoptionDto> GetVersionAdoption();
    }
}
