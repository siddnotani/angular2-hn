import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { createQueryClient } from './api/queries';
import { Layout } from './components/Layout/Layout';
import { SettingsProvider } from './settings/SettingsProvider';

export function App() {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="*" element={null} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
