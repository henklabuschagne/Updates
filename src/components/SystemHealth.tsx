import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import apiClient from '../services/api';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  apiResponseTime: number;
  databaseResponseTime: number;
  uptime: number;
  lastUpdated: string;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  uptime: number;
}

export function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    activeConnections: 0,
    apiResponseTime: 0,
    databaseResponseTime: 0,
    uptime: 0,
    lastUpdated: new Date().toISOString()
  });

  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [cpuHistory, setCpuHistory] = useState<any[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemHealth();
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadSystemHealth();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadSystemHealth = async () => {
    setLoading(true);
    
    try {
      // Load real system health data from API
      const healthData = await apiClient.getSystemHealth();
      
      setMetrics(healthData.metrics);
      setServices(healthData.services);

      // Update history charts
      const timestamp = new Date().toLocaleTimeString();
      setCpuHistory(prev => {
        const updated = [...prev, { time: timestamp, value: healthData.metrics.cpuUsage }];
        return updated.slice(-20); // Keep last 20 data points
      });

      setMemoryHistory(prev => {
        const updated = [...prev, { time: timestamp, value: healthData.metrics.memoryUsage }];
        return updated.slice(-20);
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load system health:', error);
      toast.error('Failed to load system health data');
      setLoading(false);
    }
  };

  const manualRefresh = () => {
    toast.success('Refreshing system health...');
    loadSystemHealth();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'down':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600';
    if (usage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const degradedServices = services.filter(s => s.status === 'degraded').length;
  const downServices = services.filter(s => s.status === 'down').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">System Health</h1>
          <p className="text-gray-600">Real-time system performance and service status monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Activity className={`h-4 w-4 ${autoRefresh ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm">Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="ml-2 text-xs text-blue-600 hover:underline"
            >
              {autoRefresh ? 'Disable' : 'Enable'}
            </button>
          </div>
          <Button onClick={manualRefresh} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`text-2xl ${getUsageColor(metrics.cpuUsage)}`}>
                {metrics.cpuUsage.toFixed(1)}%
              </div>
            </div>
            <div className="text-sm text-muted-foreground">CPU Usage</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
              <div className={`text-2xl ${getUsageColor(metrics.memoryUsage)}`}>
                {metrics.memoryUsage.toFixed(1)}%
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Memory Usage</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Database className="h-6 w-6 text-orange-600" />
              </div>
              <div className={`text-2xl ${getUsageColor(metrics.diskUsage)}`}>
                {metrics.diskUsage.toFixed(1)}%
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Disk Usage</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl text-green-600">
                {metrics.activeConnections}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Active Connections</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Trend</CardTitle>
            <CardDescription>Last 20 data points (5-second intervals)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage Trend</CardTitle>
            <CardDescription>Last 20 data points (5-second intervals)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memoryHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#a855f7" fill="#d8b4fe" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Response Times */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">API Response Time</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl text-gray-900">{metrics.apiResponseTime.toFixed(0)}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Database Response Time</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl text-gray-900">{metrics.databaseResponseTime.toFixed(0)}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">System Uptime</div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl text-green-600">{formatUptime(metrics.uptime)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                {healthyServices} healthy, {degradedServices} degraded, {downServices} down
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-green-100 text-green-800">
                {healthyServices} Healthy
              </Badge>
              {degradedServices > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {degradedServices} Degraded
                </Badge>
              )}
              {downServices > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {downServices} Down
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(service.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{service.name}</span>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Response: {service.responseTime.toFixed(0)}ms</span>
                      <span>Uptime: {formatUptime(service.uptime)}</span>
                      <span>Last check: {new Date(service.lastCheck).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      service.status === 'healthy' ? 'bg-green-600' :
                      service.status === 'degraded' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${service.uptime}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}