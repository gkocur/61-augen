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
    expect(simulateMiniDeal({ ...exercise, solution: ['c-J'] }).error).toMatch(/za mało/);
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

  it('warianty odpowiedzi: poprawna i dwie inne, bez liczb ujemnych', () => {
    expect(checkpointOptions(2, 'yourPoints')).toEqual([2, 12, 22]);
    expect(checkpointOptions(35, 'yourPoints')).toEqual([25, 35, 45]);
    expect(checkpointOptions(0, 'trumpsPlayed')).toEqual([0, 1, 2]);
    expect(checkpointOptions(4, 'trumpsPlayed')).toEqual([3, 4, 5]);
  });
});
