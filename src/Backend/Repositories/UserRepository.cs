using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<User?> GetByUsernameAsync(string username)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<User>(
                "sp_GetUserByUsername",
                new { Username = username },
                commandType: CommandType.StoredProcedure
            );
            
            return result.FirstOrDefault();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<User>(
                "sp_GetUserByEmail",
                new { Email = email },
                commandType: CommandType.StoredProcedure
            );
            
            return result.FirstOrDefault();
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<User>(
                "sp_GetUserById",
                new { UserId = userId },
                commandType: CommandType.StoredProcedure
            );
            
            return result.FirstOrDefault();
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<User>(
                "sp_GetAllUsers",
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<int> CreateAsync(string username, string email, string passwordHash, 
            string firstName, string lastName, string company, int roleId)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("Username", username);
            parameters.Add("Email", email);
            parameters.Add("PasswordHash", passwordHash);
            parameters.Add("FirstName", firstName);
            parameters.Add("LastName", lastName);
            parameters.Add("Company", company);
            parameters.Add("RoleId", roleId);
            parameters.Add("UserId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_CreateUser",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("UserId");
        }

        public async Task<int> UpdateAsync(int userId, string email, string firstName, 
            string lastName, string company, bool isActive)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateUser",
                new { UserId = userId, Email = email, FirstName = firstName, 
                      LastName = lastName, Company = company, IsActive = isActive },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }

        public async Task<int> UpdatePasswordAsync(int userId, string passwordHash)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateUserPassword",
                new { UserId = userId, PasswordHash = passwordHash },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }

        public async Task UpdateLastLoginAsync(int userId)
        {
            using var connection = CreateConnection();
            await connection.ExecuteAsync(
                "sp_UpdateLastLogin",
                new { UserId = userId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<int> DeleteAsync(int userId)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_DeleteUser",
                new { UserId = userId },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }
    }
}
