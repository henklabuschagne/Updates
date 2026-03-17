using System.ComponentModel.DataAnnotations;

namespace SoftwareUpdateManagement.API.DTOs.Versions
{
    public class UpdateVersionRequestDto
    {
        [Required(ErrorMessage = "Version number is required")]
        [RegularExpression(@"^\d+\.\d+\.\d+$", ErrorMessage = "Version number must be in format X.Y.Z")]
        public string VersionNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Version name is required")]
        [StringLength(255, ErrorMessage = "Version name cannot exceed 255 characters")]
        public string VersionName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Release date is required")]
        public DateTime ReleaseDate { get; set; }

        [StringLength(4000, ErrorMessage = "Description cannot exceed 4000 characters")]
        public string Description { get; set; } = string.Empty;

        public string ReleaseNotes { get; set; } = string.Empty;

        public bool IsMajorRelease { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
