using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class CRFRepository : ICRFRepository
    {
        private readonly string _connectionString;

        public CRFRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<CRF>> GetAllAsync(string? status = null)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<CRF>(
                "sp_GetAllCRFs",
                new { Status = status },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<CRF?> GetByIdAsync(int crfId)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<CRF>(
                "sp_GetCRFById",
                new { CRFId = crfId },
                commandType: CommandType.StoredProcedure
            );
            return result.FirstOrDefault();
        }

        public async Task<int> CreateAsync(string crfNumber, string title, string description, 
            int versionId, int requestedBy, string priority, DateTime? scheduledDeploymentDate)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("CRFNumber", crfNumber);
            parameters.Add("Title", title);
            parameters.Add("Description", description);
            parameters.Add("VersionId", versionId);
            parameters.Add("RequestedBy", requestedBy);
            parameters.Add("Priority", priority);
            parameters.Add("ScheduledDeploymentDate", scheduledDeploymentDate);
            parameters.Add("CRFId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_CreateCRF",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("CRFId");
        }

        public async Task<int> UpdateAsync(int crfId, string title, string description, 
            string priority, DateTime? scheduledDeploymentDate)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateCRF",
                new { 
                    CRFId = crfId, 
                    Title = title, 
                    Description = description, 
                    Priority = priority, 
                    ScheduledDeploymentDate = scheduledDeploymentDate 
                },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> UpdateStatusAsync(int crfId, string status)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateCRFStatus",
                new { CRFId = crfId, Status = status },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> DeleteAsync(int crfId)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_DeleteCRF",
                new { CRFId = crfId },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> AddClientsAsync(int crfId, string clientIds)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_AddClientsToCRF",
                new { CRFId = crfId, ClientIds = clientIds },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<IEnumerable<CRFClient>> GetCRFClientsAsync(int crfId)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<CRFClient>(
                "sp_GetCRFClients",
                new { CRFId = crfId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<CRFApproval>> GetCRFApprovalsAsync(int crfId)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<CRFApproval>(
                "sp_GetCRFApprovals",
                new { CRFId = crfId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<int> UpdateApprovalAsync(int crfApprovalId, int approverUserId, 
            string status, string comments)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateCRFApproval",
                new { 
                    CRFApprovalId = crfApprovalId, 
                    ApproverUserId = approverUserId, 
                    Status = status, 
                    Comments = comments 
                },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<IEnumerable<DeploymentLog>> GetDeploymentLogsAsync(int crfId, int? clientId = null)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<DeploymentLog>(
                "sp_GetDeploymentLogs",
                new { CRFId = crfId, ClientId = clientId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<int> AddDeploymentLogAsync(int crfId, int? clientId, string logType, 
            string logMessage, string severity, int createdBy)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_AddDeploymentLog",
                new { 
                    CRFId = crfId, 
                    ClientId = clientId, 
                    LogType = logType, 
                    LogMessage = logMessage, 
                    Severity = severity, 
                    CreatedBy = createdBy 
                },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }
    }
}
