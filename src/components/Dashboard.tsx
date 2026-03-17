import { ScheduledDeployments } from './ScheduledDeployments';
import { useUser } from '../utils/userContext';
import { Navigate, Link } from 'react-router';
import { useAppStore } from '../hooks/useAppStore';
import { FileText, Users, CheckCircle, Package, Clock, Activity, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function Dashboard() {
  const { currentUser } = useUser();

  // Reactive state from appStore — no useState/useEffect/loading needed.
  // The store is pre-seeded with mock data, so data is available immediately.
  const {
    crfs,
    clients,
    versions,
    deploymentQueue: deployments,
    errorNotifications: errors,
  } = useAppStore('crfs', 'clients', 'versions', 'deployments', 'errors');

  // Redirect clients to their history page
  if (currentUser.role === 'client') {
    return <Navigate to="/my-history" replace />;
  }

  // Only DevOps can configure APIs
  const canConfigureAPIs = currentUser.role === 'devops';

  const pendingCRFs = crfs.filter(crf => 
    crf.status === 'Pending' || crf.status === 'Approved'
  );
  
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const latestVersion = versions[0]?.versionNumber || 'N/A';
  const upToDateClients = clients.filter(c => c.currentVersion === latestVersion).length;

  const stats = [
    {
      title: 'Pending CRFs',
      value: pendingCRFs.length,
      icon: FileText,
      color: 'text-brand-primary',
      bgColor: 'bg-brand-primary-light',
      link: '/crf/workflow'
    },
    {
      title: 'Active Clients',
      value: activeClients,
      icon: Users,
      color: 'text-brand-success',
      bgColor: 'bg-brand-success-light',
      link: '/clients'
    },
    {
      title: 'Up to Date',
      value: upToDateClients,
      icon: CheckCircle,
      color: 'text-brand-success',
      bgColor: 'bg-brand-success-light',
      link: '/clients'
    },
    {
      title: 'Total Versions',
      value: versions.length,
      icon: Package,
      color: 'text-brand-secondary',
      bgColor: 'bg-brand-secondary-light',
      link: '/versions'
    }
  ];

  // Phase 4 Stats
  const deploymentStats = [
    {
      title: 'Queued',
      value: deployments.filter(d => d.status === 'Queued').length,
      icon: Clock,
      color: 'text-brand-primary',
      bgColor: 'bg-brand-primary-light'
    },
    {
      title: 'Running',
      value: deployments.filter(d => d.status === 'Running').length,
      icon: Activity,
      color: 'text-brand-warning',
      bgColor: 'bg-brand-warning-light'
    },
    {
      title: 'Unresolved Errors',
      value: errors.filter(e => !e.isResolved).length,
      icon: AlertTriangle,
      color: 'text-brand-error',
      bgColor: 'bg-brand-error-light'
    },
    {
      title: 'Critical Errors',
      value: errors.filter(e => e.severity === 'Critical' && !e.isResolved).length,
      icon: XCircle,
      color: 'text-brand-error',
      bgColor: 'bg-brand-error-light'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Draft': 'secondary',
      'Pending': 'secondary',
      'Approved': 'default',
      'Deployed': 'default',
      'Rejected': 'destructive',
      'Failed': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Software Update Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage software updates across all clients</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`size-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deployment & Error Stats - DevOps Only */}
      {canConfigureAPIs && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground">Deployment & Error Monitoring</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deploymentStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl text-foreground">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`size-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending CRFs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Change Requests</CardTitle>
            <Link to="/crf">
              <Button size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingCRFs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pending CRFs</p>
              ) : (
                pendingCRFs.slice(0, 5).map((crf) => (
                  <div key={crf.crfId} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-foreground">{crf.crfNumber}</span>
                        {getStatusBadge(crf.status)}
                      </div>
                      <p className="text-muted-foreground mb-1">{crf.title}</p>
                      <p className="text-muted-foreground text-sm">
                        Version: {crf.versionNumber}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                        <Clock className="size-4" />
                        <span>{formatDate(crf.scheduledDeploymentDate)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Deployments Section */}
        <ScheduledDeployments />

        {/* Client Version Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client Version Status</CardTitle>
            <Link to="/clients">
              <Button variant="outline" size="sm">Manage</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.slice(0, 5).map((client) => (
                <div key={client.clientId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-foreground">{client.clientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Package className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">{client.currentVersion || 'Not assigned'}</span>
                    </div>
                  </div>
                  <Badge 
                    className={
                      client.status === 'Active' ? 'bg-brand-success-light text-brand-success border-brand-success-mid' :
                      client.status === 'Pending' ? 'bg-brand-warning-light text-brand-warning border-brand-warning-mid' : ''
                    }
                    variant={
                      client.status !== 'Active' && client.status !== 'Pending' ? 'outline' : 'outline'
                    }
                  >
                    {client.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crfs.slice(0, 5).map((crf) => (
                <div key={crf.crfId} className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="size-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-foreground">{crf.crfNumber}</span>
                      {getStatusBadge(crf.status)}
                    </div>
                    <p className="text-muted-foreground">{crf.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(crf.createdDate)}</p>
                  </div>
                </div>
              ))}
              {crfs.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}