// src/exercises/MiniDealExercise.test.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { MiniDealExerciseData } from '../content/types';
import { renderWithProviders } from '../test/render';
import { MiniDealExercise } from './MiniDealExercise';

const declarerDeal: MiniDealExerciseData = {
  type: 'miniDeal',
  id: 't-m1',
  prompt: 'Zagraj.',
  game: { kind: 'suit', trump: 'h' },
  declarer: 0,
  you: 0,
  hands: [['c-J', 'c-A'], ['c-7', 's-7'], ['c-8', 's-8']],
  skat: [],
  solution: ['c-J', 'c-A'],
  goal: { kind: 'minPoints', points: 13 },
  explain: 'Wyjaśnienie.',
};

async function playTwice(user: ReturnType<typeof userEvent.setup>, name: string) {
  const card = screen.getByRole('button', { name });
  await waitFor(() => expect(card).toBeEnabled());
  await user.click(card);
  await user.click(card);
}

describe('MiniDealExercise', () => {
  it('rozgrywa rozdanie z botami i ocenia cel', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<MiniDealExercise exercise={declarerDeal} onAnswered={onAnswered} delayMs={0} />);
    expect(screen.getByText('Gra kolorowa · atu: czerwień')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Środek: 2 karty' })).toBeInTheDocument();

    await playTwice(user, 'niżnik żołędny');
    await playTwice(user, 'as żołędny');

    expect(await screen.findByText('Dobrze!')).toBeInTheDocument();
    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Wyjaśnienie.')).toBeInTheDocument();
  });

  it('nieosiągnięty cel to zła odpowiedź', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(
      <MiniDealExercise exercise={{ ...declarerDeal, goal: { kind: 'minPoints', points: 14 } }} onAnswered={onAnswered} delayMs={0} />,
    );
    await playTwice(user, 'niżnik żołędny');
    await playTwice(user, 'as żołędny');
    expect(await screen.findByText('Niestety nie.')).toBeInTheDocument();
    expect(onAnswered).toHaveBeenCalledWith(false);
  });

  it('bot wychodzi, a niedozwolona karta daje podpowiedź', async () => {
    const user = userEvent.setup();
    const defending: MiniDealExerciseData = {
      ...declarerDeal,
      you: 1,
      hands: [['c-A', 's-A'], ['c-7', 'h-7'], ['c-8', 's-8']],
      solution: ['c-7', 'h-7'],
      goal: { kind: 'minPoints', points: 0 },
    };
    renderWithProviders(<MiniDealExercise exercise={defending} onAnswered={vi.fn()} delayMs={0} />);
    expect(await screen.findByRole('img', { name: 'as żołędny' })).toBeInTheDocument();
    const trump = screen.getByRole('button', { name: 'siódemka czerwienna' });
    await waitFor(() => expect(trump).toBeEnabled());
    await user.click(trump);
    expect(screen.getByText(/nie możesz teraz zagrać/)).toBeInTheDocument();
  });
});
