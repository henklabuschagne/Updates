using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class SessionRepository : ISessionRepository
    {
        private readonly string _connectionString;

        public SessionRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<int> CreateSessionAsync(int userId, string token, string refreshToken, 
            string ipAddress, string userAgent, DateTime expiresDate)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("UserId", userId);
            parameters.Add("Token", token);
            parameters.Add("RefreshToken", refreshToken);
            parameters.Add("IpAddress", ipAddress);
            parameters.Add("UserAgent", userAgent);
            parameters.Add("ExpiresDate", expiresDate);
            parameters.Add("SessionId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_CreateUserSession",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("SessionId");
        }

        public async Task<UserSession?> ValidateSessionAsync(string token)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryFirstOrDefaultAsync<UserSession>(
                "sp_ValidateUserSession",
                new { Token = token },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }

        public async Task<int> InvalidateSessionAsync(string token)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_InvalidateUserSession",
                new { Token = token },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }
    }
}
