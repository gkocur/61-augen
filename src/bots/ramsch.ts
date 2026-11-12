// src/bots/ramsch.ts
import { cardPoints, cardStrength, isTrump, legalMoves, trickWinner, type CardId, type GameType } from '../engine';
import type { Bot } from './types';

/** Niżej = karta słabsza; walety (atu) zawsze ponad kolorami. */
const rank = (card: CardId, game: GameType) => (isTrump(card, game) ? 1000 : 0) + cardStrength(card, game);

function pick(cards: CardId[], key: (card: CardId) => number, better: (a: number, b: number) => boolean): CardId {
  return cards.reduce((best, card) => (better(key(card), key(best)) ? card : best));
}

/**
 * Bot do ramsza: unika oczek.
 * Wychodzi najniższą kartą; gdy może nie brać lewy — pozbywa się najcenniejszej karty, która nie bierze;
 * gdy musi wziąć — bierze kartą z najmniejszą liczbą oczek.
 */
export const ramschBot: Bot = (state, seat) => {
  const { game, trick } = state;
  const legal = legalMoves(state.hands[seat], trick, game);
  if (legal.length === 0) throw new Error(`Gracz ${seat} nie ma kart`);
  if (trick.length === 0) return pick(legal, (c) => rank(c, game) * 100 + cardPoints(c), (a, b) => a < b);
  const winsNow = (card: CardId) => trickWinner([...trick, card], game) === trick.length;
  const losing = legal.filter((card) => !winsNow(card));
  if (losing.length > 0) return pick(losing, (c) => cardPoints(c) * 10_000 + rank(c, game), (a, b) => a > b);
  return pick(legal, (c) => cardPoints(c) * 10_000 + rank(c, game), (a, b) => a < b);
};
