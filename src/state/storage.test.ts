// src/state/storage.test.ts
import { describe, expect, it } from 'vitest';
import { brokenStorage, createMemoryStorage } from '../test/storage';
import { BACKUP_KEY, STORAGE_KEY, createDefaultState, loadState, migrate, saveState } from './storage';

describe('zapis stanu', () => {
  it('bez dostępu do pamięci: stan domyślny i komunikat', () => {
    expect(loadState(null)).toEqual({ state: createDefaultState(), notice: 'unavailable' });
    expect(loadState(brokenStorage()).notice).toBe('unavailable');
  });

  it('pusta pamięć: stan domyślny bez komunikatu', () => {
    const { state, notice } = loadState(createMemoryStorage());
    expect(notice).toBeNull();
    expect(state.settings).toEqual({ deck: 'altenburg', register: 'official', unlockAll: false });
  });

  it('zapisany stan wraca po odczycie', () => {
    const storage = createMemoryStorage();
    const state = createDefaultState();
    state.settings.deck = 'french';
    state.lessons['m1-l01'] = { status: 'passed', bestScore: 1, attempts: 2 };
    expect(saveState(storage, state)).toBe(true);
    expect(loadState(storage)).toEqual({ state, notice: null });
  });

  it('uszkodzony JSON lub nieznana wersja: reset z komunikatem', () => {
    expect(loadState(createMemoryStorage({ [STORAGE_KEY]: 'nie json' })).notice).toBe('corrupted');
    expect(loadState(createMemoryStorage({ [STORAGE_KEY]: '{"schemaVersion":99}' })).notice).toBe('corrupted');
  });

  it('uszkodzony zapis trafia do kopii zapasowej', () => {
    const raw = '{"schemaVersion":99}';
    const storage = createMemoryStorage({ [STORAGE_KEY]: raw });
    loadState(storage);
    expect(storage.getItem(BACKUP_KEY)).toBe(raw);
  });

  it('migracja v1 naprawia złe pola i odrzuca złe wpisy lekcji', () => {
    const state = migrate({
      schemaVersion: 1,
      settings: { deck: 'xyz', register: 'colloquial', unlockAll: 'tak' },
      lessons: {
        ok: { status: 'failed', bestScore: 0.5, attempts: 1 },
        zly: { status: 'cos', bestScore: 2, attempts: -1 },
      },
    });
    expect(state).toEqual({
      schemaVersion: 1,
      settings: { deck: 'altenburg', register: 'colloquial', unlockAll: false },
      lessons: { ok: { status: 'failed', bestScore: 0.5, attempts: 1 } },
    });
  });

  it('zapis nie udaje się bez pamięci', () => {
    expect(saveState(null, createDefaultState())).toBe(false);
    expect(saveState(brokenStorage(), createDefaultState())).toBe(false);
  });

  it('każdy stan domyślny to nowy obiekt', () => {
    const a = createDefaultState();
    a.settings.deck = 'french';
    expect(createDefaultState().settings.deck).toBe('altenburg');
  });
});
