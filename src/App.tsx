import {
  lazy,
  Suspense,
  useEffect,
} from 'react';

import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { monitoringService } from '@/lib/monitoring-service';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

// Importações lazy para as páginas
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-primary/20"></div>
      <div className="mt-4 h-4 w-24 bg-primary/20 rounded"></div>
    </div>
  </div>
);

const App = () => {
  // Performance tracking on initial load
  useEffect(() => {
    // Track initial page load performance
    if (performance && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const loadTime = navigationEntries[0].duration;
        monitoringService.trackPerformance('initialPageLoad', loadTime);
      }
    }
    
    // Report any existing errors
    window.addEventListener('error', (event) => {
      monitoringService.trackError(
        event.error || new Error(event.message),
        'window.onerror',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    });
    
    // Track route changes
    const handleRouteChange = () => {
      monitoringService.trackPerformance('routeChange', 0);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ShadcnToaster />
            <SonnerToaster 
              position="top-right"
              expand={false}
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
                className: 'sonner-custom-class',
              }}
            />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
