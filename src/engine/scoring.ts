// src/engine/scoring.ts
import type { CardId, Suit } from './cards';
import type { GameType } from './game';

/** Zapowiedź: `ouvert` w grze kolorowej/grandzie oznacza grę otwartą (z zapowiedzią czarnego); w nullu — null otwarty. */
export type Announcement = 'none' | 'schneider' | 'schwarz' | 'ouvert';

/** Zgłoszenie gry przez rozgrywającego. */
export interface Declaration {
  game: GameType;
  /** Gra z ręki (bez podnoszenia skata). */
  hand: boolean;
  announce: Announcement;
}

export interface PlayOutcome {
  /** Oczka rozgrywającego razem ze skatem. */
  declarerPoints: number;
  declarerTricks: number;
  /** Liczba lew w rozdaniu (domyślnie 10). */
  totalTricks?: number;
}

export interface Settlement {
  won: boolean;
  /** Wartość gry (dodatnia). */
  value: number;
  /** Wynik zapisany rozgrywającemu: +wartość albo −2 × wartość. */
  score: number;
  overbid: boolean;
  schneider: boolean;
  schwarz: boolean;
}

export const SUIT_BASE: Record<Suit, number> = { d: 9, h: 10, s: 11, c: 12 };
export const GRAND_BASE = 24;
export const NULL_VALUES = { plain: 23, hand: 35, ouvert: 46, ouvertHand: 59 } as const;

/** Wartość bazowa; dla nulla `null` (null ma stałe wartości). */
export function baseValue(game: GameType): number | null {
  if (game.kind === 'null') return null;
  return game.kind === 'grand' ? GRAND_BASE : SUIT_BASE[game.trump];
}

const JACKS: readonly CardId[] = ['c-J', 's-J', 'h-J', 'd-J'];
const TRUMP_RANKS = ['A', '10', 'K', 'Q', '9', '8', '7'] as const;

/** Atu od najwyższego — kolejność, w jakiej liczy się matadory. */
export function matadorOrder(game: GameType): CardId[] {
  if (game.kind === 'null') throw new Error('Null nie ma matadorów');
  if (game.kind === 'grand') return [...JACKS];
  return [...JACKS, ...TRUMP_RANKS.map((rank) => `${game.trump}-${rank}` as CardId)];
}

export interface Matadors {
  /** true = „z”, false = „bez”. */
  with: boolean;
  count: number;
}

/** Matadory liczone z kart rozgrywającego (zwykle 12 kart: ręka + skat). */
export function matadors(cards: readonly CardId[], game: GameType): Matadors {
  const held = matadorOrder(game).map((card) => cards.includes(card));
  const first = held[0];
  const breakAt = held.findIndex((h) => h !== first);
  return { with: first, count: breakAt === -1 ? held.length : breakAt };
}

/** Opis błędu zgłoszenia albo null, gdy zgłoszenie jest poprawne. */
export function declarationIssue(d: Declaration): string | null {
  if (d.game.kind === 'null') {
    return d.announce === 'none' || d.announce === 'ouvert' ? null : 'W nullu nie zapowiada się krawca ani czarnego';
  }
  if (d.announce !== 'none' && !d.hand) return 'Zapowiedzi są możliwe tylko w grze z ręki';
  return null;
}

export function nullValue(d: Declaration): number {
  if (d.announce === 'ouvert') return d.hand ? NULL_VALUES.ouvertHand : NULL_VALUES.ouvert;
  return d.hand ? NULL_VALUES.hand : NULL_VALUES.plain;
}

export interface SettleInput {
  declaration: Declaration;
  /** Karty rozgrywającego razem ze skatem (do matadorów; w nullu nieużywane). */
  declarerCards: readonly CardId[];
  outcome: PlayOutcome;
  /** Wylicytowana stawka (do sprawdzenia przelicytowania). */
  bid?: number;
}

export function settle({ declaration: d, declarerCards, outcome, bid }: SettleInput): Settlement {
  const issue = declarationIssue(d);
  if (issue) throw new Error(issue);
  const totalTricks = outcome.totalTricks ?? 10;

  if (d.game.kind === 'null') {
    const value = nullValue(d);
    const overbid = bid !== undefined && bid > value;
    const won = outcome.declarerTricks === 0 && !overbid;
    return { won, value, score: won ? value : -2 * value, overbid, schneider: false, schwarz: false };
  }

  const base = baseValue(d.game) as number;
  const schneider = outcome.declarerPoints >= 90 || outcome.declarerPoints <= 30;
  const schwarz = outcome.declarerTricks === totalTricks || outcome.declarerTricks === 0;
  const announcedSchneider = d.announce !== 'none';
  const announcedSchwarz = d.announce === 'schwarz' || d.announce === 'ouvert';

  const multiplier =
    matadors(declarerCards, d.game).count +
    1 +
    (d.hand ? 1 : 0) +
    (schneider || announcedSchneider ? 1 : 0) +
    (announcedSchneider ? 1 : 0) +
    (schwarz || announcedSchwarz ? 1 : 0) +
    (announcedSchwarz ? 1 : 0) +
    (d.announce === 'ouvert' ? 1 : 0);

  let won =
    outcome.declarerPoints >= 61 &&
    (!announcedSchneider || outcome.declarerPoints >= 90) &&
    (!announcedSchwarz || outcome.declarerTricks === totalTricks);
  let value = base * multiplier;
  let overbid = false;
  if (bid !== undefined && value < bid) {
    overbid = true;
    won = false;
    value = base * Math.ceil(bid / base);
  }
  return { won, value, score: won ? value : -2 * value, overbid, schneider, schwarz };
}

/** Punkty turniejowe (Seeger-Fabian, stół trzyosobowy). */
export function tournamentPoints(s: Settlement): { declarer: number; eachDefender: number } {
  return s.won ? { declarer: s.value + 50, eachDefender: 0 } : { declarer: -2 * s.value - 50, eachDefender: 40 };
}
