import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { APIConfigurationResponse, CreateAPIConfigurationRequest, UpdateAPIConfigurationRequest, APIExecutionLogResponse } from '../../services/api';
import { getStoredUser } from './auth';

export async function getAllAPIConfigurations(apiType?: string): Promise<ApiResult<APIConfigurationResponse[]>> {
  return mockApiCall(() => appStore.getAllAPIConfigurations(apiType));
}

export async function getAPIConfigurationById(id: number): Promise<ApiResult<APIConfigurationResponse>> {
  return mockApiCall(() => {
    const config = appStore.getAPIConfigurationById(id);
    if (!config) throw new Error('API configuration not found');
    return config;
  });
}

export async function createAPIConfiguration(request: CreateAPIConfigurationRequest): Promise<ApiResult<number>> {
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const config = appStore.createAPIConfiguration({
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
      createdBy: currentUser?.userId,
      createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
    });
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'CREATE', 'APIConfiguration', config.apiConfigurationId, `Created API configuration ${request.apiName}`, null, { apiName: request.apiName, apiType: request.apiType });
    }
    return config.apiConfigurationId;
  });
}

export async function updateAPIConfiguration(id: number, request: UpdateAPIConfigurationRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const old = appStore.getAPIConfigurationById(id);
    if (!old) throw new Error('API configuration not found');
    const result = appStore.updateAPIConfiguration(id, {
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
    });
    if (!result) throw new Error('API configuration not found');
    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'APIConfiguration', id, `Updated API configuration ${old.apiName}`, { apiName: old.apiName }, { apiName: request.apiName });
    }
    return true;
  });
}

export async function deleteAPIConfiguration(id: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const config = appStore.getAPIConfigurationById(id);
    if (!config) throw new Error('API configuration not found');
    const result = appStore.deleteAPIConfiguration(id);
    if (!result) throw new Error('API configuration not found');
    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'DELETE', 'APIConfiguration', id, `Deleted API configuration ${config.apiName}`);
    }
    return true;
  });
}

export async function getAPIExecutionLogs(crfId?: number, apiConfigId?: number): Promise<ApiResult<APIExecutionLogResponse[]>> {
  return mockApiCall(() => appStore.getAPIExecutionLogs(crfId, apiConfigId));
}
