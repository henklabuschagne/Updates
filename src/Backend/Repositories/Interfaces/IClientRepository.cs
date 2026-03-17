using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IClientRepository
    {
        Task<IEnumerable<Client>> GetAllAsync(bool includeInactive = false);
        Task<Client?> GetByIdAsync(int clientId);
        Task<int> CreateAsync(string clientName, string contactEmail, string contactPerson, 
            string phone, string address, int? currentVersionId, string status, int createdBy, bool hasCustomizations = false);
        Task<int> UpdateAsync(int clientId, string clientName, string contactEmail, 
            string contactPerson, string phone, string address, string status, bool isActive, bool hasCustomizations);
        Task<int> UpdateVersionAsync(int clientId, int versionId, int updatedBy, string notes);
        Task<int> DeleteAsync(int clientId);
        Task<IEnumerable<ClientVersionHistory>> GetVersionHistoryAsync(int clientId);
        Task<IEnumerable<Client>> GetByVersionAsync(int versionId);
    }
}