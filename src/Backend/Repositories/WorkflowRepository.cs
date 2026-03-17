using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class WorkflowRepository : IWorkflowRepository
    {
        private readonly string _connectionString;

        public WorkflowRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<WorkflowStep>> GetAllStepsAsync()
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<WorkflowStep>(
                "sp_GetAllWorkflowSteps",
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<int> CreateStepAsync(string stepName, int stepOrder, bool isRequired)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("StepName", stepName);
            parameters.Add("StepOrder", stepOrder);
            parameters.Add("IsRequired", isRequired);
            parameters.Add("WorkflowStepId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_CreateWorkflowStep",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("WorkflowStepId");
        }

        public async Task<int> UpdateStepAsync(int workflowStepId, string stepName, bool isRequired)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateWorkflowStep",
                new { WorkflowStepId = workflowStepId, StepName = stepName, IsRequired = isRequired },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> DeleteStepAsync(int workflowStepId)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_DeleteWorkflowStep",
                new { WorkflowStepId = workflowStepId },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<int> ReorderStepAsync(int workflowStepId, int newStepOrder)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_ReorderWorkflowSteps",
                new { WorkflowStepId = workflowStepId, NewStepOrder = newStepOrder },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }
    }
}
