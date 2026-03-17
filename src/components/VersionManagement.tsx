import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Package, 
  Calendar, 
  Users,
  Info,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useUser } from '../utils/userContext';
import { apiClient, type VersionResponse } from '../services/api';
import { toast } from 'sonner@2.0.3';

export function VersionManagement() {
  const [versions, setVersions] = useState<VersionResponse[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useUser();

  const canManage = currentUser.role === 'devops';

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAllVersions();
      setVersions(data);
      if (data.length > 0 && !selectedVersion) {
        setSelectedVersion(data[0]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load versions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading versions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Software Version Management</h1>
          <p className="text-muted-foreground">View version details and changelog information</p>
        </div>
        {canManage && (
          <Button>
            <Plus className="mr-2 size-4" />
            Add New Version
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Version List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {versions.map((version, index) => (
                <button
                  key={version.versionId}
                  onClick={() => setSelectedVersion(version)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedVersion?.versionId === version.versionId
                      ? 'border-brand-primary bg-brand-primary-light'
                      : 'border-border hover:border-brand-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="size-5 text-muted-foreground" />
                      <span className="text-foreground">v{version.versionNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Badge>Latest</Badge>
                      )}
                      {version.isMajorRelease && (
                        <Badge variant="outline">Major</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-foreground/80 mb-2">{version.versionName}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{formatDate(version.releaseDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Users className="size-4" />
                    <span>{version.clientCount} clients</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Version Details */}
        <div className="lg:col-span-2">
          {selectedVersion ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle>Version {selectedVersion.versionNumber}</CardTitle>
                      {selectedVersion.isMajorRelease && (
                        <Badge>Major Release</Badge>
                      )}
                      <Badge variant={selectedVersion.isActive ? 'default' : 'secondary'}>
                        {selectedVersion.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-foreground/80 mt-2">{selectedVersion.versionName}</p>
                    <p className="text-muted-foreground mt-1">Released on {formatDate(selectedVersion.releaseDate)}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Version Info */}
                <div>
                  <h3 className="text-foreground mb-3 flex items-center gap-2">
                    <Info className="size-5" />
                    Version Information
                  </h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version Number:</span>
                      <span className="text-foreground">{selectedVersion.versionNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Release Date:</span>
                      <span className="text-foreground">{formatDate(selectedVersion.releaseDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Clients:</span>
                      <span className="text-foreground">{selectedVersion.clientCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created By:</span>
                      <span className="text-foreground">{selectedVersion.createdByName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground">
                        {selectedVersion.isMajorRelease ? 'Major Release' : 'Minor Update'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {selectedVersion.description && (
                  <>
                    <div>
                      <h3 className="text-foreground mb-3">Description</h3>
                      <p className="text-foreground/80">{selectedVersion.description}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Release Notes */}
                {selectedVersion.releaseNotes && (
                  <div>
                    <h3 className="text-foreground mb-3">Release Notes</h3>
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="text-foreground/80 whitespace-pre-wrap font-sans">
                        {selectedVersion.releaseNotes}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a version to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}