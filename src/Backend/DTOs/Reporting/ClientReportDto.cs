namespace SoftwareUpdateManagement.API.DTOs.Reporting
{
    public class ClientReportDto
    {
        public int TotalClients { get; set; }
        public int ActiveClients { get; set; }
        public int InactiveClients { get; set; }
        public List<ClientVersionDistributionDto> VersionDistribution { get; set; } = new List<ClientVersionDistributionDto>();
        public List<ClientStatusDto> ClientsByStatus { get; set; } = new List<ClientStatusDto>();
        public List<ClientUpdateHistoryDto> RecentUpdates { get; set; } = new List<ClientUpdateHistoryDto>();
        public List<OutdatedClientDto> OutdatedClients { get; set; } = new List<OutdatedClientDto>();
    }

    public class ClientVersionDistributionDto
    {
        public string VersionNumber { get; set; } = string.Empty;
        public string VersionName { get; set; } = string.Empty;
        public int ClientCount { get; set; }
        public decimal Percentage { get; set; }
        public bool IsCurrentVersion { get; set; }
    }

    public class ClientStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int ClientCount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class ClientUpdateHistoryDto
    {
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string FromVersion { get; set; } = string.Empty;
        public string ToVersion { get; set; } = string.Empty;
        public DateTime UpdateDate { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
    }

    public class OutdatedClientDto
    {
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string CurrentVersion { get; set; } = string.Empty;
        public string LatestVersion { get; set; } = string.Empty;
        public int VersionsBehind { get; set; }
        public DateTime? LastUpdateDate { get; set; }
        public int DaysSinceUpdate { get; set; }
    }
}
