namespace SoftwareUpdateManagement.API.DTOs.Clients
{
    public class ClientVersionHistoryDto
    {
        public int ClientVersionId { get; set; }
        public int ClientId { get; set; }
        public int VersionId { get; set; }
        public string VersionNumber { get; set; } = string.Empty;
        public string VersionName { get; set; } = string.Empty;
        public DateTime AssignedDate { get; set; }
        public int UpdatedBy { get; set; }
        public string UpdatedByName { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public bool IsCurrentVersion { get; set; }
    }
}
