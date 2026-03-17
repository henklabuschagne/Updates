using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IAPIConfigurationRepository
    {
        Task<IEnumerable<APIConfiguration>> GetAllAsync(string? apiType = null);
        Task<APIConfiguration?> GetByIdAsync(int apiConfigurationId);
        Task<int> CreateAsync(string apiName, string apiType, string httpMethod, string endpointURL, 
            int executionOrder, string headers, string requestBody, int timeoutSeconds, int retryCount, 
            bool isEnabled, string description, int createdBy);
        Task<int> UpdateAsync(int apiConfigurationId, string apiName, string httpMethod, string endpointURL, 
            int executionOrder, string headers, string requestBody, int timeoutSeconds, int retryCount, 
            bool isEnabled, string description);
        Task<int> DeleteAsync(int apiConfigurationId);
        Task<int> ToggleAsync(int apiConfigurationId, bool isEnabled);
        Task<IEnumerable<APIExecutionLog>> GetExecutionLogsAsync(int? crfId = null, int? clientId = null, 
            string? status = null, int top = 100);
        Task<int> AddExecutionLogAsync(int crfId, int? clientId, int apiConfigurationId, string executionType, 
            string requestURL, string requestHeaders, string requestBody, int? responseStatusCode, 
            string responseBody, DateTime executionStartTime, DateTime? executionEndTime, int? durationMs, 
            string status, string errorMessage, int retryAttempt);
    }
}
