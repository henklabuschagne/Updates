import { useState, useEffect } from 'react';
import { FileText, Filter, Download, AlertCircle, CheckCircle, Info, XCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { apiClient, type DeploymentLogResponse } from '../services/api';

export function DeploymentLogs() {
  const [logs, setLogs] = useState<DeploymentLogResponse[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DeploymentLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadDeploymentLogs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDeploymentLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, severityFilter, typeFilter]);

  const loadDeploymentLogs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDeploymentLogs();
      setLogs(data);
    } catch (error: any) {
      console.error('Failed to load deployment logs:', error);
      toast.error('Failed to load deployment logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.logMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.logType === typeFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'CRF ID', 'Client', 'Type', 'Severity', 'Message', 'Created By'].join(','),
      ...filteredLogs.map(log => [
        log.createdDate,
        log.crfId,
        log.clientName,
        log.logType,
        log.severity,
        `"${log.logMessage}"`,
        log.createdByName
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-logs-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Deployment logs exported successfully');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'error':
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'border-l-4 border-l-red-600 bg-red-50',
      error: 'border-l-4 border-l-red-500 bg-red-50',
      warning: 'border-l-4 border-l-yellow-500 bg-yellow-50',
      info: 'border-l-4 border-l-blue-500 bg-blue-50',
      success: 'border-l-4 border-l-green-500 bg-green-50',
    };
    return colors[severity.toLowerCase()] || 'border-l-4 border-l-gray-500';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const uniqueSeverities = Array.from(new Set(logs.map(log => log.severity)));
  const uniqueTypes = Array.from(new Set(logs.map(log => log.logType)));

  const errorCount = logs.filter(l => l.severity.toLowerCase() === 'error' || l.severity.toLowerCase() === 'critical').length;
  const warningCount = logs.filter(l => l.severity.toLowerCase() === 'warning').length;
  const successCount = logs.filter(l => l.severity.toLowerCase() === 'success').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="size-8 text-blue-600" />
            <h1 className="text-gray-900">Deployment Logs</h1>
          </div>
          <p className="text-gray-600">
            Monitor deployment execution logs and troubleshoot issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDeploymentLogs}>
            Refresh
          </Button>
          <Button onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Logs</div>
            <div className="text-2xl text-gray-900">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Errors</div>
            <div className="text-2xl text-red-600">{errorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Warnings</div>
            <div className="text-2xl text-yellow-600">{warningCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Success</div>
            <div className="text-2xl text-green-600">{successCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Severities</option>
                {uniqueSeverities.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="type">Log Type</Label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Logs */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading deployment logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No deployment logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card key={log.deploymentLogId} className={getSeverityColor(log.severity)}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getSeverityIcon(log.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gray-900">{log.severity}</Badge>
                      <Badge variant="outline">{log.logType}</Badge>
                      {log.crfId && (
                        <span className="text-sm text-gray-600">CRF #{log.crfId}</span>
                      )}
                      {log.clientName && (
                        <span className="text-sm text-gray-900">{log.clientName}</span>
                      )}
                    </div>
                    
                    <p className="text-gray-900 mb-2">{log.logMessage}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatTimestamp(log.createdDate)}</span>
                      {log.createdByName && (
                        <span>by {log.createdByName}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}