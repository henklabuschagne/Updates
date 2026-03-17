using SoftwareUpdateManagement.API.DTOs.SystemHealth;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface ISystemHealthRepository
    {
        Task<SystemMetricsDto> GetSystemMetricsAsync();
        Task<List<ServiceStatusDto>> GetServiceStatusesAsync();
        Task<List<MetricHistoryDto>> GetCpuHistoryAsync(int hours);
        Task<List<MetricHistoryDto>> GetMemoryHistoryAsync(int hours);
        Task<DatabaseHealthDto> GetDatabaseHealthAsync();
        Task<ApiHealthDto> GetApiHealthAsync();
    }
}
