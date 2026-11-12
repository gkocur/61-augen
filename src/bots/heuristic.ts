// src/bots/heuristic.ts
import {
  cardPoints,
  cardStrength,
  isTrump,
  legalMoves,
  nextSeat,
  rankOf,
  sameTeam,
  trickWinner,
  type CardId,
  type GameType,
} from '../engine';
import type { Bot } from './types';

function minBy(cards: CardId[], key: (card: CardId) => number): CardId {
  return cards.reduce((best, card) => (key(card) < key(best) ? card : best));
}

function maxBy(cards: CardId[], key: (card: CardId) => number): CardId {
  return cards.reduce((best, card) => (key(card) > key(best) ? card : best));
}

/** Im mniej, tym „tańsza” karta: najpierw oczka, potem atu, potem siła. */
function cheapness(card: CardId, game: GameType): number {
  return cardPoints(card) * 1000 + (isTrump(card, game) ? 500 : 0) + cardStrength(card, game);
}

/** Prosty bot do ćwiczeń — gra poprawnie, ale nie jest silnym przeciwnikiem. */
export const heuristicBot: Bot = (state, seat) => {
  const { game, trick } = state;
  const legal = legalMoves(state.hands[seat], trick, game);
  if (legal.length === 0) throw new Error(`Gracz ${seat} nie ma kart`);
  const strength = (card: CardId) => cardStrength(card, game);
  const winsNow = (card: CardId) => trickWinner([...trick, card], game) === trick.length;

  if (game.kind === 'null') {
    if (seat !== state.declarer || trick.length === 0) return minBy(legal, strength);
    const safe = legal.filter((card) => !winsNow(card));
    return safe.length > 0 ? maxBy(safe, strength) : minBy(legal, strength);
  }

  if (trick.length === 0) {
    const trumps = legal.filter((card) => isTrump(card, game));
    if (seat === state.declarer && trumps.length > 0) return maxBy(trumps, strength);
    const ace = legal.find((card) => rankOf(card) === 'A' && !isTrump(card, game));
    return ace ?? minBy(legal, (card) => cheapness(card, game));
  }

  const winnerSeat = nextSeat(state.leader, trickWinner(trick, game));
  if (sameTeam(winnerSeat, seat, state.declarer)) {
    // Partner bierze lewę — dokładamy jak najwięcej oczek, najchętniej nie z atu.
    return maxBy(legal, (card) => (isTrump(card, game) ? 0 : 100_000) + cardPoints(card) * 1000 - strength(card));
  }
  const winners = legal.filter(winsNow);
  if (winners.length > 0) return minBy(winners, (card) => (isTrump(card, game) ? 1000 : 0) + strength(card));
  return minBy(legal, (card) => cheapness(card, game));
};
