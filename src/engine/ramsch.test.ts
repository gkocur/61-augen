// src/engine/ramsch.test.ts
import { describe, expect, it } from 'vitest';
import { createDeal, playCard } from './deal';
import type { GameType } from './game';
import { ramschTally, scoreRamsch } from './ramsch';

describe('scoreRamsch', () => {
  it('przegrywa gracz z największą liczbą oczek', () => {
    expect(scoreRamsch({ points: [52, 41, 27], tricks: [4, 4, 2] })).toEqual({
      losers: [0], jungfrau: [], durchmarsch: null, scores: [-52, 0, 0],
    });
  });
  it('jungfrau podwaja wynik przegrywającego', () => {
    expect(scoreRamsch({ points: [70, 50, 0], tricks: [7, 3, 0] })).toMatchObject({ jungfrau: [2], scores: [-140, 0, 0] });
  });
  it('durchmarsch: +120 dla gracza, który wziął wszystkie lewy', () => {
    expect(scoreRamsch({ points: [0, 120, 0], tricks: [0, 10, 0] })).toEqual({
      losers: [], jungfrau: [0, 2], durchmarsch: 1, scores: [0, 120, 0],
    });
  });
  it('każde przekazanie skata podwaja wynik', () => {
    expect(scoreRamsch({ points: [61, 35, 24], tricks: [5, 3, 2], pushes: 1 }).scores).toEqual([-122, 0, 0]);
    expect(scoreRamsch({ points: [61, 35, 24], tricks: [5, 3, 2], pushes: 2 }).scores).toEqual([-244, 0, 0]);
  });
  it('remis: przegrywają obaj; trzy razy po 40 — nikt nie przegrywa', () => {
    expect(scoreRamsch({ points: [50, 50, 20], tricks: [4, 4, 2] })).toMatchObject({ losers: [0, 1], scores: [-50, -50, 0] });
    expect(scoreRamsch({ points: [40, 40, 40], tricks: [3, 3, 4] })).toMatchObject({ losers: [], scores: [0, 0, 0] });
  });
  it('odrzuca niemożliwe wyniki', () => {
    expect(() => scoreRamsch({ points: [50, 50, 50], tricks: [4, 4, 2] })).toThrow('Nieprawidłowy wynik ramsza');
    expect(() => scoreRamsch({ points: [60, 40, 20], tricks: [5, 3, 1] })).toThrow('Nieprawidłowy wynik ramsza');
    expect(() => scoreRamsch({ points: [100, 10, 10], tricks: [8, 2, 0] })).toThrow('Nieprawidłowy wynik ramsza');
    expect(() => scoreRamsch({ points: [60, 40, 20], tricks: [5, 3, 2], pushes: 4 })).toThrow('Nieprawidłowy wynik ramsza');
  });
});

describe('ramschTally', () => {
  it('liczy oczka i lewy każdego gracza, skat dla biorącego ostatnią lewę', () => {
    const ramsch: GameType = { kind: 'ramsch' };
    let state = createDeal({
      game: ramsch,
      declarer: 0,
      hands: [['c-A', 'h-7'], ['c-10', 'h-A'], ['c-7', 'h-K']],
      skat: ['s-A', 's-10'],
    });
    for (const card of ['c-A', 'c-10', 'c-7', 'h-7', 'h-A', 'h-K'] as const) state = playCard(state, card);
    // Lewa 1: c-A bierze (gracz 0) — 21 oczek. Lewa 2: gracz 0 wychodzi h-7, h-A bierze (gracz 1) — 15 oczek + skat 21.
    expect(ramschTally(state)).toEqual({ points: [21, 36, 0], tricks: [1, 1, 0] });
  });
});
