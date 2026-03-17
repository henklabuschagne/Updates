-- =============================================
-- Software Update Management System
-- Phase 2: Software Versions Stored Procedures
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- SP: Get All Software Versions
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllVersions')
    DROP PROCEDURE sp_GetAllVersions;
GO

CREATE PROCEDURE sp_GetAllVersions
    @IncludeInactive BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        v.VersionId,
        v.VersionNumber,
        v.VersionName,
        v.ReleaseDate,
        v.Description,
        v.ReleaseNotes,
        v.IsMajorRelease,
        v.IsActive,
        v.CreatedBy,
        v.CreatedDate,
        v.UpdatedDate,
        u.FirstName + ' ' + u.LastName AS CreatedByName,
        COUNT(DISTINCT c.ClientId) AS ClientCount
    FROM SoftwareVersions v
    LEFT JOIN Users u ON v.CreatedBy = u.UserId
    LEFT JOIN Clients c ON v.VersionId = c.CurrentVersionId AND c.IsActive = 1
    WHERE (@IncludeInactive = 1 OR v.IsActive = 1)
    GROUP BY v.VersionId, v.VersionNumber, v.VersionName, v.ReleaseDate, v.Description, 
             v.ReleaseNotes, v.IsMajorRelease, v.IsActive, v.CreatedBy, v.CreatedDate, 
             v.UpdatedDate, u.FirstName, u.LastName
    ORDER BY v.ReleaseDate DESC, v.VersionNumber DESC;
END
GO

-- =============================================
-- SP: Get Version By ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetVersionById')
    DROP PROCEDURE sp_GetVersionById;
GO

CREATE PROCEDURE sp_GetVersionById
    @VersionId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        v.VersionId,
        v.VersionNumber,
        v.VersionName,
        v.ReleaseDate,
        v.Description,
        v.ReleaseNotes,
        v.IsMajorRelease,
        v.IsActive,
        v.CreatedBy,
        v.CreatedDate,
        v.UpdatedDate,
        u.FirstName + ' ' + u.LastName AS CreatedByName,
        COUNT(DISTINCT c.ClientId) AS ClientCount
    FROM SoftwareVersions v
    LEFT JOIN Users u ON v.CreatedBy = u.UserId
    LEFT JOIN Clients c ON v.VersionId = c.CurrentVersionId AND c.IsActive = 1
    WHERE v.VersionId = @VersionId
    GROUP BY v.VersionId, v.VersionNumber, v.VersionName, v.ReleaseDate, v.Description, 
             v.ReleaseNotes, v.IsMajorRelease, v.IsActive, v.CreatedBy, v.CreatedDate, 
             v.UpdatedDate, u.FirstName, u.LastName;
END
GO

-- =============================================
-- SP: Create Software Version
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateVersion')
    DROP PROCEDURE sp_CreateVersion;
GO

CREATE PROCEDURE sp_CreateVersion
    @VersionNumber NVARCHAR(50),
    @VersionName NVARCHAR(255),
    @ReleaseDate DATE,
    @Description NVARCHAR(MAX),
    @ReleaseNotes NVARCHAR(MAX),
    @IsMajorRelease BIT,
    @CreatedBy INT,
    @VersionId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if version number already exists
        IF EXISTS (SELECT 1 FROM SoftwareVersions WHERE VersionNumber = @VersionNumber)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Version number already exists', 16, 1);
            RETURN;
        END
        
        INSERT INTO SoftwareVersions (VersionNumber, VersionName, ReleaseDate, Description, ReleaseNotes, IsMajorRelease, CreatedBy)
        VALUES (@VersionNumber, @VersionName, @ReleaseDate, @Description, @ReleaseNotes, @IsMajorRelease, @CreatedBy);
        
        SET @VersionId = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- SP: Update Software Version
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateVersion')
    DROP PROCEDURE sp_UpdateVersion;
GO

CREATE PROCEDURE sp_UpdateVersion
    @VersionId INT,
    @VersionNumber NVARCHAR(50),
    @VersionName NVARCHAR(255),
    @ReleaseDate DATE,
    @Description NVARCHAR(MAX),
    @ReleaseNotes NVARCHAR(MAX),
    @IsMajorRelease BIT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if version number is being changed and if it already exists
    IF EXISTS (SELECT 1 FROM SoftwareVersions WHERE VersionNumber = @VersionNumber AND VersionId != @VersionId)
    BEGIN
        RAISERROR('Version number already exists', 16, 1);
        RETURN;
    END
    
    UPDATE SoftwareVersions
    SET 
        VersionNumber = @VersionNumber,
        VersionName = @VersionName,
        ReleaseDate = @ReleaseDate,
        Description = @Description,
        ReleaseNotes = @ReleaseNotes,
        IsMajorRelease = @IsMajorRelease,
        IsActive = @IsActive,
        UpdatedDate = GETDATE()
    WHERE VersionId = @VersionId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- =============================================
-- SP: Delete Software Version
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteVersion')
    DROP PROCEDURE sp_DeleteVersion;
GO

CREATE PROCEDURE sp_DeleteVersion
    @VersionId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if version is being used by any clients
        IF EXISTS (SELECT 1 FROM Clients WHERE CurrentVersionId = @VersionId)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Cannot delete version that is currently assigned to clients', 16, 1);
            RETURN;
        END
        
        -- Delete version history records
        DELETE FROM ClientVersions WHERE VersionId = @VersionId;
        
        -- Delete the version
        DELETE FROM SoftwareVersions WHERE VersionId = @VersionId;
        
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
-- SP: Get Version Statistics
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetVersionStatistics')
    DROP PROCEDURE sp_GetVersionStatistics;
GO

CREATE PROCEDURE sp_GetVersionStatistics
    @VersionId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        v.VersionId,
        v.VersionNumber,
        v.VersionName,
        COUNT(DISTINCT c.ClientId) AS ActiveClientCount,
        COUNT(DISTINCT cv.ClientVersionId) AS TotalDeployments,
        MIN(cv.AssignedDate) AS FirstDeployment,
        MAX(cv.AssignedDate) AS LatestDeployment
    FROM SoftwareVersions v
    LEFT JOIN Clients c ON v.VersionId = c.CurrentVersionId AND c.IsActive = 1
    LEFT JOIN ClientVersions cv ON v.VersionId = cv.VersionId
    WHERE v.VersionId = @VersionId
    GROUP BY v.VersionId, v.VersionNumber, v.VersionName;
END
GO

PRINT 'Phase 2 Version Stored Procedures Created Successfully';
