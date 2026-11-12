// src/test/storage.ts
import { STORAGE_KEY, createDefaultState } from '../state/storage';
import type { AppState, Settings } from '../state/types';

export function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, String(value));
    },
  };
}

export function storageWithState(settings: Partial<Settings> = {}, lessons: AppState['lessons'] = {}): Storage {
  const state = createDefaultState();
  return createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ ...state, settings: { ...state.settings, ...settings }, lessons }),
  });
}

export function brokenStorage(): Storage {
  const fail = () => {
    throw new Error('Brak dostępu');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}
