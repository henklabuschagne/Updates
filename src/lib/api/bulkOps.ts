import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { BulkOperationResponse, BulkOperationPagedResponse, BulkOperationStatisticsResponse, BulkCreateCRFsRequest, BulkUpdateClientsRequest } from '../../services/api';
import { getStoredUser } from './auth';
import * as crfsApi from './crfs';
import * as clientsApi from './clients';

export async function getAllBulkOperations(page: number = 1, pageSize: number = 20): Promise<ApiResult<BulkOperationPagedResponse>> {
  return mockApiCall(() => {
    const all = appStore.getAllBulkOperations();
    const totalCount = all.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    return {
      operations: all.slice(start, start + pageSize),
      totalCount,
      pageNumber: page,
      pageSize,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
    };
  });
}

export async function getBulkOperationStatistics(): Promise<ApiResult<BulkOperationStatisticsResponse>> {
  return mockApiCall(() => {
    const all = appStore.getAllBulkOperations();
    const opsByType: Record<string, number> = {};
    let totalItems = 0, totalSuccess = 0, totalFailed = 0;
    all.forEach(op => {
      opsByType[op.operationType] = (opsByType[op.operationType] || 0) + 1;
      totalItems += op.totalItems;
      totalSuccess += op.successfulItems;
      totalFailed += op.failedItems;
    });
    return {
      totalOperations: all.length,
      completedOperations: all.filter(o => o.status === 'Completed').length,
      failedOperations: all.filter(o => o.status === 'Failed').length,
      inProgressOperations: all.filter(o => o.status === 'In Progress').length,
      operationsByType: opsByType,
      totalItemsProcessed: totalItems,
      totalSuccessfulItems: totalSuccess,
      totalFailedItems: totalFailed,
      averageSuccessRate: totalItems > 0 ? (totalSuccess / totalItems) * 100 : 0,
    };
  });
}

export async function bulkCreateCRFs(request: BulkCreateCRFsRequest): Promise<ApiResult<number>> {
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const bulkOp = appStore.createBulkOperation({
      operationType: 'BULK_CREATE_CRFS',
      initiatedBy: currentUser?.userId || 1,
      initiatedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      initiatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'Completed',
      totalItems: request.crfs.length,
      processedItems: request.crfs.length,
      successfulItems: request.crfs.length,
      failedItems: 0,
      inputData: JSON.stringify({ count: request.crfs.length }),
    });
    return bulkOp.bulkOperationId;
  });
}

export async function bulkUpdateClients(request: BulkUpdateClientsRequest): Promise<ApiResult<number>> {
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const bulkOp = appStore.createBulkOperation({
      operationType: 'BULK_UPDATE_CLIENTS',
      initiatedBy: currentUser?.userId || 1,
      initiatedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      initiatedAt: new Date().toISOString(),
      status: 'Completed',
      completedAt: new Date().toISOString(),
      totalItems: request.clientIds.length,
      processedItems: request.clientIds.length,
      successfulItems: request.clientIds.length,
      failedItems: 0,
      inputData: JSON.stringify(request),
      resultData: JSON.stringify({ successful: request.clientIds, failed: [] }),
    });

    // Apply updates
    request.clientIds.forEach(clientId => {
      const client = appStore.getClientById(clientId);
      if (client) {
        if (request.newVersion) {
          const version = appStore.versions.find(v => v.versionNumber === request.newVersion);
          if (version) {
            appStore.updateClientVersion(clientId, version.versionId, 'Bulk update', currentUser?.userId || 1, currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System');
          }
        }
        if (request.newStatus) {
          appStore.updateClient(clientId, { status: request.newStatus });
        }
      }
    });

    return bulkOp.bulkOperationId;
  });
}
