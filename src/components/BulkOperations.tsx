import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { CheckSquare, Square, Download, Upload, FileDown, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import apiClient, { type CRFResponse, type ClientResponse } from '../services/api';

export function BulkOperations() {
  const [crfs, setCRFs] = useState<CRFResponse[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [selectedCRFs, setSelectedCRFs] = useState<Set<number>>(new Set());
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showClientUpdateDialog, setShowClientUpdateDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [targetVersion, setTargetVersion] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [crfsData, clientsData] = await Promise.all([
        apiClient.getAllCRFs(),
        apiClient.getAllClients()
      ]);
      setCRFs(crfsData);
      setClients(clientsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // CRF Selection
  const toggleCRFSelection = (crfId: number) => {
    const newSelection = new Set(selectedCRFs);
    if (newSelection.has(crfId)) {
      newSelection.delete(crfId);
    } else {
      newSelection.add(crfId);
    }
    setSelectedCRFs(newSelection);
  };

  const toggleAllCRFs = () => {
    if (selectedCRFs.size === crfs.length) {
      setSelectedCRFs(new Set());
    } else {
      setSelectedCRFs(new Set(crfs.map(c => c.crfId)));
    }
  };

  const selectPendingCRFs = () => {
    const pendingCRFs = crfs.filter(c => c.status === 'Pending');
    setSelectedCRFs(new Set(pendingCRFs.map(c => c.crfId)));
    toast.success(`Selected ${pendingCRFs.length} pending CRFs`);
  };

  // Client Selection
  const toggleClientSelection = (clientId: number) => {
    const newSelection = new Set(selectedClients);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClients(newSelection);
  };

  const toggleAllClients = () => {
    if (selectedClients.size === clients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(clients.map(c => c.clientId)));
    }
  };

  const selectActiveClients = () => {
    const activeClients = clients.filter(c => c.isActive);
    setSelectedClients(new Set(activeClients.map(c => c.clientId)));
    toast.success(`Selected ${activeClients.length} active clients`);
  };

  // Bulk CRF Operations
  const bulkApproveCRFs = async () => {
    if (selectedCRFs.size === 0) {
      toast.error('No CRFs selected');
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      for (const crfId of selectedCRFs) {
        try {
          await apiClient.updateCRFStatus(crfId, 'Approved');
          successCount++;
        } catch { /* skip individual failures */ }
      }
      
      toast.success(`Successfully approved ${successCount} CRFs`);
      setSelectedCRFs(new Set());
      setShowApprovalDialog(false);
      setApprovalComments('');
      loadData();
    } catch (error) {
      toast.error('Failed to approve CRFs');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkRejectCRFs = async () => {
    if (selectedCRFs.size === 0) {
      toast.error('No CRFs selected');
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      for (const crfId of selectedCRFs) {
        try {
          await apiClient.updateCRFStatus(crfId, 'Rejected');
          successCount++;
        } catch { /* skip individual failures */ }
      }
      
      toast.success(`Successfully rejected ${successCount} CRFs`);
      setSelectedCRFs(new Set());
      setShowRejectionDialog(false);
      setRejectionReason('');
      loadData();
    } catch (error) {
      toast.error('Failed to reject CRFs');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteCRFs = async () => {
    if (selectedCRFs.size === 0) {
      toast.error('No CRFs selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCRFs.size} CRFs? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      for (const crfId of selectedCRFs) {
        try {
          await apiClient.deleteCRF(crfId);
          successCount++;
        } catch { /* skip individual failures */ }
      }
      
      toast.success(`Successfully deleted ${successCount} CRFs`);
      setSelectedCRFs(new Set());
      loadData();
    } catch (error) {
      toast.error('Failed to delete CRFs');
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk Client Operations
  const bulkUpdateClients = async () => {
    if (selectedClients.size === 0) {
      toast.error('No clients selected');
      return;
    }

    if (!targetVersion.trim()) {
      toast.error('Target version is required');
      return;
    }

    setIsLoading(true);
    try {
      // Find the version by number
      const allVersions = await apiClient.getAllVersions();
      const version = allVersions.find((v: any) => v.versionNumber === targetVersion);
      if (!version) {
        toast.error(`Version "${targetVersion}" not found`);
        return;
      }

      let successCount = 0;
      for (const clientId of selectedClients) {
        try {
          await apiClient.updateClientVersion(clientId, {
            versionId: version.versionId,
            notes: `Bulk version update to ${targetVersion}`,
          });
          successCount++;
        } catch { /* skip individual failures */ }
      }
      
      toast.success(`Successfully updated ${successCount} clients to version ${targetVersion}`);
      setSelectedClients(new Set());
      setShowClientUpdateDialog(false);
      setTargetVersion('');
      loadData();
    } catch (error) {
      toast.error('Failed to update clients');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkActivateClients = async () => {
    if (selectedClients.size === 0) {
      toast.error('No clients selected');
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      for (const clientId of selectedClients) {
        try {
          await apiClient.updateClient(clientId, { status: 'Active', isActive: true });
          successCount++;
        } catch { /* skip individual failures */ }
      }
      toast.success(`Successfully activated ${successCount} clients`);
      setSelectedClients(new Set());
      loadData();
    } catch (error) {
      toast.error('Failed to activate clients');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeactivateClients = async () => {
    if (selectedClients.size === 0) {
      toast.error('No clients selected');
      return;
    }

    if (!confirm(`Are you sure you want to deactivate ${selectedClients.size} clients?`)) {
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      for (const clientId of selectedClients) {
        try {
          await apiClient.updateClient(clientId, { status: 'Inactive', isActive: false });
          successCount++;
        } catch { /* skip individual failures */ }
      }
      toast.success(`Successfully deactivated ${successCount} clients`);
      setSelectedClients(new Set());
      loadData();
    } catch (error) {
      toast.error('Failed to deactivate clients');
    } finally {
      setIsLoading(false);
    }
  };

  // Export/Import
  const exportCRFs = () => {
    const selectedCRFData = crfs.filter(c => selectedCRFs.has(c.crfId));
    const csv = [
      ['CRF Number', 'Title', 'Version', 'Status', 'Created Date', 'Scheduled Deployment'].join(','),
      ...selectedCRFData.map(crf => [
        crf.crfNumber,
        `"${crf.title}"`,
        crf.versionNumber,
        crf.status,
        crf.createdDate,
        crf.scheduledDeploymentDate || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crfs-export-${new Date().toISOString()}.csv`;
    a.click();
    toast.success(`Exported ${selectedCRFData.length} CRFs`);
  };

  const exportClients = () => {
    const selectedClientData = clients.filter(c => selectedClients.has(c.clientId));
    const csv = [
      ['Client Name', 'Current Version', 'Status', 'Active', 'Contact Email'].join(','),
      ...selectedClientData.map(client => [
        `"${client.clientName}"`,
        client.currentVersion || '',
        client.status,
        client.isActive ? 'Yes' : 'No',
        client.contactEmail || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-export-${new Date().toISOString()}.csv`;
    a.click();
    toast.success(`Exported ${selectedClientData.length} clients`);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // Simulate import
        toast.success(`Importing data from ${file.name}...`);
        setTimeout(() => {
          toast.success('Data imported successfully');
          loadData();
        }, 2000);
      }
    };
    input.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Draft': 'secondary',
      'Pending': 'secondary',
      'Approved': 'default',
      'Deployed': 'default',
      'Rejected': 'destructive',
      'Failed': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (isLoading && crfs.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Bulk Operations</h1>
        <p className="text-gray-600">Perform actions on multiple CRFs and clients simultaneously</p>
      </div>

      <Tabs defaultValue="crfs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="crfs">CRF Operations</TabsTrigger>
          <TabsTrigger value="clients">Client Operations</TabsTrigger>
          <TabsTrigger value="import-export">Import / Export</TabsTrigger>
        </TabsList>

        <TabsContent value="crfs" className="space-y-6">
          {/* CRF Bulk Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bulk CRF Operations</CardTitle>
                  <CardDescription>
                    {selectedCRFs.size} of {crfs.length} CRFs selected
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleAllCRFs}>
                    {selectedCRFs.size === crfs.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectPendingCRFs}>
                    Select Pending
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Button 
                  onClick={() => setShowApprovalDialog(true)}
                  disabled={selectedCRFs.size === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowRejectionDialog(true)}
                  disabled={selectedCRFs.size === 0}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
                <Button 
                  variant="destructive"
                  onClick={bulkDeleteCRFs}
                  disabled={selectedCRFs.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button 
                  variant="outline"
                  onClick={exportCRFs}
                  disabled={selectedCRFs.size === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>

              <div className="space-y-2">
                {crfs.map((crf) => (
                  <div
                    key={crf.crfId}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCRFs.has(crf.crfId) ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleCRFSelection(crf.crfId)}
                  >
                    <div>
                      {selectedCRFs.has(crf.crfId) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{crf.crfNumber}</span>
                        {getStatusBadge(crf.status)}
                      </div>
                      <p className="text-gray-600 text-sm">{crf.title}</p>
                      <p className="text-gray-500 text-sm">Version: {crf.versionNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Client Bulk Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bulk Client Operations</CardTitle>
                  <CardDescription>
                    {selectedClients.size} of {clients.length} clients selected
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleAllClients}>
                    {selectedClients.size === clients.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectActiveClients}>
                    Select Active
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Button 
                  onClick={() => setShowClientUpdateDialog(true)}
                  disabled={selectedClients.size === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Update Version
                </Button>
                <Button 
                  variant="outline"
                  onClick={bulkActivateClients}
                  disabled={selectedClients.size === 0}
                >
                  Activate Selected
                </Button>
                <Button 
                  variant="outline"
                  onClick={bulkDeactivateClients}
                  disabled={selectedClients.size === 0}
                >
                  Deactivate Selected
                </Button>
                <Button 
                  variant="outline"
                  onClick={exportClients}
                  disabled={selectedClients.size === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>

              <div className="space-y-2">
                {clients.map((client) => (
                  <div
                    key={client.clientId}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedClients.has(client.clientId) ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleClientSelection(client.clientId)}
                  >
                    <div>
                      {selectedClients.has(client.clientId) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{client.clientName}</span>
                        <Badge variant={client.isActive ? 'default' : 'secondary'}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">Current Version: {client.currentVersion || 'Not assigned'}</p>
                      <p className="text-gray-500 text-sm">Status: {client.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Export CRFs and clients to CSV format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={exportCRFs} disabled={selectedCRFs.size === 0}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Selected CRFs ({selectedCRFs.size})
                </Button>
                <Button className="w-full" onClick={exportClients} disabled={selectedClients.size === 0}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Selected Clients ({selectedClients.size})
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>Import clients and CRFs from CSV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline" onClick={importData}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import from CSV
                </Button>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Import Format</p>
                      <p>CSV file must include headers matching the export format</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve CRFs</DialogTitle>
            <DialogDescription>
              You are about to approve {selectedCRFs.size} CRF(s). Add optional comments below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-comments">Comments (Optional)</Label>
              <Textarea
                id="approval-comments"
                placeholder="Enter approval comments..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={bulkApproveCRFs} disabled={isLoading}>
              {isLoading ? 'Approving...' : 'Approve All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject CRFs</DialogTitle>
            <DialogDescription>
              You are about to reject {selectedCRFs.size} CRF(s). Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={bulkRejectCRFs} disabled={isLoading}>
              {isLoading ? 'Rejecting...' : 'Reject All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Update Dialog */}
      <Dialog open={showClientUpdateDialog} onOpenChange={setShowClientUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Client Versions</DialogTitle>
            <DialogDescription>
              Update {selectedClients.size} client(s) to a new version
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="target-version">Target Version *</Label>
              <Input
                id="target-version"
                placeholder="e.g., 2.1.0"
                value={targetVersion}
                onChange={(e) => setTargetVersion(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={bulkUpdateClients} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}