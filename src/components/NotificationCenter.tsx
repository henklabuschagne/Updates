import { useState, useMemo } from 'react';
import { Bell, Check, Trash2, Settings, AlertTriangle, CheckCircle, Info, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';
import { useAppStore } from '../hooks/useAppStore';
import { useUser } from '../utils/userContext';

interface NotificationSettings {
  emailNotifications: boolean;
  crfApprovals: boolean;
  deploymentUpdates: boolean;
  errorAlerts: boolean;
  systemAlerts: boolean;
  clientUpdates: boolean;
  dailyDigest: boolean;
}

export function NotificationCenter() {
  const { currentUser } = useUser();
  const { notifications: rawNotifications, actions } = useAppStore('notifications');

  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    crfApprovals: true,
    deploymentUpdates: true,
    errorAlerts: true,
    systemAlerts: true,
    clientUpdates: false,
    dailyDigest: true,
  });

  // Transform backend data to display format
  const notifications = useMemo(() => {
    return rawNotifications.map((n) => {
      let category: 'CRF' | 'Deployment' | 'Error' | 'System' | 'Client' = 'System';
      const notifType = n.type || '';
      if (notifType.includes('CRF')) category = 'CRF';
      else if (notifType.includes('Deploy')) category = 'Deployment';
      else if (notifType.includes('Error') || notifType.includes('Failed')) category = 'Error';
      else if (notifType.includes('Client')) category = 'Client';

      let type: 'success' | 'warning' | 'error' | 'info' = 'info';
      const titleLower = (n.title || '').toLowerCase();
      if (titleLower.includes('success') || titleLower.includes('approved') || titleLower.includes('completed')) {
        type = 'success';
      } else if (titleLower.includes('failed') || titleLower.includes('error')) {
        type = 'error';
      } else if (titleLower.includes('warning') || titleLower.includes('pending') || titleLower.includes('queued')) {
        type = 'warning';
      }

      return {
        notificationId: n.notificationId,
        type,
        title: n.title,
        message: n.message,
        timestamp: n.createdAt,
        isRead: n.isRead,
        actionUrl: n.actionUrl,
        category,
        relatedEntityId: n.relatedEntityId,
      };
    });
  }, [rawNotifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];
    if (selectedTab === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(n => n.category === categoryFilter);
    }
    return filtered;
  }, [notifications, selectedTab, categoryFilter]);

  const markAsRead = async (notificationId: number) => {
    const result = await actions.markNotificationRead(notificationId);
    if (result.success) {
      toast.success('Notification marked as read');
    } else {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    const result = await actions.markAllNotificationsRead(currentUser.userId);
    if (result.success) {
      toast.success('All notifications marked as read');
    } else {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    const result = await actions.deleteNotification(notificationId);
    if (result.success) {
      toast.success('Notification deleted');
    } else {
      toast.error('Failed to delete notification');
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    const results = await Promise.all(
      notifications.map(n => actions.deleteNotification(n.notificationId))
    );
    const allOk = results.every(r => r.success);
    if (allOk) {
      toast.success('All notifications cleared');
    } else {
      toast.error('Failed to clear some notifications');
    }
  };

  const saveSettings = () => {
    toast.success('Notification settings saved');
    setIsSettingsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-brand-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-brand-warning" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-brand-error" />;
      case 'info':
        return <Info className="h-5 w-5 text-brand-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      success: 'border-l-4 border-l-brand-success bg-brand-success-light',
      warning: 'border-l-4 border-l-brand-warning bg-brand-warning-light',
      error: 'border-l-4 border-l-brand-error bg-brand-error-light',
      info: 'border-l-4 border-l-brand-primary bg-brand-primary-light',
    };
    return colors[type] || 'border-l-4 border-l-muted-foreground';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-brand-error">{unreadCount} new</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Stay updated with system events and activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
          <Button variant="outline" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all
          </Button>
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="CRF">CRF</option>
                <option value="Deployment">Deployment</option>
                <option value="Error">Error</option>
                <option value="System">System</option>
                <option value="Client">Client</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'all' | 'unread')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {selectedTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.notificationId}
                  className={`${getNotificationColor(notification.type)} ${
                    !notification.isRead ? 'shadow-md' : 'opacity-75'
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-foreground">{notification.title}</h3>
                            {!notification.isRead && (
                              <Badge variant="default">New</Badge>
                            )}
                            <Badge variant="outline">{notification.category}</Badge>
                          </div>
                          <p className="text-foreground/80 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.notificationId)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.notificationId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <div className="mt-3">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Configure how you want to receive notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="email"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-3">Notification Categories</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="crf">CRF Approvals</Label>
                    <p className="text-sm text-muted-foreground">CRF status changes and approvals</p>
                  </div>
                  <Switch
                    id="crf"
                    checked={settings.crfApprovals}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, crfApprovals: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deployment">Deployment Updates</Label>
                    <p className="text-sm text-muted-foreground">Deployment queue and status updates</p>
                  </div>
                  <Switch
                    id="deployment"
                    checked={settings.deploymentUpdates}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, deploymentUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="errors">Error Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical and high-priority errors</p>
                  </div>
                  <Switch
                    id="errors"
                    checked={settings.errorAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, errorAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">System health and maintenance alerts</p>
                  </div>
                  <Switch
                    id="system"
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, systemAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="clients">Client Updates</Label>
                    <p className="text-sm text-muted-foreground">Client version changes and updates</p>
                  </div>
                  <Switch
                    id="clients"
                    checked={settings.clientUpdates}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, clientUpdates: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="digest">Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily summary email</p>
                </div>
                <Switch
                  id="digest"
                  checked={settings.dailyDigest}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, dailyDigest: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}