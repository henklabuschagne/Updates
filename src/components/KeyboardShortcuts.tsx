import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';

export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open shortcuts menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Cmd/Ctrl + / to toggle shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      // Only handle navigation shortcuts when dialog is closed
      if (!isOpen) {
        // Cmd/Ctrl + 1-9 for quick navigation
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
          switch (e.key) {
            case '1':
              e.preventDefault();
              navigate('/');
              break;
            case '2':
              e.preventDefault();
              navigate('/versions');
              break;
            case '3':
              e.preventDefault();
              navigate('/crf/workflow');
              break;
            case '4':
              e.preventDefault();
              navigate('/clients');
              break;
            case '5':
              e.preventDefault();
              navigate('/deployment-queue');
              break;
            case '6':
              e.preventDefault();
              navigate('/history');
              break;
            case '7':
              e.preventDefault();
              navigate('/reporting');
              break;
            case 'n':
              e.preventDefault();
              navigate('/notifications');
              break;
            case 's':
              e.preventDefault();
              navigate('/advanced-search');
              break;
          }
        }

        // Cmd/Ctrl + Shift for advanced actions
        if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
          switch (e.key.toLowerCase()) {
            case 'c':
              e.preventDefault();
              navigate('/crf/new');
              break;
            case 'd':
              e.preventDefault();
              navigate('/deploy');
              break;
            case 'r':
              e.preventDefault();
              navigate('/rollback');
              break;
            case 'b':
              e.preventDefault();
              navigate('/bulk-operations');
              break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isOpen]);

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['⌘/Ctrl', '1'], description: 'Go to Dashboard' },
        { keys: ['⌘/Ctrl', '2'], description: 'Go to Versions' },
        { keys: ['⌘/Ctrl', '3'], description: 'Go to CRF Workflow' },
        { keys: ['⌘/Ctrl', '4'], description: 'Go to Clients' },
        { keys: ['⌘/Ctrl', '5'], description: 'Go to Deployment Queue' },
        { keys: ['⌘/Ctrl', '6'], description: 'Go to History' },
        { keys: ['⌘/Ctrl', '7'], description: 'Go to Reporting' },
        { keys: ['⌘/Ctrl', 'N'], description: 'Go to Notifications' },
        { keys: ['⌘/Ctrl', 'S'], description: 'Go to Advanced Search' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['⌘/Ctrl', 'Shift', 'C'], description: 'Create New CRF' },
        { keys: ['⌘/Ctrl', 'Shift', 'D'], description: 'Deploy' },
        { keys: ['⌘/Ctrl', 'Shift', 'R'], description: 'Rollback' },
        { keys: ['⌘/Ctrl', 'Shift', 'B'], description: 'Bulk Operations' },
      ],
    },
    {
      category: 'General',
      items: [
        { keys: ['⌘/Ctrl', 'K'], description: 'Open Command Menu' },
        { keys: ['⌘/Ctrl', '/'], description: 'Show Keyboard Shortcuts' },
        { keys: ['Esc'], description: 'Close Dialogs' },
      ],
    },
  ];

  return (
    <>
      {/* Floating shortcut hint */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors z-50"
        aria-label="Keyboard shortcuts"
      >
        <Command className="h-5 w-5" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate faster
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
