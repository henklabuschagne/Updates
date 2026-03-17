-- =============================================
-- Software Update Management System
-- Phase 3: Workflow Stored Procedures
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get All Workflow Steps
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllWorkflowSteps')
    DROP PROCEDURE sp_GetAllWorkflowSteps;
GO

CREATE PROCEDURE sp_GetAllWorkflowSteps
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        WorkflowStepId,
        StepName,
        StepOrder,
        IsRequired,
        IsActive,
        CreatedDate
    FROM WorkflowSteps
    WHERE IsActive = 1
    ORDER BY StepOrder;
END
GO

-- =============================================
-- SP: Create Workflow Step
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateWorkflowStep')
    DROP PROCEDURE sp_CreateWorkflowStep;
GO

CREATE PROCEDURE sp_CreateWorkflowStep
    @StepName NVARCHAR(255),
    @StepOrder INT,
    @IsRequired BIT,
    @WorkflowStepId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if step order already exists
        IF EXISTS (SELECT 1 FROM WorkflowSteps WHERE StepOrder = @StepOrder AND IsActive = 1)
        BEGIN
            -- Shift existing steps down
            UPDATE WorkflowSteps
            SET StepOrder = StepOrder + 1
            WHERE StepOrder >= @StepOrder AND IsActive = 1;
        END
        
        INSERT INTO WorkflowSteps (StepName, StepOrder, IsRequired)
        VALUES (@StepName, @StepOrder, @IsRequired);
        
        SET @WorkflowStepId = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Update Workflow Step
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateWorkflowStep')
    DROP PROCEDURE sp_UpdateWorkflowStep;
GO

CREATE PROCEDURE sp_UpdateWorkflowStep
    @WorkflowStepId INT,
    @StepName NVARCHAR(255),
    @IsRequired BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE WorkflowSteps
    SET 
        StepName = @StepName,
        IsRequired = @IsRequired
    WHERE WorkflowStepId = @WorkflowStepId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Delete Workflow Step
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteWorkflowStep')
    DROP PROCEDURE sp_DeleteWorkflowStep;
GO

CREATE PROCEDURE sp_DeleteWorkflowStep
    @WorkflowStepId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if step is in use
        IF EXISTS (SELECT 1 FROM CRFApprovals WHERE WorkflowStepId = @WorkflowStepId)
        BEGIN
            -- Soft delete
            UPDATE WorkflowSteps
            SET IsActive = 0
            WHERE WorkflowStepId = @WorkflowStepId;
        END
        ELSE
        BEGIN
            -- Hard delete and reorder
            DECLARE @StepOrder INT;
            SELECT @StepOrder = StepOrder FROM WorkflowSteps WHERE WorkflowStepId = @WorkflowStepId;
            
            DELETE FROM WorkflowSteps WHERE WorkflowStepId = @WorkflowStepId;
            
            -- Shift remaining steps up
            UPDATE WorkflowSteps
            SET StepOrder = StepOrder - 1
            WHERE StepOrder > @StepOrder AND IsActive = 1;
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
-- SP: Reorder Workflow Steps
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_ReorderWorkflowSteps')
    DROP PROCEDURE sp_ReorderWorkflowSteps;
GO

CREATE PROCEDURE sp_ReorderWorkflowSteps
    @WorkflowStepId INT,
    @NewStepOrder INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DECLARE @OldStepOrder INT;
        SELECT @OldStepOrder = StepOrder FROM WorkflowSteps WHERE WorkflowStepId = @WorkflowStepId;
        
        IF @OldStepOrder < @NewStepOrder
        BEGIN
            -- Moving down
            UPDATE WorkflowSteps
            SET StepOrder = StepOrder - 1
            WHERE StepOrder > @OldStepOrder AND StepOrder <= @NewStepOrder AND IsActive = 1;
        END
        ELSE IF @OldStepOrder > @NewStepOrder
        BEGIN
            -- Moving up
            UPDATE WorkflowSteps
            SET StepOrder = StepOrder + 1
            WHERE StepOrder >= @NewStepOrder AND StepOrder < @OldStepOrder AND IsActive = 1;
        END
        
        -- Update the target step
        UPDATE WorkflowSteps
        SET StepOrder = @NewStepOrder
        WHERE WorkflowStepId = @WorkflowStepId;
        
        COMMIT TRANSACTION;
        SELECT 1 AS Success;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Phase 3 Workflow Stored Procedures Created Successfully';
