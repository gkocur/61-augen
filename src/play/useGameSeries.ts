// src/play/useGameSeries.ts
import { useCallback, useEffect, useState } from 'react';
import type { Seat } from '../engine';
import {
  applyGameAction,
  clearSeries,
  finishCurrentDeal,
  loadSeries,
  newSeries,
  saveSeries,
  startNextDeal,
  type GameAction,
  type GameOptions,
  type Series,
} from '../game';

export interface GameSeriesApi {
  series: Series | null;
  notice: 'corrupted' | null;
  dismissNotice: () => void;
  /** Nowa seria z pierwszym rozdaniem. */
  start: (options: GameOptions) => void;
  /** Ruch gracza albo bota w bieżącym rozdaniu (ruch nieaktualny — np. spóźniony bot — jest pomijany). */
  act: (seat: Seat, action: GameAction) => void;
  /** Zapisuje zakończone rozdanie w tabeli i zaczyna następne. */
  nextDeal: () => void;
  /** Zapisuje zakończone rozdanie w tabeli (bez rozpoczynania następnego). */
  finishDeal: () => void;
  /** Kończy serię (zapis usunięty, powrót do ekranu startowego). */
  reset: () => void;
}

const randomSeed = () => Math.floor(Math.random() * 0x100000000);

export function useGameSeries(storage: Storage | null, seedSource: () => number = randomSeed): GameSeriesApi {
  const [initial] = useState(() => loadSeries(storage));
  const [series, setSeries] = useState<Series | null>(initial.series);
  const [notice, setNotice] = useState(initial.notice);

  useEffect(() => {
    if (series) saveSeries(storage, series);
    else clearSeries(storage);
  }, [storage, series]);

  const start = useCallback((options: GameOptions) => setSeries(startNextDeal(newSeries(seedSource(), options))), [seedSource]);

  const act = useCallback((seat: Seat, action: GameAction) => {
    setSeries((s) => {
      if (!s?.current) return s;
      try {
        return { ...s, current: applyGameAction(s.current, seat, action) };
      } catch {
        return s;
      }
    });
  }, []);

  const finishIfDone = (s: Series) => (s.current?.phase === 'done' ? finishCurrentDeal(s) : s);
  const nextDeal = useCallback(() => setSeries((s) => (s ? startNextDeal(finishIfDone(s)) : s)), []);
  const finishDeal = useCallback(() => setSeries((s) => (s ? finishIfDone(s) : s)), []);
  const reset = useCallback(() => setSeries(null), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  return { series, notice, dismissNotice, start, act, nextDeal, finishDeal, reset };
}
