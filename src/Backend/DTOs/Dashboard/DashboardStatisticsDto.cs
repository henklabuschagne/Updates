namespace SoftwareUpdateManagement.API.DTOs.Dashboard
{
    public class DashboardStatisticsDto
    {
        public SystemOverviewDto SystemOverview { get; set; } = new SystemOverviewDto();
        public List<RecentActivityDto> RecentActivities { get; set; } = new List<RecentActivityDto>();
        public List<UpcomingDeploymentDto> UpcomingDeployments { get; set; } = new List<UpcomingDeploymentDto>();
        public List<CriticalAlertDto> CriticalAlerts { get; set; } = new List<CriticalAlertDto>();
        public WorkflowMetricsDto WorkflowMetrics { get; set; } = new WorkflowMetricsDto();
        public VersionAdoptionDto VersionAdoption { get; set; } = new VersionAdoptionDto();
    }

    public class SystemOverviewDto
    {
        public int TotalClients { get; set; }
        public int ActiveCRFs { get; set; }
        public int PendingApprovals { get; set; }
        public int DeploymentsToday { get; set; }
        public int FailedDeployments { get; set; }
        public int UnresolvedErrors { get; set; }
        public decimal OverallDeploymentSuccessRate { get; set; }
        public int TotalVersions { get; set; }
        public string LatestVersion { get; set; } = string.Empty;
    }

    public class RecentActivityDto
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public int? EntityId { get; set; }
        public string Severity { get; set; } = string.Empty;
    }

    public class UpcomingDeploymentDto
    {
        public int CRFId { get; set; }
        public string CRFNumber { get; set; } = string.Empty;
        public string CRFTitle { get; set; } = string.Empty;
        public string VersionNumber { get; set; } = string.Empty;
        public DateTime? ScheduledDate { get; set; }
        public int ClientCount { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class CriticalAlertDto
    {
        public int AlertId { get; set; }
        public string AlertType { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public bool IsResolved { get; set; }
        public string? RelatedEntity { get; set; }
        public int? RelatedEntityId { get; set; }
    }

    public class WorkflowMetricsDto
    {
        public int TotalCRFsThisMonth { get; set; }
        public int CompletedCRFsThisMonth { get; set; }
        public double AverageApprovalTime { get; set; }
        public double AverageDeploymentTime { get; set; }
        public decimal ApprovalSuccessRate { get; set; }
        public List<WorkflowStepMetricDto> StepMetrics { get; set; } = new List<WorkflowStepMetricDto>();
    }

    public class WorkflowStepMetricDto
    {
        public string StepName { get; set; } = string.Empty;
        public int PendingCount { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public double AverageProcessingDays { get; set; }
    }

    public class VersionAdoptionDto
    {
        public string LatestVersion { get; set; } = string.Empty;
        public int ClientsOnLatestVersion { get; set; }
        public decimal LatestVersionAdoptionRate { get; set; }
        public List<VersionUsageDto> VersionUsage { get; set; } = new List<VersionUsageDto>();
    }

    public class VersionUsageDto
    {
        public string VersionNumber { get; set; } = string.Empty;
        public string VersionName { get; set; } = string.Empty;
        public int ClientCount { get; set; }
        public decimal Percentage { get; set; }
        public bool IsLatest { get; set; }
        public DateTime ReleaseDate { get; set; }
    }
}
