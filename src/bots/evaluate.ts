// src/bots/evaluate.ts
import {
  SUITS,
  cardPoints,
  cardStrength,
  isTrump,
  maxBidFor,
  rankOf,
  suitOf,
  type CardId,
  type Declaration,
  type GameType,
  type Suit,
} from '../engine';

/** Gra, którą bot chce grać, i do ilu może licytować. */
export interface GameChoice {
  game: GameType;
  limit: number;
}

const NULL_GAME: GameType = { kind: 'null' };
const GRAND: GameType = { kind: 'grand' };
const suitGame = (trump: Suit): GameType => ({ kind: 'suit', trump });

const isJack = (card: CardId) => rankOf(card) === 'J';
const isAce = (card: CardId) => rankOf(card) === 'A';
const count = (cards: readonly CardId[], test: (card: CardId) => boolean) => cards.filter(test).length;

/** Gra kolorowa: co najmniej 6 atu albo 5 atu i razem co najmniej 3 walety/asy z boku (w tym walet). */
function suitPlayable(cards: readonly CardId[], trump: Suit): boolean {
  const game = suitGame(trump);
  const trumps = count(cards, (c) => isTrump(c, game));
  const jacks = count(cards, isJack);
  const sideAces = count(cards, (c) => isAce(c) && suitOf(c) !== trump);
  return trumps >= 6 || (trumps === 5 && jacks >= 1 && jacks + sideAces >= 3);
}

/** Grand: 3+ walety i 2+ asy, albo 2 walety z waletem trefl i 3+ asy. */
function grandPlayable(cards: readonly CardId[]): boolean {
  const jacks = count(cards, isJack);
  const aces = count(cards, isAce);
  return (jacks >= 3 && aces >= 2) || (jacks === 2 && cards.includes('c-J') && aces >= 3);
}

/** Null: w każdym kolorze, który masz, jest siódemka albo ósemka, a asów i królów razem najwyżej 2. */
function nullPlayable(cards: readonly CardId[]): boolean {
  const lowInEverySuit = SUITS.every((suit) => {
    const inSuit = cards.filter((c) => suitOf(c) === suit);
    return inSuit.length === 0 || inSuit.some((c) => rankOf(c) === '7' || rankOf(c) === '8');
  });
  return lowInEverySuit && count(cards, (c) => rankOf(c) === 'A' || rankOf(c) === 'K') <= 2;
}

/** Grywalne gry w kolejności preferencji przy remisie wartości: grand, kolory (♣ ♠ ♥ ♦), null. */
export function playableGames(cards: readonly CardId[]): GameChoice[] {
  const choices: GameChoice[] = [];
  if (grandPlayable(cards)) choices.push({ game: GRAND, limit: maxBidFor(cards, GRAND) });
  for (const trump of SUITS) {
    if (suitPlayable(cards, trump)) choices.push({ game: suitGame(trump), limit: maxBidFor(cards, suitGame(trump)) });
  }
  if (nullPlayable(cards)) choices.push({ game: NULL_GAME, limit: maxBidFor(cards, NULL_GAME) });
  return choices;
}

/** Najlepsza grywalna gra (najwyższa granica licytacji) albo null, gdy ręka jest za słaba. */
export function evaluateHand(cards: readonly CardId[]): GameChoice | null {
  return playableGames(cards).reduce<GameChoice | null>((best, c) => (best === null || c.limit > best.limit ? c : best), null);
}

/**
 * Gra do zgłoszenia po licytacji (z 12 kart po podniesieniu skata albo 10 + skat przy grze z ręki).
 * Najpierw grywalne gry warte co najmniej stawkę; potem najwyżej warta grywalna; w ostateczności
 * kolor z największą liczbą atu (przegrana przez przelicytowanie jest wtedy możliwa).
 * Null tylko wtedy, gdy jego wartość nie jest niższa od stawki.
 */
export function chooseGame(cards: readonly CardId[], bid: number): GameType {
  const playable = playableGames(cards).filter((c) => c.game.kind !== 'null' || c.limit >= bid);
  const enough = playable.filter((c) => c.limit >= bid);
  const pool = enough.length > 0 ? enough : playable;
  if (pool.length > 0) return pool.reduce((best, c) => (c.limit > best.limit ? c : best)).game;
  const byTrumps = SUITS.map((trump) => ({ trump, n: count(cards, (c) => isTrump(c, suitGame(trump))) }));
  return suitGame(byTrumps.reduce((best, x) => (x.n > best.n ? x : best)).trump);
}

/** Dwie karty do wyrzucenia z 12 dla wybranej gry. */
export function chooseDiscard(cards: readonly CardId[], game: GameType): [CardId, CardId] {
  if (game.kind === 'null') {
    // Najgroźniejsze: najwyższe karty w kolorach bez siódemki.
    const risk = (c: CardId) =>
      (cards.some((x) => suitOf(x) === suitOf(c) && rankOf(x) === '7') ? 0 : 100) + cardStrength(c, game);
    const [a, b] = [...cards].sort((x, y) => risk(y) - risk(x));
    return [a, b];
  }
  const side = cards.filter((c) => !isTrump(c, game));
  const suitLength = (c: CardId) => count(side, (x) => suitOf(x) === suitOf(c));
  const hasAce = (c: CardId) => side.some((x) => suitOf(x) === suitOf(c) && isAce(x));
  // Chowamy zagrożone oczka (10 i K bez asa) i skracamy krótkie kolory; asów i atu nie wyrzucamy, jeśli się da.
  const priority = (c: CardId) => {
    if (isAce(c)) return -100 + cardPoints(c);
    return cardPoints(c) + (suitLength(c) <= 2 ? 8 : 0) + (!hasAce(c) && (rankOf(c) === '10' || rankOf(c) === 'K') ? 10 : 0);
  };
  const ordered = [
    ...[...side].sort((x, y) => priority(y) - priority(x) || cardStrength(y, game) - cardStrength(x, game)),
    ...cards.filter((c) => isTrump(c, game)).sort((x, y) => cardStrength(x, game) - cardStrength(y, game)),
  ];
  return [ordered[0], ordered[1]];
}

function trumpStats(hand: readonly CardId[], game: GameType) {
  const trumps = hand.filter((c) => isTrump(c, game));
  const high = count(trumps, (c) => isJack(c) || (game.kind === 'suit' && (isAce(c) || rankOf(c) === '10')));
  const sideAces = count(hand, (c) => isAce(c) && !isTrump(c, game));
  return { trumps: trumps.length, jacks: count(hand, isJack), high, sideAces };
}

/** Obrońca kontruje tylko przy wyraźnie mocnych kartach przeciwko zgłoszonej grze. */
export function wantsKontra(hand: readonly CardId[], declaration: Declaration): boolean {
  const { game } = declaration;
  if (game.kind === 'null' || game.kind === 'ramsch') return false;
  const s = trumpStats(hand, game);
  if (game.kind === 'grand') return s.jacks >= 2 && s.sideAces >= 3;
  return s.trumps >= 4 && s.high >= 2 && s.sideAces >= 2;
}

/** Rozgrywający odpowiada re przy bardzo mocnej ręce. */
export function wantsRe(hand: readonly CardId[], declaration: Declaration): boolean {
  const { game } = declaration;
  if (game.kind === 'null' || game.kind === 'ramsch') return false;
  const s = trumpStats(hand, game);
  if (game.kind === 'grand') return s.jacks >= 3 && s.sideAces >= 3;
  return s.trumps >= 8 || (s.trumps >= 7 && s.jacks >= 3);
}
