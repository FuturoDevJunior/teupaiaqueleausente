import {
  lazy,
  Suspense,
} from 'react';

import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import LoadingAnimation from './components/LoadingAnimation';

// Importações lazy para as páginas
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner 
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
        <BrowserRouter>
          <Suspense fallback={<LoadingAnimation />}>
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
);

export default App;
