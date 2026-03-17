-- =============================================
-- Stored Procedures: Notifications
-- Purpose: Manage user notifications
-- =============================================

USE SoftwareUpdateManagement;
GO

-- =============================================
-- Stored Procedure: sp_GetUserNotifications
-- Description: Get all notifications for a user
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetUserNotifications]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetUserNotifications;
GO

CREATE PROCEDURE sp_GetUserNotifications
    @UserId INT,
    @IncludeRead BIT = 0,
    @MaxResults INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@MaxResults)
        NotificationId,
        UserId,
        Title,
        Message,
        Type,
        Priority,
        IsRead,
        RelatedEntityType,
        RelatedEntityId,
        ActionUrl,
        CreatedAt,
        ReadAt,
        ExpiresAt
    FROM Notifications
    WHERE UserId = @UserId
        AND (@IncludeRead = 1 OR IsRead = 0)
        AND (ExpiresAt IS NULL OR ExpiresAt > GETDATE())
    ORDER BY 
        CASE Priority 
            WHEN 'Urgent' THEN 1 
            WHEN 'High' THEN 2 
            WHEN 'Medium' THEN 3 
            WHEN 'Low' THEN 4 
        END,
        CreatedAt DESC;
END
GO

-- =============================================
-- Stored Procedure: sp_CreateNotification
-- Description: Create a new notification
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateNotification]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_CreateNotification;
GO

CREATE PROCEDURE sp_CreateNotification
    @UserId INT,
    @Title NVARCHAR(255),
    @Message NVARCHAR(MAX),
    @Type NVARCHAR(50),
    @Priority NVARCHAR(20) = 'Medium',
    @RelatedEntityType NVARCHAR(50) = NULL,
    @RelatedEntityId INT = NULL,
    @ActionUrl NVARCHAR(500) = NULL,
    @ExpiresAt DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO Notifications (
            UserId, Title, Message, Type, Priority,
            RelatedEntityType, RelatedEntityId, ActionUrl, ExpiresAt
        )
        VALUES (
            @UserId, @Title, @Message, @Type, @Priority,
            @RelatedEntityType, @RelatedEntityId, @ActionUrl, @ExpiresAt
        );

        SELECT 
            NotificationId,
            UserId,
            Title,
            Message,
            Type,
            Priority,
            IsRead,
            RelatedEntityType,
            RelatedEntityId,
            ActionUrl,
            CreatedAt,
            ReadAt,
            ExpiresAt
        FROM Notifications
        WHERE NotificationId = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- =============================================
-- Stored Procedure: sp_MarkNotificationAsRead
-- Description: Mark a notification as read
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_MarkNotificationAsRead]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_MarkNotificationAsRead;
GO

CREATE PROCEDURE sp_MarkNotificationAsRead
    @NotificationId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Notifications
    SET IsRead = 1,
        ReadAt = GETDATE()
    WHERE NotificationId = @NotificationId;
END
GO

-- =============================================
-- Stored Procedure: sp_MarkAllNotificationsAsRead
-- Description: Mark all user notifications as read
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_MarkAllNotificationsAsRead]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_MarkAllNotificationsAsRead;
GO

CREATE PROCEDURE sp_MarkAllNotificationsAsRead
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Notifications
    SET IsRead = 1,
        ReadAt = GETDATE()
    WHERE UserId = @UserId
        AND IsRead = 0;

    SELECT @@ROWCOUNT AS UpdatedCount;
END
GO

-- =============================================
-- Stored Procedure: sp_DeleteNotification
-- Description: Delete a notification
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DeleteNotification]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_DeleteNotification;
GO

CREATE PROCEDURE sp_DeleteNotification
    @NotificationId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Notifications
    WHERE NotificationId = @NotificationId;
END
GO

-- =============================================
-- Stored Procedure: sp_GetUnreadNotificationCount
-- Description: Get count of unread notifications for a user
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetUnreadNotificationCount]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_GetUnreadNotificationCount;
GO

CREATE PROCEDURE sp_GetUnreadNotificationCount
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(*) AS UnreadCount
    FROM Notifications
    WHERE UserId = @UserId
        AND IsRead = 0
        AND (ExpiresAt IS NULL OR ExpiresAt > GETDATE());
END
GO

-- =============================================
-- Stored Procedure: sp_CleanupExpiredNotifications
-- Description: Delete expired notifications (maintenance task)
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CleanupExpiredNotifications]') AND type in (N'P', N'PC'))
    DROP PROCEDURE sp_CleanupExpiredNotifications;
GO

CREATE PROCEDURE sp_CleanupExpiredNotifications
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Notifications
    WHERE ExpiresAt < GETDATE();

    SELECT @@ROWCOUNT AS DeletedCount;
END
GO

PRINT 'Notifications stored procedures created successfully.';
GO
