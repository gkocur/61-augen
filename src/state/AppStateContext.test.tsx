// src/state/AppStateContext.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { createMemoryStorage } from '../test/storage';
import { useAppState, useText } from './AppStateContext';
import { STORAGE_KEY } from './storage';

function Probe() {
  const { state, notice, updateSettings, recordLessonResult, resetProgress } = useAppState();
  const t = useText();
  return (
    <div>
      <p>talia: {state.settings.deck}</p>
      <p>komunikat: {notice ?? 'brak'}</p>
      <p>termin: {t('[[lewa]]')}</p>
      <p>lekcje: {Object.keys(state.lessons).join(',') || 'brak'}</p>
      <button onClick={() => updateSettings({ deck: 'french', register: 'colloquial' })}>zmień</button>
      <button onClick={() => recordLessonResult('x', 1)}>zalicz</button>
      <button onClick={resetProgress}>zeruj</button>
    </div>
  );
}

describe('AppStateProvider', () => {
  it('zmienia ustawienia, tłumaczy teksty i zapisuje w pamięci', async () => {
    const user = userEvent.setup();
    const { storage } = renderWithProviders(<Probe />);
    expect(screen.getByText('termin: lewa')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zmień' }));
    expect(screen.getByText('talia: french')).toBeInTheDocument();
    expect(screen.getByText('termin: sztych')).toBeInTheDocument();
    expect(JSON.parse(storage!.getItem(STORAGE_KEY)!).settings.deck).toBe('french');
  });

  it('reset zeruje postęp, ale zostawia ustawienia', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />);
    await user.click(screen.getByRole('button', { name: 'zmień' }));
    await user.click(screen.getByRole('button', { name: 'zalicz' }));
    expect(screen.getByText('lekcje: x')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zeruj' }));
    expect(screen.getByText('lekcje: brak')).toBeInTheDocument();
    expect(screen.getByText('talia: french')).toBeInTheDocument();
  });

  it('bez pamięci zgłasza komunikat', () => {
    renderWithProviders(<Probe />, { storage: null });
    expect(screen.getByText('komunikat: unavailable')).toBeInTheDocument();
  });

  it('uszkodzony zapis zgłasza komunikat', () => {
    renderWithProviders(<Probe />, { storage: createMemoryStorage({ [STORAGE_KEY]: '{' }) });
    expect(screen.getByText('komunikat: corrupted')).toBeInTheDocument();
  });
});
