namespace SoftwareUpdateManagement.API.Models
{
    public class APIConfiguration
    {
        public int APIConfigurationId { get; set; }
        public string APIName { get; set; } = string.Empty;
        public string APIType { get; set; } = string.Empty;
        public string HTTPMethod { get; set; } = string.Empty;
        public string EndpointURL { get; set; } = string.Empty;
        public int ExecutionOrder { get; set; }
        public string? Headers { get; set; }
        public string? RequestBody { get; set; }
        public int TimeoutSeconds { get; set; }
        public int RetryCount { get; set; }
        public bool IsEnabled { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public string? CreatedByName { get; set; }
    }
}
