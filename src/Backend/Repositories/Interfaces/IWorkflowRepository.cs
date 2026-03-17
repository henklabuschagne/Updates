using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IWorkflowRepository
    {
        Task<IEnumerable<WorkflowStep>> GetAllStepsAsync();
        Task<int> CreateStepAsync(string stepName, int stepOrder, bool isRequired);
        Task<int> UpdateStepAsync(int workflowStepId, string stepName, bool isRequired);
        Task<int> DeleteStepAsync(int workflowStepId);
        Task<int> ReorderStepAsync(int workflowStepId, int newStepOrder);
    }
}
