-- =============================================
-- Software Update Management System
-- Phase 1: Foundation & User Management
-- Database Tables
-- =============================================

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SoftwareUpdateManagement')
BEGIN
    CREATE DATABASE SoftwareUpdateManagement;
END
GO

USE SoftwareUpdateManagement;
GO

-- Roles Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        RoleName NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(255) NULL,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        IsActive BIT DEFAULT 1
    );
END
GO

-- Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(100) NOT NULL UNIQUE,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        FirstName NVARCHAR(100) NULL,
        LastName NVARCHAR(100) NULL,
        Company NVARCHAR(255) NULL,
        IsActive BIT DEFAULT 1,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        LastLoginDate DATETIME2 NULL,
        CONSTRAINT CHK_Email CHECK (Email LIKE '%@%.%')
    );

    CREATE INDEX IX_Users_Email ON Users(Email);
    CREATE INDEX IX_Users_Username ON Users(Username);
END
GO

-- UserRoles Table (Many-to-Many relationship)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
BEGIN
    CREATE TABLE UserRoles (
        UserRoleId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        RoleId INT NOT NULL,
        AssignedDate DATETIME2 DEFAULT GETDATE(),
        AssignedBy INT NULL,
        CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
        CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId) ON DELETE CASCADE,
        CONSTRAINT FK_UserRoles_AssignedBy FOREIGN KEY (AssignedBy) REFERENCES Users(UserId),
        CONSTRAINT UQ_UserRoles UNIQUE (UserId, RoleId)
    );

    CREATE INDEX IX_UserRoles_UserId ON UserRoles(UserId);
    CREATE INDEX IX_UserRoles_RoleId ON UserRoles(RoleId);
END
GO

-- UserSessions Table (for token management)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserSessions')
BEGIN
    CREATE TABLE UserSessions (
        SessionId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Token NVARCHAR(500) NOT NULL UNIQUE,
        RefreshToken NVARCHAR(500) NULL,
        IpAddress NVARCHAR(50) NULL,
        UserAgent NVARCHAR(500) NULL,
        CreatedDate DATETIME2 DEFAULT GETDATE(),
        ExpiresDate DATETIME2 NOT NULL,
        IsActive BIT DEFAULT 1,
        CONSTRAINT FK_UserSessions_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
    );

    CREATE INDEX IX_UserSessions_Token ON UserSessions(Token);
    CREATE INDEX IX_UserSessions_UserId ON UserSessions(UserId);
END
GO

-- Insert Default Roles
IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'DevOps')
BEGIN
    INSERT INTO Roles (RoleName, Description) VALUES ('DevOps', 'Full system access including deployment and configuration');
    INSERT INTO Roles (RoleName, Description) VALUES ('Delivery', 'Limited access to dashboard, versions, workflow, clients, history, and reporting');
    INSERT INTO Roles (RoleName, Description) VALUES ('Client', 'Access only to versions and own update history');
END
GO

-- Insert Default Admin User (password: Admin@123)
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
BEGIN
    -- Password hash for 'Admin@123' (you should use proper hashing in production)
    INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Company)
    VALUES ('admin', 'admin@system.com', 'AQAAAAEAACcQAAAAEJ5z8vkfVVGQYLKzN0nZJ8Qg5VqKZqP7KZYvJ8hNqZmYJ8hNqZmYJ8hNqZmYJ8hNqZmYJ==', 'System', 'Administrator', 'Internal');
    
    DECLARE @AdminUserId INT = SCOPE_IDENTITY();
    DECLARE @DevOpsRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'DevOps');
    
    INSERT INTO UserRoles (UserId, RoleId) VALUES (@AdminUserId, @DevOpsRoleId);
END
GO

-- Insert Sample Users
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'sarah.devops')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Company)
    VALUES ('sarah.devops', 'sarah@techcorp.com', 'AQAAAAEAACcQAAAAEJ5z8vkfVVGQYLKzN0nZJ8Qg5VqKZqP7KZYvJ8hNqZmYJ8hNqZmYJ8hNqZmYJ8hNqZmYJ==', 'Sarah', 'Johnson', 'TechCorp');
    
    DECLARE @SarahUserId INT = SCOPE_IDENTITY();
    DECLARE @DevOpsRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'DevOps');
    
    INSERT INTO UserRoles (UserId, RoleId) VALUES (@SarahUserId, @DevOpsRoleId);
END
GO

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'mike.delivery')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Company)
    VALUES ('mike.delivery', 'mike@techcorp.com', 'AQAAAAEAACcQAAAAEJ5z8vkfVVGQYLKzN0nZJ8Qg5VqKZqP7KZYvJ8hNqZmYJ8hNqZmYJ8hNqZmYJ8hNqZmYJ==', 'Mike', 'Chen', 'TechCorp');
    
    DECLARE @MikeUserId INT = SCOPE_IDENTITY();
    DECLARE @DeliveryRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'Delivery');
    
    INSERT INTO UserRoles (UserId, RoleId) VALUES (@MikeUserId, @DeliveryRoleId);
END
GO

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'acme.client')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Company)
    VALUES ('acme.client', 'admin@acme.com', 'AQAAAAEAACcQAAAAEJ5z8vkfVVGQYLKzN0nZJ8Qg5VqKZqP7KZYvJ8hNqZmYJ8hNqZmYJ8hNqZmYJ8hNqZmYJ==', 'John', 'Doe', 'Acme Corporation');
    
    DECLARE @AcmeUserId INT = SCOPE_IDENTITY();
    DECLARE @ClientRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'Client');
    
    INSERT INTO UserRoles (UserId, RoleId) VALUES (@AcmeUserId, @ClientRoleId);
END
GO

PRINT 'Phase 1 Tables Created Successfully';
