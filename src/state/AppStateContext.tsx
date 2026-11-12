// src/state/AppStateContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { resolveText, type TextContext } from '../glossary';
import { recordResult } from './progress';
import { createDefaultState, getBrowserStorage, loadState, saveState, type LoadNotice } from './storage';
import type { AppState, Settings } from './types';

interface AppStateApi {
  state: AppState;
  notice: LoadNotice;
  updateSettings: (patch: Partial<Settings>) => void;
  recordLessonResult: (lessonId: string, score: number) => void;
  resetProgress: () => void;
  dismissNotice: () => void;
}

const AppStateCtx = createContext<AppStateApi | null>(null);

interface ProviderProps {
  children: ReactNode;
  /** undefined = localStorage przeglądarki; null = brak pamięci. */
  storage?: Storage | null;
}

export function AppStateProvider({ children, storage }: ProviderProps) {
  const [store] = useState<Storage | null>(() => (storage === undefined ? getBrowserStorage() : storage));
  const [initial] = useState(() => loadState(store));
  const [state, setState] = useState<AppState>(initial.state);
  const [notice, setNotice] = useState<LoadNotice>(initial.notice);

  const saveFailureReported = useRef(false);

  useEffect(() => {
    if (store && !saveState(store, state) && !saveFailureReported.current) {
      saveFailureReported.current = true;
      setNotice((n) => n ?? 'unavailable');
    }
  }, [store, state]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);
  const recordLessonResult = useCallback((lessonId: string, score: number) => {
    setState((s) => recordResult(s, lessonId, score));
  }, []);
  const resetProgress = useCallback(() => {
    setState((s) => ({ ...createDefaultState(), settings: s.settings }));
  }, []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const api = useMemo(
    () => ({ state, notice, updateSettings, recordLessonResult, resetProgress, dismissNotice }),
    [state, notice, updateSettings, recordLessonResult, resetProgress, dismissNotice],
  );
  return <AppStateCtx.Provider value={api}>{children}</AppStateCtx.Provider>;
}

export function useAppState(): AppStateApi {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useAppState użyty poza AppStateProvider');
  return ctx;
}

export function useTextContext(): TextContext {
  const { deck, register } = useAppState().state.settings;
  return useMemo(() => ({ deck, register }), [deck, register]);
}

export function useText(): (text: string) => string {
  const ctx = useTextContext();
  return useCallback((text: string) => resolveText(text, ctx), [ctx]);
}
