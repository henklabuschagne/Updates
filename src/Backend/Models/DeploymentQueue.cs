namespace SoftwareUpdateManagement.API.Models
{
    public class DeploymentQueue
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
        public string? Notes { get; set; }
        public string? CRFNumber { get; set; }
        public string? CRFTitle { get; set; }
        public string? ClientName { get; set; }
        public string? QueuedByName { get; set; }
        public string? VersionNumber { get; set; }
    }
}
