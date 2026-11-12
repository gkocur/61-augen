// src/game/botPlayer.ts
import { chooseDiscard, chooseGame, evaluateHand, heuristicBot, ramschBot, wantsKontra, wantsRe } from '../bots';
import { nextBid, type Seat } from '../engine';
import { FIRST_BID } from './auction';
import type { GameAction, GameDeal } from './deal';

/** Granica licytacji bota (0 = nie licytuje). */
export function biddingLimit(state: GameDeal, seat: Seat): number {
  return evaluateHand(state.hands[seat])?.limit ?? 0;
}

/** Ruch, który wykonałby bot na miejscu `seat` (to samo posłuży jako podpowiedź dla gracza). */
export function botAction(state: GameDeal, seat: Seat): GameAction {
  switch (state.phase) {
    case 'bidding': {
      const a = state.auction;
      const limit = biddingLimit(state, seat);
      if (a.stage === 3) return limit >= FIRST_BID ? { type: 'bid', value: FIRST_BID } : { type: 'pass' };
      if (a.turn === 'bidder') {
        const next = nextBid(a.highest);
        return next !== null && next <= limit ? { type: 'bid', value: next } : { type: 'pass' };
      }
      return a.highest !== null && a.highest <= limit ? { type: 'hold' } : { type: 'pass' };
    }
    case 'skat':
      return { type: 'takeSkat' };
    case 'discard': {
      const cards = state.hands[seat];
      return { type: 'discard', cards: chooseDiscard(cards, chooseGame(cards, state.bid!)) };
    }
    case 'declare':
      return { type: 'declare', game: chooseGame([...state.hands[seat], ...state.skat], state.bid!), announce: 'none' };
    case 'kontra': {
      const declaration = state.declaration!;
      const wants = seat === state.declarer ? wantsRe(state.hands[seat], declaration) : wantsKontra(state.hands[seat], declaration);
      return wants ? { type: 'double' } : { type: 'noDouble' };
    }
    case 'play': {
      const play = state.play!;
      const card = play.game.kind === 'ramsch' ? ramschBot(play, seat) : heuristicBot(play, seat);
      return { type: 'play', card };
    }
    case 'done':
      throw new Error('Rozdanie jest zakończone');
  }
}
