import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  GitBranch,
  Settings,
  Plus,
  History as HistoryIcon,
  Loader2
} from 'lucide-react';
import { useUser } from '../utils/userContext';
import { EmptyState } from './EmptyState';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner@2.0.3';
import type { CRFResponse, CRFApprovalResponse } from '../services/api';

export function CRFWorkflow() {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  // Reactive state from the store - no loading/useEffect needed
  const {
    crfs,
    workflowSteps: allWorkflowSteps,
    reads,
    actions,
  } = useAppStore('crfs', 'workflow', 'crfApprovals');

  const workflowSteps = allWorkflowSteps.filter(s => s.isActive);

  const [selectedCRF, setSelectedCRF] = useState<CRFResponse | null>(null);
  const [selectedCRFApprovals, setSelectedCRFApprovals] = useState<CRFApprovalResponse[]>([]);
  const [approvalComments, setApprovalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canConfigureWorkflow = currentUser.role === 'devops';

  const handleViewDetails = (crf: CRFResponse) => {
    setSelectedCRF(crf);
    // Read approvals synchronously from store
    const approvals = reads.getCRFApprovals(crf.crfId);
    setSelectedCRFApprovals(approvals);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending' || statusLower.includes('pending')) {
      return 'bg-brand-warning-light text-brand-warning border-brand-warning-mid';
    }
    if (statusLower === 'approved') {
      return 'bg-brand-success-light text-brand-success border-brand-success-mid';
    }
    if (statusLower === 'rejected') {
      return 'bg-brand-error-light text-brand-error border-brand-error-mid';
    }
    if (statusLower === 'completed' || statusLower === 'deployed') {
      return 'bg-brand-primary-light text-brand-primary border-brand-secondary';
    }
    return 'bg-muted text-foreground/80 border-border';
  };

  const handleApprove = async (approval: CRFApprovalResponse) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const result = await actions.updateCRFApproval(approval.crfApprovalId, {
        status: 'Approved',
        comments: approvalComments || 'Approved'
      });
      
      if (result.success) {
        toast.success('CRF approved successfully');
        setApprovalComments('');
        // Refresh approvals from store
        if (selectedCRF) {
          setSelectedCRFApprovals(reads.getCRFApprovals(selectedCRF.crfId));
        }
      } else {
        toast.error(result.error?.message || 'Failed to approve CRF');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve CRF');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (approval: CRFApprovalResponse) => {
    if (isSubmitting) return;
    
    if (!approvalComments.trim()) {
      toast.error('Please provide rejection comments');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const result = await actions.updateCRFApproval(approval.crfApprovalId, {
        status: 'Rejected',
        comments: approvalComments
      });
      
      if (result.success) {
        toast.success('CRF rejected');
        setApprovalComments('');
        if (selectedCRF) {
          setSelectedCRFApprovals(reads.getCRFApprovals(selectedCRF.crfId));
        }
      } else {
        toast.error(result.error?.message || 'Failed to reject CRF');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject CRF');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter CRFs by status
  const pendingCRFs = crfs.filter(c => 
    c.status.toLowerCase() === 'pending' || c.status.toLowerCase().includes('pending')
  );
  const approvedCRFs = crfs.filter(c => c.status.toLowerCase() === 'approved');
  const completedCRFs = crfs.filter(c => 
    c.status.toLowerCase() === 'completed' || c.status.toLowerCase() === 'deployed'
  );
  const rejectedCRFs = crfs.filter(c => c.status.toLowerCase() === 'rejected');

  const CRFCard = ({ crf }: { crf: CRFResponse }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="size-5 text-brand-primary" />
              <CardTitle>{crf.crfNumber}</CardTitle>
            </div>
            <p className="text-foreground/80 mb-2">{crf.title}</p>
            <Badge className={getStatusColor(crf.status)}>{crf.status}</Badge>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => handleViewDetails(crf)}>
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>CRF Details: {crf.crfNumber}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/crf/approval-history?crfId=${crf.crfId}`)}
                  >
                    <HistoryIcon className="mr-2 h-4 w-4" />
                    View Full History
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Title</p>
                    <p className="text-foreground">{crf.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Requested By</p>
                    <p className="text-foreground">{crf.requestedByName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Version</p>
                    <p className="text-foreground">{crf.versionNumber} - {crf.versionName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Priority</p>
                    <Badge>{crf.priority}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Scheduled Date</p>
                    <p className="text-foreground">
                      {crf.scheduledDeploymentDate 
                        ? new Date(crf.scheduledDeploymentDate).toLocaleDateString()
                        : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Client Count</p>
                    <p className="text-foreground">{crf.clientCount} clients</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-foreground/80">{crf.description}</p>
                  </div>
                </div>

                {/* Approval History */}
                <div>
                  <p className="text-foreground font-medium mb-3">Approval History</p>
                  {selectedCRFApprovals.length === 0 ? (
                    <p className="text-muted-foreground italic">No approval history yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCRFApprovals
                        .sort((a, b) => a.stepOrder - b.stepOrder)
                        .map((approval) => (
                        <div key={approval.crfApprovalId} className="flex gap-3 p-3 bg-muted rounded-lg">
                          <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            approval.status === 'Approved' ? 'bg-brand-success-light' :
                            approval.status === 'Rejected' ? 'bg-brand-error-light' :
                            'bg-brand-warning-light'
                          }`}>
                            {approval.status === 'Approved' ? (
                              <CheckCircle className="size-4 text-brand-success" />
                            ) : approval.status === 'Rejected' ? (
                              <XCircle className="size-4 text-brand-error" />
                            ) : (
                              <Clock className="size-4 text-brand-warning" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-foreground">{approval.approverName || 'Pending'}</p>
                              {approval.approvalDate && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(approval.approvalDate).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-1">{approval.stepName} - {approval.status}</p>
                            {approval.comments && (
                              <p className="text-foreground/80 italic">"{approval.comments}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current Pending Approval */}
                {selectedCRFApprovals.some(a => a.status === 'Pending') && (
                  <div className="p-4 bg-brand-warning-light border border-brand-warning-mid rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="size-5 text-brand-warning" />
                      <p className="text-foreground font-medium">Pending Approval</p>
                    </div>
                    {selectedCRFApprovals
                      .filter(a => a.status === 'Pending')
                      .map(a => (
                        <p key={a.crfApprovalId} className="text-foreground/80">
                          {a.stepName} - {a.approverName || 'Awaiting assignment'}
                        </p>
                      ))
                    }
                  </div>
                )}

                {/* Approval Actions */}
                {selectedCRFApprovals.some(a => 
                  a.status === 'Pending' && 
                  a.approverUserId === currentUser.userId
                ) && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-foreground font-medium">Review & Approve</p>
                    <Textarea
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      placeholder="Add comments (required for rejection)..."
                      rows={3}
                      disabled={isSubmitting}
                    />
                    <div className="flex gap-3">
                      {selectedCRFApprovals
                        .filter(a => a.status === 'Pending' && a.approverUserId === currentUser.userId)
                        .map(approval => (
                          <div key={approval.crfApprovalId} className="flex gap-3 w-full">
                            <Button 
                              onClick={() => handleApprove(approval)}
                              className="flex-1"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 size-4" />
                              )}
                              Approve
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleReject(approval)}
                              className="flex-1"
                              disabled={isSubmitting}
                            >
                              <XCircle className="mr-2 size-4" />
                              Reject
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Version</p>
            <p className="text-foreground">{crf.versionNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Requested By</p>
            <p className="text-foreground">{crf.requestedByName}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Priority</p>
          <Badge>{crf.priority}</Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-4" />
          <span>
            Scheduled: {crf.scheduledDeploymentDate 
              ? new Date(crf.scheduledDeploymentDate).toLocaleDateString()
              : 'Not scheduled'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="size-4" />
          <span>{crf.clientCount} clients</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-2">CRF Workflow Management</h1>
            <p className="text-muted-foreground">Track and manage change request approvals</p>
          </div>
          <div className="flex gap-2">
            {canConfigureWorkflow && (
              <Link to="/settings">
                <Button variant="outline">
                  <Settings className="mr-2 size-4" />
                  Configure Workflow
                </Button>
              </Link>
            )}
            <Link to="/crf/new">
              <Button>
                <Plus className="mr-2 size-4" />
                New CRF
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Workflow Overview */}
      {workflowSteps.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Workflow Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {workflowSteps
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step, index) => (
                <div key={step.workflowStepId} className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col items-center min-w-[140px]">
                    <div className={`size-10 rounded-full flex items-center justify-center mb-2 ${
                      step.isRequired ? 'bg-brand-error-light text-brand-error' : 'bg-brand-primary-light text-brand-primary'
                    }`}>
                      {step.stepOrder}
                    </div>
                    <p className="text-foreground text-center mb-1">{step.stepName}</p>
                    {step.isRequired && (
                      <p className="text-muted-foreground text-center">(Required)</p>
                    )}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="text-muted-foreground text-2xl">&rarr;</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="size-4" />
            Pending ({pendingCRFs.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="size-4" />
            Approved ({approvedCRFs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <GitBranch className="size-4" />
            Completed ({completedCRFs.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="size-4" />
            Rejected ({rejectedCRFs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingCRFs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Pending CRFs"
              description="There are currently no CRFs pending approval. Create a new CRF to get started."
              actionLabel="Create New CRF"
              onAction={() => navigate('/crf/new')}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingCRFs.map(crf => <CRFCard key={crf.crfId} crf={crf} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedCRFs.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No Approved CRFs"
              description="No CRFs have been approved yet."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {approvedCRFs.map(crf => <CRFCard key={crf.crfId} crf={crf} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedCRFs.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No Completed CRFs"
              description="No CRFs have been completed yet."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedCRFs.map(crf => <CRFCard key={crf.crfId} crf={crf} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedCRFs.length === 0 ? (
            <EmptyState
              icon={XCircle}
              title="No Rejected CRFs"
              description="No CRFs have been rejected."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rejectedCRFs.map(crf => <CRFCard key={crf.crfId} crf={crf} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}