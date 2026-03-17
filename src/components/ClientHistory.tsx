import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  History,
  Calendar,
  User,
  Package,
  TrendingUp,
  Loader2,
  ArrowUpCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useUser } from '../utils/userContext';
import apiClient, {
  type ClientResponse,
  type ClientVersionHistory,
  type CRFResponse,
  type VersionResponse,
  type CreateCRFRequest,
} from '../services/api';
import { toast } from 'sonner@2.0.3';

// Helper: get all Fridays and Saturdays starting from tomorrow, up to 90 days out
function getAvailableDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.getDay(); // 0=Sun,1=Mon,...5=Fri,6=Sat
    if (day === 5 || day === 6) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  return dates;
}

function isFridayOrSaturday(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay() === 5 || d.getDay() === 6;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay() === 5 ? 'Friday' : 'Saturday';
}

export function ClientHistory() {
  const { currentUser } = useUser();
  const [clientData, setClientData] = useState<ClientResponse | null>(null);
  const [updateHistory, setUpdateHistory] = useState<ClientVersionHistory[]>([]);
  const [activeCRFs, setActiveCRFs] = useState<CRFResponse[]>([]);
  const [allVersions, setAllVersions] = useState<VersionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Request Update state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDates = useMemo(() => getAvailableDates(), []);

  useEffect(() => {
    loadClientHistory();
  }, [currentUser.clientId]);

  const loadClientHistory = async () => {
    try {
      setIsLoading(true);

      if (!currentUser.clientId) {
        toast.error('Client ID not found. Please log in as a client user.');
        return;
      }

      const [client, history, allCRFs, versions] = await Promise.all([
        apiClient.getClientById(currentUser.clientId),
        apiClient.getClientVersionHistory(currentUser.clientId),
        apiClient.getAllCRFs(),
        apiClient.getAllVersions(),
      ]);

      setClientData(client);
      setUpdateHistory(history);
      setAllVersions(versions);

      // Filter CRFs that are relevant to this client (pending/in-progress)
      // In a real app this would be a backend endpoint filtering by clientId
      setActiveCRFs(
        allCRFs.filter(
          (crf) =>
            crf.status !== 'Completed' &&
            crf.status !== 'Deployed' &&
            crf.status !== 'Rejected'
        )
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to load client history');
    } finally {
      setIsLoading(false);
    }
  };

  // Versions newer than the client's current version
  const newerVersions = useMemo(() => {
    if (!clientData || !allVersions.length) return [];
    const currentVer = clientData.currentVersion;
    if (!currentVer) return allVersions.filter((v) => v.isActive);

    // Simple semver comparison
    const parseVer = (v: string) => v.split('.').map(Number);
    const current = parseVer(currentVer);

    return allVersions
      .filter((v) => {
        if (!v.isActive) return false;
        const ver = parseVer(v.versionNumber);
        for (let i = 0; i < Math.max(current.length, ver.length); i++) {
          const a = current[i] || 0;
          const b = ver[i] || 0;
          if (b > a) return true;
          if (b < a) return false;
        }
        return false;
      })
      .sort((a, b) => {
        const va = parseVer(a.versionNumber);
        const vb = parseVer(b.versionNumber);
        for (let i = 0; i < Math.max(va.length, vb.length); i++) {
          const diff = (vb[i] || 0) - (va[i] || 0);
          if (diff !== 0) return diff;
        }
        return 0;
      });
  }, [clientData, allVersions]);

  const handleRequestUpdate = async () => {
    if (!selectedVersionId || !selectedDate || !clientData) return;

    if (!isFridayOrSaturday(selectedDate)) {
      toast.error('Updates can only be scheduled on Fridays or Saturdays.');
      return;
    }

    const version = allVersions.find((v) => v.versionId === selectedVersionId);
    if (!version) return;

    setIsSubmitting(true);
    try {
      const crfNumber = `CRF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const request: CreateCRFRequest = {
        crfNumber,
        title: `Update request: ${clientData.clientName} → ${version.versionNumber}`,
        description: `Client-initiated update request from ${clientData.currentVersion || 'N/A'} to ${version.versionNumber} (${version.versionName}). Scheduled for ${selectedDate} (${formatDayLabel(selectedDate)}).`,
        versionId: version.versionId,
        priority: 'Normal',
        scheduledDeploymentDate: selectedDate,
        clientIds: [clientData.clientId],
      };

      await apiClient.createCRF(request);
      toast.success(
        `Update request submitted! CRF ${crfNumber} created for ${version.versionNumber} on ${formatDayLabel(selectedDate)} ${selectedDate}.`
      );
      setShowRequestForm(false);
      setSelectedVersionId(null);
      setSelectedDate('');
      // Reload to show the new CRF
      await loadClientHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit update request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (notes: string) => {
    const notesLower = notes.toLowerCase();
    if (notesLower.includes('success') || notesLower.includes('completed')) {
      return <CheckCircle className="size-5 text-brand-success" />;
    }
    if (notesLower.includes('failed') || notesLower.includes('error')) {
      return <XCircle className="size-5 text-brand-error" />;
    }
    if (notesLower.includes('rollback')) {
      return <XCircle className="size-5 text-brand-warning" />;
    }
    return <Clock className="size-5 text-brand-primary" />;
  };

  const getStatusBadge = (notes: string) => {
    const notesLower = notes.toLowerCase();
    if (notesLower.includes('success') || notesLower.includes('completed')) {
      return <Badge variant="default">Success</Badge>;
    }
    if (notesLower.includes('failed') || notesLower.includes('error')) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    if (notesLower.includes('rollback')) {
      return <Badge variant="secondary">Rolled Back</Badge>;
    }
    return <Badge variant="outline">Completed</Badge>;
  };

  const getCRFStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) {
      return <Badge variant="secondary">{status}</Badge>;
    }
    if (statusLower === 'approved') {
      return <Badge variant="default">{status}</Badge>;
    }
    if (statusLower === 'rejected') {
      return <Badge variant="destructive">{status}</Badge>;
    }
    if (statusLower === 'completed' || statusLower === 'deployed') {
      return <Badge variant="outline">{status}</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12">
            <p className="text-muted-foreground text-center">
              No client data found. Please ensure you are logged in as a client user.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const successfulUpdates = updateHistory.filter(
    (u) =>
      u.notes.toLowerCase().includes('success') ||
      u.notes.toLowerCase().includes('completed')
  ).length;

  const successRate =
    updateHistory.length > 0
      ? ((successfulUpdates / updateHistory.length) * 100).toFixed(1)
      : '0';

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <History className="size-8 text-brand-primary" />
          <h1 className="text-foreground">My Update History</h1>
        </div>
        <p className="text-muted-foreground">
          View your software update history and request new updates
        </p>
      </div>

      {/* Client Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-muted-foreground mb-1">Organization</p>
              <p className="text-foreground">{clientData.clientName}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="size-4 text-muted-foreground" />
                <p className="text-muted-foreground">Current Version</p>
              </div>
              <p className="text-foreground">
                {clientData.currentVersion || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Contact</p>
              <p className="text-foreground">{clientData.contactEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Status</p>
              <Badge variant={clientData.isActive ? 'default' : 'secondary'}>
                {clientData.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-1">Total Updates</p>
            <p className="text-foreground text-2xl">{updateHistory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-1">Successful Updates</p>
            <p className="text-brand-success text-2xl">{successfulUpdates}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-1">Success Rate</p>
            <p className="text-foreground text-2xl">{successRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Request Update Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="size-5 text-brand-primary" />
                Request an Update
              </CardTitle>
              <CardDescription>
                Request an upgrade to a newer version — updates are scheduled on
                Fridays or Saturdays only
              </CardDescription>
            </div>
            {!showRequestForm && newerVersions.length > 0 && (
              <Button onClick={() => setShowRequestForm(true)}>
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Request Update
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {newerVersions.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-brand-success-light rounded-lg">
              <CheckCircle className="size-5 text-brand-success" />
              <p className="text-foreground">
                You are on the latest available version (
                {clientData.currentVersion}).
              </p>
            </div>
          ) : !showRequestForm ? (
            <div className="flex items-center gap-3 p-4 bg-brand-primary-light rounded-lg">
              <AlertCircle className="size-5 text-brand-primary" />
              <p className="text-foreground">
                {newerVersions.length} newer version
                {newerVersions.length > 1 ? 's' : ''} available. Click "Request
                Update" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Select Version */}
              <div>
                <label className="block text-foreground mb-2">
                  1. Select target version
                </label>
                <div className="space-y-2">
                  {newerVersions.map((version) => (
                    <div
                      key={version.versionId}
                      onClick={() => setSelectedVersionId(version.versionId)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedVersionId === version.versionId
                          ? 'border-brand-primary bg-brand-primary-light'
                          : 'border-border hover:border-brand-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-foreground">
                              {version.versionNumber}
                            </span>
                            <span className="text-muted-foreground">—</span>
                            <span className="text-muted-foreground">
                              {version.versionName}
                            </span>
                            {version.isMajorRelease && (
                              <Badge variant="default">Major</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Released{' '}
                            {new Date(version.releaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight
                          className={`size-5 ${
                            selectedVersionId === version.versionId
                              ? 'text-brand-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      {selectedVersionId === version.versionId &&
                        version.releaseNotes && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-muted-foreground text-sm">
                              {version.releaseNotes}
                            </p>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Date */}
              {selectedVersionId && (
                <div>
                  <label className="block text-foreground mb-2">
                    2. Select deployment date{' '}
                    <span className="text-muted-foreground">
                      (Friday or Saturday only)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableDates.slice(0, 12).map((date) => {
                      const d = new Date(date + 'T00:00:00');
                      const dayLabel = formatDayLabel(date);
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                            isSelected
                              ? 'border-brand-primary bg-brand-primary text-white'
                              : 'border-border hover:border-brand-secondary text-foreground'
                          }`}
                        >
                          <div>{dayLabel}</div>
                          <div className={isSelected ? 'text-white/80' : 'text-muted-foreground'}>
                            {d.toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {availableDates.length > 12 && (
                    <p className="text-muted-foreground text-sm mt-2">
                      Showing next 12 available dates. More dates available
                      further out.
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Confirm */}
              {selectedVersionId && selectedDate && (
                <div className="p-4 bg-brand-primary-light rounded-lg">
                  <p className="text-foreground mb-3">
                    <strong>Confirm your request:</strong> Update from{' '}
                    <Badge variant="outline">
                      {clientData.currentVersion || 'N/A'}
                    </Badge>{' '}
                    to{' '}
                    <Badge variant="default">
                      {
                        allVersions.find(
                          (v) => v.versionId === selectedVersionId
                        )?.versionNumber
                      }
                    </Badge>{' '}
                    on{' '}
                    <strong>
                      {formatDayLabel(selectedDate)},{' '}
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                        undefined,
                        { month: 'long', day: 'numeric', year: 'numeric' }
                      )}
                    </strong>
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleRequestUpdate}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRequestForm(false);
                        setSelectedVersionId(null);
                        setSelectedDate('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending/Active CRFs */}
      {activeCRFs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Change Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCRFs.map((crf) => (
                <div
                  key={crf.crfId}
                  className="p-4 border border-border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-foreground">{crf.crfNumber}</span>
                        {getCRFStatusBadge(crf.status)}
                      </div>
                      <p className="text-foreground mb-1">{crf.title}</p>
                      <p className="text-muted-foreground">
                        Version: {crf.versionNumber} - {crf.versionName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>
                        Scheduled:{' '}
                        {crf.scheduledDeploymentDate
                          ? new Date(
                              crf.scheduledDeploymentDate
                            ).toLocaleDateString()
                          : 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>Requested by: {crf.requestedByName}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge>{crf.priority} Priority</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update History */}
      <Card>
        <CardHeader>
          <CardTitle>Update History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updateHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No update history available
              </p>
            ) : (
              updateHistory
                .sort(
                  (a, b) =>
                    new Date(b.assignedDate).getTime() -
                    new Date(a.assignedDate).getTime()
                )
                .map((update) => (
                  <div
                    key={update.clientVersionId}
                    className="p-4 border border-border rounded-lg hover:border-brand-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(update.notes)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-foreground">
                              Version Update
                            </span>
                            {getStatusBadge(update.notes)}
                          </div>
                          <p className="text-muted-foreground">
                            {update.versionNumber} - {update.versionName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground mb-1">
                          {new Date(update.assignedDate).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground/70">
                          {new Date(update.assignedDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground mb-1">Version</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="size-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {update.versionNumber}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Updated By</p>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <p className="text-foreground">
                            {update.updatedByName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {update.notes && (
                      <div className="mt-3 p-3 bg-muted/50 border border-border rounded-lg">
                        <p className="text-foreground mb-1">Notes</p>
                        <p className="text-muted-foreground">{update.notes}</p>
                      </div>
                    )}

                    {update.isCurrentVersion && (
                      <div className="mt-3">
                        <Badge variant="default">Current Version</Badge>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
