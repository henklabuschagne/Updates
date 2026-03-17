using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class APIConfigurationRepository : IAPIConfigurationRepository
    {
        private readonly string _connectionString;

        public APIConfigurationRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<APIConfiguration>> GetAllAsync(string? apiType = null)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<APIConfiguration>(
                "sp_GetAllAPIConfigurations",
                new { APIType = apiType },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<APIConfiguration?> GetByIdAsync(int apiConfigurationId)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<APIConfiguration>(
                "sp_GetAPIConfigurationById",
                new { APIConfigurationId = apiConfigurationId },
                commandType: CommandType.StoredProcedure
            );
            return result.FirstOrDefault();
        }

        public async Task<int> CreateAsync(string apiName, string apiType, string httpMethod, 
            string endpointURL, int executionOrder, string headers, string requestBody, 
            int timeoutSeconds, int retryCount, bool isEnabled, string description, int createdBy)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("APIName", apiName);
            parameters.Add("APIType", apiType);
            parameters.Add("HTTPMethod", httpMethod);
            parameters.Add("EndpointURL", endpointURL);
            parameters.Add("ExecutionOrder", executionOrder);
            parameters.Add("Headers", headers);
            parameters.Add("RequestBody", requestBody);
            parameters.Add("TimeoutSeconds", timeoutSeconds);
            parameters.Add("RetryCount", retryCount);
            parameters.Add("IsEnabled", isEnabled);
            parameters.Add("Description", description);
            parameters.Add("CreatedBy", createdBy);
            parameters.Add("APIConfigurationId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_CreateAPIConfiguration",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("APIConfigurationId");
        }

        public async Task<int> UpdateAsync(int apiConfigurationId, string apiName, string httpMethod, 
            string endpointURL, int executionOrder, string headers, string requestBody, 
            int timeoutSeconds, int retryCount, bool isEnabled, string description)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateAPIConfiguration",
                new { 
                    APIConfigurationId = apiConfigurationId,
                    APIName = apiName,
                    HTTPMethod = httpMethod,
                    EndpointURL = endpointURL,
                    ExecutionOrder = executionOrder,
                    Headers = headers,
                    RequestBody = requestBody,
                    TimeoutSeconds = timeoutSeconds,
                    RetryCount = retryCount,
                    IsEnabled = isEnabled,
                    Description = description
                },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> DeleteAsync(int apiConfigurationId)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_DeleteAPIConfiguration",
                new { APIConfigurationId = apiConfigurationId },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> ToggleAsync(int apiConfigurationId, bool isEnabled)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_ToggleAPIConfiguration",
                new { APIConfigurationId = apiConfigurationId, IsEnabled = isEnabled },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<IEnumerable<APIExecutionLog>> GetExecutionLogsAsync(int? crfId = null, 
            int? clientId = null, string? status = null, int top = 100)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<APIExecutionLog>(
                "sp_GetAPIExecutionLogs",
                new { CRFId = crfId, ClientId = clientId, Status = status, Top = top },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<int> AddExecutionLogAsync(int crfId, int? clientId, int apiConfigurationId, 
            string executionType, string requestURL, string requestHeaders, string requestBody, 
            int? responseStatusCode, string responseBody, DateTime executionStartTime, 
            DateTime? executionEndTime, int? durationMs, string status, string errorMessage, 
            int retryAttempt)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("CRFId", crfId);
            parameters.Add("ClientId", clientId);
            parameters.Add("APIConfigurationId", apiConfigurationId);
            parameters.Add("ExecutionType", executionType);
            parameters.Add("RequestURL", requestURL);
            parameters.Add("RequestHeaders", requestHeaders);
            parameters.Add("RequestBody", requestBody);
            parameters.Add("ResponseStatusCode", responseStatusCode);
            parameters.Add("ResponseBody", responseBody);
            parameters.Add("ExecutionStartTime", executionStartTime);
            parameters.Add("ExecutionEndTime", executionEndTime);
            parameters.Add("DurationMs", durationMs);
            parameters.Add("Status", status);
            parameters.Add("ErrorMessage", errorMessage);
            parameters.Add("RetryAttempt", retryAttempt);
            parameters.Add("APIExecutionLogId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_AddAPIExecutionLog",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("APIExecutionLogId");
        }
    }
}
