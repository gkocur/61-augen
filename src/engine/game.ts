import type { Suit } from './cards';

export type GameType = { kind: 'suit'; trump: Suit } | { kind: 'grand' } | { kind: 'null' };

/** 0 = przodek, 1 = środek, 2 = zadek. */
export type Seat = 0 | 1 | 2;

export function nextSeat(seat: Seat, steps = 1): Seat {
  return ((seat + steps) % 3) as Seat;
}
