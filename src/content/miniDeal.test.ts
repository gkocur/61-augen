// src/content/miniDeal.test.ts
import { describe, expect, it } from 'vitest';
import { playCard } from '../engine';
import { isGoalReached, simulateMiniDeal, startMiniDeal, teamPoints } from './miniDeal';
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
});
