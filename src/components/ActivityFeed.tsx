import { useState, useEffect } from 'react';
import { Activity, FileText, Users, CheckCircle, XCircle, AlertTriangle, Server, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ActivityItem {
  id: number;
  type: 'crf' | 'deployment' | 'error' | 'client' | 'system';
  action: string;
  description: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Simulated activity data - replace with actual API call
    const mockActivities: ActivityItem[] = [
      {
        id: 1,
        type: 'crf',
        action: 'CRF Approved',
        description: 'CRF-2024-001 approved for deployment',
        user: 'Jane Smith',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: 2,
        type: 'deployment',
        action: 'Deployment Started',
        description: 'Started deployment to Client-A',
        user: 'John Doe',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'info'
      },
      {
        id: 3,
        type: 'error',
        action: 'Error Detected',
        description: 'API timeout during deployment to Client-B',
        user: 'System',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'error'
      },
      {
        id: 4,
        type: 'client',
        action: 'Client Updated',
        description: 'Client-C successfully updated to version 2.1.0',
        user: 'System',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: 5,
        type: 'system',
        action: 'API Configuration',
        description: 'New deployment API added',
        user: 'John Doe',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'info'
      }
    ];

    setActivities(mockActivities);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'crf':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'deployment':
        return <Server className="h-5 w-5 text-purple-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'client':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'system':
        return <Activity className="h-5 w-5 text-orange-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-900">{activity.action}</span>
                  {getStatusIcon(activity.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{formatTimestamp(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
