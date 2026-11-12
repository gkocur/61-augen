// src/glossary/cardNames.ts
// DANE DO WERYFIKACJI przez autora kursu — patrz specyfikacja, sekcja 8.1.
import { rankOf, suitOf, type CardId, type Rank, type Suit } from '../engine';
import { TERMS, formsFor } from './terms';
import type { DeckKind, Register, TextContext } from './types';

export interface SuitName {
  /** Nazwa koloru jako rzeczownik, np. „czerwień”, „kier”. */
  noun: string;
  /** Temat przymiotnika (np. „czerwienn”) — końcówka zależy od rodzaju i przypadku.
   *  Gdy brak — nazwa karty to „figura + rzeczownik” (np. „as kier”). */
  adjStem?: string;
}

export const SUIT_NAMES: Record<DeckKind, Record<Register, Record<Suit, SuitName>>> = {
  altenburg: {
    official: {
      c: { noun: 'żołądź', adjStem: 'żołędn' },
      s: { noun: 'zielone', adjStem: 'zielon' },
      h: { noun: 'czerwień', adjStem: 'czerwienn' },
      d: { noun: 'dzwonek', adjStem: 'dzwonkow' },
    },
    colloquial: { c: { noun: 'krojc' }, s: { noun: 'grin' }, h: { noun: 'herc' }, d: { noun: 'szel' } },
  },
  french: {
    official: { c: { noun: 'trefl' }, s: { noun: 'pik' }, h: { noun: 'kier' }, d: { noun: 'karo' } },
    colloquial: { c: { noun: 'krojc' }, s: { noun: 'grin' }, h: { noun: 'herc' }, d: { noun: 'szel' } },
  },
};

export const RANK_TERM: Record<Rank, string> = {
  '7': 'siodemka',
  '8': 'osemka',
  '9': 'dziewiatka',
  '10': 'dziesiatka',
  J: 'walet',
  Q: 'dama',
  K: 'krol',
  A: 'as',
};

const NUMBERS = { '7': '7', '8': '8', '9': '9', '10': '10' } as const;

/** Oznaczenie w rogu karty. */
export const RANK_LABELS: Record<DeckKind, Record<Register, Record<Rank, string>>> = {
  altenburg: {
    official: { ...NUMBERS, J: 'N', Q: 'W', K: 'K', A: 'T' },
    colloquial: { ...NUMBERS, J: 'U', Q: 'O', K: 'K', A: 'A' },
  },
  french: {
    official: { ...NUMBERS, J: 'W', Q: 'D', K: 'K', A: 'A' },
    colloquial: { ...NUMBERS, J: 'J', Q: 'D', K: 'K', A: 'A' },
  },
};

export function suitName(suit: Suit, ctx: TextContext): string {
  return SUIT_NAMES[ctx.deck][ctx.register][suit].noun;
}

/** Przypadki, w jakich można odmienić nazwę karty: `[[card:h-10:B]]`. */
export const CARD_CASES = ['M', 'D', 'C', 'B', 'N', 'Ms'] as const;
export type CardCase = (typeof CARD_CASES)[number];

// Figury (as, król, niżnik…) są w kartach rzeczownikami żywotnymi: biernik = dopełniacz („asa żołędnego”).
const ADJ_ENDINGS: Record<'m' | 'f', Record<CardCase, string>> = {
  m: { M: 'y', D: 'ego', C: 'emu', B: 'ego', N: 'ym', Ms: 'ym' },
  f: { M: 'a', D: 'ej', C: 'ej', B: 'ą', N: 'ą', Ms: 'ej' },
};

export function cardName(card: CardId, ctx: TextContext, caseKey: CardCase = 'M'): string {
  const rankForms = formsFor(TERMS[RANK_TERM[rankOf(card)]], ctx);
  const rank = rankForms[caseKey] ?? rankForms.M;
  const suit = SUIT_NAMES[ctx.deck][ctx.register][suitOf(card)];
  if (suit.adjStem) return `${rank} ${suit.adjStem}${ADJ_ENDINGS[rankForms.g === 'f' ? 'f' : 'm'][caseKey]}`;
  return `${rank} ${suit.noun}`;
}

export function rankLabel(card: CardId, ctx: TextContext): string {
  return RANK_LABELS[ctx.deck][ctx.register][rankOf(card)];
}
