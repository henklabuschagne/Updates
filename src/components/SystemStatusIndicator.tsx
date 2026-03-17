import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Activity, Database } from 'lucide-react';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useMockMode } from '../utils/mockModeContext';

interface SystemStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  responseTime: number;
}

export function SystemStatusIndicator() {
  const { isMockMode } = useMockMode();
  const [status, setStatus] = useState<SystemStatus>({
    api: 'healthy',
    database: 'healthy',
    lastCheck: new Date(),
    responseTime: 120,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const startTime = performance.now();
        // Simulate health check - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 100));
        const endTime = performance.now();
        
        setStatus({
          api: 'healthy',
          database: 'healthy',
          lastCheck: new Date(),
          responseTime: Math.round(endTime - startTime),
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          api: 'down',
          database: 'down',
          lastCheck: new Date(),
        }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (state: 'healthy' | 'degraded' | 'down') => {
    switch (state) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-brand-success" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-brand-warning" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-brand-error" />;
    }
  };

  const getStatusColor = (state: 'healthy' | 'degraded' | 'down') => {
    switch (state) {
      case 'healthy':
        return 'bg-brand-success';
      case 'degraded':
        return 'bg-brand-warning';
      case 'down':
        return 'bg-brand-error';
    }
  };

  const overallStatus = status.api === 'down' || status.database === 'down' 
    ? 'down' 
    : status.api === 'degraded' || status.database === 'degraded'
    ? 'degraded'
    : 'healthy';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:bg-accent transition-colors shadow-sm">
          {isMockMode ? (
            <>
              <Database className="h-4 w-4 text-brand-primary" />
              <span className="text-sm font-medium text-brand-primary">Mock Mode</span>
            </>
          ) : (
            <>
              <div className={`h-2 w-2 rounded-full ${getStatusColor(overallStatus)} animate-pulse`} />
              <span className="text-sm text-foreground/80">System Status</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {isMockMode && (
            <div className="p-3 bg-brand-primary-light border border-brand-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-brand-primary" />
                <span className="text-sm font-semibold text-brand-main">Mock Mode Active</span>
              </div>
              <p className="text-xs text-brand-primary">
                Using local mock data - no backend connection required. All changes are stored in localStorage.
              </p>
            </div>
          )}

          <div>
            <h4 className="font-medium text-foreground mb-3">System Health</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.api)}
                  <span className="text-sm text-foreground/80">
                    {isMockMode ? 'Mock API' : 'API'}
                  </span>
                </div>
                <Badge 
                  className={status.api === 'healthy' ? 'bg-brand-success-light text-brand-success border-brand-success-mid' : ''}
                  variant={status.api === 'healthy' ? 'outline' : 'destructive'}
                >
                  {status.api}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.database)}
                  <span className="text-sm text-foreground/80">
                    {isMockMode ? 'Mock Data' : 'Database'}
                  </span>
                </div>
                <Badge 
                  className={status.database === 'healthy' ? 'bg-brand-success-light text-brand-success border-brand-success-mid' : ''}
                  variant={status.database === 'healthy' ? 'outline' : 'destructive'}
                >
                  {status.database}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Response Time</span>
              </div>
              <span className="font-medium text-foreground">{status.responseTime}ms</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last checked: {status.lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}