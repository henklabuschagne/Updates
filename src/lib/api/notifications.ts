import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { NotificationResponse, CreateNotificationRequest } from '../../services/api';

export async function getAllNotifications(userId?: number): Promise<ApiResult<NotificationResponse[]>> {
  return mockApiCall(() => appStore.getAllNotifications(userId));
}

export async function createNotification(request: CreateNotificationRequest): Promise<ApiResult<number>> {
  return mockApiCall(() => {
    const entry = appStore.createNotification({
      userId: request.userId,
      title: request.title,
      message: request.message,
      type: request.type,
      priority: request.priority || 'Normal',
      isRead: false,
      relatedEntityType: request.relatedEntityType,
      relatedEntityId: request.relatedEntityId,
      actionUrl: request.actionUrl,
      createdAt: new Date().toISOString(),
      expiresAt: request.expiresAt,
    });
    return entry.notificationId;
  });
}

export async function markNotificationRead(id: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.updateNotification(id, { isRead: true, readAt: new Date().toISOString() });
    if (!result) throw new Error('Notification not found');
    return true;
  });
}

export async function markAllNotificationsRead(userId: number): Promise<ApiResult<number>> {
  return mockApiCall(() => appStore.markAllNotificationsRead(userId));
}

export async function deleteNotification(id: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.deleteNotification(id);
    if (!result) throw new Error('Notification not found');
    return true;
  });
}
