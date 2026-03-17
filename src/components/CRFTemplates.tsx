import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Copy, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useNavigate } from 'react-router';
import { apiClient } from '../services/api';
import type { CRFTemplateResponse, CreateCRFTemplateRequest } from '../services/api';

export function CRFTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CRFTemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CRFTemplateResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    templateName: '',
    description: '',
    crfNumberPrefix: 'CRF',
    defaultTitle: '',
    defaultDescription: '',
    defaultPriority: 'Medium',
    isActive: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAllCRFTemplates();
      setTemplates(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.templateName || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const request: CreateCRFTemplateRequest = {
        templateName: formData.templateName,
        description: formData.description,
        crfNumberPrefix: formData.crfNumberPrefix,
        defaultTitle: formData.defaultTitle,
        defaultDescription: formData.defaultDescription,
        defaultPriority: formData.defaultPriority,
      };
      await apiClient.createCRFTemplate(request);
      toast.success('Template created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      await loadTemplates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTemplate = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      await apiClient.updateCRFTemplate(selectedTemplate.crfTemplateId, {
        templateName: formData.templateName,
        description: formData.description,
        crfNumberPrefix: formData.crfNumberPrefix,
        defaultTitle: formData.defaultTitle,
        defaultDescription: formData.defaultDescription,
        defaultPriority: formData.defaultPriority,
        isActive: formData.isActive,
      });
      toast.success('Template updated successfully');
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      resetForm();
      await loadTemplates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await apiClient.deleteCRFTemplate(templateId);
      toast.success('Template deleted successfully');
      await loadTemplates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: CRFTemplateResponse) => {
    setSaving(true);
    try {
      const request: CreateCRFTemplateRequest = {
        templateName: `${template.templateName} (Copy)`,
        description: template.description,
        crfNumberPrefix: template.crfNumberPrefix,
        defaultTitle: template.defaultTitle,
        defaultDescription: template.defaultDescription,
        defaultPriority: template.defaultPriority,
      };
      await apiClient.createCRFTemplate(request);
      toast.success('Template duplicated successfully');
      await loadTemplates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate template');
    } finally {
      setSaving(false);
    }
  };

  const handleUseTemplate = (template: CRFTemplateResponse) => {
    toast.success(`Using template: ${template.templateName}`);
    navigate('/crf/new', { state: { template } });
  };

  const openEditDialog = (template: CRFTemplateResponse) => {
    setSelectedTemplate(template);
    setFormData({
      templateName: template.templateName,
      description: template.description,
      crfNumberPrefix: template.crfNumberPrefix,
      defaultTitle: template.defaultTitle,
      defaultDescription: template.defaultDescription,
      defaultPriority: template.defaultPriority,
      isActive: template.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      templateName: '',
      description: '',
      crfNumberPrefix: 'CRF',
      defaultTitle: '',
      defaultDescription: '',
      defaultPriority: 'Medium',
      isActive: true,
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-blue-100 text-blue-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">CRF Templates</h1>
          <p className="text-gray-600">Create and manage reusable templates for common CRF types</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Templates</div>
            <div className="text-2xl text-gray-900">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Active Templates</div>
            <div className="text-2xl text-gray-900">{templates.filter(t => t.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Inactive Templates</div>
            <div className="text-2xl text-gray-900">{templates.filter(t => !t.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Usage</div>
            <div className="text-2xl text-gray-900">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-gray-900 mb-2">No Templates</h3>
            <p className="text-muted-foreground mb-4">Create your first CRF template to get started.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.crfTemplateId} className={`flex flex-col ${!template.isActive ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {template.isActive && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      {!template.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <CardTitle className="mb-2">{template.templateName}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{template.crfNumberPrefix}</Badge>
                    <Badge className={getPriorityColor(template.defaultPriority)}>
                      {template.defaultPriority}
                    </Badge>
                    <Badge variant="outline">
                      Used {template.usageCount} times
                    </Badge>
                  </div>

                  {template.defaultTitle && (
                    <div className="text-sm text-muted-foreground">
                      <p className="truncate">Title: {template.defaultTitle}</p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>Created by: {template.createdByName}</p>
                    <p>Date: {new Date(template.createdDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    disabled={!template.isActive}
                  >
                    Use Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                    disabled={saving}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.crfTemplateId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create CRF Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for common CRF types
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                  placeholder="e.g., Security Patch"
                />
              </div>
              <div>
                <Label htmlFor="crfNumberPrefix">CRF Number Prefix *</Label>
                <Input
                  id="crfNumberPrefix"
                  value={formData.crfNumberPrefix}
                  onChange={(e) => setFormData({ ...formData, crfNumberPrefix: e.target.value })}
                  placeholder="e.g., CRF, SEC, HOT"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of when to use this template"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultTitle">Default CRF Title</Label>
                <Input
                  id="defaultTitle"
                  value={formData.defaultTitle}
                  onChange={(e) => setFormData({ ...formData, defaultTitle: e.target.value })}
                  placeholder="e.g., Security Patch v{version}"
                />
              </div>
              <div>
                <Label htmlFor="defaultPriority">Default Priority</Label>
                <select
                  id="defaultPriority"
                  value={formData.defaultPriority}
                  onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="defaultDescription">Default CRF Description</Label>
              <Textarea
                id="defaultDescription"
                value={formData.defaultDescription}
                onChange={(e) => setFormData({ ...formData, defaultDescription: e.target.value })}
                rows={4}
                placeholder="Default description text that will pre-fill new CRFs..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Modify template configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-templateName">Template Name *</Label>
                <Input
                  id="edit-templateName"
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-crfNumberPrefix">CRF Number Prefix *</Label>
                <Input
                  id="edit-crfNumberPrefix"
                  value={formData.crfNumberPrefix}
                  onChange={(e) => setFormData({ ...formData, crfNumberPrefix: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-defaultTitle">Default CRF Title</Label>
                <Input
                  id="edit-defaultTitle"
                  value={formData.defaultTitle}
                  onChange={(e) => setFormData({ ...formData, defaultTitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-defaultPriority">Default Priority</Label>
                <select
                  id="edit-defaultPriority"
                  value={formData.defaultPriority}
                  onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-defaultDescription">Default CRF Description</Label>
              <Textarea
                id="edit-defaultDescription"
                value={formData.defaultDescription}
                onChange={(e) => setFormData({ ...formData, defaultDescription: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedTemplate(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEditTemplate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
