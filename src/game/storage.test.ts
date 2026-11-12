// src/game/storage.test.ts
import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from '../test/storage';
import { botAction } from './botPlayer';
import { applyGameAction, gameActor, startGameDeal, type GameAction, type GameDeal } from './deal';
import { dealSeed, finishCurrentDeal, newSeries, startNextDeal, type Series } from './series';
import { GAME_STORAGE_KEY, clearSeries, loadSeries, saveSeries } from './storage';

function botMoves(series: Series, n: number): Series {
  let s = series.current!;
  for (let i = 0; i < n && s.phase !== 'done'; i++) {
    const seat = gameActor(s)!;
    s = applyGameAction(s, seat, botAction(s, seat));
  }
  return { ...series, current: s };
}

describe('zapis serii', () => {
  it('brak zapisu: brak serii i komunikatu', () => {
    expect(loadSeries(createMemoryStorage())).toEqual({ series: null, notice: null });
    expect(loadSeries(null)).toEqual({ series: null, notice: null });
    expect(saveSeries(null, newSeries(1))).toBe(false);
  });

  it('seria z rozpoczętym rozdaniem wraca po wczytaniu', () => {
    const storage = createMemoryStorage();
    let s = finishCurrentDeal(botMoves(startNextDeal(newSeries(5, { kontra: false, ramsch: true })), 500));
    s = { ...botMoves(startNextDeal(s), 6), currentUndo: true };
    expect(saveSeries(storage, s)).toBe(true);
    expect(loadSeries(storage)).toEqual({ series: s, notice: null });
  });

  it('uszkodzony zapis: komunikat i brak serii', () => {
    const bad = (value: string) => loadSeries(createMemoryStorage({ [GAME_STORAGE_KEY]: value }));
    expect(bad('{nie json')).toEqual({ series: null, notice: 'corrupted' });
    expect(bad(JSON.stringify({ schemaVersion: 2 })).notice).toBe('corrupted');
    const valid = { schemaVersion: 1, options: { kontra: true, ramsch: true }, seed: 1, finished: [], current: null };
    expect(bad(JSON.stringify(valid)).notice).toBeNull();
    expect(bad(JSON.stringify({ ...valid, finished: [{ dealNo: 5 }] })).notice).toBe('corrupted');
    expect(bad(JSON.stringify({ ...valid, finished: 'x' })).notice).toBe('corrupted');
    const illegalMove = { ...valid, current: { history: [{ seat: 0, action: { type: 'pass' } }], undo: false } };
    expect(bad(JSON.stringify(illegalMove)).notice).toBe('corrupted');
  });

  it('czyszczenie zapisu', () => {
    const storage = createMemoryStorage();
    saveSeries(storage, newSeries(1));
    clearSeries(storage);
    expect(storage.getItem(GAME_STORAGE_KEY)).toBeNull();
  });

  it('seria z dwoma zakończonymi rozdaniami i bieżącym wraca z identycznymi wierszami', () => {
    const storage = createMemoryStorage();
    let s = newSeries(21);
    for (let i = 0; i < 2; i++) s = finishCurrentDeal(botMoves(startNextDeal(s), 500));
    s = { ...botMoves(startNextDeal(s), 9), currentUndo: false };
    expect(s.rows).toHaveLength(2);
    saveSeries(storage, s);
    const stored = JSON.parse(storage.getItem(GAME_STORAGE_KEY)!);
    expect(stored.rows).toBeUndefined();
    expect(stored.finished).toHaveLength(2);
    const loaded = loadSeries(storage);
    expect(loaded.notice).toBeNull();
    expect(loaded.series!.rows).toEqual(s.rows);
    expect(loaded.series).toEqual(s);
  });
});

describe('sfałszowany zapis', () => {
  const OPTIONS = { kontra: false, ramsch: true };
  /** Historia bota do fazy „skat” w pierwszym rozdaniu serii o danym ziarnie. */
  function toSkat(seriesSeed: number): { history: GameDeal['history']; declarer: 0 | 1 | 2 } | null {
    let s = startGameDeal(dealSeed(seriesSeed, 1), OPTIONS);
    while (s.phase === 'bidding') {
      const seat = gameActor(s)!;
      s = applyGameAction(s, seat, botAction(s, seat));
    }
    return s.phase === 'skat' ? { history: s.history, declarer: s.declarer! } : null;
  }
  let seed = 0;
  let base: { history: GameDeal['history']; declarer: 0 | 1 | 2 } = null as never;
  for (seed = 1; seed < 200; seed++) {
    const found = toSkat(seed);
    if (found) {
      base = found;
      break;
    }
  }
  const store = (data: object) => loadSeries(createMemoryStorage({ [GAME_STORAGE_KEY]: JSON.stringify(data) }));
  const withCurrent = (...actions: GameAction[]) => ({
    schemaVersion: 1,
    options: OPTIONS,
    seed,
    finished: [],
    current: { history: [...base.history, ...actions.map((action) => ({ seat: base.declarer, action }))], undo: false },
  });

  it('poprawna historia do skata wczytuje się', () => {
    expect(store(withCurrent({ type: 'playHand' })).notice).toBeNull();
  });

  it('zgłoszenie z nieistniejącym atutem lub zapowiedzią → uszkodzony zapis', () => {
    const hand: GameAction = { type: 'playHand' };
    const badTrump = { type: 'declare', game: { kind: 'suit', trump: 'x' }, announce: 'none' } as unknown as GameAction;
    const badAnnounce = { type: 'declare', game: { kind: 'suit', trump: 'h' }, announce: 'foo' } as unknown as GameAction;
    expect(store(withCurrent(hand, badTrump))).toEqual({ series: null, notice: 'corrupted' });
    expect(store(withCurrent(hand, badAnnounce))).toEqual({ series: null, notice: 'corrupted' });
  });

  it('zakończone rozdanie, którego historia nie dochodzi do końca → uszkodzony zapis', () => {
    const data = { ...withCurrent(), current: null, finished: [{ history: base.history, undo: false }] };
    expect(store(data)).toEqual({ series: null, notice: 'corrupted' });
  });

  it('niepoprawne ziarno → uszkodzony zapis', () => {
    for (const bad of [-1, 1.5, 2 ** 32, '1']) {
      expect(store({ ...withCurrent(), seed: bad })).toEqual({ series: null, notice: 'corrupted' });
    }
  });
});
