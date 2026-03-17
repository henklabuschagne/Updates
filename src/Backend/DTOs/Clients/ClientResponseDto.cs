namespace SoftwareUpdateManagement.API.DTOs.Clients
{
    public class ClientResponseDto
    {
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int? CurrentVersionId { get; set; }
        public string CurrentVersion { get; set; } = string.Empty;
        public string CurrentVersionName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? LastUpdateDate { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsActive { get; set; }
        public bool HasCustomizations { get; set; }  // NEW: Prevents auto-update if true
    }
}