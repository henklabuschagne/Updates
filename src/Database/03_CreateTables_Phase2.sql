-- =============================================
-- Software Update Management System
-- Phase 2: Core Entities (Versions & Clients)
-- Database Tables
-- =============================================

USE SoftwareUpdateManagement;
GO

-- SoftwareVersions Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SoftwareVersions')
BEGIN
    CREATE TABLE SoftwareVersions (
        VersionId INT IDENTITY(1,1) PRIMARY KEY,
        VersionNumber NVARCHAR(50) NOT NULL UNIQUE,
        VersionName NVARCHAR(255) NOT NULL,
        ReleaseDate DATE NOT NULL,
        Description NVARCHAR(MAX) NULL,
        ReleaseNotes NVARCHAR(MAX) NULL,
        IsMajorRelease BIT DEFAULT 0,
        IsActive BIT DEFAULT 1,
        CreatedBy INT NOT NULL,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        UpdatedDate DATETIME2 NULL,
        CONSTRAINT FK_SoftwareVersions_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
        CONSTRAINT CHK_VersionNumber CHECK (VersionNumber LIKE '[0-9]%')
    );

    CREATE INDEX IX_SoftwareVersions_VersionNumber ON SoftwareVersions(VersionNumber);
    CREATE INDEX IX_SoftwareVersions_ReleaseDate ON SoftwareVersions(ReleaseDate DESC);
END
GO

-- Clients Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clients')
BEGIN
    CREATE TABLE Clients (
        ClientId INT IDENTITY(1,1) PRIMARY KEY,
        ClientName NVARCHAR(255) NOT NULL,
        ContactEmail NVARCHAR(255) NOT NULL,
        ContactPerson NVARCHAR(255) NULL,
        Phone NVARCHAR(50) NULL,
        Address NVARCHAR(500) NULL,
        CurrentVersionId INT NULL,
        Status NVARCHAR(50) DEFAULT 'Active',
        LastUpdateDate DATETIME2 NULL,
        CreatedBy INT NOT NULL,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        UpdatedDate DATETIME2 NULL,
        IsActive BIT DEFAULT 1,
        CONSTRAINT FK_Clients_CurrentVersion FOREIGN KEY (CurrentVersionId) REFERENCES SoftwareVersions(VersionId),
        CONSTRAINT FK_Clients_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
        CONSTRAINT CHK_Email CHECK (ContactEmail LIKE '%@%.%'),
        CONSTRAINT CHK_Status CHECK (Status IN ('Active', 'Inactive', 'Pending', 'Suspended'))
    );

    CREATE INDEX IX_Clients_ClientName ON Clients(ClientName);
    CREATE INDEX IX_Clients_Status ON Clients(Status);
    CREATE INDEX IX_Clients_CurrentVersion ON Clients(CurrentVersionId);
END
GO

-- ClientVersions Table (History of version changes)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClientVersions')
BEGIN
    CREATE TABLE ClientVersions (
        ClientVersionId INT IDENTITY(1,1) PRIMARY KEY,
        ClientId INT NOT NULL,
        VersionId INT NOT NULL,
        AssignedDate DATETIME2 DEFAULT GETDATE(),
        UpdatedBy INT NOT NULL,
        Notes NVARCHAR(MAX) NULL,
        IsCurrentVersion BIT DEFAULT 1,
        CONSTRAINT FK_ClientVersions_Client FOREIGN KEY (ClientId) REFERENCES Clients(ClientId) ON DELETE CASCADE,
        CONSTRAINT FK_ClientVersions_Version FOREIGN KEY (VersionId) REFERENCES SoftwareVersions(VersionId),
        CONSTRAINT FK_ClientVersions_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(UserId)
    );

    CREATE INDEX IX_ClientVersions_ClientId ON ClientVersions(ClientId);
    CREATE INDEX IX_ClientVersions_VersionId ON ClientVersions(VersionId);
    CREATE INDEX IX_ClientVersions_AssignedDate ON ClientVersions(AssignedDate DESC);
END
GO

-- Insert Sample Software Versions
IF NOT EXISTS (SELECT * FROM SoftwareVersions WHERE VersionNumber = '1.0.0')
BEGIN
    DECLARE @DevOpsUserId INT = (SELECT TOP 1 UserId FROM Users WHERE Username = 'admin');
    
    INSERT INTO SoftwareVersions (VersionNumber, VersionName, ReleaseDate, Description, ReleaseNotes, IsMajorRelease, CreatedBy)
    VALUES 
    ('1.0.0', 'Initial Release', '2024-01-15', 'First stable release of the software', 
     '- Core functionality implemented\n- User authentication\n- Basic reporting', 1, @DevOpsUserId),
    
    ('1.1.0', 'Feature Update', '2024-03-20', 'Added new features and improvements', 
     '- Enhanced reporting dashboard\n- Performance improvements\n- Bug fixes', 0, @DevOpsUserId),
    
    ('1.2.0', 'Spring Update', '2024-05-10', 'Major feature additions', 
     '- New analytics module\n- API improvements\n- Security enhancements', 0, @DevOpsUserId),
    
    ('2.0.0', 'Major Release', '2024-08-01', 'Complete system overhaul', 
     '- Redesigned UI/UX\n- New architecture\n- Advanced features\n- Breaking changes', 1, @DevOpsUserId),
    
    ('2.1.0', 'Stability Update', '2024-10-15', 'Bug fixes and stability improvements', 
     '- Critical bug fixes\n- Performance optimization\n- Minor UI tweaks', 0, @DevOpsUserId);
END
GO

-- Insert Sample Clients
IF NOT EXISTS (SELECT * FROM Clients WHERE ClientName = 'Acme Corporation')
BEGIN
    DECLARE @DevOpsUserId INT = (SELECT TOP 1 UserId FROM Users WHERE Username = 'admin');
    DECLARE @Version1Id INT = (SELECT VersionId FROM SoftwareVersions WHERE VersionNumber = '1.2.0');
    DECLARE @Version2Id INT = (SELECT VersionId FROM SoftwareVersions WHERE VersionNumber = '2.0.0');
    
    INSERT INTO Clients (ClientName, ContactEmail, ContactPerson, Phone, CurrentVersionId, Status, LastUpdateDate, CreatedBy)
    VALUES 
    ('Acme Corporation', 'admin@acme.com', 'John Doe', '+1-555-0101', @Version1Id, 'Active', '2024-05-15', @DevOpsUserId),
    ('Global Tech Industries', 'contact@globaltech.com', 'Jane Smith', '+1-555-0102', @Version2Id, 'Active', '2024-08-05', @DevOpsUserId),
    ('Innovate Solutions', 'info@innovate.com', 'Bob Johnson', '+1-555-0103', @Version1Id, 'Active', '2024-04-20', @DevOpsUserId),
    ('Tech Pioneers LLC', 'support@techpioneers.com', 'Alice Brown', '+1-555-0104', @Version2Id, 'Active', '2024-09-01', @DevOpsUserId),
    ('Digital Dynamics', 'hello@digitaldynamics.com', 'Charlie Wilson', '+1-555-0105', @Version1Id, 'Pending', NULL, @DevOpsUserId);
    
    -- Insert version history for clients
    DECLARE @AcmeId INT = (SELECT ClientId FROM Clients WHERE ClientName = 'Acme Corporation');
    DECLARE @GlobalTechId INT = (SELECT ClientId FROM Clients WHERE ClientName = 'Global Tech Industries');
    
    INSERT INTO ClientVersions (ClientId, VersionId, AssignedDate, UpdatedBy, Notes, IsCurrentVersion)
    VALUES 
    (@AcmeId, (SELECT VersionId FROM SoftwareVersions WHERE VersionNumber = '1.0.0'), '2024-01-20', @DevOpsUserId, 'Initial deployment', 0),
    (@AcmeId, (SELECT VersionId FROM SoftwareVersions WHERE VersionNumber = '1.1.0'), '2024-03-25', @DevOpsUserId, 'Upgrade to 1.1.0', 0),
    (@AcmeId, @Version1Id, '2024-05-15', @DevOpsUserId, 'Upgrade to 1.2.0', 1),
    
    (@GlobalTechId, (SELECT VersionId FROM SoftwareVersions WHERE VersionNumber = '1.2.0'), '2024-05-20', @DevOpsUserId, 'Initial deployment', 0),
    (@GlobalTechId, @Version2Id, '2024-08-05', @DevOpsUserId, 'Major upgrade to 2.0.0', 1);
END
GO

PRINT 'Phase 2 Tables Created Successfully';
