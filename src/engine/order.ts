import { SUITS, rankOf, suitOf, type CardId, type Rank, type Suit } from './cards';
import type { GameType } from './game';

/** Kolor wyjścia: zwykły kolor albo atu. */
export type Lead = Suit | 'trump';

const JACK_STRENGTH: Record<Suit, number> = { c: 4, s: 3, h: 2, d: 1 };
const NORMAL_ORDER: readonly Rank[] = ['7', '8', '9', 'Q', 'K', '10', 'A'];
const NULL_ORDER: readonly Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function isTrump(card: CardId, game: GameType): boolean {
  if (game.kind === 'null') return false;
  if (rankOf(card) === 'J') return true;
  return game.kind === 'suit' && suitOf(card) === game.trump;
}

export function leadOf(card: CardId, game: GameType): Lead {
  return isTrump(card, game) ? 'trump' : suitOf(card);
}

/** Siła karty w obrębie jej grupy (atu albo kolor). Walety w atu: 101–104. */
function strength(card: CardId, game: GameType): number {
  if (game.kind === 'null') return NULL_ORDER.indexOf(rankOf(card));
  if (rankOf(card) === 'J') return 100 + JACK_STRENGTH[suitOf(card)];
  return NORMAL_ORDER.indexOf(rankOf(card));
}

function beats(challenger: CardId, current: CardId, game: GameType): boolean {
  const challengerTrump = isTrump(challenger, game);
  const currentTrump = isTrump(current, game);
  if (challengerTrump !== currentTrump) return challengerTrump;
  if (!challengerTrump && suitOf(challenger) !== suitOf(current)) return false;
  return strength(challenger, game) > strength(current, game);
}

/** Indeks karty (0–2), która bierze lewę. */
export function trickWinner(trick: readonly CardId[], game: GameType): number {
  if (trick.length === 0) throw new Error('Pusta lewa nie ma zwycięzcy');
  let best = 0;
  for (let i = 1; i < trick.length; i++) {
    if (beats(trick[i], trick[best], game)) best = i;
  }
  return best;
}

/** Kolejność wyświetlania: atu (malejąco), potem kolory ♣ ♠ ♥ ♦ (malejąco). */
export function sortHand(hand: readonly CardId[], game: GameType): CardId[] {
  const group = (card: CardId) => (isTrump(card, game) ? -1 : SUITS.indexOf(suitOf(card)));
  return [...hand].sort((a, b) => group(a) - group(b) || strength(b, game) - strength(a, game));
}
