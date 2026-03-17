/**
 * Backwards-Compatible API Client Adapter
 * 
 * This adapter wraps the new API layer (/lib/api/) to provide the same interface
 * as the old apiClient/mockApiClient. It converts ApiResult<T> responses to
 * throw-on-error behavior that existing components expect.
 * 
 * This is a TRANSITIONAL layer. As components migrate to useAppStore() + actions,
 * they will no longer need this adapter.
 */

import { api } from './api';
import * as authApi from './api/auth';
import type { ApiResult } from './api/types';
import type {
  LoginRequest, LoginResponse, UserDto, UserResponse, CreateUserRequest, UpdateUserRequest,
  RoleDto, VersionResponse, CreateVersionRequest, UpdateVersionRequest,
  ClientResponse, CreateClientRequest, UpdateClientRequest, UpdateClientVersionRequest, ClientVersionHistory,
  CRFResponse, CreateCRFRequest, UpdateCRFRequest, CRFClientResponse, CRFApprovalResponse,
  UpdateApprovalRequest, DeploymentLogResponse, WorkflowStepResponse, CreateWorkflowStepRequest,
  UpdateWorkflowStepRequest, APIConfigurationResponse, CreateAPIConfigurationRequest,
  UpdateAPIConfigurationRequest, APIExecutionLogResponse, ErrorNotificationResponse,
  CreateErrorNotificationRequest, ResolveErrorRequest, DeploymentQueueResponse,
  QueueDeploymentRequest, UpdateDeploymentQueueRequest, NotificationResponse,
  CreateNotificationRequest, AuditLogPagedResponse, AuditLogStatisticsResponse,
  BulkOperationPagedResponse, BulkOperationStatisticsResponse, BulkCreateCRFsRequest,
  BulkUpdateClientsRequest, DeploymentReportResponse, CRFReportResponse, ClientReportResponse,
  SystemPerformanceReportResponse, DashboardStatisticsResponse, CRFTemplateResponse,
  CreateCRFTemplateRequest, UpdateCRFTemplateRequest, SystemMetrics, SystemHealthResponse,
  AdvancedSearchRequest, AdvancedSearchResult,
} from '../services/api';

/** Unwrap ApiResult: return data on success, throw on failure */
function unwrap<T>(result: ApiResult<T>): T {
  if (result.success) return result.data;
  throw new Error(result.error.message);
}

class ApiClientAdapter {
  // Auth helpers (sync)
  isAuthenticated(): boolean { return authApi.isAuthenticated(); }
  getStoredUser(): UserDto | null { return authApi.getStoredUser(); }

  // Auth
  async login(request: LoginRequest): Promise<LoginResponse> { return unwrap(await api.auth.login(request)); }
  async logout(): Promise<void> { return unwrap(await api.auth.logout()); }
  async getCurrentUser(): Promise<UserDto> { return unwrap(await api.auth.getCurrentUser()); }

  // Users
  async getAllUsers(): Promise<UserResponse[]> { return unwrap(await api.users.getAllUsers()); }
  async getUserById(userId: number): Promise<UserResponse> { return unwrap(await api.users.getUserById(userId)); }
  async createUser(request: CreateUserRequest): Promise<number> { return unwrap(await api.users.createUser(request)); }
  async updateUser(userId: number, request: UpdateUserRequest): Promise<boolean> { return unwrap(await api.users.updateUser(userId, request)); }
  async deleteUser(userId: number): Promise<boolean> { return unwrap(await api.users.deleteUser(userId)); }

  // Roles
  async getAllRoles(): Promise<RoleDto[]> { return unwrap(await api.users.getAllRoles()); }
  async getRoleById(roleId: number): Promise<RoleDto> { return unwrap(await api.users.getRoleById(roleId)); }

  // Versions
  async getAllVersions(): Promise<VersionResponse[]> { return unwrap(await api.versions.getAllVersions()); }
  async getVersionById(versionId: number): Promise<VersionResponse> { return unwrap(await api.versions.getVersionById(versionId)); }
  async createVersion(request: CreateVersionRequest): Promise<number> { return unwrap(await api.versions.createVersion(request)); }
  async updateVersion(versionId: number, request: UpdateVersionRequest): Promise<boolean> { return unwrap(await api.versions.updateVersion(versionId, request)); }
  async deleteVersion(versionId: number): Promise<boolean> { return unwrap(await api.versions.deleteVersion(versionId)); }

  // Clients
  async getAllClients(_includeInactive?: boolean): Promise<ClientResponse[]> { return unwrap(await api.clients.getAllClients()); }
  async getClientById(clientId: number): Promise<ClientResponse> { return unwrap(await api.clients.getClientById(clientId)); }
  async createClient(request: CreateClientRequest): Promise<number> { return unwrap(await api.clients.createClient(request)); }
  async updateClient(clientId: number, request: UpdateClientRequest): Promise<boolean> { return unwrap(await api.clients.updateClient(clientId, request)); }
  async deleteClient(clientId: number): Promise<boolean> { return unwrap(await api.clients.deleteClient(clientId)); }
  async updateClientVersion(clientId: number, request: UpdateClientVersionRequest): Promise<boolean> { return unwrap(await api.clients.updateClientVersion(clientId, request)); }
  async getClientVersionHistory(clientId: number): Promise<ClientVersionHistory[]> { return unwrap(await api.clients.getClientVersionHistory(clientId)); }

  // CRFs
  async getAllCRFs(status?: string): Promise<CRFResponse[]> { return unwrap(await api.crfs.getAllCRFs(status)); }
  async getCRFById(crfId: number): Promise<CRFResponse> { return unwrap(await api.crfs.getCRFById(crfId)); }
  async createCRF(request: CreateCRFRequest): Promise<number> { return unwrap(await api.crfs.createCRF(request)); }
  async updateCRF(crfId: number, request: UpdateCRFRequest): Promise<boolean> { return unwrap(await api.crfs.updateCRF(crfId, request)); }
  async updateCRFStatus(crfId: number, status: string): Promise<boolean> { return unwrap(await api.crfs.updateCRFStatus(crfId, status)); }
  async deleteCRF(crfId: number): Promise<boolean> { return unwrap(await api.crfs.deleteCRF(crfId)); }
  async getCRFClients(crfId: number): Promise<CRFClientResponse[]> { return unwrap(await api.crfs.getCRFClients(crfId)); }
  async getCRFApprovals(crfId: number): Promise<CRFApprovalResponse[]> { return unwrap(await api.crfs.getCRFApprovals(crfId)); }
  async updateCRFApproval(approvalId: number, request: UpdateApprovalRequest): Promise<boolean> { return unwrap(await api.crfs.updateCRFApproval(approvalId, request)); }
  async getCRFLogs(crfId: number, clientId?: number): Promise<DeploymentLogResponse[]> { return unwrap(await api.crfs.getCRFLogs(crfId, clientId)); }
  async getAllDeploymentLogs(): Promise<DeploymentLogResponse[]> { return unwrap(await api.crfs.getAllDeploymentLogs()); }

  // Workflow
  async getWorkflowSteps(): Promise<WorkflowStepResponse[]> { return unwrap(await api.workflow.getWorkflowSteps()); }
  async createWorkflowStep(request: CreateWorkflowStepRequest): Promise<number> { return unwrap(await api.workflow.createWorkflowStep(request)); }
  async updateWorkflowStep(stepId: number, request: UpdateWorkflowStepRequest): Promise<boolean> { return unwrap(await api.workflow.updateWorkflowStep(stepId, request)); }
  async deleteWorkflowStep(stepId: number): Promise<boolean> { return unwrap(await api.workflow.deleteWorkflowStep(stepId)); }
  async reorderWorkflowStep(stepId: number, newOrder: number): Promise<boolean> { return unwrap(await api.workflow.reorderWorkflowStep(stepId, newOrder)); }

  // API Configuration
  async getAllAPIConfigurations(apiType?: string): Promise<APIConfigurationResponse[]> { return unwrap(await api.apiConfig.getAllAPIConfigurations(apiType)); }
  async getAPIConfigurationById(id: number): Promise<APIConfigurationResponse> { return unwrap(await api.apiConfig.getAPIConfigurationById(id)); }
  async createAPIConfiguration(request: CreateAPIConfigurationRequest): Promise<number> { return unwrap(await api.apiConfig.createAPIConfiguration(request)); }
  async updateAPIConfiguration(id: number, request: UpdateAPIConfigurationRequest): Promise<boolean> { return unwrap(await api.apiConfig.updateAPIConfiguration(id, request)); }
  async deleteAPIConfiguration(id: number): Promise<boolean> { return unwrap(await api.apiConfig.deleteAPIConfiguration(id)); }
  async getAPIExecutionLogs(crfId?: number, apiConfigId?: number): Promise<APIExecutionLogResponse[]> { return unwrap(await api.apiConfig.getAPIExecutionLogs(crfId, apiConfigId)); }

  // Error Notifications
  async getAllErrorNotifications(): Promise<ErrorNotificationResponse[]> { return unwrap(await api.errors.getAllErrorNotifications()); }
  async getErrorNotificationById(id: number): Promise<ErrorNotificationResponse> { return unwrap(await api.errors.getErrorNotificationById(id)); }
  async createErrorNotification(request: CreateErrorNotificationRequest): Promise<number> { return unwrap(await api.errors.createErrorNotification(request)); }
  async resolveError(id: number, request: ResolveErrorRequest): Promise<boolean> { return unwrap(await api.errors.resolveError(id, request)); }

  // Deployment Queue
  async getAllDeploymentQueues(): Promise<DeploymentQueueResponse[]> { return unwrap(await api.deployments.getAllDeploymentQueues()); }
  async getDeploymentQueueById(id: number): Promise<DeploymentQueueResponse> { return unwrap(await api.deployments.getDeploymentQueueById(id)); }
  async queueDeployment(request: QueueDeploymentRequest): Promise<number> { return unwrap(await api.deployments.queueDeployment(request)); }
  async updateDeploymentQueue(id: number, request: UpdateDeploymentQueueRequest): Promise<boolean> { return unwrap(await api.deployments.updateDeploymentQueue(id, request)); }
  async updateDeploymentQueueStatus(id: number, status: string): Promise<boolean> { return unwrap(await api.deployments.updateDeploymentQueueStatus(id, status)); }
  async cancelDeployment(id: number): Promise<boolean> { return unwrap(await api.deployments.cancelDeployment(id)); }

  // Notifications
  async getAllNotifications(userId?: number): Promise<NotificationResponse[]> { return unwrap(await api.notifications.getAllNotifications(userId)); }
  async createNotification(request: CreateNotificationRequest): Promise<number> { return unwrap(await api.notifications.createNotification(request)); }
  async markNotificationRead(id: number): Promise<boolean> { return unwrap(await api.notifications.markNotificationRead(id)); }
  async markAllNotificationsRead(userId: number): Promise<number> { return unwrap(await api.notifications.markAllNotificationsRead(userId)); }
  async deleteNotification(id: number): Promise<boolean> { return unwrap(await api.notifications.deleteNotification(id)); }

  // Audit Log
  async getAuditLogs(
    ...args: any[]
  ): Promise<AuditLogPagedResponse> {
    // Detect the old 6-positional-param signature used by AuditLog.tsx:
    //   getAuditLogs(userId?, entityType?, entityId?, action?, startDate?, endDate?)
    // vs the new signature:
    //   getAuditLogs(page?, pageSize?, filters?)
    //
    // Heuristic: if arg count > 3, or if args[1] is a string (entityType), it's the old signature.
    if (args.length > 3 || (args.length >= 2 && typeof args[1] === 'string')) {
      const [userId, entityType, _entityId, action, startDate, endDate] = args;
      const filters: any = {};
      if (userId != null) filters.userId = userId;
      if (entityType) filters.entityType = entityType;
      if (action) filters.action = action;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      return unwrap(await api.auditLog.getAuditLogs(1, 1000, Object.keys(filters).length > 0 ? filters : undefined));
    }
    // New signature: (page?, pageSize?, filters?)
    const [page, pageSize, filters] = args;
    return unwrap(await api.auditLog.getAuditLogs(page, pageSize, filters));
  }
  async getAuditLogStatistics(startDate?: string, endDate?: string): Promise<AuditLogStatisticsResponse> { return unwrap(await api.auditLog.getAuditLogStatistics(startDate, endDate)); }

  // Bulk Operations
  async getAllBulkOperations(page?: number, pageSize?: number): Promise<BulkOperationPagedResponse> { return unwrap(await api.bulkOps.getAllBulkOperations(page, pageSize)); }
  async getBulkOperationStatistics(): Promise<BulkOperationStatisticsResponse> { return unwrap(await api.bulkOps.getBulkOperationStatistics()); }
  async bulkCreateCRFs(request: BulkCreateCRFsRequest): Promise<number> { return unwrap(await api.bulkOps.bulkCreateCRFs(request)); }
  async bulkUpdateClients(request: BulkUpdateClientsRequest): Promise<number> { return unwrap(await api.bulkOps.bulkUpdateClients(request)); }

  // Reporting
  async getDeploymentReport(startDate: string, endDate: string): Promise<DeploymentReportResponse> { return unwrap(await api.reporting.getDeploymentReport(startDate, endDate)); }
  async getCRFReport(startDate: string, endDate: string): Promise<CRFReportResponse> { return unwrap(await api.reporting.getCRFReport(startDate, endDate)); }
  async getClientReport(): Promise<ClientReportResponse> { return unwrap(await api.reporting.getClientReport()); }
  async getSystemPerformanceReport(startDate: string, endDate: string): Promise<SystemPerformanceReportResponse> { return unwrap(await api.reporting.getSystemPerformanceReport(startDate, endDate)); }
  async getDashboardStatistics(): Promise<DashboardStatisticsResponse> { return unwrap(await api.reporting.getDashboardStatistics()); }

  // CRF Templates
  async getAllCRFTemplates(): Promise<CRFTemplateResponse[]> { return unwrap(await api.templates.getAllCRFTemplates()); }
  async getCRFTemplateById(templateId: number): Promise<CRFTemplateResponse> { return unwrap(await api.templates.getCRFTemplateById(templateId)); }
  async createCRFTemplate(request: CreateCRFTemplateRequest): Promise<number> { return unwrap(await api.templates.createCRFTemplate(request)); }
  async updateCRFTemplate(templateId: number, request: UpdateCRFTemplateRequest): Promise<boolean> { return unwrap(await api.templates.updateCRFTemplate(templateId, request)); }
  async deleteCRFTemplate(templateId: number): Promise<boolean> { return unwrap(await api.templates.deleteCRFTemplate(templateId)); }

  // System Health
  async getSystemMetrics(): Promise<SystemMetrics> { return unwrap(await api.systemHealth.getSystemMetrics()); }
  async getSystemHealth(): Promise<SystemHealthResponse> { return unwrap(await api.systemHealth.getSystemHealth()); }

  // Advanced Search
  async advancedSearch(request: AdvancedSearchRequest): Promise<AdvancedSearchResult> { return unwrap(await api.search.advancedSearch(request)); }

  // ─── Aliases for old MockApiClient method names ───────
  // Components were coded against MockApiClient which used slightly different names.

  // Workflow alias
  async getAllWorkflowSteps(): Promise<WorkflowStepResponse[]> { return this.getWorkflowSteps(); }

  // Error notification alias
  async resolveErrorNotification(id: number, request: any): Promise<boolean> { return this.resolveError(id, request); }

  // Deployment queue alias (old mock accepted notes param)
  async cancelDeploymentQueue(id: number, _notes?: string): Promise<boolean> { return this.cancelDeployment(id); }

  // Notification aliases
  async getUserNotifications(_includeRead?: boolean, _maxResults?: number): Promise<NotificationResponse[]> {
    const user = authApi.getStoredUser();
    return this.getAllNotifications(user?.userId);
  }
  async markNotificationAsRead(id: number): Promise<boolean> { return this.markNotificationRead(id); }
  async markAllNotificationsAsRead(): Promise<number> {
    const user = authApi.getStoredUser();
    return this.markAllNotificationsRead(user?.userId || 0);
  }

  // Deployment logs alias (returns all deployment logs)
  async getDeploymentLogs(): Promise<DeploymentLogResponse[]> { return this.getAllDeploymentLogs(); }

  // Update history stub (returns client version histories across all clients)
  async getAllUpdateHistory(): Promise<ClientVersionHistory[]> {
    const clients = unwrap(await api.clients.getAllClients());
    const allHistory: ClientVersionHistory[] = [];
    for (const client of clients) {
      try {
        const history = unwrap(await api.clients.getClientVersionHistory(client.clientId));
        allHistory.push(...history);
      } catch { /* skip clients with no history */ }
    }
    return allHistory;
  }

}

/** Singleton adapter instance - drop-in replacement for the old apiClient */
export const apiClientAdapter = new ApiClientAdapter();