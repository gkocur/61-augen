// src/glossary/cardNames.ts
// DANE DO WERYFIKACJI przez autora kursu — patrz specyfikacja, sekcja 8.1.
import { rankOf, suitOf, type CardId, type Rank, type Suit } from '../engine';
import { TERMS, formsFor } from './terms';
import type { DeckKind, Register, TextContext } from './types';

export interface SuitName {
  /** Nazwa koloru jako rzeczownik, np. „czerwień”, „kier”. */
  noun: string;
  /** Przymiotnik do nazwy karty; gdy brak — nazwa karty to „figura + rzeczownik”. */
  adj?: { m: string; f: string };
}

export const SUIT_NAMES: Record<DeckKind, Record<Register, Record<Suit, SuitName>>> = {
  altenburg: {
    official: {
      c: { noun: 'żołądź', adj: { m: 'żołędny', f: 'żołędna' } },
      s: { noun: 'zielone', adj: { m: 'zielony', f: 'zielona' } },
      h: { noun: 'czerwień', adj: { m: 'czerwienny', f: 'czerwienna' } },
      d: { noun: 'dzwonek', adj: { m: 'dzwonkowy', f: 'dzwonkowa' } },
    },
    colloquial: {
      c: { noun: 'ajchel' },
      s: { noun: 'grin' },
      h: { noun: 'herc' },
      d: { noun: 'szele' },
    },
  },
  french: {
    official: { c: { noun: 'trefl' }, s: { noun: 'pik' }, h: { noun: 'kier' }, d: { noun: 'karo' } },
    colloquial: { c: { noun: 'trefl' }, s: { noun: 'pik' }, h: { noun: 'kier' }, d: { noun: 'karo' } },
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
    official: { ...NUMBERS, J: 'N', Q: 'W', K: 'K', A: 'A' },
    colloquial: { ...NUMBERS, J: 'U', Q: 'O', K: 'K', A: 'D' },
  },
  french: {
    official: { ...NUMBERS, J: 'W', Q: 'D', K: 'K', A: 'A' },
    colloquial: { ...NUMBERS, J: 'J', Q: 'D', K: 'K', A: 'A' },
  },
};

export function suitName(suit: Suit, ctx: TextContext): string {
  return SUIT_NAMES[ctx.deck][ctx.register][suit].noun;
}

export function cardName(card: CardId, ctx: TextContext): string {
  const rank = formsFor(TERMS[RANK_TERM[rankOf(card)]], ctx);
  const suit = SUIT_NAMES[ctx.deck][ctx.register][suitOf(card)];
  if (suit.adj) return `${rank.M} ${rank.g === 'f' ? suit.adj.f : suit.adj.m}`;
  return `${rank.M} ${suit.noun}`;
}

export function rankLabel(card: CardId, ctx: TextContext): string {
  return RANK_LABELS[ctx.deck][ctx.register][rankOf(card)];
}
