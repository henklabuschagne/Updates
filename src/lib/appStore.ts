/**
 * Centralized Data Store
 * 
 * Single source of truth for all application state.
 * Components NEVER import this file directly (except for type imports).
 * Only the API layer (/lib/api/*.ts) and the reactive hook (/hooks/useAppStore.ts) may import this.
 */

import type {
  UserDto,
  UserResponse,
  RoleDto,
  VersionResponse,
  ClientResponse,
  ClientVersionHistory,
  CRFResponse,
  CRFClientResponse,
  CRFApprovalResponse,
  DeploymentLogResponse,
  WorkflowStepResponse,
  APIConfigurationResponse,
  APIExecutionLogResponse,
  ErrorNotificationResponse,
  DeploymentQueueResponse,
  NotificationResponse,
  AuditLogResponse,
  BulkOperationResponse,
  CRFTemplateResponse,
} from '../services/api';

// Import seed data from existing mock data provider
import {
  mockUsers,
  mockUserDtos,
  mockRoles,
  mockVersions,
  mockClients,
  mockClientVersionHistory,
  mockWorkflowSteps,
  mockCRFs,
  mockCRFClients,
  mockCRFApprovals,
  mockAPIConfigurations,
  mockDeploymentLogs,
  mockErrorNotifications,
  mockDeploymentQueue,
  mockNotifications,
  mockAuditLogs,
  mockBulkOperations,
  mockCRFTemplates,
  mockAPIExecutionLogs,
} from '../utils/mockDataProvider';

// ─── Slice Definitions ─────────────────────────────────
export type Slice =
  | 'users'
  | 'roles'
  | 'versions'
  | 'clients'
  | 'clientVersionHistory'
  | 'crfs'
  | 'crfClients'
  | 'crfApprovals'
  | 'workflow'
  | 'apiConfig'
  | 'apiExecutionLogs'
  | 'deploymentLogs'
  | 'errors'
  | 'deployments'
  | 'notifications'
  | 'auditLogs'
  | 'bulkOps'
  | 'templates';

// ─── Subscriber System ─────────────────────────────────
type Listener = () => void;

const sliceKeys: Slice[] = [
  'users', 'roles', 'versions', 'clients', 'clientVersionHistory',
  'crfs', 'crfClients', 'crfApprovals', 'workflow', 'apiConfig',
  'apiExecutionLogs', 'deploymentLogs', 'errors', 'deployments',
  'notifications', 'auditLogs', 'bulkOps', 'templates',
];

const subscribers: Record<Slice, Set<Listener>> = {} as any;
sliceKeys.forEach(key => { subscribers[key] = new Set(); });

// ─── localStorage Persistence ──────────────────────────
const STORAGE_PREFIX = 'sumApp_';
const STORAGE_VERSION_KEY = STORAGE_PREFIX + '_version';
const STORAGE_VERSION = 1; // Bump to invalidate all persisted data

function persistSlice(slice: Slice) {
  try {
    const data = getSliceData(slice);
    localStorage.setItem(STORAGE_PREFIX + slice, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

function getSliceData(slice: Slice): any {
  switch (slice) {
    case 'users': return { users, userDtos };
    case 'roles': return roles;
    case 'versions': return versions;
    case 'clients': return clients;
    case 'clientVersionHistory': return clientVersionHistory;
    case 'crfs': return crfs;
    case 'crfClients': return crfClients;
    case 'crfApprovals': return crfApprovals;
    case 'workflow': return workflowSteps;
    case 'apiConfig': return apiConfigurations;
    case 'apiExecutionLogs': return apiExecutionLogs;
    case 'deploymentLogs': return deploymentLogs;
    case 'errors': return errorNotifications;
    case 'deployments': return deploymentQueue;
    case 'notifications': return notifications;
    case 'auditLogs': return auditLogs;
    case 'bulkOps': return bulkOperations;
    case 'templates': return crfTemplates;
  }
}

function setSliceData(slice: Slice, data: any) {
  switch (slice) {
    case 'users': users = data.users; userDtos = data.userDtos; break;
    case 'roles': roles = data; break;
    case 'versions': versions = data; break;
    case 'clients': clients = data; break;
    case 'clientVersionHistory': clientVersionHistory = data; break;
    case 'crfs': crfs = data; break;
    case 'crfClients': crfClients = data; break;
    case 'crfApprovals': crfApprovals = data; break;
    case 'workflow': workflowSteps = data; break;
    case 'apiConfig': apiConfigurations = data; break;
    case 'apiExecutionLogs': apiExecutionLogs = data; break;
    case 'deploymentLogs': deploymentLogs = data; break;
    case 'errors': errorNotifications = data; break;
    case 'deployments': deploymentQueue = data; break;
    case 'notifications': notifications = data; break;
    case 'auditLogs': auditLogs = data; break;
    case 'bulkOps': bulkOperations = data; break;
    case 'templates': crfTemplates = data; break;
  }
}

/** Hydrate all slices from localStorage on startup */
function hydrateFromStorage() {
  // Check storage version — if stale or missing, skip hydration (will use fresh mock data)
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  if (storedVersion !== String(STORAGE_VERSION)) {
    // Clear any stale keys from older versions
    clearAllStorageKeys();
    localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
    return;
  }

  sliceKeys.forEach(slice => {
    const raw = localStorage.getItem(STORAGE_PREFIX + slice);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSliceData(slice, parsed);
      } catch {
        // Corrupt JSON — remove the bad key, will fall back to mock seed data for this slice
        localStorage.removeItem(STORAGE_PREFIX + slice);
      }
    }
  });
}

function clearAllStorageKeys() {
  sliceKeys.forEach(slice => localStorage.removeItem(STORAGE_PREFIX + slice));
  localStorage.removeItem(STORAGE_VERSION_KEY);
}

function notify(...slices: Slice[]) {
  slices.forEach(slice => {
    // Auto-persist every changed slice
    persistSlice(slice);
    subscribers[slice].forEach(fn => fn());
  });
}

// ─── State ─────────────────────────────────────────────
let users: UserResponse[] = [...mockUsers];
let userDtos: UserDto[] = [...mockUserDtos];
let roles: RoleDto[] = [...mockRoles];
let versions: VersionResponse[] = [...mockVersions];
let clients: ClientResponse[] = [...mockClients];
let clientVersionHistory: ClientVersionHistory[] = [...mockClientVersionHistory];
let workflowSteps: WorkflowStepResponse[] = [...mockWorkflowSteps];
let crfs: CRFResponse[] = [...mockCRFs];
let crfClients: CRFClientResponse[] = [...mockCRFClients];
let crfApprovals: CRFApprovalResponse[] = [...mockCRFApprovals];
let apiConfigurations: APIConfigurationResponse[] = [...mockAPIConfigurations];
let apiExecutionLogs: APIExecutionLogResponse[] = [...mockAPIExecutionLogs];
let deploymentLogs: DeploymentLogResponse[] = [...mockDeploymentLogs];
let errorNotifications: ErrorNotificationResponse[] = [...mockErrorNotifications];
let deploymentQueue: DeploymentQueueResponse[] = [...mockDeploymentQueue];
let notifications: NotificationResponse[] = [...mockNotifications];
let auditLogs: AuditLogResponse[] = [...mockAuditLogs];
let bulkOperations: BulkOperationResponse[] = [...mockBulkOperations];
let crfTemplates: CRFTemplateResponse[] = [...mockCRFTemplates];

// ─── Helpers ───────────────────────────────────────────
function getNextId(array: any[]): number {
  if (array.length === 0) return 1;
  const firstKey = Object.keys(array[0])[0];
  return Math.max(...array.map(item => item[firstKey]), 0) + 1;
}

function createAuditLogEntry(
  userId: number,
  username: string,
  action: string,
  entityType: string,
  entityId: number | null,
  details: string,
  oldValue?: any,
  newValue?: any
) {
  const auditLog: AuditLogResponse = {
    auditLogId: getNextId(auditLogs),
    userId,
    username,
    action,
    entityType,
    entityId: entityId || undefined,
    details,
    oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
    newValue: newValue ? JSON.stringify(newValue) : undefined,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    timestamp: new Date().toISOString(),
  };
  auditLogs = [auditLog, ...auditLogs];
  notify('auditLogs');
}

// ─── CRUD Methods ──────────────────────────────────────

// --- Users ---
function getAllUsers(): UserResponse[] {
  return [...users];
}

function getUserById(userId: number): UserResponse | null {
  return users.find(u => u.userId === userId) || null;
}

function createUser(data: Omit<UserResponse, 'userId' | 'createdDate'>): UserResponse {
  const newUser: UserResponse = {
    ...data,
    userId: getNextId(users),
    createdDate: new Date().toISOString(),
  };
  users = [...users, newUser];

  const newUserDto: UserDto = {
    userId: newUser.userId,
    username: newUser.username,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    company: newUser.company,
    role: newUser.roles,
    isActive: newUser.isActive,
  };
  userDtos = [...userDtos, newUserDto];

  notify('users');
  return newUser;
}

function updateUser(userId: number, updates: Partial<UserResponse>): UserResponse | null {
  const index = users.findIndex(u => u.userId === userId);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  users = [...users];

  const dtoIndex = userDtos.findIndex(u => u.userId === userId);
  if (dtoIndex !== -1) {
    userDtos[dtoIndex] = {
      ...userDtos[dtoIndex],
      email: users[index].email,
      firstName: users[index].firstName,
      lastName: users[index].lastName,
      company: users[index].company,
      isActive: users[index].isActive,
    };
    userDtos = [...userDtos];
  }

  notify('users');
  return users[index];
}

function deleteUser(userId: number): boolean {
  const before = users.length;
  users = users.filter(u => u.userId !== userId);
  userDtos = userDtos.filter(u => u.userId !== userId);
  if (users.length < before) {
    notify('users');
    return true;
  }
  return false;
}

// --- Roles ---
function getAllRoles(): RoleDto[] {
  return [...roles];
}

function getRoleById(roleId: number): RoleDto | null {
  return roles.find(r => r.roleId === roleId) || null;
}

// --- Versions ---
function getAllVersions(): VersionResponse[] {
  return [...versions];
}

function getVersionById(versionId: number): VersionResponse | null {
  return versions.find(v => v.versionId === versionId) || null;
}

function createVersion(data: Omit<VersionResponse, 'versionId' | 'createdDate' | 'clientCount'>): VersionResponse {
  const newVersion: VersionResponse = {
    ...data,
    versionId: getNextId(versions),
    createdDate: new Date().toISOString(),
    clientCount: 0,
  };
  versions = [newVersion, ...versions];
  notify('versions');
  return newVersion;
}

function updateVersion(versionId: number, updates: Partial<VersionResponse>): VersionResponse | null {
  const index = versions.findIndex(v => v.versionId === versionId);
  if (index === -1) return null;
  versions[index] = { ...versions[index], ...updates, updatedDate: new Date().toISOString() };
  versions = [...versions];
  notify('versions');
  return versions[index];
}

function deleteVersion(versionId: number): boolean {
  const before = versions.length;
  versions = versions.filter(v => v.versionId !== versionId);
  if (versions.length < before) {
    notify('versions');
    return true;
  }
  return false;
}

// --- Clients ---
function getAllClients(): ClientResponse[] {
  return [...clients];
}

function getClientById(clientId: number): ClientResponse | null {
  return clients.find(c => c.clientId === clientId) || null;
}

function createClient(data: Omit<ClientResponse, 'clientId' | 'createdDate'>): ClientResponse {
  const newClient: ClientResponse = {
    ...data,
    clientId: getNextId(clients),
    createdDate: new Date().toISOString(),
  };
  clients = [...clients, newClient];
  notify('clients');
  return newClient;
}

function updateClient(clientId: number, updates: Partial<ClientResponse>): ClientResponse | null {
  const index = clients.findIndex(c => c.clientId === clientId);
  if (index === -1) return null;
  clients[index] = { ...clients[index], ...updates, updatedDate: new Date().toISOString() };
  clients = [...clients];
  notify('clients');
  return clients[index];
}

function deleteClient(clientId: number): boolean {
  const before = clients.length;
  clients = clients.filter(c => c.clientId !== clientId);
  if (clients.length < before) {
    // Cross-domain side effect: clean up version history
    clientVersionHistory = clientVersionHistory.filter(h => h.clientId !== clientId);
    notify('clients', 'clientVersionHistory');
    return true;
  }
  return false;
}

function updateClientVersion(clientId: number, versionId: number, notes: string, updatedBy: number, updatedByName: string): boolean {
  const clientIndex = clients.findIndex(c => c.clientId === clientId);
  if (clientIndex === -1) return false;
  const version = versions.find(v => v.versionId === versionId);
  if (!version) return false;

  clients[clientIndex] = {
    ...clients[clientIndex],
    currentVersionId: versionId,
    currentVersion: version.versionNumber,
    currentVersionName: version.versionName,
    lastUpdateDate: new Date().toISOString().split('T')[0],
    updatedDate: new Date().toISOString(),
  };
  clients = [...clients];

  // Mark old versions as not current
  clientVersionHistory = clientVersionHistory.map(h =>
    h.clientId === clientId ? { ...h, isCurrentVersion: false } : h
  );

  const historyEntry: ClientVersionHistory = {
    clientVersionId: getNextId(clientVersionHistory),
    clientId,
    versionId,
    versionNumber: version.versionNumber,
    versionName: version.versionName,
    assignedDate: new Date().toISOString().split('T')[0],
    updatedBy,
    updatedByName,
    notes,
    isCurrentVersion: true,
  };
  clientVersionHistory = [...clientVersionHistory, historyEntry];

  notify('clients', 'clientVersionHistory');
  return true;
}

function getClientVersionHistory(clientId: number): ClientVersionHistory[] {
  return clientVersionHistory
    .filter(h => h.clientId === clientId)
    .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
}

// --- CRFs ---
function getAllCRFs(status?: string): CRFResponse[] {
  let result = [...crfs];
  if (status) result = result.filter(c => c.status === status);
  return result;
}

function getCRFById(crfId: number): CRFResponse | null {
  return crfs.find(c => c.crfId === crfId) || null;
}

function createCRF(data: Omit<CRFResponse, 'crfId' | 'createdDate' | 'successfulDeployments'>): CRFResponse {
  const newCRF: CRFResponse = {
    ...data,
    crfId: getNextId(crfs),
    createdDate: new Date().toISOString().split('T')[0],
    successfulDeployments: 0,
  };
  crfs = [...crfs, newCRF];
  notify('crfs');
  return newCRF;
}

function updateCRF(crfId: number, updates: Partial<CRFResponse>): CRFResponse | null {
  const index = crfs.findIndex(c => c.crfId === crfId);
  if (index === -1) return null;
  crfs[index] = { ...crfs[index], ...updates, updatedDate: new Date().toISOString().split('T')[0] };
  crfs = [...crfs];
  notify('crfs');
  return crfs[index];
}

function deleteCRF(crfId: number): boolean {
  const before = crfs.length;
  crfs = crfs.filter(c => c.crfId !== crfId);
  if (crfs.length < before) {
    // Cross-domain side effects
    crfClients = crfClients.filter(c => c.crfId !== crfId);
    crfApprovals = crfApprovals.filter(a => a.crfId !== crfId);
    notify('crfs', 'crfClients', 'crfApprovals');
    return true;
  }
  return false;
}

// --- CRF Clients ---
function getCRFClients(crfId: number): CRFClientResponse[] {
  return crfClients.filter(c => c.crfId === crfId);
}

function addCRFClient(data: CRFClientResponse): CRFClientResponse {
  const entry = { ...data, crfClientId: getNextId(crfClients) };
  crfClients = [...crfClients, entry];
  notify('crfClients');
  return entry;
}

function updateCRFClient(crfClientId: number, updates: Partial<CRFClientResponse>): CRFClientResponse | null {
  const index = crfClients.findIndex(c => c.crfClientId === crfClientId);
  if (index === -1) return null;
  crfClients[index] = { ...crfClients[index], ...updates };
  crfClients = [...crfClients];
  notify('crfClients');
  return crfClients[index];
}

// --- CRF Approvals ---
function getCRFApprovals(crfId: number): CRFApprovalResponse[] {
  return crfApprovals
    .filter(a => a.crfId === crfId)
    .sort((a, b) => a.stepOrder - b.stepOrder);
}

function getAllCRFApprovals(): CRFApprovalResponse[] {
  return [...crfApprovals];
}

function addCRFApproval(data: CRFApprovalResponse): CRFApprovalResponse {
  const entry = { ...data, crfApprovalId: getNextId(crfApprovals) };
  crfApprovals = [...crfApprovals, entry];
  notify('crfApprovals');
  return entry;
}

function updateCRFApproval(approvalId: number, updates: Partial<CRFApprovalResponse>): CRFApprovalResponse | null {
  const index = crfApprovals.findIndex(a => a.crfApprovalId === approvalId);
  if (index === -1) return null;
  crfApprovals[index] = { ...crfApprovals[index], ...updates };
  crfApprovals = [...crfApprovals];
  notify('crfApprovals');
  return crfApprovals[index];
}

// --- Workflow Steps ---
function getWorkflowSteps(): WorkflowStepResponse[] {
  return [...workflowSteps].sort((a, b) => a.stepOrder - b.stepOrder);
}

function getActiveWorkflowSteps(): WorkflowStepResponse[] {
  return workflowSteps.filter(s => s.isActive).sort((a, b) => a.stepOrder - b.stepOrder);
}

function createWorkflowStep(data: Omit<WorkflowStepResponse, 'workflowStepId' | 'createdDate'>): WorkflowStepResponse {
  const newStep: WorkflowStepResponse = {
    ...data,
    workflowStepId: getNextId(workflowSteps),
    createdDate: new Date().toISOString().split('T')[0],
  };
  workflowSteps = [...workflowSteps, newStep];
  notify('workflow');
  return newStep;
}

function updateWorkflowStep(stepId: number, updates: Partial<WorkflowStepResponse>): WorkflowStepResponse | null {
  const index = workflowSteps.findIndex(s => s.workflowStepId === stepId);
  if (index === -1) return null;
  workflowSteps[index] = { ...workflowSteps[index], ...updates };
  workflowSteps = [...workflowSteps];
  notify('workflow');
  return workflowSteps[index];
}

function deleteWorkflowStep(stepId: number): boolean {
  const before = workflowSteps.length;
  workflowSteps = workflowSteps.filter(s => s.workflowStepId !== stepId);
  if (workflowSteps.length < before) {
    notify('workflow');
    return true;
  }
  return false;
}

function reorderWorkflowStep(stepId: number, newOrder: number): boolean {
  const index = workflowSteps.findIndex(s => s.workflowStepId === stepId);
  if (index === -1) return false;
  const oldOrder = workflowSteps[index].stepOrder;
  workflowSteps[index].stepOrder = newOrder;
  workflowSteps.forEach(step => {
    if (step.workflowStepId !== stepId) {
      if (newOrder < oldOrder && step.stepOrder >= newOrder && step.stepOrder < oldOrder) {
        step.stepOrder++;
      } else if (newOrder > oldOrder && step.stepOrder <= newOrder && step.stepOrder > oldOrder) {
        step.stepOrder--;
      }
    }
  });
  workflowSteps = [...workflowSteps];
  notify('workflow');
  return true;
}

// --- API Configurations ---
function getAllAPIConfigurations(apiType?: string): APIConfigurationResponse[] {
  let result = [...apiConfigurations];
  if (apiType) result = result.filter(c => c.apiType === apiType);
  return result.sort((a, b) => a.executionOrder - b.executionOrder);
}

function getAPIConfigurationById(id: number): APIConfigurationResponse | null {
  return apiConfigurations.find(c => c.apiConfigurationId === id) || null;
}

function createAPIConfiguration(data: Omit<APIConfigurationResponse, 'apiConfigurationId' | 'createdDate'>): APIConfigurationResponse {
  const newConfig: APIConfigurationResponse = {
    ...data,
    apiConfigurationId: getNextId(apiConfigurations),
    createdDate: new Date().toISOString().split('T')[0],
  };
  apiConfigurations = [...apiConfigurations, newConfig];
  notify('apiConfig');
  return newConfig;
}

function updateAPIConfiguration(id: number, updates: Partial<APIConfigurationResponse>): APIConfigurationResponse | null {
  const index = apiConfigurations.findIndex(c => c.apiConfigurationId === id);
  if (index === -1) return null;
  apiConfigurations[index] = { ...apiConfigurations[index], ...updates, updatedDate: new Date().toISOString().split('T')[0] };
  apiConfigurations = [...apiConfigurations];
  notify('apiConfig');
  return apiConfigurations[index];
}

function deleteAPIConfiguration(id: number): boolean {
  const before = apiConfigurations.length;
  apiConfigurations = apiConfigurations.filter(c => c.apiConfigurationId !== id);
  if (apiConfigurations.length < before) {
    notify('apiConfig');
    return true;
  }
  return false;
}

// --- API Execution Logs ---
function getAPIExecutionLogs(crfId?: number, apiConfigId?: number): APIExecutionLogResponse[] {
  let result = [...apiExecutionLogs];
  if (crfId) result = result.filter(l => l.crfId === crfId);
  if (apiConfigId) result = result.filter(l => l.apiConfigurationId === apiConfigId);
  return result.sort((a, b) => new Date(b.executionStartTime).getTime() - new Date(a.executionStartTime).getTime());
}

function addAPIExecutionLog(data: APIExecutionLogResponse): APIExecutionLogResponse {
  const entry = { ...data, apiExecutionLogId: getNextId(apiExecutionLogs) };
  apiExecutionLogs = [entry, ...apiExecutionLogs];
  notify('apiExecutionLogs');
  return entry;
}

// --- Deployment Logs ---
function getDeploymentLogs(crfId: number, clientId?: number): DeploymentLogResponse[] {
  let result = deploymentLogs.filter(l => l.crfId === crfId);
  if (clientId) result = result.filter(l => l.clientId === clientId);
  return result.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
}

function getAllDeploymentLogs(): DeploymentLogResponse[] {
  return [...deploymentLogs].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
}

function addDeploymentLog(data: DeploymentLogResponse): DeploymentLogResponse {
  const entry = { ...data, deploymentLogId: getNextId(deploymentLogs) };
  deploymentLogs = [entry, ...deploymentLogs];
  notify('deploymentLogs');
  return entry;
}

// --- Error Notifications ---
function getAllErrorNotifications(): ErrorNotificationResponse[] {
  return [...errorNotifications].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
}

function getErrorNotificationById(id: number): ErrorNotificationResponse | null {
  return errorNotifications.find(e => e.errorNotificationId === id) || null;
}

function createErrorNotification(data: Omit<ErrorNotificationResponse, 'errorNotificationId' | 'createdDate'>): ErrorNotificationResponse {
  const entry: ErrorNotificationResponse = {
    ...data,
    errorNotificationId: getNextId(errorNotifications),
    createdDate: new Date().toISOString(),
  };
  errorNotifications = [entry, ...errorNotifications];
  notify('errors');
  return entry;
}

function updateErrorNotification(id: number, updates: Partial<ErrorNotificationResponse>): ErrorNotificationResponse | null {
  const index = errorNotifications.findIndex(e => e.errorNotificationId === id);
  if (index === -1) return null;
  errorNotifications[index] = { ...errorNotifications[index], ...updates };
  errorNotifications = [...errorNotifications];
  notify('errors');
  return errorNotifications[index];
}

// --- Deployment Queue ---
function getAllDeploymentQueues(): DeploymentQueueResponse[] {
  return [...deploymentQueue].sort((a, b) => a.priority - b.priority);
}

function getDeploymentQueueById(id: number): DeploymentQueueResponse | null {
  return deploymentQueue.find(d => d.deploymentQueueId === id) || null;
}

function createDeploymentQueue(data: Omit<DeploymentQueueResponse, 'deploymentQueueId'>): DeploymentQueueResponse {
  const entry: DeploymentQueueResponse = {
    ...data,
    deploymentQueueId: getNextId(deploymentQueue),
  };
  deploymentQueue = [...deploymentQueue, entry];
  notify('deployments');
  return entry;
}

function updateDeploymentQueue(id: number, updates: Partial<DeploymentQueueResponse>): DeploymentQueueResponse | null {
  const index = deploymentQueue.findIndex(d => d.deploymentQueueId === id);
  if (index === -1) return null;
  deploymentQueue[index] = { ...deploymentQueue[index], ...updates };
  deploymentQueue = [...deploymentQueue];
  notify('deployments');
  return deploymentQueue[index];
}

function deleteDeploymentQueue(id: number): boolean {
  const before = deploymentQueue.length;
  deploymentQueue = deploymentQueue.filter(d => d.deploymentQueueId !== id);
  if (deploymentQueue.length < before) {
    notify('deployments');
    return true;
  }
  return false;
}

// --- Notifications ---
function getAllNotifications(userId?: number): NotificationResponse[] {
  let result = [...notifications];
  if (userId) result = result.filter(n => n.userId === userId);
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function createNotification(data: Omit<NotificationResponse, 'notificationId'>): NotificationResponse {
  const entry: NotificationResponse = {
    ...data,
    notificationId: getNextId(notifications),
  };
  notifications = [entry, ...notifications];
  notify('notifications');
  return entry;
}

function updateNotification(id: number, updates: Partial<NotificationResponse>): NotificationResponse | null {
  const index = notifications.findIndex(n => n.notificationId === id);
  if (index === -1) return null;
  notifications[index] = { ...notifications[index], ...updates };
  notifications = [...notifications];
  notify('notifications');
  return notifications[index];
}

function markAllNotificationsRead(userId: number): number {
  let count = 0;
  notifications = notifications.map(n => {
    if (n.userId === userId && !n.isRead) {
      count++;
      return { ...n, isRead: true, readAt: new Date().toISOString() };
    }
    return n;
  });
  if (count > 0) notify('notifications');
  return count;
}

function deleteNotification(id: number): boolean {
  const before = notifications.length;
  notifications = notifications.filter(n => n.notificationId !== id);
  if (notifications.length < before) {
    notify('notifications');
    return true;
  }
  return false;
}

// --- Audit Logs ---
function getAllAuditLogs(): AuditLogResponse[] {
  return [...auditLogs];
}

function getAuditLogsPaged(page: number, pageSize: number, filters?: { action?: string; entityType?: string; userId?: number; startDate?: string; endDate?: string }): { logs: AuditLogResponse[]; totalCount: number } {
  let filtered = [...auditLogs];
  if (filters?.action) filtered = filtered.filter(l => l.action === filters.action);
  if (filters?.entityType) filtered = filtered.filter(l => l.entityType === filters.entityType);
  if (filters?.userId) filtered = filtered.filter(l => l.userId === filters.userId);
  if (filters?.startDate) filtered = filtered.filter(l => l.timestamp >= filters.startDate!);
  if (filters?.endDate) filtered = filtered.filter(l => l.timestamp <= filters.endDate!);
  const totalCount = filtered.length;
  const start = (page - 1) * pageSize;
  return { logs: filtered.slice(start, start + pageSize), totalCount };
}

// --- Bulk Operations ---
function getAllBulkOperations(): BulkOperationResponse[] {
  return [...bulkOperations];
}

function createBulkOperation(data: Omit<BulkOperationResponse, 'bulkOperationId'>): BulkOperationResponse {
  const entry: BulkOperationResponse = {
    ...data,
    bulkOperationId: getNextId(bulkOperations),
  };
  bulkOperations = [entry, ...bulkOperations];
  notify('bulkOps');
  return entry;
}

function updateBulkOperation(id: number, updates: Partial<BulkOperationResponse>): BulkOperationResponse | null {
  const index = bulkOperations.findIndex(b => b.bulkOperationId === id);
  if (index === -1) return null;
  bulkOperations[index] = { ...bulkOperations[index], ...updates };
  bulkOperations = [...bulkOperations];
  notify('bulkOps');
  return bulkOperations[index];
}

// --- CRF Templates ---
function getAllCRFTemplates(): CRFTemplateResponse[] {
  return [...crfTemplates];
}

function getCRFTemplateById(id: number): CRFTemplateResponse | null {
  return crfTemplates.find(t => t.crfTemplateId === id) || null;
}

function createCRFTemplate(data: Omit<CRFTemplateResponse, 'crfTemplateId' | 'createdDate' | 'usageCount'>): CRFTemplateResponse {
  const entry: CRFTemplateResponse = {
    ...data,
    crfTemplateId: getNextId(crfTemplates),
    createdDate: new Date().toISOString().split('T')[0],
    usageCount: 0,
  };
  crfTemplates = [...crfTemplates, entry];
  notify('templates');
  return entry;
}

function updateCRFTemplate(id: number, updates: Partial<CRFTemplateResponse>): CRFTemplateResponse | null {
  const index = crfTemplates.findIndex(t => t.crfTemplateId === id);
  if (index === -1) return null;
  crfTemplates[index] = { ...crfTemplates[index], ...updates, updatedDate: new Date().toISOString().split('T')[0] };
  crfTemplates = [...crfTemplates];
  notify('templates');
  return crfTemplates[index];
}

function deleteCRFTemplate(id: number): boolean {
  const before = crfTemplates.length;
  crfTemplates = crfTemplates.filter(t => t.crfTemplateId !== id);
  if (crfTemplates.length < before) {
    notify('templates');
    return true;
  }
  return false;
}

// ─── Computed Getters ──────────────────────────────────
function getUnreadNotificationCount(userId?: number): number {
  const filtered = userId ? notifications.filter(n => n.userId === userId) : notifications;
  return filtered.filter(n => !n.isRead).length;
}

function getActiveClientCount(): number {
  return clients.filter(c => c.status === 'Active').length;
}

function getUnresolvedErrorCount(): number {
  return errorNotifications.filter(e => !e.isResolved).length;
}

function getPendingCRFCount(): number {
  return crfs.filter(c => c.status === 'Pending' || c.status === 'Approved').length;
}

// ─── Reset ─────────────────────────────────────────────
function reset() {
  users = [...mockUsers];
  userDtos = [...mockUserDtos];
  roles = [...mockRoles];
  versions = [...mockVersions];
  clients = [...mockClients];
  clientVersionHistory = [...mockClientVersionHistory];
  workflowSteps = [...mockWorkflowSteps];
  crfs = [...mockCRFs];
  crfClients = [...mockCRFClients];
  crfApprovals = [...mockCRFApprovals];
  apiConfigurations = [...mockAPIConfigurations];
  apiExecutionLogs = [...mockAPIExecutionLogs];
  deploymentLogs = [...mockDeploymentLogs];
  errorNotifications = [...mockErrorNotifications];
  deploymentQueue = [...mockDeploymentQueue];
  notifications = [...mockNotifications];
  auditLogs = [...mockAuditLogs];
  bulkOperations = [...mockBulkOperations];
  crfTemplates = [...mockCRFTemplates];
  sliceKeys.forEach(key => notify(key));
}

/** Clear all persisted data and reset to factory defaults */
function resetToDefaults() {
  clearAllStorageKeys();
  reset();
}

/** Get persistence stats for the dev panel */
function getPersistenceStats(): { sliceCount: number; totalBytes: number; slices: Record<string, number> } {
  const slices: Record<string, number> = {};
  let totalBytes = 0;
  sliceKeys.forEach(slice => {
    const raw = localStorage.getItem(STORAGE_PREFIX + slice);
    const bytes = raw ? new Blob([raw]).size : 0;
    slices[slice] = bytes;
    totalBytes += bytes;
  });
  return { sliceCount: sliceKeys.length, totalBytes, slices };
}

// ─── Public API ────────────────────────────────────────
export const appStore = {
  // Reactive state (read by hooks)
  get users() { return users; },
  get userDtos() { return userDtos; },
  get roles() { return roles; },
  get versions() { return versions; },
  get clients() { return clients; },
  get clientVersionHistory() { return clientVersionHistory; },
  get workflowSteps() { return workflowSteps; },
  get crfs() { return crfs; },
  get crfClients() { return crfClients; },
  get crfApprovals() { return crfApprovals; },
  get apiConfigurations() { return apiConfigurations; },
  get apiExecutionLogs() { return apiExecutionLogs; },
  get deploymentLogs() { return deploymentLogs; },
  get errorNotifications() { return errorNotifications; },
  get deploymentQueue() { return deploymentQueue; },
  get notifications() { return notifications; },
  get auditLogs() { return auditLogs; },
  get bulkOperations() { return bulkOperations; },
  get crfTemplates() { return crfTemplates; },

  // Computed
  get unreadNotificationCount() { return getUnreadNotificationCount(); },
  get activeClientCount() { return getActiveClientCount(); },
  get unresolvedErrorCount() { return getUnresolvedErrorCount(); },
  get pendingCRFCount() { return getPendingCRFCount(); },
  getUnreadNotificationCount,

  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  // Roles
  getAllRoles,
  getRoleById,

  // Versions
  getAllVersions,
  getVersionById,
  createVersion,
  updateVersion,
  deleteVersion,

  // Clients
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  updateClientVersion,
  getClientVersionHistory,

  // CRFs
  getAllCRFs,
  getCRFById,
  createCRF,
  updateCRF,
  deleteCRF,

  // CRF Clients
  getCRFClients,
  addCRFClient,
  updateCRFClient,

  // CRF Approvals
  getCRFApprovals,
  getAllCRFApprovals,
  addCRFApproval,
  updateCRFApproval,

  // Workflow
  getWorkflowSteps,
  getActiveWorkflowSteps,
  createWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep,
  reorderWorkflowStep,

  // API Configuration
  getAllAPIConfigurations,
  getAPIConfigurationById,
  createAPIConfiguration,
  updateAPIConfiguration,
  deleteAPIConfiguration,

  // API Execution Logs
  getAPIExecutionLogs,
  addAPIExecutionLog,

  // Deployment Logs
  getDeploymentLogs,
  getAllDeploymentLogs,
  addDeploymentLog,

  // Error Notifications
  getAllErrorNotifications,
  getErrorNotificationById,
  createErrorNotification,
  updateErrorNotification,

  // Deployment Queue
  getAllDeploymentQueues,
  getDeploymentQueueById,
  createDeploymentQueue,
  updateDeploymentQueue,
  deleteDeploymentQueue,

  // Notifications
  getAllNotifications,
  createNotification,
  updateNotification,
  markAllNotificationsRead,
  deleteNotification,

  // Audit Logs
  getAllAuditLogs,
  getAuditLogsPaged,
  createAuditLogEntry,

  // Bulk Operations
  getAllBulkOperations,
  createBulkOperation,
  updateBulkOperation,

  // CRF Templates
  getAllCRFTemplates,
  getCRFTemplateById,
  createCRFTemplate,
  updateCRFTemplate,
  deleteCRFTemplate,

  // Helpers
  getNextId,
  reset,
  resetToDefaults,
  getPersistenceStats,

  // Pub/sub
  subscribe(slice: Slice, listener: Listener): () => void {
    subscribers[slice].add(listener);
    return () => subscribers[slice].delete(listener);
  },
};

// Hydrate the store from localStorage on startup
hydrateFromStorage();