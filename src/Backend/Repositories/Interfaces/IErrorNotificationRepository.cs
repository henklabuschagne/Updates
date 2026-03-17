using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IErrorNotificationRepository
    {
        Task<IEnumerable<ErrorNotification>> GetAllAsync(bool? isResolved = null, string? severity = null, 
            string? errorType = null);
        Task<ErrorNotification?> GetByIdAsync(int errorNotificationId);
        Task<int> CreateAsync(int? crfId, int? clientId, string errorType, string errorSource, 
            string errorMessage, string stackTrace, string severity);
        Task<int> ResolveAsync(int errorNotificationId, int resolvedBy, string resolutionNotes);
        Task<int> MarkNotificationSentAsync(int errorNotificationId);
    }
}
