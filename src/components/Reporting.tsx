import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  XCircle
} from 'lucide-react';
import { errorReports, updateHistory } from '../utils/mockData';

export function Reporting() {
  const [selectedError, setSelectedError] = useState<string | null>(null);

  const criticalErrors = errorReports.filter(e => e.severity === 'Critical');
  const unresolvedErrors = errorReports.filter(e => !e.resolved);
  const totalErrors = errorReports.length;
  const resolvedErrors = errorReports.filter(e => e.resolved).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ErrorCard = ({ error }: { error: typeof errorReports[0] }) => (
    <Card className={error.resolved ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`size-5 ${
                error.severity === 'Critical' ? 'text-red-600' :
                error.severity === 'High' ? 'text-orange-600' :
                error.severity === 'Medium' ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
              <CardTitle className="text-gray-900">{error.errorType}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getSeverityColor(error.severity)}>{error.severity}</Badge>
              {error.resolved ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Resolved
                </Badge>
              ) : (
                <Badge variant="destructive">Active</Badge>
              )}
              {error.rollbackInitiated && (
                <Badge variant="secondary">Rollback Initiated</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-gray-600 mb-1">Client</p>
          <p className="text-gray-900">{error.clientName}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">CRF Number</p>
          <p className="text-gray-900">{error.crfNumber}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Version</p>
          <p className="text-gray-900">{error.version}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-2">Error Message</p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-gray-700">{error.errorMessage}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Timestamp</p>
          <p className="text-gray-700">{error.timestamp}</p>
        </div>
        {!error.resolved && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              Mark Resolved
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Initiate Rollback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const successRate = ((updateHistory.filter(u => u.status === 'Success').length / updateHistory.length) * 100).toFixed(1);
  const failureRate = ((updateHistory.filter(u => u.status === 'Failed').length / updateHistory.length) * 100).toFixed(1);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="size-8 text-orange-600" />
          <h1 className="text-gray-900">Error Reporting & Analytics</h1>
        </div>
        <p className="text-gray-600">Monitor deployment errors and system health</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Errors</p>
                <p className="text-gray-900">{totalErrors}</p>
              </div>
              <Activity className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Critical Errors</p>
                <p className="text-gray-900 text-red-600">{criticalErrors.length}</p>
              </div>
              <AlertCircle className="size-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Unresolved</p>
                <p className="text-gray-900 text-orange-600">{unresolvedErrors.length}</p>
              </div>
              <XCircle className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Resolved</p>
                <p className="text-gray-900 text-green-600">{resolvedErrors}</p>
              </div>
              <CheckCircle className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Deployment Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Deployment Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="text-green-600">{successRate}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 transition-all" 
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Failure Rate</span>
                  <span className="text-red-600">{failureRate}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 transition-all" 
                    style={{ width: `${failureRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Error Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Critical</span>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  {errorReports.filter(e => e.severity === 'Critical').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">High</span>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {errorReports.filter(e => e.severity === 'High').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Medium</span>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {errorReports.filter(e => e.severity === 'Medium').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Low</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {errorReports.filter(e => e.severity === 'Low').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unresolvedErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <CheckCircle className="size-12 text-green-600 mb-3" />
                  <p className="text-gray-900 mb-1">All Systems Healthy</p>
                  <p className="text-gray-500 text-center">No unresolved errors</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <AlertTriangle className="size-12 text-orange-600 mb-3" />
                  <p className="text-gray-900 mb-1">Attention Required</p>
                  <p className="text-gray-500 text-center">{unresolvedErrors.length} unresolved error{unresolvedErrors.length > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Errors ({errorReports.length})</TabsTrigger>
          <TabsTrigger value="unresolved">Unresolved ({unresolvedErrors.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({criticalErrors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {errorReports.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center py-12">No errors reported</p>
            ) : (
              errorReports.map(error => <ErrorCard key={error.id} error={error} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="unresolved" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {unresolvedErrors.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-12">
                <CheckCircle className="size-16 text-green-600 mb-4" />
                <p className="text-gray-900 mb-2">No Unresolved Errors</p>
                <p className="text-gray-500">All errors have been addressed</p>
              </div>
            ) : (
              unresolvedErrors.map(error => <ErrorCard key={error.id} error={error} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {criticalErrors.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-12">
                <CheckCircle className="size-16 text-green-600 mb-4" />
                <p className="text-gray-900 mb-2">No Critical Errors</p>
                <p className="text-gray-500">System is operating normally</p>
              </div>
            ) : (
              criticalErrors.map(error => <ErrorCard key={error.id} error={error} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
