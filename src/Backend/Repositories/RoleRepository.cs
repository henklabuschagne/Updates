using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly string _connectionString;

        public RoleRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<Role>> GetAllAsync()
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<Role>(
                "sp_GetAllRoles",
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<Role?> GetByIdAsync(int roleId)
        {
            using var connection = CreateConnection();
            var sql = "SELECT * FROM Roles WHERE RoleId = @RoleId";
            return await connection.QueryFirstOrDefaultAsync<Role>(sql, new { RoleId = roleId });
        }

        public async Task<Role?> GetByNameAsync(string roleName)
        {
            using var connection = CreateConnection();
            var sql = "SELECT * FROM Roles WHERE RoleName = @RoleName";
            return await connection.QueryFirstOrDefaultAsync<Role>(sql, new { RoleName = roleName });
        }
    }
}
