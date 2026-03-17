using SoftwareUpdateManagement.API.DTOs.BulkOperations;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IBulkOperationRepository
    {
        Task<BulkOperationPagedResponse> GetAllBulkOperations(
            int? initiatedBy = null,
            string? status = null,
            string? operationType = null,
            int pageNumber = 1,
            int pageSize = 50);

        Task<BulkOperationDto?> GetBulkOperationById(int bulkOperationId);

        Task<BulkOperationDto> CreateBulkOperation(
            string operationType,
            int initiatedBy,
            int totalItems,
            string inputData);

        Task<bool> UpdateBulkOperationProgress(
            int bulkOperationId,
            int processedItems,
            int successfulItems,
            int failedItems,
            string status);

        Task<bool> CompleteBulkOperation(
            int bulkOperationId,
            string status,
            string? resultData,
            string? errorMessage);

        Task<BulkOperationStatisticsDto> GetBulkOperationStatistics(
            DateTime? startDate = null,
            DateTime? endDate = null);
    }
}
