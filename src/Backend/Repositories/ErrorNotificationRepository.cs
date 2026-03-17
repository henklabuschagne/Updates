using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class ErrorNotificationRepository : IErrorNotificationRepository
    {
        private readonly string _connectionString;

        public ErrorNotificationRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<ErrorNotification>> GetAllAsync(bool? isResolved = null, 
            string? severity = null, string? errorType = null)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<ErrorNotification>(
                "sp_GetAllErrorNotifications",
                new { IsResolved = isResolved, Severity = severity, ErrorType = errorType },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<ErrorNotification?> GetByIdAsync(int errorNotificationId)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<ErrorNotification>(
                "sp_GetErrorNotificationById",
                new { ErrorNotificationId = errorNotificationId },
                commandType: CommandType.StoredProcedure
            );
            return result.FirstOrDefault();
        }

        public async Task<int> CreateAsync(int? crfId, int? clientId, string errorType, 
            string errorSource, string errorMessage, string stackTrace, string severity)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("CRFId", crfId);
            parameters.Add("ClientId", clientId);
            parameters.Add("ErrorType", errorType);
            parameters.Add("ErrorSource", errorSource);
            parameters.Add("ErrorMessage", errorMessage);
            parameters.Add("StackTrace", stackTrace);
            parameters.Add("Severity", severity);
            parameters.Add("ErrorNotificationId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_CreateErrorNotification",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("ErrorNotificationId");
        }

        public async Task<int> ResolveAsync(int errorNotificationId, int resolvedBy, string resolutionNotes)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_ResolveErrorNotification",
                new { 
                    ErrorNotificationId = errorNotificationId, 
                    ResolvedBy = resolvedBy, 
                    ResolutionNotes = resolutionNotes 
                },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> MarkNotificationSentAsync(int errorNotificationId)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_MarkNotificationSent",
                new { ErrorNotificationId = errorNotificationId },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }
    }
}
