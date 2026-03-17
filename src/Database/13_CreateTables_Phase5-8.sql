-- =============================================
-- Phase 5-8: Advanced Features Database Schema
-- Tables for: Notifications, Audit Logging, Bulk Operations, Advanced Search, System Monitoring
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- Table: Notifications
-- Purpose: Store system notifications for users
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE Notifications (
        NotificationId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Type NVARCHAR(50) NOT NULL, -- 'Info', 'Success', 'Warning', 'Error', 'CRF', 'Deployment'
        Priority NVARCHAR(20) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
        IsRead BIT NOT NULL DEFAULT 0,
        RelatedEntityType NVARCHAR(50) NULL, -- 'CRF', 'Deployment', 'Client', 'Version', etc.
        RelatedEntityId INT NULL,
        ActionUrl NVARCHAR(500) NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        ReadAt DATETIME NULL,
        ExpiresAt DATETIME NULL,
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_Notifications_UserId ON Notifications(UserId);
    CREATE NONCLUSTERED INDEX IX_Notifications_IsRead ON Notifications(IsRead);
    CREATE NONCLUSTERED INDEX IX_Notifications_CreatedAt ON Notifications(CreatedAt DESC);
    CREATE NONCLUSTERED INDEX IX_Notifications_Type ON Notifications(Type);

    PRINT 'Table Notifications created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Notifications already exists.';
END
GO

-- =============================================
-- Table: AuditLogs
-- Purpose: Track all system actions for compliance and debugging
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE AuditLogs (
        AuditLogId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NULL,
        Username NVARCHAR(100) NULL,
        Action NVARCHAR(100) NOT NULL, -- 'Create', 'Update', 'Delete', 'Login', 'Logout', 'Approve', 'Reject', 'Deploy', 'Rollback', etc.
        EntityType NVARCHAR(50) NOT NULL, -- 'CRF', 'Client', 'Version', 'User', 'Deployment', etc.
        EntityId INT NULL,
        EntityName NVARCHAR(255) NULL,
        OldValues NVARCHAR(MAX) NULL, -- JSON
        NewValues NVARCHAR(MAX) NULL, -- JSON
        Details NVARCHAR(MAX) NULL,
        IPAddress NVARCHAR(50) NULL,
        UserAgent NVARCHAR(500) NULL,
        Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL
    );

    CREATE NONCLUSTERED INDEX IX_AuditLogs_UserId ON AuditLogs(UserId);
    CREATE NONCLUSTERED INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp DESC);
    CREATE NONCLUSTERED INDEX IX_AuditLogs_EntityType ON AuditLogs(EntityType);
    CREATE NONCLUSTERED INDEX IX_AuditLogs_Action ON AuditLogs(Action);

    PRINT 'Table AuditLogs created successfully.';
END
ELSE
BEGIN
    PRINT 'Table AuditLogs already exists.';
END
GO

-- =============================================
-- Table: BulkOperations
-- Purpose: Track bulk operations progress and results
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BulkOperations]') AND type in (N'U'))
BEGIN
    CREATE TABLE BulkOperations (
        BulkOperationId INT IDENTITY(1,1) PRIMARY KEY,
        OperationType NVARCHAR(50) NOT NULL, -- 'BulkCRFCreate', 'BulkClientUpdate', 'BulkDeployment', etc.
        InitiatedBy INT NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'InProgress', 'Completed', 'Failed', 'PartiallyCompleted'
        TotalItems INT NOT NULL,
        ProcessedItems INT NOT NULL DEFAULT 0,
        SuccessfulItems INT NOT NULL DEFAULT 0,
        FailedItems INT NOT NULL DEFAULT 0,
        Parameters NVARCHAR(MAX) NULL, -- JSON
        Results NVARCHAR(MAX) NULL, -- JSON
        ErrorMessage NVARCHAR(MAX) NULL,
        StartedAt DATETIME NULL,
        CompletedAt DATETIME NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_BulkOperations_Users FOREIGN KEY (InitiatedBy) REFERENCES Users(UserId)
    );

    CREATE NONCLUSTERED INDEX IX_BulkOperations_InitiatedBy ON BulkOperations(InitiatedBy);
    CREATE NONCLUSTERED INDEX IX_BulkOperations_Status ON BulkOperations(Status);
    CREATE NONCLUSTERED INDEX IX_BulkOperations_CreatedAt ON BulkOperations(CreatedAt DESC);

    PRINT 'Table BulkOperations created successfully.';
END
ELSE
BEGIN
    PRINT 'Table BulkOperations already exists.';
END
GO

-- =============================================
-- Table: CRFTemplates
-- Purpose: Store reusable CRF templates
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CRFTemplates]') AND type in (N'U'))
BEGIN
    CREATE TABLE CRFTemplates (
        TemplateId INT IDENTITY(1,1) PRIMARY KEY,
        TemplateName NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Category NVARCHAR(100) NULL, -- 'Security', 'Feature', 'Bugfix', 'Hotfix', etc.
        VersionId INT NULL,
        ChangeDescription NVARCHAR(MAX) NULL,
        ImpactAssessment NVARCHAR(MAX) NULL,
        RollbackPlan NVARCHAR(MAX) NULL,
        TestingProcedure NVARCHAR(MAX) NULL,
        DefaultPriority NVARCHAR(20) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedBy INT NOT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_CRFTemplates_Versions FOREIGN KEY (VersionId) REFERENCES SoftwareVersions(VersionId) ON DELETE SET NULL,
        CONSTRAINT FK_CRFTemplates_Users FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
    );

    CREATE NONCLUSTERED INDEX IX_CRFTemplates_Category ON CRFTemplates(Category);
    CREATE NONCLUSTERED INDEX IX_CRFTemplates_IsActive ON CRFTemplates(IsActive);

    PRINT 'Table CRFTemplates created successfully.';
END
ELSE
BEGIN
    PRINT 'Table CRFTemplates already exists.';
END
GO

-- =============================================
-- Table: SystemHealthMetrics
-- Purpose: Store system health monitoring data
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SystemHealthMetrics]') AND type in (N'U'))
BEGIN
    CREATE TABLE SystemHealthMetrics (
        MetricId INT IDENTITY(1,1) PRIMARY KEY,
        MetricType NVARCHAR(50) NOT NULL, -- 'CPU', 'Memory', 'DiskSpace', 'APIResponseTime', 'DatabaseConnections', etc.
        MetricValue DECIMAL(18,2) NOT NULL,
        Unit NVARCHAR(20) NULL, -- 'Percentage', 'MB', 'GB', 'ms', 'count', etc.
        Status NVARCHAR(20) NOT NULL, -- 'Healthy', 'Warning', 'Critical'
        ThresholdWarning DECIMAL(18,2) NULL,
        ThresholdCritical DECIMAL(18,2) NULL,
        AdditionalData NVARCHAR(MAX) NULL, -- JSON
        Timestamp DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE NONCLUSTERED INDEX IX_SystemHealthMetrics_MetricType ON SystemHealthMetrics(MetricType);
    CREATE NONCLUSTERED INDEX IX_SystemHealthMetrics_Timestamp ON SystemHealthMetrics(Timestamp DESC);
    CREATE NONCLUSTERED INDEX IX_SystemHealthMetrics_Status ON SystemHealthMetrics(Status);

    PRINT 'Table SystemHealthMetrics created successfully.';
END
ELSE
BEGIN
    PRINT 'Table SystemHealthMetrics already exists.';
END
GO

-- =============================================
-- Table: SearchIndexCache
-- Purpose: Cache for advanced search indexing
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SearchIndexCache]') AND type in (N'U'))
BEGIN
    CREATE TABLE SearchIndexCache (
        CacheId INT IDENTITY(1,1) PRIMARY KEY,
        EntityType NVARCHAR(50) NOT NULL,
        EntityId INT NOT NULL,
        SearchableContent NVARCHAR(MAX) NOT NULL,
        Metadata NVARCHAR(MAX) NULL, -- JSON
        LastUpdated DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE NONCLUSTERED INDEX IX_SearchIndexCache_EntityType ON SearchIndexCache(EntityType);
    CREATE NONCLUSTERED INDEX IX_SearchIndexCache_LastUpdated ON SearchIndexCache(LastUpdated DESC);
    CREATE FULLTEXT INDEX ON SearchIndexCache(SearchableContent)
        KEY INDEX PK__SearchIn__XXXXX ON ftCatalog; -- Requires fulltext catalog setup

    PRINT 'Table SearchIndexCache created successfully.';
END
ELSE
BEGIN
    PRINT 'Table SearchIndexCache already exists (fulltext index may need manual setup).';
END
GO

-- =============================================
-- Table: ReportSchedules
-- Purpose: Store scheduled report configurations
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ReportSchedules]') AND type in (N'U'))
BEGIN
    CREATE TABLE ReportSchedules (
        ScheduleId INT IDENTITY(1,1) PRIMARY KEY,
        ReportName NVARCHAR(255) NOT NULL,
        ReportType NVARCHAR(100) NOT NULL, -- 'CRFSummary', 'DeploymentStatus', 'ClientVersions', etc.
        Frequency NVARCHAR(50) NOT NULL, -- 'Daily', 'Weekly', 'Monthly', 'Quarterly'
        Parameters NVARCHAR(MAX) NULL, -- JSON
        Recipients NVARCHAR(MAX) NOT NULL, -- JSON array of email addresses
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedBy INT NOT NULL,
        LastRunAt DATETIME NULL,
        NextRunAt DATETIME NOT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_ReportSchedules_Users FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
    );

    CREATE NONCLUSTERED INDEX IX_ReportSchedules_NextRunAt ON ReportSchedules(NextRunAt);
    CREATE NONCLUSTERED INDEX IX_ReportSchedules_IsActive ON ReportSchedules(IsActive);

    PRINT 'Table ReportSchedules created successfully.';
END
ELSE
BEGIN
    PRINT 'Table ReportSchedules already exists.';
END
GO

PRINT 'Phase 5-8 database schema creation completed successfully.';
GO
