import axios, { AxiosInstance, AxiosError } from 'axios';
import { apiClientAdapter } from '../lib/apiClientAdapter';

const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface UserDto {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  isActive: boolean;
  lastLoginDate?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  roleId: number;
}

export interface UpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  isActive: boolean;
}

export interface UserResponse {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  roles: string;
  isActive: boolean;
  createdDate: string;
  lastLoginDate?: string;
}

export interface RoleDto {
  roleId: number;
  roleName: string;
  description: string;
  isActive: boolean;
}

// Version Interfaces
export interface VersionResponse {
  versionId: number;
  versionNumber: string;
  versionName: string;
  releaseDate: string;
  description: string;
  releaseNotes: string;
  isMajorRelease: boolean;
  isActive: boolean;
  createdBy: number;
  createdByName: string;
  createdDate: string;
  updatedDate?: string;
  clientCount: number;
}

export interface CreateVersionRequest {
  versionNumber: string;
  versionName: string;
  releaseDate: string;
  description: string;
  releaseNotes: string;
  isMajorRelease: boolean;
}

export interface UpdateVersionRequest {
  versionNumber: string;
  versionName: string;
  releaseDate: string;
  description: string;
  releaseNotes: string;
  isMajorRelease: boolean;
  isActive: boolean;
}

// Client Interfaces
export interface ClientResponse {
  clientId: number;
  clientName: string;
  contactEmail: string;
  contactPerson: string;
  phone: string;
  address: string;
  currentVersionId?: number;
  currentVersion: string;
  currentVersionName: string;
  status: string;
  lastUpdateDate?: string;
  createdBy: number;
  createdByName: string;
  createdDate: string;
  updatedDate?: string;
  isActive: boolean;
  hasCustomizations: boolean;  // NEW: Prevents auto-update if true
}

export interface CreateClientRequest {
  clientName: string;
  contactEmail: string;
  contactPerson: string;
  phone: string;
  address: string;
  currentVersionId?: number;
  status: string;
  hasCustomizations?: boolean;  // NEW: Default false
}

export interface UpdateClientRequest {
  clientName: string;
  contactEmail: string;
  contactPerson: string;
  phone: string;
  address: string;
  status: string;
  isActive: boolean;
  hasCustomizations: boolean;  // NEW: Prevents auto-update if true
}

export interface UpdateClientVersionRequest {
  versionId: number;
  notes: string;
}

export interface ClientVersionHistory {
  clientVersionId: number;
  clientId: number;
  versionId: number;
  versionNumber: string;
  versionName: string;
  assignedDate: string;
  updatedBy: number;
  updatedByName: string;
  notes: string;
  isCurrentVersion: boolean;
}

// CRF Interfaces
export interface CRFResponse {
  crfId: number;
  crfNumber: string;
  title: string;
  description: string;
  versionId: number;
  versionNumber: string;
  versionName: string;
  requestedBy: number;
  requestedByName: string;
  status: string;
  priority: string;
  scheduledDeploymentDate?: string;
  actualDeploymentDate?: string;
  createdDate: string;
  updatedDate?: string;
  completedDate?: string;
  clientCount: number;
  successfulDeployments: number;
}

export interface CreateCRFRequest {
  crfNumber: string;
  title: string;
  description: string;
  versionId: number;
  priority: string;
  scheduledDeploymentDate?: string;
  clientIds: number[];
}

export interface UpdateCRFRequest {
  title: string;
  description: string;
  priority: string;
  scheduledDeploymentDate?: string;
}

export interface CRFClientResponse {
  crfClientId: number;
  crfId: number;
  clientId: number;
  clientName: string;
  contactEmail: string;
  currentVersion: string;
  currentVersionName: string;
  deploymentStatus: string;
  deploymentDate?: string;
  deploymentNotes: string;
}

export interface CRFApprovalResponse {
  crfApprovalId: number;
  crfId: number;
  workflowStepId: number;
  stepName: string;
  stepOrder: number;
  approverUserId?: number;
  approverName: string;
  status: string;
  approvalDate?: string;
  comments: string;
  createdDate: string;
}

export interface UpdateApprovalRequest {
  status: string;
  comments: string;
}

export interface DeploymentLogResponse {
  deploymentLogId: number;
  crfId: number;
  clientId?: number;
  clientName: string;
  logType: string;
  logMessage: string;
  severity: string;
  createdDate: string;
  createdBy?: number;
  createdByName: string;
}

// Workflow Interfaces
export interface WorkflowStepResponse {
  workflowStepId: number;
  stepName: string;
  stepOrder: number;
  isRequired: boolean;
  isActive: boolean;
  createdDate: string;
}

export interface CreateWorkflowStepRequest {
  stepName: string;
  stepOrder: number;
  isRequired: boolean;
}

export interface UpdateWorkflowStepRequest {
  stepName: string;
  isRequired: boolean;
}

export interface DeleteWorkflowStepRequest {
  stepId: number;
}

export interface ReorderWorkflowStepRequest {
  stepId: number;
  newOrder: number;
}

// API Configuration Interfaces
export interface APIConfigurationResponse {
  apiConfigurationId: number;
  apiName: string;
  apiType: string;
  httpMethod: string;
  endpointURL: string;
  executionOrder: number;
  headers: string;
  requestBody: string;
  timeoutSeconds: number;
  retryCount: number;
  isEnabled: boolean;
  description: string;
  createdDate: string;
  updatedDate?: string;
  createdBy?: number;
  createdByName: string;
}

export interface CreateAPIConfigurationRequest {
  apiName: string;
  apiType: string;
  httpMethod: string;
  endpointURL: string;
  executionOrder: number;
  headers: string;
  requestBody: string;
  timeoutSeconds: number;
  retryCount: number;
  isEnabled: boolean;
  description: string;
}

export interface UpdateAPIConfigurationRequest {
  apiName: string;
  httpMethod: string;
  endpointURL: string;
  executionOrder: number;
  headers: string;
  requestBody: string;
  timeoutSeconds: number;
  retryCount: number;
  isEnabled: boolean;
  description: string;
}

export interface APIExecutionLogResponse {
  apiExecutionLogId: number;
  crfId: number;
  clientId?: number;
  apiConfigurationId: number;
  executionType: string;
  requestURL: string;
  requestHeaders: string;
  requestBody: string;
  responseStatusCode?: number;
  responseBody: string;
  executionStartTime: string;
  executionEndTime?: string;
  durationMs?: number;
  status: string;
  errorMessage: string;
  retryAttempt: number;
  apiName: string;
  clientName: string;
  crfNumber: string;
}

// Error Notification Interfaces
export interface ErrorNotificationResponse {
  errorNotificationId: number;
  crfId?: number;
  clientId?: number;
  errorType: string;
  errorSource: string;
  errorMessage: string;
  stackTrace: string;
  severity: string;
  isResolved: boolean;
  resolvedBy?: number;
  resolvedDate?: string;
  resolutionNotes: string;
  notificationSent: boolean;
  notificationSentDate?: string;
  createdDate: string;
  crfNumber: string;
  clientName: string;
  resolvedByName: string;
}

export interface CreateErrorNotificationRequest {
  crfId?: number;
  clientId?: number;
  errorType: string;
  errorSource: string;
  errorMessage: string;
  stackTrace: string;
  severity: string;
}

export interface ResolveErrorRequest {
  resolutionNotes: string;
}

// Deployment Queue Interfaces
export interface DeploymentQueueResponse {
  deploymentQueueId: number;
  crfId: number;
  clientId: number;
  queuedBy: number;
  queuedDate: string;
  scheduledStartTime?: string;
  actualStartTime?: string;
  completedTime?: string;
  status: string;
  priority: number;
  deploymentType: string;
  notes: string;
  crfNumber: string;
  crfTitle: string;
  clientName: string;
  queuedByName: string;
  versionNumber: string;
}

export interface QueueDeploymentRequest {
  crfId: number;
  clientId: number;
  scheduledStartTime?: string;
  priority: number;
  deploymentType: string;
  notes: string;
}

export interface UpdateDeploymentQueueRequest {
  scheduledStartTime?: string;
  priority: number;
  deploymentType: string;
  notes: string;
}

// Notification Interfaces
export interface NotificationResponse {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: string;
  priority?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  expiresAt?: string;
}

// Audit Log Interfaces
export interface AuditLogResponse {
  auditLogId: number;
  userId?: number;
  username?: string;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditLogPagedResponse {
  logs: AuditLogResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AuditLogStatisticsResponse {
  totalActions: number;
  uniqueUsers: number;
  actionsByType: Record<string, number>;
  actionsByEntity: Record<string, number>;
  mostActiveUsers: Array<{
    userId: number;
    username: string;
    actionCount: number;
  }>;
  startDate?: string;
  endDate?: string;
}

// Bulk Operations Interfaces
export interface BulkOperationResponse {
  bulkOperationId: number;
  operationType: string;
  initiatedBy: number;
  initiatedByName: string;
  initiatedAt: string;
  completedAt?: string;
  status: string;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  errorMessage?: string;
  resultData?: string;
  inputData?: string;
}

export interface BulkOperationPagedResponse {
  operations: BulkOperationResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface BulkOperationStatisticsResponse {
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  inProgressOperations: number;
  operationsByType: Record<string, number>;
  totalItemsProcessed: number;
  totalSuccessfulItems: number;
  totalFailedItems: number;
  averageSuccessRate: number;
  startDate?: string;
  endDate?: string;
}

export interface BulkCreateCRFsRequest {
  crfs: CreateCRFRequest[];
}

export interface BulkUpdateClientsRequest {
  clientIds: number[];
  newVersion?: string;
  newStatus?: string;
}

// Reporting Interfaces
export interface DeploymentReportResponse {
  startDate: string;
  endDate: string;
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  pendingDeployments: number;
  successRate: number;
  deploymentsByVersion: Array<{
    versionNumber: string;
    versionName: string;
    deploymentCount: number;
    successCount: number;
    failedCount: number;
    successRate: number;
  }>;
  deploymentsByClient: Array<{
    clientId: number;
    clientName: string;
    deploymentCount: number;
    successCount: number;
    failedCount: number;
    currentVersion: string;
    lastDeploymentDate?: string;
  }>;
  deploymentTrend: Array<{
    date: string;
    totalDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
  }>;
}

export interface CRFReportResponse {
  startDate: string;
  endDate: string;
  totalCRFs: number;
  completedCRFs: number;
  pendingCRFs: number;
  cancelledCRFs: number;
  completionRate: number;
  averageApprovalTime: number;
  averageDeploymentTime: number;
  crfsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  crfsByPriority: Array<{
    priority: string;
    count: number;
    completedCount: number;
    averageCompletionDays: number;
  }>;
  crfsByVersion: Array<{
    versionNumber: string;
    versionName: string;
    crfCount: number;
    completedCount: number;
  }>;
  approvalPerformance: Array<{
    stepName: string;
    totalApprovals: number;
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
    averageApprovalDays: number;
  }>;
}

export interface ClientReportResponse {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  versionDistribution: Array<{
    versionNumber: string;
    versionName: string;
    clientCount: number;
    percentage: number;
    isCurrentVersion: boolean;
  }>;
  clientsByStatus: Array<{
    status: string;
    clientCount: number;
    percentage: number;
  }>;
  recentUpdates: Array<{
    clientId: number;
    clientName: string;
    fromVersion: string;
    toVersion: string;
    updateDate: string;
    updatedBy: string;
  }>;
  outdatedClients: Array<{
    clientId: number;
    clientName: string;
    currentVersion: string;
    latestVersion: string;
    versionsBehind: number;
    lastUpdateDate?: string;
    daysSinceUpdate: number;
  }>;
}

export interface SystemPerformanceReportResponse {
  startDate: string;
  endDate: string;
  totalAPIExecutions: number;
  successfulAPIExecutions: number;
  failedAPIExecutions: number;
  apiSuccessRate: number;
  averageAPIResponseTime: number;
  totalErrors: number;
  resolvedErrors: number;
  unresolvedErrors: number;
  apiPerformanceByType: Array<{
    apiName: string;
    apiType: string;
    executionCount: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
  }>;
  errorsByType: Array<{
    errorType: string;
    errorCount: number;
    resolvedCount: number;
    resolutionRate: number;
  }>;
  errorsBySeverity: Array<{
    severity: string;
    errorCount: number;
    resolvedCount: number;
    unresolvedCount: number;
  }>;
}

// Dashboard Interfaces
export interface DashboardStatisticsResponse {
  systemOverview: {
    totalClients: number;
    activeCRFs: number;
    pendingApprovals: number;
    deploymentsToday: number;
    failedDeployments: number;
    unresolvedErrors: number;
    overallDeploymentSuccessRate: number;
    totalVersions: number;
    latestVersion: string;
  };
  recentActivities: Array<{
    activityType: string;
    description: string;
    username: string;
    timestamp: string;
    entityType: string;
    entityId?: number;
    severity: string;
  }>;
  upcomingDeployments: Array<{
    crfId: number;
    crfNumber: string;
    crfTitle: string;
    versionNumber: string;
    scheduledDate?: string;
    clientCount: number;
    priority: string;
    status: string;
  }>;
  criticalAlerts: Array<{
    alertId: number;
    alertType: string;
    message: string;
    severity: string;
    createdDate: string;
    isResolved: boolean;
    relatedEntity?: string;
    relatedEntityId?: number;
  }>;
  workflowMetrics: {
    totalCRFsThisMonth: number;
    completedCRFsThisMonth: number;
    averageApprovalTime: number;
    averageDeploymentTime: number;
    approvalSuccessRate: number;
    stepMetrics: Array<{
      stepName: string;
      pendingCount: number;
      approvedCount: number;
      rejectedCount: number;
      averageProcessingDays: number;
    }>;
  };
  versionAdoption: {
    latestVersion: string;
    clientsOnLatestVersion: number;
    latestVersionAdoptionRate: number;
    versionUsage: Array<{
      versionNumber: string;
      versionName: string;
      clientCount: number;
      percentage: number;
      isLatest: boolean;
      releaseDate: string;
    }>;
  };
}

// CRF Template Interfaces
export interface CRFTemplateResponse {
  crfTemplateId: number;
  templateName: string;
  description: string;
  crfNumberPrefix: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultPriority: string;
  isActive: boolean;
  createdBy: number;
  createdByName: string;
  createdDate: string;
  updatedDate?: string;
  usageCount: number;
}

export interface CreateCRFTemplateRequest {
  templateName: string;
  description: string;
  crfNumberPrefix: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultPriority: string;
}

export interface UpdateCRFTemplateRequest {
  templateName: string;
  description: string;
  crfNumberPrefix: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultPriority: string;
  isActive: boolean;
}

// System Health Interfaces
export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  apiResponseTime: number;
  databaseResponseTime: number;
  uptime: number;
  lastUpdated: string;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  uptime: number;
}

export interface MetricHistory {
  timestamp: string;
  value: number;
}

export interface DatabaseHealth {
  isConnected: boolean;
  responseTime: number;
  activeConnections: number;
  totalQueries: number;
  lastCheck: string;
}

export interface ApiHealth {
  isHealthy: boolean;
  averageResponseTime: number;
  totalRequests: number;
  failedRequests: number;
  lastCheck: string;
}

export interface SystemHealthResponse {
  metrics: SystemMetrics;
  services: ServiceStatus[];
  cpuHistory: MetricHistory[];
  memoryHistory: MetricHistory[];
  overallStatus: string;
}

// Advanced Search Interfaces
export interface AdvancedSearchRequest {
  keyword?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  version?: string;
  severity?: string;
  category?: string;
  searchTypes?: string[];
  pageNumber?: number;
  pageSize?: number;
}

export interface SearchResultSummary {
  totalCRFs: number;
  totalClients: number;
  totalVersions: number;
  totalErrors: number;
  totalDeployments: number;
  totalResults: number;
  searchedAt: string;
}

export interface CRFSearchResult {
  crfId: number;
  crfNumber: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  createdDate: string;
  createdBy: string;
  versionNumber?: string;
  relevanceScore: number;
}

export interface ClientSearchResult {
  clientId: number;
  clientCode: string;
  clientName: string;
  contactEmail?: string;
  contactPerson?: string;
  currentVersion?: string;
  status: string;
  lastUpdated?: string;
  relevanceScore: number;
}

export interface VersionSearchResult {
  versionId: number;
  versionNumber: string;
  description?: string;
  releaseDate: string;
  isStable: boolean;
  clientCount: number;
  status: string;
  relevanceScore: number;
}

export interface ErrorSearchResult {
  errorId: number;
  errorCode: string;
  errorMessage: string;
  severity: string;
  clientName?: string;
  versionNumber?: string;
  occurredAt: string;
  isResolved: boolean;
  relevanceScore: number;
}

export interface DeploymentSearchResult {
  deploymentId: number;
  crfId?: number;
  crfNumber?: string;
  clientName?: string;
  versionNumber?: string;
  scheduledDate?: string;
  status: string;
  priority?: number;
  createdDate: string;
  relevanceScore: number;
}

export interface AdvancedSearchResult {
  summary: SearchResultSummary;
  crfs: CRFSearchResult[];
  clients: ClientSearchResult[];
  versions: VersionSearchResult[];
  errors: ErrorSearchResult[];
  deployments: DeploymentSearchResult[];
}

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<any>>) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // Public helper methods for auth state
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  getStoredUser(): UserDto | null {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Auth APIs
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<ApiResponse<LoginResponse>>('/auth/login', request);
    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<UserDto> {
    const response = await this.api.get<ApiResponse<UserDto>>('/auth/current-user');
    if (response.data.success && response.data.data) {
      localStorage.setItem('auth_user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get current user');
  }

  // User APIs
  async getAllUsers(): Promise<UserResponse[]> {
    const response = await this.api.get<ApiResponse<UserResponse[]>>('/users');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get users');
  }

  async getUserById(userId: number): Promise<UserResponse> {
    const response = await this.api.get<ApiResponse<UserResponse>>(`/users/${userId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get user');
  }

  async createUser(request: CreateUserRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/users', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create user');
  }

  async updateUser(userId: number, request: UpdateUserRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/users/${userId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update user');
  }

  async deleteUser(userId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/users/${userId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete user');
  }

  // Role APIs
  async getAllRoles(): Promise<RoleDto[]> {
    const response = await this.api.get<ApiResponse<RoleDto[]>>('/roles');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get roles');
  }

  async getRoleById(roleId: number): Promise<RoleDto> {
    const response = await this.api.get<ApiResponse<RoleDto>>(`/roles/${roleId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get role');
  }

  // Version APIs
  async getAllVersions(): Promise<VersionResponse[]> {
    const response = await this.api.get<ApiResponse<VersionResponse[]>>('/versions');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get versions');
  }

  async getVersionById(versionId: number): Promise<VersionResponse> {
    const response = await this.api.get<ApiResponse<VersionResponse>>(`/versions/${versionId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get version');
  }

  async createVersion(request: CreateVersionRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/versions', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create version');
  }

  async updateVersion(versionId: number, request: UpdateVersionRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/versions/${versionId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update version');
  }

  async deleteVersion(versionId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/versions/${versionId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete version');
  }

  // Client APIs
  async getAllClients(): Promise<ClientResponse[]> {
    const response = await this.api.get<ApiResponse<ClientResponse[]>>('/clients');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get clients');
  }

  async getClientById(clientId: number): Promise<ClientResponse> {
    const response = await this.api.get<ApiResponse<ClientResponse>>(`/clients/${clientId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get client');
  }

  async createClient(request: CreateClientRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/clients', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create client');
  }

  async updateClient(clientId: number, request: UpdateClientRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/clients/${clientId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update client');
  }

  async deleteClient(clientId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/clients/${clientId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete client');
  }

  async updateClientVersion(clientId: number, request: UpdateClientVersionRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/clients/${clientId}/version`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update client version');
  }

  async getClientVersionHistory(clientId: number): Promise<ClientVersionHistory[]> {
    const response = await this.api.get<ApiResponse<ClientVersionHistory[]>>(`/clients/${clientId}/history`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get client version history');
  }

  // CRF APIs
  async getAllCRFs(status?: string): Promise<CRFResponse[]> {
    const params = status ? `?status=${status}` : '';
    const response = await this.api.get<ApiResponse<CRFResponse[]>>(`/crf${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CRFs');
  }

  async getCRFById(crfId: number): Promise<CRFResponse> {
    const response = await this.api.get<ApiResponse<CRFResponse>>(`/crf/${crfId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CRF');
  }

  async createCRF(request: CreateCRFRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/crf', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create CRF');
  }

  async updateCRF(crfId: number, request: UpdateCRFRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/crf/${crfId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update CRF');
  }

  async updateCRFStatus(crfId: number, status: string): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/crf/${crfId}/status`, status);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update CRF status');
  }

  async deleteCRF(crfId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/crf/${crfId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete CRF');
  }

  async getCRFClients(crfId: number): Promise<CRFClientResponse[]> {
    const response = await this.api.get<ApiResponse<CRFClientResponse[]>>(`/crf/${crfId}/clients`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CRF clients');
  }

  async getCRFApprovals(crfId: number): Promise<CRFApprovalResponse[]> {
    const response = await this.api.get<ApiResponse<CRFApprovalResponse[]>>(`/crf/${crfId}/approvals`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CRF approvals');
  }

  async updateCRFApproval(approvalId: number, request: UpdateApprovalRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/crf/approvals/${approvalId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update approval');
  }

  async getCRFLogs(crfId: number, clientId?: number): Promise<DeploymentLogResponse[]> {
    const params = clientId ? `?clientId=${clientId}` : '';
    const response = await this.api.get<ApiResponse<DeploymentLogResponse[]>>(`/crf/${crfId}/logs${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get deployment logs');
  }

  // Workflow APIs
  async getWorkflowSteps(): Promise<WorkflowStepResponse[]> {
    const response = await this.api.get<ApiResponse<WorkflowStepResponse[]>>('/workflow/steps');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get workflow steps');
  }

  async createWorkflowStep(request: CreateWorkflowStepRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/workflow/steps', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create workflow step');
  }

  async updateWorkflowStep(stepId: number, request: UpdateWorkflowStepRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/workflow/steps/${stepId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update workflow step');
  }

  async deleteWorkflowStep(stepId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/workflow/steps/${stepId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete workflow step');
  }

  async reorderWorkflowStep(stepId: number, newOrder: number): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/workflow/steps/${stepId}/reorder`, newOrder);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to reorder workflow step');
  }

  // API Configuration APIs
  async getAllAPIConfigurations(apiType?: string): Promise<APIConfigurationResponse[]> {
    const params = apiType ? `?apiType=${apiType}` : '';
    const response = await this.api.get<ApiResponse<APIConfigurationResponse[]>>(`/apiconfiguration${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get API configurations');
  }

  async getAPIConfigurationById(apiConfigurationId: number): Promise<APIConfigurationResponse> {
    const response = await this.api.get<ApiResponse<APIConfigurationResponse>>(`/apiconfiguration/${apiConfigurationId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get API configuration');
  }

  async createAPIConfiguration(request: CreateAPIConfigurationRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/apiconfiguration', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create API configuration');
  }

  async updateAPIConfiguration(apiConfigurationId: number, request: UpdateAPIConfigurationRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/apiconfiguration/${apiConfigurationId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update API configuration');
  }

  async deleteAPIConfiguration(apiConfigurationId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/apiconfiguration/${apiConfigurationId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete API configuration');
  }

  async getAPIExecutionLogs(crfId?: number, clientId?: number): Promise<APIExecutionLogResponse[]> {
    let params = '?';
    if (crfId) params += `crfId=${crfId}&`;
    if (clientId) params += `clientId=${clientId}&`;
    params = params.slice(0, -1); // Remove trailing &
    const response = await this.api.get<ApiResponse<APIExecutionLogResponse[]>>(`/apiconfiguration/execution-logs${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get API execution logs');
  }

  async getDeploymentLogs(crfId?: number, clientId?: number): Promise<DeploymentLogResponse[]> {
    let params = '?';
    if (crfId) params += `crfId=${crfId}&`;
    if (clientId) params += `clientId=${clientId}&`;
    if (params === '?') params = '';
    else params = params.slice(0, -1); // Remove trailing &
    const response = await this.api.get<ApiResponse<DeploymentLogResponse[]>>(`/crf/deployment-logs${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get deployment logs');
  }

  // Error Notification APIs
  async getAllErrorNotifications(): Promise<ErrorNotificationResponse[]> {
    const response = await this.api.get<ApiResponse<ErrorNotificationResponse[]>>('/error-notifications');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get error notifications');
  }

  async getErrorNotificationById(errorNotificationId: number): Promise<ErrorNotificationResponse> {
    const response = await this.api.get<ApiResponse<ErrorNotificationResponse>>(`/error-notifications/${errorNotificationId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get error notification');
  }

  async createErrorNotification(request: CreateErrorNotificationRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/errornotification', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create error notification');
  }

  async resolveErrorNotification(errorNotificationId: number, request: ResolveErrorRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/errornotification/${errorNotificationId}/resolve`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to resolve error notification');
  }

  // Deployment Queue APIs
  async getAllDeploymentQueues(): Promise<DeploymentQueueResponse[]> {
    const response = await this.api.get<ApiResponse<DeploymentQueueResponse[]>>('/deployment-queue');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get deployment queues');
  }

  async getDeploymentQueueById(deploymentQueueId: number): Promise<DeploymentQueueResponse> {
    const response = await this.api.get<ApiResponse<DeploymentQueueResponse>>(`/deployment-queue/${deploymentQueueId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get deployment queue');
  }

  async queueDeployment(request: QueueDeploymentRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/deploymentqueue', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to queue deployment');
  }

  async updateDeploymentQueue(deploymentQueueId: number, request: UpdateDeploymentQueueRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/deployment-queue/${deploymentQueueId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update deployment queue');
  }

  async deleteDeploymentQueue(deploymentQueueId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/deployment-queue/${deploymentQueueId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete deployment queue');
  }

  async cancelDeploymentQueue(deploymentQueueId: number, notes: string): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/deploymentqueue/${deploymentQueueId}`, {
      data: notes
    });
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to cancel deployment queue');
  }

  // Notification APIs
  async getUserNotifications(includeRead: boolean = false, maxResults: number = 50): Promise<NotificationResponse[]> {
    const response = await this.api.get<ApiResponse<NotificationResponse[]>>(
      `/notifications?includeRead=${includeRead}&maxResults=${maxResults}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get notifications');
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await this.api.get<ApiResponse<number>>('/notifications/unread-count');
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get unread notification count');
  }

  async createNotification(request: CreateNotificationRequest): Promise<NotificationResponse> {
    const response = await this.api.post<ApiResponse<NotificationResponse>>('/notifications', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create notification');
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/notifications/${notificationId}/mark-read`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to mark notification as read');
  }

  async markAllNotificationsAsRead(): Promise<number> {
    const response = await this.api.put<ApiResponse<number>>('/notifications/mark-all-read');
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to mark all notifications as read');
  }

  async deleteNotification(notificationId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/notifications/${notificationId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete notification');
  }

  // Audit Log APIs
  async getAuditLogs(
    userId?: number,
    entityType?: string,
    entityId?: number,
    action?: string,
    startDate?: string,
    endDate?: string,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Promise<AuditLogPagedResponse> {
    let params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (userId) params += `&userId=${userId}`;
    if (entityType) params += `&entityType=${entityType}`;
    if (entityId) params += `&entityId=${entityId}`;
    if (action) params += `&action=${action}`;
    if (startDate) params += `&startDate=${startDate}`;
    if (endDate) params += `&endDate=${endDate}`;

    const response = await this.api.get<ApiResponse<AuditLogPagedResponse>>(`/auditlog${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get audit logs');
  }

  async getAuditLogsByEntity(entityType: string, entityId: number): Promise<AuditLogResponse[]> {
    const response = await this.api.get<ApiResponse<AuditLogResponse[]>>(
      `/auditlog/entity/${entityType}/${entityId}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get audit logs by entity');
  }

  async getUserActivity(
    userId: number,
    startDate?: string,
    endDate?: string,
    maxResults: number = 100
  ): Promise<AuditLogResponse[]> {
    let params = `?maxResults=${maxResults}`;
    if (startDate) params += `&startDate=${startDate}`;
    if (endDate) params += `&endDate=${endDate}`;

    const response = await this.api.get<ApiResponse<AuditLogResponse[]>>(`/auditlog/user/${userId}${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get user activity');
  }

  async getAuditLogStatistics(startDate?: string, endDate?: string): Promise<AuditLogStatisticsResponse> {
    let params = '?';
    if (startDate) params += `startDate=${startDate}&`;
    if (endDate) params += `endDate=${endDate}&`;
    params = params.slice(0, -1);

    const response = await this.api.get<ApiResponse<AuditLogStatisticsResponse>>(
      `/auditlog/statistics${params}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get audit log statistics');
  }

  async exportAuditLogs(startDate?: string, endDate?: string): Promise<AuditLogPagedResponse> {
    let params = '?';
    if (startDate) params += `startDate=${startDate}&`;
    if (endDate) params += `endDate=${endDate}&`;
    params = params.slice(0, -1);

    const response = await this.api.get<ApiResponse<AuditLogPagedResponse>>(`/auditlog/export${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to export audit logs');
  }

  // Bulk Operations APIs
  async getAllBulkOperations(
    initiatedBy?: number,
    status?: string,
    operationType?: string,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Promise<BulkOperationPagedResponse> {
    let params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (initiatedBy) params += `&initiatedBy=${initiatedBy}`;
    if (status) params += `&status=${status}`;
    if (operationType) params += `&operationType=${operationType}`;

    const response = await this.api.get<ApiResponse<BulkOperationPagedResponse>>(`/bulkoperations${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get bulk operations');
  }

  async getBulkOperationById(bulkOperationId: number): Promise<BulkOperationResponse> {
    const response = await this.api.get<ApiResponse<BulkOperationResponse>>(
      `/bulkoperations/${bulkOperationId}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get bulk operation');
  }

  async bulkCreateCRFs(request: BulkCreateCRFsRequest): Promise<BulkOperationResponse> {
    const response = await this.api.post<ApiResponse<BulkOperationResponse>>('/bulkoperations/crfs', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to bulk create CRFs');
  }

  async bulkUpdateClients(request: BulkUpdateClientsRequest): Promise<BulkOperationResponse> {
    const response = await this.api.post<ApiResponse<BulkOperationResponse>>(
      '/bulkoperations/clients/update',
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to bulk update clients');
  }

  async getBulkOperationStatistics(startDate?: string, endDate?: string): Promise<BulkOperationStatisticsResponse> {
    let params = '?';
    if (startDate) params += `startDate=${startDate}&`;
    if (endDate) params += `endDate=${endDate}&`;
    params = params.slice(0, -1);

    const response = await this.api.get<ApiResponse<BulkOperationStatisticsResponse>>(
      `/bulkoperations/statistics${params}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get bulk operation statistics');
  }

  // Reporting APIs
  async getDeploymentReport(startDate: string, endDate: string): Promise<DeploymentReportResponse> {
    const response = await this.api.get<ApiResponse<DeploymentReportResponse>>(
      `/reporting/deployments?startDate=${startDate}&endDate=${endDate}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get deployment report');
  }

  async getCRFReport(startDate: string, endDate: string): Promise<CRFReportResponse> {
    const response = await this.api.get<ApiResponse<CRFReportResponse>>(
      `/reporting/crfs?startDate=${startDate}&endDate=${endDate}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CRF report');
  }

  async getClientReport(): Promise<ClientReportResponse> {
    const response = await this.api.get<ApiResponse<ClientReportResponse>>('/reporting/clients');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get client report');
  }

  async getSystemPerformanceReport(startDate: string, endDate: string): Promise<SystemPerformanceReportResponse> {
    const response = await this.api.get<ApiResponse<SystemPerformanceReportResponse>>(
      `/reporting/system-performance?startDate=${startDate}&endDate=${endDate}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get system performance report');
  }

  // Dashboard APIs
  async getDashboardStatistics(): Promise<DashboardStatisticsResponse> {
    const response = await this.api.get<ApiResponse<DashboardStatisticsResponse>>('/dashboard/statistics');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get dashboard statistics');
  }

  async getSystemOverview(): Promise<DashboardStatisticsResponse['systemOverview']> {
    const response = await this.api.get<ApiResponse<DashboardStatisticsResponse['systemOverview']>>('/dashboard/overview');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get system overview');
  }

  async getRecentActivities(maxResults: number = 20): Promise<DashboardStatisticsResponse['recentActivities']> {
    const response = await this.api.get<ApiResponse<DashboardStatisticsResponse['recentActivities']>>(
      `/dashboard/recent-activities?maxResults=${maxResults}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get recent activities');
  }

  async getUpcomingDeployments(days: number = 7): Promise<DashboardStatisticsResponse['upcomingDeployments']> {
    const response = await this.api.get<ApiResponse<DashboardStatisticsResponse['upcomingDeployments']>>(
      `/dashboard/upcoming-deployments?days=${days}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get upcoming deployments');
  }

  async getCriticalAlerts(): Promise<DashboardStatisticsResponse['criticalAlerts']> {
    const response = await this.api.get<ApiResponse<DashboardStatisticsResponse['criticalAlerts']>>(
      '/dashboard/critical-alerts'
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get critical alerts');
  }

  async getWorkflowMetrics(): Promise<DashboardStatisticsResponse['workflowMetrics']> {
    const response = await this.api.get<ApiResponse<DashboardStatisticsResponse['workflowMetrics']>>(
      '/dashboard/workflow-metrics'
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get workflow metrics');
  }

  async getVersionAdoption(): Promise<DashboardStatisticsResponse['versionAdoption']> {
    const response = await this.api.get<ApiResponse<DashboardStatisticsResponse['versionAdoption']>>(
      '/dashboard/version-adoption'
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get version adoption');
  }

  // CRF Template APIs
  async getAllCRFTemplates(): Promise<CRFTemplateResponse[]> {
    const response = await this.api.get<ApiResponse<CRFTemplateResponse[]>>('/crftemplates');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CRF templates');
  }

  async getCRFTemplateById(templateId: number): Promise<CRFTemplateResponse> {
    const response = await this.api.get<ApiResponse<CRFTemplateResponse>>(`/crftemplates/${templateId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CRF template');
  }

  async createCRFTemplate(request: CreateCRFTemplateRequest): Promise<number> {
    const response = await this.api.post<ApiResponse<number>>('/crftemplates', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create CRF template');
  }

  async updateCRFTemplate(templateId: number, request: UpdateCRFTemplateRequest): Promise<boolean> {
    const response = await this.api.put<ApiResponse<boolean>>(`/crftemplates/${templateId}`, request);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to update CRF template');
  }

  async deleteCRFTemplate(templateId: number): Promise<boolean> {
    const response = await this.api.delete<ApiResponse<boolean>>(`/crftemplates/${templateId}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to delete CRF template');
  }

  async getCRFTemplateByName(templateName: string): Promise<CRFTemplateResponse> {
    const response = await this.api.get<ApiResponse<CRFTemplateResponse>>(
      `/crftemplates/name/${encodeURIComponent(templateName)}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CRF template by name');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // System Health APIs
  async getSystemHealth(): Promise<SystemHealthResponse> {
    const response = await this.api.get<ApiResponse<SystemHealthResponse>>('/systemhealth');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get system health');
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await this.api.get<ApiResponse<SystemMetrics>>('/systemhealth/metrics');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get system metrics');
  }

  async getServiceStatuses(): Promise<ServiceStatus[]> {
    const response = await this.api.get<ApiResponse<ServiceStatus[]>>('/systemhealth/services');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get service statuses');
  }

  async getCpuHistory(hours: number = 24): Promise<MetricHistory[]> {
    const response = await this.api.get<ApiResponse<MetricHistory[]>>(`/systemhealth/metrics/cpu?hours=${hours}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get CPU history');
  }

  async getMemoryHistory(hours: number = 24): Promise<MetricHistory[]> {
    const response = await this.api.get<ApiResponse<MetricHistory[]>>(`/systemhealth/metrics/memory?hours=${hours}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get memory history');
  }

  async getDatabaseHealth(): Promise<DatabaseHealth> {
    const response = await this.api.get<ApiResponse<DatabaseHealth>>('/systemhealth/database');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get database health');
  }

  async getApiHealth(): Promise<ApiHealth> {
    const response = await this.api.get<ApiResponse<ApiHealth>>('/systemhealth/api');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get API health');
  }

  // Advanced Search APIs
  async advancedSearch(request: AdvancedSearchRequest): Promise<AdvancedSearchResult> {
    const response = await this.api.post<ApiResponse<AdvancedSearchResult>>('/search', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to perform search');
  }

  async searchCRFs(request: AdvancedSearchRequest): Promise<CRFSearchResult[]> {
    const response = await this.api.post<ApiResponse<CRFSearchResult[]>>('/search/crfs', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search CRFs');
  }

  async searchClients(request: AdvancedSearchRequest): Promise<ClientSearchResult[]> {
    const response = await this.api.post<ApiResponse<ClientSearchResult[]>>('/search/clients', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search clients');
  }

  async searchVersions(request: AdvancedSearchRequest): Promise<VersionSearchResult[]> {
    const response = await this.api.post<ApiResponse<VersionSearchResult[]>>('/search/versions', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search versions');
  }

  async searchErrors(request: AdvancedSearchRequest): Promise<ErrorSearchResult[]> {
    const response = await this.api.post<ApiResponse<ErrorSearchResult[]>>('/search/errors', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search errors');
  }

  async searchDeployments(request: AdvancedSearchRequest): Promise<DeploymentSearchResult[]> {
    const response = await this.api.post<ApiResponse<DeploymentSearchResult[]>>('/search/deployments', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search deployments');
  }

  async quickSearch(keyword: string): Promise<AdvancedSearchResult> {
    const response = await this.api.get<ApiResponse<AdvancedSearchResult>>(`/search/quick?keyword=${encodeURIComponent(keyword)}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to perform quick search');
  }
}

// API Client Factory - conditionally uses real or mock API based on mock mode
function getApiClient(): ApiClient | any {
  // Check if mock mode is enabled
  // Default to mock mode (true) when localStorage hasn't been set yet,
  // matching MockModeProvider's default behavior
  const mockMode = localStorage.getItem('app_mock_mode');
  
  if (mockMode !== 'false') {
    // Use the new architecture's adapter (wraps /lib/api → appStore)
    return apiClientAdapter;
  }
  
  return new ApiClient();
}

// Use a proxy so switching mock mode at runtime is reflected without page reload
export const apiClient: any = new Proxy({} as any, {
  get(_target, prop) {
    const client = getApiClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
export default apiClient;