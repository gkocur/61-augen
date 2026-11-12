// src/exercises/MiniDealExercise.test.tsx
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
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
    expect(screen.getByRole('img', { name: 'Środkowa ręka: 2 karty' })).toBeInTheDocument();

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

  it('ukrywa wynik oczek w trakcie rozdania z punktami kontrolnymi', async () => {
    renderWithProviders(
      <MiniDealExercise exercise={{ ...declarerDeal, checkpoints: [{ afterTrick: 1, ask: 'yourPoints' }] }} onAnswered={vi.fn()} delayMs={0} />,
    );
    expect(await screen.findByRole('button', { name: 'niżnik żołędny' })).toBeInTheDocument();
    expect(screen.queryByText(/Twoja strona/)).not.toBeInTheDocument();
  });

  it('w nullu zamiast oczek pokazuje lewy rozgrywającego', async () => {
    const nullDeal: MiniDealExerciseData = {
      ...declarerDeal,
      game: { kind: 'null' },
      declarer: 1,
      hands: [['c-A', 's-8'], ['c-7', 's-7'], ['c-8', 's-9']],
      solution: ['c-A', 's-8'],
      goal: { kind: 'win' },
    };
    renderWithProviders(<MiniDealExercise exercise={nullDeal} onAnswered={vi.fn()} delayMs={0} />);
    expect(await screen.findByText('Lewy rozgrywającego: 0')).toBeInTheDocument();
    expect(screen.queryByText(/Twoja strona/)).not.toBeInTheDocument();
  });

  it('bez punktów kontrolnych wynik oczek jest widoczny', async () => {
    renderWithProviders(<MiniDealExercise exercise={declarerDeal} onAnswered={vi.fn()} delayMs={0} />);
    expect(await screen.findByText(/Twoja strona/)).toBeInTheDocument();
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
  describe('pauza na pytanie', () => {
    afterEach(() => vi.useRealTimers());

    // Miejsce 1 (bot) bierze pierwszą lewę i musi wyjść do drugiej.
    const botLeads: MiniDealExerciseData = {
      ...declarerDeal,
      hands: [['c-7', 's-A'], ['c-A', 's-7'], ['c-8', 's-8']],
      solution: ['c-7', 's-A'],
      goal: { kind: 'minPoints', points: 0 },
      checkpoints: [{ afterTrick: 1, ask: 'yourPoints' }],
    };
    const tick = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    const handButtons = () => within(screen.getByRole('list', { name: 'Twoje karty' })).getAllByRole('button');
    const clickCard = (prefix: string) => {
      const b = handButtons().find((x) => x.getAttribute('aria-label')!.startsWith(prefix))!;
      fireEvent.click(b);
      fireEvent.click(b);
    };
    const questionGroup = () => screen.queryByRole('group', { name: 'Pytanie w trakcie gry' });

    it('pytanie po pokazaniu lewy, bot czeka na odpowiedź, wynik raportowany raz', () => {
      vi.useFakeTimers();
      const onAnswered = vi.fn();
      renderWithProviders(<MiniDealExercise exercise={botLeads} onAnswered={onAnswered} delayMs={100} />);
      clickCard('siódemka');
      tick(100);
      tick(100);
      expect(questionGroup()).toBeNull();
      tick(149);
      expect(questionGroup()).toBeNull();
      tick(1);
      const group = screen.getByRole('group', { name: 'Pytanie w trakcie gry' });
      expect(screen.getByText('Pauza — odpowiedz na pytanie.')).toBeInTheDocument();
      tick(10_000);
      expect(screen.getByText('Stół jest pusty.')).toBeInTheDocument();
      handButtons().forEach((b) => expect(b).toBeDisabled());
      const opts = within(group).getAllByRole('button');
      expect(opts[0]).toHaveFocus();
      fireEvent.click(opts[0]);
      fireEvent.click(opts[1]);
      expect(screen.getByText('Dobra odpowiedź. Poprawnie: 0.')).toBeInTheDocument();
      expect(questionGroup()).toBeNull();
      tick(100);
      expect(screen.queryByText('Stół jest pusty.')).toBeNull();
      tick(100);
      expect(screen.getByText('Twój ruch.')).toBeInTheDocument();
      clickCard('as');
      tick(100);
      tick(150);
      expect(screen.getByText('Pytania w trakcie gry: 1 z 1 poprawnie.')).toBeInTheDocument();
      tick(10_000);
      expect(onAnswered).toHaveBeenCalledTimes(1);
      expect(onAnswered).toHaveBeenCalledWith(true);
    });
  });
});
