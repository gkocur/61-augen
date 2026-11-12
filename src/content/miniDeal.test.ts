// src/content/miniDeal.test.ts
import { describe, expect, it } from 'vitest';
import { playCard } from '../engine';
import { checkpointAnswer, checkpointOptions, isGoalReached, simulateMiniDeal, startMiniDeal, teamPoints } from './miniDeal';
import type { MiniDealExerciseData } from './types';

const exercise: MiniDealExerciseData = {
  type: 'miniDeal',
  id: 't-m1',
  prompt: 'P',
  game: { kind: 'suit', trump: 'h' },
  declarer: 0,
  you: 0,
  hands: [['c-J', 'c-A'], ['c-7', 's-7'], ['c-8', 's-8']],
  skat: [],
  solution: ['c-J', 'c-A'],
  goal: { kind: 'minPoints', points: 13 },
  explain: 'E',
};

describe('mini-rozdanie', () => {
  it('wzorcowe rozegranie osiąga cel', () => {
    expect(simulateMiniDeal(exercise)).toEqual({ error: null, goalReached: true });
  });

  it('zbyt wysoki cel nie jest osiągnięty', () => {
    expect(simulateMiniDeal({ ...exercise, goal: { kind: 'minPoints', points: 14 } }).goalReached).toBe(false);
  });

  it('błędne rozwiązanie jest zgłaszane', () => {
    expect(simulateMiniDeal({ ...exercise, solution: ['c-A', 'h-7'] }).error).toMatch(/niedozwolone|brak/i);
    expect(simulateMiniDeal({ ...exercise, solution: ['c-J'] }).error).toMatch(/za mało kart w linii gracza/);
  });

  it('punkty liczone z perspektywy gracza', () => {
    let state = startMiniDeal(exercise);
    for (const card of ['c-J', 'c-7', 'c-8'] as const) state = playCard(state, card);
    expect(teamPoints(exercise, state)).toEqual({ yours: 2, theirs: 0 });
    expect(teamPoints({ ...exercise, you: 1 }, state)).toEqual({ yours: 0, theirs: 2 });
    expect(isGoalReached({ ...exercise, goal: { kind: 'minPoints', points: 2 } }, state)).toBe(true);
  });

  it('symulacja dowolnej linii gracza', () => {
    expect(simulateMiniDeal(exercise, ['c-A', 'c-J'])).toMatchObject({ error: null });
  });

  it('odpowiedzi punktów kontrolnych liczone na żywo', () => {
    let state = startMiniDeal(exercise);
    for (const card of ['c-J', 'c-7', 'c-8'] as const) state = playCard(state, card);
    expect(checkpointAnswer(exercise, state, 'yourPoints')).toBe(2);
    expect(checkpointAnswer(exercise, state, 'trumpsPlayed')).toBe(1);
  });

  it('warianty odpowiedzi: pozycja poprawnej zależy od ziarna', () => {
    const suit = { kind: 'suit', trump: 'h' } as const;
    expect(checkpointOptions(35, 'yourPoints', suit, 0)).toEqual([35, 45, 55]);
    expect(checkpointOptions(35, 'yourPoints', suit, 1)).toEqual([25, 35, 45]);
    expect(checkpointOptions(35, 'yourPoints', suit, 2)).toEqual([15, 25, 35]);
    expect(checkpointOptions(5, 'trumpsPlayed', suit, 1)).toEqual([4, 5, 6]);
  });

  it('warianty odpowiedzi mieszczą się w granicach', () => {
    const suit = { kind: 'suit', trump: 'h' } as const;
    expect(checkpointOptions(5, 'yourPoints', suit, 2)).toEqual([5, 15, 25]);
    expect(checkpointOptions(115, 'yourPoints', suit, 0)).toEqual([95, 105, 115]);
    expect(checkpointOptions(4, 'trumpsPlayed', { kind: 'grand' }, 0)).toEqual([2, 3, 4]);
    expect(checkpointOptions(11, 'trumpsPlayed', suit, 0)).toEqual([9, 10, 11]);
  });

  it('nadmiarowe karty w linii gracza', () => {
    expect(simulateMiniDeal(exercise, ['c-J', 'c-A', 'c-K']).error).toBe('nadmiarowe karty w linii gracza');
  });
});
