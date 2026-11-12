// src/test/render.tsx
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../state/AppStateContext';
import { createMemoryStorage } from './storage';

export function renderWithProviders(
  ui: ReactElement,
  { storage = createMemoryStorage(), route = '/' }: { storage?: Storage | null; route?: string } = {},
) {
  const result = render(
    <AppStateProvider storage={storage}>
      <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {ui}
      </MemoryRouter>
    </AppStateProvider>,
  );
  return { ...result, storage };
}
