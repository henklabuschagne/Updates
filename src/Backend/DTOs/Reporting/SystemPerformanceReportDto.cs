namespace SoftwareUpdateManagement.API.DTOs.Reporting
{
    public class SystemPerformanceReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalAPIExecutions { get; set; }
        public int SuccessfulAPIExecutions { get; set; }
        public int FailedAPIExecutions { get; set; }
        public decimal APISuccessRate { get; set; }
        public double AverageAPIResponseTime { get; set; }
        public int TotalErrors { get; set; }
        public int ResolvedErrors { get; set; }
        public int UnresolvedErrors { get; set; }
        public List<APIPerformanceDto> APIPerformanceByType { get; set; } = new List<APIPerformanceDto>();
        public List<ErrorByTypeDto> ErrorsByType { get; set; } = new List<ErrorByTypeDto>();
        public List<ErrorBySeverityDto> ErrorsBySeverity { get; set; } = new List<ErrorBySeverityDto>();
    }

    public class APIPerformanceDto
    {
        public string APIName { get; set; } = string.Empty;
        public string APIType { get; set; } = string.Empty;
        public int ExecutionCount { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public decimal SuccessRate { get; set; }
        public double AverageResponseTime { get; set; }
        public double MinResponseTime { get; set; }
        public double MaxResponseTime { get; set; }
    }

    public class ErrorByTypeDto
    {
        public string ErrorType { get; set; } = string.Empty;
        public int ErrorCount { get; set; }
        public int ResolvedCount { get; set; }
        public decimal ResolutionRate { get; set; }
    }

    public class ErrorBySeverityDto
    {
        public string Severity { get; set; } = string.Empty;
        public int ErrorCount { get; set; }
        public int ResolvedCount { get; set; }
        public int UnresolvedCount { get; set; }
    }
}
