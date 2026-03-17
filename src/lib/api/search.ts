import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { AdvancedSearchRequest, AdvancedSearchResult } from '../../services/api';

export async function advancedSearch(request: AdvancedSearchRequest): Promise<ApiResult<AdvancedSearchResult>> {
  return mockApiCall(() => {
    const keyword = request.keyword?.toLowerCase() || '';

    const crfs = appStore.crfs.filter(c =>
      (!keyword || c.crfNumber.toLowerCase().includes(keyword) || c.title.toLowerCase().includes(keyword)) &&
      (!request.status || c.status === request.status)
    ).slice(0, 10).map(c => ({
      crfId: c.crfId, crfNumber: c.crfNumber, title: c.title, description: c.description,
      status: c.status, priority: c.priority, createdDate: c.createdDate,
      createdBy: c.requestedByName, versionNumber: c.versionNumber, relevanceScore: 1.0,
    }));

    const clients = appStore.clients.filter(c =>
      !keyword || c.clientName.toLowerCase().includes(keyword) || c.contactEmail.toLowerCase().includes(keyword)
    ).slice(0, 10).map(c => ({
      clientId: c.clientId, clientCode: `CLI-${c.clientId}`, clientName: c.clientName,
      contactEmail: c.contactEmail, contactPerson: c.contactPerson, currentVersion: c.currentVersion,
      status: c.status, lastUpdated: c.lastUpdateDate, relevanceScore: 1.0,
    }));

    const versions = appStore.versions.filter(v =>
      !keyword || v.versionNumber.toLowerCase().includes(keyword) || v.versionName.toLowerCase().includes(keyword)
    ).slice(0, 10).map(v => ({
      versionId: v.versionId, versionNumber: v.versionNumber, description: v.description,
      releaseDate: v.releaseDate, isStable: v.isActive, clientCount: v.clientCount,
      status: v.isActive ? 'Active' : 'Inactive', relevanceScore: 1.0,
    }));

    const errors = appStore.errorNotifications.filter(e =>
      !keyword || e.errorMessage.toLowerCase().includes(keyword) || e.errorType.toLowerCase().includes(keyword)
    ).slice(0, 10).map(e => ({
      errorId: e.errorNotificationId, errorCode: `ERR-${e.errorNotificationId}`,
      errorMessage: e.errorMessage, severity: e.severity, clientName: e.clientName,
      versionNumber: appStore.crfs.find(c => c.crfId === e.crfId)?.versionNumber,
      occurredAt: e.createdDate, isResolved: e.isResolved, relevanceScore: 1.0,
    }));

    const deployments = appStore.deploymentQueue.filter(d =>
      !keyword || d.crfNumber.toLowerCase().includes(keyword) || d.clientName.toLowerCase().includes(keyword)
    ).slice(0, 10).map(d => ({
      deploymentId: d.deploymentQueueId, crfId: d.crfId, crfNumber: d.crfNumber,
      clientName: d.clientName, versionNumber: d.versionNumber, scheduledDate: d.scheduledStartTime,
      status: d.status, priority: d.priority, createdDate: d.queuedDate, relevanceScore: 1.0,
    }));

    return {
      summary: {
        totalCRFs: crfs.length, totalClients: clients.length, totalVersions: versions.length,
        totalErrors: errors.length, totalDeployments: deployments.length,
        totalResults: crfs.length + clients.length + versions.length + errors.length + deployments.length,
        searchedAt: new Date().toISOString(),
      },
      crfs, clients, versions, errors, deployments,
    };
  });
}
