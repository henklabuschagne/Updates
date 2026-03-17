-- =============================================
-- Software Update Management System
-- Phase 2: Clients Stored Procedures
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get All Clients
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllClients')
    DROP PROCEDURE sp_GetAllClients;
GO

CREATE PROCEDURE sp_GetAllClients
    @IncludeInactive BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.ContactEmail,
        c.ContactPerson,
        c.Phone,
        c.Address,
        c.CurrentVersionId,
        c.Status,
        c.LastUpdateDate,
        c.CreatedBy,
        c.CreatedDate,
        c.UpdatedDate,
        c.IsActive,
        v.VersionNumber AS CurrentVersion,
        v.VersionName AS CurrentVersionName,
        u.FirstName + ' ' + u.LastName AS CreatedByName
    FROM Clients c
    LEFT JOIN SoftwareVersions v ON c.CurrentVersionId = v.VersionId
    LEFT JOIN Users u ON c.CreatedBy = u.UserId
    WHERE (@IncludeInactive = 1 OR c.IsActive = 1)
    ORDER BY c.ClientName;
END
GO

-- =============================================
-- SP: Get Client By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetClientById')
    DROP PROCEDURE sp_GetClientById;
GO

CREATE PROCEDURE sp_GetClientById
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.ContactEmail,
        c.ContactPerson,
        c.Phone,
        c.Address,
        c.CurrentVersionId,
        c.Status,
        c.LastUpdateDate,
        c.CreatedBy,
        c.CreatedDate,
        c.UpdatedDate,
        c.IsActive,
        v.VersionNumber AS CurrentVersion,
        v.VersionName AS CurrentVersionName,
        u.FirstName + ' ' + u.LastName AS CreatedByName
    FROM Clients c
    LEFT JOIN SoftwareVersions v ON c.CurrentVersionId = v.VersionId
    LEFT JOIN Users u ON c.CreatedBy = u.UserId
    WHERE c.ClientId = @ClientId;
END
GO

-- =============================================
-- SP: Create Client
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateClient')
    DROP PROCEDURE sp_CreateClient;
GO

CREATE PROCEDURE sp_CreateClient
    @ClientName NVARCHAR(255),
    @ContactEmail NVARCHAR(255),
    @ContactPerson NVARCHAR(255),
    @Phone NVARCHAR(50),
    @Address NVARCHAR(500),
    @CurrentVersionId INT,
    @Status NVARCHAR(50),
    @CreatedBy INT,
    @ClientId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if client name already exists
        IF EXISTS (SELECT 1 FROM Clients WHERE ClientName = @ClientName AND IsActive = 1)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Client name already exists', 16, 1);
            RETURN;
        END
        
        INSERT INTO Clients (ClientName, ContactEmail, ContactPerson, Phone, Address, CurrentVersionId, Status, CreatedBy)
        VALUES (@ClientName, @ContactEmail, @ContactPerson, @Phone, @Address, @CurrentVersionId, @Status, @CreatedBy);
        
        SET @ClientId = SCOPE_IDENTITY();
        
        -- If version is assigned, create version history record
        IF @CurrentVersionId IS NOT NULL
        BEGIN
            INSERT INTO ClientVersions (ClientId, VersionId, AssignedDate, UpdatedBy, Notes, IsCurrentVersion)
            VALUES (@ClientId, @CurrentVersionId, GETDATE(), @CreatedBy, 'Initial version assignment', 1);
            
            UPDATE Clients SET LastUpdateDate = GETDATE() WHERE ClientId = @ClientId;
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Update Client
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateClient')
    DROP PROCEDURE sp_UpdateClient;
GO

CREATE PROCEDURE sp_UpdateClient
    @ClientId INT,
    @ClientName NVARCHAR(255),
    @ContactEmail NVARCHAR(255),
    @ContactPerson NVARCHAR(255),
    @Phone NVARCHAR(50),
    @Address NVARCHAR(500),
    @Status NVARCHAR(50),
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if client name is being changed and if it already exists
    IF EXISTS (SELECT 1 FROM Clients WHERE ClientName = @ClientName AND ClientId != @ClientId AND IsActive = 1)
    BEGIN
        RAISERROR('Client name already exists', 16, 1);
        RETURN;
    END
    
    UPDATE Clients
    SET 
        ClientName = @ClientName,
        ContactEmail = @ContactEmail,
        ContactPerson = @ContactPerson,
        Phone = @Phone,
        Address = @Address,
        Status = @Status,
        IsActive = @IsActive,
        UpdatedDate = GETDATE()
    WHERE ClientId = @ClientId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Update Client Version
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateClientVersion')
    DROP PROCEDURE sp_UpdateClientVersion;
GO

CREATE PROCEDURE sp_UpdateClientVersion
    @ClientId INT,
    @VersionId INT,
    @UpdatedBy INT,
    @Notes NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Mark all previous versions as not current
        UPDATE ClientVersions
        SET IsCurrentVersion = 0
        WHERE ClientId = @ClientId;
        
        -- Insert new version record
        INSERT INTO ClientVersions (ClientId, VersionId, AssignedDate, UpdatedBy, Notes, IsCurrentVersion)
        VALUES (@ClientId, @VersionId, GETDATE(), @UpdatedBy, @Notes, 1);
        
        -- Update client's current version
        UPDATE Clients
        SET 
            CurrentVersionId = @VersionId,
            LastUpdateDate = GETDATE(),
            UpdatedDate = GETDATE()
        WHERE ClientId = @ClientId;
        
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
-- SP: Delete Client
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteClient')
    DROP PROCEDURE sp_DeleteClient;
GO

CREATE PROCEDURE sp_DeleteClient
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Delete version history
        DELETE FROM ClientVersions WHERE ClientId = @ClientId;
        
        -- Delete the client
        DELETE FROM Clients WHERE ClientId = @ClientId;
        
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
-- SP: Get Client Version History
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetClientVersionHistory')
    DROP PROCEDURE sp_GetClientVersionHistory;
GO

CREATE PROCEDURE sp_GetClientVersionHistory
    @ClientId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        cv.ClientVersionId,
        cv.ClientId,
        cv.VersionId,
        cv.AssignedDate,
        cv.UpdatedBy,
        cv.Notes,
        cv.IsCurrentVersion,
        v.VersionNumber,
        v.VersionName,
        u.FirstName + ' ' + u.LastName AS UpdatedByName
    FROM ClientVersions cv
    INNER JOIN SoftwareVersions v ON cv.VersionId = v.VersionId
    LEFT JOIN Users u ON cv.UpdatedBy = u.UserId
    WHERE cv.ClientId = @ClientId
    ORDER BY cv.AssignedDate DESC;
END
GO

-- =============================================
-- SP: Get Clients By Version
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetClientsByVersion')
    DROP PROCEDURE sp_GetClientsByVersion;
GO

CREATE PROCEDURE sp_GetClientsByVersion
    @VersionId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.ClientId,
        c.ClientName,
        c.ContactEmail,
        c.ContactPerson,
        c.Status,
        c.LastUpdateDate
    FROM Clients c
    WHERE c.CurrentVersionId = @VersionId AND c.IsActive = 1
    ORDER BY c.ClientName;
END
GO

-- =============================================
-- SP: Get Client Statistics
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetClientStatistics')
    DROP PROCEDURE sp_GetClientStatistics;
GO

CREATE PROCEDURE sp_GetClientStatistics
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) AS TotalClients,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS ActiveClients,
        SUM(CASE WHEN Status = 'Inactive' THEN 1 ELSE 0 END) AS InactiveClients,
        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) AS PendingClients,
        SUM(CASE WHEN Status = 'Suspended' THEN 1 ELSE 0 END) AS SuspendedClients
    FROM Clients
    WHERE IsActive = 1;
END
GO

PRINT 'Phase 2 Client Stored Procedures Created Successfully';
