namespace SoftwareUpdateManagement.API.DTOs.CRFTemplate
{
    public class CRFTemplateDto
    {
        public int CRFTemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CRFNumberPrefix { get; set; } = string.Empty;
        public string DefaultTitle { get; set; } = string.Empty;
        public string DefaultDescription { get; set; } = string.Empty;
        public string DefaultPriority { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int UsageCount { get; set; }
    }
}
