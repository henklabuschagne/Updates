namespace SoftwareUpdateManagement.API.DTOs.Reporting
{
    public class DeploymentReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalDeployments { get; set; }
        public int SuccessfulDeployments { get; set; }
        public int FailedDeployments { get; set; }
        public int PendingDeployments { get; set; }
        public decimal SuccessRate { get; set; }
        public List<DeploymentByVersionDto> DeploymentsByVersion { get; set; } = new List<DeploymentByVersionDto>();
        public List<DeploymentByClientDto> DeploymentsByClient { get; set; } = new List<DeploymentByClientDto>();
        public List<DeploymentTrendDto> DeploymentTrend { get; set; } = new List<DeploymentTrendDto>();
    }

    public class DeploymentByVersionDto
    {
        public string VersionNumber { get; set; } = string.Empty;
        public string VersionName { get; set; } = string.Empty;
        public int DeploymentCount { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public decimal SuccessRate { get; set; }
    }

    public class DeploymentByClientDto
    {
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int DeploymentCount { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public string CurrentVersion { get; set; } = string.Empty;
        public DateTime? LastDeploymentDate { get; set; }
    }

    public class DeploymentTrendDto
    {
        public DateTime Date { get; set; }
        public int TotalDeployments { get; set; }
        public int SuccessfulDeployments { get; set; }
        public int FailedDeployments { get; set; }
    }
}
