-- =============================================
-- Update Clients Stored Procedures to include HasCustomizations
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get All Clients (UPDATED with HasCustomizations)
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
        c.HasCustomizations,  -- NEW FIELD
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
-- SP: Get Client By ID (UPDATED with HasCustomizations)
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
        c.HasCustomizations,  -- NEW FIELD
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
-- SP: Create Client (UPDATED with HasCustomizations)
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
    @HasCustomizations BIT = 0,  -- NEW PARAMETER with default
    @ClientId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO Clients (
            ClientName, 
            ContactEmail, 
            ContactPerson, 
            Phone, 
            Address, 
            CurrentVersionId, 
            Status, 
            CreatedBy,
            HasCustomizations  -- NEW FIELD
        )
        VALUES (
            @ClientName, 
            @ContactEmail, 
            @ContactPerson, 
            @Phone, 
            @Address, 
            @CurrentVersionId, 
            @Status, 
            @CreatedBy,
            @HasCustomizations  -- NEW FIELD
        );
        
        SET @ClientId = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Update Client (UPDATED with HasCustomizations)
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
    @IsActive BIT,
    @HasCustomizations BIT  -- NEW PARAMETER
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE Clients
        SET 
            ClientName = @ClientName,
            ContactEmail = @ContactEmail,
            ContactPerson = @ContactPerson,
            Phone = @Phone,
            Address = @Address,
            Status = @Status,
            IsActive = @IsActive,
            HasCustomizations = @HasCustomizations,  -- NEW FIELD
            UpdatedDate = GETDATE()
        WHERE ClientId = @ClientId;
        
        COMMIT TRANSACTION;
        
        RETURN @@ROWCOUNT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Get Clients With Customizations
-- NEW PROCEDURE to get only customized clients
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetClientsWithCustomizations')
    DROP PROCEDURE sp_GetClientsWithCustomizations;
GO

CREATE PROCEDURE sp_GetClientsWithCustomizations
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
        c.HasCustomizations,
        v.VersionNumber AS CurrentVersion,
        v.VersionName AS CurrentVersionName,
        u.FirstName + ' ' + u.LastName AS CreatedByName
    FROM Clients c
    LEFT JOIN SoftwareVersions v ON c.CurrentVersionId = v.VersionId
    LEFT JOIN Users u ON c.CreatedBy = u.UserId
    WHERE c.HasCustomizations = 1
    AND c.IsActive = 1
    ORDER BY c.ClientName;
END
GO

PRINT 'Client stored procedures updated successfully with HasCustomizations field';
GO
