// src/game/storage.test.ts
import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from '../test/storage';
import { botAction } from './botPlayer';
import { applyGameAction, gameActor } from './deal';
import { finishCurrentDeal, newSeries, startNextDeal, type Series } from './series';
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
    const valid = { schemaVersion: 1, options: { kontra: true, ramsch: true }, seed: 1, rows: [], current: null };
    expect(bad(JSON.stringify(valid)).notice).toBeNull();
    expect(bad(JSON.stringify({ ...valid, rows: [{ dealNo: 5 }] })).notice).toBe('corrupted');
    const illegalMove = { ...valid, current: { history: [{ seat: 0, action: { type: 'pass' } }], undo: false } };
    expect(bad(JSON.stringify(illegalMove)).notice).toBe('corrupted');
  });

  it('czyszczenie zapisu', () => {
    const storage = createMemoryStorage();
    saveSeries(storage, newSeries(1));
    clearSeries(storage);
    expect(storage.getItem(GAME_STORAGE_KEY)).toBeNull();
  });
});
