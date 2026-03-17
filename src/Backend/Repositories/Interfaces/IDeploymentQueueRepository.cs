using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IDeploymentQueueRepository
    {
        Task<IEnumerable<DeploymentQueue>> GetAllAsync(string? status = null);
        Task<DeploymentQueue?> GetByIdAsync(int deploymentQueueId);
        Task<int> AddToQueueAsync(int crfId, int clientId, int queuedBy, DateTime? scheduledStartTime, 
            int priority, string deploymentType, string notes);
        Task<int> UpdateStatusAsync(int deploymentQueueId, string status, string notes);
        Task<int> CancelAsync(int deploymentQueueId, string notes);
        Task<DeploymentQueue?> GetNextQueuedAsync();
    }
}
