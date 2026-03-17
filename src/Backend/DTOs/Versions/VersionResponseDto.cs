namespace SoftwareUpdateManagement.API.DTOs.Versions
{
    public class VersionResponseDto
    {
        public int VersionId { get; set; }
        public string VersionNumber { get; set; } = string.Empty;
        public string VersionName { get; set; } = string.Empty;
        public DateTime ReleaseDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ReleaseNotes { get; set; } = string.Empty;
        public bool IsMajorRelease { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int ClientCount { get; set; }
    }
}
