using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Error
{
    public class CreateErrorNotificationRequestDto
    {
        public int? CRFId { get; set; }

        public int? ClientId { get; set; }

        [Required(ErrorMessage = "Error type is required")]
        [RegularExpression("^(Deployment|Rollback|API|Database|System|Validation)$", ErrorMessage = "Invalid error type")]
        public string ErrorType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Error source is required")]
        [StringLength(255, ErrorMessage = "Error source cannot exceed 255 characters")]
        public string ErrorSource { get; set; } = string.Empty;

        [Required(ErrorMessage = "Error message is required")]
        public string ErrorMessage { get; set; } = string.Empty;

        public string StackTrace { get; set; } = string.Empty;

        [Required(ErrorMessage = "Severity is required")]
        [RegularExpression("^(Info|Warning|Error|Critical)$", ErrorMessage = "Invalid severity")]
        public string Severity { get; set; } = "Error";
    }
}
