-- =============================================
-- Stored Procedures: Audit Logs
-- Purpose: Audit logging and compliance tracking
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- Stored Procedure: sp_CreateAuditLog
-- Description: Create an audit log entry
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateAuditLog]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_CreateAuditLog;
GO

CREATE PROCEDURE sp_CreateAuditLog
    @UserId INT = NULL,
    @Username NVARCHAR(100) = NULL,
    @Action NVARCHAR(100),
    @EntityType NVARCHAR(50),
    @EntityId INT = NULL,
    @EntityName NVARCHAR(255) = NULL,
    @OldValues NVARCHAR(MAX) = NULL,
    @NewValues NVARCHAR(MAX) = NULL,
    @Details NVARCHAR(MAX) = NULL,
    @IPAddress NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO AuditLogs (
        UserId, Username, Action, EntityType, EntityId, EntityName,
        OldValues, NewValues, Details, IPAddress, UserAgent
    )
    VALUES (
        @UserId, @Username, @Action, @EntityType, @EntityId, @EntityName,
        @OldValues, @NewValues, @Details, @IPAddress, @UserAgent
    );

    SELECT 
        AuditLogId,
        UserId,
        Username,
        Action,
        EntityType,
        EntityId,
        EntityName,
        OldValues,
        NewValues,
        Details,
        IPAddress,
        UserAgent,
        Timestamp
    FROM AuditLogs
    WHERE AuditLogId = SCOPE_IDENTITY();
END
GO

-- =============================================
-- Stored Procedure: sp_GetAuditLogs
-- Description: Get audit logs with filtering
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetAuditLogs]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetAuditLogs;
GO

CREATE PROCEDURE sp_GetAuditLogs
    @UserId INT = NULL,
    @EntityType NVARCHAR(50) = NULL,
    @EntityId INT = NULL,
    @Action NVARCHAR(100) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    -- Get total count
    SELECT COUNT(*) AS TotalRecords
    FROM AuditLogs
    WHERE (@UserId IS NULL OR UserId = @UserId)
        AND (@EntityType IS NULL OR EntityType = @EntityType)
        AND (@EntityId IS NULL OR EntityId = @EntityId)
        AND (@Action IS NULL OR Action = @Action)
        AND (@StartDate IS NULL OR Timestamp >= @StartDate)
        AND (@EndDate IS NULL OR Timestamp <= @EndDate);

    -- Get paginated results
    SELECT 
        AuditLogId,
        UserId,
        Username,
        Action,
        EntityType,
        EntityId,
        EntityName,
        OldValues,
        NewValues,
        Details,
        IPAddress,
        UserAgent,
        Timestamp
    FROM AuditLogs
    WHERE (@UserId IS NULL OR UserId = @UserId)
        AND (@EntityType IS NULL OR EntityType = @EntityType)
        AND (@EntityId IS NULL OR EntityId = @EntityId)
        AND (@Action IS NULL OR Action = @Action)
        AND (@StartDate IS NULL OR Timestamp >= @StartDate)
        AND (@EndDate IS NULL OR Timestamp <= @EndDate)
    ORDER BY Timestamp DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- =============================================
-- Stored Procedure: sp_GetAuditLogsByEntity
-- Description: Get all audit logs for a specific entity
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetAuditLogsByEntity]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetAuditLogsByEntity;
GO

CREATE PROCEDURE sp_GetAuditLogsByEntity
    @EntityType NVARCHAR(50),
    @EntityId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        AuditLogId,
        UserId,
        Username,
        Action,
        EntityType,
        EntityId,
        EntityName,
        OldValues,
        NewValues,
        Details,
        IPAddress,
        UserAgent,
        Timestamp
    FROM AuditLogs
    WHERE EntityType = @EntityType
        AND EntityId = @EntityId
    ORDER BY Timestamp DESC;
END
GO

-- =============================================
-- Stored Procedure: sp_GetUserActivity
-- Description: Get activity history for a specific user
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetUserActivity]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetUserActivity;
GO

CREATE PROCEDURE sp_GetUserActivity
    @UserId INT,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @MaxResults INT = 100
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@MaxResults)
        AuditLogId,
        UserId,
        Username,
        Action,
        EntityType,
        EntityId,
        EntityName,
        Details,
        Timestamp
    FROM AuditLogs
    WHERE UserId = @UserId
        AND (@StartDate IS NULL OR Timestamp >= @StartDate)
        AND (@EndDate IS NULL OR Timestamp <= @EndDate)
    ORDER BY Timestamp DESC;
END
GO

-- =============================================
-- Stored Procedure: sp_GetAuditLogStatistics
-- Description: Get audit log statistics
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetAuditLogStatistics]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetAuditLogStatistics;
GO

CREATE PROCEDURE sp_GetAuditLogStatistics
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Actions by type
    SELECT 
        Action,
        COUNT(*) AS ActionCount
    FROM AuditLogs
    WHERE (@StartDate IS NULL OR Timestamp >= @StartDate)
        AND (@EndDate IS NULL OR Timestamp <= @EndDate)
    GROUP BY Action
    ORDER BY ActionCount DESC;

    -- Activity by entity type
    SELECT 
        EntityType,
        COUNT(*) AS ActivityCount
    FROM AuditLogs
    WHERE (@StartDate IS NULL OR Timestamp >= @StartDate)
        AND (@EndDate IS NULL OR Timestamp <= @EndDate)
    GROUP BY EntityType
    ORDER BY ActivityCount DESC;

    -- Most active users
    SELECT TOP 10
        UserId,
        Username,
        COUNT(*) AS ActivityCount
    FROM AuditLogs
    WHERE (@StartDate IS NULL OR Timestamp >= @StartDate)
        AND (@EndDate IS NULL OR Timestamp <= @EndDate)
        AND UserId IS NOT NULL
    GROUP BY UserId, Username
    ORDER BY ActivityCount DESC;

    -- Activity over time (daily)
    SELECT 
        CAST(Timestamp AS DATE) AS ActivityDate,
        COUNT(*) AS ActivityCount
    FROM AuditLogs
    WHERE (@StartDate IS NULL OR Timestamp >= @StartDate)
        AND (@EndDate IS NULL OR Timestamp <= @EndDate)
    GROUP BY CAST(Timestamp AS DATE)
    ORDER BY ActivityDate DESC;
END
GO

-- =============================================
-- Stored Procedure: sp_ArchiveAuditLogs
-- Description: Archive old audit logs (maintenance)
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_ArchiveAuditLogs]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_ArchiveAuditLogs;
GO

CREATE PROCEDURE sp_ArchiveAuditLogs
    @ArchiveBeforeDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    -- In production, this would move to an archive table
    -- For now, we'll just count what would be archived
    SELECT COUNT(*) AS RecordsToArchive
    FROM AuditLogs
    WHERE Timestamp < @ArchiveBeforeDate;

    -- Uncomment to actually delete (only after implementing archive table)
    -- DELETE FROM AuditLogs WHERE Timestamp < @ArchiveBeforeDate;
END
GO

PRINT 'Audit Log stored procedures created successfully.';
GO
