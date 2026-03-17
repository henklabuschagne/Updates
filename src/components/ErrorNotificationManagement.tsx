import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Filter, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import apiClient, { ErrorNotificationResponse, ResolveErrorRequest } from '../services/api';

export function ErrorNotificationManagement() {
  const [errors, setErrors] = useState<ErrorNotificationResponse[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorNotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'unresolved' | 'resolved'>('unresolved');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<ErrorNotificationResponse | null>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadErrors();
  }, []);

  useEffect(() => {
    filterErrors();
  }, [errors, selectedTab, searchTerm, severityFilter, typeFilter]);

  const loadErrors = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllErrorNotifications();
      setErrors(data);
    } catch (error: any) {
      toast.error('Failed to load error notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterErrors = () => {
    let filtered = errors.filter(error => 
      selectedTab === 'unresolved' ? !error.isResolved : error.isResolved
    );

    if (searchTerm) {
      filtered = filtered.filter(error =>
        error.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.errorSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.crfNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(error => error.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(error => error.errorType === typeFilter);
    }

    setFilteredErrors(filtered);
  };

  const handleResolve = (error: ErrorNotificationResponse) => {
    setSelectedError(error);
    setResolutionNotes('');
    setIsResolveDialogOpen(true);
  };

  const handleViewDetails = (error: ErrorNotificationResponse) => {
    setSelectedError(error);
    setIsDetailDialogOpen(true);
  };

  const handleSubmitResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedError) return;

    try {
      const request: ResolveErrorRequest = {
        resolutionNotes: resolutionNotes,
      };

      await apiClient.resolveErrorNotification(selectedError.errorNotificationId, request);
      toast.success('Error resolved successfully');
      setIsResolveDialogOpen(false);
      setSelectedError(null);
      setResolutionNotes('');
      loadErrors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve error');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'Error':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'Warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'Info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      Critical: 'bg-red-100 text-red-800 border-red-200',
      Error: 'bg-orange-100 text-orange-800 border-orange-200',
      Warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Info: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Deployment: 'bg-purple-100 text-purple-800',
      Rollback: 'bg-pink-100 text-pink-800',
      API: 'bg-indigo-100 text-indigo-800',
      Database: 'bg-cyan-100 text-cyan-800',
      System: 'bg-gray-100 text-gray-800',
      Validation: 'bg-teal-100 text-teal-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const stats = {
    total: errors.length,
    unresolved: errors.filter(e => !e.isResolved).length,
    critical: errors.filter(e => e.severity === 'Critical' && !e.isResolved).length,
    resolved: errors.filter(e => e.isResolved).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Error Notifications</h2>
          <p className="text-muted-foreground">
            Monitor and resolve deployment and system errors
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Errors</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unresolved</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.unresolved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.critical}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Error">Error</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="Deployment">Deployment</option>
              <option value="Rollback">Rollback</option>
              <option value="API">API</option>
              <option value="Database">Database</option>
              <option value="System">System</option>
              <option value="Validation">Validation</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'unresolved' | 'resolved')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="unresolved">
            Unresolved ({stats.unresolved})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({stats.resolved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredErrors.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No {selectedTab} errors found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredErrors.map((error) => (
                <Card key={error.errorNotificationId} className={`border-l-4 ${getSeverityColor(error.severity)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {getSeverityIcon(error.severity)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                            <Badge className={getTypeColor(error.errorType)}>
                              {error.errorType}
                            </Badge>
                            {error.crfNumber && (
                              <Badge variant="outline">{error.crfNumber}</Badge>
                            )}
                            {error.clientName && (
                              <Badge variant="outline">{error.clientName}</Badge>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">{error.errorSource}</div>
                            <div className="mt-1">{error.errorMessage}</div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {formatDate(error.createdDate)}
                          </div>

                          {error.isResolved && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                              <div className="flex items-center gap-2 text-sm text-green-800 mb-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>Resolved by {error.resolvedByName}</span>
                                {error.resolvedDate && (
                                  <span className="text-green-600">
                                    • {formatDate(error.resolvedDate)}
                                  </span>
                                )}
                              </div>
                              {error.resolutionNotes && (
                                <div className="text-sm text-green-700 mt-1">
                                  {error.resolutionNotes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(error)}
                        >
                          Details
                        </Button>
                        {!error.isResolved && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleResolve(error)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Resolve Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Error</DialogTitle>
            <DialogDescription>
              Provide resolution notes for this error
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitResolve} className="space-y-4">
            {selectedError && (
              <div className="bg-muted p-3 rounded space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(selectedError.severity)}>
                    {selectedError.severity}
                  </Badge>
                  <Badge className={getTypeColor(selectedError.errorType)}>
                    {selectedError.errorType}
                  </Badge>
                </div>
                <div className="text-sm">{selectedError.errorMessage}</div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">Resolution Notes *</Label>
              <Textarea
                id="resolutionNotes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                placeholder="Describe how this error was resolved..."
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Mark as Resolved</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(selectedError.severity)}>
                  {selectedError.severity}
                </Badge>
                <Badge className={getTypeColor(selectedError.errorType)}>
                  {selectedError.errorType}
                </Badge>
                {selectedError.isResolved && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolved
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Error Source</div>
                  <div>{selectedError.errorSource}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Error Message</div>
                  <div>{selectedError.errorMessage}</div>
                </div>

                {selectedError.stackTrace && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Stack Trace</div>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedError.crfNumber && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">CRF Number</div>
                      <div>{selectedError.crfNumber}</div>
                    </div>
                  )}
                  {selectedError.clientName && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Client</div>
                      <div>{selectedError.clientName}</div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Created Date</div>
                  <div>{formatDate(selectedError.createdDate)}</div>
                </div>

                {selectedError.isResolved && (
                  <>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Resolved By</div>
                      <div>{selectedError.resolvedByName}</div>
                    </div>
                    {selectedError.resolvedDate && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Resolved Date</div>
                        <div>{formatDate(selectedError.resolvedDate)}</div>
                      </div>
                    )}
                    {selectedError.resolutionNotes && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Resolution Notes</div>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          {selectedError.resolutionNotes}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}