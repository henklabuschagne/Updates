using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.CRF
{
    public class UpdateCRFRequestDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(500, ErrorMessage = "Title cannot exceed 500 characters")]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Priority is required")]
        [RegularExpression("^(Low|Medium|High|Critical)$", ErrorMessage = "Invalid priority")]
        public string Priority { get; set; } = "Medium";

        public DateTime? ScheduledDeploymentDate { get; set; }
    }
}
