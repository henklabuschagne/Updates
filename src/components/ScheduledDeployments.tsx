import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Code,
  GitBranch
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useAppStore } from '../hooks/useAppStore';

export function ScheduledDeployments() {
  const { crfs, apiConfigurations, workflowSteps, crfApprovals, reads } = useAppStore('crfs', 'apiConfig', 'workflow', 'crfApprovals');

  const approvedCRFs = crfs.filter(crf => crf.status === 'Approved');
  const enabledAPIs = apiConfigurations.filter(api => api.isEnabled);
  const activeWorkflowSteps = workflowSteps.filter(step => step.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Scheduled Deployments</h2>
          <p className="text-muted-foreground">Approved CRFs will automatically deploy at scheduled date/time</p>
        </div>
      </div>

      {approvedCRFs.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Calendar className="size-16 text-muted-foreground/40 mb-4" />
              <p className="text-foreground mb-2">No Scheduled Deployments</p>
              <p className="text-muted-foreground">Approved CRFs will appear here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert className="border-brand-secondary bg-brand-primary-light">
            <AlertCircle className="size-4 text-brand-primary" />
            <AlertDescription className="text-foreground/80">
              <span className="text-foreground font-medium">Automatic Deployment:</span> At the scheduled time, the system will execute {enabledAPIs.length} deployment APIs in sequence for each approved CRF.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {approvedCRFs.map((crf) => {
              const approvals = reads.getCRFApprovals(crf.crfId);
              return (
                <Card key={crf.crfId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="size-5 text-brand-success" />
                          {crf.crfNumber}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">{crf.title}</p>
                      </div>
                      <Badge className="bg-brand-success-light text-brand-success border-brand-success-mid">
                        Approved & Scheduled
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Version</p>
                        <p className="text-foreground">{crf.versionNumber} - {crf.versionName}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="size-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Scheduled Date</p>
                        </div>
                        <p className="text-foreground">
                          {crf.scheduledDeploymentDate
                            ? new Date(crf.scheduledDeploymentDate).toLocaleDateString()
                            : 'Not scheduled'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-brand-primary-light border border-brand-secondary rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Code className="size-4 text-brand-primary" />
                          <span className="text-foreground font-medium">Deployment Plan</span>
                        </div>
                        <Badge variant="outline">{enabledAPIs.length} APIs</Badge>
                      </div>
                      <div className="space-y-2">
                        {enabledAPIs.slice(0, 3).map((api, index) => (
                          <div key={api.apiConfigurationId} className="flex items-center gap-2 text-foreground/80">
                            <span className="text-brand-primary">{index + 1}.</span>
                            <span>{api.apiName}</span>
                            <Badge variant="outline" className="text-xs">{api.httpMethod}</Badge>
                          </div>
                        ))}
                        {enabledAPIs.length > 3 && (
                          <p className="text-muted-foreground">+ {enabledAPIs.length - 3} more APIs...</p>
                        )}
                      </div>
                    </div>

                    {approvals.length > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Approval History</p>
                        <div className="space-y-1">
                          {approvals
                            .filter(a => a.status === 'Approved')
                            .map((step) => (
                              <div key={step.crfApprovalId} className="flex items-center gap-2 text-foreground/80">
                                <CheckCircle className="size-3 text-brand-success" />
                                <span>{step.approverName} ({step.stepName})</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-brand-primary-light border border-brand-secondary rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="size-4 text-brand-primary" />
                        <span className="text-foreground font-medium">Completed {activeWorkflowSteps.length} approval steps</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}