using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Clients
{
    public class UpdateClientVersionRequestDto
    {
        [Required(ErrorMessage = "Version ID is required")]
        public int VersionId { get; set; }

        [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
        public string Notes { get; set; } = string.Empty;
    }
}
