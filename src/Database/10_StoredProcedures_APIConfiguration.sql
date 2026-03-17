-- =============================================
-- Software Update Management System
-- Phase 4: API Configuration Stored Procedures
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get All API Configurations
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllAPIConfigurations')
    DROP PROCEDURE sp_GetAllAPIConfigurations;
GO

CREATE PROCEDURE sp_GetAllAPIConfigurations
    @APIType NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ac.APIConfigurationId,
        ac.APIName,
        ac.APIType,
        ac.HTTPMethod,
        ac.EndpointURL,
        ac.ExecutionOrder,
        ac.Headers,
        ac.RequestBody,
        ac.TimeoutSeconds,
        ac.RetryCount,
        ac.IsEnabled,
        ac.Description,
        ac.CreatedDate,
        ac.UpdatedDate,
        ac.CreatedBy,
        u.FirstName + ' ' + u.LastName AS CreatedByName
    FROM APIConfigurations ac
    LEFT JOIN Users u ON ac.CreatedBy = u.UserId
    WHERE (@APIType IS NULL OR ac.APIType = @APIType)
    ORDER BY ac.APIType, ac.ExecutionOrder;
END
GO

-- =============================================
-- SP: Get API Configuration By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAPIConfigurationById')
    DROP PROCEDURE sp_GetAPIConfigurationById;
GO

CREATE PROCEDURE sp_GetAPIConfigurationById
    @APIConfigurationId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ac.APIConfigurationId,
        ac.APIName,
        ac.APIType,
        ac.HTTPMethod,
        ac.EndpointURL,
        ac.ExecutionOrder,
        ac.Headers,
        ac.RequestBody,
        ac.TimeoutSeconds,
        ac.RetryCount,
        ac.IsEnabled,
        ac.Description,
        ac.CreatedDate,
        ac.UpdatedDate,
        ac.CreatedBy,
        u.FirstName + ' ' + u.LastName AS CreatedByName
    FROM APIConfigurations ac
    LEFT JOIN Users u ON ac.CreatedBy = u.UserId
    WHERE ac.APIConfigurationId = @APIConfigurationId;
END
GO

-- =============================================
-- SP: Create API Configuration
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateAPIConfiguration')
    DROP PROCEDURE sp_CreateAPIConfiguration;
GO

CREATE PROCEDURE sp_CreateAPIConfiguration
    @APIName NVARCHAR(255),
    @APIType NVARCHAR(50),
    @HTTPMethod NVARCHAR(10),
    @EndpointURL NVARCHAR(1000),
    @ExecutionOrder INT,
    @Headers NVARCHAR(MAX),
    @RequestBody NVARCHAR(MAX),
    @TimeoutSeconds INT,
    @RetryCount INT,
    @IsEnabled BIT,
    @Description NVARCHAR(500),
    @CreatedBy INT,
    @APIConfigurationId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO APIConfigurations (
        APIName, APIType, HTTPMethod, EndpointURL, ExecutionOrder, 
        Headers, RequestBody, TimeoutSeconds, RetryCount, IsEnabled, Description, CreatedBy
    )
    VALUES (
        @APIName, @APIType, @HTTPMethod, @EndpointURL, @ExecutionOrder, 
        @Headers, @RequestBody, @TimeoutSeconds, @RetryCount, @IsEnabled, @Description, @CreatedBy
    );
    
    SET @APIConfigurationId = SCOPE_IDENTITY();
END
GO

-- =============================================
-- SP: Update API Configuration
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateAPIConfiguration')
    DROP PROCEDURE sp_UpdateAPIConfiguration;
GO

CREATE PROCEDURE sp_UpdateAPIConfiguration
    @APIConfigurationId INT,
    @APIName NVARCHAR(255),
    @HTTPMethod NVARCHAR(10),
    @EndpointURL NVARCHAR(1000),
    @ExecutionOrder INT,
    @Headers NVARCHAR(MAX),
    @RequestBody NVARCHAR(MAX),
    @TimeoutSeconds INT,
    @RetryCount INT,
    @IsEnabled BIT,
    @Description NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE APIConfigurations
    SET 
        APIName = @APIName,
        HTTPMethod = @HTTPMethod,
        EndpointURL = @EndpointURL,
        ExecutionOrder = @ExecutionOrder,
        Headers = @Headers,
        RequestBody = @RequestBody,
        TimeoutSeconds = @TimeoutSeconds,
        RetryCount = @RetryCount,
        IsEnabled = @IsEnabled,
        Description = @Description,
        UpdatedDate = GETDATE()
    WHERE APIConfigurationId = @APIConfigurationId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Delete API Configuration
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteAPIConfiguration')
    DROP PROCEDURE sp_DeleteAPIConfiguration;
GO

CREATE PROCEDURE sp_DeleteAPIConfiguration
    @APIConfigurationId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM APIConfigurations WHERE APIConfigurationId = @APIConfigurationId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Toggle API Configuration
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_ToggleAPIConfiguration')
    DROP PROCEDURE sp_ToggleAPIConfiguration;
GO

CREATE PROCEDURE sp_ToggleAPIConfiguration
    @APIConfigurationId INT,
    @IsEnabled BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE APIConfigurations
    SET IsEnabled = @IsEnabled, UpdatedDate = GETDATE()
    WHERE APIConfigurationId = @APIConfigurationId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Get API Execution Logs
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAPIExecutionLogs')
    DROP PROCEDURE sp_GetAPIExecutionLogs;
GO

CREATE PROCEDURE sp_GetAPIExecutionLogs
    @CRFId INT = NULL,
    @ClientId INT = NULL,
    @Status NVARCHAR(50) = NULL,
    @Top INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Top)
        ael.APIExecutionLogId,
        ael.CRFId,
        ael.ClientId,
        ael.APIConfigurationId,
        ael.ExecutionType,
        ael.RequestURL,
        ael.RequestHeaders,
        ael.RequestBody,
        ael.ResponseStatusCode,
        ael.ResponseBody,
        ael.ExecutionStartTime,
        ael.ExecutionEndTime,
        ael.DurationMs,
        ael.Status,
        ael.ErrorMessage,
        ael.RetryAttempt,
        ac.APIName,
        c.ClientName,
        crf.CRFNumber
    FROM APIExecutionLogs ael
    INNER JOIN APIConfigurations ac ON ael.APIConfigurationId = ac.APIConfigurationId
    LEFT JOIN Clients c ON ael.ClientId = c.ClientId
    LEFT JOIN CRFs crf ON ael.CRFId = crf.CRFId
    WHERE (@CRFId IS NULL OR ael.CRFId = @CRFId)
        AND (@ClientId IS NULL OR ael.ClientId = @ClientId)
        AND (@Status IS NULL OR ael.Status = @Status)
    ORDER BY ael.ExecutionStartTime DESC;
END
GO

-- =============================================
-- SP: Add API Execution Log
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AddAPIExecutionLog')
    DROP PROCEDURE sp_AddAPIExecutionLog;
GO

CREATE PROCEDURE sp_AddAPIExecutionLog
    @CRFId INT,
    @ClientId INT,
    @APIConfigurationId INT,
    @ExecutionType NVARCHAR(50),
    @RequestURL NVARCHAR(1000),
    @RequestHeaders NVARCHAR(MAX),
    @RequestBody NVARCHAR(MAX),
    @ResponseStatusCode INT,
    @ResponseBody NVARCHAR(MAX),
    @ExecutionStartTime DATETIME2,
    @ExecutionEndTime DATETIME2,
    @DurationMs INT,
    @Status NVARCHAR(50),
    @ErrorMessage NVARCHAR(MAX),
    @RetryAttempt INT,
    @APIExecutionLogId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO APIExecutionLogs (
        CRFId, ClientId, APIConfigurationId, ExecutionType, RequestURL, 
        RequestHeaders, RequestBody, ResponseStatusCode, ResponseBody, 
        ExecutionStartTime, ExecutionEndTime, DurationMs, Status, ErrorMessage, RetryAttempt
    )
    VALUES (
        @CRFId, @ClientId, @APIConfigurationId, @ExecutionType, @RequestURL, 
        @RequestHeaders, @RequestBody, @ResponseStatusCode, @ResponseBody, 
        @ExecutionStartTime, @ExecutionEndTime, @DurationMs, @Status, @ErrorMessage, @RetryAttempt
    );
    
    SET @APIExecutionLogId = SCOPE_IDENTITY();
END
GO

PRINT 'Phase 4 API Configuration Stored Procedures Created Successfully';
