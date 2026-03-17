using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface ICRFRepository
    {
        Task<IEnumerable<CRF>> GetAllAsync(string? status = null);
        Task<CRF?> GetByIdAsync(int crfId);
        Task<int> CreateAsync(string crfNumber, string title, string description, int versionId, 
            int requestedBy, string priority, DateTime? scheduledDeploymentDate);
        Task<int> UpdateAsync(int crfId, string title, string description, string priority, 
            DateTime? scheduledDeploymentDate);
        Task<int> UpdateStatusAsync(int crfId, string status);
        Task<int> DeleteAsync(int crfId);
        Task<int> AddClientsAsync(int crfId, string clientIds);
        Task<IEnumerable<CRFClient>> GetCRFClientsAsync(int crfId);
        Task<IEnumerable<CRFApproval>> GetCRFApprovalsAsync(int crfId);
        Task<int> UpdateApprovalAsync(int crfApprovalId, int approverUserId, string status, string comments);
        Task<IEnumerable<DeploymentLog>> GetDeploymentLogsAsync(int crfId, int? clientId = null);
        Task<int> AddDeploymentLogAsync(int crfId, int? clientId, string logType, string logMessage, 
            string severity, int createdBy);
    }
}
