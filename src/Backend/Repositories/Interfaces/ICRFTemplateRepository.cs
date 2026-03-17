using SoftwareUpdateManagement.API.DTOs.CRFTemplate;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface ICRFTemplateRepository
    {
        Task<IEnumerable<CRFTemplateDto>> GetAllCRFTemplates();
        Task<CRFTemplateDto?> GetCRFTemplateById(int templateId);
        Task<int> CreateCRFTemplate(CreateCRFTemplateDto template, int createdBy);
        Task<bool> UpdateCRFTemplate(int templateId, UpdateCRFTemplateDto template);
        Task<bool> DeleteCRFTemplate(int templateId);
        Task<CRFTemplateDto?> GetCRFTemplateByName(string templateName);
    }
}
