import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { UserResponse, CreateUserRequest, UpdateUserRequest, RoleDto } from '../../services/api';
import { getStoredUser } from './auth';

export async function getAllUsers(): Promise<ApiResult<UserResponse[]>> {
  return mockApiCall(() => appStore.getAllUsers());
}

export async function getUserById(userId: number): Promise<ApiResult<UserResponse>> {
  return mockApiCall(() => {
    const user = appStore.getUserById(userId);
    if (!user) throw new Error('User not found');
    return user;
  });
}

export async function createUser(request: CreateUserRequest): Promise<ApiResult<number>> {
  if (!request.username?.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Username is required');
  }
  return mockApiCall(() => {
    const role = appStore.getRoleById(request.roleId);
    const user = appStore.createUser({
      username: request.username,
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      company: request.company,
      roles: role?.roleName || 'Client',
      isActive: true,
    });

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'CREATE', 'User', user.userId, `Created user ${request.username}`, null, { username: request.username });
    }
    return user.userId;
  });
}

export async function updateUser(userId: number, request: UpdateUserRequest): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const oldUser = appStore.getUserById(userId);
    if (!oldUser) throw new Error('User not found');
    const result = appStore.updateUser(userId, {
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      company: request.company,
      isActive: request.isActive,
    });
    if (!result) throw new Error('User not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'UPDATE', 'User', userId, `Updated user ${oldUser.username}`, { email: oldUser.email, isActive: oldUser.isActive }, { email: request.email, isActive: request.isActive });
    }
    return true;
  });
}

export async function deleteUser(userId: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const user = appStore.getUserById(userId);
    if (!user) throw new Error('User not found');
    const result = appStore.deleteUser(userId);
    if (!result) throw new Error('User not found');

    const currentUser = getStoredUser();
    if (currentUser) {
      appStore.createAuditLogEntry(currentUser.userId, currentUser.username, 'DELETE', 'User', userId, `Deleted user ${user.username}`);
    }
    return true;
  });
}

// Roles
export async function getAllRoles(): Promise<ApiResult<RoleDto[]>> {
  return mockApiCall(() => appStore.getAllRoles());
}

export async function getRoleById(roleId: number): Promise<ApiResult<RoleDto>> {
  return mockApiCall(() => {
    const role = appStore.getRoleById(roleId);
    if (!role) throw new Error('Role not found');
    return role;
  });
}
