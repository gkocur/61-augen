// src/three/sceneCards.ts — gdzie leży każda karta na stole 3D (czysta logika, bez three.js)
import { nextSeat, type CardId, type CompletedTrick, type Seat } from '../engine';

export type Side = 'you' | 'left' | 'right';

export type Place =
  | { zone: 'hand'; index: number; count: number }
  | { zone: 'opp'; side: 'left' | 'right'; index: number; count: number }
  | { zone: 'trick'; side: Side; order: number }
  | { zone: 'pile'; side: Side; index: number }
  | { zone: 'skat'; index: number; faceUp: boolean };

export interface SceneCard {
  id: CardId;
  place: Place;
}

/** Strona stołu z punktu widzenia gracza: następny w kolejności siedzi po lewej. */
export function sideOf(seat: Seat, you: Seat): Side {
  if (seat === you) return 'you';
  return seat === nextSeat(you, 1) ? 'left' : 'right';
}

export interface SceneInput {
  you: Seat;
  /** Karty gracza w kolejności wyświetlania. */
  hand: readonly CardId[];
  /** Karty przeciwników (rewersem do gracza); brak = nie pokazujemy. */
  left?: readonly CardId[];
  right?: readonly CardId[];
  /** Karty leżące na środku. */
  trick?: { cards: readonly CardId[]; leader: Seat };
  /** Zebrane lewy — trafiają na stosy graczy, którzy je wzięli. */
  taken?: readonly CompletedTrick[];
  skat?: { cards: readonly CardId[]; faceUp: boolean };
}

/** Rozmieszcza karty; każda karta występuje najwyżej raz (pierwsze miejsce wygrywa). */
export function buildSceneCards(input: SceneInput): SceneCard[] {
  const { you } = input;
  const out: SceneCard[] = [];
  const seen = new Set<CardId>();
  const put = (id: CardId, place: Place) => {
    if (seen.has(id)) return;
    seen.add(id);
    out.push({ id, place });
  };

  input.trick?.cards.forEach((id, order) => put(id, { zone: 'trick', side: sideOf(nextSeat(input.trick!.leader, order), you), order }));
  input.hand.forEach((id, index) => put(id, { zone: 'hand', index, count: input.hand.length }));
  for (const side of ['left', 'right'] as const) {
    const cards = input[side];
    cards?.forEach((id, index) => put(id, { zone: 'opp', side, index, count: cards.length }));
  }
  const pileSize: Record<Side, number> = { you: 0, left: 0, right: 0 };
  for (const trick of input.taken ?? []) {
    const side = sideOf(trick.winner, you);
    for (const id of trick.cards) put(id, { zone: 'pile', side, index: pileSize[side]++ });
  }
  input.skat?.cards.forEach((id, index) => put(id, { zone: 'skat', index, faceUp: input.skat!.faceUp }));
  return out;
}
