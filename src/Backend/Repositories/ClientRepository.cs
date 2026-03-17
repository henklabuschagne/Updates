using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly string _connectionString;

        public ClientRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<Client>> GetAllAsync(bool includeInactive = false)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<Client>(
                "sp_GetAllClients",
                new { IncludeInactive = includeInactive },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<Client?> GetByIdAsync(int clientId)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<Client>(
                "sp_GetClientById",
                new { ClientId = clientId },
                commandType: CommandType.StoredProcedure
            );
            return result.FirstOrDefault();
        }

        public async Task<int> CreateAsync(string clientName, string contactEmail, string contactPerson, 
            string phone, string address, int? currentVersionId, string status, int createdBy, bool hasCustomizations = false)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("ClientName", clientName);
            parameters.Add("ContactEmail", contactEmail);
            parameters.Add("ContactPerson", contactPerson);
            parameters.Add("Phone", phone);
            parameters.Add("Address", address);
            parameters.Add("CurrentVersionId", currentVersionId);
            parameters.Add("Status", status);
            parameters.Add("CreatedBy", createdBy);
            parameters.Add("HasCustomizations", hasCustomizations);  // NEW PARAMETER
            parameters.Add("ClientId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_CreateClient",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("ClientId");
        }

        public async Task<int> UpdateAsync(int clientId, string clientName, string contactEmail, 
            string contactPerson, string phone, string address, string status, bool isActive, bool hasCustomizations)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateClient",
                new { 
                    ClientId = clientId, 
                    ClientName = clientName, 
                    ContactEmail = contactEmail, 
                    ContactPerson = contactPerson, 
                    Phone = phone, 
                    Address = address, 
                    Status = status, 
                    IsActive = isActive,
                    HasCustomizations = hasCustomizations  // NEW PARAMETER
                },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }

        public async Task<int> UpdateVersionAsync(int clientId, int versionId, int updatedBy, string notes)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateClientVersion",
                new { 
                    ClientId = clientId, 
                    VersionId = versionId, 
                    UpdatedBy = updatedBy, 
                    Notes = notes 
                },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }

        public async Task<int> DeleteAsync(int clientId)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_DeleteClient",
                new { ClientId = clientId },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }

        public async Task<IEnumerable<ClientVersionHistory>> GetVersionHistoryAsync(int clientId)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<ClientVersionHistory>(
                "sp_GetClientVersionHistory",
                new { ClientId = clientId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<Client>> GetByVersionAsync(int versionId)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<Client>(
                "sp_GetClientsByVersion",
                new { VersionId = versionId },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}