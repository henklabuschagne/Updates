namespace SoftwareUpdateManagement.API.DTOs.Search
{
    public class AdvancedSearchRequestDto
    {
        public string? Keyword { get; set; }
        public string? Status { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? Version { get; set; }
        public string? Severity { get; set; }
        public string? Category { get; set; }
        public List<string>? SearchTypes { get; set; } = new(); // crfs, clients, versions, errors, deployments
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class AdvancedSearchResultDto
    {
        public SearchResultSummaryDto Summary { get; set; } = new();
        public List<CRFSearchResultDto> CRFs { get; set; } = new();
        public List<ClientSearchResultDto> Clients { get; set; } = new();
        public List<VersionSearchResultDto> Versions { get; set; } = new();
        public List<ErrorSearchResultDto> Errors { get; set; } = new();
        public List<DeploymentSearchResultDto> Deployments { get; set; } = new();
    }

    public class SearchResultSummaryDto
    {
        public int TotalCRFs { get; set; }
        public int TotalClients { get; set; }
        public int TotalVersions { get; set; }
        public int TotalErrors { get; set; }
        public int TotalDeployments { get; set; }
        public int TotalResults { get; set; }
        public DateTime SearchedAt { get; set; }
    }

    public class CRFSearchResultDto
    {
        public int CRFId { get; set; }
        public string CRFNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Priority { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? VersionNumber { get; set; }
        public double RelevanceScore { get; set; }
    }

    public class ClientSearchResultDto
    {
        public int ClientId { get; set; }
        public string ClientCode { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string? ContactEmail { get; set; }
        public string? ContactPerson { get; set; }
        public string? CurrentVersion { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? LastUpdated { get; set; }
        public double RelevanceScore { get; set; }
    }

    public class VersionSearchResultDto
    {
        public int VersionId { get; set; }
        public string VersionNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime ReleaseDate { get; set; }
        public bool IsStable { get; set; }
        public int ClientCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public double RelevanceScore { get; set; }
    }

    public class ErrorSearchResultDto
    {
        public int ErrorId { get; set; }
        public string ErrorCode { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string? ClientName { get; set; }
        public string? VersionNumber { get; set; }
        public DateTime OccurredAt { get; set; }
        public bool IsResolved { get; set; }
        public double RelevanceScore { get; set; }
    }

    public class DeploymentSearchResultDto
    {
        public int DeploymentId { get; set; }
        public int? CRFId { get; set; }
        public string? CRFNumber { get; set; }
        public string? ClientName { get; set; }
        public string? VersionNumber { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? Priority { get; set; }
        public DateTime CreatedDate { get; set; }
        public double RelevanceScore { get; set; }
    }
}
