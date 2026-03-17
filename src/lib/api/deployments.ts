import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { DeploymentQueueResponse, QueueDeploymentRequest, UpdateDeploymentQueueRequest } from '../../services/api';
import { getStoredUser } from './auth';

export async function getAllDeploymentQueues(): Promise<ApiResult<DeploymentQueueResponse[]>> {
  return mockApiCall(() => appStore.getAllDeploymentQueues());
}

export async function getDeploymentQueueById(id: number): Promise<ApiResult<DeploymentQueueResponse>> {
  return mockApiCall(() => {
    const item = appStore.getDeploymentQueueById(id);
    if (!item) throw new Error('Deployment queue item not found');
    return item;
  });
}

export async function queueDeployment(request: QueueDeploymentRequest): Promise<ApiResult<number>> {
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const crf = appStore.getCRFById(request.crfId);
    const client = appStore.getClientById(request.clientId);
    const entry = appStore.createDeploymentQueue({
      crfId: request.crfId,
      clientId: request.clientId,
      queuedBy: currentUser?.userId || 1,
      queuedDate: new Date().toISOString(),
      scheduledStartTime: request.scheduledStartTime,
      status: 'Queued',
      priority: request.priority,
      deploymentType: request.deploymentType,
      notes: request.notes,
      crfNumber: crf?.crfNumber || '',
      crfTitle: crf?.title || '',
      clientName: client?.clientName || '',
      queuedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      versionNumber: crf?.versionNumber || '',
    });
    return entry.deploymentQueueId;
  });
}

export async function updateDeploymentQueue(id: number, request: UpdateDeploymentQueueRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.updateDeploymentQueue(id, {
      scheduledStartTime: request.scheduledStartTime,
      priority: request.priority,
      deploymentType: request.deploymentType,
      notes: request.notes,
    });
    if (!result) throw new Error('Deployment queue item not found');
    return true;
  });
}

export async function updateDeploymentQueueStatus(id: number, status: string): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const updates: Partial<DeploymentQueueResponse> = { status };
    if (status === 'In Progress') {
      updates.actualStartTime = new Date().toISOString();
    } else if (status === 'Completed' || status === 'Failed') {
      updates.completedTime = new Date().toISOString();
    }
    const result = appStore.updateDeploymentQueue(id, updates);
    if (!result) throw new Error('Deployment queue item not found');
    return true;
  });
}

export async function cancelDeployment(id: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.deleteDeploymentQueue(id);
    if (!result) throw new Error('Deployment queue item not found');
    return true;
  });
}
