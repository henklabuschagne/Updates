import { useEffect, useState } from 'react';

/**
 * IframeDetector Component
 * 
 * This component detects if the application is running inside an iframe
 * and provides useful debugging information in development mode.
 * 
 * The application is configured to allow iframe embedding with:
 * - No X-Frame-Options restrictions
 * - Content-Security-Policy set to allow all frame-ancestors
 */
export function IframeDetector() {
  const [isInIframe, setIsInIframe] = useState(false);
  const [parentOrigin, setParentOrigin] = useState<string>('');

  useEffect(() => {
    // Check if running in iframe
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    if (inIframe) {
      // Try to get parent origin (may be blocked by CORS)
      try {
        setParentOrigin(document.referrer || 'Unknown (cross-origin)');
      } catch (e) {
        setParentOrigin('Unknown (cross-origin restriction)');
      }

      // Log iframe detection in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🖼️ Application is running inside an iframe');
        console.log('Parent origin:', parentOrigin || 'Unknown');
      }
    }
  }, [parentOrigin]);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development' || !isInIframe) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-50 max-w-xs"
      style={{ fontSize: '11px' }}
    >
      <div className="font-semibold mb-1">🖼️ Iframe Mode</div>
      <div className="opacity-90">
        Running in iframe
        {parentOrigin && (
          <div className="mt-1 truncate">
            Parent: {parentOrigin}
          </div>
        )}
      </div>
    </div>
  );
}
