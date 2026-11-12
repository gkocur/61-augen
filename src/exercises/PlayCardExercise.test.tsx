// src/exercises/PlayCardExercise.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PlayCardExerciseData } from '../content/types';
import { renderWithProviders } from '../test/render';
import { PlayCardExercise } from './PlayCardExercise';

const exercise: PlayCardExerciseData = {
  type: 'playCard',
  id: 't-p1',
  prompt: 'Zagraj dozwoloną kartę.',
  game: { kind: 'suit', trump: 'c' },
  leader: 0,
  trick: ['h-K'],
  hand: ['h-7', 'h-A', 's-10'],
  mode: 'legal',
  explain: 'Musisz dołożyć do koloru.',
};

describe('PlayCardExercise', () => {
  it('pierwsze dotknięcie wybiera, drugie zagrywa', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<PlayCardExercise exercise={exercise} onAnswered={onAnswered} />);
    const card = screen.getByRole('button', { name: 'siódemka czerwienna' });
    await user.click(card);
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(onAnswered).not.toHaveBeenCalled();
    await user.click(card);
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Ty')).toBeInTheDocument();
    expect(screen.getByText('Przodek')).toBeInTheDocument();
  });

  it('wybór innej karty przenosi zaznaczenie', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlayCardExercise exercise={exercise} onAnswered={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'siódemka czerwienna' }));
    await user.click(screen.getByRole('button', { name: 'as czerwienny' }));
    expect(screen.getByRole('button', { name: 'as czerwienny' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'siódemka czerwienna' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('niedozwolona karta: zła odpowiedź z wyjaśnieniem', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<PlayCardExercise exercise={exercise} onAnswered={onAnswered} />);
    const card = screen.getByRole('button', { name: 'dziesiątka zielona' });
    await user.click(card);
    await user.click(card);
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText(/nie wolno zagrać/)).toBeInTheDocument();
    expect(screen.getByText('Musisz dołożyć do koloru.')).toBeInTheDocument();
  });

  it('tryb best: komunikat dla dozwolonej, ale słabej karty', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    const best: PlayCardExerciseData = {
      ...exercise,
      mode: 'best',
      best: ['h-A'],
      wrongExplain: { 'h-7': 'Szkoda oddać [[lewa:B]].' },
    };
    renderWithProviders(<PlayCardExercise exercise={best} onAnswered={onAnswered} />);
    const card = screen.getByRole('button', { name: 'siódemka czerwienna' });
    await user.click(card);
    await user.click(card);
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText('Szkoda oddać lewę.')).toBeInTheDocument();
  });

  it('showLegal przyciemnia niedozwolone karty', () => {
    renderWithProviders(<PlayCardExercise exercise={{ ...exercise, showLegal: true }} onAnswered={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'dziesiątka zielona' })).toHaveClass('card--dimmed');
    expect(screen.getByRole('button', { name: 'as czerwienny' })).not.toHaveClass('card--dimmed');
  });
});
