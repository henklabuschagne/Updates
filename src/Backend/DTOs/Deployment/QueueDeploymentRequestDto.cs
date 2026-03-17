using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Deployment
{
    public class QueueDeploymentRequestDto
    {
        [Required(ErrorMessage = "CRF ID is required")]
        public int CRFId { get; set; }

        [Required(ErrorMessage = "Client ID is required")]
        public int ClientId { get; set; }

        public DateTime? ScheduledStartTime { get; set; }

        [Range(1, 10, ErrorMessage = "Priority must be between 1 and 10")]
        public int Priority { get; set; } = 5;

        [Required(ErrorMessage = "Deployment type is required")]
        [RegularExpression("^(Automatic|Manual)$", ErrorMessage = "Invalid deployment type")]
        public string DeploymentType { get; set; } = "Automatic";

        public string Notes { get; set; } = string.Empty;
    }
}
