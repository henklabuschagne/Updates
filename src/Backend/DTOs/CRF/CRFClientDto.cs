namespace SoftwareUpdateManagement.API.DTOs.CRF
{
    public class CRFClientDto
    {
        public int CRFClientId { get; set; }
        public int CRFId { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string CurrentVersion { get; set; } = string.Empty;
        public string CurrentVersionName { get; set; } = string.Empty;
        public string DeploymentStatus { get; set; } = string.Empty;
        public DateTime? DeploymentDate { get; set; }
        public string DeploymentNotes { get; set; } = string.Empty;
    }
}
