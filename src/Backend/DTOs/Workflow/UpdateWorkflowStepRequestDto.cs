using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Workflow
{
    public class UpdateWorkflowStepRequestDto
    {
        [Required(ErrorMessage = "Step name is required")]
        [StringLength(255, ErrorMessage = "Step name cannot exceed 255 characters")]
        public string StepName { get; set; } = string.Empty;

        public bool IsRequired { get; set; } = true;
    }
}
