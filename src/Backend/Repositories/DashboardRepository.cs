using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SoftwareUpdateManagement.API.DTOs.Dashboard;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly string _connectionString;

        public DashboardRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<DashboardStatisticsDto> GetDashboardStatistics()
        {
            var dashboard = new DashboardStatisticsDto
            {
                SystemOverview = await GetSystemOverview(),
                RecentActivities = await GetRecentActivities(20),
                UpcomingDeployments = await GetUpcomingDeployments(7),
                CriticalAlerts = await GetCriticalAlerts(),
                WorkflowMetrics = await GetWorkflowMetrics(),
                VersionAdoption = await GetVersionAdoption()
            };

            return dashboard;
        }

        public async Task<SystemOverviewDto> GetSystemOverview()
        {
            var overview = new SystemOverviewDto();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetSystemOverview", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            overview.TotalClients = reader.GetInt32(reader.GetOrdinal("TotalClients"));
                            overview.ActiveCRFs = reader.GetInt32(reader.GetOrdinal("ActiveCRFs"));
                            overview.PendingApprovals = reader.GetInt32(reader.GetOrdinal("PendingApprovals"));
                            overview.DeploymentsToday = reader.GetInt32(reader.GetOrdinal("DeploymentsToday"));
                            overview.FailedDeployments = reader.GetInt32(reader.GetOrdinal("FailedDeployments"));
                            overview.UnresolvedErrors = reader.GetInt32(reader.GetOrdinal("UnresolvedErrors"));
                            overview.OverallDeploymentSuccessRate = reader.GetDecimal(reader.GetOrdinal("OverallDeploymentSuccessRate"));
                            overview.TotalVersions = reader.GetInt32(reader.GetOrdinal("TotalVersions"));
                            overview.LatestVersion = reader.GetString(reader.GetOrdinal("LatestVersion"));
                        }
                    }
                }
            }

            return overview;
        }

        public async Task<List<RecentActivityDto>> GetRecentActivities(int maxResults = 20)
        {
            var activities = new List<RecentActivityDto>();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetRecentActivities", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@MaxResults", maxResults);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            activities.Add(new RecentActivityDto
                            {
                                ActivityType = reader.GetString(reader.GetOrdinal("ActivityType")),
                                Description = reader.GetString(reader.GetOrdinal("Description")),
                                Username = reader.GetString(reader.GetOrdinal("Username")),
                                Timestamp = reader.GetDateTime(reader.GetOrdinal("Timestamp")),
                                EntityType = reader.GetString(reader.GetOrdinal("EntityType")),
                                EntityId = reader.IsDBNull(reader.GetOrdinal("EntityId"))
                                    ? null : reader.GetInt32(reader.GetOrdinal("EntityId")),
                                Severity = reader.GetString(reader.GetOrdinal("Severity"))
                            });
                        }
                    }
                }
            }

            return activities;
        }

        public async Task<List<UpcomingDeploymentDto>> GetUpcomingDeployments(int days = 7)
        {
            var deployments = new List<UpcomingDeploymentDto>();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetUpcomingDeployments", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@Days", days);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            deployments.Add(new UpcomingDeploymentDto
                            {
                                CRFId = reader.GetInt32(reader.GetOrdinal("CRFId")),
                                CRFNumber = reader.GetString(reader.GetOrdinal("CRFNumber")),
                                CRFTitle = reader.GetString(reader.GetOrdinal("CRFTitle")),
                                VersionNumber = reader.GetString(reader.GetOrdinal("VersionNumber")),
                                ScheduledDate = reader.IsDBNull(reader.GetOrdinal("ScheduledDate"))
                                    ? null : reader.GetDateTime(reader.GetOrdinal("ScheduledDate")),
                                ClientCount = reader.GetInt32(reader.GetOrdinal("ClientCount")),
                                Priority = reader.GetString(reader.GetOrdinal("Priority")),
                                Status = reader.GetString(reader.GetOrdinal("Status"))
                            });
                        }
                    }
                }
            }

            return deployments;
        }

        public async Task<List<CriticalAlertDto>> GetCriticalAlerts()
        {
            var alerts = new List<CriticalAlertDto>();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetCriticalAlerts", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            alerts.Add(new CriticalAlertDto
                            {
                                AlertId = reader.GetInt32(reader.GetOrdinal("AlertId")),
                                AlertType = reader.GetString(reader.GetOrdinal("AlertType")),
                                Message = reader.GetString(reader.GetOrdinal("Message")),
                                Severity = reader.GetString(reader.GetOrdinal("Severity")),
                                CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                                IsResolved = reader.GetBoolean(reader.GetOrdinal("IsResolved")),
                                RelatedEntity = reader.IsDBNull(reader.GetOrdinal("RelatedEntity"))
                                    ? null : reader.GetString(reader.GetOrdinal("RelatedEntity")),
                                RelatedEntityId = reader.IsDBNull(reader.GetOrdinal("RelatedEntityId"))
                                    ? null : reader.GetInt32(reader.GetOrdinal("RelatedEntityId"))
                            });
                        }
                    }
                }
            }

            return alerts;
        }

        public async Task<WorkflowMetricsDto> GetWorkflowMetrics()
        {
            var metrics = new WorkflowMetricsDto();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetWorkflowMetrics", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Summary metrics
                        if (await reader.ReadAsync())
                        {
                            metrics.TotalCRFsThisMonth = reader.GetInt32(reader.GetOrdinal("TotalCRFsThisMonth"));
                            metrics.CompletedCRFsThisMonth = reader.GetInt32(reader.GetOrdinal("CompletedCRFsThisMonth"));
                            metrics.AverageApprovalTime = reader.GetDouble(reader.GetOrdinal("AverageApprovalTime"));
                            metrics.AverageDeploymentTime = reader.GetDouble(reader.GetOrdinal("AverageDeploymentTime"));
                            metrics.ApprovalSuccessRate = reader.GetDecimal(reader.GetOrdinal("ApprovalSuccessRate"));
                        }

                        // Second result set: Step metrics
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                metrics.StepMetrics.Add(new WorkflowStepMetricDto
                                {
                                    StepName = reader.GetString(reader.GetOrdinal("StepName")),
                                    PendingCount = reader.GetInt32(reader.GetOrdinal("PendingCount")),
                                    ApprovedCount = reader.GetInt32(reader.GetOrdinal("ApprovedCount")),
                                    RejectedCount = reader.GetInt32(reader.GetOrdinal("RejectedCount")),
                                    AverageProcessingDays = reader.GetDouble(reader.GetOrdinal("AverageProcessingDays"))
                                });
                            }
                        }
                    }
                }
            }

            return metrics;
        }

        public async Task<VersionAdoptionDto> GetVersionAdoption()
        {
            var adoption = new VersionAdoptionDto();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetVersionAdoption", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Latest version summary
                        if (await reader.ReadAsync())
                        {
                            adoption.LatestVersion = reader.GetString(reader.GetOrdinal("LatestVersion"));
                            adoption.ClientsOnLatestVersion = reader.GetInt32(reader.GetOrdinal("ClientsOnLatestVersion"));
                            adoption.LatestVersionAdoptionRate = reader.GetDecimal(reader.GetOrdinal("LatestVersionAdoptionRate"));
                        }

                        // Second result set: Version usage breakdown
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                adoption.VersionUsage.Add(new VersionUsageDto
                                {
                                    VersionNumber = reader.GetString(reader.GetOrdinal("VersionNumber")),
                                    VersionName = reader.GetString(reader.GetOrdinal("VersionName")),
                                    ClientCount = reader.GetInt32(reader.GetOrdinal("ClientCount")),
                                    Percentage = reader.GetDecimal(reader.GetOrdinal("Percentage")),
                                    IsLatest = reader.GetBoolean(reader.GetOrdinal("IsLatest")),
                                    ReleaseDate = reader.GetDateTime(reader.GetOrdinal("ReleaseDate"))
                                });
                            }
                        }
                    }
                }
            }

            return adoption;
        }
    }
}
