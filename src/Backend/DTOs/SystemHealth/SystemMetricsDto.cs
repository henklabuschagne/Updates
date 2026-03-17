namespace SoftwareUpdateManagement.API.DTOs.SystemHealth
{
    public class SystemMetricsDto
    {
        public double CpuUsage { get; set; }
        public double MemoryUsage { get; set; }
        public double DiskUsage { get; set; }
        public int ActiveConnections { get; set; }
        public double ApiResponseTime { get; set; }
        public double DatabaseResponseTime { get; set; }
        public double Uptime { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class ServiceStatusDto
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // healthy, degraded, down
        public double ResponseTime { get; set; }
        public DateTime LastCheck { get; set; }
        public double Uptime { get; set; }
    }

    public class SystemHealthDto
    {
        public SystemMetricsDto Metrics { get; set; } = new();
        public List<ServiceStatusDto> Services { get; set; } = new();
        public List<MetricHistoryDto> CpuHistory { get; set; } = new();
        public List<MetricHistoryDto> MemoryHistory { get; set; } = new();
        public string OverallStatus { get; set; } = "healthy";
    }

    public class MetricHistoryDto
    {
        public DateTime Timestamp { get; set; }
        public double Value { get; set; }
    }

    public class DatabaseHealthDto
    {
        public bool IsConnected { get; set; }
        public double ResponseTime { get; set; }
        public int ActiveConnections { get; set; }
        public long TotalQueries { get; set; }
        public DateTime LastCheck { get; set; }
    }

    public class ApiHealthDto
    {
        public bool IsHealthy { get; set; }
        public double AverageResponseTime { get; set; }
        public int TotalRequests { get; set; }
        public int FailedRequests { get; set; }
        public DateTime LastCheck { get; set; }
    }
}
