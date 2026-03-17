import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { ClientResponse, CreateClientRequest, UpdateClientRequest, UpdateClientVersionRequest, ClientVersionHistory } from '../../services/api';
import { getStoredUser } from './auth';

export async function getAllClients(): Promise<ApiResult<ClientResponse[]>> {
  return mockApiCall(() => appStore.getAllClients());
}

export async function getClientById(clientId: number): Promise<ApiResult<ClientResponse>> {
  return mockApiCall(() => {
    const client = appStore.getClientById(clientId);
    if (!client) throw new Error('Client not found');
    return client;
  });
}

export async function createClient(request: CreateClientRequest): Promise<ApiResult<number>> {
  if (!request.clientName?.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Client name is required');
  }
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    let currentVersion = '';
    let currentVersionName = '';
    if (request.currentVersionId) {
      const version = appStore.getVersionById(request.currentVersionId);
      if (version) {
        currentVersion = version.versionNumber;
        currentVersionName = version.versionName;
      }
    }

    const client = appStore.createClient({
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
      isActive: true,
      hasCustomizations: request.hasCustomizations || false,
    });

    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'CREATE', 'Client', client.clientId, `Created client ${request.clientName}`, null, { clientName: request.clientName, hasCustomizations: request.hasCustomizations });
    }
    return client.clientId;
  });
}

export async function updateClient(clientId: number, request: UpdateClientRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const old = appStore.getClientById(clientId);
    if (!old) throw new Error('Client not found');
    // Only apply fields that are explicitly provided (not undefined)
    const updates: Record<string, any> = {};
    if (request.clientName !== undefined) updates.clientName = request.clientName;
    if (request.contactEmail !== undefined) updates.contactEmail = request.contactEmail;
    if (request.contactPerson !== undefined) updates.contactPerson = request.contactPerson;
    if (request.phone !== undefined) updates.phone = request.phone;
    if (request.address !== undefined) updates.address = request.address;
    if (request.status !== undefined) updates.status = request.status;
    if (request.isActive !== undefined) updates.isActive = request.isActive;
    if (request.hasCustomizations !== undefined) updates.hasCustomizations = request.hasCustomizations;
    const result = appStore.updateClient(clientId, updates);
    if (!result) throw new Error('Client not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'Client', clientId, `Updated client ${old.clientName}`, { hasCustomizations: old.hasCustomizations }, { hasCustomizations: request.hasCustomizations });
    }
    return true;
  });
}

export async function deleteClient(clientId: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const client = appStore.getClientById(clientId);
    if (!client) throw new Error('Client not found');
    const result = appStore.deleteClient(clientId);
    if (!result) throw new Error('Client not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'DELETE', 'Client', clientId, `Deleted client ${client.clientName}`);
    }
    return true;
  });
}

export async function updateClientVersion(clientId: number, request: UpdateClientVersionRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const client = appStore.getClientById(clientId);
    if (!client) throw new Error('Client not found');
    const version = appStore.getVersionById(request.versionId);
    if (!version) throw new Error('Version not found');

    const currentUser = getStoredUser();
    const oldVersion = client.currentVersion;
    const result = appStore.updateClientVersion(
      clientId,
      request.versionId,
      request.notes,
      currentUser?.userId || 1,
      currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System'
    );
    if (!result) throw new Error('Failed to update client version');

    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'Client', clientId, `Updated client version from ${oldVersion} to ${version.versionNumber}`, { version: oldVersion }, { version: version.versionNumber });
    }
    return true;
  });
}

export async function getClientVersionHistory(clientId: number): Promise<ApiResult<ClientVersionHistory[]>> {
  return mockApiCall(() => appStore.getClientVersionHistory(clientId));
}