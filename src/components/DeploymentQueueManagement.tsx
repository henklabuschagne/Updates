import React, { useState, useMemo } from 'react';
import { Plus, Play, Pause, X, Calendar, Clock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { useAppStore } from '../hooks/useAppStore';
import type { QueueDeploymentRequest } from '../services/api';

export function DeploymentQueueManagement() {
  const {
    deploymentQueue: deployments,
    crfs: allCrfs,
    clients: allClients,
    actions,
  } = useAppStore('deployments', 'crfs', 'clients');

  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);

  // Only show approved CRFs and active clients in the queue form
  const approvedCrfs = useMemo(() => allCrfs.filter(crf => crf.status === 'Approved'), [allCrfs]);
  const activeClients = useMemo(() => allClients.filter(client => client.isActive), [allClients]);

  const [formData, setFormData] = useState({
    crfId: 0,
    clientId: 0,
    scheduledStartTime: '',
    priority: 5,
    deploymentType: 'Automatic',
    notes: '',
  });

  const filteredDeployments = useMemo(() => {
    if (selectedTab === 'all') return deployments;
    return deployments.filter(d => d.status === selectedTab);
  }, [deployments, selectedTab]);

  const handleQueue = () => {
    setFormData({
      crfId: 0,
      clientId: 0,
      scheduledStartTime: '',
      priority: 5,
      deploymentType: 'Automatic',
      notes: '',
    });
    setIsQueueDialogOpen(true);
  };

  const handleSubmitQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    const request: QueueDeploymentRequest = {
      crfId: formData.crfId,
      clientId: formData.clientId,
      scheduledStartTime: formData.scheduledStartTime || undefined,
      priority: formData.priority,
      deploymentType: formData.deploymentType,
      notes: formData.notes,
    };

    const result = await actions.queueDeployment(request);
    if (result.success) {
      toast.success('Deployment queued successfully');
      setIsQueueDialogOpen(false);
    } else {
      toast.error(result.error?.message || 'Failed to queue deployment');
    }
  };

  const handleCancel = async (deploymentId: number) => {
    if (!confirm('Are you sure you want to cancel this deployment?')) return;

    const result = await actions.cancelDeployment(deploymentId);
    if (result.success) {
      toast.success('Deployment cancelled successfully');
    } else {
      toast.error(result.error?.message || 'Failed to cancel deployment');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Queued: 'bg-blue-100 text-blue-800',
      Running: 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-green-100 text-green-800',
      Failed: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800',
      'Rolled Back': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Queued':
        return <Clock className="h-4 w-4" />;
      case 'Running':
        return <Play className="h-4 w-4" />;
      case 'Completed':
        return <Play className="h-4 w-4" />;
      case 'Failed':
      case 'Cancelled':
      case 'Rolled Back':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600';
    if (priority >= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  const stats = {
    total: deployments.length,
    queued: deployments.filter(d => d.status === 'Queued').length,
    running: deployments.filter(d => d.status === 'Running').length,
    completed: deployments.filter(d => d.status === 'Completed').length,
    failed: deployments.filter(d => d.status === 'Failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Deployment Queue</h2>
          <p className="text-muted-foreground">
            Manage and monitor deployment queue
          </p>
        </div>
        <Button onClick={handleQueue}>
          <Plus className="h-4 w-4 mr-2" />
          Queue Deployment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Queued</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.queued}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Running</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.running}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Deployment List */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="Queued">Queued ({stats.queued})</TabsTrigger>
          <TabsTrigger value="Running">Running ({stats.running})</TabsTrigger>
          <TabsTrigger value="Completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="Failed">Failed ({stats.failed})</TabsTrigger>
          <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredDeployments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No deployments found
                </p>
                <Button onClick={handleQueue} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Queue Deployment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDeployments.map((deployment) => (
                <Card key={deployment.deploymentQueueId}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
                          <span className={getPriorityColor(deployment.priority)}>
                            P{deployment.priority}
                          </span>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(deployment.status)}>
                                {getStatusIcon(deployment.status)}
                                <span className="ml-1">{deployment.status}</span>
                              </Badge>
                              <Badge variant="outline">{deployment.deploymentType}</Badge>
                            </div>
                            <h3 className="font-semibold">{deployment.crfTitle}</h3>
                            <div className="text-sm text-muted-foreground">
                              {deployment.crfNumber} &bull; Version {deployment.versionNumber}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground mb-1">Client</div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {deployment.clientName}
                              </div>
                            </div>

                            <div>
                              <div className="text-muted-foreground mb-1">Queued By</div>
                              <div>{deployment.queuedByName}</div>
                            </div>

                            <div>
                              <div className="text-muted-foreground mb-1">Queued Date</div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(deployment.queuedDate)}
                              </div>
                            </div>

                            {deployment.scheduledStartTime && (
                              <div>
                                <div className="text-muted-foreground mb-1">Scheduled Start</div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  {formatDate(deployment.scheduledStartTime)}
                                </div>
                              </div>
                            )}

                            {deployment.actualStartTime && (
                              <div>
                                <div className="text-muted-foreground mb-1">Actual Start</div>
                                <div>{formatDate(deployment.actualStartTime)}</div>
                              </div>
                            )}

                            {deployment.completedTime && (
                              <div>
                                <div className="text-muted-foreground mb-1">Completed</div>
                                <div>{formatDate(deployment.completedTime)}</div>
                              </div>
                            )}
                          </div>

                          {deployment.notes && (
                            <div className="bg-muted p-3 rounded">
                              <div className="text-sm text-muted-foreground mb-1">Notes</div>
                              <div className="text-sm">{deployment.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {deployment.status === 'Queued' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(deployment.deploymentQueueId)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
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

      {/* Queue Dialog */}
      <Dialog open={isQueueDialogOpen} onOpenChange={setIsQueueDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Queue Deployment</DialogTitle>
            <DialogDescription>
              Add a new deployment to the queue
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitQueue} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crfId">CRF *</Label>
                <select
                  id="crfId"
                  value={formData.crfId}
                  onChange={(e) => setFormData({ ...formData, crfId: parseInt(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select CRF</option>
                  {approvedCrfs.map((crf) => (
                    <option key={crf.crfId} value={crf.crfId}>
                      {crf.crfNumber} - {crf.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <select
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: parseInt(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Client</option>
                  {activeClients.map((client) => (
                    <option key={client.clientId} value={client.clientId}>
                      {client.clientName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority (1-10) *</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority deployments run first
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deploymentType">Deployment Type *</Label>
                <select
                  id="deploymentType"
                  value={formData.deploymentType}
                  onChange={(e) => setFormData({ ...formData, deploymentType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledStartTime">Scheduled Start Time</Label>
              <Input
                id="scheduledStartTime"
                type="datetime-local"
                value={formData.scheduledStartTime}
                onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to start immediately
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Additional deployment notes..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsQueueDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Queue Deployment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
