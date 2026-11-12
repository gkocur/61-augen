// src/game/deal.ts
import {
  SUITS,
  createDeal,
  currentPlayer,
  dealResult,
  declarationIssue,
  isDealOver,
  nullValue,
  playCard,
  ramschTally,
  scoreRamsch,
  settle,
  type Announcement,
  type CardId,
  type DealState,
  type Declaration,
  type Doubling,
  type GameType,
  type Hands,
  type PlayOutcome,
  type RamschResult,
  type Seat,
  type Settlement,
  type Triple,
} from '../engine';
import { applyAuction, auctionActor, startAuction, type AuctionState } from './auction';
import { dealCards, type DealtCards } from './random';

/** Opcje spoza ISkO, ustalane dla całej serii. */
export interface GameOptions {
  kontra: boolean;
  ramsch: boolean;
}

export type GamePhase = 'bidding' | 'skat' | 'discard' | 'declare' | 'kontra' | 'play' | 'done';

export type GameAction =
  | { type: 'bid'; value: number }
  | { type: 'hold' }
  | { type: 'pass' }
  | { type: 'takeSkat' }
  | { type: 'playHand' }
  | { type: 'discard'; cards: [CardId, CardId] }
  | { type: 'declare'; game: GameType; announce: Announcement }
  | { type: 'double' }
  | { type: 'noDouble' }
  | { type: 'play'; card: CardId };

export type GameResult =
  | {
      kind: 'game';
      declarer: Seat;
      declaration: Declaration;
      bid: number;
      doubling: Doubling | null;
      outcome: PlayOutcome;
      settlement: Settlement;
    }
  | { kind: 'ramsch'; points: Triple; tricks: Triple; result: RamschResult }
  | { kind: 'passedOut' };

/** Stan jednego rozdania. Miejsca: 0 = ręka (wychodzi do pierwszej lewy), 1 = środkowa, 2 = ostatnia (rozdaje). */
export interface GameDeal {
  seed: number;
  options: GameOptions;
  phase: GamePhase;
  /** Ręce poza rozgrywką; rozgrywający ma tu 12 kart między podniesieniem skata a wyrzuceniem. */
  hands: Hands;
  skat: CardId[];
  auction: AuctionState;
  declarer: Seat | null;
  bid: number | null;
  /** Gra z ręki (bez podnoszenia skata). */
  hand: boolean;
  declaration: Declaration | null;
  doubling: Doubling | null;
  /** Kogo jeszcze zapytać o kontrę / re (pierwszy — teraz). */
  doublingAsk: Seat[];
  /** Rozgrywka (od fazy `play`); w ramszu `game.kind === 'ramsch'`. */
  play: DealState | null;
  result: GameResult | null;
  /** Wszystkie wykonane ruchy — do zapisu i odtworzenia rozdania. */
  history: { seat: Seat; action: GameAction }[];
}

/** Nowe rozdanie; karty losowane z ziarna (`cards` — tylko do testów). */
export function startGameDeal(seed: number, options: GameOptions, cards: DealtCards = dealCards(seed)): GameDeal {
  const { hands, skat } = cards;
  return {
    seed,
    options,
    phase: 'bidding',
    hands,
    skat,
    auction: startAuction(),
    declarer: null,
    bid: null,
    hand: false,
    declaration: null,
    doubling: null,
    doublingAsk: [],
    play: null,
    result: null,
    history: [],
  };
}

/** Kto teraz wykonuje ruch (null = rozdanie zakończone). */
export function gameActor(state: GameDeal): Seat | null {
  switch (state.phase) {
    case 'bidding':
      return auctionActor(state.auction);
    case 'skat':
    case 'discard':
    case 'declare':
      return state.declarer;
    case 'kontra':
      return state.doublingAsk[0] ?? null;
    case 'play':
      return currentPlayer(state.play!);
    case 'done':
      return null;
  }
}

/** Obrońcy w kolejności miejsc. */
export function defenders(declarer: Seat): Seat[] {
  return ([0, 1, 2] as Seat[]).filter((s) => s !== declarer);
}

export function applyGameAction(state: GameDeal, seat: Seat, action: GameAction): GameDeal {
  const actor = gameActor(state);
  if (actor === null) throw new Error('Rozdanie jest zakończone');
  if (seat !== actor) throw new Error(`Teraz ruch gracza ${actor}, a nie ${seat}`);
  const next = step(state, seat, action);
  return { ...next, history: [...state.history, { seat, action }] };
}

/** Odtwarza rozdanie z ziarna i listy ruchów (do wczytania zapisu i cofania). */
export function replayGameDeal(seed: number, options: GameOptions, history: GameDeal['history']): GameDeal {
  return history.reduce((s, { seat, action }) => applyGameAction(s, seat, action), startGameDeal(seed, options));
}

function wrongAction(phase: GamePhase, action: GameAction): never {
  throw new Error(`Ruch „${action.type}” jest niedozwolony w fazie „${phase}”`);
}

function step(state: GameDeal, seat: Seat, action: GameAction): GameDeal {
  switch (state.phase) {
    case 'bidding': {
      if (action.type !== 'bid' && action.type !== 'hold' && action.type !== 'pass') wrongAction(state.phase, action);
      const auction = applyAuction(state.auction, seat, action);
      if (auction.stage !== 'done') return { ...state, auction };
      if (auction.winner !== null) {
        return { ...state, auction, phase: 'skat', declarer: auction.winner, bid: auction.highest };
      }
      if (state.options.ramsch) {
        const play = createDeal({ game: { kind: 'ramsch' }, declarer: 0, hands: state.hands, skat: state.skat });
        return { ...state, auction, phase: 'play', play };
      }
      return { ...state, auction, phase: 'done', result: { kind: 'passedOut' } };
    }
    case 'skat': {
      if (action.type === 'takeSkat') {
        const hands = withHand(state.hands, seat, [...state.hands[seat], ...state.skat]);
        return { ...state, hands, skat: [], phase: 'discard' };
      }
      if (action.type === 'playHand') return { ...state, hand: true, phase: 'declare' };
      return wrongAction(state.phase, action);
    }
    case 'discard': {
      if (action.type !== 'discard') wrongAction(state.phase, action);
      const [a, b] = action.cards;
      const hand = state.hands[seat];
      if (a === b || !hand.includes(a) || !hand.includes(b)) throw new Error('Wyrzuć 2 różne karty z ręki');
      const hands = withHand(state.hands, seat, hand.filter((c) => c !== a && c !== b));
      return { ...state, hands, skat: [a, b], phase: 'declare' };
    }
    case 'declare': {
      if (action.type !== 'declare') wrongAction(state.phase, action);
      if ((action.game as { kind?: unknown } | null)?.kind === 'ramsch') throw new Error('Ramsza się nie zgłasza');
      if (!isDeclarable(action.game) || !ANNOUNCEMENTS.includes(action.announce)) throw new Error('Nieprawidłowe zgłoszenie');
      const declaration: Declaration = { game: action.game, hand: state.hand, announce: action.announce };
      const issue = declarationIssue(declaration);
      if (issue) throw new Error(issue);
      if (action.game.kind === 'null' && nullValue(declaration) < state.bid!) {
        throw new Error(`Nulla (${nullValue(declaration)}) nie można zgłosić po stawce ${state.bid} (ISkO 3.6)`);
      }
      const declared = { ...state, declaration };
      if (state.options.kontra) return { ...declared, phase: 'kontra', doublingAsk: defenders(seat) };
      return startPlay(declared);
    }
    case 'kontra': {
      if (action.type === 'double') {
        if (state.doubling === null) return { ...state, doubling: 'kontra', doublingAsk: [state.declarer!] };
        return startPlay({ ...state, doubling: 're', doublingAsk: [] });
      }
      if (action.type === 'noDouble') {
        const doublingAsk = state.doublingAsk.slice(1);
        return doublingAsk.length > 0 ? { ...state, doublingAsk } : startPlay({ ...state, doublingAsk });
      }
      return wrongAction(state.phase, action);
    }
    case 'play': {
      if (action.type !== 'play') wrongAction(state.phase, action);
      const play = playCard(state.play!, action.card);
      return isDealOver(play) ? finish({ ...state, play }) : { ...state, play };
    }
    case 'done':
      throw new Error('Rozdanie jest zakończone');
  }
}

const ANNOUNCEMENTS: readonly Announcement[] = ['none', 'schneider', 'schwarz', 'ouvert'];

/** Gra, którą można zgłosić: grand, null albo kolor z poprawnym atutem (ramsza się nie zgłasza). */
function isDeclarable(game: unknown): game is GameType {
  if (typeof game !== 'object' || game === null) return false;
  const g = game as { kind?: unknown; trump?: unknown };
  if (g.kind === 'grand' || g.kind === 'null') return true;
  return g.kind === 'suit' && typeof g.trump === 'string' && (SUITS as readonly string[]).includes(g.trump);
}

function withHand(hands: Hands, seat: Seat, cards: CardId[]): Hands {
  return hands.map((h, i) => (i === seat ? cards : h)) as Hands;
}

function startPlay(state: GameDeal): GameDeal {
  const play = createDeal({ game: state.declaration!.game, declarer: state.declarer!, hands: state.hands, skat: state.skat });
  return { ...state, phase: 'play', play };
}

function finish(state: GameDeal): GameDeal {
  const play = state.play!;
  if (play.game.kind === 'ramsch') {
    const { points, tricks } = ramschTally(play);
    return { ...state, phase: 'done', result: { kind: 'ramsch', points, tricks, result: scoreRamsch({ points, tricks }) } };
  }
  const declarer = state.declarer!;
  const r = dealResult(play);
  const outcome: PlayOutcome = { declarerPoints: r.declarerPoints, declarerTricks: r.declarerTricks };
  const settlement = settle({
    declaration: state.declaration!,
    declarerCards: [...state.hands[declarer], ...state.skat],
    outcome,
    bid: state.bid!,
    doubling: state.doubling ?? undefined,
  });
  return {
    ...state,
    phase: 'done',
    result: { kind: 'game', declarer, declaration: state.declaration!, bid: state.bid!, doubling: state.doubling, outcome, settlement },
  };
}
