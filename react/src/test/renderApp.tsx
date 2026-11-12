/* eslint-disable react-refresh/only-export-components -- test helpers */
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { createQueryClient } from '../api/queries';
import { AppRoutes } from '../routes';
import { SettingsProvider } from '../settings/SettingsProvider';
import { mockColorScheme } from './matchMedia';

export const location = { current: '' };

function LocationSpy() {
  const { pathname, search } = useLocation();
  location.current = pathname + search;
  return null;
}

export function Providers({ path = '/', children }: { path?: string; children: ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      <SettingsProvider>
        <MemoryRouter initialEntries={[path]}>
          {children}
          <LocationSpy />
        </MemoryRouter>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export function renderApp(path: string) {
  mockColorScheme(false);
  return render(
    <Providers path={path}>
      <AppRoutes />
    </Providers>,
  );
}
