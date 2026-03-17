import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { ErrorNotificationResponse, CreateErrorNotificationRequest, ResolveErrorRequest } from '../../services/api';
import { getStoredUser } from './auth';

export async function getAllErrorNotifications(): Promise<ApiResult<ErrorNotificationResponse[]>> {
  return mockApiCall(() => appStore.getAllErrorNotifications());
}

export async function getErrorNotificationById(id: number): Promise<ApiResult<ErrorNotificationResponse>> {
  return mockApiCall(() => {
    const error = appStore.getErrorNotificationById(id);
    if (!error) throw new Error('Error notification not found');
    return error;
  });
}

export async function createErrorNotification(request: CreateErrorNotificationRequest): Promise<ApiResult<number>> {
  return mockApiCall(() => {
    const crf = request.crfId ? appStore.getCRFById(request.crfId) : null;
    const client = request.clientId ? appStore.getClientById(request.clientId) : null;
    const entry = appStore.createErrorNotification({
      crfId: request.crfId,
      clientId: request.clientId,
      errorType: request.errorType,
      errorSource: request.errorSource,
      errorMessage: request.errorMessage,
      stackTrace: request.stackTrace,
      severity: request.severity,
      isResolved: false,
      resolvedBy: undefined,
      resolvedDate: undefined,
      resolutionNotes: '',
      notificationSent: false,
      notificationSentDate: undefined,
      crfNumber: crf?.crfNumber || '',
      clientName: client?.clientName || '',
      resolvedByName: '',
    });
    return entry.errorNotificationId;
  });
}

export async function resolveError(id: number, request: ResolveErrorRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const result = appStore.updateErrorNotification(id, {
      isResolved: true,
      resolvedBy: currentUser?.userId,
      resolvedDate: new Date().toISOString(),
      resolutionNotes: request.resolutionNotes,
      resolvedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
    });
    if (!result) throw new Error('Error notification not found');
    return true;
  });
}
