using Microsoft.Data.SqlClient;
using SoftwareUpdateManagement.API.DTOs.Search;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class SearchRepository : ISearchRepository
    {
        private readonly string _connectionString;
        private readonly ILogger<SearchRepository> _logger;

        public SearchRepository(IConfiguration configuration, ILogger<SearchRepository> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException("Connection string not found");
            _logger = logger;
        }

        public async Task<AdvancedSearchResultDto> SearchAsync(AdvancedSearchRequestDto request)
        {
            var result = new AdvancedSearchResultDto();

            try
            {
                // Determine which search types to execute
                var searchTypes = request.SearchTypes?.Any() == true 
                    ? request.SearchTypes 
                    : new List<string> { "crfs", "clients", "versions", "errors", "deployments" };

                // Execute searches in parallel
                var tasks = new List<Task>();

                if (searchTypes.Contains("crfs", StringComparer.OrdinalIgnoreCase))
                {
                    tasks.Add(Task.Run(async () => result.CRFs = await SearchCRFsAsync(request)));
                }

                if (searchTypes.Contains("clients", StringComparer.OrdinalIgnoreCase))
                {
                    tasks.Add(Task.Run(async () => result.Clients = await SearchClientsAsync(request)));
                }

                if (searchTypes.Contains("versions", StringComparer.OrdinalIgnoreCase))
                {
                    tasks.Add(Task.Run(async () => result.Versions = await SearchVersionsAsync(request)));
                }

                if (searchTypes.Contains("errors", StringComparer.OrdinalIgnoreCase))
                {
                    tasks.Add(Task.Run(async () => result.Errors = await SearchErrorsAsync(request)));
                }

                if (searchTypes.Contains("deployments", StringComparer.OrdinalIgnoreCase))
                {
                    tasks.Add(Task.Run(async () => result.Deployments = await SearchDeploymentsAsync(request)));
                }

                await Task.WhenAll(tasks);

                // Build summary
                result.Summary = new SearchResultSummaryDto
                {
                    TotalCRFs = result.CRFs.Count,
                    TotalClients = result.Clients.Count,
                    TotalVersions = result.Versions.Count,
                    TotalErrors = result.Errors.Count,
                    TotalDeployments = result.Deployments.Count,
                    TotalResults = result.CRFs.Count + result.Clients.Count + result.Versions.Count + 
                                   result.Errors.Count + result.Deployments.Count,
                    SearchedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing advanced search");
                throw;
            }

            return result;
        }

        public async Task<List<CRFSearchResultDto>> SearchCRFsAsync(AdvancedSearchRequestDto request)
        {
            var results = new List<CRFSearchResultDto>();

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT TOP (@PageSize)
                            c.CRFId,
                            c.CRFNumber,
                            c.Title,
                            c.Description,
                            c.Status,
                            c.Priority,
                            c.CreatedDate,
                            u.FirstName + ' ' + u.LastName as CreatedBy,
                            v.VersionNumber,
                            1.0 as RelevanceScore
                        FROM CRFs c
                        LEFT JOIN Users u ON c.CreatedBy = u.UserId
                        LEFT JOIN SoftwareVersions v ON c.VersionId = v.VersionId
                        WHERE (@Keyword IS NULL OR 
                               c.CRFNumber LIKE '%' + @Keyword + '%' OR
                               c.Title LIKE '%' + @Keyword + '%' OR
                               c.Description LIKE '%' + @Keyword + '%')
                          AND (@Status IS NULL OR c.Status = @Status)
                          AND (@DateFrom IS NULL OR c.CreatedDate >= @DateFrom)
                          AND (@DateTo IS NULL OR c.CreatedDate <= @DateTo)
                          AND (@Version IS NULL OR v.VersionNumber = @Version)
                        ORDER BY c.CreatedDate DESC
                        OFFSET (@PageNumber - 1) * @PageSize ROWS
                        FETCH NEXT @PageSize ROWS ONLY";

                    using (var command = new SqlCommand(query, connection))
                    {
                        AddSearchParameters(command, request);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                results.Add(new CRFSearchResultDto
                                {
                                    CRFId = reader.GetInt32(0),
                                    CRFNumber = reader.GetString(1),
                                    Title = reader.GetString(2),
                                    Description = reader.IsDBNull(3) ? null : reader.GetString(3),
                                    Status = reader.GetString(4),
                                    Priority = reader.IsDBNull(5) ? null : reader.GetString(5),
                                    CreatedDate = reader.GetDateTime(6),
                                    CreatedBy = reader.GetString(7),
                                    VersionNumber = reader.IsDBNull(8) ? null : reader.GetString(8),
                                    RelevanceScore = reader.GetDouble(9)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching CRFs");
            }

            return results;
        }

        public async Task<List<ClientSearchResultDto>> SearchClientsAsync(AdvancedSearchRequestDto request)
        {
            var results = new List<ClientSearchResultDto>();

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT TOP (@PageSize)
                            c.ClientId,
                            c.ClientCode,
                            c.ClientName,
                            c.ContactEmail,
                            c.ContactPerson,
                            v.VersionNumber as CurrentVersion,
                            c.Status,
                            c.LastUpdated,
                            1.0 as RelevanceScore
                        FROM Clients c
                        LEFT JOIN SoftwareVersions v ON c.CurrentVersionId = v.VersionId
                        WHERE (@Keyword IS NULL OR 
                               c.ClientCode LIKE '%' + @Keyword + '%' OR
                               c.ClientName LIKE '%' + @Keyword + '%' OR
                               c.ContactEmail LIKE '%' + @Keyword + '%')
                          AND (@Status IS NULL OR c.Status = @Status)
                          AND (@Version IS NULL OR v.VersionNumber = @Version)
                        ORDER BY c.ClientName
                        OFFSET (@PageNumber - 1) * @PageSize ROWS
                        FETCH NEXT @PageSize ROWS ONLY";

                    using (var command = new SqlCommand(query, connection))
                    {
                        AddSearchParameters(command, request);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                results.Add(new ClientSearchResultDto
                                {
                                    ClientId = reader.GetInt32(0),
                                    ClientCode = reader.GetString(1),
                                    ClientName = reader.GetString(2),
                                    ContactEmail = reader.IsDBNull(3) ? null : reader.GetString(3),
                                    ContactPerson = reader.IsDBNull(4) ? null : reader.GetString(4),
                                    CurrentVersion = reader.IsDBNull(5) ? null : reader.GetString(5),
                                    Status = reader.GetString(6),
                                    LastUpdated = reader.IsDBNull(7) ? null : reader.GetDateTime(7),
                                    RelevanceScore = reader.GetDouble(8)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching clients");
            }

            return results;
        }

        public async Task<List<VersionSearchResultDto>> SearchVersionsAsync(AdvancedSearchRequestDto request)
        {
            var results = new List<VersionSearchResultDto>();

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT TOP (@PageSize)
                            v.VersionId,
                            v.VersionNumber,
                            v.Description,
                            v.ReleaseDate,
                            v.IsStable,
                            (SELECT COUNT(*) FROM Clients WHERE CurrentVersionId = v.VersionId) as ClientCount,
                            v.Status,
                            1.0 as RelevanceScore
                        FROM SoftwareVersions v
                        WHERE (@Keyword IS NULL OR 
                               v.VersionNumber LIKE '%' + @Keyword + '%' OR
                               v.Description LIKE '%' + @Keyword + '%')
                          AND (@Status IS NULL OR v.Status = @Status)
                          AND (@DateFrom IS NULL OR v.ReleaseDate >= @DateFrom)
                          AND (@DateTo IS NULL OR v.ReleaseDate <= @DateTo)
                          AND (@Version IS NULL OR v.VersionNumber = @Version)
                        ORDER BY v.ReleaseDate DESC
                        OFFSET (@PageNumber - 1) * @PageSize ROWS
                        FETCH NEXT @PageSize ROWS ONLY";

                    using (var command = new SqlCommand(query, connection))
                    {
                        AddSearchParameters(command, request);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                results.Add(new VersionSearchResultDto
                                {
                                    VersionId = reader.GetInt32(0),
                                    VersionNumber = reader.GetString(1),
                                    Description = reader.IsDBNull(2) ? null : reader.GetString(2),
                                    ReleaseDate = reader.GetDateTime(3),
                                    IsStable = reader.GetBoolean(4),
                                    ClientCount = reader.GetInt32(5),
                                    Status = reader.GetString(6),
                                    RelevanceScore = reader.GetDouble(7)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching versions");
            }

            return results;
        }

        public async Task<List<ErrorSearchResultDto>> SearchErrorsAsync(AdvancedSearchRequestDto request)
        {
            var results = new List<ErrorSearchResultDto>();

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT TOP (@PageSize)
                            e.ErrorId,
                            e.ErrorCode,
                            e.ErrorMessage,
                            e.Severity,
                            c.ClientName,
                            v.VersionNumber,
                            e.OccurredAt,
                            e.IsResolved,
                            1.0 as RelevanceScore
                        FROM ErrorNotifications e
                        LEFT JOIN Clients c ON e.ClientId = c.ClientId
                        LEFT JOIN SoftwareVersions v ON e.VersionId = v.VersionId
                        WHERE (@Keyword IS NULL OR 
                               e.ErrorCode LIKE '%' + @Keyword + '%' OR
                               e.ErrorMessage LIKE '%' + @Keyword + '%')
                          AND (@Severity IS NULL OR e.Severity = @Severity)
                          AND (@DateFrom IS NULL OR e.OccurredAt >= @DateFrom)
                          AND (@DateTo IS NULL OR e.OccurredAt <= @DateTo)
                          AND (@Version IS NULL OR v.VersionNumber = @Version)
                        ORDER BY e.OccurredAt DESC
                        OFFSET (@PageNumber - 1) * @PageSize ROWS
                        FETCH NEXT @PageSize ROWS ONLY";

                    using (var command = new SqlCommand(query, connection))
                    {
                        AddSearchParameters(command, request);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                results.Add(new ErrorSearchResultDto
                                {
                                    ErrorId = reader.GetInt32(0),
                                    ErrorCode = reader.GetString(1),
                                    ErrorMessage = reader.GetString(2),
                                    Severity = reader.GetString(3),
                                    ClientName = reader.IsDBNull(4) ? null : reader.GetString(4),
                                    VersionNumber = reader.IsDBNull(5) ? null : reader.GetString(5),
                                    OccurredAt = reader.GetDateTime(6),
                                    IsResolved = reader.GetBoolean(7),
                                    RelevanceScore = reader.GetDouble(8)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching errors");
            }

            return results;
        }

        public async Task<List<DeploymentSearchResultDto>> SearchDeploymentsAsync(AdvancedSearchRequestDto request)
        {
            var results = new List<DeploymentSearchResultDto>();

            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT TOP (@PageSize)
                            d.DeploymentId,
                            d.CRFId,
                            crf.CRFNumber,
                            c.ClientName,
                            v.VersionNumber,
                            d.ScheduledDate,
                            d.Status,
                            d.Priority,
                            d.CreatedDate,
                            1.0 as RelevanceScore
                        FROM DeploymentQueue d
                        LEFT JOIN CRFs crf ON d.CRFId = crf.CRFId
                        LEFT JOIN Clients c ON d.ClientId = c.ClientId
                        LEFT JOIN SoftwareVersions v ON crf.VersionId = v.VersionId
                        WHERE (@Keyword IS NULL OR 
                               crf.CRFNumber LIKE '%' + @Keyword + '%' OR
                               c.ClientName LIKE '%' + @Keyword + '%')
                          AND (@Status IS NULL OR d.Status = @Status)
                          AND (@DateFrom IS NULL OR d.ScheduledDate >= @DateFrom)
                          AND (@DateTo IS NULL OR d.ScheduledDate <= @DateTo)
                          AND (@Version IS NULL OR v.VersionNumber = @Version)
                        ORDER BY d.ScheduledDate DESC
                        OFFSET (@PageNumber - 1) * @PageSize ROWS
                        FETCH NEXT @PageSize ROWS ONLY";

                    using (var command = new SqlCommand(query, connection))
                    {
                        AddSearchParameters(command, request);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                results.Add(new DeploymentSearchResultDto
                                {
                                    DeploymentId = reader.GetInt32(0),
                                    CRFId = reader.IsDBNull(1) ? null : reader.GetInt32(1),
                                    CRFNumber = reader.IsDBNull(2) ? null : reader.GetString(2),
                                    ClientName = reader.IsDBNull(3) ? null : reader.GetString(3),
                                    VersionNumber = reader.IsDBNull(4) ? null : reader.GetString(4),
                                    ScheduledDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                                    Status = reader.GetString(6),
                                    Priority = reader.IsDBNull(7) ? null : reader.GetInt32(7),
                                    CreatedDate = reader.GetDateTime(8),
                                    RelevanceScore = reader.GetDouble(9)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching deployments");
            }

            return results;
        }

        private void AddSearchParameters(SqlCommand command, AdvancedSearchRequestDto request)
        {
            command.Parameters.AddWithValue("@Keyword", 
                string.IsNullOrWhiteSpace(request.Keyword) ? DBNull.Value : request.Keyword);
            command.Parameters.AddWithValue("@Status", 
                string.IsNullOrWhiteSpace(request.Status) || request.Status == "all" ? DBNull.Value : request.Status);
            command.Parameters.AddWithValue("@DateFrom", 
                request.DateFrom.HasValue ? request.DateFrom.Value : DBNull.Value);
            command.Parameters.AddWithValue("@DateTo", 
                request.DateTo.HasValue ? request.DateTo.Value : DBNull.Value);
            command.Parameters.AddWithValue("@Version", 
                string.IsNullOrWhiteSpace(request.Version) || request.Version == "all" ? DBNull.Value : request.Version);
            command.Parameters.AddWithValue("@Severity", 
                string.IsNullOrWhiteSpace(request.Severity) || request.Severity == "all" ? DBNull.Value : request.Severity);
            command.Parameters.AddWithValue("@PageNumber", request.PageNumber);
            command.Parameters.AddWithValue("@PageSize", request.PageSize);
        }
    }
}
