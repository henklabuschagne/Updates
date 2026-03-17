import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Search,
  Plus,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useUser } from '../utils/userContext';
import { apiClient, type CRFResponse } from '../services/api';
import { toast } from 'sonner@2.0.3';

export function CRFManagement() {
  const [crfs, setCRFs] = useState<CRFResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useUser();

  const canManage = currentUser.role === 'devops';

  useEffect(() => {
    loadCRFs();
  }, [activeTab]);

  const loadCRFs = async () => {
    try {
      setIsLoading(true);
      const statusFilter = activeTab === 'all' ? undefined : activeTab;
      const data = await apiClient.getAllCRFs(statusFilter);
      setCRFs(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load CRFs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCRFs = crfs.filter(crf =>
    crf.crfNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crf.versionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Clock className="size-4" />;
      case 'pending':
        return <AlertCircle className="size-4" />;
      case 'approved':
        return <CheckCircle className="size-4" />;
      case 'deployed':
        return <CheckCircle className="size-4" />;
      case 'rejected':
        return <XCircle className="size-4" />;
      case 'failed':
        return <XCircle className="size-4" />;
      default:
        return <FileText className="size-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'secondary';
      case 'pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'deployed':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CRFCard = ({ crf }: { crf: CRFResponse }) => {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-gray-900">{crf.crfNumber}</CardTitle>
                <Badge variant={getStatusColor(crf.status)} className="flex items-center gap-1">
                  {getStatusIcon(crf.status)}
                  {crf.status}
                </Badge>
                <Badge variant={getPriorityColor(crf.priority)}>
                  {crf.priority}
                </Badge>
              </div>
              <p className="text-gray-700 mb-2">{crf.title}</p>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="size-4" />
                  <span>v{crf.versionNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  <span>{crf.clientCount} clients</span>
                </div>
              </div>
            </div>
            <ChevronRight className="size-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Requested By</p>
              <p className="text-gray-900">{crf.requestedByName}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Created</p>
              <p className="text-gray-900">{formatDate(crf.createdDate)}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Scheduled Deployment</p>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-gray-500" />
              <span className="text-gray-900">{formatDate(crf.scheduledDeploymentDate)}</span>
            </div>
          </div>

          {crf.status === 'Deployed' && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Deployment Success</span>
                <span className="text-gray-900">
                  {crf.successfulDeployments} / {crf.clientCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${crf.clientCount > 0 ? (crf.successfulDeployments / crf.clientCount) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const stats = {
    total: crfs.length,
    draft: crfs.filter(c => c.status === 'Draft').length,
    pending: crfs.filter(c => c.status === 'Pending').length,
    approved: crfs.filter(c => c.status === 'Approved').length,
    deployed: crfs.filter(c => c.status === 'Deployed').length,
    rejected: crfs.filter(c => c.status === 'Rejected').length
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading CRFs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Change Request Forms (CRF)</h1>
            <p className="text-gray-600">Manage deployment requests and approvals</p>
          </div>
          {canManage && (
            <Button>
              <Plus className="mr-2 size-4" />
              Create New CRF
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 size-5 text-gray-400" />
          <Input
            placeholder="Search CRFs by number, title, or version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Total</p>
            <p className="text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Draft</p>
            <p className="text-gray-900">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Pending</p>
            <p className="text-gray-900">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Approved</p>
            <p className="text-gray-900">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Deployed</p>
            <p className="text-gray-900">{stats.deployed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 mb-1">Rejected</p>
            <p className="text-gray-900">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All CRFs</TabsTrigger>
          <TabsTrigger value="Draft">Draft</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Deployed">Deployed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredCRFs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <FileText className="size-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'No CRFs found matching your search' : 'No CRFs available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCRFs.map((crf) => (
                <CRFCard key={crf.crfId} crf={crf} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
