import { useMockMode } from '../utils/mockModeContext';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Database, Cloud } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function MockModeToggle() {
  const { isMockMode, setMockMode } = useMockMode();

  const handleToggle = (checked: boolean) => {
    setMockMode(checked);
    
    if (checked) {
      toast.success('Mock Mode Enabled', {
        description: 'Using local mock data - no backend required',
      });
    } else {
      toast.info('Real API Mode', {
        description: 'Connecting to backend server',
      });
    }
    
    // Reload the page to reinitialize the API client
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <Card className="p-4 bg-brand-primary-light border-brand-secondary">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isMockMode ? (
            <Database className="w-5 h-5 text-brand-primary" />
          ) : (
            <Cloud className="w-5 h-5 text-brand-secondary" />
          )}
          <div className="flex-1">
            <Label htmlFor="mock-mode" className="text-sm font-semibold text-brand-main cursor-pointer">
              {isMockMode ? 'Mock Mode' : 'Real API Mode'}
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isMockMode
                ? 'Using local mock data - no backend needed'
                : 'Connected to backend server'}
            </p>
          </div>
        </div>
        <Switch
          id="mock-mode"
          checked={isMockMode}
          onCheckedChange={handleToggle}
        />
      </div>
    </Card>
  );
}