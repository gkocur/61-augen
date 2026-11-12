// src/game/series.test.ts
import { describe, expect, it } from 'vitest';
import type { Settlement } from '../engine';
import { botAction } from './botPlayer';
import { applyGameAction, gameActor, type GameResult } from './deal';
import {
  currentDealNo,
  dealSeed,
  dealerOf,
  finishCurrentDeal,
  newSeries,
  playerAt,
  rowPoints,
  seatOf,
  startNextDeal,
  totals,
  type PlayerId,
  type Series,
} from './series';

/** Rozgrywa bieżące rozdanie botami (także za ciebie). */
function playCurrent(series: Series): Series {
  let s = series.current!;
  while (s.phase !== 'done') {
    const seat = gameActor(s)!;
    s = applyGameAction(s, seat, botAction(s, seat));
  }
  return { ...series, current: s };
}

const settlement = (won: boolean, value: number): Settlement => ({ won, value, score: won ? value : -2 * value, overbid: false, schneider: false, schwarz: false });
const game = (declarer: 0 | 1 | 2, won: boolean, value: number): GameResult => ({
  kind: 'game',
  declarer,
  declaration: { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' },
  bid: 18,
  doubling: null,
  outcome: { declarerPoints: won ? 70 : 50, declarerTricks: 5 },
  settlement: settlement(won, value),
});

describe('miejsca przy stole', () => {
  it('w 1. rozdaniu jesteś na ręku, potem rozdający się zmienia', () => {
    expect([1, 2, 3, 4].map(dealerOf)).toEqual([2, 0, 1, 2]);
    expect(seatOf(0, dealerOf(1))).toBe(0);
    expect(seatOf(0, dealerOf(2))).toBe(2);
    expect(seatOf(0, dealerOf(3))).toBe(1);
  });

  it('playerAt odwraca seatOf', () => {
    for (const dealer of [0, 1, 2] as PlayerId[]) {
      for (const player of [0, 1, 2] as PlayerId[]) expect(playerAt(seatOf(player, dealer), dealer)).toBe(player);
    }
  });
});

describe('punkty rozdania (Seeger-Fabian)', () => {
  it('wygrana: rozgrywający wartość + 50, obrońcy 0', () => {
    // Rozdający 2 → miejsce 1 to gracz 1.
    expect(rowPoints(game(1, true, 30), 2)).toEqual([0, 80, 0]);
  });

  it('przegrana: rozgrywający −2 × wartość − 50, obrońcy po 40', () => {
    expect(rowPoints(game(1, false, 30), 2)).toEqual([40, -110, 40]);
  });

  it('ramsz: wynik ramsza bez premii; przepadłe rozdanie: zera', () => {
    const ramsch: GameResult = {
      kind: 'ramsch',
      points: [52, 41, 27],
      tricks: [4, 4, 2],
      result: { losers: [0], jungfrau: [], durchmarsch: null, scores: [-52, 0, 0] },
    };
    expect(rowPoints(ramsch, 2)).toEqual([-52, 0, 0]);
    expect(rowPoints(ramsch, 0)).toEqual([0, -52, 0]);
    expect(rowPoints({ kind: 'passedOut' }, 1)).toEqual([0, 0, 0]);
  });
});

describe('seria', () => {
  it('kolejne rozdanie ma ziarno z serii i numeru', () => {
    const s = startNextDeal(newSeries(7));
    expect(currentDealNo(s)).toBe(1);
    expect(s.current?.seed).toBe(dealSeed(7, 1));
    expect(startNextDeal(s)).toBe(s);
  });

  it('zapisuje zakończone rozdania i sumuje punkty', () => {
    let s = newSeries(11);
    for (let i = 0; i < 3; i++) s = finishCurrentDeal(playCurrent(startNextDeal(s)));
    expect(s.rows.map((r) => r.dealNo)).toEqual([1, 2, 3]);
    expect(s.rows.map((r) => r.dealer)).toEqual([2, 0, 1]);
    expect(s.current).toBeNull();
    const sum = s.rows.reduce((t, r) => t.map((x, i) => x + r.points[i]), [0, 0, 0]);
    expect(totals(s)).toEqual(sum);
  });

  it('nie zapisuje niezakończonego rozdania; oznacza cofanie', () => {
    const s = startNextDeal(newSeries(3));
    expect(() => finishCurrentDeal(s)).toThrow('Rozdanie nie jest zakończone');
    const done = finishCurrentDeal({ ...playCurrent(s), currentUndo: true });
    expect(done.rows[0].undo).toBe(true);
    expect(done.currentUndo).toBe(false);
  });
});
