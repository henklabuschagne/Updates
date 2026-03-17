using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class DeploymentQueueRepository : IDeploymentQueueRepository
    {
        private readonly string _connectionString;

        public DeploymentQueueRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<DeploymentQueue>> GetAllAsync(string? status = null)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<DeploymentQueue>(
                "sp_GetAllDeploymentQueueItems",
                new { Status = status },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<DeploymentQueue?> GetByIdAsync(int deploymentQueueId)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<DeploymentQueue>(
                "sp_GetDeploymentQueueItemById",
                new { DeploymentQueueId = deploymentQueueId },
                commandType: CommandType.StoredProcedure
            );
            return result.FirstOrDefault();
        }

        public async Task<int> AddToQueueAsync(int crfId, int clientId, int queuedBy, 
            DateTime? scheduledStartTime, int priority, string deploymentType, string notes)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("CRFId", crfId);
            parameters.Add("ClientId", clientId);
            parameters.Add("QueuedBy", queuedBy);
            parameters.Add("ScheduledStartTime", scheduledStartTime);
            parameters.Add("Priority", priority);
            parameters.Add("DeploymentType", deploymentType);
            parameters.Add("Notes", notes);
            parameters.Add("DeploymentQueueId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_AddToDeploymentQueue",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("DeploymentQueueId");
        }

        public async Task<int> UpdateStatusAsync(int deploymentQueueId, string status, string notes)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateDeploymentQueueStatus",
                new { DeploymentQueueId = deploymentQueueId, Status = status, Notes = notes },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> CancelAsync(int deploymentQueueId, string notes)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_CancelDeployment",
                new { DeploymentQueueId = deploymentQueueId, Notes = notes },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<DeploymentQueue?> GetNextQueuedAsync()
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<DeploymentQueue>(
                "sp_GetNextQueuedDeployment",
                commandType: CommandType.StoredProcedure
            );
            return result.FirstOrDefault();
        }
    }
}
