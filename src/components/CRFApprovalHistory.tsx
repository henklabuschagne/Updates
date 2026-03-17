import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  GitBranch,
  User,
  Calendar,
  MessageSquare,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { apiClient, type CRFApprovalResponse, type CRFResponse } from '../services/api';

export function CRFApprovalHistory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const crfId = searchParams.get('crfId');
  
  const [approvals, setApprovals] = useState<CRFApprovalResponse[]>([]);
  const [crfDetails, setCrfDetails] = useState<CRFResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (crfId) {
      loadData();
    }
  }, [crfId]);

  const loadData = async () => {
    if (!crfId) return;
    
    try {
      setLoading(true);
      const [approvalsData, crfData] = await Promise.all([
        apiClient.getCRFApprovals(parseInt(crfId)),
        apiClient.getCRFById(parseInt(crfId))
      ]);
      
      // Sort by step order
      const sortedApprovals = approvalsData.sort((a, b) => a.stepOrder - b.stepOrder);
      setApprovals(sortedApprovals);
      setCrfDetails(crfData);
    } catch (error: any) {
      console.error('Failed to load approval history:', error);
      toast.error('Failed to load approval history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') {
      return <Badge className="bg-green-600">Approved</Badge>;
    } else if (statusLower === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    } else if (statusLower === 'pending') {
      return <Badge className="bg-yellow-600">Pending</Badge>;
    } else {
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!crfId) {
    return (
      <div className="p-8">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-gray-700">
            No CRF ID provided. Please select a CRF to view its approval history.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/crf/workflow')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to CRF Workflow
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading approval history...</p>
      </div>
    );
  }

  const approvedCount = approvals.filter(a => a.status.toLowerCase() === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status.toLowerCase() === 'rejected').length;
  const pendingCount = approvals.filter(a => a.status.toLowerCase() === 'pending').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate('/crf/workflow')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to CRF Workflow
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="h-8 w-8 text-blue-600" />
          <h1 className="text-gray-900">CRF Approval History</h1>
        </div>
        <p className="text-gray-600">
          Complete approval timeline for {crfDetails?.crfNumber || `CRF #${crfId}`}
        </p>
      </div>

      {/* CRF Overview */}
      {crfDetails && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>CRF Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">CRF Number</p>
                <p className="text-gray-900">{crfDetails.crfNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Title</p>
                <p className="text-gray-900">{crfDetails.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Version</p>
                <p className="text-gray-900">{crfDetails.versionNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge>{crfDetails.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Priority</p>
                <Badge variant={crfDetails.priority === 'High' ? 'destructive' : 'secondary'}>
                  {crfDetails.priority}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created By</p>
                <p className="text-gray-900">{crfDetails.requestedByName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created Date</p>
                <p className="text-gray-900">{new Date(crfDetails.createdDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Deployment Date</p>
                <p className="text-gray-900">
                  {crfDetails.scheduledDeploymentDate 
                    ? new Date(crfDetails.scheduledDeploymentDate).toLocaleDateString()
                    : 'Not scheduled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Steps</div>
            <div className="text-2xl text-gray-900">{approvals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Approved</div>
            <div className="text-2xl text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Rejected</div>
            <div className="text-2xl text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No approval steps found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval, index) => (
                <div key={approval.crfApprovalId} className="flex gap-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      approval.status.toLowerCase() === 'approved' 
                        ? 'border-green-600 bg-green-50' 
                        : approval.status.toLowerCase() === 'rejected'
                        ? 'border-red-600 bg-red-50'
                        : approval.status.toLowerCase() === 'pending'
                        ? 'border-yellow-600 bg-yellow-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}>
                      <span className="text-sm font-semibold text-gray-700">
                        {approval.stepOrder}
                      </span>
                    </div>
                    {index < approvals.length - 1 && (
                      <div className="w-0.5 h-full min-h-[60px] bg-gray-200 my-1"></div>
                    )}
                  </div>

                  {/* Approval details */}
                  <div className="flex-1 pb-8">
                    <Card className={
                      approval.status.toLowerCase() === 'approved'
                        ? 'border-l-4 border-l-green-500'
                        : approval.status.toLowerCase() === 'rejected'
                        ? 'border-l-4 border-l-red-500'
                        : approval.status.toLowerCase() === 'pending'
                        ? 'border-l-4 border-l-yellow-500'
                        : ''
                    }>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(approval.status)}
                            <div>
                              <h3 className="text-gray-900">{approval.stepName}</h3>
                              <p className="text-sm text-gray-600">Step {approval.stepOrder}</p>
                            </div>
                          </div>
                          {getStatusBadge(approval.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {approval.approverName && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{approval.approverName}</span>
                            </div>
                          )}
                          
                          {approval.approvalDate && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(approval.approvalDate)}</span>
                            </div>
                          )}
                        </div>

                        {approval.comments && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Comments:</p>
                                <p className="text-sm text-gray-600">{approval.comments}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                          Created: {formatDate(approval.createdDate)}
                        </div>
                      </CardContent>
                    </Card>
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