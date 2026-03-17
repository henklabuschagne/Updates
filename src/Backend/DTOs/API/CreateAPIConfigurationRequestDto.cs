using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.API
{
    public class CreateAPIConfigurationRequestDto
    {
        [Required(ErrorMessage = "API name is required")]
        [StringLength(255, ErrorMessage = "API name cannot exceed 255 characters")]
        public string APIName { get; set; } = string.Empty;

        [Required(ErrorMessage = "API type is required")]
        [RegularExpression("^(Deployment|Rollback)$", ErrorMessage = "Invalid API type")]
        public string APIType { get; set; } = string.Empty;

        [Required(ErrorMessage = "HTTP method is required")]
        [RegularExpression("^(GET|POST|PUT|PATCH|DELETE)$", ErrorMessage = "Invalid HTTP method")]
        public string HTTPMethod { get; set; } = string.Empty;

        [Required(ErrorMessage = "Endpoint URL is required")]
        [StringLength(1000, ErrorMessage = "Endpoint URL cannot exceed 1000 characters")]
        public string EndpointURL { get; set; } = string.Empty;

        [Required(ErrorMessage = "Execution order is required")]
        [Range(1, 100, ErrorMessage = "Execution order must be between 1 and 100")]
        public int ExecutionOrder { get; set; }

        public string Headers { get; set; } = string.Empty;

        public string RequestBody { get; set; } = string.Empty;

        [Range(1, 3600, ErrorMessage = "Timeout must be between 1 and 3600 seconds")]
        public int TimeoutSeconds { get; set; } = 300;

        [Range(0, 10, ErrorMessage = "Retry count must be between 0 and 10")]
        public int RetryCount { get; set; } = 3;

        public bool IsEnabled { get; set; } = true;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;
    }
}
