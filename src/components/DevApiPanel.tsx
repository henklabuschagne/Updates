import { useState, useEffect } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, HardDrive, Trash2, Settings } from 'lucide-react';
import { appStore } from '../lib/appStore';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DevApiPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSliceDetails, setShowSliceDetails] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof appStore.getPersistenceStats> | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStats(appStore.getPersistenceStats());
    }
  }, [isOpen]);

  const handleResetToDefaults = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    appStore.resetToDefaults();
    setConfirmReset(false);
    setStats(appStore.getPersistenceStats());
    window.location.reload();
  };

  const refreshStats = () => {
    setStats(appStore.getPersistenceStats());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Panel (above the FAB) */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-main text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span className="text-sm font-medium">Data Persistence</span>
            </div>
            <button
              onClick={refreshStats}
              className="text-white/60 hover:text-white transition-colors"
              title="Refresh stats"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Stats */}
          <div className="p-4 space-y-4">
            {stats && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-brand-primary-light rounded-lg p-3">
                    <div className="text-xs text-brand-primary mb-1">Slices Tracked</div>
                    <div className="text-lg text-brand-main">{stats.sliceCount}</div>
                  </div>
                  <div className="bg-brand-secondary-light rounded-lg p-3">
                    <div className="text-xs text-brand-secondary mb-1">Storage Used</div>
                    <div className="text-lg text-brand-main">{formatBytes(stats.totalBytes)}</div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-brand-success animate-pulse" />
                  <span className="text-muted-foreground">Auto-persist active on every mutation</span>
                </div>

                {/* Slice Details Toggle */}
                <button
                  onClick={() => setShowSliceDetails(!showSliceDetails)}
                  className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Slice breakdown</span>
                  {showSliceDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showSliceDetails && (
                  <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Slice</th>
                          <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.slices)
                          .sort(([, a], [, b]) => b - a)
                          .map(([slice, bytes]) => (
                            <tr key={slice} className="border-t border-border">
                              <td className="px-3 py-1.5 text-foreground font-mono">{slice}</td>
                              <td className="px-3 py-1.5 text-right text-muted-foreground">{formatBytes(bytes)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Reset Button */}
                <div>
                  {confirmReset ? (
                    <div className="space-y-2">
                      <p className="text-xs text-brand-error">
                        This will erase all changes and reload with default demo data. This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleResetToDefaults}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground text-sm rounded-md hover:bg-destructive/90 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Confirm Reset
                        </button>
                        <button
                          onClick={() => setConfirmReset(false)}
                          className="px-3 py-2 bg-muted text-foreground text-sm rounded-md hover:bg-accent transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleResetToDefaults}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-muted text-foreground text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset All Data to Defaults
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button — §15 */}
      <button
        onClick={() => { setIsOpen(!isOpen); setConfirmReset(false); }}
        className="p-3 bg-brand-main text-white rounded-full shadow-lg hover:bg-brand-main-light transition-colors"
        title="Dev API Panel"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
