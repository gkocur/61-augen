// src/content/miniDeal.ts
import { createBot, type Bot } from '../bots';
import {
  createDeal,
  currentPlayer,
  dealResult,
  isDealOver,
  playCard,
  type CardId,
  type DealState,
  type Seat,
} from '../engine';
import type { MiniDealExerciseData } from './types';

export function startMiniDeal(ex: MiniDealExerciseData): DealState {
  return createDeal({ game: ex.game, declarer: ex.declarer, hands: ex.hands, skat: ex.skat, leader: ex.leader ?? 0 });
}

export function miniDealBots(ex: MiniDealExerciseData): Record<Seat, Bot> {
  return { 0: createBot(ex.scripts?.[0]), 1: createBot(ex.scripts?.[1]), 2: createBot(ex.scripts?.[2]) };
}

/** Oczka strony gracza i strony przeciwnej (w trakcie i po rozdaniu). */
export function teamPoints(ex: MiniDealExerciseData, state: DealState): { yours: number; theirs: number } {
  const { declarerPoints, defenderPoints } = dealResult(state);
  return ex.you === ex.declarer
    ? { yours: declarerPoints, theirs: defenderPoints }
    : { yours: defenderPoints, theirs: declarerPoints };
}

export function isGoalReached(ex: MiniDealExerciseData, state: DealState): boolean {
  if (ex.goal.kind === 'minPoints') return teamPoints(ex, state).yours >= ex.goal.points;
  const { declarerWon } = dealResult(state);
  return ex.you === ex.declarer ? declarerWon : !declarerWon;
}

/** Rozgrywa rozdanie: gracz gra `solution`, reszta — boty ćwiczenia. */
export function simulateMiniDeal(ex: MiniDealExerciseData): { error: string | null; goalReached: boolean } {
  const bots = miniDealBots(ex);
  let state = startMiniDeal(ex);
  let next = 0;
  while (!isDealOver(state)) {
    const seat = currentPlayer(state);
    let card: CardId | undefined;
    if (seat === ex.you) {
      card = ex.solution[next++];
      if (card === undefined) return { error: 'za mało kart w rozwiązaniu', goalReached: false };
    } else {
      card = bots[seat](state, seat);
    }
    try {
      state = playCard(state, card);
    } catch {
      return { error: `niedozwolone zagranie ${card} (gracz ${seat})`, goalReached: false };
    }
  }
  return { error: null, goalReached: isGoalReached(ex, state) };
}
