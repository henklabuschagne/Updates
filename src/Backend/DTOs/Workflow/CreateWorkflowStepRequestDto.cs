using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Workflow
{
    public class CreateWorkflowStepRequestDto
    {
        [Required(ErrorMessage = "Step name is required")]
        [StringLength(255, ErrorMessage = "Step name cannot exceed 255 characters")]
        public string StepName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Step order is required")]
        [Range(1, 100, ErrorMessage = "Step order must be between 1 and 100")]
        public int StepOrder { get; set; }

        public bool IsRequired { get; set; } = true;
    }
}
