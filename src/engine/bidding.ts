// src/engine/bidding.ts
import type { CardId } from './cards';
import type { GameType } from './game';
import { GRAND_BASE, NULL_VALUES, SUIT_BASE, baseValue, matadors } from './scoring';

const MIN_BID = 18;
/** Najwyższy mnożnik: 11 matadorów + gra, ręka, krawiec, zapowiedź, czarny, zapowiedź, otwarta. */
const MAX_SUIT_MULTIPLIER = 18;
/** W grandzie matadorów jest najwyżej 4. */
const MAX_GRAND_MULTIPLIER = 11;

function computeBidValues(): number[] {
  const values = new Set<number>(Object.values(NULL_VALUES));
  for (const base of Object.values(SUIT_BASE)) {
    for (let m = 2; m <= MAX_SUIT_MULTIPLIER; m++) values.add(base * m);
  }
  for (let m = 2; m <= MAX_GRAND_MULTIPLIER; m++) values.add(GRAND_BASE * m);
  return [...values].filter((v) => v >= MIN_BID).sort((a, b) => a - b);
}

/** Wszystkie dozwolone stawki licytacji, rosnąco. */
export const BID_VALUES: readonly number[] = computeBidValues();

/** Najbliższa stawka wyższa od `after` (null = pierwsza stawka). */
export function nextBid(after: number | null): number | null {
  if (after === null) return BID_VALUES[0];
  return BID_VALUES.find((v) => v > after) ?? null;
}

/** Do ilu można licytować daną ręką w danej grze (bez krawca i czarnego). */
export function maxBidFor(cards: readonly CardId[], game: GameType, hand = false): number {
  const base = baseValue(game);
  if (base === null) return hand ? NULL_VALUES.hand : NULL_VALUES.plain;
  return base * (matadors(cards, game).count + 1 + (hand ? 1 : 0));
}
