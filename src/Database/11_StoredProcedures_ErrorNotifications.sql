-- =============================================
-- Software Update Management System
-- Phase 4: Error Notifications Stored Procedures
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get All Error Notifications
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllErrorNotifications')
    DROP PROCEDURE sp_GetAllErrorNotifications;
GO

CREATE PROCEDURE sp_GetAllErrorNotifications
    @IsResolved BIT = NULL,
    @Severity NVARCHAR(50) = NULL,
    @ErrorType NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        en.ErrorNotificationId,
        en.CRFId,
        en.ClientId,
        en.ErrorType,
        en.ErrorSource,
        en.ErrorMessage,
        en.StackTrace,
        en.Severity,
        en.IsResolved,
        en.ResolvedBy,
        en.ResolvedDate,
        en.ResolutionNotes,
        en.NotificationSent,
        en.NotificationSentDate,
        en.CreatedDate,
        crf.CRFNumber,
        c.ClientName,
        u.FirstName + ' ' + u.LastName AS ResolvedByName
    FROM ErrorNotifications en
    LEFT JOIN CRFs crf ON en.CRFId = crf.CRFId
    LEFT JOIN Clients c ON en.ClientId = c.ClientId
    LEFT JOIN Users u ON en.ResolvedBy = u.UserId
    WHERE (@IsResolved IS NULL OR en.IsResolved = @IsResolved)
        AND (@Severity IS NULL OR en.Severity = @Severity)
        AND (@ErrorType IS NULL OR en.ErrorType = @ErrorType)
    ORDER BY en.CreatedDate DESC;
END
GO

-- =============================================
-- SP: Get Error Notification By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetErrorNotificationById')
    DROP PROCEDURE sp_GetErrorNotificationById;
GO

CREATE PROCEDURE sp_GetErrorNotificationById
    @ErrorNotificationId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        en.ErrorNotificationId,
        en.CRFId,
        en.ClientId,
        en.ErrorType,
        en.ErrorSource,
        en.ErrorMessage,
        en.StackTrace,
        en.Severity,
        en.IsResolved,
        en.ResolvedBy,
        en.ResolvedDate,
        en.ResolutionNotes,
        en.NotificationSent,
        en.NotificationSentDate,
        en.CreatedDate,
        crf.CRFNumber,
        c.ClientName,
        u.FirstName + ' ' + u.LastName AS ResolvedByName
    FROM ErrorNotifications en
    LEFT JOIN CRFs crf ON en.CRFId = crf.CRFId
    LEFT JOIN Clients c ON en.ClientId = c.ClientId
    LEFT JOIN Users u ON en.ResolvedBy = u.UserId
    WHERE en.ErrorNotificationId = @ErrorNotificationId;
END
GO

-- =============================================
-- SP: Create Error Notification
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateErrorNotification')
    DROP PROCEDURE sp_CreateErrorNotification;
GO

CREATE PROCEDURE sp_CreateErrorNotification
    @CRFId INT,
    @ClientId INT,
    @ErrorType NVARCHAR(50),
    @ErrorSource NVARCHAR(255),
    @ErrorMessage NVARCHAR(MAX),
    @StackTrace NVARCHAR(MAX),
    @Severity NVARCHAR(50),
    @ErrorNotificationId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO ErrorNotifications (
        CRFId, ClientId, ErrorType, ErrorSource, ErrorMessage, StackTrace, Severity
    )
    VALUES (
        @CRFId, @ClientId, @ErrorType, @ErrorSource, @ErrorMessage, @StackTrace, @Severity
    );
    
    SET @ErrorNotificationId = SCOPE_IDENTITY();
END
GO

-- =============================================
-- SP: Resolve Error Notification
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_ResolveErrorNotification')
    DROP PROCEDURE sp_ResolveErrorNotification;
GO

CREATE PROCEDURE sp_ResolveErrorNotification
    @ErrorNotificationId INT,
    @ResolvedBy INT,
    @ResolutionNotes NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ErrorNotifications
    SET 
        IsResolved = 1,
        ResolvedBy = @ResolvedBy,
        ResolvedDate = GETDATE(),
        ResolutionNotes = @ResolutionNotes
    WHERE ErrorNotificationId = @ErrorNotificationId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Mark Notification Sent
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_MarkNotificationSent')
    DROP PROCEDURE sp_MarkNotificationSent;
GO

CREATE PROCEDURE sp_MarkNotificationSent
    @ErrorNotificationId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ErrorNotifications
    SET 
        NotificationSent = 1,
        NotificationSentDate = GETDATE()
    WHERE ErrorNotificationId = @ErrorNotificationId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Get Error Statistics
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetErrorStatistics')
    DROP PROCEDURE sp_GetErrorStatistics;
GO

CREATE PROCEDURE sp_GetErrorStatistics
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) AS TotalErrors,
        SUM(CASE WHEN IsResolved = 0 THEN 1 ELSE 0 END) AS UnresolvedErrors,
        SUM(CASE WHEN IsResolved = 1 THEN 1 ELSE 0 END) AS ResolvedErrors,
        SUM(CASE WHEN Severity = 'Critical' AND IsResolved = 0 THEN 1 ELSE 0 END) AS CriticalErrors,
        SUM(CASE WHEN Severity = 'Error' AND IsResolved = 0 THEN 1 ELSE 0 END) AS ErrorCount,
        SUM(CASE WHEN Severity = 'Warning' AND IsResolved = 0 THEN 1 ELSE 0 END) AS WarningCount
    FROM ErrorNotifications;
    
    -- Error breakdown by type
    SELECT 
        ErrorType,
        COUNT(*) AS Count,
        SUM(CASE WHEN IsResolved = 0 THEN 1 ELSE 0 END) AS Unresolved
    FROM ErrorNotifications
    GROUP BY ErrorType
    ORDER BY Count DESC;
END
GO

PRINT 'Phase 4 Error Notifications Stored Procedures Created Successfully';
