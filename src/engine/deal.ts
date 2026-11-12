// src/engine/deal.ts
import { sumPoints, type CardId } from './cards';
import { nextSeat, type GameType, type Seat } from './game';
import { trickWinner } from './order';
import { isLegalMove } from './rules';

export type Hands = [CardId[], CardId[], CardId[]];

export interface CompletedTrick {
  leader: Seat;
  cards: CardId[];
  winner: Seat;
}

export interface DealState {
  game: GameType;
  declarer: Seat;
  hands: Hands;
  skat: CardId[];
  /** Kto wychodzi do bieżącej lewy. */
  leader: Seat;
  /** Karty bieżącej (niepełnej) lewy. */
  trick: CardId[];
  tricks: CompletedTrick[];
}

export interface DealSetup {
  game: GameType;
  declarer: Seat;
  hands: Hands;
  skat?: CardId[];
  leader?: Seat;
}

export function createDeal(setup: DealSetup): DealState {
  return {
    game: setup.game,
    declarer: setup.declarer,
    hands: [[...setup.hands[0]], [...setup.hands[1]], [...setup.hands[2]]],
    skat: [...(setup.skat ?? [])],
    leader: setup.leader ?? 0,
    trick: [],
    tricks: [],
  };
}

export function currentPlayer(state: DealState): Seat {
  return nextSeat(state.leader, state.trick.length);
}

/** Rozgrywający gra sam; obrońcy tworzą drużynę. */
export function sameTeam(a: Seat, b: Seat, declarer: Seat): boolean {
  return a === b || (a !== declarer && b !== declarer);
}

export function isDealOver(state: DealState): boolean {
  if (state.trick.length === 0 && state.hands.every((hand) => hand.length === 0)) return true;
  return state.game.kind === 'null' && state.tricks.some((t) => t.winner === state.declarer);
}

export function playCard(state: DealState, card: CardId): DealState {
  if (isDealOver(state)) throw new Error('Rozdanie jest zakończone');
  const seat = currentPlayer(state);
  if (!isLegalMove(card, state.hands[seat], state.trick, state.game)) {
    throw new Error(`Niedozwolone zagranie: ${card}`);
  }
  const hands = state.hands.map((hand, i) => (i === seat ? hand.filter((c) => c !== card) : hand)) as Hands;
  const trick = [...state.trick, card];
  if (trick.length < 3) return { ...state, hands, trick };
  const winner = nextSeat(state.leader, trickWinner(trick, state.game));
  return {
    ...state,
    hands,
    trick: [],
    leader: winner,
    tricks: [...state.tricks, { leader: state.leader, cards: trick, winner }],
  };
}

export interface DealResult {
  declarerPoints: number;
  defenderPoints: number;
  declarerTricks: number;
  declarerWon: boolean;
}

/** Wynik (także w trakcie): oczka z wziętych lew; skat liczy się rozgrywającemu poza nullem. */
export function dealResult(state: DealState): DealResult {
  const declarerTricks = state.tricks.filter((t) => t.winner === state.declarer);
  const defenderTricks = state.tricks.filter((t) => t.winner !== state.declarer);
  const skatPoints = state.game.kind === 'null' ? 0 : sumPoints(state.skat);
  const declarerPoints = sumPoints(declarerTricks.flatMap((t) => t.cards)) + skatPoints;
  const defenderPoints = sumPoints(defenderTricks.flatMap((t) => t.cards));
  const declarerWon = state.game.kind === 'null' ? declarerTricks.length === 0 : declarerPoints >= 61;
  return { declarerPoints, defenderPoints, declarerTricks: declarerTricks.length, declarerWon };
}
