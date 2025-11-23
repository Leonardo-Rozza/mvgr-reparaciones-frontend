import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.tsx';
import { syncThemeClass, useThemeStore } from './store/theme.store.ts';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

const ThemeBootstrapper = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    syncThemeClass(theme);
  }, [theme]);

  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeBootstrapper />
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
