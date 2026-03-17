import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { LoginRequest, LoginResponse, UserDto } from '../../services/api';

export async function login(request: LoginRequest): Promise<ApiResult<LoginResponse>> {
  return mockApiCall(() => {
    const user = appStore.userDtos.find(
      u => u.username.toLowerCase() === request.username.toLowerCase()
    );
    if (!user) throw new Error('Invalid username or password');

    const token = `mock_token_${Date.now()}_${user.userId}`;
    const refreshToken = `mock_refresh_${Date.now()}_${user.userId}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    localStorage.setItem('mock_auth_token', token);
    localStorage.setItem('mock_auth_user', JSON.stringify(user));

    return { token, refreshToken, expiresAt, user };
  }, 'Login failed');
}

export async function logout(): Promise<ApiResult<void>> {
  return mockApiCall(() => {
    localStorage.removeItem('mock_auth_token');
    localStorage.removeItem('mock_auth_user');
  });
}

export async function getCurrentUser(): Promise<ApiResult<UserDto>> {
  return mockApiCall(() => {
    const userStr = localStorage.getItem('mock_auth_user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch { /* fall through */ }
    }
    throw new Error('Not authenticated');
  });
}

export function isAuthenticated(): boolean {
  return localStorage.getItem('mock_auth_token') !== null;
}

export function getStoredUser(): UserDto | null {
  const userStr = localStorage.getItem('mock_auth_user');
  if (userStr) {
    try { return JSON.parse(userStr); } catch { return null; }
  }
  return null;
}
