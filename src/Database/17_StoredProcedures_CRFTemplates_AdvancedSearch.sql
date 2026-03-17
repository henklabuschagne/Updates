-- =============================================
-- Stored Procedures: CRF Templates & Advanced Search
-- Purpose: CRF template management and advanced search capabilities
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- CRF TEMPLATES
-- =============================================

-- =============================================
-- Stored Procedure: sp_GetAllCRFTemplates
-- Description: Get all CRF templates
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetAllCRFTemplates]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetAllCRFTemplates;
GO

CREATE PROCEDURE sp_GetAllCRFTemplates
    @IncludeInactive BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        t.TemplateId,
        t.TemplateName,
        t.Description,
        t.Category,
        t.VersionId,
        v.VersionNumber,
        t.ChangeDescription,
        t.ImpactAssessment,
        t.RollbackPlan,
        t.TestingProcedure,
        t.DefaultPriority,
        t.IsActive,
        t.CreatedBy,
        u.Username AS CreatedByUsername,
        t.CreatedAt,
        t.UpdatedAt
    FROM CRFTemplates t
    LEFT JOIN SoftwareVersions v ON t.VersionId = v.VersionId
    LEFT JOIN Users u ON t.CreatedBy = u.UserId
    WHERE @IncludeInactive = 1 OR t.IsActive = 1
    ORDER BY t.TemplateName;
END
GO

-- =============================================
-- Stored Procedure: sp_GetCRFTemplateById
-- Description: Get a specific CRF template
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetCRFTemplateById]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetCRFTemplateById;
GO

CREATE PROCEDURE sp_GetCRFTemplateById
    @TemplateId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        t.TemplateId,
        t.TemplateName,
        t.Description,
        t.Category,
        t.VersionId,
        v.VersionNumber,
        t.ChangeDescription,
        t.ImpactAssessment,
        t.RollbackPlan,
        t.TestingProcedure,
        t.DefaultPriority,
        t.IsActive,
        t.CreatedBy,
        u.Username AS CreatedByUsername,
        t.CreatedAt,
        t.UpdatedAt
    FROM CRFTemplates t
    LEFT JOIN SoftwareVersions v ON t.VersionId = v.VersionId
    LEFT JOIN Users u ON t.CreatedBy = u.UserId
    WHERE t.TemplateId = @TemplateId;
END
GO

-- =============================================
-- Stored Procedure: sp_CreateCRFTemplate
-- Description: Create a new CRF template
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateCRFTemplate]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_CreateCRFTemplate;
GO

CREATE PROCEDURE sp_CreateCRFTemplate
    @TemplateName NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @Category NVARCHAR(100) = NULL,
    @VersionId INT = NULL,
    @ChangeDescription NVARCHAR(MAX) = NULL,
    @ImpactAssessment NVARCHAR(MAX) = NULL,
    @RollbackPlan NVARCHAR(MAX) = NULL,
    @TestingProcedure NVARCHAR(MAX) = NULL,
    @DefaultPriority NVARCHAR(20) = NULL,
    @CreatedBy INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO CRFTemplates (
            TemplateName, Description, Category, VersionId,
            ChangeDescription, ImpactAssessment, RollbackPlan,
            TestingProcedure, DefaultPriority, CreatedBy
        )
        VALUES (
            @TemplateName, @Description, @Category, @VersionId,
            @ChangeDescription, @ImpactAssessment, @RollbackPlan,
            @TestingProcedure, @DefaultPriority, @CreatedBy
        );

        DECLARE @NewTemplateId INT = SCOPE_IDENTITY();

        EXEC sp_GetCRFTemplateById @NewTemplateId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- =============================================
-- Stored Procedure: sp_UpdateCRFTemplate
-- Description: Update a CRF template
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateCRFTemplate]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_UpdateCRFTemplate;
GO

CREATE PROCEDURE sp_UpdateCRFTemplate
    @TemplateId INT,
    @TemplateName NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @Category NVARCHAR(100) = NULL,
    @VersionId INT = NULL,
    @ChangeDescription NVARCHAR(MAX) = NULL,
    @ImpactAssessment NVARCHAR(MAX) = NULL,
    @RollbackPlan NVARCHAR(MAX) = NULL,
    @TestingProcedure NVARCHAR(MAX) = NULL,
    @DefaultPriority NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE CRFTemplates
    SET TemplateName = @TemplateName,
        Description = @Description,
        Category = @Category,
        VersionId = @VersionId,
        ChangeDescription = @ChangeDescription,
        ImpactAssessment = @ImpactAssessment,
        RollbackPlan = @RollbackPlan,
        TestingProcedure = @TestingProcedure,
        DefaultPriority = @DefaultPriority,
        UpdatedAt = GETDATE()
    WHERE TemplateId = @TemplateId;

    EXEC sp_GetCRFTemplateById @TemplateId;
END
GO

-- =============================================
-- Stored Procedure: sp_DeleteCRFTemplate
-- Description: Delete (or deactivate) a CRF template
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DeleteCRFTemplate]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_DeleteCRFTemplate;
GO

CREATE PROCEDURE sp_DeleteCRFTemplate
    @TemplateId INT,
    @HardDelete BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @HardDelete = 1
    BEGIN
        DELETE FROM CRFTemplates WHERE TemplateId = @TemplateId;
    END
    ELSE
    BEGIN
        UPDATE CRFTemplates
        SET IsActive = 0,
            UpdatedAt = GETDATE()
        WHERE TemplateId = @TemplateId;
    END
END
GO

-- =============================================
-- ADVANCED SEARCH
-- =============================================

-- =============================================
-- Stored Procedure: sp_AdvancedSearch
-- Description: Advanced search across all entities
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_AdvancedSearch]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_AdvancedSearch;
GO

CREATE PROCEDURE sp_AdvancedSearch
    @SearchTerm NVARCHAR(500),
    @EntityType NVARCHAR(50) = NULL, -- 'CRF', 'Client', 'Version', 'User', 'All'
    @MaxResults INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SearchPattern NVARCHAR(502) = '%' + @SearchTerm + '%';

    -- Create temp table for results
    CREATE TABLE #SearchResults (
        EntityType NVARCHAR(50),
        EntityId INT,
        EntityName NVARCHAR(500),
        EntityDescription NVARCHAR(MAX),
        Relevance INT,
        CreatedAt DATETIME
    );

    -- Search CRFs
    IF @EntityType IS NULL OR @EntityType = 'CRF' OR @EntityType = 'All'
    BEGIN
        INSERT INTO #SearchResults
        SELECT TOP (@MaxResults)
            'CRF' AS EntityType,
            CRFId AS EntityId,
            CRFNumber AS EntityName,
            ChangeDescription AS EntityDescription,
            CASE 
                WHEN CRFNumber LIKE @SearchPattern THEN 3
                WHEN ChangeDescription LIKE @SearchPattern THEN 2
                ELSE 1
            END AS Relevance,
            CreatedAt
        FROM CRFs
        WHERE CRFNumber LIKE @SearchPattern
            OR ChangeDescription LIKE @SearchPattern
            OR ImpactAssessment LIKE @SearchPattern
            OR RollbackPlan LIKE @SearchPattern;
    END

    -- Search Clients
    IF @EntityType IS NULL OR @EntityType = 'Client' OR @EntityType = 'All'
    BEGIN
        INSERT INTO #SearchResults
        SELECT TOP (@MaxResults)
            'Client' AS EntityType,
            ClientId AS EntityId,
            ClientName AS EntityName,
            CONCAT('Contact: ', ContactEmail, ' | Version: ', CurrentVersion) AS EntityDescription,
            CASE 
                WHEN ClientName LIKE @SearchPattern THEN 3
                WHEN ContactEmail LIKE @SearchPattern THEN 2
                ELSE 1
            END AS Relevance,
            CreatedAt
        FROM Clients
        WHERE ClientName LIKE @SearchPattern
            OR ContactEmail LIKE @SearchPattern
            OR ContactPerson LIKE @SearchPattern
            OR CurrentVersion LIKE @SearchPattern;
    END

    -- Search Versions
    IF @EntityType IS NULL OR @EntityType = 'Version' OR @EntityType = 'All'
    BEGIN
        INSERT INTO #SearchResults
        SELECT TOP (@MaxResults)
            'Version' AS EntityType,
            VersionId AS EntityId,
            VersionNumber AS EntityName,
            LEFT(ReleaseNotes, 500) AS EntityDescription,
            CASE 
                WHEN VersionNumber LIKE @SearchPattern THEN 3
                WHEN ReleaseNotes LIKE @SearchPattern THEN 2
                ELSE 1
            END AS Relevance,
            CreatedAt
        FROM SoftwareVersions
        WHERE VersionNumber LIKE @SearchPattern
            OR ReleaseNotes LIKE @SearchPattern;
    END

    -- Search Users
    IF @EntityType IS NULL OR @EntityType = 'User' OR @EntityType = 'All'
    BEGIN
        INSERT INTO #SearchResults
        SELECT TOP (@MaxResults)
            'User' AS EntityType,
            UserId AS EntityId,
            Username AS EntityName,
            CONCAT('Email: ', Email, ' | ', FirstName, ' ', LastName) AS EntityDescription,
            CASE 
                WHEN Username LIKE @SearchPattern THEN 3
                WHEN Email LIKE @SearchPattern THEN 2
                WHEN CONCAT(FirstName, ' ', LastName) LIKE @SearchPattern THEN 2
                ELSE 1
            END AS Relevance,
            CreatedAt
        FROM Users
        WHERE Username LIKE @SearchPattern
            OR Email LIKE @SearchPattern
            OR FirstName LIKE @SearchPattern
            OR LastName LIKE @SearchPattern;
    END

    -- Return results ordered by relevance
    SELECT TOP (@MaxResults)
        EntityType,
        EntityId,
        EntityName,
        EntityDescription,
        Relevance,
        CreatedAt
    FROM #SearchResults
    ORDER BY Relevance DESC, CreatedAt DESC;

    DROP TABLE #SearchResults;
END
GO

PRINT 'CRF Templates and Advanced Search stored procedures created successfully.';
GO
