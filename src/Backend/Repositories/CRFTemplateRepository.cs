using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SoftwareUpdateManagement.API.DTOs.CRFTemplate;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class CRFTemplateRepository : ICRFTemplateRepository
    {
        private readonly string _connectionString;

        public CRFTemplateRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<IEnumerable<CRFTemplateDto>> GetAllCRFTemplates()
        {
            var templates = new List<CRFTemplateDto>();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetAllCRFTemplates", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            templates.Add(MapCRFTemplateDto(reader));
                        }
                    }
                }
            }

            return templates;
        }

        public async Task<CRFTemplateDto?> GetCRFTemplateById(int templateId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetCRFTemplateById", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@CRFTemplateId", templateId);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapCRFTemplateDto(reader);
                        }
                    }
                }
            }

            return null;
        }

        public async Task<int> CreateCRFTemplate(CreateCRFTemplateDto template, int createdBy)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_CreateCRFTemplate", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@TemplateName", template.TemplateName);
                    command.Parameters.AddWithValue("@Description", template.Description);
                    command.Parameters.AddWithValue("@CRFNumberPrefix", template.CRFNumberPrefix);
                    command.Parameters.AddWithValue("@DefaultTitle", template.DefaultTitle);
                    command.Parameters.AddWithValue("@DefaultDescription", template.DefaultDescription);
                    command.Parameters.AddWithValue("@DefaultPriority", template.DefaultPriority);
                    command.Parameters.AddWithValue("@CreatedBy", createdBy);

                    await connection.OpenAsync();
                    var result = await command.ExecuteScalarAsync();
                    return Convert.ToInt32(result);
                }
            }
        }

        public async Task<bool> UpdateCRFTemplate(int templateId, UpdateCRFTemplateDto template)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_UpdateCRFTemplate", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@CRFTemplateId", templateId);
                    command.Parameters.AddWithValue("@TemplateName", template.TemplateName);
                    command.Parameters.AddWithValue("@Description", template.Description);
                    command.Parameters.AddWithValue("@CRFNumberPrefix", template.CRFNumberPrefix);
                    command.Parameters.AddWithValue("@DefaultTitle", template.DefaultTitle);
                    command.Parameters.AddWithValue("@DefaultDescription", template.DefaultDescription);
                    command.Parameters.AddWithValue("@DefaultPriority", template.DefaultPriority);
                    command.Parameters.AddWithValue("@IsActive", template.IsActive);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                    return true;
                }
            }
        }

        public async Task<bool> DeleteCRFTemplate(int templateId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_DeleteCRFTemplate", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@CRFTemplateId", templateId);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                    return true;
                }
            }
        }

        public async Task<CRFTemplateDto?> GetCRFTemplateByName(string templateName)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetCRFTemplateByName", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@TemplateName", templateName);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapCRFTemplateDto(reader);
                        }
                    }
                }
            }

            return null;
        }

        private CRFTemplateDto MapCRFTemplateDto(SqlDataReader reader)
        {
            return new CRFTemplateDto
            {
                CRFTemplateId = reader.GetInt32(reader.GetOrdinal("CRFTemplateId")),
                TemplateName = reader.GetString(reader.GetOrdinal("TemplateName")),
                Description = reader.GetString(reader.GetOrdinal("Description")),
                CRFNumberPrefix = reader.GetString(reader.GetOrdinal("CRFNumberPrefix")),
                DefaultTitle = reader.GetString(reader.GetOrdinal("DefaultTitle")),
                DefaultDescription = reader.GetString(reader.GetOrdinal("DefaultDescription")),
                DefaultPriority = reader.GetString(reader.GetOrdinal("DefaultPriority")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                CreatedBy = reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                CreatedByName = reader.GetString(reader.GetOrdinal("CreatedByName")),
                CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                UpdatedDate = reader.IsDBNull(reader.GetOrdinal("UpdatedDate"))
                    ? null : reader.GetDateTime(reader.GetOrdinal("UpdatedDate")),
                UsageCount = reader.GetInt32(reader.GetOrdinal("UsageCount"))
            };
        }
    }
}
