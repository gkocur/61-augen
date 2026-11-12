// src/state/storage.ts
import type { AppState, LessonProgress, Settings } from './types';

export const STORAGE_KEY = 'skat-trener:v1';
export const BACKUP_KEY = 'skat-trener:v1:backup';

export type LoadNotice = 'unavailable' | 'corrupted' | null;

export interface LoadResult {
  state: AppState;
  notice: LoadNotice;
}

export function createDefaultState(): AppState {
  return {
    schemaVersion: 1,
    settings: { deck: 'altenburg', register: 'colloquial', unlockAll: false },
    lessons: {},
  };
}

/** localStorage, o ile działa (tryb prywatny / blokada → null). */
export function getBrowserStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const probe = '__skat_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function loadState(storage: Storage | null): LoadResult {
  if (!storage) return { state: createDefaultState(), notice: 'unavailable' };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: createDefaultState(), notice: 'unavailable' };
  }
  if (raw === null) return { state: createDefaultState(), notice: null };
  try {
    const migrated = migrate(JSON.parse(raw));
    if (migrated) return { state: migrated, notice: null };
  } catch {
    // uszkodzony JSON — obsłużony niżej
  }
  try {
    storage.setItem(BACKUP_KEY, raw);
  } catch {
    // kopia jest dodatkiem — brak miejsca nie może przeszkodzić w starcie
  }
  return { state: createDefaultState(), notice: 'corrupted' };
}

export function saveState(storage: Storage | null, state: AppState): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Sprowadza zapisane dane do bieżącego schematu; null = nie da się odczytać. */
export function migrate(data: unknown): AppState | null {
  if (!isRecord(data)) return null;
  switch (data.schemaVersion) {
    case 1:
      return sanitizeV1(data);
    default:
      return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback;
}

function sanitizeV1(data: Record<string, unknown>): AppState {
  const defaults = createDefaultState().settings;
  const raw: Record<string, unknown> = isRecord(data.settings) ? data.settings : {};
  const settings: Settings = {
    deck: oneOf(raw.deck, ['altenburg', 'french'] as const, defaults.deck),
    register: oneOf(raw.register, ['official', 'colloquial'] as const, defaults.register),
    unlockAll: typeof raw.unlockAll === 'boolean' ? raw.unlockAll : defaults.unlockAll,
  };
  const lessons: Record<string, LessonProgress> = {};
  if (isRecord(data.lessons)) {
    for (const [id, value] of Object.entries(data.lessons)) {
      const progress = sanitizeLesson(value);
      if (progress) lessons[id] = progress;
    }
  }
  return { schemaVersion: 1, settings, lessons };
}

function sanitizeLesson(value: unknown): LessonProgress | null {
  if (!isRecord(value)) return null;
  const { status, bestScore, attempts } = value;
  if (status !== 'passed' && status !== 'failed') return null;
  if (typeof bestScore !== 'number' || !Number.isFinite(bestScore) || bestScore < 0 || bestScore > 1) return null;
  if (typeof attempts !== 'number' || !Number.isInteger(attempts) || attempts < 0) return null;
  return { status, bestScore, attempts };
}
