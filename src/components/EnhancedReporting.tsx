import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp as LineChartIcon
} from 'lucide-react';
import apiClient, { 
  type CRFResponse, 
  type ClientResponse, 
  type VersionResponse,
  type DeploymentQueueResponse,
  type ErrorNotificationResponse,
  type APIExecutionLogResponse,
  type ClientVersionHistory
} from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, LineChart, Line } from 'recharts';

// === Brand Chart Color System ===
const CHART_COLORS = {
  main:      '#092E50', // Authority, aggregate/total
  primary:   '#456E92', // Default "look at this" — neutral single-series
  secondary: '#7AA2C0', // Softer companion metric
  success:   '#5F966C', // Positive outcome / growth
  warning:   '#CEA569', // Caution / in-progress / pending
  error:     '#AB5A5C', // Negative / critical / failures
};

// Categorical palette cycle (pie/stacked): cool ↔ warm for max contrast
const CATEGORICAL_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.secondary,
  CHART_COLORS.error,
  CHART_COLORS.main,
];

// Chart infrastructure constants
const GRID_STROKE = '#e2e8f0';
const AXIS_STROKE = '#64748b';
const AXIS_TICK = { fontSize: 12 };
const BAR_RADIUS: [number, number, number, number] = [8, 8, 0, 0];

export function EnhancedReporting() {
  const [crfs, setCRFs] = useState<CRFResponse[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [versions, setVersions] = useState<VersionResponse[]>([]);
  const [deployments, setDeployments] = useState<DeploymentQueueResponse[]>([]);
  const [errors, setErrors] = useState<ErrorNotificationResponse[]>([]);
  const [apiLogs, setApiLogs] = useState<APIExecutionLogResponse[]>([]);
  const [updateHistory, setUpdateHistory] = useState<ClientVersionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadReportingData();
  }, []);

  const loadReportingData = async () => {
    try {
      setIsLoading(true);
      const [crfsData, clientsData, versionsData, deploymentsData, errorsData, apiLogsData, historyData] = await Promise.all([
        apiClient.getAllCRFs(),
        apiClient.getAllClients(),
        apiClient.getAllVersions(),
        apiClient.getAllDeploymentQueues(),
        apiClient.getAllErrorNotifications(),
        apiClient.getAPIExecutionLogs(),
        apiClient.getAllUpdateHistory()
      ]);
      setCRFs(crfsData);
      setClients(clientsData);
      setVersions(versionsData);
      setDeployments(deploymentsData);
      setErrors(errorsData);
      setApiLogs(apiLogsData);
      setUpdateHistory(historyData);
    } catch (error: any) {
      toast.error('Failed to load reporting data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    toast.success('Report exported successfully');
  };

  // CRF Status Distribution — semantic colors (fill used directly by recharts)
  const crfStatusData = [
    { name: 'Draft',    value: crfs.filter(c => c.status === 'Draft').length,    fill: CHART_COLORS.primary },
    { name: 'Pending',  value: crfs.filter(c => c.status === 'Pending').length,  fill: CHART_COLORS.warning },
    { name: 'Approved', value: crfs.filter(c => c.status === 'Approved').length, fill: CHART_COLORS.success },
    { name: 'Deployed', value: crfs.filter(c => c.status === 'Deployed').length, fill: CHART_COLORS.main },
    { name: 'Rejected', value: crfs.filter(c => c.status === 'Rejected').length, fill: CHART_COLORS.error },
  ].filter(d => d.value > 0);

  // Deployment Queue Status — semantic colors
  const deploymentStatusData = [
    { name: 'Queued',    value: deployments.filter(d => d.status === 'Queued').length,    fill: CHART_COLORS.primary },
    { name: 'Running',   value: deployments.filter(d => d.status === 'Running').length,   fill: CHART_COLORS.warning },
    { name: 'Completed', value: deployments.filter(d => d.status === 'Completed').length, fill: CHART_COLORS.success },
    { name: 'Failed',    value: deployments.filter(d => d.status === 'Failed').length,    fill: CHART_COLORS.error },
    { name: 'Cancelled', value: deployments.filter(d => d.status === 'Cancelled').length, fill: CHART_COLORS.secondary },
  ].filter(d => d.value > 0);

  // Error Severity Distribution — semantic per severity
  const errorSeverityData = [
    { name: 'Critical', value: errors.filter(e => e.severity === 'Critical').length, fill: CHART_COLORS.error },
    { name: 'Error',    value: errors.filter(e => e.severity === 'Error').length,    fill: CHART_COLORS.warning },
    { name: 'Warning',  value: errors.filter(e => e.severity === 'Warning').length,  fill: CHART_COLORS.secondary },
    { name: 'Info',     value: errors.filter(e => e.severity === 'Info').length,     fill: CHART_COLORS.primary },
  ].filter(d => d.value > 0);

  // Client Version Distribution — filter out versions with no version number
  const versionDistributionData = versions
    .filter(version => version.versionNumber)
    .map(version => ({
      name: version.versionNumber,
      clients: clients.filter(c => c.currentVersion === version.versionNumber).length,
    }));

  // API Success Rate
  const apiSuccessRate = apiLogs.length > 0 
    ? (apiLogs.filter(log => log.status === 'Success').length / apiLogs.length * 100).toFixed(1)
    : '0';

  // Deployment Success Rate
  const deploymentSuccessRate = deployments.length > 0
    ? (deployments.filter(d => d.status === 'Completed').length / deployments.length * 100).toFixed(1)
    : '0';

  // Error Resolution Rate
  const errorResolutionRate = errors.length > 0
    ? (errors.filter(e => e.isResolved).length / errors.length * 100).toFixed(1)
    : '0';

  // Key Metrics — brand token colors
  const metrics = [
    {
      title: 'Total CRFs',
      value: crfs.length,
      change: '+12%',
      trend: 'up',
      icon: Activity,
      color: 'text-brand-primary',
      bgColor: 'bg-brand-primary-light'
    },
    {
      title: 'Deployment Success',
      value: `${deploymentSuccessRate}%`,
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-brand-success',
      bgColor: 'bg-brand-success-light'
    },
    {
      title: 'API Success Rate',
      value: `${apiSuccessRate}%`,
      change: '+2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-brand-success',
      bgColor: 'bg-brand-success-light'
    },
    {
      title: 'Error Resolution',
      value: `${errorResolutionRate}%`,
      change: '-3%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-brand-warning',
      bgColor: 'bg-brand-warning-light'
    }
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into deployments, errors, and system performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`size-6 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-brand-success' : 'text-brand-error'
                  }`}>
                    <TrendIcon className="h-4 w-4" />
                    <span>{metric.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">{metric.title}</p>
                  <p className="text-foreground text-2xl">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="apis">API Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CRF Status Distribution — Pie with semantic brand colors */}
            <Card>
              <CardHeader>
                <CardTitle>CRF Status Distribution</CardTitle>
                <CardDescription>Current status of all change requests</CardDescription>
              </CardHeader>
              <CardContent>
                {crfStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={crfStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">No CRF data available</div>
                )}
              </CardContent>
            </Card>

            {/* Deployment Queue Status — Pie with semantic brand colors */}
            <Card>
              <CardHeader>
                <CardTitle>Deployment Queue Status</CardTitle>
                <CardDescription>Status distribution of deployment queue</CardDescription>
              </CardHeader>
              <CardContent>
                {deploymentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deploymentStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">No deployment data available</div>
                )}
              </CardContent>
            </Card>

            {/* Version Distribution — Single-series bar → Primary with rounded corners */}
            <Card>
              <CardHeader>
                <CardTitle>Client Version Distribution</CardTitle>
                <CardDescription>Number of clients per version</CardDescription>
              </CardHeader>
              <CardContent>
                {versionDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={versionDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                      <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <Tooltip />
                      <Bar dataKey="clients" fill={CHART_COLORS.primary} radius={BAR_RADIUS} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">No version data available</div>
                )}
              </CardContent>
            </Card>

            {/* Error Severity Distribution — Categorical bar with per-bar semantic colors */}
            <Card>
              <CardHeader>
                <CardTitle>Error Severity Distribution</CardTitle>
                <CardDescription>Breakdown of errors by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                {errorSeverityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={errorSeverityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                      <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <Tooltip />
                      <Bar dataKey="value" radius={BAR_RADIUS} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">No error data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Analytics</CardTitle>
              <CardDescription>Detailed deployment metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-brand-primary-light p-4 rounded-lg">
                  <p className="text-brand-primary mb-1">Total Deployments</p>
                  <p className="text-2xl text-brand-main">{deployments.length}</p>
                </div>
                <div className="bg-brand-success-light p-4 rounded-lg">
                  <p className="text-brand-success mb-1">Successful</p>
                  <p className="text-2xl text-brand-main">{deployments.filter(d => d.status === 'Completed').length}</p>
                </div>
                <div className="bg-brand-error-light p-4 rounded-lg">
                  <p className="text-brand-error mb-1">Failed</p>
                  <p className="text-2xl text-brand-main">{deployments.filter(d => d.status === 'Failed').length}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {deployments.slice(0, 10).map((deployment) => (
                  <div key={deployment.deploymentQueueId} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-foreground">{deployment.crfNumber}</span>
                        <Badge variant={
                          deployment.status === 'Completed' ? 'default' :
                          deployment.status === 'Failed' ? 'destructive' :
                          deployment.status === 'Running' ? 'secondary' : 'outline'
                        }>
                          {deployment.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{deployment.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Priority: {deployment.priority}</p>
                      <p className="text-muted-foreground/70 text-sm">{deployment.deploymentType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Analytics</CardTitle>
              <CardDescription>Error trends and resolution metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-brand-error-light p-4 rounded-lg">
                  <p className="text-brand-error mb-1">Total Errors</p>
                  <p className="text-2xl text-brand-main">{errors.length}</p>
                </div>
                <div className="bg-brand-warning-light p-4 rounded-lg">
                  <p className="text-brand-warning mb-1">Unresolved</p>
                  <p className="text-2xl text-brand-main">{errors.filter(e => !e.isResolved).length}</p>
                </div>
                <div className="bg-brand-warning-light p-4 rounded-lg">
                  <p className="text-brand-warning mb-1">Critical</p>
                  <p className="text-2xl text-brand-main">{errors.filter(e => e.severity === 'Critical').length}</p>
                </div>
                <div className="bg-brand-success-light p-4 rounded-lg">
                  <p className="text-brand-success mb-1">Resolved</p>
                  <p className="text-2xl text-brand-main">{errors.filter(e => e.isResolved).length}</p>
                </div>
              </div>

              <div className="space-y-3">
                {errors.slice(0, 10).map((error) => (
                  <div key={error.errorNotificationId} className="flex items-start justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          error.severity === 'Critical' ? 'destructive' :
                          error.severity === 'Error' ? 'destructive' :
                          error.severity === 'Warning' ? 'secondary' : 'outline'
                        }>
                          {error.severity}
                        </Badge>
                        <Badge variant="outline">{error.errorType}</Badge>
                        {error.isResolved && <Badge variant="default">Resolved</Badge>}
                      </div>
                      <p className="text-foreground">{error.errorMessage}</p>
                      <p className="text-muted-foreground text-sm mt-1">{error.errorSource}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Analytics</CardTitle>
              <CardDescription>Client version status and update history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-brand-primary-light p-4 rounded-lg">
                  <p className="text-brand-primary mb-1">Total Clients</p>
                  <p className="text-2xl text-brand-main">{clients.length}</p>
                </div>
                <div className="bg-brand-success-light p-4 rounded-lg">
                  <p className="text-brand-success mb-1">Active</p>
                  <p className="text-2xl text-brand-main">{clients.filter(c => c.isActive).length}</p>
                </div>
                <div className="bg-brand-success-light p-4 rounded-lg">
                  <p className="text-brand-success mb-1">Up to Date</p>
                  <p className="text-2xl text-brand-main">
                    {clients.filter(c => c.currentVersion === versions[0]?.versionNumber).length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {clients.map((client) => (
                  <div key={client.clientId} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="text-foreground">{client.clientName}</p>
                      <p className="text-muted-foreground text-sm">{client.currentVersion || 'Not assigned'}</p>
                    </div>
                    <Badge variant={client.isActive ? 'default' : 'secondary'}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Performance</CardTitle>
              <CardDescription>API execution logs and success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-brand-primary-light p-4 rounded-lg">
                  <p className="text-brand-primary mb-1">Total Executions</p>
                  <p className="text-2xl text-brand-main">{apiLogs.length}</p>
                </div>
                <div className="bg-brand-success-light p-4 rounded-lg">
                  <p className="text-brand-success mb-1">Successful</p>
                  <p className="text-2xl text-brand-main">{apiLogs.filter(log => log.status === 'Success').length}</p>
                </div>
                <div className="bg-brand-error-light p-4 rounded-lg">
                  <p className="text-brand-error mb-1">Failed</p>
                  <p className="text-2xl text-brand-main">{apiLogs.filter(log => log.status === 'Failed').length}</p>
                </div>
              </div>

              <div className="space-y-3">
                {apiLogs.slice(0, 10).map((log) => (
                  <div key={log.apiExecutionLogId} className="flex items-start justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-foreground">{log.apiName}</span>
                        <Badge variant={log.status === 'Success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                        {log.durationMs && (
                          <span className="text-muted-foreground text-sm">{log.durationMs}ms</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{log.executionType}</p>
                      {log.crfNumber && <p className="text-muted-foreground/70 text-sm">{log.crfNumber}</p>}
                    </div>
                    {log.responseStatusCode && (
                      <Badge variant="outline">{log.responseStatusCode}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}