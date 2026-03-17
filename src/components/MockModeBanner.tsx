import { Database, X } from 'lucide-react';
import { useState } from 'react';
import { useMockMode } from '../utils/mockModeContext';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export function MockModeBanner() {
  const { isMockMode } = useMockMode();
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('mock_banner_dismissed') === 'true';
  });

  if (!isMockMode || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('mock_banner_dismissed', 'true');
  };

  return (
    <div className="bg-brand-main text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Database className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Mock Mode Active - Demo Environment</p>
              <p className="text-xs opacity-80">
                Using local mock data. Changes persist in localStorage across reloads.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 flex-shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
}