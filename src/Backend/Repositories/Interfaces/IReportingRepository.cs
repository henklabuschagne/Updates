using SoftwareUpdateManagement.API.DTOs.Reporting;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IReportingRepository
    {
        Task<DeploymentReportDto> GetDeploymentReport(DateTime startDate, DateTime endDate);
        Task<CRFReportDto> GetCRFReport(DateTime startDate, DateTime endDate);
        Task<ClientReportDto> GetClientReport();
        Task<SystemPerformanceReportDto> GetSystemPerformanceReport(DateTime startDate, DateTime endDate);
    }
}
