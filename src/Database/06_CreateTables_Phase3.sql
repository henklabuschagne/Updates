-- =============================================
-- Software Update Management System
-- Phase 3: CRF Workflow System
-- Database Tables
-- =============================================

USE SoftwareUpdateManagement;
GO

-- WorkflowSteps Table (Configurable workflow steps)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowSteps')
BEGIN
    CREATE TABLE WorkflowSteps (
        WorkflowStepId INT IDENTITY(1,1) PRIMARY KEY,
        StepName NVARCHAR(255) NOT NULL,
        StepOrder INT NOT NULL,
        IsRequired BIT DEFAULT 1,
        IsActive BIT DEFAULT 1,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT UQ_WorkflowSteps_StepOrder UNIQUE (StepOrder)
    );

    CREATE INDEX IX_WorkflowSteps_StepOrder ON WorkflowSteps(StepOrder);
END
GO

-- CRFStatus Enum values: Draft, Pending, Approved, Rejected, Deployed, Failed, Rolled Back
-- CRFs Table (Change Request Forms)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CRFs')
BEGIN
    CREATE TABLE CRFs (
        CRFId INT IDENTITY(1,1) PRIMARY KEY,
        CRFNumber NVARCHAR(50) NOT NULL UNIQUE,
        Title NVARCHAR(500) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        VersionId INT NOT NULL,
        RequestedBy INT NOT NULL,
        Status NVARCHAR(50) DEFAULT 'Draft',
        Priority NVARCHAR(50) DEFAULT 'Medium',
        ScheduledDeploymentDate DATETIME2 NULL,
        ActualDeploymentDate DATETIME2 NULL,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        UpdatedDate DATETIME2 NULL,
        CompletedDate DATETIME2 NULL,
        CONSTRAINT FK_CRFs_Version FOREIGN KEY (VersionId) REFERENCES SoftwareVersions(VersionId),
        CONSTRAINT FK_CRFs_RequestedBy FOREIGN KEY (RequestedBy) REFERENCES Users(UserId),
        CONSTRAINT CHK_CRF_Status CHECK (Status IN ('Draft', 'Pending', 'Approved', 'Rejected', 'Deployed', 'Failed', 'Rolled Back')),
        CONSTRAINT CHK_CRF_Priority CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical'))
    );

    CREATE INDEX IX_CRFs_CRFNumber ON CRFs(CRFNumber);
    CREATE INDEX IX_CRFs_Status ON CRFs(Status);
    CREATE INDEX IX_CRFs_VersionId ON CRFs(VersionId);
    CREATE INDEX IX_CRFs_CreatedDate ON CRFs(CreatedDate DESC);
END
GO

-- CRFClients Table (Many-to-Many: CRFs to Clients)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CRFClients')
BEGIN
    CREATE TABLE CRFClients (
        CRFClientId INT IDENTITY(1,1) PRIMARY KEY,
        CRFId INT NOT NULL,
        ClientId INT NOT NULL,
        DeploymentStatus NVARCHAR(50) DEFAULT 'Pending',
        DeploymentDate DATETIME2 NULL,
        DeploymentNotes NVARCHAR(MAX) NULL,
        CONSTRAINT FK_CRFClients_CRF FOREIGN KEY (CRFId) REFERENCES CRFs(CRFId) ON DELETE CASCADE,
        CONSTRAINT FK_CRFClients_Client FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
        CONSTRAINT UQ_CRFClients UNIQUE (CRFId, ClientId),
        CONSTRAINT CHK_DeploymentStatus CHECK (DeploymentStatus IN ('Pending', 'In Progress', 'Success', 'Failed', 'Rolled Back'))
    );

    CREATE INDEX IX_CRFClients_CRFId ON CRFClients(CRFId);
    CREATE INDEX IX_CRFClients_ClientId ON CRFClients(ClientId);
END
GO

-- CRFApprovals Table (Approval workflow tracking)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CRFApprovals')
BEGIN
    CREATE TABLE CRFApprovals (
        CRFApprovalId INT IDENTITY(1,1) PRIMARY KEY,
        CRFId INT NOT NULL,
        WorkflowStepId INT NOT NULL,
        ApproverUserId INT NULL,
        Status NVARCHAR(50) DEFAULT 'Pending',
        ApprovalDate DATETIME2 NULL,
        Comments NVARCHAR(MAX) NULL,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_CRFApprovals_CRF FOREIGN KEY (CRFId) REFERENCES CRFs(CRFId) ON DELETE CASCADE,
        CONSTRAINT FK_CRFApprovals_WorkflowStep FOREIGN KEY (WorkflowStepId) REFERENCES WorkflowSteps(WorkflowStepId),
        CONSTRAINT FK_CRFApprovals_Approver FOREIGN KEY (ApproverUserId) REFERENCES Users(UserId),
        CONSTRAINT CHK_Approval_Status CHECK (Status IN ('Pending', 'Approved', 'Rejected'))
    );

    CREATE INDEX IX_CRFApprovals_CRFId ON CRFApprovals(CRFId);
    CREATE INDEX IX_CRFApprovals_Status ON CRFApprovals(Status);
END
GO

-- DeploymentLogs Table (Track deployment execution)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeploymentLogs')
BEGIN
    CREATE TABLE DeploymentLogs (
        DeploymentLogId INT IDENTITY(1,1) PRIMARY KEY,
        CRFId INT NOT NULL,
        ClientId INT NULL,
        LogType NVARCHAR(50) NOT NULL,
        LogMessage NVARCHAR(MAX) NOT NULL,
        Severity NVARCHAR(50) DEFAULT 'Info',
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        CreatedBy INT NULL,
        CONSTRAINT FK_DeploymentLogs_CRF FOREIGN KEY (CRFId) REFERENCES CRFs(CRFId) ON DELETE CASCADE,
        CONSTRAINT FK_DeploymentLogs_Client FOREIGN KEY (ClientId) REFERENCES Clients(ClientId),
        CONSTRAINT FK_DeploymentLogs_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
        CONSTRAINT CHK_LogType CHECK (LogType IN ('Deployment', 'Rollback', 'Notification', 'Error', 'Warning', 'Info')),
        CONSTRAINT CHK_Severity CHECK (Severity IN ('Info', 'Warning', 'Error', 'Critical'))
    );

    CREATE INDEX IX_DeploymentLogs_CRFId ON DeploymentLogs(CRFId);
    CREATE INDEX IX_DeploymentLogs_CreatedDate ON DeploymentLogs(CreatedDate DESC);
END
GO

-- Insert Default Workflow Steps
IF NOT EXISTS (SELECT * FROM WorkflowSteps WHERE StepName = 'Request')
BEGIN
    INSERT INTO WorkflowSteps (StepName, StepOrder, IsRequired)
    VALUES 
    ('Request', 1, 1),
    ('Application Owner', 2, 1),
    ('IT Department', 3, 1);
END
GO

-- Insert Sample CRFs
IF NOT EXISTS (SELECT * FROM CRFs WHERE CRFNumber = 'CRF-2024-001')
BEGIN
    DECLARE @DevOpsUserId INT = (SELECT TOP 1 UserId FROM Users WHERE Username = 'admin');
    DECLARE @Version2Id INT = (SELECT VersionId FROM SoftwareVersions WHERE VersionNumber = '2.0.0');
    DECLARE @Version21Id INT = (SELECT VersionId FROM SoftwareVersions WHERE VersionNumber = '2.1.0');
    
    -- CRF 1: Approved and Deployed
    INSERT INTO CRFs (CRFNumber, Title, Description, VersionId, RequestedBy, Status, Priority, ScheduledDeploymentDate, ActualDeploymentDate, CompletedDate)
    VALUES 
    ('CRF-2024-001', 'Deploy Version 2.0.0 to Production Clients', 
     'Major release deployment with new features and UI improvements', 
     @Version2Id, @DevOpsUserId, 'Deployed', 'High', '2024-08-01 09:00:00', '2024-08-01 09:15:00', '2024-08-01 10:30:00');
    
    DECLARE @CRF1Id INT = SCOPE_IDENTITY();
    
    -- Add clients to CRF 1
    INSERT INTO CRFClients (CRFId, ClientId, DeploymentStatus, DeploymentDate)
    SELECT @CRF1Id, ClientId, 'Success', '2024-08-01 09:30:00'
    FROM Clients WHERE ClientName IN ('Global Tech Industries', 'Tech Pioneers LLC');
    
    -- Add approvals for CRF 1
    INSERT INTO CRFApprovals (CRFId, WorkflowStepId, ApproverUserId, Status, ApprovalDate, Comments)
    SELECT @CRF1Id, WorkflowStepId, @DevOpsUserId, 'Approved', DATEADD(DAY, -5, GETDATE()), 'Approved for deployment'
    FROM WorkflowSteps;
    
    -- CRF 2: Pending Approval
    INSERT INTO CRFs (CRFNumber, Title, Description, VersionId, RequestedBy, Status, Priority, ScheduledDeploymentDate)
    VALUES 
    ('CRF-2024-002', 'Deploy Version 2.1.0 Bug Fixes', 
     'Critical bug fixes and stability improvements', 
     @Version21Id, @DevOpsUserId, 'Pending', 'Critical', '2024-12-15 08:00:00');
    
    DECLARE @CRF2Id INT = SCOPE_IDENTITY();
    
    -- Add clients to CRF 2
    INSERT INTO CRFClients (CRFId, ClientId, DeploymentStatus)
    SELECT @CRF2Id, ClientId, 'Pending'
    FROM Clients WHERE Status = 'Active';
    
    -- Add approvals for CRF 2
    INSERT INTO CRFApprovals (CRFId, WorkflowStepId, Status)
    SELECT @CRF2Id, WorkflowStepId, CASE WHEN StepOrder = 1 THEN 'Approved' ELSE 'Pending' END
    FROM WorkflowSteps;
    
    -- Update first approval
    UPDATE CRFApprovals 
    SET ApproverUserId = @DevOpsUserId, ApprovalDate = DATEADD(DAY, -1, GETDATE()), Comments = 'Request approved, moving to next step'
    WHERE CRFId = @CRF2Id AND WorkflowStepId = (SELECT WorkflowStepId FROM WorkflowSteps WHERE StepOrder = 1);
    
    -- CRF 3: Draft
    INSERT INTO CRFs (CRFNumber, Title, Description, VersionId, RequestedBy, Status, Priority, ScheduledDeploymentDate)
    VALUES 
    ('CRF-2024-003', 'Deploy Version 1.2.0 to New Clients', 
     'Deploy stable version to newly onboarded clients', 
     (SELECT VersionId FROM SoftwareVersions WHERE VersionNumber = '1.2.0'), @DevOpsUserId, 'Draft', 'Medium', '2024-12-20 10:00:00');
    
    -- Add deployment logs for CRF 1
    INSERT INTO DeploymentLogs (CRFId, ClientId, LogType, LogMessage, Severity, CreatedBy)
    SELECT @CRF1Id, ClientId, 'Deployment', 'Deployment started for ' + ClientName, 'Info', @DevOpsUserId
    FROM Clients WHERE ClientName IN ('Global Tech Industries', 'Tech Pioneers LLC');
    
    INSERT INTO DeploymentLogs (CRFId, ClientId, LogType, LogMessage, Severity, CreatedBy)
    SELECT @CRF1Id, ClientId, 'Deployment', 'Deployment completed successfully for ' + ClientName, 'Info', @DevOpsUserId
    FROM Clients WHERE ClientName IN ('Global Tech Industries', 'Tech Pioneers LLC');
END
GO

PRINT 'Phase 3 Tables Created Successfully';
