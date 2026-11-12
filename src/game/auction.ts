// src/game/auction.ts
import { BID_VALUES, type Seat } from '../engine';

export type AuctionAction = { type: 'bid'; value: number } | { type: 'hold' } | { type: 'pass' };

/**
 * Licytacja według ISkO (miejsca: 0 = ręka, 1 = środkowa ręka, 2 = ostatnia ręka).
 * Etap 1: środkowa ręka mówi stawki do ręki, ręka odpowiada „tak” albo „pas”.
 * Etap 2: ostatnia ręka mówi do zwycięzcy etapu 1.
 * Etap 3: gdy nikt nie powiedział stawki, ręka może zagrać za 18 albo spasować.
 */
export interface AuctionState {
  stage: 1 | 2 | 3 | 'done';
  /** Kto mówi stawki w bieżącym etapie. */
  bidder: Seat;
  /** Kto odpowiada „tak” / „pas”. */
  listener: Seat;
  turn: 'bidder' | 'listener';
  /** Najwyższa powiedziana stawka (null = jeszcze żadnej). */
  highest: number | null;
  /** Zwycięzca licytacji po jej zakończeniu; null = wszyscy spasowali. */
  winner: Seat | null;
  /** Kolejne wypowiedzi graczy. */
  log: { seat: Seat; action: AuctionAction }[];
}

export const FIRST_BID = BID_VALUES[0];

export function startAuction(): AuctionState {
  return { stage: 1, bidder: 1, listener: 0, turn: 'bidder', highest: null, winner: null, log: [] };
}

/** Kto teraz mówi (null = licytacja zakończona). */
export function auctionActor(a: AuctionState): Seat | null {
  if (a.stage === 'done') return null;
  return a.turn === 'bidder' ? a.bidder : a.listener;
}

/** Stawki, które może teraz powiedzieć mówiący. */
export function allowedBids(a: AuctionState): number[] {
  if (a.stage === 3) return [FIRST_BID];
  return BID_VALUES.filter((v) => a.highest === null || v > a.highest);
}

export function applyAuction(a: AuctionState, seat: Seat, action: AuctionAction): AuctionState {
  const actor = auctionActor(a);
  if (actor === null) throw new Error('Licytacja jest zakończona');
  if (seat !== actor) throw new Error(`Teraz mówi gracz ${actor}, a nie ${seat}`);
  const log = [...a.log, { seat, action }];

  if (a.stage === 3) {
    if (action.type === 'bid' && action.value === FIRST_BID) {
      return { ...a, stage: 'done', highest: FIRST_BID, winner: 0, log };
    }
    if (action.type === 'pass') return { ...a, stage: 'done', winner: null, log };
    throw new Error(`Ręka może tylko zagrać za ${FIRST_BID} albo spasować`);
  }

  if (a.turn === 'bidder') {
    if (action.type === 'bid') {
      if (!allowedBids(a).includes(action.value)) throw new Error(`Niedozwolona stawka: ${action.value}`);
      return { ...a, highest: action.value, turn: 'listener', log };
    }
    if (action.type === 'pass') return endDuel(a, a.listener, log);
    throw new Error('Mówiący podaje stawkę albo pasuje');
  }

  if (action.type === 'hold') return { ...a, turn: 'bidder', log };
  if (action.type === 'pass') return endDuel(a, a.bidder, log);
  throw new Error('Odpowiadający mówi „tak” albo pasuje');
}

function endDuel(a: AuctionState, survivor: Seat, log: AuctionState['log']): AuctionState {
  if (a.stage === 1) return { ...a, stage: 2, bidder: 2, listener: survivor, turn: 'bidder', log };
  if (a.highest === null) return { ...a, stage: 3, bidder: 0, listener: 0, turn: 'bidder', log };
  return { ...a, stage: 'done', winner: survivor, log };
}
