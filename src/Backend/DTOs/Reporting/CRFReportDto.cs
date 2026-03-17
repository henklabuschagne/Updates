namespace SoftwareUpdateManagement.API.DTOs.Reporting
{
    public class CRFReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalCRFs { get; set; }
        public int CompletedCRFs { get; set; }
        public int PendingCRFs { get; set; }
        public int CancelledCRFs { get; set; }
        public decimal CompletionRate { get; set; }
        public double AverageApprovalTime { get; set; }
        public double AverageDeploymentTime { get; set; }
        public List<CRFByStatusDto> CRFsByStatus { get; set; } = new List<CRFByStatusDto>();
        public List<CRFByPriorityDto> CRFsByPriority { get; set; } = new List<CRFByPriorityDto>();
        public List<CRFByVersionDto> CRFsByVersion { get; set; } = new List<CRFByVersionDto>();
        public List<ApprovalPerformanceDto> ApprovalPerformance { get; set; } = new List<ApprovalPerformanceDto>();
    }

    public class CRFByStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class CRFByPriorityDto
    {
        public string Priority { get; set; } = string.Empty;
        public int Count { get; set; }
        public int CompletedCount { get; set; }
        public decimal AverageCompletionDays { get; set; }
    }

    public class CRFByVersionDto
    {
        public string VersionNumber { get; set; } = string.Empty;
        public string VersionName { get; set; } = string.Empty;
        public int CRFCount { get; set; }
        public int CompletedCount { get; set; }
    }

    public class ApprovalPerformanceDto
    {
        public string StepName { get; set; } = string.Empty;
        public int TotalApprovals { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public int PendingCount { get; set; }
        public double AverageApprovalDays { get; set; }
    }
}
