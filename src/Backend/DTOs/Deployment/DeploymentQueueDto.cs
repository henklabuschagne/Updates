namespace SoftwareUpdateManagement.API.DTOs.Deployment
{
    public class DeploymentQueueDto
    {
        public int DeploymentQueueId { get; set; }
        public int CRFId { get; set; }
        public int ClientId { get; set; }
        public int QueuedBy { get; set; }
        public DateTime QueuedDate { get; set; }
        public DateTime? ScheduledStartTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? CompletedTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Priority { get; set; }
        public string DeploymentType { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string CRFNumber { get; set; } = string.Empty;
        public string CRFTitle { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string QueuedByName { get; set; } = string.Empty;
        public string VersionNumber { get; set; } = string.Empty;
    }
}
