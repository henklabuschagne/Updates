using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IVersionRepository
    {
        Task<IEnumerable<SoftwareVersion>> GetAllAsync(bool includeInactive = false);
        Task<SoftwareVersion?> GetByIdAsync(int versionId);
        Task<int> CreateAsync(string versionNumber, string versionName, DateTime releaseDate, 
            string description, string releaseNotes, bool isMajorRelease, int createdBy);
        Task<int> UpdateAsync(int versionId, string versionNumber, string versionName, 
            DateTime releaseDate, string description, string releaseNotes, bool isMajorRelease, bool isActive);
        Task<int> DeleteAsync(int versionId);
    }
}
