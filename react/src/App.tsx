import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { createQueryClient } from './api/queries';
import { routerFuture } from './routerFuture';
import { AppRoutes } from './routes';
import { SettingsProvider } from './settings/SettingsProvider';

export function App() {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <BrowserRouter future={routerFuture}>
          <AppRoutes />
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
