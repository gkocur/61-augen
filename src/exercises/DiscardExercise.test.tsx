// src/exercises/DiscardExercise.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DiscardExerciseData } from '../content/types';
import { renderWithProviders } from '../test/render';
import { DiscardExercise } from './DiscardExercise';
import { gradeDiscard, isBestDiscard } from './evaluateDiscard';

const exercise: DiscardExerciseData = {
  type: 'discard',
  id: 't-k1',
  prompt: 'Wybierz 2 karty.',
  game: { kind: 'suit', trump: 'h' },
  cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 'c-K', 's-10', 's-9', 'd-8'],
  best: [['s-10', 's-9'], ['s-10', 'd-8']],
  explain: 'Wyjaśnienie.',
};

describe('isBestDiscard', () => {
  it('para w dowolnej kolejności', () => {
    expect(isBestDiscard(exercise, ['s-9', 's-10'])).toBe(true);
    expect(isBestDiscard(exercise, ['d-8', 's-10'])).toBe(true);
    expect(isBestDiscard(exercise, ['d-8', 's-9'])).toBe(false);
  });
});

describe('DiscardExercise', () => {
  it('dobra para: ocena, oczka w skacie, wyjaśnienie', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<DiscardExercise exercise={exercise} onAnswered={onAnswered} />);
    const confirm = screen.getByRole('button', { name: 'Wyrzuć do skata' });
    expect(confirm).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'dziesiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'dziewiątka zielona' }));
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Do skata trafia 10 oczek.')).toBeInTheDocument();
    expect(screen.getByText('Wyjaśnienie.')).toBeInTheDocument();
  });

  it('najwyżej 2 karty; ponowne kliknięcie odznacza', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DiscardExercise exercise={exercise} onAnswered={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'dziesiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'dziewiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'ósemka dzwonkowa' }));
    expect(screen.getByRole('button', { name: 'ósemka dzwonkowa' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'dziewiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'ósemka dzwonkowa' }));
    expect(screen.getByRole('button', { name: 'ósemka dzwonkowa' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('zła para: podpowiedź lepszego wyboru', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<DiscardExercise exercise={exercise} onAnswered={onAnswered} />);
    await user.click(screen.getByRole('button', { name: 'as żołędny' }));
    await user.click(screen.getByRole('button', { name: 'król żołędny' }));
    await user.click(screen.getByRole('button', { name: 'Wyrzuć do skata' }));
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText('Lepszy wybór: dziesiątka zielona i dziewiątka zielona.')).toBeInTheDocument();
    expect(screen.getByText('Do skata trafia 15 oczek.')).toBeInTheDocument();
  });

  it('liczba mnoga czasownika: dwa walety to 4 oczka', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DiscardExercise exercise={exercise} onAnswered={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'niżnik żołędny' }));
    await user.click(screen.getByRole('button', { name: 'niżnik zielony' }));
    await user.click(screen.getByRole('button', { name: 'Wyrzuć do skata' }));
    expect(screen.getByText('Do skata trafiają 4 oczka.')).toBeInTheDocument();
  });
});

describe('gradeDiscard', () => {
  const tiered = { ...exercise, best: [['s-10', 's-9']], acceptable: [['s-10', 'd-8']] } as typeof exercise;
  it('rozróżnia najlepszą, dopuszczalną i złą parę', () => {
    expect(gradeDiscard(tiered, ['s-9', 's-10'])).toBe('best');
    expect(gradeDiscard(tiered, ['d-8', 's-10'])).toBe('acceptable');
    expect(gradeDiscard(tiered, ['c-A', 'c-K'])).toBe('wrong');
  });

  it('para dopuszczalna jest zaliczona z podpowiedzią lepszej', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<DiscardExercise exercise={tiered} onAnswered={onAnswered} />);
    await user.click(screen.getByRole('button', { name: 'dziesiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'ósemka dzwonkowa' }));
    await user.click(screen.getByRole('button', { name: 'Wyrzuć do skata' }));
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Dobry wybór, choć jeszcze lepiej: dziesiątka zielona i dziewiątka zielona.')).toBeInTheDocument();
  });
});
