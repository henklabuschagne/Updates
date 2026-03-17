import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  GitBranch, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react';
import { useUser } from '../utils/userContext';
import { apiClient, type WorkflowStepResponse } from '../services/api';
import { toast } from 'sonner@2.0.3';

export function WorkflowManagement() {
  const [steps, setSteps] = useState<WorkflowStepResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<WorkflowStepResponse | null>(null);
  const { currentUser } = useUser();

  const canManage = currentUser.role === 'devops';

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getWorkflowSteps();
      setSteps(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load workflow steps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (step: WorkflowStepResponse) => {
    if (step.stepOrder === 1) return;
    
    try {
      await apiClient.reorderWorkflowStep(step.workflowStepId, step.stepOrder - 1);
      toast.success('Step reordered successfully');
      loadSteps();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reorder step');
    }
  };

  const handleMoveDown = async (step: WorkflowStepResponse) => {
    if (step.stepOrder === steps.length) return;
    
    try {
      await apiClient.reorderWorkflowStep(step.workflowStepId, step.stepOrder + 1);
      toast.success('Step reordered successfully');
      loadSteps();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reorder step');
    }
  };

  const handleDelete = async (stepId: number) => {
    if (!confirm('Are you sure you want to delete this workflow step?')) return;
    
    try {
      await apiClient.deleteWorkflowStep(stepId);
      toast.success('Step deleted successfully');
      loadSteps();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete step');
    }
  };

  const WorkflowStepCard = ({ step }: { step: WorkflowStepResponse }) => {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveUp(step)}
                disabled={step.stepOrder === 1 || !canManage}
                className="h-6 w-6 p-0"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveDown(step)}
                disabled={step.stepOrder === steps.length || !canManage}
                className="h-6 w-6 p-0"
              >
                <ArrowDown className="size-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
              <span>{step.stepOrder}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-gray-900">{step.stepName}</h3>
                {step.isRequired && (
                  <Badge variant="outline" className="text-red-600">Required</Badge>
                )}
              </div>
              <p className="text-gray-600">Order: {step.stepOrder}</p>
            </div>

            {canManage && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStep(step)}
                >
                  <Edit className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(step.workflowStepId)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading workflow steps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Workflow Configuration</h1>
            <p className="text-gray-600">Configure approval workflow steps for CRF processing</p>
          </div>
          {canManage && (
            <Button>
              <Plus className="mr-2 size-4" />
              Add Workflow Step
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Steps</p>
                <p className="text-gray-900">{steps.length}</p>
              </div>
              <GitBranch className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Required Steps</p>
                <p className="text-gray-900">{steps.filter(s => s.isRequired).length}</p>
              </div>
              <CheckCircle className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Optional Steps</p>
                <p className="text-gray-900">{steps.filter(s => !s.isRequired).length}</p>
              </div>
              <CheckCircle className="size-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Visualization */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Approval Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.workflowStepId} className="flex items-center gap-4">
                <div className="flex flex-col items-center min-w-[200px]">
                  <div className="w-full p-4 border-2 border-blue-600 rounded-lg bg-blue-50 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        {step.stepOrder}
                      </div>
                      {step.isRequired && (
                        <span className="text-red-600">*</span>
                      )}
                    </div>
                    <p className="text-gray-900">{step.stepName}</p>
                    <p className="text-gray-600 mt-1">
                      {step.isRequired ? 'Required' : 'Optional'}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-blue-600" />
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps List */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <GitBranch className="size-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No workflow steps configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step) => (
                <WorkflowStepCard key={step.workflowStepId} step={step} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <CheckCircle className="size-5" />
              </div>
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">About Workflow Steps</h3>
              <p className="text-gray-700 mb-2">
                Workflow steps define the approval process for Change Request Forms (CRFs). Each CRF must pass through these steps in order before deployment.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Required steps must be approved for the CRF to proceed</li>
                <li>Optional steps can be skipped if needed</li>
                <li>Steps are processed in sequential order</li>
                <li>You can reorder steps using the arrow buttons</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
