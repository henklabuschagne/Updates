-- =============================================
-- Software Update Management System
-- Phase 4: Deployment Queue Stored Procedures
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get All Deployment Queue Items
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllDeploymentQueueItems')
    DROP PROCEDURE sp_GetAllDeploymentQueueItems;
GO

CREATE PROCEDURE sp_GetAllDeploymentQueueItems
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        dq.DeploymentQueueId,
        dq.CRFId,
        dq.ClientId,
        dq.QueuedBy,
        dq.QueuedDate,
        dq.ScheduledStartTime,
        dq.ActualStartTime,
        dq.CompletedTime,
        dq.Status,
        dq.Priority,
        dq.DeploymentType,
        dq.Notes,
        crf.CRFNumber,
        crf.Title AS CRFTitle,
        c.ClientName,
        u.FirstName + ' ' + u.LastName AS QueuedByName,
        v.VersionNumber
    FROM DeploymentQueue dq
    INNER JOIN CRFs crf ON dq.CRFId = crf.CRFId
    INNER JOIN Clients c ON dq.ClientId = c.ClientId
    INNER JOIN Users u ON dq.QueuedBy = u.UserId
    INNER JOIN SoftwareVersions v ON crf.VersionId = v.VersionId
    WHERE (@Status IS NULL OR dq.Status = @Status)
    ORDER BY dq.Priority DESC, dq.ScheduledStartTime ASC;
END
GO

-- =============================================
-- SP: Get Deployment Queue Item By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetDeploymentQueueItemById')
    DROP PROCEDURE sp_GetDeploymentQueueItemById;
GO

CREATE PROCEDURE sp_GetDeploymentQueueItemById
    @DeploymentQueueId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        dq.DeploymentQueueId,
        dq.CRFId,
        dq.ClientId,
        dq.QueuedBy,
        dq.QueuedDate,
        dq.ScheduledStartTime,
        dq.ActualStartTime,
        dq.CompletedTime,
        dq.Status,
        dq.Priority,
        dq.DeploymentType,
        dq.Notes,
        crf.CRFNumber,
        crf.Title AS CRFTitle,
        c.ClientName,
        u.FirstName + ' ' + u.LastName AS QueuedByName,
        v.VersionNumber
    FROM DeploymentQueue dq
    INNER JOIN CRFs crf ON dq.CRFId = crf.CRFId
    INNER JOIN Clients c ON dq.ClientId = c.ClientId
    INNER JOIN Users u ON dq.QueuedBy = u.UserId
    INNER JOIN SoftwareVersions v ON crf.VersionId = v.VersionId
    WHERE dq.DeploymentQueueId = @DeploymentQueueId;
END
GO

-- =============================================
-- SP: Add to Deployment Queue
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AddToDeploymentQueue')
    DROP PROCEDURE sp_AddToDeploymentQueue;
GO

CREATE PROCEDURE sp_AddToDeploymentQueue
    @CRFId INT,
    @ClientId INT,
    @QueuedBy INT,
    @ScheduledStartTime DATETIME2,
    @Priority INT,
    @DeploymentType NVARCHAR(50),
    @Notes NVARCHAR(MAX),
    @DeploymentQueueId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO DeploymentQueue (
        CRFId, ClientId, QueuedBy, ScheduledStartTime, Priority, DeploymentType, Notes
    )
    VALUES (
        @CRFId, @ClientId, @QueuedBy, @ScheduledStartTime, @Priority, @DeploymentType, @Notes
    );
    
    SET @DeploymentQueueId = SCOPE_IDENTITY();
END
GO

-- =============================================
-- SP: Update Deployment Queue Status
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateDeploymentQueueStatus')
    DROP PROCEDURE sp_UpdateDeploymentQueueStatus;
GO

CREATE PROCEDURE sp_UpdateDeploymentQueueStatus
    @DeploymentQueueId INT,
    @Status NVARCHAR(50),
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE DeploymentQueue
    SET 
        Status = @Status,
        ActualStartTime = CASE WHEN @Status = 'Running' AND ActualStartTime IS NULL THEN GETDATE() ELSE ActualStartTime END,
        CompletedTime = CASE WHEN @Status IN ('Completed', 'Failed', 'Cancelled', 'Rolled Back') THEN GETDATE() ELSE CompletedTime END,
        Notes = ISNULL(@Notes, Notes)
    WHERE DeploymentQueueId = @DeploymentQueueId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Cancel Deployment
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CancelDeployment')
    DROP PROCEDURE sp_CancelDeployment;
GO

CREATE PROCEDURE sp_CancelDeployment
    @DeploymentQueueId INT,
    @Notes NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE DeploymentQueue
    SET 
        Status = 'Cancelled',
        CompletedTime = GETDATE(),
        Notes = @Notes
    WHERE DeploymentQueueId = @DeploymentQueueId AND Status = 'Queued';
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Get Next Queued Deployment
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetNextQueuedDeployment')
    DROP PROCEDURE sp_GetNextQueuedDeployment;
GO

CREATE PROCEDURE sp_GetNextQueuedDeployment
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP 1
        dq.DeploymentQueueId,
        dq.CRFId,
        dq.ClientId,
        dq.QueuedBy,
        dq.QueuedDate,
        dq.ScheduledStartTime,
        dq.Priority,
        dq.DeploymentType,
        dq.Notes,
        crf.CRFNumber,
        crf.Title AS CRFTitle,
        c.ClientName,
        v.VersionNumber
    FROM DeploymentQueue dq
    INNER JOIN CRFs crf ON dq.CRFId = crf.CRFId
    INNER JOIN Clients c ON dq.ClientId = c.ClientId
    INNER JOIN SoftwareVersions v ON crf.VersionId = v.VersionId
    WHERE dq.Status = 'Queued'
        AND (dq.ScheduledStartTime IS NULL OR dq.ScheduledStartTime <= GETDATE())
    ORDER BY dq.Priority DESC, dq.QueuedDate ASC;
END
GO

PRINT 'Phase 4 Deployment Queue Stored Procedures Created Successfully';
