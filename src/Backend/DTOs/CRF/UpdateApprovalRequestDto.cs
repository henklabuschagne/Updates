using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.CRF
{
    public class UpdateApprovalRequestDto
    {
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("^(Approved|Rejected)$", ErrorMessage = "Invalid status")]
        public string Status { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Comments cannot exceed 1000 characters")]
        public string Comments { get; set; } = string.Empty;
    }
}
