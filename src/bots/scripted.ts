// src/bots/scripted.ts
import { legalMoves, type CardId } from '../engine';
import { heuristicBot } from './heuristic';
import type { Bot } from './types';

/** Gra pierwszą kartę ze skryptu, którą jeszcze ma — o ile jest dozwolona; inaczej `fallback`. */
export function scriptedBot(script: readonly CardId[], fallback: Bot = heuristicBot): Bot {
  return (state, seat) => {
    const hand = state.hands[seat];
    const next = script.find((card) => hand.includes(card));
    if (next && legalMoves(hand, state.trick, state.game).includes(next)) return next;
    return fallback(state, seat);
  };
}

export function createBot(script?: readonly CardId[]): Bot {
  return script && script.length > 0 ? scriptedBot(script) : heuristicBot;
}
