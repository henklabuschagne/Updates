import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type {
  CRFResponse, CreateCRFRequest, UpdateCRFRequest,
  CRFClientResponse, CRFApprovalResponse, UpdateApprovalRequest,
  DeploymentLogResponse,
} from '../../services/api';
import { getStoredUser } from './auth';

export async function getAllCRFs(status?: string): Promise<ApiResult<CRFResponse[]>> {
  return mockApiCall(() => appStore.getAllCRFs(status));
}

export async function getCRFById(crfId: number): Promise<ApiResult<CRFResponse>> {
  return mockApiCall(() => {
    const crf = appStore.getCRFById(crfId);
    if (!crf) throw new Error('CRF not found');
    return crf;
  });
}

export async function createCRF(request: CreateCRFRequest): Promise<ApiResult<number>> {
  if (!request.crfNumber?.trim()) {
    return errorResponse('VALIDATION_ERROR', 'CRF number is required');
  }
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const version = appStore.getVersionById(request.versionId);

    const crf = appStore.createCRF({
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
      clientCount: request.clientIds.length,
    });

    // Create CRF-Client associations
    request.clientIds.forEach(clientId => {
      const client = appStore.getClientById(clientId);
      if (client) {
        appStore.addCRFClient({
          crfClientId: 0,
          crfId: crf.crfId,
          clientId,
          clientName: client.clientName,
          contactEmail: client.contactEmail,
          currentVersion: client.currentVersion,
          currentVersionName: client.currentVersionName,
          deploymentStatus: 'Pending',
          deploymentNotes: '',
        });
      }
    });

    // Create initial approval records
    const steps = appStore.getActiveWorkflowSteps();
    steps.forEach(step => {
      appStore.addCRFApproval({
        crfApprovalId: 0,
        crfId: crf.crfId,
        workflowStepId: step.workflowStepId,
        stepName: step.stepName,
        stepOrder: step.stepOrder,
        approverUserId: step.stepOrder === 1 ? currentUser?.userId : undefined,
        approverName: step.stepOrder === 1 ? (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System') : 'Pending',
        status: step.stepOrder === 1 ? 'Approved' : 'Pending',
        approvalDate: step.stepOrder === 1 ? new Date().toISOString().split('T')[0] : undefined,
        comments: step.stepOrder === 1 ? 'CRF created' : '',
        createdDate: new Date().toISOString().split('T')[0],
      });
    });

    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'CREATE', 'CRF', crf.crfId, `Created CRF ${request.crfNumber}`, null, { crfNumber: request.crfNumber, title: request.title });
    }
    return crf.crfId;
  });
}

export async function updateCRF(crfId: number, request: UpdateCRFRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const old = appStore.getCRFById(crfId);
    if (!old) throw new Error('CRF not found');
    const result = appStore.updateCRF(crfId, {
      title: request.title,
      description: request.description,
      priority: request.priority,
      scheduledDeploymentDate: request.scheduledDeploymentDate,
    });
    if (!result) throw new Error('CRF not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'CRF', crfId, `Updated CRF ${old.crfNumber}`, { title: old.title }, { title: request.title });
    }
    return true;
  });
}

export async function updateCRFStatus(crfId: number, status: string): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const old = appStore.getCRFById(crfId);
    if (!old) throw new Error('CRF not found');
    const updates: Partial<CRFResponse> = { status };
    if (status === 'Completed') {
      updates.completedDate = new Date().toISOString().split('T')[0];
      updates.actualDeploymentDate = new Date().toISOString().split('T')[0];
    }
    const result = appStore.updateCRF(crfId, updates);
    if (!result) throw new Error('CRF not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'CRF', crfId, `Changed CRF status from ${old.status} to ${status}`, { status: old.status }, { status });
    }
    return true;
  });
}

export async function deleteCRF(crfId: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const crf = appStore.getCRFById(crfId);
    if (!crf) throw new Error('CRF not found');
    const result = appStore.deleteCRF(crfId);
    if (!result) throw new Error('CRF not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'DELETE', 'CRF', crfId, `Deleted CRF ${crf.crfNumber}`);
    }
    return true;
  });
}

export async function getCRFClients(crfId: number): Promise<ApiResult<CRFClientResponse[]>> {
  return mockApiCall(() => appStore.getCRFClients(crfId));
}

export async function getCRFApprovals(crfId: number): Promise<ApiResult<CRFApprovalResponse[]>> {
  return mockApiCall(() => appStore.getCRFApprovals(crfId));
}

export async function updateCRFApproval(approvalId: number, request: UpdateApprovalRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const allApprovals = appStore.getAllCRFApprovals();
    const approval = allApprovals.find(a => a.crfApprovalId === approvalId);
    if (!approval) throw new Error('Approval not found');

    const oldStatus = approval.status;
    appStore.updateCRFApproval(approvalId, {
      status: request.status,
      comments: request.comments,
      approvalDate: new Date().toISOString().split('T')[0],
      approverUserId: currentUser?.userId,
      approverName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
    });

    // Update CRF status based on approvals
    const crfApprovals = appStore.getCRFApprovals(approval.crfId);
    const allApproved = crfApprovals.every(a => a.status === 'Approved');
    const anyRejected = crfApprovals.some(a => a.status === 'Rejected');

    if (anyRejected) {
      appStore.updateCRF(approval.crfId, { status: 'Rejected' });
    } else if (allApproved) {
      appStore.updateCRF(approval.crfId, { status: 'Approved' });
    }

    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'CRFApproval', approvalId, `Changed approval status from ${oldStatus} to ${request.status}`, { status: oldStatus }, { status: request.status });
    }
    return true;
  });
}

export async function getCRFLogs(crfId: number, clientId?: number): Promise<ApiResult<DeploymentLogResponse[]>> {
  return mockApiCall(() => appStore.getDeploymentLogs(crfId, clientId));
}

export async function getAllDeploymentLogs(): Promise<ApiResult<DeploymentLogResponse[]>> {
  return mockApiCall(() => appStore.getAllDeploymentLogs());
}
