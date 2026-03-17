/**
 * Reactive Hook for the Centralized Data Store
 * 
 * Components use this hook to:
 * - Read reactive state (re-renders on changes)
 * - Access sync read helpers via `reads`
 * - Call async actions via `actions` (routed through API layer)
 * 
 * Usage:
 *   const { versions, clients, actions, reads } = useAppStore('versions', 'clients');
 */

import { useState, useEffect, useMemo } from 'react';
import { appStore, type Slice } from '../lib/appStore';
import { api } from '../lib/api';

export function useAppStore(...subscribeTo: Slice[]) {
  // Force re-render when subscribed slices change
  const [, bump] = useState(0);

  useEffect(() => {
    const unsubscribes = subscribeTo.map(slice =>
      appStore.subscribe(slice, () => bump(v => v + 1))
    );
    return () => unsubscribes.forEach(unsub => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeTo.join(',')]);

  // ─── Reactive State ──────────────────────────────────
  const users = appStore.users;
  const userDtos = appStore.userDtos;
  const roles = appStore.roles;
  const versions = appStore.versions;
  const clients = appStore.clients;
  const clientVersionHistory = appStore.clientVersionHistory;
  const workflowSteps = appStore.workflowSteps;
  const crfs = appStore.crfs;
  const crfClients = appStore.crfClients;
  const crfApprovals = appStore.crfApprovals;
  const apiConfigurations = appStore.apiConfigurations;
  const apiExecutionLogs = appStore.apiExecutionLogs;
  const deploymentLogs = appStore.deploymentLogs;
  const errorNotifications = appStore.errorNotifications;
  const deploymentQueue = appStore.deploymentQueue;
  const notifications = appStore.notifications;
  const auditLogs = appStore.auditLogs;
  const bulkOperations = appStore.bulkOperations;
  const crfTemplates = appStore.crfTemplates;

  // Computed
  const unreadNotificationCount = appStore.unreadNotificationCount;
  const activeClientCount = appStore.activeClientCount;
  const unresolvedErrorCount = appStore.unresolvedErrorCount;
  const pendingCRFCount = appStore.pendingCRFCount;

  // ─── Sync Read Helpers ───────────────────────────────
  const reads = useMemo(() => ({
    getUserById: (id: number) => appStore.getUserById(id),
    getRoleById: (id: number) => appStore.getRoleById(id),
    getVersionById: (id: number) => appStore.getVersionById(id),
    getClientById: (id: number) => appStore.getClientById(id),
    getCRFById: (id: number) => appStore.getCRFById(id),
    getCRFClients: (crfId: number) => appStore.getCRFClients(crfId),
    getCRFApprovals: (crfId: number) => appStore.getCRFApprovals(crfId),
    getClientVersionHistory: (clientId: number) => appStore.getClientVersionHistory(clientId),
    getActiveWorkflowSteps: () => appStore.getActiveWorkflowSteps(),
    getAPIConfigurationById: (id: number) => appStore.getAPIConfigurationById(id),
    getDeploymentLogs: (crfId: number, clientId?: number) => appStore.getDeploymentLogs(crfId, clientId),
    getErrorNotificationById: (id: number) => appStore.getErrorNotificationById(id),
    getDeploymentQueueById: (id: number) => appStore.getDeploymentQueueById(id),
    getUnreadNotificationCount: (userId?: number) => appStore.getUnreadNotificationCount(userId),
  }), []);

  // ─── Async Actions (routed through API layer) ───────
  const actions = useMemo(() => ({
    // Auth
    login: api.auth.login,
    logout: api.auth.logout,
    getCurrentUser: api.auth.getCurrentUser,

    // Users
    getAllUsers: api.users.getAllUsers,
    createUser: api.users.createUser,
    updateUser: api.users.updateUser,
    deleteUser: api.users.deleteUser,
    getAllRoles: api.users.getAllRoles,

    // Versions
    getAllVersions: api.versions.getAllVersions,
    createVersion: api.versions.createVersion,
    updateVersion: api.versions.updateVersion,
    deleteVersion: api.versions.deleteVersion,

    // Clients
    getAllClients: api.clients.getAllClients,
    createClient: api.clients.createClient,
    updateClient: api.clients.updateClient,
    deleteClient: api.clients.deleteClient,
    updateClientVersion: api.clients.updateClientVersion,
    getClientVersionHistory: api.clients.getClientVersionHistory,

    // CRFs
    getAllCRFs: api.crfs.getAllCRFs,
    createCRF: api.crfs.createCRF,
    updateCRF: api.crfs.updateCRF,
    updateCRFStatus: api.crfs.updateCRFStatus,
    deleteCRF: api.crfs.deleteCRF,
    getCRFClients: api.crfs.getCRFClients,
    getCRFApprovals: api.crfs.getCRFApprovals,
    updateCRFApproval: api.crfs.updateCRFApproval,
    getCRFLogs: api.crfs.getCRFLogs,
    getAllDeploymentLogs: api.crfs.getAllDeploymentLogs,

    // Workflow
    getWorkflowSteps: api.workflow.getWorkflowSteps,
    createWorkflowStep: api.workflow.createWorkflowStep,
    updateWorkflowStep: api.workflow.updateWorkflowStep,
    deleteWorkflowStep: api.workflow.deleteWorkflowStep,
    reorderWorkflowStep: api.workflow.reorderWorkflowStep,

    // API Configuration
    getAllAPIConfigurations: api.apiConfig.getAllAPIConfigurations,
    createAPIConfiguration: api.apiConfig.createAPIConfiguration,
    updateAPIConfiguration: api.apiConfig.updateAPIConfiguration,
    deleteAPIConfiguration: api.apiConfig.deleteAPIConfiguration,
    getAPIExecutionLogs: api.apiConfig.getAPIExecutionLogs,

    // Error Notifications
    getAllErrorNotifications: api.errors.getAllErrorNotifications,
    createErrorNotification: api.errors.createErrorNotification,
    resolveError: api.errors.resolveError,

    // Deployment Queue
    getAllDeploymentQueues: api.deployments.getAllDeploymentQueues,
    queueDeployment: api.deployments.queueDeployment,
    updateDeploymentQueue: api.deployments.updateDeploymentQueue,
    updateDeploymentQueueStatus: api.deployments.updateDeploymentQueueStatus,
    cancelDeployment: api.deployments.cancelDeployment,

    // Notifications
    getAllNotifications: api.notifications.getAllNotifications,
    createNotification: api.notifications.createNotification,
    markNotificationRead: api.notifications.markNotificationRead,
    markAllNotificationsRead: api.notifications.markAllNotificationsRead,
    deleteNotification: api.notifications.deleteNotification,

    // Audit Log
    getAuditLogs: api.auditLog.getAuditLogs,
    getAuditLogStatistics: api.auditLog.getAuditLogStatistics,

    // Bulk Operations
    getAllBulkOperations: api.bulkOps.getAllBulkOperations,
    getBulkOperationStatistics: api.bulkOps.getBulkOperationStatistics,
    bulkCreateCRFs: api.bulkOps.bulkCreateCRFs,
    bulkUpdateClients: api.bulkOps.bulkUpdateClients,

    // Reporting
    getDeploymentReport: api.reporting.getDeploymentReport,
    getCRFReport: api.reporting.getCRFReport,
    getClientReport: api.reporting.getClientReport,
    getSystemPerformanceReport: api.reporting.getSystemPerformanceReport,
    getDashboardStatistics: api.reporting.getDashboardStatistics,

    // System Health
    getSystemMetrics: api.systemHealth.getSystemMetrics,
    getSystemHealth: api.systemHealth.getSystemHealth,

    // Search
    advancedSearch: api.search.advancedSearch,

    // Templates
    getAllCRFTemplates: api.templates.getAllCRFTemplates,
    createCRFTemplate: api.templates.createCRFTemplate,
    updateCRFTemplate: api.templates.updateCRFTemplate,
    deleteCRFTemplate: api.templates.deleteCRFTemplate,
  }), []);

  return {
    // Reactive state
    users,
    userDtos,
    roles,
    versions,
    clients,
    clientVersionHistory,
    workflowSteps,
    crfs,
    crfClients,
    crfApprovals,
    apiConfigurations,
    apiExecutionLogs,
    deploymentLogs,
    errorNotifications,
    deploymentQueue,
    notifications,
    auditLogs,
    bulkOperations,
    crfTemplates,
    // Computed
    unreadNotificationCount,
    activeClientCount,
    unresolvedErrorCount,
    pendingCRFCount,
    // Sync reads
    reads,
    // Async writes
    actions,
  };
}
