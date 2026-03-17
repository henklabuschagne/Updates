import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  FileText,
  Users,
  Download,
  Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { apiClient, type VersionResponse } from '../services/api';
import { toast } from 'sonner@2.0.3';
import { useUser } from '../utils/userContext';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './LoadingSkeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { Pagination } from './Pagination';
import { usePagination } from '../hooks/usePagination';

export function VersionManagementEnhanced() {
  const [versions, setVersions] = useState<VersionResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionResponse | null>(null);
  const [formData, setFormData] = useState({
    versionNumber: '',
    versionName: '',
    description: '',
    releaseNotes: '',
    releaseDate: new Date().toISOString().split('T')[0],
    isMajorRelease: false,
  });

  const { currentUser } = useUser();
  const canManageVersions = currentUser.role === 'devops';

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAllVersions();
      setVersions(data);
    } catch (error) {
      toast.error('Failed to load versions');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVersions = versions.filter(version =>
    version.versionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.releaseNotes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredVersions, 10);

  const handleCreateVersion = async () => {
    if (!formData.versionNumber || !formData.releaseNotes) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await apiClient.createVersion({
        versionNumber: formData.versionNumber,
        versionName: formData.versionName || formData.versionNumber,
        releaseNotes: formData.releaseNotes,
        releaseDate: formData.releaseDate,
        description: formData.description,
        isMajorRelease: formData.isMajorRelease,
      });
      toast.success('Version created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadVersions();
    } catch (error) {
      toast.error('Failed to create version');
    }
  };

  const handleEditVersion = async () => {
    if (!selectedVersion || !formData.versionNumber || !formData.releaseNotes) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await apiClient.updateVersion(selectedVersion.versionId, {
        versionNumber: formData.versionNumber,
        versionName: formData.versionName || formData.versionNumber,
        releaseNotes: formData.releaseNotes,
        releaseDate: formData.releaseDate,
        description: formData.description,
        isMajorRelease: formData.isMajorRelease,
        isActive: selectedVersion.isActive,
      });
      toast.success('Version updated successfully');
      setIsEditDialogOpen(false);
      setSelectedVersion(null);
      resetForm();
      loadVersions();
    } catch (error) {
      toast.error('Failed to update version');
    }
  };

  const handleDeleteVersion = async () => {
    if (!selectedVersion) return;

    try {
      await apiClient.deleteVersion(selectedVersion.versionId);
      toast.success('Version deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedVersion(null);
      loadVersions();
    } catch (error) {
      toast.error('Failed to delete version');
    }
  };

  const openEditDialog = (version: VersionResponse) => {
    setSelectedVersion(version);
    setFormData({
      versionNumber: version.versionNumber,
      versionName: version.versionName || '',
      description: version.description || '',
      releaseNotes: version.releaseNotes || '',
      releaseDate: version.releaseDate,
      isMajorRelease: version.isMajorRelease || false,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (version: VersionResponse) => {
    setSelectedVersion(version);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      versionNumber: '',
      versionName: '',
      description: '',
      releaseNotes: '',
      releaseDate: new Date().toISOString().split('T')[0],
      isMajorRelease: false,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Version Management</h1>
          <p className="text-gray-600">Loading versions...</p>
        </div>
        <TableSkeleton rows={10} columns={4} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Version Management</h1>
            <p className="text-gray-600">Manage software versions and release notes</p>
          </div>
          {canManageVersions && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Version
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search versions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredVersions.length === 0 ? (
        <EmptyState
          icon={Package}
          title={searchTerm ? 'No versions found' : 'No versions available'}
          description={searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first version'}
          actionLabel={!searchTerm && canManageVersions ? 'Add New Version' : undefined}
          onAction={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <>
          <div className="space-y-4">
            {paginatedData.map((version) => (
              <Card key={version.versionId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle>{version.versionNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Released: {new Date(version.releaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {canManageVersions && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(version)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(version)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label>Release Notes</Label>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {version.releaseNotes || 'No release notes available'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVersions.length > 10 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVersions.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Add a new software version with release notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="versionNumber">Version Number *</Label>
              <Input
                id="versionNumber"
                placeholder="e.g., 2.1.0"
                value={formData.versionNumber}
                onChange={(e) => setFormData({ ...formData, versionNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="versionName">Version Name</Label>
              <Input
                id="versionName"
                placeholder="e.g., Feature Release"
                value={formData.versionName}
                onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="releaseDate">Release Date *</Label>
              <Input
                id="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="releaseNotes">Release Notes *</Label>
              <Textarea
                id="releaseNotes"
                placeholder="Enter release notes..."
                value={formData.releaseNotes}
                onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isMajorRelease"
                type="checkbox"
                checked={formData.isMajorRelease}
                onChange={(e) => setFormData({ ...formData, isMajorRelease: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isMajorRelease">Major Release</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>Create Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Version</DialogTitle>
            <DialogDescription>
              Update version information and release notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-versionNumber">Version Number *</Label>
              <Input
                id="edit-versionNumber"
                value={formData.versionNumber}
                onChange={(e) => setFormData({ ...formData, versionNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-versionName">Version Name</Label>
              <Input
                id="edit-versionName"
                value={formData.versionName}
                onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-releaseDate">Release Date *</Label>
              <Input
                id="edit-releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-releaseNotes">Release Notes *</Label>
              <Textarea
                id="edit-releaseNotes"
                value={formData.releaseNotes}
                onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-isMajorRelease"
                type="checkbox"
                checked={formData.isMajorRelease}
                onChange={(e) => setFormData({ ...formData, isMajorRelease: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-isMajorRelease">Major Release</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedVersion(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEditVersion}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Version"
        description={`Are you sure you want to delete version ${selectedVersion?.versionNumber}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteVersion}
        variant="destructive"
      />
    </div>
  );
}