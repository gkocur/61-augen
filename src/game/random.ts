// src/game/random.ts
import { ALL_CARDS, type CardId, type Hands } from '../engine';

/** Deterministyczny generator liczb z przedziału [0, 1) (mulberry32): to samo ziarno — ten sam ciąg. */
export function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DealtCards {
  /** Ręce w kolejności miejsc: 0 = ręka, 1 = środkowa ręka, 2 = ostatnia ręka. */
  hands: Hands;
  skat: CardId[];
}

/** Tasuje talię (Fisher–Yates) i rozdaje po 10 kart oraz 2 do skata. */
export function dealCards(seed: number): DealtCards {
  const random = createRandom(seed);
  const deck = [...ALL_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return { hands: [deck.slice(0, 10), deck.slice(10, 20), deck.slice(20, 30)], skat: deck.slice(30) };
}
