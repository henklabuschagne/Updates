using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SoftwareUpdateManagement.API.DTOs.Reporting;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Repositories
{
    public class ReportingRepository : IReportingRepository
    {
        private readonly string _connectionString;

        public ReportingRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<DeploymentReportDto> GetDeploymentReport(DateTime startDate, DateTime endDate)
        {
            var report = new DeploymentReportDto
            {
                StartDate = startDate,
                EndDate = endDate
            };

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetDeploymentReport", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@StartDate", startDate);
                    command.Parameters.AddWithValue("@EndDate", endDate);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Summary
                        if (await reader.ReadAsync())
                        {
                            report.TotalDeployments = reader.GetInt32(reader.GetOrdinal("TotalDeployments"));
                            report.SuccessfulDeployments = reader.GetInt32(reader.GetOrdinal("SuccessfulDeployments"));
                            report.FailedDeployments = reader.GetInt32(reader.GetOrdinal("FailedDeployments"));
                            report.PendingDeployments = reader.GetInt32(reader.GetOrdinal("PendingDeployments"));
                            report.SuccessRate = reader.GetDecimal(reader.GetOrdinal("SuccessRate"));
                        }

                        // Second result set: Deployments by version
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.DeploymentsByVersion.Add(new DeploymentByVersionDto
                                {
                                    VersionNumber = reader.GetString(reader.GetOrdinal("VersionNumber")),
                                    VersionName = reader.GetString(reader.GetOrdinal("VersionName")),
                                    DeploymentCount = reader.GetInt32(reader.GetOrdinal("DeploymentCount")),
                                    SuccessCount = reader.GetInt32(reader.GetOrdinal("SuccessCount")),
                                    FailedCount = reader.GetInt32(reader.GetOrdinal("FailedCount")),
                                    SuccessRate = reader.GetDecimal(reader.GetOrdinal("SuccessRate"))
                                });
                            }
                        }

                        // Third result set: Deployments by client
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.DeploymentsByClient.Add(new DeploymentByClientDto
                                {
                                    ClientId = reader.GetInt32(reader.GetOrdinal("ClientId")),
                                    ClientName = reader.GetString(reader.GetOrdinal("ClientName")),
                                    DeploymentCount = reader.GetInt32(reader.GetOrdinal("DeploymentCount")),
                                    SuccessCount = reader.GetInt32(reader.GetOrdinal("SuccessCount")),
                                    FailedCount = reader.GetInt32(reader.GetOrdinal("FailedCount")),
                                    CurrentVersion = reader.GetString(reader.GetOrdinal("CurrentVersion")),
                                    LastDeploymentDate = reader.IsDBNull(reader.GetOrdinal("LastDeploymentDate"))
                                        ? null : reader.GetDateTime(reader.GetOrdinal("LastDeploymentDate"))
                                });
                            }
                        }

                        // Fourth result set: Deployment trend
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.DeploymentTrend.Add(new DeploymentTrendDto
                                {
                                    Date = reader.GetDateTime(reader.GetOrdinal("Date")),
                                    TotalDeployments = reader.GetInt32(reader.GetOrdinal("TotalDeployments")),
                                    SuccessfulDeployments = reader.GetInt32(reader.GetOrdinal("SuccessfulDeployments")),
                                    FailedDeployments = reader.GetInt32(reader.GetOrdinal("FailedDeployments"))
                                });
                            }
                        }
                    }
                }
            }

            return report;
        }

        public async Task<CRFReportDto> GetCRFReport(DateTime startDate, DateTime endDate)
        {
            var report = new CRFReportDto
            {
                StartDate = startDate,
                EndDate = endDate
            };

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetCRFReport", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@StartDate", startDate);
                    command.Parameters.AddWithValue("@EndDate", endDate);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Summary
                        if (await reader.ReadAsync())
                        {
                            report.TotalCRFs = reader.GetInt32(reader.GetOrdinal("TotalCRFs"));
                            report.CompletedCRFs = reader.GetInt32(reader.GetOrdinal("CompletedCRFs"));
                            report.PendingCRFs = reader.GetInt32(reader.GetOrdinal("PendingCRFs"));
                            report.CancelledCRFs = reader.GetInt32(reader.GetOrdinal("CancelledCRFs"));
                            report.CompletionRate = reader.GetDecimal(reader.GetOrdinal("CompletionRate"));
                            report.AverageApprovalTime = reader.GetDouble(reader.GetOrdinal("AverageApprovalTime"));
                            report.AverageDeploymentTime = reader.GetDouble(reader.GetOrdinal("AverageDeploymentTime"));
                        }

                        // Second result set: CRFs by status
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.CRFsByStatus.Add(new CRFByStatusDto
                                {
                                    Status = reader.GetString(reader.GetOrdinal("Status")),
                                    Count = reader.GetInt32(reader.GetOrdinal("Count")),
                                    Percentage = reader.GetDecimal(reader.GetOrdinal("Percentage"))
                                });
                            }
                        }

                        // Third result set: CRFs by priority
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.CRFsByPriority.Add(new CRFByPriorityDto
                                {
                                    Priority = reader.GetString(reader.GetOrdinal("Priority")),
                                    Count = reader.GetInt32(reader.GetOrdinal("Count")),
                                    CompletedCount = reader.GetInt32(reader.GetOrdinal("CompletedCount")),
                                    AverageCompletionDays = reader.GetDecimal(reader.GetOrdinal("AverageCompletionDays"))
                                });
                            }
                        }

                        // Fourth result set: CRFs by version
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.CRFsByVersion.Add(new CRFByVersionDto
                                {
                                    VersionNumber = reader.GetString(reader.GetOrdinal("VersionNumber")),
                                    VersionName = reader.GetString(reader.GetOrdinal("VersionName")),
                                    CRFCount = reader.GetInt32(reader.GetOrdinal("CRFCount")),
                                    CompletedCount = reader.GetInt32(reader.GetOrdinal("CompletedCount"))
                                });
                            }
                        }

                        // Fifth result set: Approval performance
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.ApprovalPerformance.Add(new ApprovalPerformanceDto
                                {
                                    StepName = reader.GetString(reader.GetOrdinal("StepName")),
                                    TotalApprovals = reader.GetInt32(reader.GetOrdinal("TotalApprovals")),
                                    ApprovedCount = reader.GetInt32(reader.GetOrdinal("ApprovedCount")),
                                    RejectedCount = reader.GetInt32(reader.GetOrdinal("RejectedCount")),
                                    PendingCount = reader.GetInt32(reader.GetOrdinal("PendingCount")),
                                    AverageApprovalDays = reader.GetDouble(reader.GetOrdinal("AverageApprovalDays"))
                                });
                            }
                        }
                    }
                }
            }

            return report;
        }

        public async Task<ClientReportDto> GetClientReport()
        {
            var report = new ClientReportDto();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetClientReport", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Summary
                        if (await reader.ReadAsync())
                        {
                            report.TotalClients = reader.GetInt32(reader.GetOrdinal("TotalClients"));
                            report.ActiveClients = reader.GetInt32(reader.GetOrdinal("ActiveClients"));
                            report.InactiveClients = reader.GetInt32(reader.GetOrdinal("InactiveClients"));
                        }

                        // Second result set: Version distribution
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.VersionDistribution.Add(new ClientVersionDistributionDto
                                {
                                    VersionNumber = reader.GetString(reader.GetOrdinal("VersionNumber")),
                                    VersionName = reader.GetString(reader.GetOrdinal("VersionName")),
                                    ClientCount = reader.GetInt32(reader.GetOrdinal("ClientCount")),
                                    Percentage = reader.GetDecimal(reader.GetOrdinal("Percentage")),
                                    IsCurrentVersion = reader.GetBoolean(reader.GetOrdinal("IsCurrentVersion"))
                                });
                            }
                        }

                        // Third result set: Clients by status
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.ClientsByStatus.Add(new ClientStatusDto
                                {
                                    Status = reader.GetString(reader.GetOrdinal("Status")),
                                    ClientCount = reader.GetInt32(reader.GetOrdinal("ClientCount")),
                                    Percentage = reader.GetDecimal(reader.GetOrdinal("Percentage"))
                                });
                            }
                        }

                        // Fourth result set: Recent updates
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.RecentUpdates.Add(new ClientUpdateHistoryDto
                                {
                                    ClientId = reader.GetInt32(reader.GetOrdinal("ClientId")),
                                    ClientName = reader.GetString(reader.GetOrdinal("ClientName")),
                                    FromVersion = reader.GetString(reader.GetOrdinal("FromVersion")),
                                    ToVersion = reader.GetString(reader.GetOrdinal("ToVersion")),
                                    UpdateDate = reader.GetDateTime(reader.GetOrdinal("UpdateDate")),
                                    UpdatedBy = reader.GetString(reader.GetOrdinal("UpdatedBy"))
                                });
                            }
                        }

                        // Fifth result set: Outdated clients
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.OutdatedClients.Add(new OutdatedClientDto
                                {
                                    ClientId = reader.GetInt32(reader.GetOrdinal("ClientId")),
                                    ClientName = reader.GetString(reader.GetOrdinal("ClientName")),
                                    CurrentVersion = reader.GetString(reader.GetOrdinal("CurrentVersion")),
                                    LatestVersion = reader.GetString(reader.GetOrdinal("LatestVersion")),
                                    VersionsBehind = reader.GetInt32(reader.GetOrdinal("VersionsBehind")),
                                    LastUpdateDate = reader.IsDBNull(reader.GetOrdinal("LastUpdateDate"))
                                        ? null : reader.GetDateTime(reader.GetOrdinal("LastUpdateDate")),
                                    DaysSinceUpdate = reader.GetInt32(reader.GetOrdinal("DaysSinceUpdate"))
                                });
                            }
                        }
                    }
                }
            }

            return report;
        }

        public async Task<SystemPerformanceReportDto> GetSystemPerformanceReport(DateTime startDate, DateTime endDate)
        {
            var report = new SystemPerformanceReportDto
            {
                StartDate = startDate,
                EndDate = endDate
            };

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("sp_GetSystemPerformanceReport", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@StartDate", startDate);
                    command.Parameters.AddWithValue("@EndDate", endDate);

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // First result set: Summary
                        if (await reader.ReadAsync())
                        {
                            report.TotalAPIExecutions = reader.GetInt32(reader.GetOrdinal("TotalAPIExecutions"));
                            report.SuccessfulAPIExecutions = reader.GetInt32(reader.GetOrdinal("SuccessfulAPIExecutions"));
                            report.FailedAPIExecutions = reader.GetInt32(reader.GetOrdinal("FailedAPIExecutions"));
                            report.APISuccessRate = reader.GetDecimal(reader.GetOrdinal("APISuccessRate"));
                            report.AverageAPIResponseTime = reader.GetDouble(reader.GetOrdinal("AverageAPIResponseTime"));
                            report.TotalErrors = reader.GetInt32(reader.GetOrdinal("TotalErrors"));
                            report.ResolvedErrors = reader.GetInt32(reader.GetOrdinal("ResolvedErrors"));
                            report.UnresolvedErrors = reader.GetInt32(reader.GetOrdinal("UnresolvedErrors"));
                        }

                        // Second result set: API performance by type
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.APIPerformanceByType.Add(new APIPerformanceDto
                                {
                                    APIName = reader.GetString(reader.GetOrdinal("APIName")),
                                    APIType = reader.GetString(reader.GetOrdinal("APIType")),
                                    ExecutionCount = reader.GetInt32(reader.GetOrdinal("ExecutionCount")),
                                    SuccessCount = reader.GetInt32(reader.GetOrdinal("SuccessCount")),
                                    FailureCount = reader.GetInt32(reader.GetOrdinal("FailureCount")),
                                    SuccessRate = reader.GetDecimal(reader.GetOrdinal("SuccessRate")),
                                    AverageResponseTime = reader.GetDouble(reader.GetOrdinal("AverageResponseTime")),
                                    MinResponseTime = reader.GetDouble(reader.GetOrdinal("MinResponseTime")),
                                    MaxResponseTime = reader.GetDouble(reader.GetOrdinal("MaxResponseTime"))
                                });
                            }
                        }

                        // Third result set: Errors by type
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.ErrorsByType.Add(new ErrorByTypeDto
                                {
                                    ErrorType = reader.GetString(reader.GetOrdinal("ErrorType")),
                                    ErrorCount = reader.GetInt32(reader.GetOrdinal("ErrorCount")),
                                    ResolvedCount = reader.GetInt32(reader.GetOrdinal("ResolvedCount")),
                                    ResolutionRate = reader.GetDecimal(reader.GetOrdinal("ResolutionRate"))
                                });
                            }
                        }

                        // Fourth result set: Errors by severity
                        if (await reader.NextResultAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                report.ErrorsBySeverity.Add(new ErrorBySeverityDto
                                {
                                    Severity = reader.GetString(reader.GetOrdinal("Severity")),
                                    ErrorCount = reader.GetInt32(reader.GetOrdinal("ErrorCount")),
                                    ResolvedCount = reader.GetInt32(reader.GetOrdinal("ResolvedCount")),
                                    UnresolvedCount = reader.GetInt32(reader.GetOrdinal("UnresolvedCount"))
                                });
                            }
                        }
                    }
                }
            }

            return report;
        }
    }
}
