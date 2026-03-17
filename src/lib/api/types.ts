/**
 * API Response Envelope Types
 * 
 * All API functions return ApiResult<T> — never throw, never return raw data.
 */

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
