-- =============================================
-- Stored Procedures: System Health & Reporting
-- Purpose: System monitoring and reporting functionality
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SYSTEM HEALTH MONITORING
-- =============================================

-- =============================================
-- Stored Procedure: sp_RecordSystemHealthMetric
-- Description: Record a system health metric
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_RecordSystemHealthMetric]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_RecordSystemHealthMetric;
GO

CREATE PROCEDURE sp_RecordSystemHealthMetric
    @MetricType NVARCHAR(50),
    @MetricValue DECIMAL(18,2),
    @Unit NVARCHAR(20) = NULL,
    @ThresholdWarning DECIMAL(18,2) = NULL,
    @ThresholdCritical DECIMAL(18,2) = NULL,
    @AdditionalData NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Status NVARCHAR(20);

    -- Determine status based on thresholds
    IF @ThresholdCritical IS NOT NULL AND @MetricValue >= @ThresholdCritical
        SET @Status = 'Critical';
    ELSE IF @ThresholdWarning IS NOT NULL AND @MetricValue >= @ThresholdWarning
        SET @Status = 'Warning';
    ELSE
        SET @Status = 'Healthy';

    INSERT INTO SystemHealthMetrics (
        MetricType, MetricValue, Unit, Status,
        ThresholdWarning, ThresholdCritical, AdditionalData
    )
    VALUES (
        @MetricType, @MetricValue, @Unit, @Status,
        @ThresholdWarning, @ThresholdCritical, @AdditionalData
    );

    SELECT 
        MetricId,
        MetricType,
        MetricValue,
        Unit,
        Status,
        ThresholdWarning,
        ThresholdCritical,
        AdditionalData,
        Timestamp
    FROM SystemHealthMetrics
    WHERE MetricId = SCOPE_IDENTITY();
END
GO

-- =============================================
-- Stored Procedure: sp_GetSystemHealthMetrics
-- Description: Get system health metrics
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetSystemHealthMetrics]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetSystemHealthMetrics;
GO

CREATE PROCEDURE sp_GetSystemHealthMetrics
    @MetricType NVARCHAR(50) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @MaxResults INT = 100
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@MaxResults)
        MetricId,
        MetricType,
        MetricValue,
        Unit,
        Status,
        ThresholdWarning,
        ThresholdCritical,
        AdditionalData,
        Timestamp
    FROM SystemHealthMetrics
    WHERE (@MetricType IS NULL OR MetricType = @MetricType)
        AND (@StartDate IS NULL OR Timestamp >= @StartDate)
        AND (@EndDate IS NULL OR Timestamp <= @EndDate)
    ORDER BY Timestamp DESC;
END
GO

-- =============================================
-- Stored Procedure: sp_GetLatestSystemHealth
-- Description: Get latest health metrics by type
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetLatestSystemHealth]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetLatestSystemHealth;
GO

CREATE PROCEDURE sp_GetLatestSystemHealth
AS
BEGIN
    SET NOCOUNT ON;

    WITH LatestMetrics AS (
        SELECT 
            MetricType,
            MetricValue,
            Unit,
            Status,
            Timestamp,
            ROW_NUMBER() OVER (PARTITION BY MetricType ORDER BY Timestamp DESC) AS rn
        FROM SystemHealthMetrics
    )
    SELECT 
        MetricType,
        MetricValue,
        Unit,
        Status,
        Timestamp
    FROM LatestMetrics
    WHERE rn = 1
    ORDER BY MetricType;
END
GO

-- =============================================
-- REPORTING
-- =============================================

-- =============================================
-- Stored Procedure: sp_GetCRFComplianceReport
-- Description: Generate CRF compliance report
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetCRFComplianceReport]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetCRFComplianceReport;
GO

CREATE PROCEDURE sp_GetCRFComplianceReport
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    -- Summary statistics
    SELECT 
        COUNT(*) AS TotalCRFs,
        SUM(CASE WHEN Status = 'Approved' THEN 1 ELSE 0 END) AS ApprovedCRFs,
        SUM(CASE WHEN Status = 'Rejected' THEN 1 ELSE 0 END) AS RejectedCRFs,
        SUM(CASE WHEN Status LIKE 'Pending%' THEN 1 ELSE 0 END) AS PendingCRFs,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCRFs,
        AVG(DATEDIFF(HOUR, CreatedAt, 
            CASE WHEN CompletedAt IS NOT NULL THEN CompletedAt ELSE GETDATE() END)) AS AvgProcessingTimeHours
    FROM CRFs
    WHERE CreatedAt BETWEEN @StartDate AND @EndDate;

    -- By priority
    SELECT 
        Priority,
        COUNT(*) AS CRFCount,
        AVG(DATEDIFF(HOUR, CreatedAt, 
            CASE WHEN CompletedAt IS NOT NULL THEN CompletedAt ELSE GETDATE() END)) AS AvgProcessingTimeHours
    FROM CRFs
    WHERE CreatedAt BETWEEN @StartDate AND @EndDate
    GROUP BY Priority
    ORDER BY 
        CASE Priority 
            WHEN 'Urgent' THEN 1 
            WHEN 'High' THEN 2 
            WHEN 'Medium' THEN 3 
            WHEN 'Low' THEN 4 
        END;

    -- Approval workflow performance
    SELECT 
        ca.StepName,
        COUNT(*) AS ApprovalsProcessed,
        SUM(CASE WHEN ca.Status = 'Approved' THEN 1 ELSE 0 END) AS ApprovedCount,
        SUM(CASE WHEN ca.Status = 'Rejected' THEN 1 ELSE 0 END) AS RejectedCount,
        AVG(DATEDIFF(HOUR, ca.CreatedAt, ca.UpdatedAt)) AS AvgApprovalTimeHours
    FROM CRFApprovals ca
    INNER JOIN CRFs c ON ca.CRFId = c.CRFId
    WHERE c.CreatedAt BETWEEN @StartDate AND @EndDate
        AND ca.UpdatedAt IS NOT NULL
    GROUP BY ca.StepName
    ORDER BY ca.StepName;
END
GO

-- =============================================
-- Stored Procedure: sp_GetDeploymentSuccessReport
-- Description: Generate deployment success report
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetDeploymentSuccessReport]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetDeploymentSuccessReport;
GO

CREATE PROCEDURE sp_GetDeploymentSuccessReport
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    -- Overall deployment statistics
    SELECT 
        COUNT(*) AS TotalDeployments,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS SuccessfulDeployments,
        SUM(CASE WHEN Status = 'Failed' THEN 1 ELSE 0 END) AS FailedDeployments,
        SUM(CASE WHEN Status = 'RolledBack' THEN 1 ELSE 0 END) AS RolledBackDeployments,
        CAST(SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS FLOAT) / 
            NULLIF(COUNT(*), 0) * 100 AS SuccessRate
    FROM DeploymentLogs
    WHERE DeployedAt BETWEEN @StartDate AND @EndDate;

    -- By version
    SELECT 
        v.VersionNumber,
        COUNT(*) AS DeploymentCount,
        SUM(CASE WHEN dl.Status = 'Completed' THEN 1 ELSE 0 END) AS SuccessfulCount,
        SUM(CASE WHEN dl.Status = 'Failed' THEN 1 ELSE 0 END) AS FailedCount,
        CAST(SUM(CASE WHEN dl.Status = 'Completed' THEN 1 ELSE 0 END) AS FLOAT) / 
            NULLIF(COUNT(*), 0) * 100 AS SuccessRate
    FROM DeploymentLogs dl
    INNER JOIN SoftwareVersions v ON dl.VersionId = v.VersionId
    WHERE dl.DeployedAt BETWEEN @StartDate AND @EndDate
    GROUP BY v.VersionNumber
    ORDER BY DeploymentCount DESC;

    -- Deployment errors
    SELECT 
        ErrorType,
        COUNT(*) AS ErrorCount
    FROM ErrorNotifications
    WHERE CreatedAt BETWEEN @StartDate AND @EndDate
        AND ErrorType LIKE '%Deploy%'
    GROUP BY ErrorType
    ORDER BY ErrorCount DESC;
END
GO

-- =============================================
-- Stored Procedure: sp_GetClientVersionDistribution
-- Description: Get client version distribution report
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetClientVersionDistribution]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetClientVersionDistribution;
GO

CREATE PROCEDURE sp_GetClientVersionDistribution
AS
BEGIN
    SET NOCOUNT ON;

    -- Current version distribution
    SELECT 
        CurrentVersion,
        COUNT(*) AS ClientCount,
        CAST(COUNT(*) AS FLOAT) / (SELECT COUNT(*) FROM Clients WHERE Status = 'Active') * 100 AS Percentage
    FROM Clients
    WHERE Status = 'Active'
    GROUP BY CurrentVersion
    ORDER BY ClientCount DESC;

    -- Clients not on latest version
    DECLARE @LatestVersion NVARCHAR(50);
    SELECT TOP 1 @LatestVersion = VersionNumber 
    FROM SoftwareVersions 
    ORDER BY CreatedAt DESC;

    SELECT 
        ClientName,
        CurrentVersion,
        ContactEmail,
        DATEDIFF(DAY, LastUpdateDate, GETDATE()) AS DaysSinceUpdate
    FROM Clients
    WHERE Status = 'Active'
        AND CurrentVersion != @LatestVersion
    ORDER BY DaysSinceUpdate DESC;
END
GO

-- =============================================
-- Stored Procedure: sp_GetUserActivityReport
-- Description: Generate user activity report
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetUserActivityReport]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetUserActivityReport;
GO

CREATE PROCEDURE sp_GetUserActivityReport
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    -- Most active users
    SELECT TOP 20
        u.Username,
        u.Email,
        COUNT(DISTINCT al.AuditLogId) AS TotalActions,
        COUNT(DISTINCT CASE WHEN al.Action = 'Login' THEN al.AuditLogId END) AS LoginCount,
        MAX(al.Timestamp) AS LastActivity
    FROM Users u
    LEFT JOIN AuditLogs al ON u.UserId = al.UserId
    WHERE al.Timestamp BETWEEN @StartDate AND @EndDate
    GROUP BY u.Username, u.Email
    ORDER BY TotalActions DESC;

    -- Activity by action type
    SELECT 
        Action,
        COUNT(*) AS ActionCount,
        COUNT(DISTINCT UserId) AS UniqueUsers
    FROM AuditLogs
    WHERE Timestamp BETWEEN @StartDate AND @EndDate
    GROUP BY Action
    ORDER BY ActionCount DESC;
END
GO

-- =============================================
-- Stored Procedure: sp_CreateReportSchedule
-- Description: Create a scheduled report
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateReportSchedule]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_CreateReportSchedule;
GO

CREATE PROCEDURE sp_CreateReportSchedule
    @ReportName NVARCHAR(255),
    @ReportType NVARCHAR(100),
    @Frequency NVARCHAR(50),
    @Parameters NVARCHAR(MAX) = NULL,
    @Recipients NVARCHAR(MAX),
    @CreatedBy INT,
    @NextRunAt DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO ReportSchedules (
        ReportName, ReportType, Frequency, Parameters,
        Recipients, CreatedBy, NextRunAt
    )
    VALUES (
        @ReportName, @ReportType, @Frequency, @Parameters,
        @Recipients, @CreatedBy, @NextRunAt
    );

    SELECT 
        ScheduleId,
        ReportName,
        ReportType,
        Frequency,
        Parameters,
        Recipients,
        IsActive,
        CreatedBy,
        LastRunAt,
        NextRunAt,
        CreatedAt
    FROM ReportSchedules
    WHERE ScheduleId = SCOPE_IDENTITY();
END
GO

PRINT 'System Health and Reporting stored procedures created successfully.';
GO
