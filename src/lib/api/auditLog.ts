import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { AuditLogResponse, AuditLogPagedResponse, AuditLogStatisticsResponse } from '../../services/api';

export async function getAuditLogs(page: number = 1, pageSize: number = 20, filters?: { action?: string; entityType?: string; userId?: number; startDate?: string; endDate?: string }): Promise<ApiResult<AuditLogPagedResponse>> {
  return mockApiCall(() => {
    const { logs, totalCount } = appStore.getAuditLogsPaged(page, pageSize, filters);
    const totalPages = Math.ceil(totalCount / pageSize);
    return {
      logs,
      totalCount,
      pageNumber: page,
      pageSize,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
    };
  });
}

export async function getAuditLogStatistics(startDate?: string, endDate?: string): Promise<ApiResult<AuditLogStatisticsResponse>> {
  return mockApiCall(() => {
    const allLogs = appStore.getAllAuditLogs();
    let filtered = allLogs;
    if (startDate) filtered = filtered.filter(l => l.timestamp >= startDate);
    if (endDate) filtered = filtered.filter(l => l.timestamp <= endDate);

    const actionsByType: Record<string, number> = {};
    const actionsByEntity: Record<string, number> = {};
    const userActionCounts: Record<number, { username: string; count: number }> = {};

    filtered.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      actionsByEntity[log.entityType] = (actionsByEntity[log.entityType] || 0) + 1;
      if (log.userId) {
        if (!userActionCounts[log.userId]) {
          userActionCounts[log.userId] = { username: log.username || '', count: 0 };
        }
        userActionCounts[log.userId].count++;
      }
    });

    const uniqueUserIds = new Set(filtered.filter(l => l.userId).map(l => l.userId!));
    const mostActiveUsers = Object.entries(userActionCounts)
      .map(([userId, { username, count }]) => ({ userId: parseInt(userId), username, actionCount: count }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    return {
      totalActions: filtered.length,
      uniqueUsers: uniqueUserIds.size,
      actionsByType,
      actionsByEntity,
      mostActiveUsers,
      startDate,
      endDate,
    };
  });
}
