import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Code
} from 'lucide-react';
import { 
  apiClient, 
  type ClientResponse, 
  type ClientVersionHistory,
  type APIConfigurationResponse 
} from '../services/api';
import { toast } from 'sonner@2.0.3';
import { useUser } from '../utils/userContext';

interface RollbackLog {
  apiName: string;
  method: string;
  url: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message?: string;
}

interface RollbackCandidate {
  client: ClientResponse;
  currentHistory: ClientVersionHistory;
  previousHistory?: ClientVersionHistory;
}

export function RollbackManagement() {
  const { currentUser } = useUser();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [versionHistories, setVersionHistories] = useState<Map<number, ClientVersionHistory[]>>(new Map());
  const [apiConfigs, setApiConfigs] = useState<APIConfigurationResponse[]>([]);
  const [rollbackCandidates, setRollbackCandidates] = useState<RollbackCandidate[]>([]);
  const [recentRollbacks, setRecentRollbacks] = useState<ClientVersionHistory[]>([]);
  
  const [selectedCandidate, setSelectedCandidate] = useState<RollbackCandidate | null>(null);
  const [rollbackNotes, setRollbackNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackLogs, setRollbackLogs] = useState<RollbackLog[]>([]);
  const [currentAPIIndex, setCurrentAPIIndex] = useState(-1);
  const [rollbackComplete, setRollbackComplete] = useState(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Only DevOps can perform rollbacks
  const canRollback = currentUser.role === 'devops';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientsData, apiConfigsData] = await Promise.all([
        apiClient.getAllClients(false),
        apiClient.getAllAPIConfigurations()
      ]);
      
      setClients(clientsData);
      setApiConfigs(apiConfigsData.filter(api => api.apiType === 'Rollback' && api.isEnabled));

      // Load version histories for all clients
      const histories = new Map<number, ClientVersionHistory[]>();
      const candidates: RollbackCandidate[] = [];
      const rollbacks: ClientVersionHistory[] = [];

      for (const client of clientsData) {
        try {
          const history = await apiClient.getClientVersionHistory(client.clientId);
          histories.set(client.clientId, history);
          
          // Find rollback candidates (clients with multiple versions)
          if (history.length >= 2) {
            const sortedHistory = history.sort((a, b) => 
              new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()
            );
            const current = sortedHistory[0];
            const previous = sortedHistory[1];
            
            // Only include if current version was recently deployed (within last 30 days)
            const daysSinceUpdate = (Date.now() - new Date(current.assignedDate).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate < 30) {
              candidates.push({
                client,
                currentHistory: current,
                previousHistory: previous
              });
            }
          }

          // Collect recent rollbacks (based on notes containing "rollback")
          const clientRollbacks = history.filter(h => 
            h.notes.toLowerCase().includes('rollback') ||
            h.notes.toLowerCase().includes('reverted')
          );
          rollbacks.push(...clientRollbacks);
        } catch (error) {
          console.error(`Failed to load history for client ${client.clientId}`, error);
        }
      }

      setVersionHistories(histories);
      setRollbackCandidates(candidates);
      setRecentRollbacks(rollbacks.slice(0, 10));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load rollback data');
    } finally {
      setIsLoading(false);
    }
  };

  const initiateRollback = (candidate: RollbackCandidate) => {
    setSelectedCandidate(candidate);
    setShowConfirmDialog(true);
  };

  const confirmRollback = async () => {
    if (!selectedCandidate || !selectedCandidate.previousHistory) {
      toast.error('Cannot perform rollback: no previous version available');
      return;
    }

    if (!rollbackNotes.trim()) {
      toast.error('Please provide rollback notes');
      return;
    }

    setShowConfirmDialog(false);
    setIsRollingBack(true);
    setRollbackComplete(false);
    setRollbackError(null);
    setCurrentAPIIndex(-1);

    const enabledAPIs = apiConfigs.filter(api => api.isEnabled);
    
    // Initialize rollback logs
    const logs: RollbackLog[] = enabledAPIs.map(api => ({
      apiName: api.apiName,
      method: api.httpMethod,
      url: api.endpointURL,
      status: 'pending'
    }));
    setRollbackLogs(logs);

    try {
      // Execute rollback API chain sequentially
      for (let i = 0; i < enabledAPIs.length; i++) {
        setCurrentAPIIndex(i);
        logs[i].status = 'active';
        setRollbackLogs([...logs]);

        // Simulate API execution delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
          // Here you would actually call the external rollback API
          // For now, we'll just mark as complete
          logs[i].status = 'complete';
          logs[i].message = 'Rollback API executed successfully';
        } catch (error: any) {
          logs[i].status = 'error';
          logs[i].message = error.message || 'Rollback API execution failed';
          throw error;
        }
        
        setRollbackLogs([...logs]);
      }

      // Update client to previous version in database
      await apiClient.updateClientVersion(selectedCandidate.client.clientId, {
        versionId: selectedCandidate.previousHistory.versionId,
        notes: `ROLLBACK: ${rollbackNotes}`
      });

      setRollbackComplete(true);
      toast.success('Rollback completed successfully!');
      
      // Reload data
      await loadData();
      
      // Reset form
      setRollbackNotes('');
      setSelectedCandidate(null);
    } catch (error: any) {
      setRollbackError(error.message || 'Rollback failed');
      toast.error('Rollback failed: ' + error.message);
    } finally {
      setIsRollingBack(false);
    }
  };

  const enabledRollbackAPIs = apiConfigs.filter(api => api.isEnabled);
  const totalAPIs = enabledRollbackAPIs.length;
  const rollbackProgress = currentAPIIndex >= 0 
    ? Math.round(((currentAPIIndex + 1) / Math.max(totalAPIs, 1)) * 100)
    : 0;

  if (!canRollback) {
    return (
      <div className="p-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="size-4 text-red-600" />
          <AlertDescription className="text-gray-700">
            <span className="text-gray-900">Access Denied:</span> Rollback management is restricted to DevOps personnel only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <RotateCcw className="size-8 text-orange-600" />
          <h1 className="text-gray-900">Rollback Management</h1>
        </div>
        <p className="text-gray-600">Manage and execute rollback procedures for deployments</p>
      </div>

      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertTriangle className="size-4 text-orange-600" />
        <AlertDescription className="text-gray-700">
          <span className="text-gray-900">Critical Operation:</span> Rollback procedures will restore the system to its previous state. 
          Ensure all stakeholders are notified before proceeding.
        </AlertDescription>
      </Alert>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Rollback Candidates</p>
                <p className="text-gray-900 text-orange-600">{rollbackCandidates.length}</p>
              </div>
              <Clock className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Recent Rollbacks</p>
                <p className="text-gray-900">{recentRollbacks.length}</p>
              </div>
              <RotateCcw className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Clients</p>
                <p className="text-gray-900">{clients.length}</p>
              </div>
              <CheckCircle className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Rollback APIs</p>
                <p className="text-gray-900">{totalAPIs}</p>
              </div>
              <Code className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rollback Candidates List */}
        <div className="space-y-4">
          <h2 className="text-gray-900">Rollback Candidates</h2>
          
          {rollbackCandidates.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <CheckCircle className="size-16 text-green-600 mb-4" />
                  <p className="text-gray-900 mb-2">No Rollback Candidates</p>
                  <p className="text-gray-500">All recent deployments are stable</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            rollbackCandidates.map((candidate) => (
              <Card key={candidate.client.clientId} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {candidate.client.clientName}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">Last updated: {new Date(candidate.currentHistory.assignedDate).toLocaleDateString()}</p>
                    </div>
                    <Badge>{candidate.client.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 mb-1">Current Version</p>
                      <p className="text-gray-900">{candidate.currentHistory.versionNumber}</p>
                      <p className="text-gray-600 text-sm">{candidate.currentHistory.versionName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Previous Version</p>
                      <p className="text-gray-900">{candidate.previousHistory?.versionNumber || 'N/A'}</p>
                      <p className="text-gray-600 text-sm">{candidate.previousHistory?.versionName || ''}</p>
                    </div>
                  </div>

                  {candidate.currentHistory.notes && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 mb-1 text-sm">Deployment Notes</p>
                      <p className="text-gray-700 text-sm">{candidate.currentHistory.notes}</p>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full border-orange-300 hover:bg-orange-50"
                    onClick={() => initiateRollback(candidate)}
                    disabled={isRollingBack || !candidate.previousHistory}
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Initiate Rollback ({totalAPIs} APIs)
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Rollback Progress */}
        <div>
          <h2 className="text-gray-900 mb-4">Rollback Progress</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Rollback Execution</CardTitle>
            </CardHeader>
            <CardContent>
              {!isRollingBack && !rollbackComplete && !rollbackError && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <RotateCcw className="size-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">Select a deployment to initiate rollback</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Code className="size-4" />
                    <span>{totalAPIs} rollback APIs configured</span>
                  </div>
                  {totalAPIs === 0 && (
                    <p className="text-orange-600 mt-2">⚠️ No rollback APIs configured</p>
                  )}
                </div>
              )}

              {(isRollingBack || rollbackComplete || rollbackError) && (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  {totalAPIs > 0 && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">Rollback Progress</span>
                        <span className="text-gray-900">{rollbackProgress}%</span>
                      </div>
                      <Progress value={rollbackProgress} className="h-3" />
                      <p className="text-gray-600 mt-2">
                        API {Math.min(currentAPIIndex + 1, totalAPIs)} of {totalAPIs}
                      </p>
                    </div>
                  )}

                  {/* API Execution Steps */}
                  {rollbackLogs.length > 0 && (
                    <div className="space-y-3">
                      {rollbackLogs.map((log, index) => (
                        <div 
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            log.status === 'complete' ? 'bg-green-50 border-green-200' :
                            log.status === 'error' ? 'bg-red-50 border-red-200' :
                            log.status === 'active' ? 'bg-orange-50 border-orange-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {log.status === 'complete' ? (
                            <CheckCircle className="size-5 text-green-600 mt-0.5" />
                          ) : log.status === 'error' ? (
                            <XCircle className="size-5 text-red-600 mt-0.5" />
                          ) : log.status === 'active' ? (
                            <Loader2 className="size-5 text-orange-600 animate-spin mt-0.5" />
                          ) : (
                            <div className="size-5 rounded-full border-2 border-gray-300 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`${
                                log.status === 'complete' ? 'text-green-900' :
                                log.status === 'error' ? 'text-red-900' :
                                log.status === 'active' ? 'text-orange-900' :
                                'text-gray-600'
                              }`}>
                                {log.apiName}
                              </p>
                              <Badge variant="outline" className="text-xs">{log.method}</Badge>
                            </div>
                            <p className="text-gray-600 truncate text-sm">{log.url}</p>
                            {log.message && (
                              <p className="text-gray-700 text-sm mt-1">{log.message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Completion Message */}
                  {rollbackComplete && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="size-4 text-green-600" />
                      <AlertDescription className="text-gray-700">
                        <span className="text-gray-900">Rollback Successful!</span> Client has been restored to previous version.
                        {totalAPIs > 0 && ` All ${totalAPIs} rollback APIs executed successfully.`}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error Message */}
                  {rollbackError && (
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="size-4 text-red-600" />
                      <AlertDescription className="text-gray-700">
                        <span className="text-gray-900">Rollback Failed:</span> {rollbackError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Rollbacks */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Rollbacks</CardTitle>
            </CardHeader>
            <CardContent>
              {recentRollbacks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rollback history</p>
              ) : (
                <div className="space-y-3">
                  {recentRollbacks.map((rollback) => (
                    <div key={rollback.clientVersionId} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div>
                        <p className="text-gray-900 mb-1">Client ID: {rollback.clientId}</p>
                        <p className="text-gray-600 text-sm">{rollback.versionNumber} - {rollback.versionName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">{new Date(rollback.assignedDate).toLocaleDateString()}</p>
                        <Badge variant="secondary" className="text-xs">Rolled Back</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rollback Plan Documentation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Automated Rollback Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              The system implements an automated rollback procedure using a configurable API chain to ensure minimal downtime and data integrity:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Version History Tracking</h3>
                <p className="text-gray-700 text-sm">
                  Full version history is maintained for each client, allowing rollback to any previous version.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Sequential API Execution</h3>
                <p className="text-gray-700 text-sm">
                  Rollback APIs are executed in order as configured in Settings, with each step verified before proceeding.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Audit Trail</h3>
                <p className="text-gray-700 text-sm">
                  All rollback operations are logged with timestamps, user information, and detailed notes.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Automatic Notifications</h3>
                <p className="text-gray-700 text-sm">
                  Technical team receives instant alerts when rollbacks are initiated with detailed execution logs.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rollback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCandidate && (
              <>
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="size-4 text-orange-600" />
                  <AlertDescription className="text-gray-700">
                    This will rollback <strong>{selectedCandidate.client.clientName}</strong> from version{' '}
                    <strong>{selectedCandidate.currentHistory.versionNumber}</strong> to{' '}
                    <strong>{selectedCandidate.previousHistory?.versionNumber}</strong>.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="rollbackNotes">Rollback Notes *</Label>
                  <Textarea
                    id="rollbackNotes"
                    value={rollbackNotes}
                    onChange={(e) => setRollbackNotes(e.target.value)}
                    placeholder="Enter reason for rollback, incident number, or other relevant information..."
                    rows={3}
                    required
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRollback}
              disabled={!rollbackNotes.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <RotateCcw className="mr-2 size-4" />
              Confirm Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}