# Trener skata — Plan 7: silnik gry z botami i boty

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Cel:** czysty silnik trybu „gra z botami”. Bez interfejsu: licytacja (ISkO), skat, zgłoszenie, kontra/re, rozgrywka, ramsz, wynik, seria z tabelą Seegera-Fabiana i zapis w przeglądarce. Do tego boty, które licytują, wybierają grę, wyrzucają do skata, kontrują i grają w ramsza. Spec: `docs/superpowers/specs/2026-11-12-gra-z-botami-design.md` (sekcje 3, 4 i 6). Ekrany to Plan 8, a pomoce treningowe Plan 9.

**Architektura:**
- **`src/game/`:** nowy moduł w czystym TypeScripcie (bez Reacta). Stan rozdania `GameDeal` ma fazę `bidding → skat → discard → declare → kontra → play → done`. Każdy ruch to `applyGameAction(stan, miejsce, akcja)`, a funkcja odrzuca ruch nie w kolejce albo niedozwolony w danej fazie.
- **Losowanie:** karty losowane są z ziarna (mulberry32). Dzięki temu rozdanie = ziarno + lista ruchów (`history`): `replayGameDeal` odtwarza je przy wczytaniu zapisu, a w Planie 9 posłuży do cofania.
- **Silnik pod spodem:** istniejące `createDeal`/`playCard`, `settle` (przelicytowanie, kontra/re), `BID_VALUES` i `scoreRamsch`. Silnik dostaje `ramschTally`.
- **Boty:** `src/bots/evaluate.ts` (ocena ręki, wybór gry, wyrzucanie, kontra/re) i `src/bots/ramsch.ts` (gra w ramsza). `src/game/botPlayer.ts` łączy je w `botAction(stan, miejsce)` dla każdej fazy. Ta sama funkcja posłuży w Planie 9 jako podpowiedź.
- **Kierunek zależności:** `game` → `bots` → `engine`. `bots` nie zależy od `game`.

**Stos:** TypeScript 5 (strict), Vitest 3.

**Konwencje:**
- **Miejsca w rozdaniu:** 0 = ręka (wychodzi do pierwszej lewy), 1 = środkowa ręka, 2 = ostatnia ręka (rozdaje), jak w silniku (`Seat`).
- **Gracze w serii:** `PlayerId` 0 = ty, 1 = bot po lewej, 2 = bot po prawej. W 1. rozdaniu rozdaje bot po prawej, więc zaczynasz na ręku.
- **Komunikaty błędów** są po polsku, jak w silniku.
- **Commit:** każdy kończy się linią `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

**Zweryfikowane przy pisaniu planu:**
- **Kod planu:** uruchomiony na kopii repozytorium. 282 testy przechodzą (225 dotychczasowych i 57 nowych), `tsc` jest czysty.
- **Symulacja 1000 rozdań bot przeciw botowi:** 85% gier (64% kolorowe, 16% grandy, 5% nulle) i 15% ramszów. Rozgrywający wygrywa w 58%. Przelicytowanie zdarzyło się 6 razy, kontra 16 razy.

---

## Struktura plików (Plan 7)

```
src/engine/ramsch.ts          ZMIANA: ramschTally (oczka i lewy graczy, skat dla biorącego ostatnią lewę)
src/game/random.ts            NOWY: createRandom (mulberry32), dealCards(ziarno)
src/game/auction.ts           NOWY: licytacja ISkO (etapy 1–3)
src/game/deal.ts              NOWY: GameDeal, applyGameAction, gameActor, replayGameDeal, wynik
src/bots/evaluate.ts          NOWY: playableGames, evaluateHand, chooseGame, chooseDiscard, wantsKontra, wantsRe
src/bots/ramsch.ts            NOWY: ramschBot
src/bots/index.ts             ZMIANA: eksport evaluate i ramsch
src/game/botPlayer.ts         NOWY: botAction, biddingLimit
src/game/series.ts            NOWY: seria, miejsca graczy, punkty Seegera-Fabiana
src/game/storage.ts           NOWY: zapis/odczyt serii (klucz skat-trener:v1:gra)
src/game/index.ts             NOWY: eksport modułu
```

---

### Task 1: Losowanie z ziarna i liczenie ramsza

**Pliki:**
- Utwórz: `src/game/random.ts`, `src/game/random.test.ts`
- Modyfikuj: `src/engine/ramsch.ts`, `src/engine/ramsch.test.ts`

- [ ] **Step 1: Testy**

Utwórz `src/game/random.test.ts`:

```ts
// src/game/random.test.ts
import { describe, expect, it } from 'vitest';
import { ALL_CARDS } from '../engine';
import { createRandom, dealCards } from './random';

describe('losowanie', () => {
  it('to samo ziarno daje ten sam ciąg, inne — inny', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    const c = createRandom(43);
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
    expect(seqA.every((x) => x >= 0 && x < 1)).toBe(true);
  });

  it('rozdanie: 3 × 10 kart i 2 w skacie, cała talia bez powtórzeń', () => {
    const { hands, skat } = dealCards(7);
    expect(hands.map((h) => h.length)).toEqual([10, 10, 10]);
    expect(skat).toHaveLength(2);
    expect(new Set([...hands.flat(), ...skat])).toEqual(new Set(ALL_CARDS));
  });

  it('rozdanie jest powtarzalne', () => {
    expect(dealCards(123)).toEqual(dealCards(123));
    expect(dealCards(123)).not.toEqual(dealCards(124));
  });
});
```

W `src/engine/ramsch.test.ts` zamień import na:

```ts
import { createDeal, playCard } from './deal';
import type { GameType } from './game';
import { ramschTally, scoreRamsch } from './ramsch';
```

i dopisz na końcu pliku:

```ts
describe('ramschTally', () => {
  it('liczy oczka i lewy każdego gracza, skat dla biorącego ostatnią lewę', () => {
    const ramsch: GameType = { kind: 'ramsch' };
    let state = createDeal({
      game: ramsch,
      declarer: 0,
      hands: [['c-A', 'h-7'], ['c-10', 'h-A'], ['c-7', 'h-K']],
      skat: ['s-A', 's-10'],
    });
    for (const card of ['c-A', 'c-10', 'c-7', 'h-7', 'h-A', 'h-K'] as const) state = playCard(state, card);
    // Lewa 1: c-A bierze (gracz 0) — 21 oczek. Lewa 2: gracz 0 wychodzi h-7, h-A bierze (gracz 1) — 15 oczek + skat 21.
    expect(ramschTally(state)).toEqual({ points: [21, 36, 0], tricks: [1, 1, 0] });
  });
});
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/game src/engine/ramsch.test.ts`
Expected: FAIL (brak `./random` i `ramschTally`).

- [ ] **Step 3: Implementacja**

Utwórz `src/game/random.ts`:

```ts
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
```

W `src/engine/ramsch.ts` dodaj importy i funkcję na końcu pliku (diff):

```diff
@@ -1,4 +1,6 @@
 // src/engine/ramsch.ts
+import { sumPoints } from './cards';
+import type { DealState } from './deal';
 import type { Seat } from './game';
 
 export type Triple = [number, number, number];
@@ -48,3 +50,16 @@ export function scoreRamsch({ points, tricks, pushes = 0 }: RamschInput): Ramsch
   for (const s of losers) scores[s] = -points[s] * factor;
   return { losers, jungfrau, durchmarsch: null, scores };
 }
+
+/** Oczka i lewy graczy po rozegraniu ramsza; skat dostaje gracz, który wziął ostatnią lewę. */
+export function ramschTally(state: DealState): { points: Triple; tricks: Triple } {
+  const points: Triple = [0, 0, 0];
+  const tricks: Triple = [0, 0, 0];
+  for (const trick of state.tricks) {
+    points[trick.winner] += sumPoints(trick.cards);
+    tricks[trick.winner] += 1;
+  }
+  const last = state.tricks[state.tricks.length - 1];
+  if (last) points[last.winner] += sumPoints(state.skat);
+  return { points, tricks };
+}
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/game src/engine/ramsch.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/random.ts src/game/random.test.ts src/engine/ramsch.ts src/engine/ramsch.test.ts
git commit -m "feat(game): losowanie rozdania z ziarna; ramschTally w silniku

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Licytacja (ISkO)

**Pliki:**
- Utwórz: `src/game/auction.ts`, `src/game/auction.test.ts`

- [ ] **Step 1: Testy**

Utwórz `src/game/auction.test.ts`:

```ts
// src/game/auction.test.ts
import { describe, expect, it } from 'vitest';
import type { Seat } from '../engine';
import { allowedBids, applyAuction, auctionActor, startAuction, type AuctionAction, type AuctionState } from './auction';

const run = (steps: [Seat, AuctionAction][]): AuctionState =>
  steps.reduce((a, [seat, action]) => applyAuction(a, seat, action), startAuction());
const bid = (value: number): AuctionAction => ({ type: 'bid', value });
const hold: AuctionAction = { type: 'hold' };
const pass: AuctionAction = { type: 'pass' };

describe('licytacja (ISkO)', () => {
  it('zaczyna środkowa ręka, mówiąc do ręki', () => {
    const a = startAuction();
    expect(auctionActor(a)).toBe(1);
    expect(allowedBids(a)[0]).toBe(18);
  });

  it('środkowa mówi, ręka trzyma, środkowa pasuje; ostatnia przebija i wygrywa', () => {
    const a = run([
      [1, bid(18)], [0, hold], [1, bid(20)], [0, hold], [1, pass],
      [2, bid(22)], [0, pass],
    ]);
    expect(a).toMatchObject({ stage: 'done', winner: 2, highest: 22 });
    expect(auctionActor(a)).toBeNull();
  });

  it('ręka pasuje na 18; ostatnia ręka nie licytuje — wygrywa środkowa za 18', () => {
    const a = run([[1, bid(18)], [0, pass], [2, pass]]);
    expect(a).toMatchObject({ stage: 'done', winner: 1, highest: 18 });
  });

  it('w etapie 2 ostatnia ręka mówi do zwycięzcy etapu 1', () => {
    const a = run([[1, bid(18)], [0, pass]]);
    expect(a).toMatchObject({ stage: 2, bidder: 2, listener: 1 });
    expect(auctionActor(a)).toBe(2);
    expect(allowedBids(a)[0]).toBe(20);
  });

  it('nikt nic nie mówi: ręka może zagrać za 18', () => {
    const a = run([[1, pass], [2, pass]]);
    expect(a.stage).toBe(3);
    expect(auctionActor(a)).toBe(0);
    expect(allowedBids(a)).toEqual([18]);
    expect(applyAuction(a, 0, bid(18))).toMatchObject({ stage: 'done', winner: 0, highest: 18 });
    expect(applyAuction(a, 0, pass)).toMatchObject({ stage: 'done', winner: null, highest: null });
  });

  it('ostatnia ręka mówi do ręki, gdy środkowa od razu pasuje', () => {
    const a = run([[1, pass], [2, bid(18)], [0, hold], [2, pass]]);
    expect(a).toMatchObject({ stage: 'done', winner: 0, highest: 18 });
  });

  it('odrzuca ruchy nie w swojej kolejce i złe stawki', () => {
    const a = startAuction();
    expect(() => applyAuction(a, 0, bid(18))).toThrow('Teraz mówi gracz 1');
    expect(() => applyAuction(a, 1, bid(19))).toThrow('Niedozwolona stawka: 19');
    expect(() => applyAuction(a, 1, hold)).toThrow('Mówiący podaje stawkę albo pasuje');
    const afterBid = applyAuction(a, 1, bid(20));
    expect(() => applyAuction(afterBid, 0, bid(22))).toThrow('Odpowiadający mówi „tak” albo pasuje');
    const higher = applyAuction(applyAuction(afterBid, 0, hold), 1, bid(23));
    expect(higher.highest).toBe(23);
    expect(() => applyAuction(applyAuction(higher, 0, hold), 1, bid(23))).toThrow('Niedozwolona stawka: 23');
    expect(() => applyAuction(run([[1, pass], [2, pass]]), 0, bid(20))).toThrow('Ręka może tylko zagrać za 18');
    expect(() => applyAuction(run([[1, pass], [2, pass], [0, pass]]), 0, pass)).toThrow('Licytacja jest zakończona');
  });

  it('zapisuje przebieg wypowiedzi', () => {
    const a = run([[1, bid(18)], [0, hold], [1, pass]]);
    expect(a.log.map((e) => [e.seat, e.action.type])).toEqual([[1, 'bid'], [0, 'hold'], [1, 'pass']]);
  });
});
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/game/auction.test.ts`
Expected: FAIL (brak `./auction`).

- [ ] **Step 3: Implementacja**

Utwórz `src/game/auction.ts`:

```ts
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
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/game/auction.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/auction.ts src/game/auction.test.ts
git commit -m "feat(game): licytacja według ISkO

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Automat rozdania: skat, zgłoszenie, kontra/re, rozgrywka, ramsz, wynik

**Pliki:**
- Utwórz: `src/game/deal.ts`, `src/game/deal.test.ts`

Testy używają istniejącego `heuristicBot` do dograwania lew. Rozdanie testowe ma ustalone karty, przekazane trzecim parametrem `startGameDeal`.

- [ ] **Step 1: Testy**

Utwórz `src/game/deal.test.ts`:

```ts
// src/game/deal.test.ts
import { describe, expect, it } from 'vitest';
import { legalMoves, sumPoints, type CardId, type Seat } from '../engine';
import { heuristicBot } from '../bots';
import { applyGameAction, gameActor, replayGameDeal, startGameDeal, type GameAction, type GameDeal, type GameOptions } from './deal';
import type { DealtCards } from './random';

const CARDS: DealtCards = {
  hands: [
    ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 's-A', 'd-A'],
    ['h-J', 'd-J', 'c-10', 'c-K', 'c-Q', 'c-9', 's-10', 's-K', 'd-10', 'd-K'],
    ['h-8', 'h-7', 'c-8', 'c-7', 's-Q', 's-9', 's-8', 's-7', 'd-Q', 'd-9'],
  ],
  skat: ['d-8', 'd-7'],
};
const BOTH: GameOptions = { kontra: true, ramsch: true };
const HEARTS = { kind: 'suit', trump: 'h' } as const;

const act = (state: GameDeal, steps: [Seat, GameAction][]) => steps.reduce((s, [seat, a]) => applyGameAction(s, seat, a), state);
const pass: GameAction = { type: 'pass' };
const noDouble: GameAction = { type: 'noDouble' };
/** Ręka wygrywa licytację za 18 (pozostali pasują). */
const forehandWins = (options = BOTH) => act(startGameDeal(1, options, CARDS), [[1, pass], [2, pass], [0, { type: 'bid', value: 18 }]]);
const declaredHearts = (options = BOTH) =>
  act(forehandWins(options), [
    [0, { type: 'takeSkat' }],
    [0, { type: 'discard', cards: ['d-8', 'd-7'] }],
    [0, { type: 'declare', game: HEARTS, announce: 'none' }],
  ]);
/** Rozgrywa do końca: w grze — boty z heurystyką, w ramszu — pierwsza dozwolona karta. */
function playOut(state: GameDeal): GameDeal {
  let s = state;
  while (s.phase === 'play') {
    const seat = gameActor(s)!;
    const card = s.play!.game.kind === 'ramsch' ? legalMoves(s.play!.hands[seat], s.play!.trick, s.play!.game)[0] : heuristicBot(s.play!, seat);
    s = applyGameAction(s, seat, { type: 'play', card });
  }
  return s;
}

describe('rozdanie: licytacja i skat', () => {
  it('start: licytacja, mówi środkowa ręka', () => {
    const s = startGameDeal(1, BOTH, CARDS);
    expect(s.phase).toBe('bidding');
    expect(gameActor(s)).toBe(1);
  });

  it('zwycięzca licytacji zostaje rozgrywającym ze stawką', () => {
    const s = forehandWins();
    expect(s).toMatchObject({ phase: 'skat', declarer: 0, bid: 18 });
    expect(gameActor(s)).toBe(0);
  });

  it('podniesienie skata: 12 kart, potem wyrzucenie 2', () => {
    const taken = applyGameAction(forehandWins(), 0, { type: 'takeSkat' });
    expect(taken.phase).toBe('discard');
    expect(taken.hands[0]).toHaveLength(12);
    expect(taken.skat).toEqual([]);
    const discarded = applyGameAction(taken, 0, { type: 'discard', cards: ['d-A', 'd-8'] });
    expect(discarded.phase).toBe('declare');
    expect(discarded.hands[0]).toHaveLength(10);
    expect(discarded.skat).toEqual(['d-A', 'd-8']);
    expect(() => applyGameAction(taken, 0, { type: 'discard', cards: ['d-8', 'd-8'] })).toThrow('Wyrzuć 2 różne karty z ręki');
    expect(() => applyGameAction(taken, 0, { type: 'discard', cards: ['d-8', 'h-J'] })).toThrow('Wyrzuć 2 różne karty z ręki');
  });

  it('gra z ręki: skat zostaje, zapowiedzi dozwolone', () => {
    const hand = applyGameAction(forehandWins(), 0, { type: 'playHand' });
    expect(hand).toMatchObject({ phase: 'declare', hand: true, skat: ['d-8', 'd-7'] });
    const declared = applyGameAction(hand, 0, { type: 'declare', game: HEARTS, announce: 'schneider' });
    expect(declared.declaration).toEqual({ game: HEARTS, hand: true, announce: 'schneider' });
  });

  it('bez gry z ręki nie ma zapowiedzi', () => {
    const s = act(forehandWins(), [[0, { type: 'takeSkat' }], [0, { type: 'discard', cards: ['d-8', 'd-7'] }]]);
    expect(() => applyGameAction(s, 0, { type: 'declare', game: HEARTS, announce: 'schneider' })).toThrow(
      'Zapowiedzi są możliwe tylko w grze z ręki',
    );
  });

  it('null poniżej stawki jest niedozwolony (ISkO 3.6), null z ręki — tak', () => {
    const won24 = act(startGameDeal(1, BOTH, CARDS), [
      [1, { type: 'bid', value: 24 }], [0, { type: 'hold' }], [1, pass], [2, pass],
    ]);
    expect(won24).toMatchObject({ declarer: 0, bid: 24 });
    const afterSkat = act(won24, [[0, { type: 'takeSkat' }], [0, { type: 'discard', cards: ['d-8', 'd-7'] }]]);
    expect(() => applyGameAction(afterSkat, 0, { type: 'declare', game: { kind: 'null' }, announce: 'none' })).toThrow(
      'Nulla (23) nie można zgłosić po stawce 24 (ISkO 3.6)',
    );
    const hand = applyGameAction(won24, 0, { type: 'playHand' });
    expect(applyGameAction(hand, 0, { type: 'declare', game: { kind: 'null' }, announce: 'none' }).declaration?.game).toEqual({ kind: 'null' });
  });

  it('ramsza nie da się zgłosić', () => {
    const s = act(forehandWins(), [[0, { type: 'takeSkat' }], [0, { type: 'discard', cards: ['d-8', 'd-7'] }]]);
    expect(() => applyGameAction(s, 0, { type: 'declare', game: { kind: 'ramsch' }, announce: 'none' })).toThrow('Ramsza się nie zgłasza');
  });
});

describe('rozdanie: kontra i re', () => {
  it('obrońcy pytani po kolei; bez kontry — rozgrywka', () => {
    const s = declaredHearts();
    expect(s.phase).toBe('kontra');
    expect(gameActor(s)).toBe(1);
    const after = act(s, [[1, noDouble], [2, noDouble]]);
    expect(after).toMatchObject({ phase: 'play', doubling: null });
    expect(gameActor(after)).toBe(0);
  });

  it('kontra, potem re rozgrywającego', () => {
    const kontra = act(declaredHearts(), [[1, noDouble], [2, { type: 'double' }]]);
    expect(kontra).toMatchObject({ phase: 'kontra', doubling: 'kontra' });
    expect(gameActor(kontra)).toBe(0);
    expect(applyGameAction(kontra, 0, { type: 'double' })).toMatchObject({ phase: 'play', doubling: 're' });
    expect(applyGameAction(kontra, 0, noDouble)).toMatchObject({ phase: 'play', doubling: 'kontra' });
  });

  it('bez opcji kontry: od razu rozgrywka', () => {
    expect(declaredHearts({ kontra: false, ramsch: true }).phase).toBe('play');
  });
});

describe('rozdanie: rozgrywka i wynik', () => {
  it('pełne rozdanie kończy się rozliczeniem gry', () => {
    const done = playOut(act(declaredHearts(), [[1, noDouble], [2, { type: 'double' }], [0, noDouble]]));
    expect(done.phase).toBe('done');
    expect(gameActor(done)).toBeNull();
    const result = done.result!;
    if (result.kind !== 'game') throw new Error('oczekiwano gry');
    expect(result).toMatchObject({ declarer: 0, bid: 18, doubling: 'kontra' });
    // Kier z 2 (c-J, s-J): mnożnik 3, plus poziomy za krawca i czarnego; kontra ×2.
    const { schneider, schwarz } = result.settlement;
    expect(result.settlement.value).toBe(10 * (3 + (schneider ? 1 : 0) + (schwarz ? 1 : 0)) * 2);
    expect(result.outcome.declarerPoints).toBe(
      sumPoints(done.play!.tricks.filter((t) => t.winner === 0).flatMap((t) => t.cards)) + sumPoints(['d-8', 'd-7']),
    );
  });

  it('wszyscy pasują: bez ramsza rozdanie przepada', () => {
    const s = act(startGameDeal(1, { kontra: true, ramsch: false }, CARDS), [[1, pass], [2, pass], [0, pass]]);
    expect(s).toMatchObject({ phase: 'done', result: { kind: 'passedOut' } });
  });

  it('wszyscy pasują: z ramszem — ramsz do końca i rozliczenie', () => {
    const s = act(startGameDeal(1, BOTH, CARDS), [[1, pass], [2, pass], [0, pass]]);
    expect(s.phase).toBe('play');
    expect(s.play!.game).toEqual({ kind: 'ramsch' });
    expect(gameActor(s)).toBe(0);
    const done = playOut(s);
    const result = done.result!;
    if (result.kind !== 'ramsch') throw new Error('oczekiwano ramsza');
    expect(result.points.reduce((a, b) => a + b, 0)).toBe(120);
    expect(result.tricks.reduce((a, b) => a + b, 0)).toBe(10);
  });

  it('odrzuca ruch nie w kolejce i ruch nie w tej fazie', () => {
    expect(() => applyGameAction(startGameDeal(1, BOTH, CARDS), 0, pass)).toThrow('Teraz ruch gracza 1, a nie 0');
    expect(() => applyGameAction(forehandWins(), 0, { type: 'play', card: 'h-A' as CardId })).toThrow(
      'Ruch „play” jest niedozwolony w fazie „skat”',
    );
    const done = act(startGameDeal(1, { kontra: true, ramsch: false }, CARDS), [[1, pass], [2, pass], [0, pass]]);
    expect(() => applyGameAction(done, 0, pass)).toThrow('Rozdanie jest zakończone');
  });

  it('odtworzenie z ziarna i historii daje ten sam stan', () => {
    const s = act(startGameDeal(99, BOTH), [[1, pass], [2, pass], [0, pass]]);
    expect(replayGameDeal(99, BOTH, s.history)).toEqual(s);
    expect(s.history).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/game/deal.test.ts`
Expected: FAIL (brak `./deal`).

- [ ] **Step 3: Implementacja**

Uwagi do kodu:
- **Null poniżej stawki:** `declare` odrzuca go zgodnie z ISkO 3.6, a null z ręki (35) po stawce 24 jest dozwolony.
- **Gra kolorowa lub grand poniżej stawki:** jest dozwolona. Rozgrywający przegrywa wtedy przez przelicytowanie, co liczy `settle` z parametrem `bid`.
- **Ramsz:** `createDeal` dostaje formalnie `declarer: 0`. W ramszu ta wartość nie ma znaczenia, bo wynik liczy `ramschTally`.
- **Matadory przy rozliczeniu:** liczone są z 10 kart rozgrywającego i skatu (wyrzuconego albo nietkniętego przy grze z ręki), zgodnie z ISkO.

Utwórz `src/game/deal.ts`:

```ts
// src/game/deal.ts
import {
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
      if (action.game.kind === 'ramsch') throw new Error('Ramsza się nie zgłasza');
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
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/game/deal.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/deal.ts src/game/deal.test.ts
git commit -m "feat(game): automat rozdania — skat, zgłoszenie, kontra/re, rozgrywka, ramsz

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Boty: ocena ręki, wybór gry, wyrzucanie, kontra/re, ramsz

**Pliki:**
- Utwórz: `src/bots/evaluate.ts`, `src/bots/evaluate.test.ts`, `src/bots/ramsch.ts`, `src/bots/ramsch.test.ts`
- Modyfikuj: `src/bots/index.ts`

- [ ] **Step 1: Testy**

Utwórz `src/bots/evaluate.test.ts`:

```ts
// src/bots/evaluate.test.ts
import { describe, expect, it } from 'vitest';
import type { CardId, Declaration } from '../engine';
import { chooseDiscard, chooseGame, evaluateHand, playableGames, wantsKontra, wantsRe } from './evaluate';

const STRONG_HEARTS: CardId[] = ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 'd-7', 's-8'];
/** 2 walety z treflowym, długi kolor z asem i dziesiątką i dwa asy z boku — dobry grand (jak w lekcji 24). */
const GRAND_TWO_JACKS: CardId[] = ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 's-A', 'd-7'];
const WEAK: CardId[] = ['h-8', 'h-7', 'c-8', 'c-K', 's-Q', 's-9', 'd-10', 'd-K', 'd-Q', 'c-9'];
const GRAND_HAND: CardId[] = ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 's-A', 'h-A', 'd-7', 'd-8', 's-9'];
const NULL_HAND: CardId[] = ['c-7', 'c-9', 's-7', 's-8', 'h-7', 'h-9', 'h-J', 'd-8', 'd-10', 's-10'];

describe('ocena ręki', () => {
  it('mocna ręka kierowa: kier z 2, licytacja do 30', () => {
    expect(evaluateHand(STRONG_HEARTS)).toEqual({ game: { kind: 'suit', trump: 'h' }, limit: 30 });
  });

  it('2 walety z treflowym i 3 asy: grand wygrywa z kolorem', () => {
    expect(evaluateHand(GRAND_TWO_JACKS)).toEqual({ game: { kind: 'grand' }, limit: 72 });
  });

  it('słaba ręka: brak gry', () => {
    expect(evaluateHand(WEAK)).toBeNull();
  });

  it('grand: 3 walety i 3 asy', () => {
    expect(evaluateHand(GRAND_HAND)).toEqual({ game: { kind: 'grand' }, limit: 96 });
  });

  it('null: niskie karty w każdym kolorze', () => {
    expect(playableGames(NULL_HAND).map((c) => c.game.kind)).toEqual(['null']);
    expect(evaluateHand(NULL_HAND)).toEqual({ game: { kind: 'null' }, limit: 23 });
  });
});

describe('wybór gry po licytacji', () => {
  it('grywalna gra warta stawkę', () => {
    expect(chooseGame([...STRONG_HEARTS, 'h-8', 'd-8'], 18)).toEqual({ kind: 'suit', trump: 'h' });
  });

  it('null odpada, gdy stawka przekracza 23 — wtedy kolor z największą liczbą atu', () => {
    expect(chooseGame([...NULL_HAND, 'c-8', 'd-7'], 18)).toEqual({ kind: 'null' });
    expect(chooseGame([...NULL_HAND, 'c-8', 'd-7'], 24).kind).toBe('suit');
  });
});

describe('wyrzucanie do skata', () => {
  it('kolor: chowa dziesiątkę i króla bez asa, nie wyrzuca atu ani asów', () => {
    const cards: CardId[] = ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 's-A', 'd-10', 'd-K', 'c-7'];
    expect(chooseDiscard(cards, { kind: 'suit', trump: 'h' }).sort()).toEqual(['d-10', 'd-K']);
  });

  it('null: wyrzuca najwyższe karty z kolorów bez siódemki', () => {
    const cards: CardId[] = ['c-7', 'c-8', 's-7', 's-9', 'h-7', 'h-8', 'd-8', 'd-9', 'd-A', 'c-9', 's-8', 'h-9'];
    expect(chooseDiscard(cards, { kind: 'null' })).toEqual(['d-A', 'd-9']);
  });

  it('zawsze 2 różne karty z ręki', () => {
    const cards: CardId[] = ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'h-8', 'h-7', 'c-A'];
    const [a, b] = chooseDiscard(cards, { kind: 'suit', trump: 'h' });
    expect(a).not.toBe(b);
    expect(cards).toContain(a);
    expect(cards).toContain(b);
  });
});

describe('kontra i re', () => {
  const hearts: Declaration = { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' };
  it('kontra przy mocnych atu i dwóch asach z boku', () => {
    expect(wantsKontra(['c-J', 'h-A', 'h-10', 'h-9', 'c-A', 's-A', 'd-7', 'd-8', 's-9', 'c-8'], hearts)).toBe(true);
    expect(wantsKontra(WEAK, hearts)).toBe(false);
    expect(wantsKontra(NULL_HAND, { ...hearts, game: { kind: 'null' } })).toBe(false);
  });

  it('re przy bardzo mocnej ręce', () => {
    expect(wantsRe(['c-J', 's-J', 'h-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'c-A', 's-A', 'd-7'], hearts)).toBe(true);
    expect(wantsRe(STRONG_HEARTS, hearts)).toBe(false);
  });
});
```

Utwórz `src/bots/ramsch.test.ts`:

```ts
// src/bots/ramsch.test.ts
import { describe, expect, it } from 'vitest';
import { createDeal, playCard, type CardId, type Hands } from '../engine';
import { ramschBot } from './ramsch';

const ramsch = { kind: 'ramsch' } as const;
const at = (hands: Hands, played: CardId[] = []) =>
  played.reduce((s, c) => playCard(s, c), createDeal({ game: ramsch, declarer: 0, hands, skat: [] }));

describe('bot do ramsza', () => {
  it('wychodzi najniższą kartą koloru, nie waletem', () => {
    expect(ramschBot(at([['c-J', 'h-A', 'h-7', 's-K'], ['c-7', 'c-8', 'c-9', 'c-10'], ['d-7', 'd-8', 'd-9', 'd-10']]), 0)).toBe('h-7');
  });

  it('gdy nie musi brać — pozbywa się najcenniejszej karty, która nie bierze', () => {
    const s = at([['s-A', 'c-7'], ['s-K', 's-10'], ['s-7', 'c-8']], ['s-A']);
    expect(ramschBot(s, 1)).toBe('s-10');
  });

  it('gdy musi wziąć — bierze kartą z najmniejszą liczbą oczek', () => {
    const s = at([['s-7', 'c-7'], ['s-A', 's-9'], ['d-7', 'c-8']], ['s-7']);
    expect(ramschBot(s, 1)).toBe('s-9');
  });
});
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/bots`
Expected: FAIL (brak `./evaluate` i `./ramsch`).

- [ ] **Step 3: Implementacja**

Heurystyki są zgodne z treścią kursu: grand z 2 waletami (w tym treflowym) i 3 asami to lekcja 24, a wyrzucanie dziesiątki i króla bez asa oraz skracanie kolorów to lekcje 19 i 21. Są to proste reguły, a nie silny bot.

`src/bots/index.ts` (dopisz 2 linie na końcu):

```ts
export * from './evaluate';
export * from './ramsch';
```

Utwórz `src/bots/evaluate.ts`:

```ts
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
```

Utwórz `src/bots/ramsch.ts`:

```ts
// src/bots/ramsch.ts
import { cardPoints, cardStrength, isTrump, legalMoves, trickWinner, type CardId, type GameType } from '../engine';
import type { Bot } from './types';

/** Niżej = karta słabsza; walety (atu) zawsze ponad kolorami. */
const rank = (card: CardId, game: GameType) => (isTrump(card, game) ? 1000 : 0) + cardStrength(card, game);

function pick(cards: CardId[], key: (card: CardId) => number, better: (a: number, b: number) => boolean): CardId {
  return cards.reduce((best, card) => (better(key(card), key(best)) ? card : best));
}

/**
 * Bot do ramsza: unika oczek.
 * Wychodzi najniższą kartą; gdy może nie brać lewy — pozbywa się najcenniejszej karty, która nie bierze;
 * gdy musi wziąć — bierze kartą z najmniejszą liczbą oczek.
 */
export const ramschBot: Bot = (state, seat) => {
  const { game, trick } = state;
  const legal = legalMoves(state.hands[seat], trick, game);
  if (legal.length === 0) throw new Error(`Gracz ${seat} nie ma kart`);
  if (trick.length === 0) return pick(legal, (c) => rank(c, game) * 100 + cardPoints(c), (a, b) => a < b);
  const winsNow = (card: CardId) => trickWinner([...trick, card], game) === trick.length;
  const losing = legal.filter((card) => !winsNow(card));
  if (losing.length > 0) return pick(losing, (c) => cardPoints(c) * 10_000 + rank(c, game), (a, b) => a > b);
  return pick(legal, (c) => cardPoints(c) * 10_000 + rank(c, game), (a, b) => a < b);
};
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/bots && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bots
git commit -m "feat(bots): ocena ręki, wybór gry, wyrzucanie do skata, kontra/re i bot do ramsza

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Decyzje bota w rozdaniu i symulacja

**Pliki:**
- Utwórz: `src/game/botPlayer.ts`, `src/game/botPlayer.test.ts`

- [ ] **Step 1: Testy**

Utwórz `src/game/botPlayer.test.ts`:

```ts
// src/game/botPlayer.test.ts
import { describe, expect, it } from 'vitest';
import { maxBidFor } from '../engine';
import { botAction } from './botPlayer';
import { applyGameAction, gameActor, startGameDeal, type GameDeal, type GameOptions } from './deal';
import type { DealtCards } from './random';

const OPTIONS: GameOptions = { kontra: true, ramsch: true };

/** Rozgrywa całe rozdanie samymi botami. */
function runBots(seed: number, options = OPTIONS, cards?: DealtCards): GameDeal {
  let s = startGameDeal(seed, options, cards);
  for (let i = 0; i < 200 && s.phase !== 'done'; i++) {
    const seat = gameActor(s)!;
    s = applyGameAction(s, seat, botAction(s, seat));
  }
  return s;
}

describe('bot w rozdaniu', () => {
  it('silna ręka licytuje i gra; słabe pasują', () => {
    const cards: DealtCards = {
      hands: [
        ['h-8', 'h-7', 'c-8', 'c-K', 's-Q', 's-9', 'd-10', 'd-K', 'd-Q', 'c-9'],
        ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 'd-7', 's-8'],
        ['h-J', 'd-J', 'c-10', 'c-Q', 'c-7', 's-10', 's-K', 's-7', 'd-9', 'd-8'],
      ],
      skat: ['s-A', 'd-A'],
    };
    const done = runBots(1, OPTIONS, cards);
    expect(done.declarer).toBe(1);
    expect(done.bid).toBeLessThanOrEqual(maxBidFor(cards.hands[1], { kind: 'suit', trump: 'h' }));
    expect(done.result?.kind).toBe('game');
  });

  it('licytuje kolejną stawką tylko do swojej granicy', () => {
    const s = startGameDeal(5, OPTIONS);
    const action = botAction(s, 1);
    expect(['bid', 'pass']).toContain(action.type);
    if (action.type === 'bid') expect(action.value).toBe(18);
  });
});

describe('symulacja: boty przeciwko botom', () => {
  it('300 losowych rozdań kończy się bez błędów i z poprawnym wynikiem', () => {
    const kinds = { game: 0, ramsch: 0, passedOut: 0 };
    for (let seed = 1; seed <= 300; seed++) {
      const done = runBots(seed, { kontra: true, ramsch: seed % 2 === 0 });
      expect(done.phase).toBe('done');
      const r = done.result!;
      kinds[r.kind]++;
      if (r.kind === 'game') {
        expect(r.outcome.declarerPoints).toBeGreaterThanOrEqual(0);
        expect(r.outcome.declarerPoints).toBeLessThanOrEqual(120);
        expect(r.settlement.value).toBeGreaterThan(0);
      }
      if (r.kind === 'ramsch') expect(r.points.reduce((a, b) => a + b, 0)).toBe(120);
    }
    // Rozsądek: większość rozdań to gry, ale zdarzają się też pasy — z ramszem i bez.
    expect(kinds.game).toBeGreaterThan(100);
    expect(kinds.ramsch).toBeGreaterThan(0);
    expect(kinds.passedOut).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/game/botPlayer.test.ts`
Expected: FAIL (brak `./botPlayer`).

- [ ] **Step 3: Implementacja**

Bot licytuje kolejną stawką (`nextBid`) do swojej granicy (`evaluateHand`). Zawsze podnosi skat i nie zapowiada. Gry wybiera z 12 kart: w fazie `discard` z ręki z podniesionym skatem, w fazie `declare` z ręki i wyrzuconego skatu. Ten sam zestaw kart daje ten sam wybór.

Utwórz `src/game/botPlayer.ts`:

```ts
// src/game/botPlayer.ts
import { chooseDiscard, chooseGame, evaluateHand, heuristicBot, ramschBot, wantsKontra, wantsRe } from '../bots';
import { nextBid, type Seat } from '../engine';
import { FIRST_BID } from './auction';
import type { GameAction, GameDeal } from './deal';

/** Granica licytacji bota (0 = nie licytuje). */
export function biddingLimit(state: GameDeal, seat: Seat): number {
  return evaluateHand(state.hands[seat])?.limit ?? 0;
}

/** Ruch, który wykonałby bot na miejscu `seat` (to samo posłuży jako podpowiedź dla gracza). */
export function botAction(state: GameDeal, seat: Seat): GameAction {
  switch (state.phase) {
    case 'bidding': {
      const a = state.auction;
      const limit = biddingLimit(state, seat);
      if (a.stage === 3) return limit >= FIRST_BID ? { type: 'bid', value: FIRST_BID } : { type: 'pass' };
      if (a.turn === 'bidder') {
        const next = nextBid(a.highest);
        return next !== null && next <= limit ? { type: 'bid', value: next } : { type: 'pass' };
      }
      return a.highest !== null && a.highest <= limit ? { type: 'hold' } : { type: 'pass' };
    }
    case 'skat':
      return { type: 'takeSkat' };
    case 'discard': {
      const cards = state.hands[seat];
      return { type: 'discard', cards: chooseDiscard(cards, chooseGame(cards, state.bid!)) };
    }
    case 'declare':
      return { type: 'declare', game: chooseGame([...state.hands[seat], ...state.skat], state.bid!), announce: 'none' };
    case 'kontra': {
      const declaration = state.declaration!;
      const wants = seat === state.declarer ? wantsRe(state.hands[seat], declaration) : wantsKontra(state.hands[seat], declaration);
      return wants ? { type: 'double' } : { type: 'noDouble' };
    }
    case 'play': {
      const play = state.play!;
      const card = play.game.kind === 'ramsch' ? ramschBot(play, seat) : heuristicBot(play, seat);
      return { type: 'play', card };
    }
    case 'done':
      throw new Error('Rozdanie jest zakończone');
  }
}
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/game/botPlayer.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/botPlayer.ts src/game/botPlayer.test.ts
git commit -m "feat(game): botAction — decyzje bota w każdej fazie; symulacja rozdań

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Seria, tabela Seegera-Fabiana i zapis

**Pliki:**
- Utwórz: `src/game/series.ts`, `src/game/series.test.ts`, `src/game/storage.ts`, `src/game/storage.test.ts`, `src/game/index.ts`

- [ ] **Step 1: Testy**

Utwórz `src/game/series.test.ts`:

```ts
// src/game/series.test.ts
import { describe, expect, it } from 'vitest';
import type { Settlement } from '../engine';
import { botAction } from './botPlayer';
import { applyGameAction, gameActor, type GameResult } from './deal';
import {
  currentDealNo,
  dealSeed,
  dealerOf,
  finishCurrentDeal,
  newSeries,
  playerAt,
  rowPoints,
  seatOf,
  startNextDeal,
  totals,
  type PlayerId,
  type Series,
} from './series';

/** Rozgrywa bieżące rozdanie botami (także za ciebie). */
function playCurrent(series: Series): Series {
  let s = series.current!;
  while (s.phase !== 'done') {
    const seat = gameActor(s)!;
    s = applyGameAction(s, seat, botAction(s, seat));
  }
  return { ...series, current: s };
}

const settlement = (won: boolean, value: number): Settlement => ({ won, value, score: won ? value : -2 * value, overbid: false, schneider: false, schwarz: false });
const game = (declarer: 0 | 1 | 2, won: boolean, value: number): GameResult => ({
  kind: 'game',
  declarer,
  declaration: { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' },
  bid: 18,
  doubling: null,
  outcome: { declarerPoints: won ? 70 : 50, declarerTricks: 5 },
  settlement: settlement(won, value),
});

describe('miejsca przy stole', () => {
  it('w 1. rozdaniu jesteś na ręku, potem rozdający się zmienia', () => {
    expect([1, 2, 3, 4].map(dealerOf)).toEqual([2, 0, 1, 2]);
    expect(seatOf(0, dealerOf(1))).toBe(0);
    expect(seatOf(0, dealerOf(2))).toBe(2);
    expect(seatOf(0, dealerOf(3))).toBe(1);
  });

  it('playerAt odwraca seatOf', () => {
    for (const dealer of [0, 1, 2] as PlayerId[]) {
      for (const player of [0, 1, 2] as PlayerId[]) expect(playerAt(seatOf(player, dealer), dealer)).toBe(player);
    }
  });
});

describe('punkty rozdania (Seeger-Fabian)', () => {
  it('wygrana: rozgrywający wartość + 50, obrońcy 0', () => {
    // Rozdający 2 → miejsce 1 to gracz 1.
    expect(rowPoints(game(1, true, 30), 2)).toEqual([0, 80, 0]);
  });

  it('przegrana: rozgrywający −2 × wartość − 50, obrońcy po 40', () => {
    expect(rowPoints(game(1, false, 30), 2)).toEqual([40, -110, 40]);
  });

  it('ramsz: wynik ramsza bez premii; przepadłe rozdanie: zera', () => {
    const ramsch: GameResult = {
      kind: 'ramsch',
      points: [52, 41, 27],
      tricks: [4, 4, 2],
      result: { losers: [0], jungfrau: [], durchmarsch: null, scores: [-52, 0, 0] },
    };
    expect(rowPoints(ramsch, 2)).toEqual([-52, 0, 0]);
    expect(rowPoints(ramsch, 0)).toEqual([0, -52, 0]);
    expect(rowPoints({ kind: 'passedOut' }, 1)).toEqual([0, 0, 0]);
  });
});

describe('seria', () => {
  it('kolejne rozdanie ma ziarno z serii i numeru', () => {
    const s = startNextDeal(newSeries(7));
    expect(currentDealNo(s)).toBe(1);
    expect(s.current?.seed).toBe(dealSeed(7, 1));
    expect(startNextDeal(s)).toBe(s);
  });

  it('zapisuje zakończone rozdania i sumuje punkty', () => {
    let s = newSeries(11);
    for (let i = 0; i < 3; i++) s = finishCurrentDeal(playCurrent(startNextDeal(s)));
    expect(s.rows.map((r) => r.dealNo)).toEqual([1, 2, 3]);
    expect(s.rows.map((r) => r.dealer)).toEqual([2, 0, 1]);
    expect(s.current).toBeNull();
    const sum = s.rows.reduce((t, r) => t.map((x, i) => x + r.points[i]), [0, 0, 0]);
    expect(totals(s)).toEqual(sum);
  });

  it('nie zapisuje niezakończonego rozdania; oznacza cofanie', () => {
    const s = startNextDeal(newSeries(3));
    expect(() => finishCurrentDeal(s)).toThrow('Rozdanie nie jest zakończone');
    const done = finishCurrentDeal({ ...playCurrent(s), currentUndo: true });
    expect(done.rows[0].undo).toBe(true);
    expect(done.currentUndo).toBe(false);
  });
});
```

Utwórz `src/game/storage.test.ts`:

```ts
// src/game/storage.test.ts
import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from '../test/storage';
import { botAction } from './botPlayer';
import { applyGameAction, gameActor } from './deal';
import { finishCurrentDeal, newSeries, startNextDeal, type Series } from './series';
import { GAME_STORAGE_KEY, clearSeries, loadSeries, saveSeries } from './storage';

function botMoves(series: Series, n: number): Series {
  let s = series.current!;
  for (let i = 0; i < n && s.phase !== 'done'; i++) {
    const seat = gameActor(s)!;
    s = applyGameAction(s, seat, botAction(s, seat));
  }
  return { ...series, current: s };
}

describe('zapis serii', () => {
  it('brak zapisu: brak serii i komunikatu', () => {
    expect(loadSeries(createMemoryStorage())).toEqual({ series: null, notice: null });
    expect(loadSeries(null)).toEqual({ series: null, notice: null });
    expect(saveSeries(null, newSeries(1))).toBe(false);
  });

  it('seria z rozpoczętym rozdaniem wraca po wczytaniu', () => {
    const storage = createMemoryStorage();
    let s = finishCurrentDeal(botMoves(startNextDeal(newSeries(5, { kontra: false, ramsch: true })), 500));
    s = { ...botMoves(startNextDeal(s), 6), currentUndo: true };
    expect(saveSeries(storage, s)).toBe(true);
    expect(loadSeries(storage)).toEqual({ series: s, notice: null });
  });

  it('uszkodzony zapis: komunikat i brak serii', () => {
    const bad = (value: string) => loadSeries(createMemoryStorage({ [GAME_STORAGE_KEY]: value }));
    expect(bad('{nie json')).toEqual({ series: null, notice: 'corrupted' });
    expect(bad(JSON.stringify({ schemaVersion: 2 })).notice).toBe('corrupted');
    const valid = { schemaVersion: 1, options: { kontra: true, ramsch: true }, seed: 1, rows: [], current: null };
    expect(bad(JSON.stringify(valid)).notice).toBeNull();
    expect(bad(JSON.stringify({ ...valid, rows: [{ dealNo: 5 }] })).notice).toBe('corrupted');
    const illegalMove = { ...valid, current: { history: [{ seat: 0, action: { type: 'pass' } }], undo: false } };
    expect(bad(JSON.stringify(illegalMove)).notice).toBe('corrupted');
  });

  it('czyszczenie zapisu', () => {
    const storage = createMemoryStorage();
    saveSeries(storage, newSeries(1));
    clearSeries(storage);
    expect(storage.getItem(GAME_STORAGE_KEY)).toBeNull();
  });
});
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/game`
Expected: FAIL (brak `./series` i `./storage`).

- [ ] **Step 3: Implementacja**

Uwagi do kodu:
- **Zapis rozdania:** bieżące rozdanie zapisuje się jako lista ruchów, odtwarzana z ziarna przy wczytaniu. Ruch niedozwolony (np. ręcznie zmieniony zapis) oznacza uszkodzony zapis i daje komunikat `corrupted`, tak jak w zapisie postępu kursu.
- **Pamięć przeglądarki:** moduł nie zależy od `src/state/`, a `Storage` przekazuje UI.
- **Zapis poza `localStorage`:** testy używają istniejącego `createMemoryStorage` z `src/test/storage.ts`.

Utwórz `src/game/series.ts`:

```ts
// src/game/series.ts
import { tournamentPoints, type Seat, type Triple } from '../engine';
import { startGameDeal, type GameDeal, type GameOptions, type GameResult } from './deal';

/** Gracze przy stole w kolejności zgodnej z ruchem wskazówek zegara: 0 = ty, 1 = bot po lewej, 2 = bot po prawej. */
export type PlayerId = 0 | 1 | 2;

export interface SeriesRow {
  dealNo: number;
  dealer: PlayerId;
  /** Rozgrywający (null — ramsz albo rozdanie przepadło). */
  declarer: PlayerId | null;
  result: GameResult;
  /** W rozdaniu cofano ruchy. */
  undo: boolean;
  /** Punkty Seegera-Fabiana (w ramszu — wynik ramsza) graczy 0, 1, 2. */
  points: Triple;
}

export interface Series {
  options: GameOptions;
  /** Ziarno serii; rozdanie n ma ziarno `dealSeed(seed, n)`. */
  seed: number;
  rows: SeriesRow[];
  /** Bieżące rozdanie (numer = rows.length + 1) albo null między rozdaniami. */
  current: GameDeal | null;
  /** W bieżącym rozdaniu cofano ruchy. */
  currentUndo: boolean;
}

export const DEFAULT_OPTIONS: GameOptions = { kontra: true, ramsch: true };

export function newSeries(seed: number, options: GameOptions = DEFAULT_OPTIONS): Series {
  return { options, seed: seed >>> 0, rows: [], current: null, currentUndo: false };
}

export function dealSeed(seriesSeed: number, dealNo: number): number {
  return (seriesSeed + Math.imul(dealNo, 0x9e3779b1)) >>> 0;
}

/** Rozdający w rozdaniu n: w pierwszym rozdaje bot po prawej, więc zaczynasz na ręku. */
export function dealerOf(dealNo: number): PlayerId {
  return ((dealNo + 1) % 3) as PlayerId;
}

/** Miejsce gracza w rozdaniu (0 = ręka, 1 = środkowa, 2 = ostatnia ręka — rozdający). */
export function seatOf(player: PlayerId, dealer: PlayerId): Seat {
  return ((player - dealer + 2) % 3) as Seat;
}

export function playerAt(seat: Seat, dealer: PlayerId): PlayerId {
  return ((dealer + 1 + seat) % 3) as PlayerId;
}

export function currentDealNo(series: Series): number {
  return series.rows.length + 1;
}

/** Rozpoczyna kolejne rozdanie (jeśli bieżące już trwa — bez zmian). */
export function startNextDeal(series: Series): Series {
  if (series.current) return series;
  const dealNo = currentDealNo(series);
  return { ...series, current: startGameDeal(dealSeed(series.seed, dealNo), series.options), currentUndo: false };
}

/** Punkty graczy za zakończone rozdanie. */
export function rowPoints(result: GameResult, dealer: PlayerId): Triple {
  const points: Triple = [0, 0, 0];
  if (result.kind === 'game') {
    const tp = tournamentPoints(result.settlement);
    for (const seat of [0, 1, 2] as Seat[]) {
      points[playerAt(seat, dealer)] = seat === result.declarer ? tp.declarer : tp.eachDefender;
    }
  } else if (result.kind === 'ramsch') {
    for (const seat of [0, 1, 2] as Seat[]) points[playerAt(seat, dealer)] = result.result.scores[seat];
  }
  return points;
}

/** Zapisuje zakończone bieżące rozdanie w tabeli. */
export function finishCurrentDeal(series: Series): Series {
  const current = series.current;
  if (!current || current.phase !== 'done' || !current.result) throw new Error('Rozdanie nie jest zakończone');
  const dealNo = currentDealNo(series);
  const dealer = dealerOf(dealNo);
  const result = current.result;
  const row: SeriesRow = {
    dealNo,
    dealer,
    declarer: result.kind === 'game' ? playerAt(result.declarer, dealer) : null,
    result,
    undo: series.currentUndo,
    points: rowPoints(result, dealer),
  };
  return { ...series, rows: [...series.rows, row], current: null, currentUndo: false };
}

export function totals(series: Series): Triple {
  return series.rows.reduce<Triple>((t, r) => [t[0] + r.points[0], t[1] + r.points[1], t[2] + r.points[2]], [0, 0, 0]);
}
```

Utwórz `src/game/storage.ts`:

```ts
// src/game/storage.ts
import { replayGameDeal, type GameDeal, type GameOptions } from './deal';
import { currentDealNo, dealSeed, type Series, type SeriesRow } from './series';

export const GAME_STORAGE_KEY = 'skat-trener:v1:gra';

/** Zapis serii: bieżące rozdanie jako lista ruchów (odtwarzane z ziarna przy wczytaniu). */
interface StoredSeries {
  schemaVersion: 1;
  options: GameOptions;
  seed: number;
  rows: SeriesRow[];
  current: { history: GameDeal['history']; undo: boolean } | null;
}

export interface LoadedSeries {
  series: Series | null;
  notice: 'corrupted' | null;
}

export function saveSeries(storage: Storage | null, series: Series): boolean {
  if (!storage) return false;
  const data: StoredSeries = {
    schemaVersion: 1,
    options: series.options,
    seed: series.seed,
    rows: series.rows,
    current: series.current ? { history: series.current.history, undo: series.currentUndo } : null,
  };
  try {
    storage.setItem(GAME_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isTriple = (v: unknown) => Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === 'number' && Number.isFinite(n));

function isRow(v: unknown, index: number): v is SeriesRow {
  return (
    isObject(v) &&
    v.dealNo === index + 1 &&
    [0, 1, 2].includes(v.dealer as number) &&
    (v.declarer === null || [0, 1, 2].includes(v.declarer as number)) &&
    typeof v.undo === 'boolean' &&
    isTriple(v.points) &&
    isObject(v.result) &&
    ['game', 'ramsch', 'passedOut'].includes(v.result.kind as string)
  );
}

/** Wczytuje serię. Brak zapisu → series = null bez komunikatu; uszkodzony zapis → null z komunikatem. */
export function loadSeries(storage: Storage | null): LoadedSeries {
  let raw: string | null;
  try {
    raw = storage?.getItem(GAME_STORAGE_KEY) ?? null;
  } catch {
    return { series: null, notice: null };
  }
  if (raw === null) return { series: null, notice: null };
  try {
    const data: unknown = JSON.parse(raw);
    if (
      !isObject(data) ||
      data.schemaVersion !== 1 ||
      !isObject(data.options) ||
      typeof data.options.kontra !== 'boolean' ||
      typeof data.options.ramsch !== 'boolean' ||
      typeof data.seed !== 'number' ||
      !Array.isArray(data.rows) ||
      !data.rows.every(isRow)
    ) {
      throw new Error('zły format');
    }
    const options: GameOptions = { kontra: data.options.kontra, ramsch: data.options.ramsch };
    const base: Series = { options, seed: data.seed, rows: data.rows as SeriesRow[], current: null, currentUndo: false };
    const stored = data.current;
    if (stored === null || stored === undefined) return { series: base, notice: null };
    if (!isObject(stored) || !Array.isArray(stored.history) || typeof stored.undo !== 'boolean') throw new Error('zły format');
    const current = replayGameDeal(dealSeed(base.seed, currentDealNo(base)), options, stored.history as GameDeal['history']);
    return { series: { ...base, current, currentUndo: stored.undo }, notice: null };
  } catch {
    return { series: null, notice: 'corrupted' };
  }
}

export function clearSeries(storage: Storage | null): void {
  try {
    storage?.removeItem(GAME_STORAGE_KEY);
  } catch {
    // brak dostępu do pamięci — nic do zrobienia
  }
}
```

Utwórz `src/game/index.ts`:

```ts
// src/game/index.ts
export * from './random';
export * from './auction';
export * from './deal';
export * from './botPlayer';
export * from './series';
export * from './storage';
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/game && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game
git commit -m "feat(game): seria rozdań, tabela Seegera-Fabiana i zapis w przeglądarce

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Pełna weryfikacja i specyfikacja

- [ ] **Step 1:** Run: `npm run typecheck && npm test -- --run && npm run build`. Expected: wszystko PASS (282 testy).
- [ ] **Step 2:** W `docs/superpowers/specs/2026-11-12-gra-z-botami-design.md` dopisz na końcu sekcję:

```markdown
## 11. Decyzje z implementacji (Plan 7)

- **Rozdanie** = ziarno + lista ruchów (`history`). Zapis serii przechowuje tylko ruchy bieżącego rozdania, a przy wczytaniu rozdanie jest odtwarzane.
- **Kolejność miejsc:** w 1. rozdaniu rozdaje bot po prawej, więc gracz zaczyna na ręku. Potem rozdający przechodzi zgodnie z ruchem wskazówek zegara.
- **Heurystyki botów** (`src/bots/evaluate.ts`):
  - kolor: co najmniej 6 atu albo 5 atu z waletem i razem co najmniej 3 waletami lub asami z boku;
  - grand: 3 walety i 2 asy albo 2 walety z treflowym i 3 asy;
  - null: siódemka albo ósemka w każdym kolorze, najwyżej 2 asy i króle;
  - kontra: co najmniej 4 atu, w tym 2 wysokie, i 2 asy z boku (w grandzie 2 walety i 3 asy);
  - re: co najmniej 8 atu albo 7 atu i 3 walety.
- **Ramsz w silniku rozgrywki:** `createDeal` z `declarer: 0`, bo w ramszu nie ma rozgrywającego. Wynik liczy `ramschTally`.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-11-12-gra-z-botami-design.md
git commit -m "docs: decyzje z Planu 7 w specyfikacji gry z botami

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
