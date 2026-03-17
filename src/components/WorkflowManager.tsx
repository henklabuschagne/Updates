import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Plus, 
  Trash2, 
  ArrowUp,
  ArrowDown,
  GitBranch,
  AlertCircle,
  Edit
} from 'lucide-react';
import { apiClient, type WorkflowStepResponse } from '../services/api';

interface WorkflowStep {
  workflowStepId: number;
  stepName: string;
  stepOrder: number;
  isRequired: boolean;
  isActive: boolean;
  createdDate: string;
}

export function WorkflowManager() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [formData, setFormData] = useState({
    stepName: '',
    isRequired: false
  });

  useEffect(() => {
    loadWorkflowSteps();
  }, []);

  const loadWorkflowSteps = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getWorkflowSteps();
      const sortedSteps = data.sort((a, b) => a.stepOrder - b.stepOrder);
      setSteps(sortedSteps);
    } catch (error: any) {
      console.error('Failed to load workflow steps:', error);
      toast.error('Failed to load workflow steps');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStep(null);
    setFormData({ stepName: '', isRequired: false });
    setIsDialogOpen(true);
  };

  const handleEdit = (step: WorkflowStep) => {
    setEditingStep(step);
    setFormData({
      stepName: step.stepName,
      isRequired: step.isRequired
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.stepName.trim()) {
      toast.error('Step name is required');
      return;
    }

    try {
      if (editingStep) {
        // Update existing step
        await apiClient.updateWorkflowStep(editingStep.workflowStepId, {
          stepName: formData.stepName,
          isRequired: formData.isRequired
        });
        toast.success('Workflow step updated successfully');
      } else {
        // Create new step
        const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.stepOrder)) : 0;
        await apiClient.createWorkflowStep({
          stepName: formData.stepName,
          stepOrder: maxOrder + 1,
          isRequired: formData.isRequired
        });
        toast.success('Workflow step created successfully');
      }
      
      setIsDialogOpen(false);
      loadWorkflowSteps();
    } catch (error: any) {
      console.error('Failed to save workflow step:', error);
      toast.error(error.message || 'Failed to save workflow step');
    }
  };

  const handleDelete = async (step: WorkflowStep) => {
    if (!confirm(`Are you sure you want to delete "${step.stepName}"?`)) {
      return;
    }

    try {
      await apiClient.deleteWorkflowStep(step.workflowStepId);
      toast.success('Workflow step deleted successfully');
      loadWorkflowSteps();
    } catch (error: any) {
      console.error('Failed to delete workflow step:', error);
      toast.error(error.message || 'Failed to delete workflow step');
    }
  };

  const handleMoveUp = async (step: WorkflowStep, index: number) => {
    if (index === 0) return;

    try {
      await apiClient.reorderWorkflowStep(step.workflowStepId, step.stepOrder - 1);
      toast.success('Workflow step reordered');
      loadWorkflowSteps();
    } catch (error: any) {
      console.error('Failed to reorder workflow step:', error);
      toast.error('Failed to reorder workflow step');
    }
  };

  const handleMoveDown = async (step: WorkflowStep, index: number) => {
    if (index === steps.length - 1) return;

    try {
      await apiClient.reorderWorkflowStep(step.workflowStepId, step.stepOrder + 1);
      toast.success('Workflow step reordered');
      loadWorkflowSteps();
    } catch (error: any) {
      console.error('Failed to reorder workflow step:', error);
      toast.error('Failed to reorder workflow step');
    }
  };

  const requiredCount = steps.filter(s => s.isRequired).length;
  const activeCount = steps.filter(s => s.isActive).length;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading workflow steps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-1">CRF Approval Workflow</h2>
          <p className="text-gray-600">
            Configure custom approval steps for the change request process
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Add Step
        </Button>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="size-4 text-blue-600" />
        <AlertDescription className="text-gray-700">
          <span className="text-gray-900">Workflow Configuration:</span> Each CRF will follow these approval steps in order. 
          Required steps cannot be skipped. {activeCount} steps active, {requiredCount} required.
        </AlertDescription>
      </Alert>

      {/* Workflow Steps List */}
      {steps.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <GitBranch className="size-16 text-gray-300 mb-4" />
              <p className="text-gray-900 mb-2">No Workflow Steps</p>
              <p className="text-gray-500">Add approval steps to configure the CRF workflow</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card key={step.workflowStepId}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveUp(step, index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveDown(step, index)}
                      disabled={index === steps.length - 1}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    {/* Step Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
                          {step.stepOrder}
                        </div>
                        <div>
                          <h3 className="text-gray-900">{step.stepName}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Step Details */}
                    <div className="flex flex-wrap gap-2 mb-3 ml-10">
                      {step.isRequired && (
                        <Badge variant="destructive">Required</Badge>
                      )}
                      {!step.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mb-3 ml-10">
                      Added on {new Date(step.createdDate).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(step)}
                      >
                        <Edit className="size-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(step)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStep ? 'Edit' : 'Add'} Workflow Step</DialogTitle>
            <DialogDescription>
              {editingStep ? 'Update the' : 'Add a new'} approval step in the CRF workflow
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="stepName">Step Name *</Label>
              <Input
                id="stepName"
                placeholder="e.g., Security Team Review"
                value={formData.stepName}
                onChange={(e) => setFormData({ ...formData, stepName: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isRequired">Required Step</Label>
                <p className="text-sm text-gray-600">This step cannot be skipped</p>
              </div>
              <Switch
                id="isRequired"
                checked={formData.isRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingStep ? 'Update' : 'Create'} Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}