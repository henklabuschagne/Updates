namespace SoftwareUpdateManagement.API.DTOs.CRF
{
    public class CRFResponseDto
    {
        public int CRFId { get; set; }
        public string CRFNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int VersionId { get; set; }
        public string VersionNumber { get; set; } = string.Empty;
        public string VersionName { get; set; } = string.Empty;
        public int RequestedBy { get; set; }
        public string RequestedByName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime? ScheduledDeploymentDate { get; set; }
        public DateTime? ActualDeploymentDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public int ClientCount { get; set; }
        public int SuccessfulDeployments { get; set; }
    }
}
