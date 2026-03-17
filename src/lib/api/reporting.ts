import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { DeploymentReportResponse, CRFReportResponse, ClientReportResponse, SystemPerformanceReportResponse, DashboardStatisticsResponse } from '../../services/api';

export async function getDeploymentReport(startDate: string, endDate: string): Promise<ApiResult<DeploymentReportResponse>> {
  return mockApiCall(() => ({
    startDate,
    endDate,
    totalDeployments: 25,
    successfulDeployments: 22,
    failedDeployments: 2,
    pendingDeployments: 1,
    successRate: 88,
    deploymentsByVersion: [
      { versionNumber: '3.2.1', versionName: 'Winter 2024 Release', deploymentCount: 15, successCount: 14, failedCount: 1, successRate: 93.3 },
      { versionNumber: '3.2.0', versionName: 'Fall 2024 Release', deploymentCount: 10, successCount: 8, failedCount: 2, successRate: 80 },
    ],
    deploymentsByClient: appStore.clients.slice(0, 5).map(client => ({
      clientId: client.clientId,
      clientName: client.clientName,
      deploymentCount: Math.floor(Math.random() * 5) + 1,
      successCount: Math.floor(Math.random() * 4) + 1,
      failedCount: Math.floor(Math.random() * 2),
      currentVersion: client.currentVersion,
      lastDeploymentDate: client.lastUpdateDate,
    })),
    deploymentTrend: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalDeployments: Math.floor(Math.random() * 5) + 1,
      successfulDeployments: Math.floor(Math.random() * 4) + 1,
      failedDeployments: Math.floor(Math.random() * 2),
    })),
  }));
}

export async function getCRFReport(startDate: string, endDate: string): Promise<ApiResult<CRFReportResponse>> {
  return mockApiCall(() => {
    const crfsList = appStore.crfs.filter(crf => crf.createdDate >= startDate && crf.createdDate <= endDate);
    return {
      startDate,
      endDate,
      totalCRFs: crfsList.length,
      completedCRFs: crfsList.filter(c => c.status === 'Completed').length,
      pendingCRFs: crfsList.filter(c => c.status === 'Pending').length,
      cancelledCRFs: crfsList.filter(c => c.status === 'Cancelled').length,
      completionRate: crfsList.length > 0 ? (crfsList.filter(c => c.status === 'Completed').length / crfsList.length) * 100 : 0,
      averageApprovalTime: 2.5,
      averageDeploymentTime: 3.2,
      crfsByStatus: [
        { status: 'Pending', count: 3, percentage: 20 },
        { status: 'Approved', count: 2, percentage: 13 },
        { status: 'Completed', count: 8, percentage: 53 },
        { status: 'Failed', count: 2, percentage: 14 },
      ],
      crfsByPriority: [
        { priority: 'Critical', count: 2, completedCount: 1, averageCompletionDays: 1.5 },
        { priority: 'High', count: 5, completedCount: 4, averageCompletionDays: 2.8 },
        { priority: 'Medium', count: 6, completedCount: 5, averageCompletionDays: 4.2 },
        { priority: 'Low', count: 2, completedCount: 2, averageCompletionDays: 7.1 },
      ],
      crfsByVersion: appStore.versions.slice(0, 3).map(v => ({
        versionNumber: v.versionNumber,
        versionName: v.versionName,
        crfCount: Math.floor(Math.random() * 8) + 2,
        completedCount: Math.floor(Math.random() * 6) + 1,
      })),
      approvalPerformance: appStore.workflowSteps.map(step => ({
        stepName: step.stepName,
        totalApprovals: 15,
        approvedCount: 12,
        rejectedCount: 2,
        pendingCount: 1,
        averageApprovalDays: Math.random() * 3 + 0.5,
      })),
    };
  });
}

export async function getClientReport(): Promise<ApiResult<ClientReportResponse>> {
  return mockApiCall(() => {
    const activeClients = appStore.clients.filter(c => c.isActive);
    const latestVersion = appStore.versions[0];
    return {
      totalClients: appStore.clients.length,
      activeClients: activeClients.length,
      inactiveClients: appStore.clients.length - activeClients.length,
      versionDistribution: appStore.versions.map(v => ({
        versionNumber: v.versionNumber,
        versionName: v.versionName,
        clientCount: appStore.clients.filter(c => c.currentVersionId === v.versionId).length,
        percentage: (appStore.clients.filter(c => c.currentVersionId === v.versionId).length / appStore.clients.length) * 100,
        isCurrentVersion: v.versionId === latestVersion?.versionId,
      })),
      clientsByStatus: [
        { status: 'Active', clientCount: activeClients.length, percentage: (activeClients.length / appStore.clients.length) * 100 },
        { status: 'Inactive', clientCount: appStore.clients.length - activeClients.length, percentage: ((appStore.clients.length - activeClients.length) / appStore.clients.length) * 100 },
      ],
      recentUpdates: appStore.clientVersionHistory.slice(0, 10).map(h => ({
        clientId: h.clientId,
        clientName: appStore.clients.find(c => c.clientId === h.clientId)?.clientName || '',
        fromVersion: appStore.versions.find(v => v.versionId === h.versionId - 1)?.versionNumber || '',
        toVersion: h.versionNumber,
        updateDate: h.assignedDate,
        updatedBy: h.updatedByName,
      })),
      outdatedClients: appStore.clients
        .filter(c => c.currentVersionId !== latestVersion?.versionId)
        .map(c => ({
          clientId: c.clientId,
          clientName: c.clientName,
          currentVersion: c.currentVersion,
          latestVersion: latestVersion?.versionNumber || '',
          versionsBehind: (latestVersion?.versionId || 0) - (c.currentVersionId || 0),
          lastUpdateDate: c.lastUpdateDate,
          daysSinceUpdate: c.lastUpdateDate ? Math.floor((Date.now() - new Date(c.lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        })),
    };
  });
}

export async function getSystemPerformanceReport(startDate: string, endDate: string): Promise<ApiResult<SystemPerformanceReportResponse>> {
  return mockApiCall(() => {
    const apiLogs = appStore.apiExecutionLogs.filter(log => log.executionStartTime >= startDate && log.executionStartTime <= endDate);
    const errors = appStore.errorNotifications.filter(err => err.createdDate >= startDate && err.createdDate <= endDate);
    return {
      startDate,
      endDate,
      totalAPIExecutions: apiLogs.length,
      successfulAPIExecutions: apiLogs.filter(l => l.status === 'Success').length,
      failedAPIExecutions: apiLogs.filter(l => l.status === 'Failed').length,
      apiSuccessRate: apiLogs.length > 0 ? (apiLogs.filter(l => l.status === 'Success').length / apiLogs.length) * 100 : 0,
      averageAPIResponseTime: apiLogs.length > 0 ? apiLogs.reduce((sum, log) => sum + (log.durationMs || 0), 0) / apiLogs.length : 0,
      totalErrors: errors.length,
      resolvedErrors: errors.filter(e => e.isResolved).length,
      unresolvedErrors: errors.filter(e => !e.isResolved).length,
      apiPerformanceByType: appStore.apiConfigurations.map(config => {
        const configLogs = apiLogs.filter(l => l.apiConfigurationId === config.apiConfigurationId);
        return {
          apiName: config.apiName,
          apiType: config.apiType,
          executionCount: configLogs.length,
          successCount: configLogs.filter(l => l.status === 'Success').length,
          failureCount: configLogs.filter(l => l.status === 'Failed').length,
          successRate: configLogs.length > 0 ? (configLogs.filter(l => l.status === 'Success').length / configLogs.length) * 100 : 0,
          averageResponseTime: configLogs.length > 0 ? configLogs.reduce((sum, log) => sum + (log.durationMs || 0), 0) / configLogs.length : 0,
          minResponseTime: configLogs.length > 0 ? Math.min(...configLogs.map(l => l.durationMs || 0)) : 0,
          maxResponseTime: configLogs.length > 0 ? Math.max(...configLogs.map(l => l.durationMs || 0)) : 0,
        };
      }),
      errorsByType: Object.entries(errors.reduce((acc, err) => { acc[err.errorType] = (acc[err.errorType] || 0) + 1; return acc; }, {} as Record<string, number>))
        .map(([errorType, count]) => ({
          errorType,
          errorCount: count,
          resolvedCount: errors.filter(e => e.errorType === errorType && e.isResolved).length,
          resolutionRate: (errors.filter(e => e.errorType === errorType && e.isResolved).length / count) * 100,
        })),
      errorsBySeverity: ['Critical', 'High', 'Medium', 'Low'].map(severity => ({
        severity,
        errorCount: errors.filter(e => e.severity === severity).length,
        resolvedCount: errors.filter(e => e.severity === severity && e.isResolved).length,
        unresolvedCount: errors.filter(e => e.severity === severity && !e.isResolved).length,
      })),
    };
  });
}

export async function getDashboardStatistics(): Promise<ApiResult<DashboardStatisticsResponse>> {
  return mockApiCall(() => {
    const latestVersion = appStore.versions[0];
    const activeCRFs = appStore.crfs.filter(c => c.status === 'Pending' || c.status === 'Approved' || c.status === 'In Progress');
    const pendingApprovals = appStore.crfApprovals.filter(a => a.status === 'Pending');
    const unresolvedErrors = appStore.errorNotifications.filter(e => !e.isResolved);
    const today = new Date().toISOString().split('T')[0];

    return {
      systemOverview: {
        totalClients: appStore.clients.length,
        activeCRFs: activeCRFs.length,
        pendingApprovals: pendingApprovals.length,
        deploymentsToday: appStore.deploymentQueue.filter(d => d.queuedDate.startsWith(today)).length,
        failedDeployments: appStore.errorNotifications.filter(e => e.errorType === 'Database Migration Error').length,
        unresolvedErrors: unresolvedErrors.length,
        overallDeploymentSuccessRate: 88.5,
        totalVersions: appStore.versions.length,
        latestVersion: latestVersion?.versionNumber || '',
      },
      recentActivities: appStore.auditLogs.slice(0, 10).map(log => ({
        activityType: log.action,
        description: log.details || '',
        username: log.username || 'System',
        timestamp: log.timestamp,
        entityType: log.entityType,
        entityId: log.entityId,
        severity: 'Info',
      })),
      upcomingDeployments: appStore.crfs
        .filter(c => c.status === 'Approved' || c.status === 'Scheduled')
        .slice(0, 5)
        .map(crf => ({
          crfId: crf.crfId,
          crfNumber: crf.crfNumber,
          crfTitle: crf.title,
          versionNumber: crf.versionNumber,
          scheduledDate: crf.scheduledDeploymentDate,
          clientCount: crf.clientCount,
          priority: crf.priority,
          status: crf.status,
        })),
      criticalAlerts: unresolvedErrors.slice(0, 5).map(err => ({
        alertId: err.errorNotificationId,
        alertType: err.errorType,
        message: err.errorMessage,
        severity: err.severity,
        createdDate: err.createdDate,
        isResolved: err.isResolved,
        relatedEntity: err.crfNumber ? 'CRF' : undefined,
        relatedEntityId: err.crfId,
      })),
      workflowMetrics: {
        totalCRFsThisMonth: appStore.crfs.filter(c => {
          const d = new Date(c.createdDate); const n = new Date();
          return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
        }).length,
        completedCRFsThisMonth: appStore.crfs.filter(c => {
          const d = c.completedDate ? new Date(c.completedDate) : null; const n = new Date();
          return d && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
        }).length,
        averageApprovalTime: 2.5,
        averageDeploymentTime: 3.8,
        approvalSuccessRate: 85,
        stepMetrics: appStore.workflowSteps.map(step => ({
          stepName: step.stepName,
          pendingCount: appStore.crfApprovals.filter(a => a.workflowStepId === step.workflowStepId && a.status === 'Pending').length,
          approvedCount: appStore.crfApprovals.filter(a => a.workflowStepId === step.workflowStepId && a.status === 'Approved').length,
          rejectedCount: appStore.crfApprovals.filter(a => a.workflowStepId === step.workflowStepId && a.status === 'Rejected').length,
          averageProcessingDays: Math.random() * 3 + 0.5,
        })),
      },
      versionAdoption: {
        latestVersion: latestVersion?.versionNumber || '',
        clientsOnLatestVersion: appStore.clients.filter(c => c.currentVersionId === latestVersion?.versionId).length,
        latestVersionAdoptionRate: appStore.clients.length > 0 ? (appStore.clients.filter(c => c.currentVersionId === latestVersion?.versionId).length / appStore.clients.length) * 100 : 0,
        versionUsage: appStore.versions.map(v => ({
          versionNumber: v.versionNumber,
          versionName: v.versionName,
          clientCount: appStore.clients.filter(c => c.currentVersionId === v.versionId).length,
          percentage: appStore.clients.length > 0 ? (appStore.clients.filter(c => c.currentVersionId === v.versionId).length / appStore.clients.length) * 100 : 0,
          isLatest: v.versionId === latestVersion?.versionId,
          releaseDate: v.releaseDate,
        })),
      },
    };
  });
}
