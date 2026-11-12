export const SUITS = ['c', 's', 'h', 'd'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
export type Rank = (typeof RANKS)[number];

export type CardId = `${Suit}-${Rank}`;

export const ALL_CARDS: readonly CardId[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => `${suit}-${rank}` as CardId),
);

export function isCardId(value: string): value is CardId {
  return (ALL_CARDS as readonly string[]).includes(value);
}

export function isSuit(value: string): value is Suit {
  return (SUITS as readonly string[]).includes(value);
}

export function suitOf(card: CardId): Suit {
  return card.split('-')[0] as Suit;
}

export function rankOf(card: CardId): Rank {
  return card.split('-')[1] as Rank;
}

const POINTS: Record<Rank, number> = { '7': 0, '8': 0, '9': 0, '10': 10, J: 2, Q: 3, K: 4, A: 11 };

export function cardPoints(card: CardId): number {
  return POINTS[rankOf(card)];
}

export function sumPoints(cards: readonly CardId[]): number {
  return cards.reduce((total, card) => total + cardPoints(card), 0);
}
