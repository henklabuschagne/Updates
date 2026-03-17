import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Download, FileText, Users, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import apiClient, { 
  type AdvancedSearchRequest,
  type AdvancedSearchResult,
  type CRFSearchResult,
  type ClientSearchResult,
  type VersionSearchResult,
  type ErrorSearchResult,
  type DeploymentSearchResult,
  type VersionResponse
} from '../services/api';

interface SearchFilters {
  keyword: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  version: string;
  severity: string;
  category: string;
}

export function AdvancedSearch() {
  const [activeTab, setActiveTab] = useState<'crfs' | 'clients' | 'versions' | 'errors' | 'deployments'>('crfs');
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    version: 'all',
    severity: 'all',
    category: 'all'
  });

  const [versions, setVersions] = useState<VersionResponse[]>([]);

  const [filteredCRFs, setFilteredCRFs] = useState<CRFSearchResult[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientSearchResult[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<VersionSearchResult[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorSearchResult[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<DeploymentSearchResult[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (hasSearched) {
      performSearch();
    }
  }, [filters, activeTab]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Only load versions for dropdown options
      const versionsData = await apiClient.getAllVersions();
      setVersions(versionsData);
    } catch (error) {
      toast.error('Failed to load versions');
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async () => {
    setHasSearched(true);
    setIsLoading(true);
    
    try {
      // Build search request
      const searchRequest: AdvancedSearchRequest = {
        keyword: filters.keyword || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        version: filters.version !== 'all' ? filters.version : undefined,
        severity: filters.severity !== 'all' ? filters.severity : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        pageNumber: 1,
        pageSize: 100
      };

      // Perform backend search
      const result: AdvancedSearchResult = await apiClient.advancedSearch(searchRequest);

      // Update filtered results
      setFilteredCRFs(result.crfs);
      setFilteredClients(result.clients);
      setFilteredVersions(result.versions);
      setFilteredErrors(result.errors);
      setFilteredDeployments(result.deployments);

      toast.success(`Found ${result.summary.totalResults} results`);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to perform search');
      // Clear results on error
      setFilteredCRFs([]);
      setFilteredClients([]);
      setFilteredVersions([]);
      setFilteredErrors([]);
      setFilteredDeployments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      version: 'all',
      severity: 'all',
      category: 'all'
    });
    setHasSearched(false);
    setFilteredCRFs([]);
    setFilteredClients([]);
    setFilteredVersions([]);
    setFilteredErrors([]);
    setFilteredDeployments([]);
  };

  const exportResults = () => {
    let data: any[] = [];
    let filename = '';

    switch (activeTab) {
      case 'crfs':
        data = filteredCRFs;
        filename = 'crfs-search-results.csv';
        break;
      case 'clients':
        data = filteredClients;
        filename = 'clients-search-results.csv';
        break;
      case 'versions':
        data = filteredVersions;
        filename = 'versions-search-results.csv';
        break;
      case 'errors':
        data = filteredErrors;
        filename = 'errors-search-results.csv';
        break;
      case 'deployments':
        data = filteredDeployments;
        filename = 'deployments-search-results.csv';
        break;
    }

    if (data.length === 0) {
      toast.error('No results to export');
      return;
    }

    const csv = JSON.stringify(data);
    const blob = new Blob([csv], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    toast.success(`Exported ${data.length} results`);
  };

  const getResultCount = () => {
    switch (activeTab) {
      case 'crfs': return filteredCRFs.length;
      case 'clients': return filteredClients.length;
      case 'versions': return filteredVersions.length;
      case 'errors': return filteredErrors.length;
      case 'deployments': return filteredDeployments.length;
      default: return 0;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Draft': 'secondary',
      'Pending': 'secondary',
      'Approved': 'default',
      'Deployed': 'default',
      'Rejected': 'destructive',
      'Failed': 'destructive',
      'Active': 'default',
      'Inactive': 'outline',
      'Queued': 'secondary',
      'Running': 'secondary',
      'Completed': 'default',
      'Cancelled': 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Advanced Search</h1>
        <p className="text-gray-600">Search across all entities with advanced filters</p>
      </div>

      {/* Search Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="keyword">Keyword</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="keyword"
                  placeholder="Search..."
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Deployed">Deployed</option>
                <option value="Rejected">Rejected</option>
                <option value="Failed">Failed</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <select
                id="version"
                value={filters.version}
                onChange={(e) => setFilters({ ...filters, version: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Versions</option>
                {versions.map(v => (
                  <option key={v.versionId} value={v.versionNumber}>{v.versionNumber}</option>
                ))}
              </select>
            </div>

            {activeTab === 'errors' && (
              <div>
                <Label htmlFor="severity">Severity</Label>
                <select
                  id="severity"
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="Error">Error</option>
                  <option value="Warning">Warning</option>
                  <option value="Info">Info</option>
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={performSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            {hasSearched && getResultCount() > 0 && (
              <Button variant="outline" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search Results</CardTitle>
              <Badge variant="secondary">{getResultCount()} results found</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="crfs">
                  <FileText className="h-4 w-4 mr-2" />
                  CRFs ({filteredCRFs.length})
                </TabsTrigger>
                <TabsTrigger value="clients">
                  <Users className="h-4 w-4 mr-2" />
                  Clients ({filteredClients.length})
                </TabsTrigger>
                <TabsTrigger value="versions">
                  <Package className="h-4 w-4 mr-2" />
                  Versions ({filteredVersions.length})
                </TabsTrigger>
                <TabsTrigger value="errors">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Errors ({filteredErrors.length})
                </TabsTrigger>
                <TabsTrigger value="deployments">
                  Deployments ({filteredDeployments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crfs" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredCRFs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No CRFs found</div>
                ) : (
                  <div className="space-y-3">
                    {filteredCRFs.map(crf => (
                      <div key={crf.crfId} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{crf.crfNumber}</span>
                            {getStatusBadge(crf.status)}
                          </div>
                          {crf.versionNumber && <Badge variant="outline">{crf.versionNumber}</Badge>}
                        </div>
                        <p className="text-gray-700 mb-1">{crf.title}</p>
                        {crf.description && <p className="text-gray-500 text-sm">{crf.description}</p>}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>Created by {crf.createdBy}</span>
                          <span>•</span>
                          <span>{new Date(crf.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="clients" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No clients found</div>
                ) : (
                  <div className="space-y-3">
                    {filteredClients.map(client => (
                      <div key={client.clientId} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-900">{client.clientName}</span>
                          {getStatusBadge(client.status)}
                        </div>
                        <p className="text-gray-600 text-sm">Code: {client.clientCode}</p>
                        {client.currentVersion && <p className="text-gray-600 text-sm">Version: {client.currentVersion}</p>}
                        {client.contactEmail && <p className="text-gray-500 text-sm">{client.contactEmail}</p>}
                        {client.contactPerson && <p className="text-gray-500 text-sm">Contact: {client.contactPerson}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="versions" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredVersions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No versions found</div>
                ) : (
                  <div className="space-y-3">
                    {filteredVersions.map(version => (
                      <div key={version.versionId} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{version.versionNumber}</span>
                            {version.isStable && <Badge variant="default">Stable</Badge>}
                            {getStatusBadge(version.status)}
                          </div>
                          <span className="text-gray-500 text-sm">{new Date(version.releaseDate).toLocaleDateString()}</span>
                        </div>
                        {version.description && <p className="text-gray-600 text-sm mb-2">{version.description}</p>}
                        <p className="text-gray-500 text-sm">{version.clientCount} client{version.clientCount !== 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="errors" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredErrors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No errors found</div>
                ) : (
                  <div className="space-y-3">
                    {filteredErrors.map(error => (
                      <div key={error.errorId} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={error.severity === 'Critical' ? 'destructive' : 'secondary'}>
                            {error.severity}
                          </Badge>
                          <Badge variant="outline">{error.errorCode}</Badge>
                          {error.isResolved && <Badge variant="default">Resolved</Badge>}
                        </div>
                        <p className="text-gray-900 mb-1">{error.errorMessage}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                          {error.clientName && <span>Client: {error.clientName}</span>}
                          {error.versionNumber && <span>• Version: {error.versionNumber}</span>}
                          <span>• {new Date(error.occurredAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="deployments" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredDeployments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No deployments found</div>
                ) : (
                  <div className="space-y-3">
                    {filteredDeployments.map(deployment => (
                      <div key={deployment.deploymentId} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {deployment.crfNumber && <span className="text-gray-900">{deployment.crfNumber}</span>}
                            {getStatusBadge(deployment.status)}
                          </div>
                          {deployment.priority !== undefined && <Badge variant="outline">Priority: {deployment.priority}</Badge>}
                        </div>
                        {deployment.clientName && <p className="text-gray-600">{deployment.clientName}</p>}
                        {deployment.versionNumber && <p className="text-gray-600 text-sm">Version: {deployment.versionNumber}</p>}
                        <div className="flex gap-2 text-xs text-gray-500 mt-2">
                          {deployment.scheduledDate && <span>Scheduled: {new Date(deployment.scheduledDate).toLocaleString()}</span>}
                          {deployment.scheduledDate && <span>•</span>}
                          <span>Created: {new Date(deployment.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}