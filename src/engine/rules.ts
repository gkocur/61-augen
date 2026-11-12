import type { CardId } from './cards';
import type { GameType } from './game';
import { leadOf } from './order';

export function legalMoves(hand: readonly CardId[], trick: readonly CardId[], game: GameType): CardId[] {
  if (trick.length === 0) return [...hand];
  const lead = leadOf(trick[0], game);
  const following = hand.filter((card) => leadOf(card, game) === lead);
  return following.length > 0 ? following : [...hand];
}

export function isLegalMove(
  card: CardId,
  hand: readonly CardId[],
  trick: readonly CardId[],
  game: GameType,
): boolean {
  return hand.includes(card) && legalMoves(hand, trick, game).includes(card);
}
