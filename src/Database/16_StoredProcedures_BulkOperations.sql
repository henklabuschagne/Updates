-- =============================================
-- Stored Procedures: Bulk Operations
-- Purpose: Handle bulk operations tracking
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- Stored Procedure: sp_CreateBulkOperation
-- Description: Create a new bulk operation record
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateBulkOperation]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_CreateBulkOperation;
GO

CREATE PROCEDURE sp_CreateBulkOperation
    @OperationType NVARCHAR(50),
    @InitiatedBy INT,
    @TotalItems INT,
    @Parameters NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO BulkOperations (
            OperationType, InitiatedBy, TotalItems, Parameters
        )
        VALUES (
            @OperationType, @InitiatedBy, @TotalItems, @Parameters
        );

        SELECT 
            BulkOperationId,
            OperationType,
            InitiatedBy,
            Status,
            TotalItems,
            ProcessedItems,
            SuccessfulItems,
            FailedItems,
            Parameters,
            Results,
            ErrorMessage,
            StartedAt,
            CompletedAt,
            CreatedAt
        FROM BulkOperations
        WHERE BulkOperationId = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- =============================================
-- Stored Procedure: sp_UpdateBulkOperationProgress
-- Description: Update bulk operation progress
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateBulkOperationProgress]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_UpdateBulkOperationProgress;
GO

CREATE PROCEDURE sp_UpdateBulkOperationProgress
    @BulkOperationId INT,
    @ProcessedItems INT,
    @SuccessfulItems INT,
    @FailedItems INT,
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE BulkOperations
    SET ProcessedItems = @ProcessedItems,
        SuccessfulItems = @SuccessfulItems,
        FailedItems = @FailedItems,
        Status = COALESCE(@Status, Status),
        StartedAt = CASE WHEN StartedAt IS NULL THEN GETDATE() ELSE StartedAt END
    WHERE BulkOperationId = @BulkOperationId;

    SELECT 
        BulkOperationId,
        OperationType,
        InitiatedBy,
        Status,
        TotalItems,
        ProcessedItems,
        SuccessfulItems,
        FailedItems,
        Parameters,
        Results,
        ErrorMessage,
        StartedAt,
        CompletedAt,
        CreatedAt
    FROM BulkOperations
    WHERE BulkOperationId = @BulkOperationId;
END
GO

-- =============================================
-- Stored Procedure: sp_CompleteBulkOperation
-- Description: Mark a bulk operation as completed
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CompleteBulkOperation]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_CompleteBulkOperation;
GO

CREATE PROCEDURE sp_CompleteBulkOperation
    @BulkOperationId INT,
    @Status NVARCHAR(50),
    @Results NVARCHAR(MAX) = NULL,
    @ErrorMessage NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE BulkOperations
    SET Status = @Status,
        Results = @Results,
        ErrorMessage = @ErrorMessage,
        CompletedAt = GETDATE()
    WHERE BulkOperationId = @BulkOperationId;

    SELECT 
        BulkOperationId,
        OperationType,
        InitiatedBy,
        Status,
        TotalItems,
        ProcessedItems,
        SuccessfulItems,
        FailedItems,
        Parameters,
        Results,
        ErrorMessage,
        StartedAt,
        CompletedAt,
        CreatedAt
    FROM BulkOperations
    WHERE BulkOperationId = @BulkOperationId;
END
GO

-- =============================================
-- Stored Procedure: sp_GetBulkOperationById
-- Description: Get a specific bulk operation
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetBulkOperationById]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetBulkOperationById;
GO

CREATE PROCEDURE sp_GetBulkOperationById
    @BulkOperationId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        bo.BulkOperationId,
        bo.OperationType,
        bo.InitiatedBy,
        u.Username AS InitiatedByUsername,
        bo.Status,
        bo.TotalItems,
        bo.ProcessedItems,
        bo.SuccessfulItems,
        bo.FailedItems,
        bo.Parameters,
        bo.Results,
        bo.ErrorMessage,
        bo.StartedAt,
        bo.CompletedAt,
        bo.CreatedAt
    FROM BulkOperations bo
    LEFT JOIN Users u ON bo.InitiatedBy = u.UserId
    WHERE bo.BulkOperationId = @BulkOperationId;
END
GO

-- =============================================
-- Stored Procedure: sp_GetAllBulkOperations
-- Description: Get all bulk operations with filtering
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetAllBulkOperations]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetAllBulkOperations;
GO

CREATE PROCEDURE sp_GetAllBulkOperations
    @InitiatedBy INT = NULL,
    @Status NVARCHAR(50) = NULL,
    @OperationType NVARCHAR(50) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    -- Get total count
    SELECT COUNT(*) AS TotalRecords
    FROM BulkOperations
    WHERE (@InitiatedBy IS NULL OR InitiatedBy = @InitiatedBy)
        AND (@Status IS NULL OR Status = @Status)
        AND (@OperationType IS NULL OR OperationType = @OperationType);

    -- Get paginated results
    SELECT 
        bo.BulkOperationId,
        bo.OperationType,
        bo.InitiatedBy,
        u.Username AS InitiatedByUsername,
        bo.Status,
        bo.TotalItems,
        bo.ProcessedItems,
        bo.SuccessfulItems,
        bo.FailedItems,
        bo.StartedAt,
        bo.CompletedAt,
        bo.CreatedAt
    FROM BulkOperations bo
    LEFT JOIN Users u ON bo.InitiatedBy = u.UserId
    WHERE (@InitiatedBy IS NULL OR bo.InitiatedBy = @InitiatedBy)
        AND (@Status IS NULL OR bo.Status = @Status)
        AND (@OperationType IS NULL OR bo.OperationType = @OperationType)
    ORDER BY bo.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- =============================================
-- Stored Procedure: sp_GetBulkOperationStatistics
-- Description: Get bulk operation statistics
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetBulkOperationStatistics]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetBulkOperationStatistics;
GO

CREATE PROCEDURE sp_GetBulkOperationStatistics
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Overall statistics
    SELECT 
        COUNT(*) AS TotalOperations,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedOperations,
        SUM(CASE WHEN Status = 'Failed' THEN 1 ELSE 0 END) AS FailedOperations,
        SUM(CASE WHEN Status = 'InProgress' THEN 1 ELSE 0 END) AS InProgressOperations,
        SUM(TotalItems) AS TotalItemsProcessed,
        SUM(SuccessfulItems) AS TotalSuccessfulItems,
        SUM(FailedItems) AS TotalFailedItems
    FROM BulkOperations
    WHERE (@StartDate IS NULL OR CreatedAt >= @StartDate)
        AND (@EndDate IS NULL OR CreatedAt <= @EndDate);

    -- By operation type
    SELECT 
        OperationType,
        COUNT(*) AS OperationCount,
        AVG(CAST(SuccessfulItems AS FLOAT) / NULLIF(TotalItems, 0) * 100) AS AverageSuccessRate
    FROM BulkOperations
    WHERE (@StartDate IS NULL OR CreatedAt >= @StartDate)
        AND (@EndDate IS NULL OR CreatedAt <= @EndDate)
    GROUP BY OperationType
    ORDER BY OperationCount DESC;
END
GO

PRINT 'Bulk Operations stored procedures created successfully.';
GO
