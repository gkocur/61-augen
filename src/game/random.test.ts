// src/game/random.test.ts
import { describe, expect, it } from 'vitest';
import { ALL_CARDS } from '../engine';
import { createRandom, dealCards } from './random';

describe('losowanie', () => {
  it('to samo ziarno daje ten sam ciąg, inne — inny', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    const c = createRandom(43);
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
    expect(seqA.every((x) => x >= 0 && x < 1)).toBe(true);
  });

  it('rozdanie: 3 × 10 kart i 2 w skacie, cała talia bez powtórzeń', () => {
    const { hands, skat } = dealCards(7);
    expect(hands.map((h) => h.length)).toEqual([10, 10, 10]);
    expect(skat).toHaveLength(2);
    expect(new Set([...hands.flat(), ...skat])).toEqual(new Set(ALL_CARDS));
  });

  it('rozdanie jest powtarzalne', () => {
    expect(dealCards(123)).toEqual(dealCards(123));
    expect(dealCards(123)).not.toEqual(dealCards(124));
  });
});
