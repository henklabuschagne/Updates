-- =============================================
-- Software Update Management System
-- Phase 3: CRF Stored Procedures
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get All CRFs
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllCRFs')
    DROP PROCEDURE sp_GetAllCRFs;
GO

CREATE PROCEDURE sp_GetAllCRFs
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.CRFId,
        c.CRFNumber,
        c.Title,
        c.Description,
        c.VersionId,
        c.RequestedBy,
        c.Status,
        c.Priority,
        c.ScheduledDeploymentDate,
        c.ActualDeploymentDate,
        c.CreatedDate,
        c.UpdatedDate,
        c.CompletedDate,
        v.VersionNumber,
        v.VersionName,
        u.FirstName + ' ' + u.LastName AS RequestedByName,
        COUNT(DISTINCT cc.ClientId) AS ClientCount,
        SUM(CASE WHEN cc.DeploymentStatus = 'Success' THEN 1 ELSE 0 END) AS SuccessfulDeployments
    FROM CRFs c
    INNER JOIN SoftwareVersions v ON c.VersionId = v.VersionId
    LEFT JOIN Users u ON c.RequestedBy = u.UserId
    LEFT JOIN CRFClients cc ON c.CRFId = cc.CRFId
    WHERE (@Status IS NULL OR c.Status = @Status)
    GROUP BY c.CRFId, c.CRFNumber, c.Title, c.Description, c.VersionId, c.RequestedBy, 
             c.Status, c.Priority, c.ScheduledDeploymentDate, c.ActualDeploymentDate, 
             c.CreatedDate, c.UpdatedDate, c.CompletedDate, v.VersionNumber, v.VersionName, 
             u.FirstName, u.LastName
    ORDER BY c.CreatedDate DESC;
END
GO

-- =============================================
-- SP: Get CRF By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetCRFById')
    DROP PROCEDURE sp_GetCRFById;
GO

CREATE PROCEDURE sp_GetCRFById
    @CRFId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.CRFId,
        c.CRFNumber,
        c.Title,
        c.Description,
        c.VersionId,
        c.RequestedBy,
        c.Status,
        c.Priority,
        c.ScheduledDeploymentDate,
        c.ActualDeploymentDate,
        c.CreatedDate,
        c.UpdatedDate,
        c.CompletedDate,
        v.VersionNumber,
        v.VersionName,
        u.FirstName + ' ' + u.LastName AS RequestedByName
    FROM CRFs c
    INNER JOIN SoftwareVersions v ON c.VersionId = v.VersionId
    LEFT JOIN Users u ON c.RequestedBy = u.UserId
    WHERE c.CRFId = @CRFId;
END
GO

-- =============================================
-- SP: Create CRF
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateCRF')
    DROP PROCEDURE sp_CreateCRF;
GO

CREATE PROCEDURE sp_CreateCRF
    @CRFNumber NVARCHAR(50),
    @Title NVARCHAR(500),
    @Description NVARCHAR(MAX),
    @VersionId INT,
    @RequestedBy INT,
    @Priority NVARCHAR(50),
    @ScheduledDeploymentDate DATETIME2,
    @CRFId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if CRF number already exists
        IF EXISTS (SELECT 1 FROM CRFs WHERE CRFNumber = @CRFNumber)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('CRF number already exists', 16, 1);
            RETURN;
        END
        
        -- Insert CRF
        INSERT INTO CRFs (CRFNumber, Title, Description, VersionId, RequestedBy, Priority, ScheduledDeploymentDate, Status)
        VALUES (@CRFNumber, @Title, @Description, @VersionId, @RequestedBy, @Priority, @ScheduledDeploymentDate, 'Draft');
        
        SET @CRFId = SCOPE_IDENTITY();
        
        -- Create initial approval records for all workflow steps
        INSERT INTO CRFApprovals (CRFId, WorkflowStepId, Status)
        SELECT @CRFId, WorkflowStepId, 'Pending'
        FROM WorkflowSteps
        WHERE IsActive = 1
        ORDER BY StepOrder;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Update CRF
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateCRF')
    DROP PROCEDURE sp_UpdateCRF;
GO

CREATE PROCEDURE sp_UpdateCRF
    @CRFId INT,
    @Title NVARCHAR(500),
    @Description NVARCHAR(MAX),
    @Priority NVARCHAR(50),
    @ScheduledDeploymentDate DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE CRFs
    SET 
        Title = @Title,
        Description = @Description,
        Priority = @Priority,
        ScheduledDeploymentDate = @ScheduledDeploymentDate,
        UpdatedDate = GETDATE()
    WHERE CRFId = @CRFId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Update CRF Status
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateCRFStatus')
    DROP PROCEDURE sp_UpdateCRFStatus;
GO

CREATE PROCEDURE sp_UpdateCRFStatus
    @CRFId INT,
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE CRFs
    SET 
        Status = @Status,
        UpdatedDate = GETDATE(),
        CompletedDate = CASE WHEN @Status IN ('Deployed', 'Rejected', 'Failed', 'Rolled Back') THEN GETDATE() ELSE CompletedDate END,
        ActualDeploymentDate = CASE WHEN @Status = 'Deployed' THEN GETDATE() ELSE ActualDeploymentDate END
    WHERE CRFId = @CRFId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Delete CRF
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteCRF')
    DROP PROCEDURE sp_DeleteCRF;
GO

CREATE PROCEDURE sp_DeleteCRF
    @CRFId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if CRF can be deleted (only Draft status)
        IF EXISTS (SELECT 1 FROM CRFs WHERE CRFId = @CRFId AND Status != 'Draft')
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Only CRFs in Draft status can be deleted', 16, 1);
            RETURN;
        END
        
        -- Delete related records (cascade will handle most)
        DELETE FROM DeploymentLogs WHERE CRFId = @CRFId;
        DELETE FROM CRFApprovals WHERE CRFId = @CRFId;
        DELETE FROM CRFClients WHERE CRFId = @CRFId;
        DELETE FROM CRFs WHERE CRFId = @CRFId;
        
        COMMIT TRANSACTION;
        SELECT @@ROWCOUNT AS RowsAffected;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Add Clients to CRF
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AddClientsToCRF')
    DROP PROCEDURE sp_AddClientsToCRF;
GO

CREATE PROCEDURE sp_AddClientsToCRF
    @CRFId INT,
    @ClientIds NVARCHAR(MAX) -- Comma-separated client IDs
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Parse client IDs and insert
        INSERT INTO CRFClients (CRFId, ClientId, DeploymentStatus)
        SELECT @CRFId, CAST(value AS INT), 'Pending'
        FROM STRING_SPLIT(@ClientIds, ',')
        WHERE CAST(value AS INT) NOT IN (SELECT ClientId FROM CRFClients WHERE CRFId = @CRFId);
        
        COMMIT TRANSACTION;
        SELECT @@ROWCOUNT AS RowsAffected;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Get CRF Clients
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetCRFClients')
    DROP PROCEDURE sp_GetCRFClients;
GO

CREATE PROCEDURE sp_GetCRFClients
    @CRFId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        cc.CRFClientId,
        cc.CRFId,
        cc.ClientId,
        cc.DeploymentStatus,
        cc.DeploymentDate,
        cc.DeploymentNotes,
        c.ClientName,
        c.ContactEmail,
        c.CurrentVersion,
        c.CurrentVersionName
    FROM CRFClients cc
    INNER JOIN Clients c ON cc.ClientId = c.ClientId
    WHERE cc.CRFId = @CRFId
    ORDER BY c.ClientName;
END
GO

-- =============================================
-- SP: Get CRF Approvals
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetCRFApprovals')
    DROP PROCEDURE sp_GetCRFApprovals;
GO

CREATE PROCEDURE sp_GetCRFApprovals
    @CRFId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        a.CRFApprovalId,
        a.CRFId,
        a.WorkflowStepId,
        a.ApproverUserId,
        a.Status,
        a.ApprovalDate,
        a.Comments,
        a.CreatedDate,
        w.StepName,
        w.StepOrder,
        u.FirstName + ' ' + u.LastName AS ApproverName
    FROM CRFApprovals a
    INNER JOIN WorkflowSteps w ON a.WorkflowStepId = w.WorkflowStepId
    LEFT JOIN Users u ON a.ApproverUserId = u.UserId
    WHERE a.CRFId = @CRFId
    ORDER BY w.StepOrder;
END
GO

-- =============================================
-- SP: Update CRF Approval
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateCRFApproval')
    DROP PROCEDURE sp_UpdateCRFApproval;
GO

CREATE PROCEDURE sp_UpdateCRFApproval
    @CRFApprovalId INT,
    @ApproverUserId INT,
    @Status NVARCHAR(50),
    @Comments NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Update approval
        UPDATE CRFApprovals
        SET 
            ApproverUserId = @ApproverUserId,
            Status = @Status,
            ApprovalDate = GETDATE(),
            Comments = @Comments
        WHERE CRFApprovalId = @CRFApprovalId;
        
        -- Get CRF ID
        DECLARE @CRFId INT;
        SELECT @CRFId = CRFId FROM CRFApprovals WHERE CRFApprovalId = @CRFApprovalId;
        
        -- If rejected, update CRF status
        IF @Status = 'Rejected'
        BEGIN
            UPDATE CRFs SET Status = 'Rejected', UpdatedDate = GETDATE(), CompletedDate = GETDATE()
            WHERE CRFId = @CRFId;
        END
        ELSE IF @Status = 'Approved'
        BEGIN
            -- Check if all required steps are approved
            IF NOT EXISTS (
                SELECT 1 FROM CRFApprovals a
                INNER JOIN WorkflowSteps w ON a.WorkflowStepId = w.WorkflowStepId
                WHERE a.CRFId = @CRFId AND w.IsRequired = 1 AND a.Status != 'Approved'
            )
            BEGIN
                UPDATE CRFs SET Status = 'Approved', UpdatedDate = GETDATE()
                WHERE CRFId = @CRFId;
            END
        END
        
        COMMIT TRANSACTION;
        SELECT 1 AS Success;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Get Deployment Logs
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetDeploymentLogs')
    DROP PROCEDURE sp_GetDeploymentLogs;
GO

CREATE PROCEDURE sp_GetDeploymentLogs
    @CRFId INT,
    @ClientId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        dl.DeploymentLogId,
        dl.CRFId,
        dl.ClientId,
        dl.LogType,
        dl.LogMessage,
        dl.Severity,
        dl.CreatedDate,
        dl.CreatedBy,
        c.ClientName,
        u.FirstName + ' ' + u.LastName AS CreatedByName
    FROM DeploymentLogs dl
    LEFT JOIN Clients c ON dl.ClientId = c.ClientId
    LEFT JOIN Users u ON dl.CreatedBy = u.UserId
    WHERE dl.CRFId = @CRFId AND (@ClientId IS NULL OR dl.ClientId = @ClientId)
    ORDER BY dl.CreatedDate DESC;
END
GO

-- =============================================
-- SP: Add Deployment Log
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AddDeploymentLog')
    DROP PROCEDURE sp_AddDeploymentLog;
GO

CREATE PROCEDURE sp_AddDeploymentLog
    @CRFId INT,
    @ClientId INT,
    @LogType NVARCHAR(50),
    @LogMessage NVARCHAR(MAX),
    @Severity NVARCHAR(50),
    @CreatedBy INT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO DeploymentLogs (CRFId, ClientId, LogType, LogMessage, Severity, CreatedBy)
    VALUES (@CRFId, @ClientId, @LogType, @LogMessage, @Severity, @CreatedBy);
    
    SELECT SCOPE_IDENTITY() AS DeploymentLogId;
END
GO

PRINT 'Phase 3 CRF Stored Procedures Created Successfully';
