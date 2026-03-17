using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.CRF
{
    public class CreateCRFRequestDto
    {
        [Required(ErrorMessage = "CRF number is required")]
        [StringLength(50, ErrorMessage = "CRF number cannot exceed 50 characters")]
        public string CRFNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Title is required")]
        [StringLength(500, ErrorMessage = "Title cannot exceed 500 characters")]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Version ID is required")]
        public int VersionId { get; set; }

        [Required(ErrorMessage = "Priority is required")]
        [RegularExpression("^(Low|Medium|High|Critical)$", ErrorMessage = "Invalid priority")]
        public string Priority { get; set; } = "Medium";

        public DateTime? ScheduledDeploymentDate { get; set; }

        public List<int> ClientIds { get; set; } = new List<int>();
    }
}
