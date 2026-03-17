import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings, Power, PowerOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import apiClient, { APIConfigurationResponse, CreateAPIConfigurationRequest, UpdateAPIConfigurationRequest } from '../services/api';

export function APIConfigurationManagement() {
  const [configurations, setConfigurations] = useState<APIConfigurationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'Deployment' | 'Rollback'>('Deployment');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<APIConfigurationResponse | null>(null);
  const [expandedConfig, setExpandedConfig] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    apiName: '',
    apiType: 'Deployment',
    httpMethod: 'POST',
    endpointURL: '',
    executionOrder: 1,
    headers: '{"Content-Type": "application/json"}',
    requestBody: '',
    timeoutSeconds: 300,
    retryCount: 3,
    isEnabled: true,
    description: '',
  });

  useEffect(() => {
    loadConfigurations();
  }, [selectedTab]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllAPIConfigurations(selectedTab);
      setConfigurations(data);
    } catch (error: any) {
      toast.error('Failed to load API configurations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      apiName: '',
      apiType: selectedTab,
      httpMethod: 'POST',
      endpointURL: '',
      executionOrder: configurations.length + 1,
      headers: '{"Content-Type": "application/json", "Authorization": "Bearer {API_KEY}"}',
      requestBody: '{}',
      timeoutSeconds: 300,
      retryCount: 3,
      isEnabled: true,
      description: '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (config: APIConfigurationResponse) => {
    setSelectedConfig(config);
    setFormData({
      apiName: config.apiName,
      apiType: config.apiType,
      httpMethod: config.httpMethod,
      endpointURL: config.endpointURL,
      executionOrder: config.executionOrder,
      headers: config.headers,
      requestBody: config.requestBody,
      timeoutSeconds: config.timeoutSeconds,
      retryCount: config.retryCount,
      isEnabled: config.isEnabled,
      description: config.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const request: CreateAPIConfigurationRequest = {
        apiName: formData.apiName,
        apiType: formData.apiType,
        httpMethod: formData.httpMethod,
        endpointURL: formData.endpointURL,
        executionOrder: formData.executionOrder,
        headers: formData.headers,
        requestBody: formData.requestBody,
        timeoutSeconds: formData.timeoutSeconds,
        retryCount: formData.retryCount,
        isEnabled: formData.isEnabled,
        description: formData.description,
      };

      await apiClient.createAPIConfiguration(request);
      toast.success('API configuration created successfully');
      setIsCreateDialogOpen(false);
      loadConfigurations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API configuration');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConfig) return;

    try {
      const request: UpdateAPIConfigurationRequest = {
        apiName: formData.apiName,
        httpMethod: formData.httpMethod,
        endpointURL: formData.endpointURL,
        executionOrder: formData.executionOrder,
        headers: formData.headers,
        requestBody: formData.requestBody,
        timeoutSeconds: formData.timeoutSeconds,
        retryCount: formData.retryCount,
        isEnabled: formData.isEnabled,
        description: formData.description,
      };

      await apiClient.updateAPIConfiguration(selectedConfig.apiConfigurationId, request);
      toast.success('API configuration updated successfully');
      setIsEditDialogOpen(false);
      setSelectedConfig(null);
      loadConfigurations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update API configuration');
    }
  };

  const handleDelete = async (configId: number) => {
    if (!confirm('Are you sure you want to delete this API configuration?')) return;

    try {
      await apiClient.deleteAPIConfiguration(configId);
      toast.success('API configuration deleted successfully');
      loadConfigurations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete API configuration');
    }
  };

  const toggleExpanded = (configId: number) => {
    setExpandedConfig(expandedConfig === configId ? null : configId);
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      PATCH: 'bg-orange-100 text-orange-800',
      DELETE: 'bg-red-100 text-red-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const renderConfigurationForm = () => (
    <form onSubmit={isCreateDialogOpen ? handleSubmitCreate : handleSubmitEdit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="apiName">API Name *</Label>
          <Input
            id="apiName"
            value={formData.apiName}
            onChange={(e) => setFormData({ ...formData, apiName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="httpMethod">HTTP Method *</Label>
          <select
            id="httpMethod"
            value={formData.httpMethod}
            onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endpointURL">Endpoint URL *</Label>
        <Input
          id="endpointURL"
          value={formData.endpointURL}
          onChange={(e) => setFormData({ ...formData, endpointURL: e.target.value })}
          placeholder="https://api.example.com/endpoint"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="executionOrder">Execution Order *</Label>
          <Input
            id="executionOrder"
            type="number"
            min="1"
            value={formData.executionOrder}
            onChange={(e) => setFormData({ ...formData, executionOrder: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeoutSeconds">Timeout (seconds) *</Label>
          <Input
            id="timeoutSeconds"
            type="number"
            min="1"
            value={formData.timeoutSeconds}
            onChange={(e) => setFormData({ ...formData, timeoutSeconds: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retryCount">Retry Count *</Label>
          <Input
            id="retryCount"
            type="number"
            min="0"
            max="10"
            value={formData.retryCount}
            onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headers">Headers (JSON)</Label>
        <Textarea
          id="headers"
          value={formData.headers}
          onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
          rows={3}
          placeholder='{"Content-Type": "application/json"}'
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requestBody">Request Body (JSON)</Label>
        <Textarea
          id="requestBody"
          value={formData.requestBody}
          onChange={(e) => setFormData({ ...formData, requestBody: e.target.value })}
          rows={4}
          placeholder='{"key": "value"}'
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isEnabled"
          checked={formData.isEnabled}
          onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isEnabled">Enabled</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
        }}>
          Cancel
        </Button>
        <Button type="submit">
          {isCreateDialogOpen ? 'Create' : 'Update'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">API Configuration Management</h2>
          <p className="text-muted-foreground">
            Configure sequential deployment and rollback API calls
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add API Configuration
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'Deployment' | 'Rollback')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="Deployment">Deployment APIs</TabsTrigger>
          <TabsTrigger value="Rollback">Rollback APIs</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : configurations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No {selectedTab.toLowerCase()} API configurations found
                </p>
                <Button onClick={handleCreate} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <Card key={config.apiConfigurationId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                          {config.executionOrder}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{config.apiName}</CardTitle>
                          <CardDescription>{config.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(config.httpMethod)}>
                          {config.httpMethod}
                        </Badge>
                        <Badge variant={config.isEnabled ? 'default' : 'secondary'}>
                          {config.isEnabled ? (
                            <>
                              <Power className="h-3 w-3 mr-1" />
                              Enabled
                            </>
                          ) : (
                            <>
                              <PowerOff className="h-3 w-3 mr-1" />
                              Disabled
                            </>
                          )}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(config.apiConfigurationId)}
                        >
                          {expandedConfig === config.apiConfigurationId ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(config.apiConfigurationId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedConfig === config.apiConfigurationId && (
                    <CardContent className="space-y-4 border-t pt-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Endpoint URL</div>
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {config.endpointURL}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Timeout</div>
                          <div className="text-sm">{config.timeoutSeconds}s</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Retry Count</div>
                          <div className="text-sm">{config.retryCount}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Created By</div>
                          <div className="text-sm">{config.createdByName || 'System'}</div>
                        </div>
                      </div>

                      {config.headers && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Headers</div>
                          <pre className="font-mono text-xs bg-muted p-3 rounded overflow-x-auto">
                            {JSON.stringify(JSON.parse(config.headers), null, 2)}
                          </pre>
                        </div>
                      )}

                      {config.requestBody && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Request Body</div>
                          <pre className="font-mono text-xs bg-muted p-3 rounded overflow-x-auto">
                            {JSON.stringify(JSON.parse(config.requestBody), null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create API Configuration</DialogTitle>
            <DialogDescription>
              Add a new {selectedTab.toLowerCase()} API configuration
            </DialogDescription>
          </DialogHeader>
          {renderConfigurationForm()}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit API Configuration</DialogTitle>
            <DialogDescription>
              Update the API configuration details
            </DialogDescription>
          </DialogHeader>
          {renderConfigurationForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}