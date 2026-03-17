namespace SoftwareUpdateManagement.API.DTOs.CRFTemplate
{
    public class CreateCRFTemplateDto
    {
        public string TemplateName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CRFNumberPrefix { get; set; } = string.Empty;
        public string DefaultTitle { get; set; } = string.Empty;
        public string DefaultDescription { get; set; } = string.Empty;
        public string DefaultPriority { get; set; } = string.Empty;
    }
}
