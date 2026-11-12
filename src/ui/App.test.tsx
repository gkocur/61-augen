// src/ui/App.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { COURSE } from '../content/course';
import { resolveText } from '../glossary';
import { STORAGE_KEY } from '../state/storage';
import { renderWithProviders } from '../test/render';
import { createMemoryStorage, storageWithState } from '../test/storage';
import { AppRoutes } from './App';

const firstLesson = COURSE.modules[0].lessons[0];

describe('aplikacja', () => {
  it('menu prowadzi do gry z botami', () => {
    renderWithProviders(<AppRoutes />);
    expect(screen.getByRole('link', { name: 'Gra' })).toHaveAttribute('href', '/gra');
  });

  it('mapa kursu: pierwsza lekcja dostępna, druga zablokowana', () => {
    renderWithProviders(<AppRoutes />);
    expect(screen.getByRole('link', { name: 'Zacznij naukę' })).toHaveAttribute('href', `/lekcja/${firstLesson.id}`);
    expect(screen.getByRole('link', { name: /Czym jest skat\?/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Talia/ })).not.toBeInTheDocument();
    expect(screen.getByText('Talia')).toBeInTheDocument();
  });

  it('przejście lekcji 1 zalicza ją i odblokowuje lekcję 2', async () => {
    const user = userEvent.setup();
    const { storage } = renderWithProviders(<AppRoutes />, { route: `/lekcja/${firstLesson.id}` });
    const ctx = { deck: 'altenburg', register: 'official' } as const;

    for (let i = 0; i < firstLesson.steps.length; i++) {
      await user.click(screen.getByRole('button', { name: 'Dalej' }));
    }
    for (const exercise of firstLesson.exercises) {
      if (exercise.type !== 'quiz') throw new Error('Lekcja 1 ma tylko quizy');
      const option = exercise.options.find((o) => o.id === exercise.correct)!;
      await user.click(screen.getByRole('button', { name: resolveText(option.text!, ctx) }));
      await user.click(screen.getByRole('button', { name: /^(Dalej|Zakończ)$/ }));
    }

    expect(screen.getByRole('heading', { name: 'Lekcja zaliczona!' })).toBeInTheDocument();
    expect(JSON.parse(storage!.getItem(STORAGE_KEY)!).lessons[firstLesson.id].status).toBe('passed');

    await user.click(screen.getByRole('link', { name: 'Mapa kursu' }));
    expect(screen.getByRole('link', { name: /Talia/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kontynuuj' })).toBeInTheDocument();
  });

  it('moduł opcjonalny ma nagłówek „Dodatek”', () => {
    const optional = COURSE.modules.find((m) => m.optional);
    renderWithProviders(<AppRoutes />);
    expect(optional).toBeDefined();
    expect(screen.getByRole('heading', { name: `Dodatek: ${optional!.title}` })).toBeInTheDocument();
  });

  it('po zaliczeniu wszystkich lekcji: gratulacje', () => {
    const lessons = Object.fromEntries(
      COURSE.modules.flatMap((m) => m.lessons).map((l) => [l.id, { status: 'passed' as const, bestScore: 1, attempts: 1 }]),
    );
    renderWithProviders(<AppRoutes />, { storage: storageWithState({}, lessons) });
    expect(screen.getByText('Ukończono cały kurs. Gratulacje!')).toBeInTheDocument();
  });

  it('zablokowana lekcja nie daje się otworzyć', () => {
    renderWithProviders(<AppRoutes />, { route: '/lekcja/m1-l03-oczka' });
    expect(screen.getByText('Ta lekcja jest jeszcze zablokowana.')).toBeInTheDocument();
  });

  it('nieznana lekcja', () => {
    renderWithProviders(<AppRoutes />, { route: '/lekcja/nie-ma' });
    expect(screen.getByText('Nie ma takiej lekcji.')).toBeInTheDocument();
  });

  it('ustawienia: zmiana talii i języka działa od razu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { route: '/ustawienia' });
    expect(screen.getByRole('img', { name: 'niżnik żołędny' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Francuska/ }));
    expect(screen.getByRole('img', { name: 'walet trefl' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Potoczny/ }));
    expect(screen.getByRole('img', { name: 'jopek krojc' })).toBeInTheDocument();
  });

  it('ustawienia: odblokuj wszystko i reset postępu', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const storage = storageWithState({}, { [firstLesson.id]: { status: 'passed', bestScore: 1, attempts: 1 } });
    renderWithProviders(<AppRoutes />, { route: '/ustawienia', storage });
    await user.click(screen.getByRole('checkbox', { name: 'Odblokuj wszystkie lekcje' }));
    await user.click(screen.getByRole('button', { name: 'Wyzeruj postęp' }));
    expect(screen.getByText('Postęp został wyzerowany.')).toBeInTheDocument();
    const saved = JSON.parse(storage.getItem(STORAGE_KEY)!);
    expect(saved.lessons).toEqual({});
    expect(saved.settings.unlockAll).toBe(true);
  });

  it('słowniczek pokazuje oba warianty terminów', () => {
    renderWithProviders(<AppRoutes />, { route: '/slowniczek' });
    expect(screen.getByRole('cell', { name: 'lewa' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'sztych' })).toBeInTheDocument();
  });

  it('baner o uszkodzonym zapisie', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { storage: createMemoryStorage({ [STORAGE_KEY]: 'zepsute' }) });
    expect(screen.getByRole('alert')).toHaveTextContent('uszkodzony');
    await user.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lekcja 11 pokazuje stół mini-rozdania po teorii i quizie', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, {
      route: '/lekcja/m2-l11-pierwsze-rozdanie',
      storage: storageWithState({ unlockAll: true }),
    });
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Rozgrywającego' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    expect(screen.getByText('Gra kolorowa · atu: czerwień')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Środkowa ręka: 10 kart' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Twoje karty' }).children).toHaveLength(10);
  });

  it('lekcja 19: wybór kart do skata', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { route: '/lekcja/m4-l19-skat', storage: storageWithState({ unlockAll: true }) });
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'dziesiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'dziewiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'Wyrzuć do skata' }));
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Do skata trafia 10 oczek.')).toBeInTheDocument();
  });
});
