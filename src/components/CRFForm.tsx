import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar as CalendarIcon, FileText } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { useUser } from '../utils/userContext';
import { toast } from 'sonner@2.0.3';

export function CRFForm() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { clients, versions, workflowSteps, actions } = useAppStore('clients', 'versions', 'workflow');

  const activeClients = clients.filter(c => c.isActive);
  const activeWorkflowSteps = workflowSteps.filter(s => s.isActive).sort((a, b) => a.stepOrder - b.stepOrder);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    crfNumber: '',
    title: '',
    clientId: '',
    versionId: '',
    priority: 'Normal',
    notes: ''
  });

  const selectedClient = activeClients.find(c => c.clientId === Number(formData.clientId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crfNumber.trim() || !formData.title.trim() || !formData.versionId || !formData.clientId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await actions.createCRF({
        crfNumber: formData.crfNumber,
        title: formData.title,
        description: formData.notes,
        versionId: Number(formData.versionId),
        priority: formData.priority,
        scheduledDeploymentDate: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
        clientIds: [Number(formData.clientId)],
      });

      if (result.success) {
        toast.success('CRF Document submitted successfully! It will be routed for approval.');
        navigate('/crf/workflow');
      } else {
        toast.error(result.error?.message || 'Failed to create CRF');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create CRF');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="size-8 text-brand-primary" />
          <h1 className="text-foreground">Create Change Request Form (CRF)</h1>
        </div>
        <p className="text-muted-foreground">Submit a new change request for software update deployment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CRF Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CRF Number */}
            <div className="space-y-2">
              <Label htmlFor="crfNumber">CRF Number *</Label>
              <Input
                id="crfNumber"
                value={formData.crfNumber}
                onChange={(e) => setFormData({ ...formData, crfNumber: e.target.value })}
                placeholder="e.g. CRF-2026-010"
                required
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the change"
                required
              />
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {activeClients.map((client) => (
                    <SelectItem key={client.clientId} value={String(client.clientId)}>
                      {client.clientName} (Current: {client.currentVersion || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Version Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromVersion">Current Version</Label>
                <Input
                  id="fromVersion"
                  value={selectedClient?.currentVersion || ''}
                  readOnly
                  className="bg-muted"
                  placeholder="Select a client first"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toVersion">Target Version *</Label>
                <Select 
                  value={formData.versionId} 
                  onValueChange={(value) => setFormData({ ...formData, versionId: value })}
                  disabled={!formData.clientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions
                      .filter(v => v.versionNumber !== selectedClient?.currentVersion)
                      .map((version) => (
                        <SelectItem key={version.versionId} value={String(version.versionId)}>
                          Version {version.versionNumber} - {version.versionName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label>Scheduled Deployment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {selectedDate ? selectedDate.toLocaleDateString() : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Justification *</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Provide details about the update request, business justification, and any special requirements..."
                rows={4}
                required
              />
            </div>

            {/* Workflow Preview */}
            {activeWorkflowSteps.length > 0 && (
              <div className="p-4 bg-brand-primary-light border border-brand-secondary rounded-lg">
                <h3 className="text-foreground mb-3">Approval Workflow</h3>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {activeWorkflowSteps.map((step, index) => (
                    <div key={step.workflowStepId} className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex flex-col items-center min-w-[120px]">
                        <div className={`size-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-brand-primary text-white' : 
                          step.isRequired ? 'bg-brand-error-light text-brand-error' : 
                          'bg-muted text-foreground/80'
                        }`}>
                          {step.stepOrder}
                        </div>
                        <span className="text-foreground/80 text-center mt-1">{step.stepName}</span>
                        {step.isRequired && index > 0 && (
                          <span className="text-brand-error text-xs mt-1">Required</span>
                        )}
                      </div>
                      {index < activeWorkflowSteps.length - 1 && (
                        <div className="text-muted-foreground">&rarr;</div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground mt-3">
                  Your request will be reviewed by {activeWorkflowSteps.length - 1} approval{activeWorkflowSteps.length - 1 !== 1 ? 's' : ''} before deployment
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit CRF for Approval'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}