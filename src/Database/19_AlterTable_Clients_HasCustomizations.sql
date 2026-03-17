-- =============================================
-- Add HasCustomizations field to Clients table
-- This field tracks clients with custom implementations
-- that require manual updates (cannot use auto-update)
-- =============================================

-- Add HasCustomizations column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Clients]') AND name = 'HasCustomizations')
BEGIN
    ALTER TABLE Clients
    ADD HasCustomizations BIT NOT NULL DEFAULT 0;
    
    PRINT 'Added HasCustomizations column to Clients table';
END
ELSE
BEGIN
    PRINT 'HasCustomizations column already exists in Clients table';
END
GO

-- Add index for quick filtering of customized clients
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Clients_HasCustomizations' AND object_id = OBJECT_ID(N'[dbo].[Clients]'))
BEGIN
    CREATE INDEX IX_Clients_HasCustomizations ON Clients(HasCustomizations);
    PRINT 'Added index IX_Clients_HasCustomizations';
END
GO

-- Add comment explaining the field
EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Indicates if client has customizations. Clients with customizations cannot use auto-update and require manual deployment.', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'Clients',
    @level2type = N'COLUMN', @level2name = N'HasCustomizations';
GO

PRINT 'HasCustomizations field added successfully to Clients table';
PRINT 'Clients with HasCustomizations=1 will require manual updates';
GO
