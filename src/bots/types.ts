// src/bots/types.ts
import type { CardId, DealState, Seat } from '../engine';

/** Wybiera dozwoloną kartę dla gracza `seat`, który jest teraz na ruchu. */
export type Bot = (state: DealState, seat: Seat) => CardId;
