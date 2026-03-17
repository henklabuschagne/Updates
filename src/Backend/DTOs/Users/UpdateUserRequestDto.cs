using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Users
{
    public class UpdateUserRequestDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "First name is required")]
        [StringLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
        public string LastName { get; set; } = string.Empty;

        [StringLength(255, ErrorMessage = "Company name cannot exceed 255 characters")]
        public string Company { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}
