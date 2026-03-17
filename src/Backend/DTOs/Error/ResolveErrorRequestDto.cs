using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Error
{
    public class ResolveErrorRequestDto
    {
        [Required(ErrorMessage = "Resolution notes are required")]
        [StringLength(1000, ErrorMessage = "Resolution notes cannot exceed 1000 characters")]
        public string ResolutionNotes { get; set; } = string.Empty;
    }
}
