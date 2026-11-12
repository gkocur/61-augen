// src/game/storage.ts
import { replayGameDeal, type GameDeal, type GameOptions } from './deal';
import { currentDealNo, dealSeed, type Series, type SeriesRow } from './series';

export const GAME_STORAGE_KEY = 'skat-trener:v1:gra';

/** Zapis serii: bieżące rozdanie jako lista ruchów (odtwarzane z ziarna przy wczytaniu). */
interface StoredSeries {
  schemaVersion: 1;
  options: GameOptions;
  seed: number;
  rows: SeriesRow[];
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
    rows: series.rows,
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
const isTriple = (v: unknown) => Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === 'number' && Number.isFinite(n));

function isRow(v: unknown, index: number): v is SeriesRow {
  return (
    isObject(v) &&
    v.dealNo === index + 1 &&
    [0, 1, 2].includes(v.dealer as number) &&
    (v.declarer === null || [0, 1, 2].includes(v.declarer as number)) &&
    typeof v.undo === 'boolean' &&
    isTriple(v.points) &&
    isObject(v.result) &&
    ['game', 'ramsch', 'passedOut'].includes(v.result.kind as string)
  );
}

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
      typeof data.seed !== 'number' ||
      !Array.isArray(data.rows) ||
      !data.rows.every(isRow)
    ) {
      throw new Error('zły format');
    }
    const options: GameOptions = { kontra: data.options.kontra, ramsch: data.options.ramsch };
    const base: Series = { options, seed: data.seed, rows: data.rows as SeriesRow[], current: null, currentUndo: false };
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
