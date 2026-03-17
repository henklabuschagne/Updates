-- =============================================
-- Software Update Management System
-- Phase 1: User Management Stored Procedures
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get User By Username
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUserByUsername')
    DROP PROCEDURE sp_GetUserByUsername;
GO

CREATE PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.PasswordHash,
        u.FirstName,
        u.LastName,
        u.Company,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        r.RoleId,
        r.RoleName,
        r.Description AS RoleDescription
    FROM Users u
    LEFT JOIN UserRoles ur ON u.UserId = ur.UserId
    LEFT JOIN Roles r ON ur.RoleId = r.RoleId
    WHERE u.Username = @Username AND u.IsActive = 1;
END
GO

-- =============================================
-- SP: Get User By Email
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUserByEmail')
    DROP PROCEDURE sp_GetUserByEmail;
GO

CREATE PROCEDURE sp_GetUserByEmail
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.PasswordHash,
        u.FirstName,
        u.LastName,
        u.Company,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        r.RoleId,
        r.RoleName,
        r.Description AS RoleDescription
    FROM Users u
    LEFT JOIN UserRoles ur ON u.UserId = ur.UserId
    LEFT JOIN Roles r ON ur.RoleId = r.RoleId
    WHERE u.Email = @Email AND u.IsActive = 1;
END
GO

-- =============================================
-- SP: Get User By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUserById')
    DROP PROCEDURE sp_GetUserById;
GO

CREATE PROCEDURE sp_GetUserById
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.FirstName,
        u.LastName,
        u.Company,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        r.RoleId,
        r.RoleName,
        r.Description AS RoleDescription
    FROM Users u
    LEFT JOIN UserRoles ur ON u.UserId = ur.UserId
    LEFT JOIN Roles r ON ur.RoleId = r.RoleId
    WHERE u.UserId = @UserId;
END
GO

-- =============================================
-- SP: Get All Users
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllUsers')
    DROP PROCEDURE sp_GetAllUsers;
GO

CREATE PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.UserId,
        u.Username,
        u.Email,
        u.FirstName,
        u.LastName,
        u.Company,
        u.IsActive,
        u.CreatedDate,
        u.LastLoginDate,
        STRING_AGG(r.RoleName, ', ') AS Roles
    FROM Users u
    LEFT JOIN UserRoles ur ON u.UserId = ur.UserId
    LEFT JOIN Roles r ON ur.RoleId = r.RoleId
    GROUP BY u.UserId, u.Username, u.Email, u.FirstName, u.LastName, u.Company, u.IsActive, u.CreatedDate, u.LastLoginDate
    ORDER BY u.CreatedDate DESC;
END
GO

-- =============================================
-- SP: Create User
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateUser')
    DROP PROCEDURE sp_CreateUser;
GO

CREATE PROCEDURE sp_CreateUser
    @Username NVARCHAR(100),
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(MAX),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @Company NVARCHAR(255),
    @RoleId INT,
    @UserId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Insert User
        INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Company)
        VALUES (@Username, @Email, @PasswordHash, @FirstName, @LastName, @Company);
        
        SET @UserId = SCOPE_IDENTITY();
        
        -- Assign Role
        INSERT INTO UserRoles (UserId, RoleId)
        VALUES (@UserId, @RoleId);
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Update User
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateUser')
    DROP PROCEDURE sp_UpdateUser;
GO

CREATE PROCEDURE sp_UpdateUser
    @UserId INT,
    @Email NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @Company NVARCHAR(255),
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Users
    SET 
        Email = @Email,
        FirstName = @FirstName,
        LastName = @LastName,
        Company = @Company,
        IsActive = @IsActive
    WHERE UserId = @UserId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Update User Password
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateUserPassword')
    DROP PROCEDURE sp_UpdateUserPassword;
GO

CREATE PROCEDURE sp_UpdateUserPassword
    @UserId INT,
    @PasswordHash NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Users
    SET PasswordHash = @PasswordHash
    WHERE UserId = @UserId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Update Last Login
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateLastLogin')
    DROP PROCEDURE sp_UpdateLastLogin;
GO

CREATE PROCEDURE sp_UpdateLastLogin
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Users
    SET LastLoginDate = GETDATE()
    WHERE UserId = @UserId;
END
GO

-- =============================================
-- SP: Delete User
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteUser')
    DROP PROCEDURE sp_DeleteUser;
GO

CREATE PROCEDURE sp_DeleteUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Delete UserRoles
        DELETE FROM UserRoles WHERE UserId = @UserId;
        
        -- Delete UserSessions
        DELETE FROM UserSessions WHERE UserId = @UserId;
        
        -- Delete User
        DELETE FROM Users WHERE UserId = @UserId;
        
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
-- SP: Get All Roles
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllRoles')
    DROP PROCEDURE sp_GetAllRoles;
GO

CREATE PROCEDURE sp_GetAllRoles
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        RoleId,
        RoleName,
        Description,
        IsActive
    FROM Roles
    WHERE IsActive = 1
    ORDER BY RoleName;
END
GO

-- =============================================
-- SP: Create User Session
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateUserSession')
    DROP PROCEDURE sp_CreateUserSession;
GO

CREATE PROCEDURE sp_CreateUserSession
    @UserId INT,
    @Token NVARCHAR(500),
    @RefreshToken NVARCHAR(500),
    @IpAddress NVARCHAR(50),
    @UserAgent NVARCHAR(500),
    @ExpiresDate DATETIME2,
    @SessionId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Deactivate old sessions
    UPDATE UserSessions
    SET IsActive = 0
    WHERE UserId = @UserId AND IsActive = 1;
    
    -- Create new session
    INSERT INTO UserSessions (UserId, Token, RefreshToken, IpAddress, UserAgent, ExpiresDate)
    VALUES (@UserId, @Token, @RefreshToken, @IpAddress, @UserAgent, @ExpiresDate);
    
    SET @SessionId = SCOPE_IDENTITY();
END
GO

-- =============================================
-- SP: Validate User Session
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_ValidateUserSession')
    DROP PROCEDURE sp_ValidateUserSession;
GO

CREATE PROCEDURE sp_ValidateUserSession
    @Token NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.SessionId,
        s.UserId,
        s.Token,
        s.RefreshToken,
        s.ExpiresDate,
        s.IsActive,
        u.Username,
        u.Email,
        u.FirstName,
        u.LastName,
        r.RoleName
    FROM UserSessions s
    INNER JOIN Users u ON s.UserId = u.UserId
    LEFT JOIN UserRoles ur ON u.UserId = ur.UserId
    LEFT JOIN Roles r ON ur.RoleId = r.RoleId
    WHERE s.Token = @Token 
        AND s.IsActive = 1 
        AND s.ExpiresDate > GETDATE()
        AND u.IsActive = 1;
END
GO

-- =============================================
-- SP: Invalidate User Session
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_InvalidateUserSession')
    DROP PROCEDURE sp_InvalidateUserSession;
GO

CREATE PROCEDURE sp_InvalidateUserSession
    @Token NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE UserSessions
    SET IsActive = 0
    WHERE Token = @Token;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

PRINT 'Phase 1 Stored Procedures Created Successfully';
