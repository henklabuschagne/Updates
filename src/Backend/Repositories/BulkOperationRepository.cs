using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SoftwareUpdateManagement.API.DTOs.BulkOperations;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class BulkOperationRepository : IBulkOperationRepository
    {
        private readonly string _connectionString;

        public BulkOperationRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<BulkOperationPagedResponse> GetAllBulkOperations(
            int? initiatedBy = null,
            string? status = null,
            string? operationType = null,
            int pageNumber = 1,
            int pageSize = 50)
        {
            var operations = new List<BulkOperationDto>();
            int totalCount = 0;

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetAllBulkOperations", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@InitiatedBy", initiatedBy ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Status", status ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@OperationType", operationType ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@PageNumber", pageNumber);
                    command.Parameters.AddWithValue("@PageSize", pageSize);

                    var totalCountParam = new SqlParameter("@TotalCount", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    command.Parameters.Add(totalCountParam);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            operations.Add(MapBulkOperationDto(reader));
                        }
                    }

                    totalCount = (int)totalCountParam.Value;
                }
            }

            return new BulkOperationPagedResponse
            {
                Operations = operations,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<BulkOperationDto?> GetBulkOperationById(int bulkOperationId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetBulkOperationById", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@BulkOperationId", bulkOperationId);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapBulkOperationDto(reader);
                        }
                    }
                }
            }

            return null;
        }

        public async Task<BulkOperationDto> CreateBulkOperation(
            string operationType,
            int initiatedBy,
            int totalItems,
            string inputData)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_CreateBulkOperation", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@OperationType", operationType);
                    command.Parameters.AddWithValue("@InitiatedBy", initiatedBy);
                    command.Parameters.AddWithValue("@TotalItems", totalItems);
                    command.Parameters.AddWithValue("@InputData", inputData);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapBulkOperationDto(reader);
                        }
                    }
                }
            }

            throw new Exception("Failed to create bulk operation");
        }

        public async Task<bool> UpdateBulkOperationProgress(
            int bulkOperationId,
            int processedItems,
            int successfulItems,
            int failedItems,
            string status)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_UpdateBulkOperationProgress", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@BulkOperationId", bulkOperationId);
                    command.Parameters.AddWithValue("@ProcessedItems", processedItems);
                    command.Parameters.AddWithValue("@SuccessfulItems", successfulItems);
                    command.Parameters.AddWithValue("@FailedItems", failedItems);
                    command.Parameters.AddWithValue("@Status", status);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                    return true;
                }
            }
        }

        public async Task<bool> CompleteBulkOperation(
            int bulkOperationId,
            string status,
            string? resultData,
            string? errorMessage)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_CompleteBulkOperation", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@BulkOperationId", bulkOperationId);
                    command.Parameters.AddWithValue("@Status", status);
                    command.Parameters.AddWithValue("@ResultData", resultData ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@ErrorMessage", errorMessage ?? (object)DBNull.Value);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                    return true;
                }
            }
        }

        public async Task<BulkOperationStatisticsDto> GetBulkOperationStatistics(
            DateTime? startDate = null,
            DateTime? endDate = null)
        {
            var statistics = new BulkOperationStatisticsDto
            {
                StartDate = startDate,
                EndDate = endDate
            };

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetBulkOperationStatistics", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@StartDate", startDate ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EndDate", endDate ?? (object)DBNull.Value);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Summary statistics
                        if (await reader.ReadAsync())
                        {
                            statistics.TotalOperations = reader.GetInt32(reader.GetOrdinal("TotalOperations"));
                            statistics.CompletedOperations = reader.GetInt32(reader.GetOrdinal("CompletedOperations"));
                            statistics.FailedOperations = reader.GetInt32(reader.GetOrdinal("FailedOperations"));
                            statistics.InProgressOperations = reader.GetInt32(reader.GetOrdinal("InProgressOperations"));
                            statistics.TotalItemsProcessed = reader.GetInt32(reader.GetOrdinal("TotalItemsProcessed"));
                            statistics.TotalSuccessfulItems = reader.GetInt32(reader.GetOrdinal("TotalSuccessfulItems"));
                            statistics.TotalFailedItems = reader.GetInt32(reader.GetOrdinal("TotalFailedItems"));
                            statistics.AverageSuccessRate = reader.GetDecimal(reader.GetOrdinal("AverageSuccessRate"));
                        }

                        // Second result set: Operations by type
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var operationType = reader.GetString(reader.GetOrdinal("OperationType"));
                                var count = reader.GetInt32(reader.GetOrdinal("OperationCount"));
                                statistics.OperationsByType[operationType] = count;
                            }
                        }
                    }
                }
            }

            return statistics;
        }

        private BulkOperationDto MapBulkOperationDto(SqlDataReader reader)
        {
            return new BulkOperationDto
            {
                BulkOperationId = reader.GetInt32(reader.GetOrdinal("BulkOperationId")),
                OperationType = reader.GetString(reader.GetOrdinal("OperationType")),
                InitiatedBy = reader.GetInt32(reader.GetOrdinal("InitiatedBy")),
                InitiatedByName = reader.GetString(reader.GetOrdinal("InitiatedByName")),
                InitiatedAt = reader.GetDateTime(reader.GetOrdinal("InitiatedAt")),
                CompletedAt = reader.IsDBNull(reader.GetOrdinal("CompletedAt"))
                    ? null : reader.GetDateTime(reader.GetOrdinal("CompletedAt")),
                Status = reader.GetString(reader.GetOrdinal("Status")),
                TotalItems = reader.GetInt32(reader.GetOrdinal("TotalItems")),
                ProcessedItems = reader.GetInt32(reader.GetOrdinal("ProcessedItems")),
                SuccessfulItems = reader.GetInt32(reader.GetOrdinal("SuccessfulItems")),
                FailedItems = reader.GetInt32(reader.GetOrdinal("FailedItems")),
                ErrorMessage = reader.IsDBNull(reader.GetOrdinal("ErrorMessage"))
                    ? null : reader.GetString(reader.GetOrdinal("ErrorMessage")),
                ResultData = reader.IsDBNull(reader.GetOrdinal("ResultData"))
                    ? null : reader.GetString(reader.GetOrdinal("ResultData")),
                InputData = reader.IsDBNull(reader.GetOrdinal("InputData"))
                    ? null : reader.GetString(reader.GetOrdinal("InputData"))
            };
        }
    }
}
