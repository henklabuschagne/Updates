import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { SystemMetrics, SystemHealthResponse } from '../../services/api';

export async function getSystemMetrics(): Promise<ApiResult<SystemMetrics>> {
  return mockApiCall(() => ({
    cpuUsage: Math.random() * 40 + 20,
    memoryUsage: Math.random() * 30 + 40,
    diskUsage: Math.random() * 20 + 30,
    activeConnections: Math.floor(Math.random() * 50) + 10,
    apiResponseTime: Math.random() * 100 + 50,
    databaseResponseTime: Math.random() * 50 + 20,
    uptime: Math.random() * 100000 + 500000,
    lastUpdated: new Date().toISOString(),
  }));
}

export async function getSystemHealth(): Promise<ApiResult<SystemHealthResponse>> {
  return mockApiCall(() => {
    const metrics = {
      cpuUsage: Math.random() * 40 + 20,
      memoryUsage: Math.random() * 30 + 40,
      diskUsage: Math.random() * 20 + 30,
      activeConnections: Math.floor(Math.random() * 50) + 10,
      apiResponseTime: Math.random() * 100 + 50,
      databaseResponseTime: Math.random() * 50 + 20,
      uptime: Math.random() * 100000 + 500000,
      lastUpdated: new Date().toISOString(),
    };
    return {
      metrics,
      services: [
        { name: 'API Server', status: 'healthy' as const, responseTime: metrics.apiResponseTime, lastCheck: new Date().toISOString(), uptime: 99.98 },
        { name: 'Database', status: 'healthy' as const, responseTime: metrics.databaseResponseTime, lastCheck: new Date().toISOString(), uptime: 99.95 },
        { name: 'Deployment Queue', status: 'healthy' as const, responseTime: Math.random() * 50 + 20, lastCheck: new Date().toISOString(), uptime: 99.92 },
      ],
      cpuHistory: Array.from({ length: 20 }, (_, i) => ({ timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(), value: Math.random() * 40 + 20 })),
      memoryHistory: Array.from({ length: 20 }, (_, i) => ({ timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(), value: Math.random() * 30 + 40 })),
      overallStatus: 'healthy',
    };
  });
}
