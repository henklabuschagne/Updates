using Dapper;
using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.Models;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Data;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class VersionRepository : IVersionRepository
    {
        private readonly string _connectionString;

        public VersionRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<SoftwareVersion>> GetAllAsync(bool includeInactive = false)
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<SoftwareVersion>(
                "sp_GetAllVersions",
                new { IncludeInactive = includeInactive },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<SoftwareVersion?> GetByIdAsync(int versionId)
        {
            using var connection = CreateConnection();
            var result = await connection.QueryAsync<SoftwareVersion>(
                "sp_GetVersionById",
                new { VersionId = versionId },
                commandType: CommandType.StoredProcedure
            );
            return result.FirstOrDefault();
        }

        public async Task<int> CreateAsync(string versionNumber, string versionName, DateTime releaseDate, 
            string description, string releaseNotes, bool isMajorRelease, int createdBy)
        {
            using var connection = CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("VersionNumber", versionNumber);
            parameters.Add("VersionName", versionName);
            parameters.Add("ReleaseDate", releaseDate);
            parameters.Add("Description", description);
            parameters.Add("ReleaseNotes", releaseNotes);
            parameters.Add("IsMajorRelease", isMajorRelease);
            parameters.Add("CreatedBy", createdBy);
            parameters.Add("VersionId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "sp_CreateVersion",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<int>("VersionId");
        }

        public async Task<int> UpdateAsync(int versionId, string versionNumber, string versionName, 
            DateTime releaseDate, string description, string releaseNotes, bool isMajorRelease, bool isActive)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_UpdateVersion",
                new { 
                    VersionId = versionId, 
                    VersionNumber = versionNumber, 
                    VersionName = versionName, 
                    ReleaseDate = releaseDate, 
                    Description = description, 
                    ReleaseNotes = releaseNotes, 
                    IsMajorRelease = isMajorRelease, 
                    IsActive = isActive 
                },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }

        public async Task<int> DeleteAsync(int versionId)
        {
            using var connection = CreateConnection();
            var result = await connection.ExecuteScalarAsync<int>(
                "sp_DeleteVersion",
                new { VersionId = versionId },
                commandType: CommandType.StoredProcedure
            );
            
            return result;
        }
    }
}
