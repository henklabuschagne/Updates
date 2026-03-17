import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { VersionResponse, CreateVersionRequest, UpdateVersionRequest } from '../../services/api';
import { getStoredUser } from './auth';

export async function getAllVersions(): Promise<ApiResult<VersionResponse[]>> {
  return mockApiCall(() => appStore.getAllVersions());
}

export async function getVersionById(versionId: number): Promise<ApiResult<VersionResponse>> {
  return mockApiCall(() => {
    const version = appStore.getVersionById(versionId);
    if (!version) throw new Error('Version not found');
    return version;
  });
}

export async function createVersion(request: CreateVersionRequest): Promise<ApiResult<number>> {
  if (!request.versionNumber?.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Version number is required');
  }
  return mockApiCall(() => {
    const currentUser = getStoredUser();
    const version = appStore.createVersion({
      versionNumber: request.versionNumber,
      versionName: request.versionName,
      releaseDate: request.releaseDate,
      description: request.description,
      releaseNotes: request.releaseNotes,
      isMajorRelease: request.isMajorRelease,
      isActive: true,
      createdBy: currentUser?.userId || 1,
      createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
    });

    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'CREATE', 'Version', version.versionId, `Created version ${request.versionNumber}`, null, { versionNumber: request.versionNumber, versionName: request.versionName });
    }
    return version.versionId;
  });
}

export async function updateVersion(versionId: number, request: UpdateVersionRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const old = appStore.getVersionById(versionId);
    if (!old) throw new Error('Version not found');
    const result = appStore.updateVersion(versionId, {
      versionNumber: request.versionNumber,
      versionName: request.versionName,
      releaseDate: request.releaseDate,
      description: request.description,
      releaseNotes: request.releaseNotes,
      isMajorRelease: request.isMajorRelease,
      isActive: request.isActive,
    });
    if (!result) throw new Error('Version not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'Version', versionId, `Updated version ${old.versionNumber}`, { versionNumber: old.versionNumber }, { versionNumber: request.versionNumber });
    }
    return true;
  });
}

export async function deleteVersion(versionId: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const version = appStore.getVersionById(versionId);
    if (!version) throw new Error('Version not found');
    const result = appStore.deleteVersion(versionId);
    if (!result) throw new Error('Version not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'DELETE', 'Version', versionId, `Deleted version ${version.versionNumber}`);
    }
    return true;
  });
}
