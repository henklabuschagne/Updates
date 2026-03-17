import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Activity, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { apiClient, type AuditLogResponse } from '../services/api';

interface AuditLogEntry {
  auditLogId: number;
  userId: number;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string;
  timestamp: string;
  details: string;
}

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    loadAuditLogs();
  }, [dateRange]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter, entityFilter, userFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // Calculate date range
      let startDate: string | undefined;
      const now = new Date();
      if (dateRange === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      } else if (dateRange === '7d') {
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      } else if (dateRange === '30d') {
        startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
      }
      
      const response = await apiClient.getAuditLogs(
        undefined, // userId filter
        entityFilter !== 'all' ? entityFilter : undefined,
        undefined, // entityId
        actionFilter !== 'all' ? actionFilter : undefined,
        startDate,
        undefined  // endDate
      );
      
      // Transform backend data to frontend format
      const transformedLogs: AuditLogEntry[] = response.logs.map((log: AuditLogResponse) => ({
        auditLogId: log.auditLogId,
        userId: log.userId || 0,
        userName: log.username || 'Unknown',
        userRole: '',  // Not available in AuditLogResponse
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId || 0,
        entityName: log.details || `${log.entityType} #${log.entityId || ''}`,
        oldValue: log.oldValue || null,
        newValue: log.newValue || null,
        ipAddress: log.ipAddress || '',
        timestamp: log.timestamp,
        details: log.details || `${log.action} ${log.entityType}`
      }));
      
      setLogs(transformedLogs);
    } catch (error: any) {
      console.error('Failed to load audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (entityFilter !== 'all') {
      filtered = filtered.filter(log => log.entityType === entityFilter);
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.userName === userFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity Name', 'Details', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userName,
        log.userRole,
        log.action,
        log.entityType,
        log.entityName,
        `"${log.details}"`,
        log.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Audit log exported successfully');
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      Create: 'bg-green-100 text-green-800',
      Update: 'bg-blue-100 text-blue-800',
      Delete: 'bg-red-100 text-red-800',
      Approve: 'bg-purple-100 text-purple-800',
      Reject: 'bg-orange-100 text-orange-800',
      Resolve: 'bg-teal-100 text-teal-800',
      Deploy: 'bg-indigo-100 text-indigo-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'CRF':
        return <FileText className="h-4 w-4" />;
      case 'User':
        return <User className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleString();
    }
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueEntities = Array.from(new Set(logs.map(log => log.entityType)));
  const uniqueUsers = Array.from(new Set(logs.map(log => log.userName)));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Audit Log</h1>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <Button onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label htmlFor="action">Action</Label>
              <select
                id="action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="entity">Entity Type</Label>
              <select
                id="entity"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Entities</option>
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="user">User</Label>
              <select
                id="user"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Events</div>
            <div className="text-2xl text-gray-900">{filteredLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Unique Users</div>
            <div className="text-2xl text-gray-900">{uniqueUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Entity Types</div>
            <div className="text-2xl text-gray-900">{uniqueEntities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Actions</div>
            <div className="text-2xl text-gray-900">{uniqueActions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Entries */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No audit logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card key={log.auditLogId}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getEntityIcon(log.entityType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline">{log.entityType}</Badge>
                        <span className="text-sm text-gray-900">{log.entityName}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{log.details}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{log.userName}</span>
                          {log.userRole && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {log.userRole}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          IP: {log.ipAddress}
                        </div>
                      </div>

                      {(log.oldValue || log.newValue) && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            {log.oldValue && (
                              <div>
                                <div className="text-muted-foreground mb-1">Old Value</div>
                                <pre className="bg-background p-2 rounded overflow-x-auto">
                                  {JSON.stringify(JSON.parse(log.oldValue), null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.newValue && (
                              <div>
                                <div className="text-muted-foreground mb-1">New Value</div>
                                <pre className="bg-background p-2 rounded overflow-x-auto">
                                  {JSON.stringify(JSON.parse(log.newValue), null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
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