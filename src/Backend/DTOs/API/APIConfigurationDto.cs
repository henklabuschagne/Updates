namespace SoftwareUpdateManagement.API.DTOs.API
{
    public class APIConfigurationDto
    {
        public int APIConfigurationId { get; set; }
        public string APIName { get; set; } = string.Empty;
        public string APIType { get; set; } = string.Empty;
        public string HTTPMethod { get; set; } = string.Empty;
        public string EndpointURL { get; set; } = string.Empty;
        public int ExecutionOrder { get; set; }
        public string Headers { get; set; } = string.Empty;
        public string RequestBody { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; }
        public int RetryCount { get; set; }
        public bool IsEnabled { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
    }
}
