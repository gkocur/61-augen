// src/game/storage.ts
import { replayGameDeal, type GameDeal, type GameOptions } from './deal';
import { currentDealNo, dealSeed, rowFor, type Series } from './series';

export const GAME_STORAGE_KEY = 'skat-trener:v1:gra';

/** Zapis serii: bieżące rozdanie jako lista ruchów (odtwarzane z ziarna przy wczytaniu). */
interface StoredSeries {
  schemaVersion: 1;
  options: GameOptions;
  seed: number;
  finished: Series['finished'];
  current: { history: GameDeal['history']; undo: boolean } | null;
}

export interface LoadedSeries {
  series: Series | null;
  notice: 'corrupted' | null;
}

export function saveSeries(storage: Storage | null, series: Series): boolean {
  if (!storage) return false;
  const data: StoredSeries = {
    schemaVersion: 1,
    options: series.options,
    seed: series.seed,
    finished: series.finished,
    current: series.current ? { history: series.current.history, undo: series.currentUndo } : null,
  };
  try {
    storage.setItem(GAME_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
/** Wczytuje serię. Brak zapisu → series = null bez komunikatu; uszkodzony zapis → null z komunikatem. */
export function loadSeries(storage: Storage | null): LoadedSeries {
  let raw: string | null;
  try {
    raw = storage?.getItem(GAME_STORAGE_KEY) ?? null;
  } catch {
    return { series: null, notice: null };
  }
  if (raw === null) return { series: null, notice: null };
  try {
    const data: unknown = JSON.parse(raw);
    if (
      !isObject(data) ||
      data.schemaVersion !== 1 ||
      !isObject(data.options) ||
      typeof data.options.kontra !== 'boolean' ||
      typeof data.options.ramsch !== 'boolean' ||
      !Number.isInteger(data.seed) ||
      (data.seed as number) < 0 ||
      (data.seed as number) > 0xffffffff ||
      !Array.isArray(data.finished) ||
      !data.finished.every((f) => isObject(f) && Array.isArray(f.history) && typeof f.undo === 'boolean')
    ) {
      throw new Error('zły format');
    }
    const options: GameOptions = { kontra: data.options.kontra, ramsch: data.options.ramsch };
    const seed = data.seed as number;
    const base: Series = { options, seed, rows: [], finished: [], current: null, currentUndo: false };
    // Wiersze tabeli powstają z odtworzenia rozdań, więc nie da się ich sfałszować w zapisie.
    (data.finished as Series['finished']).forEach(({ history, undo }, i) => {
      const deal = replayGameDeal(dealSeed(seed, i + 1), options, history);
      base.rows.push(rowFor(i + 1, deal, undo));
      base.finished.push({ history: deal.history, undo });
    });
    const stored = data.current;
    if (stored === null || stored === undefined) return { series: base, notice: null };
    if (!isObject(stored) || !Array.isArray(stored.history) || typeof stored.undo !== 'boolean') throw new Error('zły format');
    const current = replayGameDeal(dealSeed(base.seed, currentDealNo(base)), options, stored.history as GameDeal['history']);
    return { series: { ...base, current, currentUndo: stored.undo }, notice: null };
  } catch {
    return { series: null, notice: 'corrupted' };
  }
}

export function clearSeries(storage: Storage | null): void {
  try {
    storage?.removeItem(GAME_STORAGE_KEY);
  } catch {
    // brak dostępu do pamięci — nic do zrobienia
  }
}
