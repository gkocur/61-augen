// src/exercises/evaluatePlay.test.ts
import { describe, expect, it } from 'vitest';
import type { PlayCardExerciseData } from '../content/types';
import { evaluatePlay } from './evaluatePlay';

const base: PlayCardExerciseData = {
  type: 'playCard',
  id: 't',
  prompt: '',
  game: { kind: 'suit', trump: 'c' },
  leader: 0,
  trick: ['h-K'],
  hand: ['h-7', 'h-A', 's-10'],
  mode: 'legal',
  explain: '',
};

describe('evaluatePlay', () => {
  it('tryb legal: każda dozwolona karta jest dobra', () => {
    expect(evaluatePlay(base, 'h-7')).toEqual({ correct: true, legal: true, message: null });
  });

  it('niedozwolona karta jest zła z wyjaśnieniem', () => {
    const result = evaluatePlay(base, 's-10');
    expect(result.correct).toBe(false);
    expect(result.legal).toBe(false);
    expect(result.message).toMatch(/nie wolno/);
  });

  it('tryb best: dozwolona, ale nie najlepsza — komunikat z danych albo domyślny', () => {
    const best = { ...base, mode: 'best' as const, best: ['h-A' as const], wrongExplain: { 'h-7': 'Szkoda.' } };
    expect(evaluatePlay(best, 'h-A').correct).toBe(true);
    expect(evaluatePlay(best, 'h-7')).toEqual({ correct: false, legal: true, message: 'Szkoda.' });
    expect(evaluatePlay({ ...best, wrongExplain: undefined }, 'h-7').message).toMatch(/nie najlepsza/);
  });
});
