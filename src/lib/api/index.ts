/**
 * Mock API Layer - Barrel Export
 * 
 * All API functions are organized by domain.
 * Every function is async, returns ApiResult<T>, and routes through appStore.
 */

import * as auth from './auth';
import * as users from './users';
import * as versions from './versions';
import * as clients from './clients';
import * as crfs from './crfs';
import * as workflow from './workflow';
import * as apiConfig from './apiConfig';
import * as errors from './errors';
import * as deployments from './deployments';
import * as notifications from './notifications';
import * as auditLog from './auditLog';
import * as bulkOps from './bulkOps';
import * as reporting from './reporting';
import * as systemHealth from './systemHealth';
import * as search from './search';
import * as templates from './templates';

export const api = {
  auth,
  users,
  versions,
  clients,
  crfs,
  workflow,
  apiConfig,
  errors,
  deployments,
  notifications,
  auditLog,
  bulkOps,
  reporting,
  systemHealth,
  search,
  templates,
};

export type { ApiResult, ApiError, PaginatedResult } from './types';
export { apiConfig as apiConfiguration } from './config';
