using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Clients
{
    public class UpdateClientRequestDto
    {
        [Required(ErrorMessage = "Client name is required")]
        [StringLength(255, ErrorMessage = "Client name cannot exceed 255 characters")]
        public string ClientName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contact email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string ContactEmail { get; set; } = string.Empty;

        [StringLength(255, ErrorMessage = "Contact person cannot exceed 255 characters")]
        public string ContactPerson { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Invalid phone number")]
        [StringLength(50, ErrorMessage = "Phone cannot exceed 50 characters")]
        public string Phone { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("^(Active|Inactive|Pending|Suspended)$", ErrorMessage = "Invalid status")]
        public string Status { get; set; } = "Active";

        public bool IsActive { get; set; } = true;

        public bool HasCustomizations { get; set; }  // NEW: Prevents auto-update if true
    }
}