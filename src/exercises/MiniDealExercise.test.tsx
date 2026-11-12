// src/exercises/MiniDealExercise.test.tsx
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkpointOptions } from '../content/miniDeal';
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
  it('pytanie w trakcie gry: dobra odpowiedź i zaliczenie', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(
      <MiniDealExercise exercise={{ ...declarerDeal, checkpoints: [{ afterTrick: 1, ask: 'yourPoints' }] }} onAnswered={onAnswered} delayMs={0} />,
    );
    await playTwice(user, 'niżnik żołędny');
    const question = await screen.findByRole('group', { name: 'Pytanie w trakcie gry' });
    expect(question).toHaveTextContent('Ile oczek ma teraz twoja strona?');
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('Dobra odpowiedź. Poprawnie: 2.')).toBeInTheDocument();
    await playTwice(user, 'as żołędny');
    expect(await screen.findByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Pytania w trakcie gry: 1 z 1 poprawnie.')).toBeInTheDocument();
    expect(onAnswered).toHaveBeenCalledWith(true);
  });

  it('zła odpowiedź w trakcie gry: ćwiczenie niezaliczone', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(
      <MiniDealExercise exercise={{ ...declarerDeal, checkpoints: [{ afterTrick: 1, ask: 'yourPoints' }] }} onAnswered={onAnswered} delayMs={0} />,
    );
    await playTwice(user, 'niżnik żołędny');
    await screen.findByRole('group', { name: 'Pytanie w trakcie gry' });
    const wrong = checkpointOptions(2, 'yourPoints', declarerDeal.game, 1).find((v) => v !== 2)!;
    await user.click(screen.getByRole('button', { name: String(wrong) }));
    expect(screen.getByText('Zła odpowiedź. Poprawnie: 2.')).toBeInTheDocument();
    await playTwice(user, 'as żołędny');
    expect(await screen.findByText('Niestety nie.')).toBeInTheDocument();
    expect(onAnswered).toHaveBeenCalledWith(false);
  });

  it('gra otwarta: karty rozgrywającego są widoczne', () => {
    const open: MiniDealExerciseData = {
      ...declarerDeal,
      you: 1,
      ouvert: true,
      hands: [['c-A', 's-A'], ['c-7', 'h-7'], ['c-8', 's-8']],
      solution: ['c-7', 'h-7'],
      goal: { kind: 'minPoints', points: 0 },
    };
    renderWithProviders(<MiniDealExercise exercise={open} onAnswered={vi.fn()} delayMs={10_000} />);
    expect(screen.getByText('Karty rozgrywającego — gra otwarta')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'as zielony' })).toBeInTheDocument();
  });

  it('rozgrywa rozdanie z botami i ocenia cel', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<MiniDealExercise exercise={declarerDeal} onAnswered={onAnswered} delayMs={0} />);
    expect(screen.getByText('Gra kolorowa · atu: czerwień')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Środek: 2 karty' })).toBeInTheDocument();

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

  describe('koniec rozdania', () => {
    afterEach(() => vi.useRealTimers());

    it('pokazuje wynik dopiero po wyświetleniu ostatniej lewy', () => {
      vi.useFakeTimers();
      const onAnswered = vi.fn();
      renderWithProviders(<MiniDealExercise exercise={declarerDeal} onAnswered={onAnswered} delayMs={100} />);
      const play = (name: string) => {
        const card = screen.getByRole('button', { name });
        fireEvent.click(card);
        fireEvent.click(card);
      };
      const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

      play('niżnik żołędny');
      advance(100); // bot 1
      advance(100); // bot 2
      advance(150); // koniec wyświetlania pierwszej lewy
      play('as żołędny');
      advance(100);
      advance(100);
      // Ostatnia lewa jest wyświetlana, ale nie minęło jeszcze 150 ms.
      advance(100);
      expect(screen.queryByText('Dobrze!')).not.toBeInTheDocument();
      expect(onAnswered).not.toHaveBeenCalled();
      advance(60);
      expect(screen.getByText('Dobrze!')).toBeInTheDocument();
      expect(onAnswered).toHaveBeenCalledTimes(1);
      expect(onAnswered).toHaveBeenCalledWith(true);
    });
  });
});
