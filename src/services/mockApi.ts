import type {
  LoginRequest,
  LoginResponse,
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  RoleDto,
  VersionResponse,
  CreateVersionRequest,
  UpdateVersionRequest,
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
  UpdateClientVersionRequest,
  ClientVersionHistory,
  CRFResponse,
  CreateCRFRequest,
  UpdateCRFRequest,
  CRFClientResponse,
  CRFApprovalResponse,
  UpdateApprovalRequest,
  DeploymentLogResponse,
  WorkflowStepResponse,
  CreateWorkflowStepRequest,
  UpdateWorkflowStepRequest,
  APIConfigurationResponse,
  CreateAPIConfigurationRequest,
  UpdateAPIConfigurationRequest,
  APIExecutionLogResponse,
  ErrorNotificationResponse,
  CreateErrorNotificationRequest,
  ResolveErrorRequest,
  DeploymentQueueResponse,
  QueueDeploymentRequest,
  UpdateDeploymentQueueRequest,
  NotificationResponse,
  CreateNotificationRequest,
  AuditLogResponse,
  AuditLogPagedResponse,
  AuditLogStatisticsResponse,
  BulkOperationResponse,
  BulkOperationPagedResponse,
  BulkOperationStatisticsResponse,
  BulkCreateCRFsRequest,
  BulkUpdateClientsRequest,
  DeploymentReportResponse,
  CRFReportResponse,
  ClientReportResponse,
  SystemPerformanceReportResponse,
  DashboardStatisticsResponse,
  CRFTemplateResponse,
  CreateCRFTemplateRequest,
  UpdateCRFTemplateRequest,
  SystemMetrics,
  SystemHealthResponse,
  AdvancedSearchRequest,
  AdvancedSearchResult,
} from './api';
import { mockDataStore } from '../utils/mockDataProvider';

/**
 * MockApiClient - A complete mock implementation of the API client
 * This allows the application to run without a backend server
 */
class MockApiClient {
  private currentUser: UserDto | null = null;
  private mockToken: string | null = null;

  // Simulate network delay
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getToken(): string | null {
    return localStorage.getItem('mock_auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('mock_auth_token', token);
    this.mockToken = token;
  }

  private clearToken(): void {
    localStorage.removeItem('mock_auth_token');
    localStorage.removeItem('mock_auth_user');
    this.mockToken = null;
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getStoredUser(): UserDto | null {
    const userStr = localStorage.getItem('mock_auth_user');
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
    await this.delay();
    
    // Find user by username (case insensitive for demo)
    const user = mockDataStore.userDtos.find(
      u => u.username.toLowerCase() === request.username.toLowerCase()
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // In mock mode, accept any password for demo purposes
    const token = `mock_token_${Date.now()}_${user.userId}`;
    const refreshToken = `mock_refresh_${Date.now()}_${user.userId}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    this.setToken(token);
    this.currentUser = user;
    localStorage.setItem('mock_auth_user', JSON.stringify(user));

    return {
      token,
      refreshToken,
      expiresAt,
      user,
    };
  }

  async logout(): Promise<void> {
    await this.delay(100);
    this.clearToken();
  }

  async getCurrentUser(): Promise<UserDto> {
    await this.delay(100);
    const stored = this.getStoredUser();
    if (stored) {
      return stored;
    }
    throw new Error('Not authenticated');
  }

  // User APIs
  async getAllUsers(): Promise<UserResponse[]> {
    await this.delay();
    return [...mockDataStore.users];
  }

  async getUserById(userId: number): Promise<UserResponse> {
    await this.delay();
    const user = mockDataStore.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async createUser(request: CreateUserRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.users);
    const role = mockDataStore.roles.find(r => r.roleId === request.roleId);
    
    const newUser: UserResponse = {
      userId: newId,
      username: request.username,
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      company: request.company,
      roles: role?.roleName || 'Client',
      isActive: true,
      createdDate: new Date().toISOString(),
    };

    const newUserDto: UserDto = {
      userId: newId,
      username: request.username,
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      company: request.company,
      role: role?.roleName || 'Client',
      isActive: true,
    };

    mockDataStore.users.push(newUser);
    mockDataStore.userDtos.push(newUserDto);
    
    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'CREATE',
        'User',
        newId,
        `Created user ${request.username}`,
        null,
        { username: request.username }
      );
    }

    return newId;
  }

  async updateUser(userId: number, request: UpdateUserRequest): Promise<boolean> {
    await this.delay();
    const userIndex = mockDataStore.users.findIndex(u => u.userId === userId);
    if (userIndex === -1) throw new Error('User not found');

    const oldUser = { ...mockDataStore.users[userIndex] };
    mockDataStore.users[userIndex] = {
      ...mockDataStore.users[userIndex],
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      company: request.company,
      isActive: request.isActive,
    };

    const userDtoIndex = mockDataStore.userDtos.findIndex(u => u.userId === userId);
    if (userDtoIndex !== -1) {
      mockDataStore.userDtos[userDtoIndex] = {
        ...mockDataStore.userDtos[userDtoIndex],
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        company: request.company,
        isActive: request.isActive,
      };
    }

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'User',
        userId,
        `Updated user ${oldUser.username}`,
        { email: oldUser.email, isActive: oldUser.isActive },
        { email: request.email, isActive: request.isActive }
      );
    }

    return true;
  }

  async deleteUser(userId: number): Promise<boolean> {
    await this.delay();
    const userIndex = mockDataStore.users.findIndex(u => u.userId === userId);
    if (userIndex === -1) throw new Error('User not found');

    const deletedUser = mockDataStore.users[userIndex];
    mockDataStore.users.splice(userIndex, 1);
    mockDataStore.userDtos = mockDataStore.userDtos.filter(u => u.userId !== userId);

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'DELETE',
        'User',
        userId,
        `Deleted user ${deletedUser.username}`
      );
    }

    return true;
  }

  // Role APIs
  async getAllRoles(): Promise<RoleDto[]> {
    await this.delay();
    return [...mockDataStore.roles];
  }

  async getRoleById(roleId: number): Promise<RoleDto> {
    await this.delay();
    const role = mockDataStore.roles.find(r => r.roleId === roleId);
    if (!role) throw new Error('Role not found');
    return role;
  }

  // Version APIs
  async getAllVersions(): Promise<VersionResponse[]> {
    await this.delay();
    return [...mockDataStore.versions];
  }

  async getVersionById(versionId: number): Promise<VersionResponse> {
    await this.delay();
    const version = mockDataStore.versions.find(v => v.versionId === versionId);
    if (!version) throw new Error('Version not found');
    return version;
  }

  async createVersion(request: CreateVersionRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.versions);
    const currentUser = this.getStoredUser();

    const newVersion: VersionResponse = {
      versionId: newId,
      versionNumber: request.versionNumber,
      versionName: request.versionName,
      releaseDate: request.releaseDate,
      description: request.description,
      releaseNotes: request.releaseNotes,
      isMajorRelease: request.isMajorRelease,
      isActive: true,
      createdBy: currentUser?.userId || 1,
      createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      createdDate: new Date().toISOString(),
      clientCount: 0,
    };

    mockDataStore.versions.unshift(newVersion);

    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'CREATE',
        'Version',
        newId,
        `Created version ${request.versionNumber}`,
        null,
        { versionNumber: request.versionNumber, versionName: request.versionName }
      );
    }

    return newId;
  }

  async updateVersion(versionId: number, request: UpdateVersionRequest): Promise<boolean> {
    await this.delay();
    const versionIndex = mockDataStore.versions.findIndex(v => v.versionId === versionId);
    if (versionIndex === -1) throw new Error('Version not found');

    const oldVersion = { ...mockDataStore.versions[versionIndex] };
    mockDataStore.versions[versionIndex] = {
      ...mockDataStore.versions[versionIndex],
      versionNumber: request.versionNumber,
      versionName: request.versionName,
      releaseDate: request.releaseDate,
      description: request.description,
      releaseNotes: request.releaseNotes,
      isMajorRelease: request.isMajorRelease,
      isActive: request.isActive,
      updatedDate: new Date().toISOString(),
    };

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'Version',
        versionId,
        `Updated version ${oldVersion.versionNumber}`,
        { versionNumber: oldVersion.versionNumber },
        { versionNumber: request.versionNumber }
      );
    }

    return true;
  }

  async deleteVersion(versionId: number): Promise<boolean> {
    await this.delay();
    const versionIndex = mockDataStore.versions.findIndex(v => v.versionId === versionId);
    if (versionIndex === -1) throw new Error('Version not found');

    const deletedVersion = mockDataStore.versions[versionIndex];
    mockDataStore.versions.splice(versionIndex, 1);

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'DELETE',
        'Version',
        versionId,
        `Deleted version ${deletedVersion.versionNumber}`
      );
    }

    return true;
  }

  // Client APIs
  async getAllClients(): Promise<ClientResponse[]> {
    await this.delay();
    return [...mockDataStore.clients];
  }

  async getClientById(clientId: number): Promise<ClientResponse> {
    await this.delay();
    const client = mockDataStore.clients.find(c => c.clientId === clientId);
    if (!client) throw new Error('Client not found');
    return client;
  }

  async createClient(request: CreateClientRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.clients);
    const currentUser = this.getStoredUser();
    
    let currentVersion = '';
    let currentVersionName = '';
    if (request.currentVersionId) {
      const version = mockDataStore.versions.find(v => v.versionId === request.currentVersionId);
      if (version) {
        currentVersion = version.versionNumber;
        currentVersionName = version.versionName;
      }
    }

    const newClient: ClientResponse = {
      clientId: newId,
      clientName: request.clientName,
      contactEmail: request.contactEmail,
      contactPerson: request.contactPerson,
      phone: request.phone,
      address: request.address,
      currentVersionId: request.currentVersionId,
      currentVersion,
      currentVersionName,
      status: request.status,
      createdBy: currentUser?.userId || 1,
      createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      createdDate: new Date().toISOString(),
      isActive: true,
      hasCustomizations: request.hasCustomizations || false,
    };

    mockDataStore.clients.push(newClient);

    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'CREATE',
        'Client',
        newId,
        `Created client ${request.clientName}`,
        null,
        { clientName: request.clientName, hasCustomizations: request.hasCustomizations }
      );
    }

    return newId;
  }

  async updateClient(clientId: number, request: UpdateClientRequest): Promise<boolean> {
    await this.delay();
    const clientIndex = mockDataStore.clients.findIndex(c => c.clientId === clientId);
    if (clientIndex === -1) throw new Error('Client not found');

    const oldClient = { ...mockDataStore.clients[clientIndex] };
    mockDataStore.clients[clientIndex] = {
      ...mockDataStore.clients[clientIndex],
      clientName: request.clientName,
      contactEmail: request.contactEmail,
      contactPerson: request.contactPerson,
      phone: request.phone,
      address: request.address,
      status: request.status,
      isActive: request.isActive,
      hasCustomizations: request.hasCustomizations,
      updatedDate: new Date().toISOString(),
    };

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'Client',
        clientId,
        `Updated client ${oldClient.clientName}`,
        { hasCustomizations: oldClient.hasCustomizations },
        { hasCustomizations: request.hasCustomizations }
      );
    }

    return true;
  }

  async deleteClient(clientId: number): Promise<boolean> {
    await this.delay();
    const clientIndex = mockDataStore.clients.findIndex(c => c.clientId === clientId);
    if (clientIndex === -1) throw new Error('Client not found');

    const deletedClient = mockDataStore.clients[clientIndex];
    mockDataStore.clients.splice(clientIndex, 1);

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'DELETE',
        'Client',
        clientId,
        `Deleted client ${deletedClient.clientName}`
      );
    }

    return true;
  }

  async updateClientVersion(clientId: number, request: UpdateClientVersionRequest): Promise<boolean> {
    await this.delay();
    const clientIndex = mockDataStore.clients.findIndex(c => c.clientId === clientId);
    if (clientIndex === -1) throw new Error('Client not found');

    const version = mockDataStore.versions.find(v => v.versionId === request.versionId);
    if (!version) throw new Error('Version not found');

    const oldVersion = mockDataStore.clients[clientIndex].currentVersion;

    mockDataStore.clients[clientIndex] = {
      ...mockDataStore.clients[clientIndex],
      currentVersionId: request.versionId,
      currentVersion: version.versionNumber,
      currentVersionName: version.versionName,
      lastUpdateDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString(),
    };

    const currentUser = this.getStoredUser();

    // Add to version history
    const historyEntry: ClientVersionHistory = {
      clientVersionId: mockDataStore.getNextId(mockDataStore.clientVersionHistory),
      clientId,
      versionId: request.versionId,
      versionNumber: version.versionNumber,
      versionName: version.versionName,
      assignedDate: new Date().toISOString().split('T')[0],
      updatedBy: currentUser?.userId || 1,
      updatedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      notes: request.notes,
      isCurrentVersion: true,
    };

    // Mark old versions as not current
    mockDataStore.clientVersionHistory.forEach(h => {
      if (h.clientId === clientId) {
        h.isCurrentVersion = false;
      }
    });

    mockDataStore.clientVersionHistory.push(historyEntry);

    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'Client',
        clientId,
        `Updated client version from ${oldVersion} to ${version.versionNumber}`,
        { version: oldVersion },
        { version: version.versionNumber }
      );
    }

    return true;
  }

  async getClientVersionHistory(clientId: number): Promise<ClientVersionHistory[]> {
    await this.delay();
    return mockDataStore.clientVersionHistory
      .filter(h => h.clientId === clientId)
      .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
  }

  // CRF APIs
  async getAllCRFs(status?: string): Promise<CRFResponse[]> {
    await this.delay();
    let crfs = [...mockDataStore.crfs];
    if (status) {
      crfs = crfs.filter(crf => crf.status === status);
    }
    return crfs;
  }

  async getCRFById(crfId: number): Promise<CRFResponse> {
    await this.delay();
    const crf = mockDataStore.crfs.find(c => c.crfId === crfId);
    if (!crf) throw new Error('CRF not found');
    return crf;
  }

  async createCRF(request: CreateCRFRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.crfs);
    const currentUser = this.getStoredUser();
    const version = mockDataStore.versions.find(v => v.versionId === request.versionId);

    const newCRF: CRFResponse = {
      crfId: newId,
      crfNumber: request.crfNumber,
      title: request.title,
      description: request.description,
      versionId: request.versionId,
      versionNumber: version?.versionNumber || '',
      versionName: version?.versionName || '',
      requestedBy: currentUser?.userId || 1,
      requestedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      status: 'Pending',
      priority: request.priority,
      scheduledDeploymentDate: request.scheduledDeploymentDate,
      createdDate: new Date().toISOString().split('T')[0],
      clientCount: request.clientIds.length,
      successfulDeployments: 0,
    };

    mockDataStore.crfs.push(newCRF);

    // Create CRF-Client associations
    request.clientIds.forEach(clientId => {
      const client = mockDataStore.clients.find(c => c.clientId === clientId);
      if (client) {
        const crfClient: CRFClientResponse = {
          crfClientId: mockDataStore.getNextId(mockDataStore.crfClients),
          crfId: newId,
          clientId,
          clientName: client.clientName,
          contactEmail: client.contactEmail,
          currentVersion: client.currentVersion,
          currentVersionName: client.currentVersionName,
          deploymentStatus: 'Pending',
          deploymentNotes: '',
        };
        mockDataStore.crfClients.push(crfClient);
      }
    });

    // Create initial approval records
    const workflowSteps = mockDataStore.workflowSteps.filter(s => s.isActive).sort((a, b) => a.stepOrder - b.stepOrder);
    workflowSteps.forEach(step => {
      const approval: CRFApprovalResponse = {
        crfApprovalId: mockDataStore.getNextId(mockDataStore.crfApprovals),
        crfId: newId,
        workflowStepId: step.workflowStepId,
        stepName: step.stepName,
        stepOrder: step.stepOrder,
        approverName: step.stepOrder === 1 ? (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System') : 'Pending',
        status: step.stepOrder === 1 ? 'Approved' : 'Pending',
        approvalDate: step.stepOrder === 1 ? new Date().toISOString().split('T')[0] : undefined,
        comments: step.stepOrder === 1 ? 'CRF created' : '',
        createdDate: new Date().toISOString().split('T')[0],
      };
      if (step.stepOrder === 1 && currentUser) {
        approval.approverUserId = currentUser.userId;
      }
      mockDataStore.crfApprovals.push(approval);
    });

    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'CREATE',
        'CRF',
        newId,
        `Created CRF ${request.crfNumber}`,
        null,
        { crfNumber: request.crfNumber, title: request.title }
      );
    }

    return newId;
  }

  async updateCRF(crfId: number, request: UpdateCRFRequest): Promise<boolean> {
    await this.delay();
    const crfIndex = mockDataStore.crfs.findIndex(c => c.crfId === crfId);
    if (crfIndex === -1) throw new Error('CRF not found');

    const oldCRF = { ...mockDataStore.crfs[crfIndex] };
    mockDataStore.crfs[crfIndex] = {
      ...mockDataStore.crfs[crfIndex],
      title: request.title,
      description: request.description,
      priority: request.priority,
      scheduledDeploymentDate: request.scheduledDeploymentDate,
      updatedDate: new Date().toISOString().split('T')[0],
    };

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'CRF',
        crfId,
        `Updated CRF ${oldCRF.crfNumber}`,
        { title: oldCRF.title },
        { title: request.title }
      );
    }

    return true;
  }

  async updateCRFStatus(crfId: number, status: string): Promise<boolean> {
    await this.delay();
    const crfIndex = mockDataStore.crfs.findIndex(c => c.crfId === crfId);
    if (crfIndex === -1) throw new Error('CRF not found');

    const oldStatus = mockDataStore.crfs[crfIndex].status;
    mockDataStore.crfs[crfIndex].status = status;
    mockDataStore.crfs[crfIndex].updatedDate = new Date().toISOString().split('T')[0];

    if (status === 'Completed') {
      mockDataStore.crfs[crfIndex].completedDate = new Date().toISOString().split('T')[0];
      mockDataStore.crfs[crfIndex].actualDeploymentDate = new Date().toISOString().split('T')[0];
    }

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'CRF',
        crfId,
        `Changed CRF status from ${oldStatus} to ${status}`,
        { status: oldStatus },
        { status }
      );
    }

    return true;
  }

  async deleteCRF(crfId: number): Promise<boolean> {
    await this.delay();
    const crfIndex = mockDataStore.crfs.findIndex(c => c.crfId === crfId);
    if (crfIndex === -1) throw new Error('CRF not found');

    const deletedCRF = mockDataStore.crfs[crfIndex];
    mockDataStore.crfs.splice(crfIndex, 1);

    // Remove related data
    mockDataStore.crfClients = mockDataStore.crfClients.filter(c => c.crfId !== crfId);
    mockDataStore.crfApprovals = mockDataStore.crfApprovals.filter(a => a.crfId !== crfId);

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'DELETE',
        'CRF',
        crfId,
        `Deleted CRF ${deletedCRF.crfNumber}`
      );
    }

    return true;
  }

  async getCRFClients(crfId: number): Promise<CRFClientResponse[]> {
    await this.delay();
    return mockDataStore.crfClients.filter(c => c.crfId === crfId);
  }

  async getCRFApprovals(crfId: number): Promise<CRFApprovalResponse[]> {
    await this.delay();
    return mockDataStore.crfApprovals
      .filter(a => a.crfId === crfId)
      .sort((a, b) => a.stepOrder - b.stepOrder);
  }

  async updateCRFApproval(approvalId: number, request: UpdateApprovalRequest): Promise<boolean> {
    await this.delay();
    const approvalIndex = mockDataStore.crfApprovals.findIndex(a => a.crfApprovalId === approvalId);
    if (approvalIndex === -1) throw new Error('Approval not found');

    const currentUser = this.getStoredUser();
    const oldStatus = mockDataStore.crfApprovals[approvalIndex].status;

    mockDataStore.crfApprovals[approvalIndex] = {
      ...mockDataStore.crfApprovals[approvalIndex],
      status: request.status,
      comments: request.comments,
      approvalDate: new Date().toISOString().split('T')[0],
      approverUserId: currentUser?.userId,
      approverName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
    };

    // Update CRF status based on approvals
    const crfId = mockDataStore.crfApprovals[approvalIndex].crfId;
    const allApprovals = mockDataStore.crfApprovals.filter(a => a.crfId === crfId);
    const allApproved = allApprovals.every(a => a.status === 'Approved' || !a.isRequired);
    const anyRejected = allApprovals.some(a => a.status === 'Rejected');

    const crfIndex = mockDataStore.crfs.findIndex(c => c.crfId === crfId);
    if (crfIndex !== -1) {
      if (anyRejected) {
        mockDataStore.crfs[crfIndex].status = 'Rejected';
      } else if (allApproved) {
        mockDataStore.crfs[crfIndex].status = 'Approved';
      }
    }

    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'CRFApproval',
        approvalId,
        `Changed approval status from ${oldStatus} to ${request.status}`,
        { status: oldStatus },
        { status: request.status }
      );
    }

    return true;
  }

  async getCRFLogs(crfId: number, clientId?: number): Promise<DeploymentLogResponse[]> {
    await this.delay();
    let logs = mockDataStore.deploymentLogs.filter(l => l.crfId === crfId);
    if (clientId) {
      logs = logs.filter(l => l.clientId === clientId);
    }
    return logs.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }

  // Workflow APIs
  async getWorkflowSteps(): Promise<WorkflowStepResponse[]> {
    await this.delay();
    return [...mockDataStore.workflowSteps].sort((a, b) => a.stepOrder - b.stepOrder);
  }

  async createWorkflowStep(request: CreateWorkflowStepRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.workflowSteps);

    const newStep: WorkflowStepResponse = {
      workflowStepId: newId,
      stepName: request.stepName,
      stepOrder: request.stepOrder,
      isRequired: request.isRequired,
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
    };

    mockDataStore.workflowSteps.push(newStep);

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'CREATE',
        'WorkflowStep',
        newId,
        `Created workflow step ${request.stepName}`,
        null,
        { stepName: request.stepName, stepOrder: request.stepOrder }
      );
    }

    return newId;
  }

  async updateWorkflowStep(stepId: number, request: UpdateWorkflowStepRequest): Promise<boolean> {
    await this.delay();
    const stepIndex = mockDataStore.workflowSteps.findIndex(s => s.workflowStepId === stepId);
    if (stepIndex === -1) throw new Error('Workflow step not found');

    const oldStep = { ...mockDataStore.workflowSteps[stepIndex] };
    mockDataStore.workflowSteps[stepIndex] = {
      ...mockDataStore.workflowSteps[stepIndex],
      stepName: request.stepName,
      isRequired: request.isRequired,
    };

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'WorkflowStep',
        stepId,
        `Updated workflow step ${oldStep.stepName}`,
        { stepName: oldStep.stepName },
        { stepName: request.stepName }
      );
    }

    return true;
  }

  async deleteWorkflowStep(stepId: number): Promise<boolean> {
    await this.delay();
    const stepIndex = mockDataStore.workflowSteps.findIndex(s => s.workflowStepId === stepId);
    if (stepIndex === -1) throw new Error('Workflow step not found');

    const deletedStep = mockDataStore.workflowSteps[stepIndex];
    mockDataStore.workflowSteps.splice(stepIndex, 1);

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'DELETE',
        'WorkflowStep',
        stepId,
        `Deleted workflow step ${deletedStep.stepName}`
      );
    }

    return true;
  }

  async reorderWorkflowStep(stepId: number, newOrder: number): Promise<boolean> {
    await this.delay();
    const stepIndex = mockDataStore.workflowSteps.findIndex(s => s.workflowStepId === stepId);
    if (stepIndex === -1) throw new Error('Workflow step not found');

    const oldOrder = mockDataStore.workflowSteps[stepIndex].stepOrder;
    mockDataStore.workflowSteps[stepIndex].stepOrder = newOrder;

    // Reorder other steps
    mockDataStore.workflowSteps.forEach(step => {
      if (step.workflowStepId !== stepId) {
        if (newOrder < oldOrder && step.stepOrder >= newOrder && step.stepOrder < oldOrder) {
          step.stepOrder++;
        } else if (newOrder > oldOrder && step.stepOrder <= newOrder && step.stepOrder > oldOrder) {
          step.stepOrder--;
        }
      }
    });

    return true;
  }

  // API Configuration APIs
  async getAllAPIConfigurations(apiType?: string): Promise<APIConfigurationResponse[]> {
    await this.delay();
    let configs = [...mockDataStore.apiConfigurations];
    if (apiType) {
      configs = configs.filter(c => c.apiType === apiType);
    }
    return configs.sort((a, b) => a.executionOrder - b.executionOrder);
  }

  async getAPIConfigurationById(apiConfigurationId: number): Promise<APIConfigurationResponse> {
    await this.delay();
    const config = mockDataStore.apiConfigurations.find(c => c.apiConfigurationId === apiConfigurationId);
    if (!config) throw new Error('API configuration not found');
    return config;
  }

  async createAPIConfiguration(request: CreateAPIConfigurationRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.apiConfigurations);
    const currentUser = this.getStoredUser();

    const newConfig: APIConfigurationResponse = {
      apiConfigurationId: newId,
      apiName: request.apiName,
      apiType: request.apiType,
      httpMethod: request.httpMethod,
      endpointURL: request.endpointURL,
      executionOrder: request.executionOrder,
      headers: request.headers,
      requestBody: request.requestBody,
      timeoutSeconds: request.timeoutSeconds,
      retryCount: request.retryCount,
      isEnabled: request.isEnabled,
      description: request.description,
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.userId,
      createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
    };

    mockDataStore.apiConfigurations.push(newConfig);

    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'CREATE',
        'APIConfiguration',
        newId,
        `Created API configuration ${request.apiName}`,
        null,
        { apiName: request.apiName, apiType: request.apiType }
      );
    }

    return newId;
  }

  async updateAPIConfiguration(apiConfigurationId: number, request: UpdateAPIConfigurationRequest): Promise<boolean> {
    await this.delay();
    const configIndex = mockDataStore.apiConfigurations.findIndex(c => c.apiConfigurationId === apiConfigurationId);
    if (configIndex === -1) throw new Error('API configuration not found');

    const oldConfig = { ...mockDataStore.apiConfigurations[configIndex] };
    mockDataStore.apiConfigurations[configIndex] = {
      ...mockDataStore.apiConfigurations[configIndex],
      apiName: request.apiName,
      httpMethod: request.httpMethod,
      endpointURL: request.endpointURL,
      executionOrder: request.executionOrder,
      headers: request.headers,
      requestBody: request.requestBody,
      timeoutSeconds: request.timeoutSeconds,
      retryCount: request.retryCount,
      isEnabled: request.isEnabled,
      description: request.description,
      updatedDate: new Date().toISOString().split('T')[0],
    };

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'UPDATE',
        'APIConfiguration',
        apiConfigurationId,
        `Updated API configuration ${oldConfig.apiName}`,
        { apiName: oldConfig.apiName },
        { apiName: request.apiName }
      );
    }

    return true;
  }

  async deleteAPIConfiguration(apiConfigurationId: number): Promise<boolean> {
    await this.delay();
    const configIndex = mockDataStore.apiConfigurations.findIndex(c => c.apiConfigurationId === apiConfigurationId);
    if (configIndex === -1) throw new Error('API configuration not found');

    const deletedConfig = mockDataStore.apiConfigurations[configIndex];
    mockDataStore.apiConfigurations.splice(configIndex, 1);

    const currentUser = this.getStoredUser();
    if (currentUser) {
      mockDataStore.createAuditLog(
        currentUser.userId,
        currentUser.username,
        'DELETE',
        'APIConfiguration',
        apiConfigurationId,
        `Deleted API configuration ${deletedConfig.apiName}`
      );
    }

    return true;
  }

  async getAPIExecutionLogs(crfId?: number, clientId?: number): Promise<APIExecutionLogResponse[]> {
    await this.delay();
    let logs = [...mockDataStore.apiExecutionLogs];
    if (crfId) {
      logs = logs.filter(l => l.crfId === crfId);
    }
    if (clientId) {
      logs = logs.filter(l => l.clientId === clientId);
    }
    return logs.sort((a, b) => new Date(b.executionStartTime).getTime() - new Date(a.executionStartTime).getTime());
  }

  // Error Notification APIs
  async getAllErrorNotifications(): Promise<ErrorNotificationResponse[]> {
    await this.delay();
    return [...mockDataStore.errorNotifications].sort((a, b) => 
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  }

  async getErrorNotificationById(errorNotificationId: number): Promise<ErrorNotificationResponse> {
    await this.delay();
    const error = mockDataStore.errorNotifications.find(e => e.errorNotificationId === errorNotificationId);
    if (!error) throw new Error('Error notification not found');
    return error;
  }

  async createErrorNotification(request: CreateErrorNotificationRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.errorNotifications);

    const newError: ErrorNotificationResponse = {
      errorNotificationId: newId,
      crfId: request.crfId,
      clientId: request.clientId,
      errorType: request.errorType,
      errorSource: request.errorSource,
      errorMessage: request.errorMessage,
      stackTrace: request.stackTrace,
      severity: request.severity,
      isResolved: false,
      resolutionNotes: '',
      notificationSent: false,
      createdDate: new Date().toISOString(),
      crfNumber: '',
      clientName: '',
      resolvedByName: '',
    };

    mockDataStore.errorNotifications.push(newError);

    return newId;
  }

  async resolveErrorNotification(errorNotificationId: number, request: ResolveErrorRequest): Promise<boolean> {
    await this.delay();
    const errorIndex = mockDataStore.errorNotifications.findIndex(e => e.errorNotificationId === errorNotificationId);
    if (errorIndex === -1) throw new Error('Error notification not found');

    const currentUser = this.getStoredUser();

    mockDataStore.errorNotifications[errorIndex] = {
      ...mockDataStore.errorNotifications[errorIndex],
      isResolved: true,
      resolvedBy: currentUser?.userId,
      resolvedDate: new Date().toISOString().split('T')[0],
      resolutionNotes: request.resolutionNotes,
      resolvedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
    };

    return true;
  }

  // Deployment Queue APIs
  async getAllDeploymentQueues(): Promise<DeploymentQueueResponse[]> {
    await this.delay();
    return [...mockDataStore.deploymentQueue].sort((a, b) => 
      (a.scheduledStartTime || '').localeCompare(b.scheduledStartTime || '')
    );
  }

  async getDeploymentQueueById(deploymentQueueId: number): Promise<DeploymentQueueResponse> {
    await this.delay();
    const queue = mockDataStore.deploymentQueue.find(q => q.deploymentQueueId === deploymentQueueId);
    if (!queue) throw new Error('Deployment queue not found');
    return queue;
  }

  async queueDeployment(request: QueueDeploymentRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.deploymentQueue);
    const currentUser = this.getStoredUser();
    const crf = mockDataStore.crfs.find(c => c.crfId === request.crfId);
    const client = mockDataStore.clients.find(c => c.clientId === request.clientId);

    const newQueue: DeploymentQueueResponse = {
      deploymentQueueId: newId,
      crfId: request.crfId,
      clientId: request.clientId,
      queuedBy: currentUser?.userId || 1,
      queuedDate: new Date().toISOString().split('T')[0],
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
    };

    mockDataStore.deploymentQueue.push(newQueue);

    return newId;
  }

  async updateDeploymentQueue(deploymentQueueId: number, request: UpdateDeploymentQueueRequest): Promise<boolean> {
    await this.delay();
    const queueIndex = mockDataStore.deploymentQueue.findIndex(q => q.deploymentQueueId === deploymentQueueId);
    if (queueIndex === -1) throw new Error('Deployment queue not found');

    mockDataStore.deploymentQueue[queueIndex] = {
      ...mockDataStore.deploymentQueue[queueIndex],
      scheduledStartTime: request.scheduledStartTime,
      priority: request.priority,
      deploymentType: request.deploymentType,
      notes: request.notes,
    };

    return true;
  }

  async deleteDeploymentQueue(deploymentQueueId: number): Promise<boolean> {
    await this.delay();
    const queueIndex = mockDataStore.deploymentQueue.findIndex(q => q.deploymentQueueId === deploymentQueueId);
    if (queueIndex === -1) throw new Error('Deployment queue not found');

    mockDataStore.deploymentQueue.splice(queueIndex, 1);

    return true;
  }

  async cancelDeploymentQueue(deploymentQueueId: number, notes: string): Promise<boolean> {
    await this.delay();
    const queueIndex = mockDataStore.deploymentQueue.findIndex(q => q.deploymentQueueId === deploymentQueueId);
    if (queueIndex === -1) throw new Error('Deployment queue not found');

    mockDataStore.deploymentQueue[queueIndex].status = 'Cancelled';
    mockDataStore.deploymentQueue[queueIndex].notes = notes;

    return true;
  }

  // Notification APIs
  async getUserNotifications(includeRead: boolean = false, maxResults: number = 50): Promise<NotificationResponse[]> {
    await this.delay();
    const currentUser = this.getStoredUser();
    if (!currentUser) return [];

    let notifications = mockDataStore.notifications.filter(n => n.userId === currentUser.userId);
    if (!includeRead) {
      notifications = notifications.filter(n => !n.isRead);
    }
    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxResults);
  }

  async getUnreadNotificationCount(): Promise<number> {
    await this.delay();
    const currentUser = this.getStoredUser();
    if (!currentUser) return 0;

    return mockDataStore.notifications.filter(n => n.userId === currentUser.userId && !n.isRead).length;
  }

  async createNotification(request: CreateNotificationRequest): Promise<NotificationResponse> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.notifications);

    const newNotification: NotificationResponse = {
      notificationId: newId,
      userId: request.userId,
      title: request.title,
      message: request.message,
      type: request.type,
      priority: request.priority || 'medium',
      isRead: false,
      relatedEntityType: request.relatedEntityType,
      relatedEntityId: request.relatedEntityId,
      actionUrl: request.actionUrl,
      createdAt: new Date().toISOString(),
      expiresAt: request.expiresAt,
    };

    mockDataStore.notifications.push(newNotification);

    return newNotification;
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    await this.delay();
    const notificationIndex = mockDataStore.notifications.findIndex(n => n.notificationId === notificationId);
    if (notificationIndex === -1) throw new Error('Notification not found');

    mockDataStore.notifications[notificationIndex].isRead = true;
    mockDataStore.notifications[notificationIndex].readAt = new Date().toISOString();

    return true;
  }

  async markAllNotificationsAsRead(): Promise<number> {
    await this.delay();
    const currentUser = this.getStoredUser();
    if (!currentUser) return 0;

    let count = 0;
    mockDataStore.notifications.forEach(n => {
      if (n.userId === currentUser.userId && !n.isRead) {
        n.isRead = true;
        n.readAt = new Date().toISOString();
        count++;
      }
    });

    return count;
  }

  async deleteNotification(notificationId: number): Promise<boolean> {
    await this.delay();
    const notificationIndex = mockDataStore.notifications.findIndex(n => n.notificationId === notificationId);
    if (notificationIndex === -1) throw new Error('Notification not found');

    mockDataStore.notifications.splice(notificationIndex, 1);

    return true;
  }

  // Audit Log APIs
  async getAuditLogs(
    pageNumber: number = 1,
    pageSize: number = 50,
    entityType?: string,
    userId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<AuditLogPagedResponse> {
    await this.delay();

    let logs = [...mockDataStore.auditLogs];

    if (entityType) {
      logs = logs.filter(l => l.entityType === entityType);
    }
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    if (startDate) {
      logs = logs.filter(l => l.timestamp >= startDate);
    }
    if (endDate) {
      logs = logs.filter(l => l.timestamp <= endDate);
    }

    const totalCount = logs.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const paginatedLogs = logs.slice(start, end);

    return {
      logs: paginatedLogs,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPrevious: pageNumber > 1,
      hasNext: pageNumber < totalPages,
    };
  }

  async getAuditLogStatistics(startDate?: string, endDate?: string): Promise<AuditLogStatisticsResponse> {
    await this.delay();

    let logs = [...mockDataStore.auditLogs];

    if (startDate) {
      logs = logs.filter(l => l.timestamp >= startDate);
    }
    if (endDate) {
      logs = logs.filter(l => l.timestamp <= endDate);
    }

    const actionsByType: Record<string, number> = {};
    const actionsByEntity: Record<string, number> = {};
    const userActions: Record<number, { username: string; count: number }> = {};

    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      actionsByEntity[log.entityType] = (actionsByEntity[log.entityType] || 0) + 1;

      if (log.userId) {
        if (!userActions[log.userId]) {
          userActions[log.userId] = { username: log.username || '', count: 0 };
        }
        userActions[log.userId].count++;
      }
    });

    const mostActiveUsers = Object.entries(userActions)
      .map(([userId, data]) => ({
        userId: Number(userId),
        username: data.username,
        actionCount: data.count,
      }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    return {
      totalActions: logs.length,
      uniqueUsers: Object.keys(userActions).length,
      actionsByType,
      actionsByEntity,
      mostActiveUsers,
      startDate,
      endDate,
    };
  }

  // Bulk Operations APIs
  async getBulkOperations(
    pageNumber: number = 1,
    pageSize: number = 50,
    operationType?: string
  ): Promise<BulkOperationPagedResponse> {
    await this.delay();

    let operations = [...mockDataStore.bulkOperations];

    if (operationType) {
      operations = operations.filter(o => o.operationType === operationType);
    }

    operations.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime());

    const totalCount = operations.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const paginatedOps = operations.slice(start, end);

    return {
      operations: paginatedOps,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPrevious: pageNumber > 1,
      hasNext: pageNumber < totalPages,
    };
  }

  async getBulkOperationById(bulkOperationId: number): Promise<BulkOperationResponse> {
    await this.delay();
    const operation = mockDataStore.bulkOperations.find(o => o.bulkOperationId === bulkOperationId);
    if (!operation) throw new Error('Bulk operation not found');
    return operation;
  }

  async getBulkOperationStatistics(startDate?: string, endDate?: string): Promise<BulkOperationStatisticsResponse> {
    await this.delay();

    let operations = [...mockDataStore.bulkOperations];

    if (startDate) {
      operations = operations.filter(o => o.initiatedAt >= startDate);
    }
    if (endDate) {
      operations = operations.filter(o => o.initiatedAt <= endDate);
    }

    const operationsByType: Record<string, number> = {};
    let totalItemsProcessed = 0;
    let totalSuccessfulItems = 0;
    let totalFailedItems = 0;

    operations.forEach(op => {
      operationsByType[op.operationType] = (operationsByType[op.operationType] || 0) + 1;
      totalItemsProcessed += op.processedItems;
      totalSuccessfulItems += op.successfulItems;
      totalFailedItems += op.failedItems;
    });

    return {
      totalOperations: operations.length,
      completedOperations: operations.filter(o => o.status === 'Completed').length,
      failedOperations: operations.filter(o => o.status === 'Failed').length,
      inProgressOperations: operations.filter(o => o.status === 'In Progress').length,
      operationsByType,
      totalItemsProcessed,
      totalSuccessfulItems,
      totalFailedItems,
      averageSuccessRate: totalItemsProcessed > 0 ? (totalSuccessfulItems / totalItemsProcessed) * 100 : 0,
      startDate,
      endDate,
    };
  }

  async bulkCreateCRFs(request: BulkCreateCRFsRequest): Promise<number> {
    await this.delay(500);
    const currentUser = this.getStoredUser();
    const newId = mockDataStore.getNextId(mockDataStore.bulkOperations);

    const bulkOp: BulkOperationResponse = {
      bulkOperationId: newId,
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
    };

    mockDataStore.bulkOperations.push(bulkOp);

    // Create each CRF
    const crfIds: number[] = [];
    for (const crfRequest of request.crfs) {
      const crfId = await this.createCRF(crfRequest);
      crfIds.push(crfId);
    }

    bulkOp.resultData = JSON.stringify({ crfIds });

    return newId;
  }

  async bulkUpdateClients(request: BulkUpdateClientsRequest): Promise<number> {
    await this.delay(500);
    const currentUser = this.getStoredUser();
    const newId = mockDataStore.getNextId(mockDataStore.bulkOperations);

    const bulkOp: BulkOperationResponse = {
      bulkOperationId: newId,
      operationType: 'BULK_UPDATE_CLIENTS',
      initiatedBy: currentUser?.userId || 1,
      initiatedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      initiatedAt: new Date().toISOString(),
      status: 'In Progress',
      totalItems: request.clientIds.length,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      inputData: JSON.stringify(request),
    };

    mockDataStore.bulkOperations.push(bulkOp);

    // Simulate processing
    const successful: number[] = [];
    const failed: number[] = [];

    for (const clientId of request.clientIds) {
      try {
        const client = mockDataStore.clients.find(c => c.clientId === clientId);
        if (client) {
          if (request.newVersion) {
            const version = mockDataStore.versions.find(v => v.versionNumber === request.newVersion);
            if (version) {
              await this.updateClientVersion(clientId, { versionId: version.versionId, notes: 'Bulk update' });
            }
          }
          if (request.newStatus) {
            client.status = request.newStatus;
          }
          successful.push(clientId);
          bulkOp.successfulItems++;
        } else {
          failed.push(clientId);
          bulkOp.failedItems++;
        }
        bulkOp.processedItems++;
      } catch {
        failed.push(clientId);
        bulkOp.failedItems++;
        bulkOp.processedItems++;
      }
    }

    bulkOp.status = 'Completed';
    bulkOp.completedAt = new Date().toISOString();
    bulkOp.resultData = JSON.stringify({ successful, failed });

    return newId;
  }

  // Reporting APIs
  async getDeploymentReport(startDate: string, endDate: string): Promise<DeploymentReportResponse> {
    await this.delay(500);

    // Mock deployment report data
    return {
      startDate,
      endDate,
      totalDeployments: 25,
      successfulDeployments: 22,
      failedDeployments: 2,
      pendingDeployments: 1,
      successRate: 88,
      deploymentsByVersion: [
        {
          versionNumber: '3.2.1',
          versionName: 'Winter 2024 Release',
          deploymentCount: 15,
          successCount: 14,
          failedCount: 1,
          successRate: 93.3,
        },
        {
          versionNumber: '3.2.0',
          versionName: 'Fall 2024 Release',
          deploymentCount: 10,
          successCount: 8,
          failedCount: 2,
          successRate: 80,
        },
      ],
      deploymentsByClient: mockDataStore.clients.slice(0, 5).map(client => ({
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
    };
  }

  async getCRFReport(startDate: string, endDate: string): Promise<CRFReportResponse> {
    await this.delay(500);

    const crfs = mockDataStore.crfs.filter(
      crf => crf.createdDate >= startDate && crf.createdDate <= endDate
    );

    return {
      startDate,
      endDate,
      totalCRFs: crfs.length,
      completedCRFs: crfs.filter(c => c.status === 'Completed').length,
      pendingCRFs: crfs.filter(c => c.status === 'Pending').length,
      cancelledCRFs: crfs.filter(c => c.status === 'Cancelled').length,
      completionRate: crfs.length > 0 ? (crfs.filter(c => c.status === 'Completed').length / crfs.length) * 100 : 0,
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
      crfsByVersion: mockDataStore.versions.slice(0, 3).map(v => ({
        versionNumber: v.versionNumber,
        versionName: v.versionName,
        crfCount: Math.floor(Math.random() * 8) + 2,
        completedCount: Math.floor(Math.random() * 6) + 1,
      })),
      approvalPerformance: mockDataStore.workflowSteps.map(step => ({
        stepName: step.stepName,
        totalApprovals: 15,
        approvedCount: 12,
        rejectedCount: 2,
        pendingCount: 1,
        averageApprovalDays: Math.random() * 3 + 0.5,
      })),
    };
  }

  async getClientReport(): Promise<ClientReportResponse> {
    await this.delay(500);

    const activeClients = mockDataStore.clients.filter(c => c.isActive);
    const latestVersion = mockDataStore.versions[0];

    return {
      totalClients: mockDataStore.clients.length,
      activeClients: activeClients.length,
      inactiveClients: mockDataStore.clients.length - activeClients.length,
      versionDistribution: mockDataStore.versions.map(v => ({
        versionNumber: v.versionNumber,
        versionName: v.versionName,
        clientCount: mockDataStore.clients.filter(c => c.currentVersionId === v.versionId).length,
        percentage: (mockDataStore.clients.filter(c => c.currentVersionId === v.versionId).length / mockDataStore.clients.length) * 100,
        isCurrentVersion: v.versionId === latestVersion.versionId,
      })),
      clientsByStatus: [
        { status: 'Active', clientCount: activeClients.length, percentage: (activeClients.length / mockDataStore.clients.length) * 100 },
        { status: 'Inactive', clientCount: mockDataStore.clients.length - activeClients.length, percentage: ((mockDataStore.clients.length - activeClients.length) / mockDataStore.clients.length) * 100 },
      ],
      recentUpdates: mockDataStore.clientVersionHistory.slice(0, 10).map(h => ({
        clientId: h.clientId,
        clientName: mockDataStore.clients.find(c => c.clientId === h.clientId)?.clientName || '',
        fromVersion: mockDataStore.versions.find(v => v.versionId === h.versionId - 1)?.versionNumber || '',
        toVersion: h.versionNumber,
        updateDate: h.assignedDate,
        updatedBy: h.updatedByName,
      })),
      outdatedClients: mockDataStore.clients
        .filter(c => c.currentVersionId !== latestVersion.versionId)
        .map(c => ({
          clientId: c.clientId,
          clientName: c.clientName,
          currentVersion: c.currentVersion,
          latestVersion: latestVersion.versionNumber,
          versionsBehind: latestVersion.versionId - (c.currentVersionId || 0),
          lastUpdateDate: c.lastUpdateDate,
          daysSinceUpdate: c.lastUpdateDate ? Math.floor((Date.now() - new Date(c.lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        })),
    };
  }

  async getSystemPerformanceReport(startDate: string, endDate: string): Promise<SystemPerformanceReportResponse> {
    await this.delay(500);

    const apiLogs = mockDataStore.apiExecutionLogs.filter(
      log => log.executionStartTime >= startDate && log.executionStartTime <= endDate
    );

    const errors = mockDataStore.errorNotifications.filter(
      err => err.createdDate >= startDate && err.createdDate <= endDate
    );

    return {
      startDate,
      endDate,
      totalAPIExecutions: apiLogs.length,
      successfulAPIExecutions: apiLogs.filter(l => l.status === 'Success').length,
      failedAPIExecutions: apiLogs.filter(l => l.status === 'Failed').length,
      apiSuccessRate: apiLogs.length > 0 ? (apiLogs.filter(l => l.status === 'Success').length / apiLogs.length) * 100 : 0,
      averageAPIResponseTime: apiLogs.reduce((sum, log) => sum + (log.durationMs || 0), 0) / apiLogs.length,
      totalErrors: errors.length,
      resolvedErrors: errors.filter(e => e.isResolved).length,
      unresolvedErrors: errors.filter(e => !e.isResolved).length,
      apiPerformanceByType: mockDataStore.apiConfigurations.map(config => {
        const configLogs = apiLogs.filter(l => l.apiConfigurationId === config.apiConfigurationId);
        return {
          apiName: config.apiName,
          apiType: config.apiType,
          executionCount: configLogs.length,
          successCount: configLogs.filter(l => l.status === 'Success').length,
          failureCount: configLogs.filter(l => l.status === 'Failed').length,
          successRate: configLogs.length > 0 ? (configLogs.filter(l => l.status === 'Success').length / configLogs.length) * 100 : 0,
          averageResponseTime: configLogs.reduce((sum, log) => sum + (log.durationMs || 0), 0) / configLogs.length || 0,
          minResponseTime: Math.min(...configLogs.map(l => l.durationMs || 0)) || 0,
          maxResponseTime: Math.max(...configLogs.map(l => l.durationMs || 0)) || 0,
        };
      }),
      errorsByType: Object.entries(
        errors.reduce((acc, err) => {
          acc[err.errorType] = (acc[err.errorType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([errorType, count]) => ({
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
  }

  async getDashboardStatistics(): Promise<DashboardStatisticsResponse> {
    await this.delay(500);

    const latestVersion = mockDataStore.versions[0];
    const activeCRFs = mockDataStore.crfs.filter(c => c.status === 'Pending' || c.status === 'Approved' || c.status === 'In Progress');
    const pendingApprovals = mockDataStore.crfApprovals.filter(a => a.status === 'Pending');
    const unresolvedErrors = mockDataStore.errorNotifications.filter(e => !e.isResolved);
    const today = new Date().toISOString().split('T')[0];

    // Mock dashboard data combining real and generated data
    return {
      systemOverview: {
        totalClients: mockDataStore.clients.length,
        activeCRFs: activeCRFs.length,
        pendingApprovals: pendingApprovals.length,
        deploymentsToday: mockDataStore.deploymentQueue.filter(d => d.queuedDate === today).length,
        failedDeployments: mockDataStore.errorNotifications.filter(e => e.errorType === 'Database Migration Error').length,
        unresolvedErrors: unresolvedErrors.length,
        overallDeploymentSuccessRate: 88.5,
        totalVersions: mockDataStore.versions.length,
        latestVersion: latestVersion.versionNumber,
      },
      recentActivities: mockDataStore.auditLogs.slice(0, 10).map(log => ({
        activityType: log.action,
        description: log.details || '',
        username: log.username || 'System',
        timestamp: log.timestamp,
        entityType: log.entityType,
        entityId: log.entityId,
        severity: 'Info',
      })),
      upcomingDeployments: mockDataStore.crfs
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
        totalCRFsThisMonth: mockDataStore.crfs.filter(c => {
          const createdDate = new Date(c.createdDate);
          const now = new Date();
          return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        }).length,
        completedCRFsThisMonth: mockDataStore.crfs.filter(c => {
          const completedDate = c.completedDate ? new Date(c.completedDate) : null;
          const now = new Date();
          return completedDate && completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
        }).length,
        averageApprovalTime: 2.5,
        averageDeploymentTime: 3.8,
        approvalSuccessRate: 85,
        stepMetrics: mockDataStore.workflowSteps.map(step => ({
          stepName: step.stepName,
          pendingCount: mockDataStore.crfApprovals.filter(a => a.workflowStepId === step.workflowStepId && a.status === 'Pending').length,
          approvedCount: mockDataStore.crfApprovals.filter(a => a.workflowStepId === step.workflowStepId && a.status === 'Approved').length,
          rejectedCount: mockDataStore.crfApprovals.filter(a => a.workflowStepId === step.workflowStepId && a.status === 'Rejected').length,
          averageProcessingDays: Math.random() * 3 + 0.5,
        })),
      },
      versionAdoption: {
        latestVersion: latestVersion.versionNumber,
        clientsOnLatestVersion: mockDataStore.clients.filter(c => c.currentVersionId === latestVersion.versionId).length,
        latestVersionAdoptionRate: (mockDataStore.clients.filter(c => c.currentVersionId === latestVersion.versionId).length / mockDataStore.clients.length) * 100,
        versionUsage: mockDataStore.versions.map(v => ({
          versionNumber: v.versionNumber,
          versionName: v.versionName,
          clientCount: mockDataStore.clients.filter(c => c.currentVersionId === v.versionId).length,
          percentage: (mockDataStore.clients.filter(c => c.currentVersionId === v.versionId).length / mockDataStore.clients.length) * 100,
          isLatest: v.versionId === latestVersion.versionId,
          releaseDate: v.releaseDate,
        })),
      },
    };
  }

  // CRF Template APIs
  async getAllCRFTemplates(): Promise<CRFTemplateResponse[]> {
    await this.delay();
    return [...mockDataStore.crfTemplates];
  }

  async getCRFTemplateById(templateId: number): Promise<CRFTemplateResponse> {
    await this.delay();
    const template = mockDataStore.crfTemplates.find(t => t.crfTemplateId === templateId);
    if (!template) throw new Error('CRF template not found');
    return template;
  }

  async createCRFTemplate(request: CreateCRFTemplateRequest): Promise<number> {
    await this.delay();
    const newId = mockDataStore.getNextId(mockDataStore.crfTemplates);
    const currentUser = this.getStoredUser();

    const newTemplate: CRFTemplateResponse = {
      crfTemplateId: newId,
      templateName: request.templateName,
      description: request.description,
      crfNumberPrefix: request.crfNumberPrefix,
      defaultTitle: request.defaultTitle,
      defaultDescription: request.defaultDescription,
      defaultPriority: request.defaultPriority,
      isActive: true,
      createdBy: currentUser?.userId || 1,
      createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      createdDate: new Date().toISOString().split('T')[0],
      usageCount: 0,
    };

    mockDataStore.crfTemplates.push(newTemplate);

    return newId;
  }

  async updateCRFTemplate(templateId: number, request: UpdateCRFTemplateRequest): Promise<boolean> {
    await this.delay();
    const templateIndex = mockDataStore.crfTemplates.findIndex(t => t.crfTemplateId === templateId);
    if (templateIndex === -1) throw new Error('CRF template not found');

    mockDataStore.crfTemplates[templateIndex] = {
      ...mockDataStore.crfTemplates[templateIndex],
      templateName: request.templateName,
      description: request.description,
      crfNumberPrefix: request.crfNumberPrefix,
      defaultTitle: request.defaultTitle,
      defaultDescription: request.defaultDescription,
      defaultPriority: request.defaultPriority,
      isActive: request.isActive,
      updatedDate: new Date().toISOString().split('T')[0],
    };

    return true;
  }

  async deleteCRFTemplate(templateId: number): Promise<boolean> {
    await this.delay();
    const templateIndex = mockDataStore.crfTemplates.findIndex(t => t.crfTemplateId === templateId);
    if (templateIndex === -1) throw new Error('CRF template not found');

    mockDataStore.crfTemplates.splice(templateIndex, 1);

    return true;
  }

  // System Health APIs
  async getSystemMetrics(): Promise<SystemMetrics> {
    await this.delay(200);

    return {
      cpuUsage: Math.random() * 40 + 20,
      memoryUsage: Math.random() * 30 + 40,
      diskUsage: Math.random() * 20 + 30,
      activeConnections: Math.floor(Math.random() * 50) + 10,
      apiResponseTime: Math.random() * 100 + 50,
      databaseResponseTime: Math.random() * 50 + 20,
      uptime: Math.random() * 100000 + 500000,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getSystemHealth(): Promise<SystemHealthResponse> {
    await this.delay(300);

    const metrics = await this.getSystemMetrics();

    return {
      metrics,
      services: [
        {
          name: 'API Server',
          status: 'healthy',
          responseTime: metrics.apiResponseTime,
          lastCheck: new Date().toISOString(),
          uptime: 99.98,
        },
        {
          name: 'Database',
          status: 'healthy',
          responseTime: metrics.databaseResponseTime,
          lastCheck: new Date().toISOString(),
          uptime: 99.95,
        },
        {
          name: 'Deployment Queue',
          status: 'healthy',
          responseTime: Math.random() * 50 + 20,
          lastCheck: new Date().toISOString(),
          uptime: 99.92,
        },
      ],
      cpuHistory: Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
        value: Math.random() * 40 + 20,
      })),
      memoryHistory: Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
        value: Math.random() * 30 + 40,
      })),
      overallStatus: 'healthy',
    };
  }

  // Advanced Search API
  async advancedSearch(request: AdvancedSearchRequest): Promise<AdvancedSearchResult> {
    await this.delay(400);

    const keyword = request.keyword?.toLowerCase() || '';

    // Search across all entities
    const crfs = mockDataStore.crfs.filter(c => 
      (!keyword || c.crfNumber.toLowerCase().includes(keyword) || c.title.toLowerCase().includes(keyword)) &&
      (!request.status || c.status === request.status)
    ).slice(0, 10).map(c => ({
      crfId: c.crfId,
      crfNumber: c.crfNumber,
      title: c.title,
      description: c.description,
      status: c.status,
      priority: c.priority,
      createdDate: c.createdDate,
      createdBy: c.requestedByName,
      versionNumber: c.versionNumber,
      relevanceScore: 1.0,
    }));

    const clients = mockDataStore.clients.filter(c =>
      !keyword || c.clientName.toLowerCase().includes(keyword) || c.contactEmail.toLowerCase().includes(keyword)
    ).slice(0, 10).map(c => ({
      clientId: c.clientId,
      clientCode: `CLI-${c.clientId}`,
      clientName: c.clientName,
      contactEmail: c.contactEmail,
      contactPerson: c.contactPerson,
      currentVersion: c.currentVersion,
      status: c.status,
      lastUpdated: c.lastUpdateDate,
      relevanceScore: 1.0,
    }));

    const versions = mockDataStore.versions.filter(v =>
      !keyword || v.versionNumber.toLowerCase().includes(keyword) || v.versionName.toLowerCase().includes(keyword)
    ).slice(0, 10).map(v => ({
      versionId: v.versionId,
      versionNumber: v.versionNumber,
      description: v.description,
      releaseDate: v.releaseDate,
      isStable: v.isActive,
      clientCount: v.clientCount,
      status: v.isActive ? 'Active' : 'Inactive',
      relevanceScore: 1.0,
    }));

    const errors = mockDataStore.errorNotifications.filter(e =>
      !keyword || e.errorMessage.toLowerCase().includes(keyword) || e.errorType.toLowerCase().includes(keyword)
    ).slice(0, 10).map(e => ({
      errorId: e.errorNotificationId,
      errorCode: `ERR-${e.errorNotificationId}`,
      errorMessage: e.errorMessage,
      severity: e.severity,
      clientName: e.clientName,
      versionNumber: mockDataStore.crfs.find(c => c.crfId === e.crfId)?.versionNumber,
      occurredAt: e.createdDate,
      isResolved: e.isResolved,
      relevanceScore: 1.0,
    }));

    const deployments = mockDataStore.deploymentQueue.filter(d =>
      !keyword || d.crfNumber.toLowerCase().includes(keyword) || d.clientName.toLowerCase().includes(keyword)
    ).slice(0, 10).map(d => ({
      deploymentId: d.deploymentQueueId,
      crfId: d.crfId,
      crfNumber: d.crfNumber,
      clientName: d.clientName,
      versionNumber: d.versionNumber,
      scheduledDate: d.scheduledStartTime,
      status: d.status,
      priority: d.priority,
      createdDate: d.queuedDate,
      relevanceScore: 1.0,
    }));

    return {
      summary: {
        totalCRFs: crfs.length,
        totalClients: clients.length,
        totalVersions: versions.length,
        totalErrors: errors.length,
        totalDeployments: deployments.length,
        totalResults: crfs.length + clients.length + versions.length + errors.length + deployments.length,
        searchedAt: new Date().toISOString(),
      },
      crfs,
      clients,
      versions,
      errors,
      deployments,
    };
  }
}

export const mockApiClient = new MockApiClient();
