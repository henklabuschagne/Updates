import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  History,
  Search,
  Calendar,
  User,
  Package,
  Download,
  Filter
} from 'lucide-react';
import { apiClient, type ClientResponse, type VersionResponse, type ClientVersionHistory } from '../services/api';

interface UpdateRecord {
  clientVersionId: number;
  clientId: number;
  clientName: string;
  versionId: number;
  versionNumber: string;
  versionName: string;
  assignedDate: string;
  updatedBy: number;
  updatedByName: string;
  notes: string;
  isCurrentVersion: boolean;
}

export function UpdateHistory() {
  const [updates, setUpdates] = useState<UpdateRecord[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<UpdateRecord[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [versions, setVersions] = useState<VersionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUpdates();
  }, [updates, searchTerm, selectedClient, selectedVersion, dateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all clients and versions
      const [clientsData, versionsData] = await Promise.all([
        apiClient.getAllClients(),
        apiClient.getAllVersions()
      ]);
      
      setClients(clientsData);
      setVersions(versionsData);
      
      // Load version history for all clients
      const allUpdates: UpdateRecord[] = [];
      
      for (const client of clientsData) {
        try {
          const history = await apiClient.getClientVersionHistory(client.clientId);
          const clientUpdates = history.map(h => ({
            clientVersionId: h.clientVersionId,
            clientId: client.clientId,
            clientName: client.clientName,
            versionId: h.versionId,
            versionNumber: h.versionNumber,
            versionName: h.versionName,
            assignedDate: h.assignedDate,
            updatedBy: h.updatedBy,
            updatedByName: h.updatedByName,
            notes: h.notes,
            isCurrentVersion: h.isCurrentVersion
          }));
          allUpdates.push(...clientUpdates);
        } catch (error) {
          console.error(`Failed to load history for client ${client.clientName}:`, error);
        }
      }
      
      // Sort by date descending
      allUpdates.sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
      setUpdates(allUpdates);
      
    } catch (error: any) {
      console.error('Failed to load update history:', error);
      toast.error('Failed to load update history');
    } finally {
      setLoading(false);
    }
  };

  const filterUpdates = () => {
    let filtered = [...updates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(update =>
        update.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.versionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.versionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.updatedByName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Client filter
    if (selectedClient !== 'all') {
      filtered = filtered.filter(update => update.clientId === parseInt(selectedClient));
    }

    // Version filter
    if (selectedVersion !== 'all') {
      filtered = filtered.filter(update => update.versionId === parseInt(selectedVersion));
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
      const cutoffDate = new Date(now.setDate(now.getDate() - days));
      
      filtered = filtered.filter(update => 
        new Date(update.assignedDate) >= cutoffDate
      );
    }

    setFilteredUpdates(filtered);
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Client', 'From Version', 'To Version', 'Updated By', 'Notes', 'Current'].join(','),
      ...filteredUpdates.map(update => [
        new Date(update.assignedDate).toLocaleString(),
        update.clientName,
        '', // We don't have "from version" in the data
        `${update.versionNumber} - ${update.versionName}`,
        update.updatedByName,
        `"${update.notes || ''}"`,
        update.isCurrentVersion ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `update-history-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Update history exported successfully');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading update history...</p>
      </div>
    );
  }

  const totalUpdates = updates.length;
  const currentVersions = updates.filter(u => u.isCurrentVersion).length;
  const last30Days = updates.filter(u => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(u.assignedDate) >= thirtyDaysAgo;
  }).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <History className="h-8 w-8 text-blue-600" />
              <h1 className="text-gray-900">Update History</h1>
            </div>
            <p className="text-gray-600">Complete history of all software deployments and version updates</p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Updates</p>
            <p className="text-2xl text-gray-900">{totalUpdates}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Current Versions</p>
            <p className="text-2xl text-blue-600">{currentVersions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
            <p className="text-2xl text-green-600">{last30Days}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Active Clients</p>
            <p className="text-2xl text-gray-900">{clients.filter(c => c.isActive).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search updates..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Client Filter */}
            <div>
              <Label htmlFor="client">Client</Label>
              <select
                id="client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Clients</option>
                {clients.map(client => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.clientName}
                  </option>
                ))}
              </select>
            </div>

            {/* Version Filter */}
            <div>
              <Label htmlFor="version">Version</Label>
              <select
                id="version"
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Versions</option>
                {versions.map(version => (
                  <option key={version.versionId} value={version.versionId}>
                    {version.versionNumber} - {version.versionName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <select
                id="dateRange"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as '7d' | '30d' | '90d' | 'all')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update History Table */}
      {filteredUpdates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No update history found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUpdates.map((update) => (
            <Card key={update.clientVersionId}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-gray-900">{update.clientName}</h3>
                        {update.isCurrentVersion && (
                          <Badge className="bg-blue-600">Current</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>{update.versionNumber} - {update.versionName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{update.updatedByName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(update.assignedDate)}</span>
                        </div>
                      </div>

                      {update.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{update.notes}</p>
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

      {/* Results count */}
      {filteredUpdates.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {filteredUpdates.length} of {totalUpdates} total updates
        </div>
      )}
    </div>
  );
}