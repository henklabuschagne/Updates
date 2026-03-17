import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { WorkflowStepResponse, CreateWorkflowStepRequest, UpdateWorkflowStepRequest } from '../../services/api';
import { getStoredUser } from './auth';

export async function getWorkflowSteps(): Promise<ApiResult<WorkflowStepResponse[]>> {
  return mockApiCall(() => appStore.getWorkflowSteps());
}

export async function createWorkflowStep(request: CreateWorkflowStepRequest): Promise<ApiResult<number>> {
  return mockApiCall(() => {
    const step = appStore.createWorkflowStep({
      stepName: request.stepName,
      stepOrder: request.stepOrder,
      isRequired: request.isRequired,
      isActive: true,
    });
    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'CREATE', 'WorkflowStep', step.workflowStepId, `Created workflow step ${request.stepName}`, null, { stepName: request.stepName, stepOrder: request.stepOrder });
    }
    return step.workflowStepId;
  });
}

export async function updateWorkflowStep(stepId: number, request: UpdateWorkflowStepRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const old = appStore.getWorkflowSteps().find(s => s.workflowStepId === stepId);
    if (!old) throw new Error('Workflow step not found');
    const result = appStore.updateWorkflowStep(stepId, { stepName: request.stepName, isRequired: request.isRequired });
    if (!result) throw new Error('Workflow step not found');
    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'WorkflowStep', stepId, `Updated workflow step ${old.stepName}`, { stepName: old.stepName }, { stepName: request.stepName });
    }
    return true;
  });
}

export async function deleteWorkflowStep(stepId: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const step = appStore.getWorkflowSteps().find(s => s.workflowStepId === stepId);
    if (!step) throw new Error('Workflow step not found');
    const result = appStore.deleteWorkflowStep(stepId);
    if (!result) throw new Error('Workflow step not found');
    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'DELETE', 'WorkflowStep', stepId, `Deleted workflow step ${step.stepName}`);
    }
    return true;
  });
}

export async function reorderWorkflowStep(stepId: number, newOrder: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.reorderWorkflowStep(stepId, newOrder);
    if (!result) throw new Error('Workflow step not found');
    return true;
  });
}
