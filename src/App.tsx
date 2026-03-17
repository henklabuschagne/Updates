import { RouterProvider } from 'react-router';
import { router } from './utils/routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { IframeDetector } from './components/IframeDetector';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <OfflineIndicator />
      <IframeDetector />
      <Toaster position="top-right" />
    </ErrorBoundary>
  );
}

export default App;