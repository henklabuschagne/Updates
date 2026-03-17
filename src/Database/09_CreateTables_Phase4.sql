-- =============================================
-- Software Update Management System
-- Phase 4: Deployment & API Configuration
-- Database Tables
-- =============================================

USE SoftwareUpdateManagement;
GO

-- APIConfigurations Table (Sequential deployment and rollback APIs)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'APIConfigurations')
BEGIN
    CREATE TABLE APIConfigurations (
        APIConfigurationId INT IDENTITY(1,1) PRIMARY KEY,
        APIName NVARCHAR(255) NOT NULL,
        APIType NVARCHAR(50) NOT NULL,
        HTTPMethod NVARCHAR(10) NOT NULL,
        EndpointURL NVARCHAR(1000) NOT NULL,
        ExecutionOrder INT NOT NULL,
        Headers NVARCHAR(MAX) NULL,
        RequestBody NVARCHAR(MAX) NULL,
        TimeoutSeconds INT DEFAULT 300,
        RetryCount INT DEFAULT 3,
        IsEnabled BIT DEFAULT 1,
        Description NVARCHAR(500) NULL,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        UpdatedDate DATETIME2 NULL,
        CreatedBy INT NULL,
        CONSTRAINT FK_APIConfigurations_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
        CONSTRAINT CHK_APIType CHECK (APIType IN ('Deployment', 'Rollback')),
        CONSTRAINT CHK_HTTPMethod CHECK (HTTPMethod IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE'))
    );

    CREATE INDEX IX_APIConfigurations_APIType ON APIConfigurations(APIType);
    CREATE INDEX IX_APIConfigurations_ExecutionOrder ON APIConfigurations(ExecutionOrder);
    CREATE INDEX IX_APIConfigurations_IsEnabled ON APIConfigurations(IsEnabled);
END
GO

-- APIExecutionLogs Table (Track API call execution)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'APIExecutionLogs')
BEGIN
    CREATE TABLE APIExecutionLogs (
        APIExecutionLogId INT IDENTITY(1,1) PRIMARY KEY,
        CRFId INT NOT NULL,
        ClientId INT NULL,
        APIConfigurationId INT NOT NULL,
        ExecutionType NVARCHAR(50) NOT NULL,
        RequestURL NVARCHAR(1000) NOT NULL,
        RequestHeaders NVARCHAR(MAX) NULL,
        RequestBody NVARCHAR(MAX) NULL,
        ResponseStatusCode INT NULL,
        ResponseBody NVARCHAR(MAX) NULL,
        ExecutionStartTime DATETIME2 DEFAULT GETDATE(),
        ExecutionEndTime DATETIME2 NULL,
        DurationMs INT NULL,
        Status NVARCHAR(50) DEFAULT 'Pending',
        ErrorMessage NVARCHAR(MAX) NULL,
        RetryAttempt INT DEFAULT 0,
        CONSTRAINT FK_APIExecutionLogs_CRF FOREIGN KEY (CRFId) REFERENCES CRFs(CRFId) ON DELETE CASCADE,
        CONSTRAINT FK_APIExecutionLogs_Client FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
        CONSTRAINT FK_APIExecutionLogs_APIConfiguration FOREIGN KEY (APIConfigurationId) REFERENCES APIConfigurations(APIConfigurationId),
        CONSTRAINT CHK_ExecutionType CHECK (ExecutionType IN ('Deployment', 'Rollback')),
        CONSTRAINT CHK_ExecutionStatus CHECK (Status IN ('Pending', 'Running', 'Success', 'Failed', 'Timeout'))
    );

    CREATE INDEX IX_APIExecutionLogs_CRFId ON APIExecutionLogs(CRFId);
    CREATE INDEX IX_APIExecutionLogs_Status ON APIExecutionLogs(Status);
    CREATE INDEX IX_APIExecutionLogs_ExecutionStartTime ON APIExecutionLogs(ExecutionStartTime DESC);
END
GO

-- ErrorNotifications Table (Error reporting and notifications)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ErrorNotifications')
BEGIN
    CREATE TABLE ErrorNotifications (
        ErrorNotificationId INT IDENTITY(1,1) PRIMARY KEY,
        CRFId INT NULL,
        ClientId INT NULL,
        ErrorType NVARCHAR(50) NOT NULL,
        ErrorSource NVARCHAR(255) NOT NULL,
        ErrorMessage NVARCHAR(MAX) NOT NULL,
        StackTrace NVARCHAR(MAX) NULL,
        Severity NVARCHAR(50) DEFAULT 'Error',
        IsResolved BIT DEFAULT 0,
        ResolvedBy INT NULL,
        ResolvedDate DATETIME2 NULL,
        ResolutionNotes NVARCHAR(MAX) NULL,
        NotificationSent BIT DEFAULT 0,
        NotificationSentDate DATETIME2 NULL,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_ErrorNotifications_CRF FOREIGN KEY (CRFId) REFERENCES CRFs(CRFId),
        CONSTRAINT FK_ErrorNotifications_Client FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
        CONSTRAINT FK_ErrorNotifications_ResolvedBy FOREIGN KEY (ResolvedBy) REFERENCES Users(UserId),
        CONSTRAINT CHK_ErrorType CHECK (ErrorType IN ('Deployment', 'Rollback', 'API', 'Database', 'System', 'Validation')),
        CONSTRAINT CHK_ErrorSeverity CHECK (Severity IN ('Info', 'Warning', 'Error', 'Critical'))
    );

    CREATE INDEX IX_ErrorNotifications_IsResolved ON ErrorNotifications(IsResolved);
    CREATE INDEX IX_ErrorNotifications_Severity ON ErrorNotifications(Severity);
    CREATE INDEX IX_ErrorNotifications_CreatedDate ON ErrorNotifications(CreatedDate DESC);
END
GO

-- DeploymentQueue Table (Manual and automatic deployment queue)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeploymentQueue')
BEGIN
    CREATE TABLE DeploymentQueue (
        DeploymentQueueId INT IDENTITY(1,1) PRIMARY KEY,
        CRFId INT NOT NULL,
        ClientId INT NOT NULL,
        QueuedBy INT NOT NULL,
        QueuedDate DATETIME2 DEFAULT GETDATE(),
        ScheduledStartTime DATETIME2 NULL,
        ActualStartTime DATETIME2 NULL,
        CompletedTime DATETIME2 NULL,
        Status NVARCHAR(50) DEFAULT 'Queued',
        Priority INT DEFAULT 5,
        DeploymentType NVARCHAR(50) DEFAULT 'Automatic',
        Notes NVARCHAR(MAX) NULL,
        CONSTRAINT FK_DeploymentQueue_CRF FOREIGN KEY (CRFId) REFERENCES CRFs(CRFId),
        CONSTRAINT FK_DeploymentQueue_Client FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
        CONSTRAINT FK_DeploymentQueue_QueuedBy FOREIGN KEY (QueuedBy) REFERENCES Users(UserId),
        CONSTRAINT CHK_DeploymentQueueStatus CHECK (Status IN ('Queued', 'Running', 'Completed', 'Failed', 'Cancelled', 'Rolled Back')),
        CONSTRAINT CHK_DeploymentType CHECK (DeploymentType IN ('Automatic', 'Manual'))
    );

    CREATE INDEX IX_DeploymentQueue_Status ON DeploymentQueue(Status);
    CREATE INDEX IX_DeploymentQueue_ScheduledStartTime ON DeploymentQueue(ScheduledStartTime);
    CREATE INDEX IX_DeploymentQueue_Priority ON DeploymentQueue(Priority DESC);
END
GO

-- Insert Sample API Configurations
IF NOT EXISTS (SELECT * FROM APIConfigurations WHERE APIName = 'Backup Database')
BEGIN
    DECLARE @DevOpsUserId INT = (SELECT TOP 1 UserId FROM Users WHERE Username = 'admin');
    
    -- Deployment APIs
    INSERT INTO APIConfigurations (APIName, APIType, HTTPMethod, EndpointURL, ExecutionOrder, Headers, RequestBody, TimeoutSeconds, RetryCount, IsEnabled, Description, CreatedBy)
    VALUES 
    ('Backup Database', 'Deployment', 'POST', 'https://api.example.com/deployment/backup', 1, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"action": "backup", "timestamp": "{TIMESTAMP}"}', 600, 3, 1, 'Create backup before deployment', @DevOpsUserId),
    ('Stop Application Services', 'Deployment', 'POST', 'https://api.example.com/deployment/services/stop', 2, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"clientId": "{CLIENT_ID}", "services": ["web", "api"]}', 300, 3, 1, 'Stop application services', @DevOpsUserId),
    ('Deploy New Version', 'Deployment', 'POST', 'https://api.example.com/deployment/deploy', 3, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"version": "{VERSION}", "clientId": "{CLIENT_ID}"}', 900, 3, 1, 'Deploy new software version', @DevOpsUserId),
    ('Run Database Migrations', 'Deployment', 'POST', 'https://api.example.com/deployment/migrate', 4, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"version": "{VERSION}", "clientId": "{CLIENT_ID}"}', 600, 3, 1, 'Execute database migrations', @DevOpsUserId),
    ('Start Application Services', 'Deployment', 'POST', 'https://api.example.com/deployment/services/start', 5, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"clientId": "{CLIENT_ID}", "services": ["web", "api"]}', 300, 3, 1, 'Start application services', @DevOpsUserId),
    ('Verify Deployment', 'Deployment', 'GET', 'https://api.example.com/deployment/verify/{CLIENT_ID}', 6, '{"Authorization": "Bearer {API_KEY}"}', NULL, 180, 3, 1, 'Verify deployment success', @DevOpsUserId);
    
    -- Rollback APIs
    INSERT INTO APIConfigurations (APIName, APIType, HTTPMethod, EndpointURL, ExecutionOrder, Headers, RequestBody, TimeoutSeconds, RetryCount, IsEnabled, Description, CreatedBy)
    VALUES 
    ('Stop Application Services', 'Rollback', 'POST', 'https://api.example.com/rollback/services/stop', 1, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"clientId": "{CLIENT_ID}", "services": ["web", "api"]}', 300, 3, 1, 'Stop services for rollback', @DevOpsUserId),
    ('Restore Database Backup', 'Rollback', 'POST', 'https://api.example.com/rollback/restore', 2, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"clientId": "{CLIENT_ID}", "backupId": "{BACKUP_ID}"}', 900, 3, 1, 'Restore database from backup', @DevOpsUserId),
    ('Deploy Previous Version', 'Rollback', 'POST', 'https://api.example.com/rollback/deploy', 3, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"version": "{PREVIOUS_VERSION}", "clientId": "{CLIENT_ID}"}', 900, 3, 1, 'Deploy previous version', @DevOpsUserId),
    ('Start Application Services', 'Rollback', 'POST', 'https://api.example.com/rollback/services/start', 4, '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}', '{"clientId": "{CLIENT_ID}", "services": ["web", "api"]}', 300, 3, 1, 'Start services after rollback', @DevOpsUserId),
    ('Verify Rollback', 'Rollback', 'GET', 'https://api.example.com/rollback/verify/{CLIENT_ID}', 5, '{"Authorization": "Bearer {API_KEY}"}', NULL, 180, 3, 1, 'Verify rollback success', @DevOpsUserId);
END
GO

-- Insert Sample Error Notifications
IF NOT EXISTS (SELECT * FROM ErrorNotifications WHERE ErrorNotificationId = 1)
BEGIN
    DECLARE @CRF1Id INT = (SELECT TOP 1 CRFId FROM CRFs WHERE CRFNumber = 'CRF-2024-001');
    DECLARE @Client1Id INT = (SELECT TOP 1 ClientId FROM Clients WHERE ClientName = 'Global Tech Industries');
    
    INSERT INTO ErrorNotifications (CRFId, ClientId, ErrorType, ErrorSource, ErrorMessage, Severity, IsResolved, CreatedDate)
    VALUES 
    (@CRF1Id, @Client1Id, 'Deployment', 'API Execution', 'Timeout while connecting to deployment endpoint', 'Warning', 1, DATEADD(DAY, -7, GETDATE())),
    (@CRF1Id, @Client1Id, 'API', 'Database Migration', 'Migration script failed for table ClientData', 'Error', 0, DATEADD(DAY, -3, GETDATE()));
END
GO

PRINT 'Phase 4 Tables Created Successfully';
