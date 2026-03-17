import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { CRFTemplateResponse, CreateCRFTemplateRequest, UpdateCRFTemplateRequest } from '../../services/api';
import { getStoredUser } from './auth';

export async function getAllCRFTemplates(): Promise<ApiResult<CRFTemplateResponse[]>> {
  return mockApiCall(() => appStore.getAllCRFTemplates());
}

export async function getCRFTemplateById(templateId: number): Promise<ApiResult<CRFTemplateResponse>> {
  return mockApiCall(() => {
    const t = appStore.getCRFTemplateById(templateId);
    if (!t) throw new Error('CRF template not found');
    return t;
  });
}

export async function createCRFTemplate(request: CreateCRFTemplateRequest): Promise<ApiResult<number>> {
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const t = appStore.createCRFTemplate({
      templateName: request.templateName,
      description: request.description,
      crfNumberPrefix: request.crfNumberPrefix,
      defaultTitle: request.defaultTitle,
      defaultDescription: request.defaultDescription,
      defaultPriority: request.defaultPriority,
      isActive: true,
      createdBy: currentUser?.userId || 1,
      createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
    });
    return t.crfTemplateId;
  });
}

export async function updateCRFTemplate(templateId: number, request: UpdateCRFTemplateRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.updateCRFTemplate(templateId, {
      templateName: request.templateName,
      description: request.description,
      crfNumberPrefix: request.crfNumberPrefix,
      defaultTitle: request.defaultTitle,
      defaultDescription: request.defaultDescription,
      defaultPriority: request.defaultPriority,
      isActive: request.isActive,
    });
    if (!result) throw new Error('CRF template not found');
    return true;
  });
}

export async function deleteCRFTemplate(templateId: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.deleteCRFTemplate(templateId);
    if (!result) throw new Error('CRF template not found');
    return true;
  });
}
