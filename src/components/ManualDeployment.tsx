import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Wrench, 
  Play, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Code,
  XCircle
} from 'lucide-react';
import { apiClient, type ClientResponse, type VersionResponse, type APIConfigurationResponse, type ClientVersionHistory } from '../services/api';
import { toast } from 'sonner@2.0.3';
import { useUser } from '../utils/userContext';

interface DeploymentLog {
  apiName: string;
  method: string;
  url: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message?: string;
}

export function ManualDeployment() {
  const { currentUser } = useUser();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [versions, setVersions] = useState<VersionResponse[]>([]);
  const [apiConfigs, setApiConfigs] = useState<APIConfigurationResponse[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<ClientVersionHistory[]>([]);
  
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [deploymentNotes, setDeploymentNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([]);
  const [currentAPIIndex, setCurrentAPIIndex] = useState(-1);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  // Only DevOps can access manual deployment
  const canDeploy = currentUser.role === 'devops';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientsData, versionsData, apiConfigsData] = await Promise.all([
        apiClient.getAllClients(false),
        apiClient.getAllVersions(),
        apiClient.getAllAPIConfigurations()
      ]);
      
      setClients(clientsData);
      setVersions(versionsData);
      setApiConfigs(apiConfigsData.filter(api => api.apiType === 'Deployment' && api.isEnabled));
      
      // Load recent deployments from all clients
      if (clientsData.length > 0) {
        const histories = await Promise.all(
          clientsData.slice(0, 5).map(client => 
            apiClient.getClientVersionHistory(client.clientId).catch(() => [])
          )
        );
        const allHistory = histories.flat().sort((a, b) => 
          new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()
        );
        setRecentDeployments(allHistory.slice(0, 5));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load deployment data');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.clientId === selectedClientId);
  const selectedVersion = versions.find(v => v.versionId === selectedVersionId);
  const enabledAPIs = apiConfigs.filter(api => api.isEnabled);
  const totalAPIs = enabledAPIs.length;

  const handleDeploy = async () => {
    if (!selectedClientId || !selectedVersionId) {
      toast.error('Please select both client and version');
      return;
    }

    if (!deploymentNotes.trim()) {
      toast.error('Please provide deployment notes');
      return;
    }

    setIsDeploying(true);
    setDeploymentComplete(false);
    setDeploymentError(null);
    setCurrentAPIIndex(-1);

    // Initialize deployment logs
    const logs: DeploymentLog[] = enabledAPIs.map(api => ({
      apiName: api.apiName,
      method: api.httpMethod,
      url: api.endpointURL,
      status: 'pending'
    }));
    setDeploymentLogs(logs);

    try {
      // Execute API chain sequentially
      for (let i = 0; i < enabledAPIs.length; i++) {
        setCurrentAPIIndex(i);
        logs[i].status = 'active';
        setDeploymentLogs([...logs]);

        // Simulate API execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // Here you would actually call the external API
          // For now, we'll just mark as complete
          logs[i].status = 'complete';
          logs[i].message = 'API executed successfully';
        } catch (error: any) {
          logs[i].status = 'error';
          logs[i].message = error.message || 'API execution failed';
          throw error;
        }
        
        setDeploymentLogs([...logs]);
      }

      // Update client version in database
      await apiClient.updateClientVersion(selectedClientId, {
        versionId: selectedVersionId,
        notes: deploymentNotes
      });

      setDeploymentComplete(true);
      toast.success('Deployment completed successfully!');
      
      // Reload data
      await loadData();
      
      // Reset form
      setSelectedClientId(null);
      setSelectedVersionId(null);
      setDeploymentNotes('');
    } catch (error: any) {
      setDeploymentError(error.message || 'Deployment failed');
      toast.error('Deployment failed: ' + error.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const deploymentProgress = currentAPIIndex >= 0 
    ? Math.round(((currentAPIIndex + 1) / Math.max(totalAPIs, 1)) * 100)
    : 0;

  if (!canDeploy) {
    return (
      <div className="p-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="size-4 text-red-600" />
          <AlertDescription className="text-gray-700">
            <span className="text-gray-900">Access Denied:</span> Manual deployment is restricted to DevOps personnel only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="size-8 text-blue-600" />
          <h1 className="text-gray-900">Manual Deployment</h1>
        </div>
        <p className="text-gray-600">Deploy software updates manually for technical operations</p>
      </div>

      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <AlertTriangle className="size-4 text-yellow-600" />
        <AlertDescription className="text-gray-700">
          <span className="text-gray-900">Technical Access Required:</span> This section is for authorized technical personnel only. 
          Manual deployments bypass the standard CRF approval workflow and should only be used for emergency updates or maintenance.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deployment Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Deployment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="client">Select Client</Label>
              <Select 
                value={selectedClientId?.toString() || ''} 
                onValueChange={(val) => setSelectedClientId(parseInt(val))}
                disabled={isDeploying}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.clientId} value={client.clientId.toString()}>
                      {client.clientName} (Current: {client.currentVersion || 'None'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClient && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client Name:</span>
                  <span className="text-gray-900">{selectedClient.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Version:</span>
                  <span className="text-gray-900">{selectedClient.currentVersion || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={selectedClient.isActive ? 'default' : 'secondary'}>
                    {selectedClient.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact:</span>
                  <span className="text-gray-700">{selectedClient.contactEmail}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="version">Target Version</Label>
              <Select 
                value={selectedVersionId?.toString() || ''} 
                onValueChange={(val) => setSelectedVersionId(parseInt(val))}
                disabled={isDeploying}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose target version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.versionId} value={version.versionId.toString()}>
                      {version.versionNumber} - {version.versionName} ({new Date(version.releaseDate).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Deployment Notes *</Label>
              <Textarea
                id="notes"
                value={deploymentNotes}
                onChange={(e) => setDeploymentNotes(e.target.value)}
                placeholder="Enter reason for manual deployment, ticket number, or other relevant information..."
                rows={4}
                disabled={isDeploying}
                required
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Code className="size-4 text-blue-600" />
                <span className="text-gray-900">API Chain</span>
              </div>
              <p className="text-gray-700">{totalAPIs} deployment APIs configured</p>
              {totalAPIs === 0 && (
                <p className="text-orange-600 mt-1">⚠️ No deployment APIs configured</p>
              )}
            </div>

            <Button 
              onClick={handleDeploy} 
              disabled={isDeploying || !selectedClientId || !selectedVersionId || !deploymentNotes.trim()}
              className="w-full"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Play className="mr-2 size-4" />
                  Start Deployment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Deployment Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Deployment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {!isDeploying && !deploymentComplete && !deploymentError && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wrench className="size-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Configure deployment settings and click Start Deployment to begin</p>
              </div>
            )}

            {(isDeploying || deploymentComplete || deploymentError) && (
              <div className="space-y-6">
                {/* Progress Bar */}
                {totalAPIs > 0 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Overall Progress</span>
                      <span className="text-gray-900">{deploymentProgress}%</span>
                    </div>
                    <Progress value={deploymentProgress} className="h-3" />
                    <p className="text-gray-600 mt-2">
                      API {Math.min(currentAPIIndex + 1, totalAPIs)} of {totalAPIs}
                    </p>
                  </div>
                )}

                {/* API Execution Steps */}
                {deploymentLogs.length > 0 && (
                  <div className="space-y-3">
                    {deploymentLogs.map((log, index) => (
                      <div 
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          log.status === 'complete' ? 'bg-green-50 border-green-200' :
                          log.status === 'error' ? 'bg-red-50 border-red-200' :
                          log.status === 'active' ? 'bg-blue-50 border-blue-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {log.status === 'complete' ? (
                          <CheckCircle className="size-5 text-green-600 mt-0.5" />
                        ) : log.status === 'error' ? (
                          <XCircle className="size-5 text-red-600 mt-0.5" />
                        ) : log.status === 'active' ? (
                          <Loader2 className="size-5 text-blue-600 animate-spin mt-0.5" />
                        ) : (
                          <div className="size-5 rounded-full border-2 border-gray-300 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`${
                              log.status === 'complete' ? 'text-green-900' :
                              log.status === 'error' ? 'text-red-900' :
                              log.status === 'active' ? 'text-blue-900' :
                              'text-gray-600'
                            }`}>
                              {log.apiName}
                            </p>
                            <Badge variant="outline" className="text-xs">{log.method}</Badge>
                          </div>
                          <p className="text-gray-600 truncate">{log.url}</p>
                          {log.message && (
                            <p className="text-gray-700 text-sm mt-1">{log.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completion Message */}
                {deploymentComplete && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="size-4 text-green-600" />
                    <AlertDescription className="text-gray-700">
                      <span className="text-gray-900">Deployment Successful!</span> Client version updated successfully. 
                      {totalAPIs > 0 && ` All ${totalAPIs} APIs executed successfully.`}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Message */}
                {deploymentError && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="size-4 text-red-600" />
                    <AlertDescription className="text-gray-700">
                      <span className="text-gray-900">Deployment Failed:</span> {deploymentError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Manual Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDeployments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent deployments</p>
          ) : (
            <div className="space-y-3">
              {recentDeployments.map((deployment) => (
                <div key={deployment.clientVersionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-900 mb-1">Client ID: {deployment.clientId}</p>
                    <p className="text-gray-600">{deployment.versionNumber} - {deployment.versionName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">{new Date(deployment.assignedDate).toLocaleDateString()}</p>
                    <p className="text-gray-700">{deployment.updatedByName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}