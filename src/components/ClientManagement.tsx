import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Users, 
  Package, 
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  History
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useUser } from '../utils/userContext';
import { apiClient, type ClientResponse, type VersionResponse, type ClientVersionHistory } from '../services/api';
import { toast } from 'sonner@2.0.3';
import { TableSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { usePagination } from '../hooks/usePagination';

const emptyForm = {
  clientName: '',
  contactEmail: '',
  contactPerson: '',
  phone: '',
  address: '',
  status: 'Active',
};

export function ClientManagement() {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [versions, setVersions] = useState<VersionResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useUser();

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  const [clientHistory, setClientHistory] = useState<ClientVersionHistory[]>([]);

  const canManage = currentUser.role === 'devops';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientsData, versionsData] = await Promise.all([
        apiClient.getAllClients(),
        apiClient.getAllVersions(),
      ]);
      setClients(clientsData);
      setVersions(versionsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.currentVersion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── CRUD Handlers ─────────────────────────────────
  const handleCreate = async () => {
    if (!formData.clientName.trim() || !formData.contactEmail.trim()) {
      toast.error('Client name and email are required');
      return;
    }
    try {
      await apiClient.createClient({
        clientName: formData.clientName,
        contactEmail: formData.contactEmail,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
        isActive: true,
        hasCustomizations: false,
      });
      toast.success('Client created successfully');
      setIsCreateOpen(false);
      setFormData(emptyForm);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create client');
    }
  };

  const openEdit = (client: ClientResponse) => {
    setSelectedClient(client);
    setFormData({
      clientName: client.clientName,
      contactEmail: client.contactEmail,
      contactPerson: client.contactPerson || '',
      phone: client.phone || '',
      address: client.address || '',
      status: client.status,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedClient) return;
    try {
      await apiClient.updateClient(selectedClient.clientId, {
        clientName: formData.clientName,
        contactEmail: formData.contactEmail,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
        isActive: formData.status === 'Active',
        hasCustomizations: selectedClient.hasCustomizations,
      });
      toast.success('Client updated successfully');
      setIsEditOpen(false);
      setSelectedClient(null);
      setFormData(emptyForm);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update client');
    }
  };

  const openDelete = (client: ClientResponse) => {
    setSelectedClient(client);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    try {
      await apiClient.deleteClient(selectedClient.clientId);
      toast.success('Client deleted successfully');
      setIsDeleteOpen(false);
      setSelectedClient(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete client');
    }
  };

  const openVersionUpdate = (client: ClientResponse) => {
    setSelectedClient(client);
    setSelectedVersionId('');
    setVersionNotes('');
    setIsVersionOpen(true);
  };

  const handleVersionUpdate = async () => {
    if (!selectedClient || !selectedVersionId) {
      toast.error('Please select a version');
      return;
    }
    try {
      await apiClient.updateClientVersion(selectedClient.clientId, {
        versionId: parseInt(selectedVersionId),
        notes: versionNotes || 'Version update',
      });
      toast.success('Client version updated');
      setIsVersionOpen(false);
      setSelectedClient(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update version');
    }
  };

  const openHistory = async (client: ClientResponse) => {
    setSelectedClient(client);
    try {
      const history = await apiClient.getClientVersionHistory(client.clientId);
      setClientHistory(history);
      setIsHistoryOpen(true);
    } catch (error: any) {
      toast.error('Failed to load history');
    }
  };

  // ─── Helpers ─────────────────────────────────
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'inactive': return 'outline';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // ─── Client Card ─────────────────────────────────
  const ClientCard = ({ client }: { client: ClientResponse }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle>{client.clientName}</CardTitle>
              <Badge variant={getStatusColor(client.status)}>{client.status}</Badge>
            </div>
            <div className="space-y-1 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="size-4" />
                <span>{client.contactEmail}</span>
              </div>
              {client.contactPerson && (
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span>{client.contactPerson}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(client)}>
                <Edit className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => openDelete(client)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 mb-1">Current Version</p>
            <div className="flex items-center gap-2">
              <Package className="size-5 text-blue-600" />
              <span className="text-gray-900">
                {client.currentVersion || 'Not assigned'}
              </span>
            </div>
            {client.currentVersionName && (
              <p className="text-gray-500 mt-1">{client.currentVersionName}</p>
            )}
          </div>
          <div>
            <p className="text-gray-600 mb-1">Last Update</p>
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-gray-500" />
              <span className="text-gray-900">{formatDate(client.lastUpdateDate)}</span>
            </div>
          </div>
        </div>

        {client.address && (
          <div>
            <p className="text-gray-600 mb-1">Address</p>
            <div className="flex items-start gap-2">
              <Building className="size-5 text-gray-500 mt-0.5" />
              <span className="text-gray-900">{client.address}</span>
            </div>
          </div>
        )}

        {canManage && (
          <div className="pt-4 border-t border-gray-200 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => openHistory(client)}>
              <History className="mr-1 size-4" />
              View History
            </Button>
            <Button size="sm" className="flex-1" onClick={() => openVersionUpdate(client)}>
              <Package className="mr-1 size-4" />
              Update Version
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredClients, 10);

  // ─── Form Fields (shared between create and edit) ─────
  const ClientFormFields = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="clientName">Client Name *</Label>
        <Input id="clientName" value={formData.clientName}
          onChange={e => setFormData({ ...formData, clientName: e.target.value })}
          placeholder="e.g., Acme Corporation" />
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact Email *</Label>
        <Input id="contactEmail" type="email" value={formData.contactEmail}
          onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
          placeholder="admin@acme.com" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input id="contactPerson" value={formData.contactPerson}
            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
            placeholder="John Smith" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 555-0100" />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Business Ave" />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select id="status" value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Client Management</h1>
          <p className="text-gray-600">Loading clients...</p>
        </div>
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Client Management</h1>
            <p className="text-gray-600">Manage client accounts and version assignments</p>
          </div>
          {canManage && (
            <Button onClick={() => { setFormData(emptyForm); setIsCreateOpen(true); }}>
              <Plus className="mr-2 size-4" />
              Add New Client
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 size-5 text-gray-400" />
          <Input
            placeholder="Search clients by name, email, or version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Clients</p>
                <p className="text-gray-900 mt-1">{clients.length}</p>
              </div>
              <Users className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Active</p>
                <p className="text-gray-900 mt-1">
                  {clients.filter(c => c.status === 'Active').length}
                </p>
              </div>
              <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="size-3 rounded-full bg-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Pending</p>
                <p className="text-gray-900 mt-1">
                  {clients.filter(c => c.status === 'Pending').length}
                </p>
              </div>
              <div className="size-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="size-3 rounded-full bg-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Inactive</p>
                <p className="text-gray-900 mt-1">
                  {clients.filter(c => c.status === 'Inactive' || c.status === 'Suspended').length}
                </p>
              </div>
              <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="size-3 rounded-full bg-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm ? 'No clients found' : 'No clients available'}
          description={searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first client'}
          actionLabel={!searchTerm && canManage ? 'Add New Client' : undefined}
          onAction={() => { setFormData(emptyForm); setIsCreateOpen(true); }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedData.map((client) => (
              <ClientCard key={client.clientId} client={client} />
            ))}
          </div>
          
          {filteredClients.length > 10 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}

      {/* ─── Create Dialog ───────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Create a new client account</DialogDescription>
          </DialogHeader>
          <ClientFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ───────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information for {selectedClient?.clientName}</DialogDescription>
          </DialogHeader>
          <ClientFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm Dialog ───────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="text-gray-900">{selectedClient?.clientName}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Update Version Dialog ───────────────────── */}
      <Dialog open={isVersionOpen} onOpenChange={setIsVersionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Client Version</DialogTitle>
            <DialogDescription>
              Assign a new version to {selectedClient?.clientName}
              {selectedClient?.currentVersion && (
                <span className="block mt-1">Current version: <span className="text-gray-900">{selectedClient.currentVersion}</span></span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target Version</Label>
              <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(v => (
                    <SelectItem key={v.versionId} value={v.versionId.toString()}>
                      {v.versionNumber} — {v.versionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={versionNotes} onChange={e => setVersionNotes(e.target.value)}
                placeholder="Reason for update..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionOpen(false)}>Cancel</Button>
            <Button onClick={handleVersionUpdate}>Update Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Version History Dialog ───────────────────── */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version History — {selectedClient?.clientName}</DialogTitle>
          </DialogHeader>
          {clientHistory.length === 0 ? (
            <p className="text-gray-500 py-6 text-center">No version history available</p>
          ) : (
            <div className="space-y-3">
              {clientHistory
                .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
                .map(h => (
                <div key={h.clientVersionId} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{h.versionNumber}</span>
                      <span className="text-gray-500">— {h.versionName}</span>
                    </div>
                    {h.isCurrentVersion && <Badge>Current</Badge>}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Assigned {formatDate(h.assignedDate)} by {h.updatedByName}
                  </div>
                  {h.notes && <p className="text-gray-500 text-sm mt-1">{h.notes}</p>}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
