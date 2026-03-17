namespace SoftwareUpdateManagement.API.DTOs.CRF
{
    public class DeploymentLogDto
    {
        public int DeploymentLogId { get; set; }
        public int CRFId { get; set; }
        public int? ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string LogType { get; set; } = string.Empty;
        public string LogMessage { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
    }
}
