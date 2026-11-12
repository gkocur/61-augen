// src/content/miniDeal.ts
import { createBot, type Bot } from '../bots';
import {
  createDeal,
  currentPlayer,
  dealResult,
  isDealOver,
  isTrump,
  playCard,
  type CardId,
  type DealState,
  type GameType,
  type Seat,
} from '../engine';
import type { CheckpointAsk, MiniDealExerciseData } from './types';

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

/** Rozgrywa rozdanie: gracz gra `line` (domyślnie `solution`), reszta — boty ćwiczenia. */
export function simulateMiniDeal(
  ex: MiniDealExerciseData,
  line: readonly CardId[] = ex.solution,
): { error: string | null; goalReached: boolean } {
  const bots = miniDealBots(ex);
  let state = startMiniDeal(ex);
  let next = 0;
  while (!isDealOver(state)) {
    const seat = currentPlayer(state);
    let card: CardId | undefined;
    if (seat === ex.you) {
      card = line[next++];
      if (card === undefined) return { error: 'za mało kart w linii gracza', goalReached: false };
    } else {
      card = bots[seat](state, seat);
    }
    try {
      state = playCard(state, card);
    } catch {
      return { error: `niedozwolone zagranie ${card} (gracz ${seat})`, goalReached: false };
    }
  }
  if (next < line.length) return { error: 'nadmiarowe karty w linii gracza', goalReached: false };
  return { error: null, goalReached: isGoalReached(ex, state) };
}

/** Poprawna odpowiedź na pytanie w trakcie gry, dla bieżącego stanu rozdania. */
export function checkpointAnswer(ex: MiniDealExerciseData, state: DealState, ask: CheckpointAsk): number {
  if (ask === 'yourPoints') return teamPoints(ex, state).yours;
  return state.tricks.flatMap((trick) => trick.cards).filter((card) => isTrump(card, state.game)).length;
}

/**
 * Trzy warianty do wyboru (rosnąco): kolejne wielokrotności kroku zawierające poprawny,
 * w granicach [0, max]. Pozycja poprawnego to `seed % 3` (0 = najniższy), przesunięta, gdy okno nie mieści się w granicach.
 */
export function checkpointOptions(correct: number, ask: CheckpointAsk, game: GameType, seed: number): [number, number, number] {
  const step = ask === 'yourPoints' ? 10 : 1;
  const max = ask === 'yourPoints' ? 120 : game.kind === 'suit' ? 11 : 4;
  let lowest = correct - (((seed % 3) + 3) % 3) * step;
  while (lowest < 0) lowest += step;
  while (lowest + 2 * step > max) lowest -= step;
  return [lowest, lowest + step, lowest + 2 * step];
}
