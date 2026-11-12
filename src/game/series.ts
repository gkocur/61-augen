// src/game/series.ts
import { tournamentPoints, type Seat, type Triple } from '../engine';
import { startGameDeal, type GameDeal, type GameOptions, type GameResult } from './deal';

/** Gracze przy stole w kolejności zgodnej z ruchem wskazówek zegara: 0 = ty, 1 = bot po lewej, 2 = bot po prawej. */
export type PlayerId = 0 | 1 | 2;

export interface SeriesRow {
  dealNo: number;
  dealer: PlayerId;
  /** Rozgrywający (null — ramsz albo rozdanie przepadło). */
  declarer: PlayerId | null;
  result: GameResult;
  /** W rozdaniu cofano ruchy. */
  undo: boolean;
  /** Punkty Seegera-Fabiana (w ramszu — wynik ramsza) graczy 0, 1, 2. */
  points: Triple;
}

export interface Series {
  options: GameOptions;
  /** Ziarno serii; rozdanie n ma ziarno `dealSeed(seed, n)`. */
  seed: number;
  rows: SeriesRow[];
  /** Ruchy zakończonych rozdań (równolegle do `rows`) — z nich odtwarza się wiersze przy wczytaniu zapisu. */
  finished: { history: GameDeal['history']; undo: boolean }[];
  /** Bieżące rozdanie (numer = rows.length + 1) albo null między rozdaniami. */
  current: GameDeal | null;
  /** W bieżącym rozdaniu cofano ruchy. */
  currentUndo: boolean;
}

export const DEFAULT_OPTIONS: GameOptions = { kontra: true, ramsch: true };

export function newSeries(seed: number, options: GameOptions = DEFAULT_OPTIONS): Series {
  return { options, seed: seed >>> 0, rows: [], finished: [], current: null, currentUndo: false };
}

export function dealSeed(seriesSeed: number, dealNo: number): number {
  return (seriesSeed + Math.imul(dealNo, 0x9e3779b1)) >>> 0;
}

/** Rozdający w rozdaniu n: w pierwszym rozdaje bot po prawej, więc zaczynasz na ręku. */
export function dealerOf(dealNo: number): PlayerId {
  return ((dealNo + 1) % 3) as PlayerId;
}

/** Miejsce gracza w rozdaniu (0 = ręka, 1 = środkowa, 2 = ostatnia ręka — rozdający). */
export function seatOf(player: PlayerId, dealer: PlayerId): Seat {
  return ((player - dealer + 2) % 3) as Seat;
}

export function playerAt(seat: Seat, dealer: PlayerId): PlayerId {
  return ((dealer + 1 + seat) % 3) as PlayerId;
}

export function currentDealNo(series: Series): number {
  return series.rows.length + 1;
}

/** Rozpoczyna kolejne rozdanie (jeśli bieżące już trwa — bez zmian). */
export function startNextDeal(series: Series): Series {
  if (series.current) return series;
  const dealNo = currentDealNo(series);
  return { ...series, current: startGameDeal(dealSeed(series.seed, dealNo), series.options), currentUndo: false };
}

/** Punkty graczy za zakończone rozdanie. */
export function rowPoints(result: GameResult, dealer: PlayerId): Triple {
  const points: Triple = [0, 0, 0];
  if (result.kind === 'game') {
    const tp = tournamentPoints(result.settlement);
    for (const seat of [0, 1, 2] as Seat[]) {
      points[playerAt(seat, dealer)] = seat === result.declarer ? tp.declarer : tp.eachDefender;
    }
  } else if (result.kind === 'ramsch') {
    for (const seat of [0, 1, 2] as Seat[]) points[playerAt(seat, dealer)] = result.result.scores[seat];
  }
  return points;
}

/** Wiersz tabeli dla zakończonego rozdania numer `dealNo`. */
export function rowFor(dealNo: number, deal: GameDeal, undo: boolean): SeriesRow {
  if (deal.phase !== 'done' || !deal.result) throw new Error('Rozdanie nie jest zakończone');
  const dealer = dealerOf(dealNo);
  const result = deal.result;
  return {
    dealNo,
    dealer,
    declarer: result.kind === 'game' ? playerAt(result.declarer, dealer) : null,
    result,
    undo,
    points: rowPoints(result, dealer),
  };
}

/** Zapisuje zakończone bieżące rozdanie w tabeli. */
export function finishCurrentDeal(series: Series): Series {
  const current = series.current;
  if (!current) throw new Error('Rozdanie nie jest zakończone');
  const row = rowFor(currentDealNo(series), current, series.currentUndo);
  return {
    ...series,
    rows: [...series.rows, row],
    finished: [...series.finished, { history: current.history, undo: series.currentUndo }],
    current: null,
    currentUndo: false,
  };
}

export function totals(series: Series): Triple {
  return series.rows.reduce<Triple>((t, r) => [t[0] + r.points[0], t[1] + r.points[1], t[2] + r.points[2]], [0, 0, 0]);
}
