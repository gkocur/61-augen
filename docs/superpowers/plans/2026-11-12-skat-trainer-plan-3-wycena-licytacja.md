# Trener skata — Plan 3: wartość gry i licytacja (moduły 3–4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Moduły 3 („Wartość gry”, lekcje 12–16) i 4 („Licytacja”, lekcje 17–19) z silnikiem wyceny (matadory, mnożnik, nulle, przegrana, przelicytowanie, zapis Seeger-Fabian) i licytacji (stawki, kolejna stawka, górna granica dla ręki). Do tego quizy z odpowiedziami liczonymi przez silnik i nowe ćwiczenie „wybierz 2 karty do skata”.

**Architecture:**
- Nowe pliki silnika: `src/engine/scoring.ts` (zgłoszenie gry, matadory, rozliczenie, punkty turniejowe) oraz `src/engine/bidding.ts` (lista stawek generowana z wartości gier, kolejna stawka, górna granica licytacji).
- **Zamiast osobnego ćwiczenia `bid` ze specyfikacji** rozszerzamy quiz o pole `verify` z nowymi rodzajami: `matadors`, `maxBid`, `nextBid` i `settle`. Odpowiedzi liczbowe sprawdza wtedy silnik w teście treści, a UI zostaje bez zmian.
- Jedyne nowe ćwiczenie to `discard`, czyli wybór 2 kart do skata.
- Logika sprawdzania quizów przechodzi do osobnego pliku `src/content/verify.ts`.

**Tech Stack:** jak w Planach 1–2 (Vite 6, React 18, TypeScript 5, Vitest 3 + jsdom, RTL, user-event; Node ≥ 22.4).

**Specyfikacja:** `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`. Plany 1–2 zrealizowane.

**Zasady (ISkO), na których opiera się silnik:**
- **Wartość gry kolorowej i granda** = wartość bazowa × mnożnik. Wartości bazowe: ♦ 9, ♥ 10, ♠ 11, ♣ 12, grand 24.
- **Mnożnik** to matadory („z”/„bez” ilu) plus kolejne poziomy po +1: gra (zawsze), z ręki, krawiec, krawiec zapowiedziany, czarny, czarny zapowiedziany, otwarta.
- **Kiedy liczą się krawiec i czarny:**
  - krawiec, gdy jedna strona ma ≥ 90 oczek (rozgrywający ≥ 90 albo ≤ 30); czarny, gdy jedna strona wzięła wszystkie lewy;
  - zapowiedź zawsze dolicza swój poziom i poziom niższy: zapowiedziany krawiec liczy też krawca, zapowiedziany czarny — krawca, jego zapowiedź i czarnego;
  - gra otwarta to zapowiedziany czarny i dodatkowo +1.
- **Zapowiedzi** wolno robić tylko z ręki. Niespełniona zapowiedź oznacza przegraną.
- **Wygrana od 61 oczek** rozgrywającego, a skat liczy się rozgrywającemu. Matadory liczy się z 12 kart rozgrywającego, razem ze skatem.
- **Null:** 23, z ręki 35, otwarty 46, otwarty z ręki 59.
- **Przegrana** = −2 × wartość.
- **Przelicytowanie:** gdy wartość gry jest mniejsza od stawki, gra jest przegrana, a liczy się najmniejsza wielokrotność wartości bazowej ≥ stawki.
- **Seeger-Fabian:** wygrana daje +wartość +50. Przegrana daje −2 × wartość −50, a każdy obrońca dostaje +40 (stół 3-osobowy).

**Konwencje:** jak w Planach 1–2.
- Każde zadanie kończy się commitem z linią `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Pliki danych słownika (`src/glossary/terms.ts`, `cardNames.ts`) zmieniaj tylko punktowo. Jeśli autor coś zmienił, zachowaj jego słowa.
- Polecenia uruchamiaj w `/Users/gkocur/skat`.

---

## Struktura plików (zmiany w Planie 3)

```
src/
  engine/
    scoring.ts      NOWY: Declaration, matadory, wartości, settle, tournamentPoints
    bidding.ts      NOWY: BID_VALUES, nextBid, maxBidFor
    index.ts        ZMIANA: eksporty
  glossary/
    terms.ts        ZMIANA (punktowo): krawiec, czarny, reka, otwarta, matador, mit, ohne, przelicytowanie, pas
  content/
    types.ts        ZMIANA: QuizOption.value, nowe QuizVerify, DiscardExerciseData
    verify.ts       NOWY: sprawdzanie odpowiedzi quizów silnikiem
    validate.ts     ZMIANA: verify z verify.ts, walidacja discard
    course.ts       ZMIANA: moduły 3–4
    lessons/m3-l12-wartosc-bazowa.ts … m4-l19-skat.ts   NOWE (8 lekcji)
  exercises/
    evaluateDiscard.ts   NOWY
    DiscardExercise.tsx  NOWY
    ExerciseView.tsx     ZMIANA: case discard
  styles.css        ZMIANA: przycisk akcji ćwiczenia
docs/superpowers/specs/2026-11-12-skat-trainer-design.md   ZMIANA: sekcja 9 (decyzje z realizacji)
```

---

### Task 1: Silnik — wycena gry

**Files:**
- Create: `src/engine/scoring.ts`
- Modify: `src/engine/index.ts`
- Test: `src/engine/scoring.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/engine/scoring.test.ts
import { describe, expect, it } from 'vitest';
import type { CardId } from './cards';
import type { GameType } from './game';
import { declarationIssue, matadors, nullValue, settle, tournamentPoints, type Declaration } from './scoring';

const hearts: GameType = { kind: 'suit', trump: 'h' };
const clubs: GameType = { kind: 'suit', trump: 'c' };
const diamonds: GameType = { kind: 'suit', trump: 'd' };
const grand: GameType = { kind: 'grand' };
const decl = (game: GameType, hand = false, announce: Declaration['announce'] = 'none'): Declaration => ({ game, hand, announce });

// ♥, z 2 (♣W ♠W, brak ♥W)
const HEARTS_WITH_2: CardId[] = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'];
// ♣, z 1
const CLUBS_WITH_1: CardId[] = ['c-J', 'h-J', 'c-A', 'c-10', 'c-K', 'c-Q', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'd-7'];
// ♦, bez 1
const DIAMONDS_WITHOUT_1: CardId[] = ['s-J', 'h-J', 'd-A', 'd-10', 'd-K', 'd-Q', 'd-9', 'c-A', 'c-10', 's-A', 'h-A', 'h-10'];
// grand, z 2
const GRAND_WITH_2: CardId[] = ['c-J', 's-J', 'd-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-K', 'd-A', 'd-10', 'd-9'];

describe('matadory', () => {
  it('z ilu / bez ilu w grze kolorowej', () => {
    expect(matadors(HEARTS_WITH_2, hearts)).toEqual({ with: true, count: 2 });
    expect(matadors(DIAMONDS_WITHOUT_1, diamonds)).toEqual({ with: false, count: 1 });
    expect(matadors(['h-J', 'd-J', 'h-A'], hearts)).toEqual({ with: false, count: 2 });
  });

  it('pełny ciąg: z 11 w kolorze, z 4 / bez 4 w grandzie', () => {
    const all: CardId[] = ['c-J', 's-J', 'h-J', 'd-J', 'c-A', 'c-10', 'c-K', 'c-Q', 'c-9', 'c-8', 'c-7'];
    expect(matadors(all, clubs)).toEqual({ with: true, count: 11 });
    expect(matadors(all, grand)).toEqual({ with: true, count: 4 });
    expect(matadors(['c-A', 's-A'], grand)).toEqual({ with: false, count: 4 });
  });

  it('null nie ma matadorów', () => {
    expect(() => matadors([], { kind: 'null' })).toThrow();
  });
});

describe('zgłoszenie gry', () => {
  it('zapowiedzi tylko z ręki; w nullu tylko otwarty', () => {
    expect(declarationIssue(decl(hearts, false, 'schneider'))).toMatch(/z ręki/);
    expect(declarationIssue(decl(hearts, true, 'schwarz'))).toBeNull();
    expect(declarationIssue(decl({ kind: 'null' }, false, 'schneider'))).toMatch(/null/i);
    expect(declarationIssue(decl({ kind: 'null' }, false, 'ouvert'))).toBeNull();
  });

  it('wartości nulla', () => {
    expect(nullValue(decl({ kind: 'null' }))).toBe(23);
    expect(nullValue(decl({ kind: 'null' }, true))).toBe(35);
    expect(nullValue(decl({ kind: 'null' }, false, 'ouvert'))).toBe(46);
    expect(nullValue(decl({ kind: 'null' }, true, 'ouvert'))).toBe(59);
  });
});

describe('rozliczenie gry', () => {
  const won = (points: number, tricks: number) => ({ declarerPoints: points, declarerTricks: tricks });

  it('zwykła wygrana: bazowa × (matadory + 1)', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: won(75, 6) })).toEqual({
      won: true, value: 30, score: 30, overbid: false, schneider: false, schwarz: false,
    });
  });

  it('z ręki +1, krawiec +1, czarny +1', () => {
    expect(settle({ declaration: decl(hearts, true), declarerCards: HEARTS_WITH_2, outcome: won(70, 6) }).value).toBe(40);
    expect(settle({ declaration: decl(clubs), declarerCards: CLUBS_WITH_1, outcome: won(95, 8) }).value).toBe(36);
    expect(settle({ declaration: decl(grand), declarerCards: GRAND_WITH_2, outcome: won(120, 10) }).value).toBe(120);
  });

  it('zapowiedziany krawiec: spełniony i niespełniony', () => {
    const ok = settle({ declaration: decl(diamonds, true, 'schneider'), declarerCards: DIAMONDS_WITHOUT_1, outcome: won(92, 8) });
    expect(ok).toMatchObject({ won: true, value: 45, score: 45 });
    const failed = settle({ declaration: decl(diamonds, true, 'schneider'), declarerCards: DIAMONDS_WITHOUT_1, outcome: won(85, 7) });
    expect(failed).toMatchObject({ won: false, value: 45, score: -90 });
  });

  it('gra otwarta: wszystkie poziomy', () => {
    const s = settle({ declaration: decl(hearts, true, 'ouvert'), declarerCards: HEARTS_WITH_2, outcome: won(120, 10) });
    expect(s).toMatchObject({ won: true, value: 90 });
  });

  it('przegrana liczy się podwójnie; krawiec także przy przegranej', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: won(55, 4) })).toMatchObject({ won: false, value: 30, score: -60 });
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: won(25, 2) })).toMatchObject({ won: false, value: 40, score: -80, schneider: true });
  });

  it('przelicytowanie: przegrana z wartością będącą wielokrotnością bazowej ≥ stawki', () => {
    const cards: CardId[] = ['c-J', 'h-J', 'h-A', 'h-10', 'h-K', 'h-8', 'c-A', 's-A', 's-10', 'd-A', 'd-K', 'd-7'];
    expect(settle({ declaration: decl(hearts), declarerCards: cards, outcome: won(80, 7), bid: 30 })).toEqual({
      won: false, value: 30, score: -60, overbid: true, schneider: false, schwarz: false,
    });
  });

  it('null: wygrana bez lew, przegrana podwójnie', () => {
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: won(0, 0) })).toMatchObject({ won: true, score: 23 });
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: won(4, 1) })).toMatchObject({ won: false, score: -46 });
  });

  it('niepoprawne zgłoszenie to błąd', () => {
    expect(() => settle({ declaration: decl(hearts, false, 'schwarz'), declarerCards: HEARTS_WITH_2, outcome: won(120, 10) })).toThrow();
  });
});

describe('zapis Seeger-Fabian', () => {
  it('wygrana +50, przegrana −2×wartość −50 i +40 dla każdego obrońcy', () => {
    const win = settle({ declaration: decl(clubs), declarerCards: CLUBS_WITH_1, outcome: { declarerPoints: 95, declarerTricks: 8 } });
    expect(tournamentPoints(win)).toEqual({ declarer: 86, eachDefender: 0 });
    const loss = settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: { declarerPoints: 55, declarerTricks: 4 } });
    expect(tournamentPoints(loss)).toEqual({ declarer: -110, eachDefender: 40 });
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/engine/scoring.test.ts`
Expected: FAIL — „Failed to resolve import "./scoring"”.

- [ ] **Step 3: Zaimplementuj `scoring.ts`**

```ts
// src/engine/scoring.ts
import type { CardId, Suit } from './cards';
import type { GameType } from './game';

/** Zapowiedź: `ouvert` w grze kolorowej/grandzie oznacza grę otwartą (z zapowiedzią czarnego); w nullu — null otwarty. */
export type Announcement = 'none' | 'schneider' | 'schwarz' | 'ouvert';

/** Zgłoszenie gry przez rozgrywającego. */
export interface Declaration {
  game: GameType;
  /** Gra z ręki (bez podnoszenia skata). */
  hand: boolean;
  announce: Announcement;
}

export interface PlayOutcome {
  /** Oczka rozgrywającego razem ze skatem. */
  declarerPoints: number;
  declarerTricks: number;
  /** Liczba lew w rozdaniu (domyślnie 10). */
  totalTricks?: number;
}

export interface Settlement {
  won: boolean;
  /** Wartość gry (dodatnia). */
  value: number;
  /** Wynik zapisany rozgrywającemu: +wartość albo −2 × wartość. */
  score: number;
  overbid: boolean;
  schneider: boolean;
  schwarz: boolean;
}

export const SUIT_BASE: Record<Suit, number> = { d: 9, h: 10, s: 11, c: 12 };
export const GRAND_BASE = 24;
export const NULL_VALUES = { plain: 23, hand: 35, ouvert: 46, ouvertHand: 59 } as const;

/** Wartość bazowa; dla nulla `null` (null ma stałe wartości). */
export function baseValue(game: GameType): number | null {
  if (game.kind === 'null') return null;
  return game.kind === 'grand' ? GRAND_BASE : SUIT_BASE[game.trump];
}

const JACKS: readonly CardId[] = ['c-J', 's-J', 'h-J', 'd-J'];
const TRUMP_RANKS = ['A', '10', 'K', 'Q', '9', '8', '7'] as const;

/** Atu od najwyższego — kolejność, w jakiej liczy się matadory. */
export function matadorOrder(game: GameType): CardId[] {
  if (game.kind === 'null') throw new Error('Null nie ma matadorów');
  if (game.kind === 'grand') return [...JACKS];
  return [...JACKS, ...TRUMP_RANKS.map((rank) => `${game.trump}-${rank}` as CardId)];
}

export interface Matadors {
  /** true = „z”, false = „bez”. */
  with: boolean;
  count: number;
}

/** Matadory liczone z kart rozgrywającego (zwykle 12 kart: ręka + skat). */
export function matadors(cards: readonly CardId[], game: GameType): Matadors {
  const held = matadorOrder(game).map((card) => cards.includes(card));
  const first = held[0];
  const breakAt = held.findIndex((h) => h !== first);
  return { with: first, count: breakAt === -1 ? held.length : breakAt };
}

/** Opis błędu zgłoszenia albo null, gdy zgłoszenie jest poprawne. */
export function declarationIssue(d: Declaration): string | null {
  if (d.game.kind === 'null') {
    return d.announce === 'none' || d.announce === 'ouvert' ? null : 'W nullu nie zapowiada się krawca ani czarnego';
  }
  if (d.announce !== 'none' && !d.hand) return 'Zapowiedzi są możliwe tylko w grze z ręki';
  return null;
}

export function nullValue(d: Declaration): number {
  if (d.announce === 'ouvert') return d.hand ? NULL_VALUES.ouvertHand : NULL_VALUES.ouvert;
  return d.hand ? NULL_VALUES.hand : NULL_VALUES.plain;
}

export interface SettleInput {
  declaration: Declaration;
  /** Karty rozgrywającego razem ze skatem (do matadorów; w nullu nieużywane). */
  declarerCards: readonly CardId[];
  outcome: PlayOutcome;
  /** Wylicytowana stawka (do sprawdzenia przelicytowania). */
  bid?: number;
}

export function settle({ declaration: d, declarerCards, outcome, bid }: SettleInput): Settlement {
  const issue = declarationIssue(d);
  if (issue) throw new Error(issue);
  const totalTricks = outcome.totalTricks ?? 10;

  if (d.game.kind === 'null') {
    const value = nullValue(d);
    const overbid = bid !== undefined && bid > value;
    const won = outcome.declarerTricks === 0 && !overbid;
    return { won, value, score: won ? value : -2 * value, overbid, schneider: false, schwarz: false };
  }

  const base = baseValue(d.game) as number;
  const schneider = outcome.declarerPoints >= 90 || outcome.declarerPoints <= 30;
  const schwarz = outcome.declarerTricks === totalTricks || outcome.declarerTricks === 0;
  const announcedSchneider = d.announce !== 'none';
  const announcedSchwarz = d.announce === 'schwarz' || d.announce === 'ouvert';

  const multiplier =
    matadors(declarerCards, d.game).count +
    1 +
    (d.hand ? 1 : 0) +
    (schneider || announcedSchneider ? 1 : 0) +
    (announcedSchneider ? 1 : 0) +
    (schwarz || announcedSchwarz ? 1 : 0) +
    (announcedSchwarz ? 1 : 0) +
    (d.announce === 'ouvert' ? 1 : 0);

  let won =
    outcome.declarerPoints >= 61 &&
    (!announcedSchneider || outcome.declarerPoints >= 90) &&
    (!announcedSchwarz || outcome.declarerTricks === totalTricks);
  let value = base * multiplier;
  let overbid = false;
  if (bid !== undefined && value < bid) {
    overbid = true;
    won = false;
    value = base * Math.ceil(bid / base);
  }
  return { won, value, score: won ? value : -2 * value, overbid, schneider, schwarz };
}

/** Punkty turniejowe (Seeger-Fabian, stół trzyosobowy). */
export function tournamentPoints(s: Settlement): { declarer: number; eachDefender: number } {
  return s.won ? { declarer: s.value + 50, eachDefender: 0 } : { declarer: -2 * s.value - 50, eachDefender: 40 };
}
```

Dopisz do `src/engine/index.ts`:

```ts
export * from './scoring';
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): wycena gry — matadory, poziomy, null, przegrana, przelicytowanie, Seeger-Fabian" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Silnik — stawki licytacji

**Files:**
- Create: `src/engine/bidding.ts`
- Modify: `src/engine/index.ts`
- Test: `src/engine/bidding.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/engine/bidding.test.ts
import { describe, expect, it } from 'vitest';
import { BID_VALUES, maxBidFor, nextBid } from './bidding';

// Lista ze specyfikacji (sekcja 3.1) — wszystkie możliwe wartości gier od 18.
const SPEC_BIDS = [
  18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88,
  90, 96, 99, 100, 108, 110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168,
  170, 176, 180, 187, 192, 198, 204, 216, 240, 264,
];

describe('stawki licytacji', () => {
  it('generowana lista zgadza się ze specyfikacją', () => {
    expect(BID_VALUES).toEqual(SPEC_BIDS);
  });

  it('kolejna stawka', () => {
    expect(nextBid(null)).toBe(18);
    expect(nextBid(18)).toBe(20);
    expect(nextBid(24)).toBe(27);
    expect(nextBid(36)).toBe(40);
    expect(nextBid(25)).toBe(27);
    expect(nextBid(264)).toBeNull();
  });

  it('górna granica licytacji dla ręki', () => {
    expect(maxBidFor(['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 's-10', 'd-9'], { kind: 'suit', trump: 'h' })).toBe(30);
    expect(maxBidFor(['c-J', 's-J', 'h-A'], { kind: 'suit', trump: 'h' }, true)).toBe(40);
    expect(maxBidFor(['d-A', 'd-10', 'c-A'], { kind: 'suit', trump: 'd' })).toBe(45);
    expect(maxBidFor(['c-J', 's-J', 'c-A'], { kind: 'grand' })).toBe(72);
    expect(maxBidFor([], { kind: 'null' })).toBe(23);
    expect(maxBidFor([], { kind: 'null' }, true)).toBe(35);
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/engine/bidding.test.ts`
Expected: FAIL — „Failed to resolve import "./bidding"”.

- [ ] **Step 3: Zaimplementuj `bidding.ts`**

```ts
// src/engine/bidding.ts
import type { CardId } from './cards';
import type { GameType } from './game';
import { GRAND_BASE, NULL_VALUES, SUIT_BASE, baseValue, matadors } from './scoring';

const MIN_BID = 18;
/** Najwyższy mnożnik: 11 matadorów + gra, ręka, krawiec, zapowiedź, czarny, zapowiedź, otwarta. */
const MAX_SUIT_MULTIPLIER = 18;
/** W grandzie matadorów jest najwyżej 4. */
const MAX_GRAND_MULTIPLIER = 11;

function computeBidValues(): number[] {
  const values = new Set<number>(Object.values(NULL_VALUES));
  for (const base of Object.values(SUIT_BASE)) {
    for (let m = 2; m <= MAX_SUIT_MULTIPLIER; m++) values.add(base * m);
  }
  for (let m = 2; m <= MAX_GRAND_MULTIPLIER; m++) values.add(GRAND_BASE * m);
  return [...values].filter((v) => v >= MIN_BID).sort((a, b) => a - b);
}

/** Wszystkie dozwolone stawki licytacji, rosnąco. */
export const BID_VALUES: readonly number[] = computeBidValues();

/** Najbliższa stawka wyższa od `after` (null = pierwsza stawka). */
export function nextBid(after: number | null): number | null {
  if (after === null) return BID_VALUES[0];
  return BID_VALUES.find((v) => v > after) ?? null;
}

/** Do ilu można licytować daną ręką w danej grze (bez krawca i czarnego). */
export function maxBidFor(cards: readonly CardId[], game: GameType, hand = false): number {
  const base = baseValue(game);
  if (base === null) return hand ? NULL_VALUES.hand : NULL_VALUES.plain;
  return base * (matadors(cards, game).count + 1 + (hand ? 1 : 0));
}
```

Dopisz do `src/engine/index.ts`:

```ts
export * from './bidding';
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): stawki licytacji generowane z wartości gier" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Słownik — terminy wyceny i licytacji

**Files:**
- Modify: `src/glossary/terms.ts` (punktowo)
- Test: `src/glossary/terms.test.ts` (dopisany test)

- [ ] **Step 1: Dopisz test**

W `src/glossary/terms.test.ts` (wewnątrz `describe`):

```ts
  it('terminy wyceny i licytacji w obu rejestrach', () => {
    const off = { deck: 'altenburg', register: 'official' } as const;
    const col = { deck: 'altenburg', register: 'colloquial' } as const;
    expect(formsFor(TERMS.krawiec, off).B).toBe('krawca');
    expect(formsFor(TERMS.krawiec, col).M).toBe('szneider');
    expect(formsFor(TERMS.czarny, col).M).toBe('szwarc');
    expect(formsFor(TERMS.reka, off).Ms).toBe('grze z ręki');
    expect(formsFor(TERMS.mit, col).M).toBe('mit');
    expect(formsFor(TERMS.ohne, off).M).toBe('bez');
    expect(formsFor(TERMS.matador, off).Dlm).toBe('matadorów');
  });
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/glossary/terms.test.ts`
Expected: FAIL (brak terminów).

- [ ] **Step 3: Dopisz terminy w `src/glossary/terms.ts`**

Wstaw poniższe wpisy do obiektu `TERMS`, tuż przed jego zamykającym `};` (po wpisie `as`). Nie zmieniaj istniejących wpisów.

```ts
  // Wycena i licytacja (Plan 3). ⚠ Wersje potoczne do weryfikacji przez autora.
  krawiec: plain({
    official: { M: 'krawiec', g: 'm', D: 'krawca', B: 'krawca', N: 'krawcem', Ms: 'krawcu' },
    colloquial: { M: 'szneider', g: 'm', D: 'szneidra', B: 'szneidra', N: 'szneidrem', Ms: 'szneidrze' },
  }),
  czarny: plain({
    official: { M: 'czarny', g: 'm', D: 'czarnego', B: 'czarnego', N: 'czarnym', Ms: 'czarnym' },
    colloquial: { M: 'szwarc', g: 'm', D: 'szwarca', B: 'szwarca', N: 'szwarcem', Ms: 'szwarcu' },
  }),
  reka: plain({
    official: { M: 'gra z ręki', g: 'f', D: 'gry z ręki', B: 'grę z ręki', N: 'grą z ręki', Ms: 'grze z ręki' },
    colloquial: { M: 'hand', g: 'm', D: 'handa', B: 'handa', N: 'handem', Ms: 'handzie' },
  }),
  otwarta: plain({
    official: { M: 'gra otwarta', g: 'f', D: 'gry otwartej', B: 'grę otwartą', N: 'grą otwartą', Ms: 'grze otwartej' },
    colloquial: { M: 'uwert', g: 'm', D: 'uwerta', B: 'uwerta', N: 'uwertem', Ms: 'uwercie' },
  }),
  matador: plain(same({ M: 'matador', g: 'm', D: 'matadora', Mlm: 'matadory', Dlm: 'matadorów', Nlm: 'matadorami' })),
  mit: plain({ official: { M: 'z' }, colloquial: { M: 'mit' } }),
  ohne: plain({ official: { M: 'bez' }, colloquial: { M: 'ohne' } }),
  przelicytowanie: plain({
    official: { M: 'przelicytowanie', g: 'n', D: 'przelicytowania', N: 'przelicytowaniem', Ms: 'przelicytowaniu' },
    colloquial: { M: 'przereizowanie', g: 'n', D: 'przereizowania', N: 'przereizowaniem', Ms: 'przereizowaniu' },
  }),
  pas: plain(same({ M: 'pas', g: 'm' })),
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/glossary && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/glossary
git commit -m "feat(glossary): terminy wyceny i licytacji" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Treść — quizy liczone silnikiem i ćwiczenie „do skata”

**Files:**
- Modify: `src/content/types.ts` (całość), `src/content/validate.ts` (całość)
- Create: `src/content/verify.ts`
- Test: `src/content/verify.test.ts`, `src/content/validate.test.ts` (dopisany test)

- [ ] **Step 1: Zastąp `src/content/types.ts`**

```ts
// src/content/types.ts
import type { CardId, Declaration, GameType, Hands, PlayOutcome, Seat } from '../engine';

export interface TheoryStep {
  title?: string;
  text: string;
  cards?: CardId[];
  cardsCaption?: string;
}

/** Odpowiedź w quizie: tekst ALBO karta. `value` — wartość maszynowa do sprawdzenia silnikiem (np. '-60', 'z2'). */
export interface QuizOption {
  id: string;
  text?: string;
  card?: CardId;
  value?: string;
}

/**
 * Sprawdzenie poprawnej odpowiedzi silnikiem (w teście treści). Porównywane jest `value ?? text` poprawnej odpowiedzi:
 * - `points`: suma oczek kart z `cards`;
 * - `trickWinner`: odpowiedzi to 3 karty w kolejności zagrania, poprawna bierze lewę w grze `game`;
 * - `matadors`: matadory kart z `cards` w grze `game`, w postaci 'z2' / 'bez3';
 * - `maxBid`: górna granica licytacji dla kart z `cards`;
 * - `nextBid`: stawka następna po `after`;
 * - `settle`: rozliczenie gry; `cards` = karty rozgrywającego (12, ze skatem; w nullu niepotrzebne);
 *   `result`: 'value' (wartość), 'score' (wynik ±), 'tournament' (punkty turniejowe rozgrywającego).
 */
export type QuizVerify =
  | { kind: 'points' }
  | { kind: 'trickWinner'; game: GameType }
  | { kind: 'matadors'; game: GameType }
  | { kind: 'maxBid'; game: GameType; hand?: boolean }
  | { kind: 'nextBid'; after: number }
  | { kind: 'settle'; declaration: Declaration; outcome: PlayOutcome; bid?: number; result: 'value' | 'score' | 'tournament' };

export interface QuizExerciseData {
  type: 'quiz';
  id: string;
  prompt: string;
  cards?: CardId[];
  options: QuizOption[];
  correct: string;
  explain: string;
  verify?: QuizVerify;
}

export interface PlayCardExerciseData {
  type: 'playCard';
  id: string;
  prompt: string;
  game: GameType;
  /** Pokazuj etykietę rodzaju gry (domyślnie tak). */
  showGame?: boolean;
  /** Kto wyszedł do lewy; gracz siedzi na miejscu leader + trick.length. */
  leader: Seat;
  trick: CardId[];
  hand: CardId[];
  /** `legal` — wystarczy dozwolona karta; `best` — tylko karty z `best`. */
  mode: 'legal' | 'best';
  best?: CardId[];
  /** Przyciemniaj niedozwolone karty. */
  showLegal?: boolean;
  explain: string;
  wrongExplain?: Partial<Record<CardId, string>>;
}

/** `win` — twoja strona wygrywa rozdanie (pełne rozdanie); `minPoints` — twoja strona ma co najmniej tyle oczek. */
export type MiniDealGoal = { kind: 'win' } | { kind: 'minPoints'; points: number };

export interface MiniDealExerciseData {
  type: 'miniDeal';
  id: string;
  prompt: string;
  game: GameType;
  declarer: Seat;
  /** Miejsce gracza. */
  you: Seat;
  /** Kto wychodzi do pierwszej lewy (domyślnie przodek). */
  leader?: Seat;
  hands: Hands;
  skat: CardId[];
  /** Zaplanowane karty botów (gracz `you` nie ma skryptu). */
  scripts?: Partial<Record<Seat, CardId[]>>;
  /** Wzorcowe zagrania gracza — test treści sprawdza, że prowadzą do celu. */
  solution: CardId[];
  goal: MiniDealGoal;
  explain: string;
}

/** Wybór 2 kart do wyrzucenia do skata z 12 kart (ręka + podniesiony skat). */
export interface DiscardExerciseData {
  type: 'discard';
  id: string;
  prompt: string;
  /** Gra, którą rozgrywający zamierza zgłosić. */
  game: GameType;
  cards: CardId[];
  /** Dobre pary (kolejność w parze bez znaczenia); pierwsza jest pokazywana jako wzorcowa. */
  best: CardId[][];
  explain: string;
  wrongExplain?: string;
}

export type ExerciseData = QuizExerciseData | PlayCardExerciseData | MiniDealExerciseData | DiscardExerciseData;

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  steps: TheoryStep[];
  exercises: ExerciseData[];
  /** Ile zadań losować z puli; brak = wszystkie po kolei. */
  drawCount?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  modules: CourseModule[];
}
```

- [ ] **Step 2: Napisz test `verify.ts`**

```ts
// src/content/verify.test.ts
import { describe, expect, it } from 'vitest';
import type { QuizExerciseData } from './types';
import { verifyQuiz } from './verify';

const quiz = (overrides: Partial<QuizExerciseData>): QuizExerciseData => ({
  type: 'quiz', id: 'q', prompt: 'P', explain: 'E', correct: 'a',
  options: [{ id: 'a', text: '?' }, { id: 'b', text: '?' }],
  ...overrides,
});

const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;

describe('verifyQuiz', () => {
  it('matadory w postaci z/bez', () => {
    const q = quiz({ cards: [...HEARTS_WITH_2], verify: { kind: 'matadors', game: { kind: 'suit', trump: 'h' } } });
    expect(verifyQuiz({ ...q, options: [{ id: 'a', text: 'Z 2', value: 'z2' }, { id: 'b', text: 'x' }] })).toEqual([]);
    expect(verifyQuiz({ ...q, options: [{ id: 'a', text: 'Z 3', value: 'z3' }, { id: 'b', text: 'x' }] })).toEqual([
      'poprawna odpowiedź powinna wynosić z2',
    ]);
  });

  it('górna granica licytacji i kolejna stawka', () => {
    expect(
      verifyQuiz(quiz({ cards: [...HEARTS_WITH_2], options: [{ id: 'a', text: '30' }, { id: 'b', text: '20' }], verify: { kind: 'maxBid', game: { kind: 'suit', trump: 'h' } } })),
    ).toEqual([]);
    expect(verifyQuiz(quiz({ options: [{ id: 'a', text: '27' }, { id: 'b', text: '25' }], verify: { kind: 'nextBid', after: 24 } }))).toEqual([]);
    expect(verifyQuiz(quiz({ options: [{ id: 'a', text: '25' }, { id: 'b', text: '27' }], verify: { kind: 'nextBid', after: 24 } }))).toEqual([
      'poprawna odpowiedź powinna wynosić 27',
    ]);
  });

  it('rozliczenie: wartość, wynik i punkty turniejowe', () => {
    const base = {
      cards: [...HEARTS_WITH_2],
      verify: {
        kind: 'settle' as const,
        declaration: { game: { kind: 'suit' as const, trump: 'h' as const }, hand: false, announce: 'none' as const },
        outcome: { declarerPoints: 55, declarerTricks: 4 },
        result: 'score' as const,
      },
    };
    expect(verifyQuiz(quiz({ ...base, options: [{ id: 'a', text: '−60', value: '-60' }, { id: 'b', text: 'x' }] }))).toEqual([]);
    expect(
      verifyQuiz(quiz({ ...base, verify: { ...base.verify, result: 'tournament' }, options: [{ id: 'a', text: '−110', value: '-110' }, { id: 'b', text: 'x' }] })),
    ).toEqual([]);
  });

  it('błędne dane są zgłaszane zamiast rzucać wyjątek', () => {
    expect(verifyQuiz(quiz({ verify: { kind: 'matadors', game: { kind: 'suit', trump: 'h' } } }))).toEqual(['verify matadors wymaga kart w pytaniu']);
    const bad = quiz({
      cards: [...HEARTS_WITH_2],
      verify: { kind: 'settle', declaration: { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'schwarz' }, outcome: { declarerPoints: 120, declarerTricks: 10 }, result: 'value' },
    });
    expect(verifyQuiz(bad)[0]).toMatch(/błąd sprawdzania/);
  });
});
```

- [ ] **Step 3: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/content/verify.test.ts`
Expected: FAIL — „Failed to resolve import "./verify"”.

- [ ] **Step 4: Zaimplementuj `src/content/verify.ts`**

```ts
// src/content/verify.ts
import { matadors, maxBidFor, nextBid, settle, sumPoints, tournamentPoints, trickWinner, type CardId } from '../engine';
import type { QuizExerciseData } from './types';

/** Problemy z odpowiedzią quizu sprawdzaną silnikiem (pusta lista = OK). */
export function verifyQuiz(quiz: QuizExerciseData): string[] {
  const verify = quiz.verify;
  const correct = quiz.options.find((option) => option.id === quiz.correct);
  if (!verify || !correct) return [];
  const answer = correct.value ?? correct.text;
  const expect = (expected: string) => (answer === expected ? [] : [`poprawna odpowiedź powinna wynosić ${expected}`]);
  const needCards = (): string[] | null => (quiz.cards ? null : [`verify ${verify.kind} wymaga kart w pytaniu`]);

  try {
    switch (verify.kind) {
      case 'points':
        return needCards() ?? expect(String(sumPoints(quiz.cards!)));
      case 'trickWinner': {
        const cards = quiz.options.map((option) => option.card);
        if (cards.length !== 3 || cards.some((card) => card === undefined)) {
          return ['verify trickWinner wymaga dokładnie 3 odpowiedzi-kart'];
        }
        const trick = cards as CardId[];
        if (new Set(trick).size !== 3) return ['karty w odpowiedziach muszą być różne'];
        const winner = trick[trickWinner(trick, verify.game)];
        return correct.card === winner ? [] : [`lewę bierze ${winner}, a nie ${correct.card}`];
      }
      case 'matadors': {
        if (!quiz.cards) return needCards()!;
        const m = matadors(quiz.cards, verify.game);
        return expect(`${m.with ? 'z' : 'bez'}${m.count}`);
      }
      case 'maxBid':
        return needCards() ?? expect(String(maxBidFor(quiz.cards!, verify.game, verify.hand)));
      case 'nextBid': {
        const next = nextBid(verify.after);
        return next === null ? [`brak stawki po ${verify.after}`] : expect(String(next));
      }
      case 'settle': {
        if (verify.declaration.game.kind !== 'null' && !quiz.cards) return needCards()!;
        const s = settle({ declaration: verify.declaration, declarerCards: quiz.cards ?? [], outcome: verify.outcome, bid: verify.bid });
        const result = verify.result === 'value' ? s.value : verify.result === 'score' ? s.score : tournamentPoints(s).declarer;
        return expect(String(result));
      }
    }
  } catch (error) {
    return [`błąd sprawdzania: ${(error as Error).message}`];
  }
}
```

- [ ] **Step 5: Dopisz test walidacji ćwiczenia „do skata”**

W `src/content/validate.test.ts` (wewnątrz `describe`), z importem typu `DiscardExerciseData` dopisanym do istniejącego `import type { … } from './types';`:

```ts
  it('ćwiczenie „do skata”: 12 kart i poprawne pary', () => {
    const discard: DiscardExerciseData = {
      type: 'discard', id: 'k1', prompt: 'P', explain: 'E', game: { kind: 'suit', trump: 'h' },
      cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 'c-K', 's-10', 's-9', 'd-8'],
      best: [['s-10', 's-9']],
    };
    expect(validateCourse(courseWith(lessonWith([discard])))).toEqual([]);
    expect(validateCourse(courseWith(lessonWith([{ ...discard, best: [['s-10', 'd-A']] }])))).toEqual([
      'l1/k1: karta d-A z pary nie jest w ręce',
    ]);
    expect(validateCourse(courseWith(lessonWith([{ ...discard, cards: discard.cards.slice(1) }])))).toContain(
      'l1/k1: do wyrzucania potrzeba 12 kart (ręka + skat)',
    );
  });
```

- [ ] **Step 6: Zastąp `src/content/validate.ts`**

```ts
// src/content/validate.ts
import { isLegalMove, type CardId } from '../engine';
import { findTextIssues } from '../glossary';
import { simulateMiniDeal } from './miniDeal';
import type {
  Course,
  DiscardExerciseData,
  ExerciseData,
  MiniDealExerciseData,
  PlayCardExerciseData,
  QuizExerciseData,
} from './types';
import { verifyQuiz } from './verify';

type Report = (message: string) => void;
type CheckText = (text: string | undefined) => void;

/** Lista problemów w treści kursu (pusta = OK). Uruchamiana w teście `course.test.ts`. */
export function validateCourse(course: Course): string[] {
  const issues: string[] = [];
  const moduleIds = new Set<string>();
  const lessonIds = new Set<string>();
  const exerciseIds = new Set<string>();

  const checkText = (where: string, text: string | undefined) => {
    if (text === undefined) return;
    for (const issue of findTextIssues(text)) issues.push(`${where}: ${issue}`);
  };

  for (const module of course.modules) {
    if (moduleIds.has(module.id)) issues.push(`Powtórzony moduł: ${module.id}`);
    moduleIds.add(module.id);
    checkText(module.id, module.title);
    if (module.lessons.length === 0) issues.push(`${module.id}: moduł bez lekcji`);

    for (const lesson of module.lessons) {
      if (lessonIds.has(lesson.id)) issues.push(`Powtórzona lekcja: ${lesson.id}`);
      lessonIds.add(lesson.id);
      checkText(lesson.id, lesson.title);
      checkText(lesson.id, lesson.summary);

      lesson.steps.forEach((step, i) => {
        const where = `${lesson.id} krok ${i + 1}`;
        checkText(where, step.title);
        checkText(where, step.text);
        checkText(where, step.cardsCaption);
        if (step.cards) checkUnique(step.cards, (m) => issues.push(`${where}: ${m}`));
      });

      if (lesson.exercises.length === 0) issues.push(`${lesson.id}: brak ćwiczeń`);
      if (lesson.drawCount !== undefined && (lesson.drawCount < 1 || lesson.drawCount > lesson.exercises.length)) {
        issues.push(`${lesson.id}: drawCount poza zakresem`);
      }

      for (const exercise of lesson.exercises) {
        if (exerciseIds.has(exercise.id)) issues.push(`Powtórzone ćwiczenie: ${exercise.id}`);
        exerciseIds.add(exercise.id);
        const where = `${lesson.id}/${exercise.id}`;
        const report: Report = (m) => issues.push(`${where}: ${m}`);
        checkText(where, exercise.prompt);
        checkText(where, exercise.explain);
        validateExercise(exercise, report, (text) => checkText(where, text));
      }
    }
  }
  return issues;
}

function validateExercise(exercise: ExerciseData, report: Report, checkText: CheckText) {
  switch (exercise.type) {
    case 'quiz':
      return validateQuiz(exercise, report, checkText);
    case 'playCard':
      return validatePlayCard(exercise, report, checkText);
    case 'miniDeal':
      return validateMiniDeal(exercise, report);
    case 'discard':
      return validateDiscard(exercise, report, checkText);
    default: {
      const unknown: never = exercise;
      report(`nieznany typ ćwiczenia: ${(unknown as { type: string }).type}`);
    }
  }
}

function validateQuiz(quiz: QuizExerciseData, report: Report, checkText: CheckText) {
  if (quiz.options.length < 2) report('quiz potrzebuje co najmniej 2 odpowiedzi');
  const ids = new Set<string>();
  for (const option of quiz.options) {
    if (ids.has(option.id)) report(`powtórzona odpowiedź ${option.id}`);
    ids.add(option.id);
    if ((option.text === undefined) === (option.card === undefined)) {
      report(`odpowiedź ${option.id} musi mieć tekst albo kartę`);
    }
    checkText(option.text);
  }
  if (!ids.has(quiz.correct)) report(`poprawna odpowiedź „${quiz.correct}” nie istnieje`);
  if (quiz.cards) checkUnique(quiz.cards, report);
  verifyQuiz(quiz).forEach(report);
}

function validatePlayCard(ex: PlayCardExerciseData, report: Report, checkText: CheckText) {
  if (ex.hand.length < 1 || ex.hand.length > 10) report('ręka musi mieć od 1 do 10 kart');
  if (ex.trick.length > 2) report('na stole mogą leżeć najwyżej 2 karty');
  checkUnique([...ex.trick, ...ex.hand], report);
  if (ex.mode === 'best') {
    if (!ex.best || ex.best.length === 0) report('tryb best wymaga listy najlepszych kart');
    for (const card of ex.best ?? []) {
      if (!ex.hand.includes(card)) report(`najlepsza karta ${card} nie jest w ręce`);
      else if (!isLegalMove(card, ex.hand, ex.trick, ex.game)) report(`najlepsza karta ${card} jest niedozwolona`);
    }
  }
  for (const [card, text] of Object.entries(ex.wrongExplain ?? {})) {
    if (!ex.hand.includes(card as CardId)) report(`wrongExplain dla karty spoza ręki: ${card}`);
    checkText(text);
  }
}

function validateMiniDeal(ex: MiniDealExerciseData, report: Report) {
  const size = ex.hands[0].length;
  if (size < 1 || size > 10 || ex.hands.some((hand) => hand.length !== size)) {
    report('ręce muszą mieć tyle samo kart (1–10)');
  }
  if (ex.skat.length > 2) report('skat ma najwyżej 2 karty');
  if (ex.goal.kind === 'win' && size !== 10) report('cel „win” wymaga pełnego rozdania (10 kart)');
  checkUnique([...ex.hands.flat(), ...ex.skat], report);
  if (ex.scripts?.[ex.you]) report('gracz nie może mieć skryptu');
  for (const seat of [0, 1, 2] as const) {
    for (const card of ex.scripts?.[seat] ?? []) {
      if (!ex.hands[seat].includes(card)) report(`skrypt gracza ${seat}: karty ${card} nie ma w ręce`);
    }
  }
  const outcome = simulateMiniDeal(ex);
  if (outcome.error) report(outcome.error);
  else if (!outcome.goalReached) report('wzorcowe rozegranie nie osiąga celu');
}

function validateDiscard(ex: DiscardExerciseData, report: Report, checkText: CheckText) {
  if (ex.cards.length !== 12) report('do wyrzucania potrzeba 12 kart (ręka + skat)');
  checkUnique(ex.cards, report);
  if (ex.best.length === 0) report('brak dobrych par do wyrzucenia');
  for (const pair of ex.best) {
    if (pair.length !== 2 || pair[0] === pair[1]) report(`zła para: ${pair.join(', ')}`);
    for (const card of pair) if (!ex.cards.includes(card)) report(`karta ${card} z pary nie jest w ręce`);
  }
  checkText(ex.wrongExplain);
}

function checkUnique(cards: readonly CardId[], report: Report) {
  const seen = new Set<CardId>();
  for (const card of cards) {
    if (seen.has(card)) report(`karta ${card} występuje więcej niż raz`);
    seen.add(card);
  }
}
```

- [ ] **Step 7: Uruchom testy**

Run: `npx vitest run src/content && npm test && npm run typecheck`
Expected: PASS. Dotychczasowe testy walidatora dla `verify points/trickWinner` zwracają te same komunikaty. `ExerciseView` nie ma jeszcze przypadku `discard`: zwraca wtedy `undefined`, co TypeScript akceptuje. Task 5 to uzupełni.

- [ ] **Step 8: Commit**

```bash
git add src/content
git commit -m "feat(content): quizy sprawdzane wyceną i licytacją, ćwiczenie do skata" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Ćwiczenie „wybierz 2 karty do skata”

**Files:**
- Create: `src/exercises/evaluateDiscard.ts`, `src/exercises/DiscardExercise.tsx`
- Modify: `src/exercises/ExerciseView.tsx`, `src/styles.css`
- Test: `src/exercises/DiscardExercise.test.tsx`

- [ ] **Step 1: Napisz test**

```tsx
// src/exercises/DiscardExercise.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DiscardExerciseData } from '../content/types';
import { renderWithProviders } from '../test/render';
import { DiscardExercise } from './DiscardExercise';
import { isBestDiscard } from './evaluateDiscard';

const exercise: DiscardExerciseData = {
  type: 'discard',
  id: 't-k1',
  prompt: 'Wybierz 2 karty.',
  game: { kind: 'suit', trump: 'h' },
  cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 'c-K', 's-10', 's-9', 'd-8'],
  best: [['s-10', 's-9'], ['s-10', 'd-8']],
  explain: 'Wyjaśnienie.',
};

describe('isBestDiscard', () => {
  it('para w dowolnej kolejności', () => {
    expect(isBestDiscard(exercise, ['s-9', 's-10'])).toBe(true);
    expect(isBestDiscard(exercise, ['d-8', 's-10'])).toBe(true);
    expect(isBestDiscard(exercise, ['d-8', 's-9'])).toBe(false);
  });
});

describe('DiscardExercise', () => {
  it('dobra para: ocena, oczka w skacie, wyjaśnienie', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<DiscardExercise exercise={exercise} onAnswered={onAnswered} />);
    const confirm = screen.getByRole('button', { name: 'Wyrzuć do skata' });
    expect(confirm).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'dziesiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'dziewiątka zielona' }));
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Do skata trafia 10 oczek.')).toBeInTheDocument();
    expect(screen.getByText('Wyjaśnienie.')).toBeInTheDocument();
  });

  it('najwyżej 2 karty; ponowne kliknięcie odznacza', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DiscardExercise exercise={exercise} onAnswered={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'dziesiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'dziewiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'ósemka dzwonkowa' }));
    expect(screen.getByRole('button', { name: 'ósemka dzwonkowa' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'dziewiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'ósemka dzwonkowa' }));
    expect(screen.getByRole('button', { name: 'ósemka dzwonkowa' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('zła para: podpowiedź lepszego wyboru', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<DiscardExercise exercise={exercise} onAnswered={onAnswered} />);
    await user.click(screen.getByRole('button', { name: 'as żołędny' }));
    await user.click(screen.getByRole('button', { name: 'król żołędny' }));
    await user.click(screen.getByRole('button', { name: 'Wyrzuć do skata' }));
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText('Lepszy wybór: dziesiątka zielona i dziewiątka zielona.')).toBeInTheDocument();
    expect(screen.getByText('Do skata trafia 15 oczek.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/exercises/DiscardExercise.test.tsx`
Expected: FAIL — brak modułów.

- [ ] **Step 3: Zaimplementuj ocenę i komponent**

```ts
// src/exercises/evaluateDiscard.ts
import type { CardId } from '../engine';
import type { DiscardExerciseData } from '../content/types';

export function isBestDiscard(exercise: DiscardExerciseData, pair: readonly CardId[]): boolean {
  return pair.length === 2 && exercise.best.some((best) => best.length === 2 && best.every((card) => pair.includes(card)));
}
```

```tsx
// src/exercises/DiscardExercise.tsx
import { useMemo, useState } from 'react';
import { PlayingCard } from '../cards/PlayingCard';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import type { DiscardExerciseData } from '../content/types';
import { sortHand, sumPoints, type CardId } from '../engine';
import { countCase } from '../glossary';
import { useText } from '../state/AppStateContext';
import { isBestDiscard } from './evaluateDiscard';
import { GameBanner } from './GameBanner';

interface Props {
  exercise: DiscardExerciseData;
  onAnswered: (correct: boolean) => void;
}

export function DiscardExercise({ exercise, onAnswered }: Props) {
  const t = useText();
  const cards = useMemo(() => sortHand(exercise.cards, exercise.game), [exercise]);
  const [selected, setSelected] = useState<CardId[]>([]);
  const [done, setDone] = useState(false);

  const toggle = (card: CardId) => {
    if (done) return;
    setSelected((current) => {
      if (current.includes(card)) return current.filter((c) => c !== card);
      return current.length < 2 ? [...current, card] : current;
    });
  };

  const confirm = () => {
    if (done || selected.length !== 2) return;
    setDone(true);
    onAnswered(isBestDiscard(exercise, selected));
  };

  const correct = done && isBestDiscard(exercise, selected);
  const points = sumPoints(selected);
  const [bestA, bestB] = exercise.best[0];

  return (
    <section className="exercise">
      <div className="exercise__prompt">
        <RichText text={exercise.prompt} />
      </div>
      <GameBanner game={exercise.game} />
      <ul className="card-row" aria-label="Twoje karty">
        {cards.map((card) => (
          <li key={card}>
            <PlayingCard card={card} selected={selected.includes(card)} disabled={done} onClick={() => toggle(card)} />
          </li>
        ))}
      </ul>
      {!done && <p className="hint">Wybrane: {selected.length} z 2.</p>}
      <div className="exercise__actions">
        <button type="button" className="button button--primary" disabled={done || selected.length !== 2} onClick={confirm}>
          {t('Wyrzuć do [[skat:D]]')}
        </button>
      </div>
      <div className="feedback-region" role="status">
        {done && (
          <Feedback correct={correct}>
            <p>{t(`Do [[skat:D]] trafia ${points} [[oczko:${countCase(points)}]].`)}</p>
            {!correct && <RichText text={`Lepszy wybór: [[card:${bestA}]] i [[card:${bestB}]].`} />}
            {!correct && exercise.wrongExplain && <RichText text={exercise.wrongExplain} />}
            <RichText text={exercise.explain} />
          </Feedback>
        )}
      </div>
    </section>
  );
}
```

W `src/exercises/ExerciseView.tsx` dodaj import `import { DiscardExercise } from './DiscardExercise';` i przypadek:

```tsx
    case 'discard':
      return <DiscardExercise exercise={exercise} onAnswered={onAnswered} />;
```

W `src/styles.css` (przed `@media (min-width: 600px)`) dopisz:

```css
.exercise__actions { display: flex; justify-content: center; margin-top: 12px; }
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/exercises && npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/exercises src/styles.css
git commit -m "feat(exercises): ćwiczenie wyboru kart do skata" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Lekcje 12–14 (moduł 3, część 1)

**Files:**
- Create: `src/content/lessons/m3-l12-wartosc-bazowa.ts`, `src/content/lessons/m3-l13-matadory.ts`, `src/content/lessons/m3-l14-poziomy.ts`
- Modify: `src/content/course.ts`

Test treści (`src/content/course.test.ts`) sprawdza tokeny i każdą odpowiedź z `verify` silnikiem. Zgłoszony problem napraw w treści (albo punktowo w słowniku) i opisz w raporcie. Nie osłabiaj walidacji.

- [ ] **Step 1: Lekcja 12**

```ts
// src/content/lessons/m3-l12-wartosc-bazowa.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm3-l12-wartosc-bazowa',
  title: 'Wartość bazowa gry',
  summary: 'Ile jest warta gra? Zaczynamy od wartości bazowej.',
  steps: [
    {
      title: 'Jak liczy się wartość gry?',
      text:
        'Wynik rozdania to nie tylko wygrana czy przegrana. Każda gra ma **wartość**, którą liczy się tak:\n\n' +
        '**wartość bazowa × mnożnik**\n\n' +
        'W tym module poznasz obie części. Zaczynamy od wartości bazowej.',
    },
    {
      title: 'Wartości bazowe',
      text:
        '[[GraKolorowa]] — zależy od koloru [[atu:Dlm]]:\n\n' +
        '**[[suit:d]] 9 · [[suit:h]] 10 · [[suit:s]] 11 · [[suit:c]] 12**\n\n' +
        '**[[Grand]] — 24.**\n\n' +
        'Kolejność jest taka sama jak starszeństwo kolorów, które już znasz.',
      cards: ['d-A', 'h-A', 's-A', 'c-A'],
      cardsCaption: 'Od najtańszego do najdroższego koloru [[atu:Dlm]].',
    },
    {
      title: '[[Null]] to wyjątek',
      text: '[[Null]] ma stałą wartość, bez mnożnika — poznasz ją w lekcji 15.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l12-q1',
      prompt: '[[GraKolorowa]], [[atu]]: [[suit:h]]. Jaka jest wartość bazowa?',
      options: [
        { id: 'a', text: '9' },
        { id: 'b', text: '10' },
        { id: 'c', text: '11' },
        { id: 'd', text: '12' },
      ],
      correct: 'b',
      explain: 'Kolor [[suit:h]] ma wartość bazową 10.',
    },
    {
      type: 'quiz',
      id: 'm3-l12-q2',
      prompt: 'Który kolor [[atu:Dlm]] ma najwyższą wartość bazową?',
      options: [
        { id: 'a', text: '[[Suit:c]]' },
        { id: 'b', text: '[[Suit:s]]' },
        { id: 'c', text: '[[Suit:h]]' },
        { id: 'd', text: '[[Suit:d]]' },
      ],
      correct: 'a',
      explain: '[[Suit:c]] — 12. Najtańszy jest kolor [[suit:d]] — 9.',
    },
    {
      type: 'quiz',
      id: 'm3-l12-q3',
      prompt: 'Ile wynosi wartość bazowa [[grand:D]]?',
      options: [
        { id: 'a', text: '12' },
        { id: 'b', text: '20' },
        { id: 'c', text: '24' },
      ],
      correct: 'c',
      explain: '[[Grand]] ma wartość bazową 24 — dwa razy więcej niż najdroższy kolor.',
    },
    {
      type: 'quiz',
      id: 'm3-l12-q4',
      prompt: '[[GraKolorowa]], [[atu]]: [[suit:s]]. Jaka jest wartość bazowa?',
      options: [
        { id: 'a', text: '9' },
        { id: 'b', text: '11' },
        { id: 'c', text: '12' },
      ],
      correct: 'b',
      explain: 'Kolor [[suit:s]] ma wartość bazową 11.',
    },
    {
      type: 'quiz',
      id: 'm3-l12-q5',
      prompt: '[[Atu]] to [[suit:d]], a mnożnik wynosi 3. Ile jest warta gra?',
      options: [
        { id: 'a', text: '27' },
        { id: 'b', text: '30' },
        { id: 'c', text: '36' },
      ],
      correct: 'a',
      explain: '9 × 3 = 27.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 13**

```ts
// src/content/lessons/m3-l13-matadory.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const GRAND: GameType = { kind: 'grand' };
const ASK = 'Z iloma [[matador:Nlm]] grasz?';

export const lesson: Lesson = {
  id: 'm3-l13-matadory',
  title: '[[Matador:Mlm]]',
  summary: '„[[Mit]] ilu” i „[[ohne]] ilu” — podstawa mnożnika.',
  steps: [
    {
      title: 'Czym są [[matador:Mlm]]?',
      text:
        '**[[Matador:Mlm]]** to najwyższe [[atu:Mlm]] liczone od samej góry, bez przerwy: [[card:c-J]], [[card:s-J]], [[card:h-J]], [[card:d-J]], potem [[as]], 10, [[krol]]… koloru [[atu:Dlm]].\n\n' +
        'Liczy się karty [[rozgrywajacy:D]] **razem ze [[skat:N]]**.',
    },
    {
      title: '„[[Mit]] ilu”',
      text:
        'Jeśli masz [[card:c-J:B]], liczysz, ile kolejnych najwyższych [[atu:Dlm]] masz bez przerwy. ' +
        'Masz [[card:c-J:B]] i [[card:s-J:B]], ale brakuje [[card:h-J:D]]? Grasz **[[mit]] 2**.',
      cards: ['c-J', 's-J', 'd-J'],
      cardsCaption: '[[Mit]] 2 — brakuje [[card:h-J:D]].',
    },
    {
      title: '„[[Ohne]] ilu”',
      text:
        'Jeśli **nie masz** [[card:c-J:D]], liczysz, ilu najwyższych [[atu:Dlm]] brakuje ci od góry. ' +
        'Pierwszy, jakiego masz, to [[card:h-J]]? Grasz **[[ohne]] 2**.\n\n' +
        'W obu przypadkach **mnożnik = [[matador:Mlm]] + 1** (za samą grę), więc [[mit]] 2 i [[ohne]] 2 dają ten sam mnożnik: 3.\n\n' +
        'W [[grand:Ms]] [[matador:Mlm]] to tylko [[walet:Mlm]] — najwyżej 4.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l13-q1',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      cards: ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'],
      options: [
        { id: 'a', text: '[[Mit]] 1', value: 'z1' },
        { id: 'b', text: '[[Mit]] 2', value: 'z2' },
        { id: 'c', text: '[[Ohne]] 2', value: 'bez2' },
      ],
      correct: 'b',
      verify: { kind: 'matadors', game: HEARTS },
      explain: 'Masz [[card:c-J:B]] i [[card:s-J:B]], brakuje [[card:h-J:D]] — to [[mit]] 2, mnożnik 3.',
    },
    {
      type: 'quiz',
      id: 'm3-l13-q2',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      cards: ['h-J', 'd-J', 'h-A', 'h-K', 'h-9', 'c-A', 'c-K', 's-A', 's-10', 's-9', 'd-A', 'd-10'],
      options: [
        { id: 'a', text: '[[Mit]] 2', value: 'z2' },
        { id: 'b', text: '[[Ohne]] 2', value: 'bez2' },
        { id: 'c', text: '[[Ohne]] 3', value: 'bez3' },
      ],
      correct: 'b',
      verify: { kind: 'matadors', game: HEARTS },
      explain: 'Brakuje [[card:c-J:D]] i [[card:s-J:D]], a [[card:h-J:B]] masz — to [[ohne]] 2, mnożnik 3.',
    },
    {
      type: 'quiz',
      id: 'm3-l13-q3',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:c]]. ${ASK}`,
      cards: ['c-J', 's-J', 'h-J', 'd-J', 'c-A', 'c-10', 'c-K', 'c-9', 's-A', 'h-A', 'h-10', 'd-7'],
      options: [
        { id: 'a', text: '[[Mit]] 4', value: 'z4' },
        { id: 'b', text: '[[Mit]] 6', value: 'z6' },
        { id: 'c', text: '[[Mit]] 7', value: 'z7' },
      ],
      correct: 'c',
      verify: { kind: 'matadors', game: CLUBS },
      explain:
        'Cztery [[walet:Mlm]], a potem [[as]], 10 i [[krol]] koloru [[suit:c]] — ciąg przerywa brak [[dama:D]]. To [[mit]] 7.',
    },
    {
      type: 'quiz',
      id: 'm3-l13-q4',
      prompt: `[[Grand]]. ${ASK}`,
      cards: ['c-J', 's-J', 'd-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-K', 'd-A', 'd-10', 'd-9'],
      options: [
        { id: 'a', text: '[[Mit]] 2', value: 'z2' },
        { id: 'b', text: '[[Mit]] 3', value: 'z3' },
        { id: 'c', text: '[[Ohne]] 1', value: 'bez1' },
      ],
      correct: 'a',
      verify: { kind: 'matadors', game: GRAND },
      explain: 'W [[grand:Ms]] liczą się tylko [[walet:Mlm]]: masz dwa najwyższe, brakuje [[card:h-J:D]].',
    },
    {
      type: 'quiz',
      id: 'm3-l13-q5',
      prompt: '[[Atu]]: [[suit:s]], [[mit]] 3. Ile jest warta wygrana gra (bez dodatków)?',
      options: [
        { id: 'a', text: '33' },
        { id: 'b', text: '44' },
        { id: 'c', text: '36' },
      ],
      correct: 'b',
      explain: '[[Mit]] 3 → mnożnik 3 + 1 = 4. 11 × 4 = 44.',
    },
  ],
};
```

- [ ] **Step 3: Lekcja 14**

```ts
// src/content/lessons/m3-l14-poziomy.ts
import type { Announcement, Declaration, GameType } from '../../engine';
import type { Lesson } from '../types';

const decl = (game: GameType, hand = false, announce: Announcement = 'none'): Declaration => ({ game, hand, announce });
const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const DIAMONDS: GameType = { kind: 'suit', trump: 'd' };
const GRAND: GameType = { kind: 'grand' };
const ASK = 'Ile jest warta gra?';

const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;

export const lesson: Lesson = {
  id: 'm3-l14-poziomy',
  title: 'Mnożnik: [[reka]], [[krawiec]], [[czarny]]',
  summary: 'Kolejne poziomy podnoszą wartość gry.',
  steps: [
    {
      title: 'Z czego składa się mnożnik',
      text:
        'Do [[matador:Dlm]] dodaje się kolejne poziomy, każdy **+1**:\n\n' +
        '**gra** (zawsze) · **[[reka]]** (bez podnoszenia [[skat:D]]) · **[[krawiec]]** · **[[krawiec]] zapowiedziany** · **[[czarny]]** · **[[czarny]] zapowiedziany** · **[[otwarta]]**',
    },
    {
      title: '[[Krawiec]] i [[czarny]]',
      text:
        '**[[Krawiec]]**: jedna strona ma 90 [[oczko:Dlm]] lub więcej (druga najwyżej 30).\n\n' +
        '**[[Czarny]]**: jedna strona bierze wszystkie [[lewa:Blm]].\n\n' +
        'Oba poziomy liczą się także wtedy, gdy to [[rozgrywajacy]] przegrywa tak wysoko.',
    },
    {
      title: 'Zapowiedzi',
      text:
        'Zapowiedzieć [[krawiec:B]] albo [[czarny:B]] można tylko w [[reka:Ms]]. Zapowiedź dodaje swój poziom, ale jeśli się nie uda — gra jest przegrana. ' +
        'Zapowiedź [[czarny:D]] zawiera też zapowiedź [[krawiec:D]].\n\n' +
        '[[Otwarta]] (karty odkryte na stole) oznacza zapowiedź [[czarny:D]] i daje jeszcze jeden poziom.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l14-q1',
      prompt: `[[Atu]]: [[suit:h]], [[mit]] 2. [[Rozgrywajacy]] wygrywa, mając 75 [[oczko:Dlm]]. ${ASK}`,
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '20' },
        { id: 'b', text: '30' },
        { id: 'c', text: '40' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: decl(HEARTS), outcome: { declarerPoints: 75, declarerTricks: 6 }, result: 'value' },
      explain: 'Mnożnik: 2 ([[matador:Mlm]]) + 1 (gra) = 3. 10 × 3 = 30.',
    },
    {
      type: 'quiz',
      id: 'm3-l14-q2',
      prompt: `Te same karty, ale tym razem to [[reka]]: [[atu]] [[suit:h]], [[mit]] 2, wygrana z 70 [[oczko:Nlm]]. ${ASK}`,
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '30' },
        { id: 'b', text: '40' },
        { id: 'c', text: '50' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: decl(HEARTS, true), outcome: { declarerPoints: 70, declarerTricks: 6 }, result: 'value' },
      explain: '2 + 1 (gra) + 1 ([[reka]]) = 4. 10 × 4 = 40.',
    },
    {
      type: 'quiz',
      id: 'm3-l14-q3',
      prompt: `[[Atu]]: [[suit:c]], [[mit]] 1. [[Rozgrywajacy]] zdobył 95 [[oczko:Dlm]]. ${ASK}`,
      cards: ['c-J', 'h-J', 'c-A', 'c-10', 'c-K', 'c-Q', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'd-7'],
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '36' },
        { id: 'c', text: '48' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: decl(CLUBS), outcome: { declarerPoints: 95, declarerTricks: 8 }, result: 'value' },
      explain: '95 [[oczko:Dlm]] to [[krawiec]]: 1 + 1 (gra) + 1 ([[krawiec]]) = 3. 12 × 3 = 36.',
    },
    {
      type: 'quiz',
      id: 'm3-l14-q4',
      prompt: `[[Grand]], [[mit]] 2. [[Rozgrywajacy]] wziął wszystkie [[lewa:Blm]]. ${ASK}`,
      cards: ['c-J', 's-J', 'd-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-K', 'd-A', 'd-10', 'd-9'],
      options: [
        { id: 'a', text: '72' },
        { id: 'b', text: '96' },
        { id: 'c', text: '120' },
      ],
      correct: 'c',
      verify: { kind: 'settle', declaration: decl(GRAND), outcome: { declarerPoints: 120, declarerTricks: 10 }, result: 'value' },
      explain: '2 + 1 (gra) + 1 ([[krawiec]]) + 1 ([[czarny]]) = 5. 24 × 5 = 120.',
    },
    {
      type: 'quiz',
      id: 'm3-l14-q5',
      prompt: `[[Atu]]: [[suit:d]], [[ohne]] 1, [[reka]] z zapowiedzianym [[krawiec:N]]. [[Rozgrywajacy]] zdobył 92 [[oczko:Dlm]]. ${ASK}`,
      cards: ['s-J', 'h-J', 'd-A', 'd-10', 'd-K', 'd-Q', 'd-9', 'c-A', 'c-10', 's-A', 'h-A', 'h-10'],
      options: [
        { id: 'a', text: '36' },
        { id: 'b', text: '45' },
        { id: 'c', text: '54' },
      ],
      correct: 'b',
      verify: {
        kind: 'settle',
        declaration: decl(DIAMONDS, true, 'schneider'),
        outcome: { declarerPoints: 92, declarerTricks: 8 },
        result: 'value',
      },
      explain: '1 ([[matador:Mlm]]) + gra + [[reka]] + [[krawiec]] + zapowiedź = 5. 9 × 5 = 45.',
    },
  ],
};
```

- [ ] **Step 4: Dodaj moduł 3 do kursu**

W `src/content/course.ts` dodaj importy `l12`, `l13`, `l14` z powyższych plików i po module `m2` dopisz:

```ts
    { id: 'm3', title: 'Wartość gry', lessons: [l12, l13, l14] },
```

- [ ] **Step 5: Uruchom testy treści**

Run: `npx vitest run src/content && npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat(content): lekcje 12–14 — wartość bazowa, matadory, poziomy" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Lekcje 15–16 (moduł 3, część 2)

**Files:**
- Create: `src/content/lessons/m3-l15-null.ts`, `src/content/lessons/m3-l16-przegrana.ts`
- Modify: `src/content/course.ts`

- [ ] **Step 1: Lekcja 15**

```ts
// src/content/lessons/m3-l15-null.ts
import type { Announcement, Declaration } from '../../engine';
import type { Lesson } from '../types';

const nullDecl = (hand: boolean, announce: Announcement = 'none'): Declaration => ({ game: { kind: 'null' }, hand, announce });
const WON = { declarerPoints: 0, declarerTricks: 0 };

export const lesson: Lesson = {
  id: 'm3-l15-null',
  title: 'Wartość [[null:D]]',
  summary: 'Cztery stałe wartości: 23, 35, 46, 59.',
  steps: [
    {
      title: 'Stałe wartości',
      text:
        '[[Null]] nie ma [[matador:Dlm]] ani mnożnika — ma stałą wartość:\n\n' +
        '**[[Null]]** 23 · **{null z ręki|nul hand}** 35 · **{null otwarty|nul uwert}** 46 · **{null otwarty z ręki|nul uwert hand}** 59',
    },
    {
      title: '{Null otwarty|Nul uwert}',
      text:
        '[[Rozgrywajacy]] kładzie wszystkie swoje karty odkryte na stół, zanim padnie pierwsza karta. ' +
        '[[Obronca:Mlm]] widzą jego rękę — dlatego ta gra jest warta więcej.',
    },
    {
      title: 'Kiedy [[null]]?',
      text:
        '[[Null]] gra się z ręką pełną niskich kart: siódemek, ósemek, dziewiątek. Wysokie karty — zwłaszcza [[as:Mlm]] — są groźne, bo mogą wziąć [[lewa:B]]. Więcej o tym w module 5.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l15-q1',
      prompt: 'Ile jest wart [[null]]?',
      options: [
        { id: 'a', text: '23' },
        { id: 'b', text: '24' },
        { id: 'c', text: '35' },
      ],
      correct: 'a',
      verify: { kind: 'settle', declaration: nullDecl(false), outcome: WON, result: 'value' },
      explain: 'Zwykły [[null]] jest wart 23.',
    },
    {
      type: 'quiz',
      id: 'm3-l15-q2',
      prompt: 'Ile jest wart {null z ręki|nul hand}?',
      options: [
        { id: 'a', text: '35' },
        { id: 'b', text: '46' },
        { id: 'c', text: '59' },
      ],
      correct: 'a',
      verify: { kind: 'settle', declaration: nullDecl(true), outcome: WON, result: 'value' },
      explain: '{Null z ręki|Nul hand} jest wart 35.',
    },
    {
      type: 'quiz',
      id: 'm3-l15-q3',
      prompt: 'Ile jest wart {null otwarty|nul uwert}?',
      options: [
        { id: 'a', text: '35' },
        { id: 'b', text: '46' },
        { id: 'c', text: '59' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: nullDecl(false, 'ouvert'), outcome: WON, result: 'value' },
      explain: '{Null otwarty|Nul uwert} jest wart 46.',
    },
    {
      type: 'quiz',
      id: 'm3-l15-q4',
      prompt: 'Ile jest wart {null otwarty z ręki|nul uwert hand}?',
      options: [
        { id: 'a', text: '46' },
        { id: 'b', text: '59' },
        { id: 'c', text: '64' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: nullDecl(true, 'ouvert'), outcome: WON, result: 'value' },
      explain: 'To najdroższy [[null]]: 59.',
    },
    {
      type: 'quiz',
      id: 'm3-l15-q5',
      prompt: 'Ile [[matador:Dlm]] liczy się w [[null:Ms]]?',
      options: [
        { id: 'a', text: 'Wszystkie [[walet:Mlm]]' },
        { id: 'b', text: 'Żadne — [[null]] ma stałą wartość' },
        { id: 'c', text: 'Tylko [[as:Mlm]]' },
      ],
      correct: 'b',
      explain: 'W [[null:Ms]] nie ma [[atu:Dlm]] ani [[matador:Dlm]] — wartość jest stała.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 16**

```ts
// src/content/lessons/m3-l16-przegrana.ts
import type { Declaration, GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const plain = (game: GameType): Declaration => ({ game, hand: false, announce: 'none' });

const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;
const HEARTS_WITH_1 = ['c-J', 'h-J', 'h-A', 'h-10', 'h-K', 'h-8', 'c-A', 's-A', 's-10', 'd-A', 'd-K', 'd-7'] as const;
const CLUBS_WITH_1 = ['c-J', 'h-J', 'c-A', 'c-10', 'c-K', 'c-Q', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'd-7'] as const;
const LOST_55 = { declarerPoints: 55, declarerTricks: 4 };

export const lesson: Lesson = {
  id: 'm3-l16-przegrana',
  title: 'Przegrana, [[przelicytowanie]] i zapis wyniku',
  summary: 'Ile kosztuje przegrana i jak liczy się punkty w turnieju.',
  steps: [
    {
      title: 'Przegrana kosztuje podwójnie',
      text: 'Gdy [[rozgrywajacy]] przegra, wartość gry liczy się **podwójnie i na minus**. Gra warta 30 daje −60.',
    },
    {
      title: '[[Przelicytowanie]]',
      text:
        'Wartość gry musi być co najmniej równa wylicytowanej stawce. Jeśli po rozdaniu okaże się niższa (np. [[skat]] zamienił [[ohne]] 3 na [[mit]] 1), gra jest **przegrana** — to [[przelicytowanie]].\n\n' +
        'Wtedy jej wartość to najmniejsza wielokrotność wartości bazowej, która sięga stawki. Przykład: stawka 36, gra z [[atu:Nlm]] w kolorze [[suit:h]] warta tylko 30 → liczy się 40, a przegrana daje −80.',
    },
    {
      title: 'Zapis turniejowy (Seeger-Fabian)',
      text:
        'W turniejach do wyniku dolicza się punkty za samą grę:\n\n' +
        '**wygrana: wartość + 50**\n\n' +
        '**przegrana: −2 × wartość − 50, a każdy z [[obronca:Dlm]] dostaje +40** (przy stole trzyosobowym).',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l16-q1',
      prompt: '[[Atu]]: [[suit:h]], [[mit]] 2. [[Rozgrywajacy]] ma tylko 55 [[oczko:Dlm]]. Jaki jest wynik gry?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '−30', value: '-30' },
        { id: 'b', text: '−60', value: '-60' },
        { id: 'c', text: '−90', value: '-90' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: plain(HEARTS), outcome: LOST_55, result: 'score' },
      explain: 'Gra jest warta 30 (10 × 3). Przegrana liczy się podwójnie: −60.',
    },
    {
      type: 'quiz',
      id: 'm3-l16-q2',
      prompt:
        'Wylicytowana stawka: 30. Gra: [[atu]] [[suit:h]], [[mit]] 1, wygrana z 80 [[oczko:Nlm]]. Jaki jest wynik?',
      cards: [...HEARTS_WITH_1],
      options: [
        { id: 'a', text: '+20', value: '20' },
        { id: 'b', text: '−40', value: '-40' },
        { id: 'c', text: '−60', value: '-60' },
      ],
      correct: 'c',
      verify: { kind: 'settle', declaration: plain(HEARTS), outcome: { declarerPoints: 80, declarerTricks: 7 }, bid: 30, result: 'score' },
      explain:
        'Gra jest warta tylko 20 (10 × 2), mniej niż stawka 30 — to [[przelicytowanie]]. Liczy się najmniejsza wielokrotność 10 nie mniejsza niż 30, czyli 30, i przegrana: −60.',
    },
    {
      type: 'quiz',
      id: 'm3-l16-q3',
      prompt:
        '[[Atu]]: [[suit:c]], [[mit]] 1, wygrana z [[krawiec:N]] (95 [[oczko:Dlm]]). Ile punktów turniejowych dostaje [[rozgrywajacy]]?',
      cards: [...CLUBS_WITH_1],
      options: [
        { id: 'a', text: '36' },
        { id: 'b', text: '86' },
        { id: 'c', text: '72' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: plain(CLUBS), outcome: { declarerPoints: 95, declarerTricks: 8 }, result: 'tournament' },
      explain: 'Gra jest warta 36 (12 × 3). Wygrana w turnieju: 36 + 50 = 86.',
    },
    {
      type: 'quiz',
      id: 'm3-l16-q4',
      prompt:
        '[[Atu]]: [[suit:h]], [[mit]] 2, przegrana z 55 [[oczko:Nlm]]. Ile punktów turniejowych dostaje [[rozgrywajacy]]?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '−60', value: '-60' },
        { id: 'b', text: '−110', value: '-110' },
        { id: 'c', text: '−80', value: '-80' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: plain(HEARTS), outcome: LOST_55, result: 'tournament' },
      explain: 'Gra warta 30, przegrana: −2 × 30 − 50 = −110. Każdy z [[obronca:Dlm]] dostaje 40.',
    },
    {
      type: 'quiz',
      id: 'm3-l16-q5',
      prompt: 'Ile punktów turniejowych dostaje każdy [[obronca]], gdy [[rozgrywajacy]] przegra (stół trzyosobowy)?',
      options: [
        { id: 'a', text: '0' },
        { id: 'b', text: '40' },
        { id: 'c', text: '50' },
      ],
      correct: 'b',
      explain: 'Przy stole trzyosobowym każdy z [[obronca:Dlm]] dostaje 40 punktów za przegraną [[rozgrywajacy:D]].',
    },
  ],
};
```

- [ ] **Step 3: Rozszerz moduł 3**

W `src/content/course.ts` dodaj importy `l15`, `l16` i ustaw moduł `m3` na `lessons: [l12, l13, l14, l15, l16]`.

- [ ] **Step 4: Uruchom testy treści**

Run: `npx vitest run src/content && npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content
git commit -m "feat(content): lekcje 15–16 — wartość nulla, przegrana, Seeger-Fabian" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Lekcje 17–19 (moduł 4) i test integracyjny

**Files:**
- Create: `src/content/lessons/m4-l17-przebieg.ts`, `src/content/lessons/m4-l18-ile-licytowac.ts`, `src/content/lessons/m4-l19-skat.ts`
- Modify: `src/content/course.ts`, `src/ui/App.test.tsx`

- [ ] **Step 1: Lekcja 17**

```ts
// src/content/lessons/m4-l17-przebieg.ts
import type { Lesson } from '../types';

const NEXT = 'Jaka jest następna stawka po';

export const lesson: Lesson = {
  id: 'm4-l17-przebieg',
  title: 'Przebieg [[licytacja:D]]',
  summary: 'Kto do kogo mówi i jakimi liczbami.',
  steps: [
    {
      title: 'Licytujemy liczbami',
      text:
        'W [[licytacja:Ms]] nie mówi się, jaką grę chcesz grać, tylko **liczby** — wartości gier. Kto zaoferuje najwięcej, zostaje [[rozgrywajacy:N]] i musi zagrać grę wartą co najmniej tyle.\n\n' +
        'Kolejne stawki: **18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50…** — to wszystkie możliwe wartości gier.',
    },
    {
      title: 'Kto do kogo',
      text:
        'Najpierw **[[srodek]] {licytuje|reizuje} do [[przodek:D]]**: podaje kolejne stawki, a [[przodek]] odpowiada „tak” (trzyma) albo „[[pas]]”. ' +
        'Potem **[[zadek]] {licytuje|reizuje} do zwycięzcy** pierwszej części.\n\n' +
        'Przy tej samej stawce wygrywa ten, kto odpowiada — wystarczy mu „tak”.',
    },
    {
      title: 'Gdy wszyscy pasują',
      text:
        'Jeśli [[srodek]] i [[zadek]] spasują, [[przodek]] może zagrać za 18 albo też spasować. ' +
        'Gdy pasują wszyscy, rozdanie nie jest grane, a karty rozdaje kolejny gracz.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm4-l17-q1',
      prompt: `${NEXT} 18?`,
      options: [
        { id: 'a', text: '20' },
        { id: 'b', text: '21' },
        { id: 'c', text: '22' },
      ],
      correct: 'a',
      verify: { kind: 'nextBid', after: 18 },
      explain: '20 to wartość gry z [[atu:Nlm]] w kolorze [[suit:h]] z mnożnikiem 2.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q2',
      prompt: `${NEXT} 24?`,
      options: [
        { id: 'a', text: '25' },
        { id: 'b', text: '27' },
        { id: 'c', text: '30' },
      ],
      correct: 'b',
      verify: { kind: 'nextBid', after: 24 },
      explain: '27 = 9 × 3. Wartości 25 i 26 nie ma żadna gra.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q3',
      prompt: `${NEXT} 36?`,
      options: [
        { id: 'a', text: '37' },
        { id: 'b', text: '40' },
        { id: 'c', text: '44' },
      ],
      correct: 'b',
      verify: { kind: 'nextBid', after: 36 },
      explain: '40 = 10 × 4.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q4',
      prompt: `${NEXT} 48?`,
      options: [
        { id: 'a', text: '50' },
        { id: 'b', text: '54' },
        { id: 'c', text: '60' },
      ],
      correct: 'a',
      verify: { kind: 'nextBid', after: 48 },
      explain: '50 = 10 × 5.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q5',
      prompt: 'Kto pierwszy {licytuje|reizuje} do [[przodek:D]]?',
      options: [
        { id: 'a', text: '[[Srodek]]' },
        { id: 'b', text: '[[Zadek]]' },
        { id: 'c', text: 'Rozdający' },
      ],
      correct: 'a',
      explain: 'Najpierw [[srodek]] {licytuje|reizuje} do [[przodek:D]], potem [[zadek]] do zwycięzcy.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q6',
      prompt: 'Kto wygrywa przy tej samej stawce?',
      options: [
        { id: 'a', text: 'Ten, kto podaje stawkę' },
        { id: 'b', text: 'Ten, kto odpowiada „tak”' },
        { id: 'c', text: 'Rozstrzyga losowanie' },
      ],
      correct: 'b',
      explain: 'Żeby przejąć grę, trzeba podać stawkę wyższą — odpowiadającemu wystarczy „tak”.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 18**

```ts
// src/content/lessons/m4-l18-ile-licytowac.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const ASK = 'Do ilu najwyżej możesz {licytować|reizować} z tymi kartami?';
const suit = (trump: 'c' | 's' | 'h' | 'd'): GameType => ({ kind: 'suit', trump });

export const lesson: Lesson = {
  id: 'm4-l18-ile-licytowac',
  title: 'Do ilu {licytować|reizować}',
  summary: 'Policz wartość swojej gry, zanim podasz stawkę.',
  steps: [
    {
      title: 'Licz, zanim powiesz',
      text:
        'Przed [[licytacja:N]] wybierz grę, którą chcesz zagrać, i policz jej wartość: **wartość bazowa × ([[matador:Mlm]] + 1)**. ' +
        'To twoja górna granica — {licytuj|reizuj} do niej, ale nie wyżej.',
    },
    {
      title: 'Przykład',
      text:
        'Chcesz grać z [[atu:Nlm]] w kolorze [[suit:h]] i masz [[mit]] 2. Mnożnik to 2 + 1 = 3, więc {licytujesz|reizujesz} najwyżej do 10 × 3 = **30**.',
    },
    {
      title: 'Uwaga przy grze [[ohne]]',
      text:
        'Przy [[ohne]] 2 czy [[ohne]] 3 ryzykujesz: jeśli w [[skat:Ms]] leży brakujący [[walet]], liczba [[matador:Dlm]] spada, a gra może się okazać warta mniej niż stawka — czyli [[przelicytowanie]].',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm4-l18-q1',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 's-10', 'd-9'],
      options: [
        { id: 'a', text: '20' },
        { id: 'b', text: '30' },
        { id: 'c', text: '40' },
      ],
      correct: 'b',
      verify: { kind: 'maxBid', game: suit('h') },
      explain: '[[Mit]] 2 → mnożnik 3. 10 × 3 = 30.',
    },
    {
      type: 'quiz',
      id: 'm4-l18-q2',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:c]]. ${ASK}`,
      cards: ['s-J', 'd-J', 'c-A', 'c-10', 'c-K', 'c-9', 'c-8', 'h-A', 's-A', 'd-10'],
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '36' },
        { id: 'c', text: '48' },
      ],
      correct: 'a',
      verify: { kind: 'maxBid', game: suit('c') },
      explain: 'Brakuje [[card:c-J:D]], ale [[card:s-J:B]] masz — to [[ohne]] 1, mnożnik 2. 12 × 2 = 24.',
    },
    {
      type: 'quiz',
      id: 'm4-l18-q3',
      prompt: `[[Grand]]. ${ASK}`,
      cards: ['c-J', 's-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'd-K'],
      options: [
        { id: 'a', text: '48' },
        { id: 'b', text: '72' },
        { id: 'c', text: '96' },
      ],
      correct: 'b',
      verify: { kind: 'maxBid', game: { kind: 'grand' } },
      explain: '[[Mit]] 2 → mnożnik 3. 24 × 3 = 72.',
    },
    {
      type: 'quiz',
      id: 'm4-l18-q4',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:s]]. ${ASK}`,
      cards: ['c-J', 's-J', 'h-J', 's-A', 's-K', 's-9', 's-8', 'c-A', 'h-10', 'd-7'],
      options: [
        { id: 'a', text: '33' },
        { id: 'b', text: '44' },
        { id: 'c', text: '55' },
      ],
      correct: 'b',
      verify: { kind: 'maxBid', game: suit('s') },
      explain: '[[Mit]] 3 → mnożnik 4. 11 × 4 = 44.',
    },
    {
      type: 'quiz',
      id: 'm4-l18-q5',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:d]]. ${ASK}`,
      cards: ['d-A', 'd-10', 'd-K', 'd-Q', 'd-9', 'd-8', 'c-A', 'c-10', 's-A', 'h-A'],
      options: [
        { id: 'a', text: '27' },
        { id: 'b', text: '36' },
        { id: 'c', text: '45' },
      ],
      correct: 'c',
      verify: { kind: 'maxBid', game: suit('d') },
      explain:
        'Nie masz żadnego [[walet:D]] — to [[ohne]] 4 (pierwsze [[atu]] w twojej ręce to [[card:d-A]]). Mnożnik 5, 9 × 5 = 45. Ale uwaga: [[walet]] w [[skat:Ms]] obniżyłby tę wartość.',
    },
  ],
};
```

- [ ] **Step 3: Lekcja 19**

```ts
// src/content/lessons/m4-l19-skat.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const SPADES: GameType = { kind: 'suit', trump: 's' };
const GRAND: GameType = { kind: 'grand' };

export const lesson: Lesson = {
  id: 'm4-l19-skat',
  title: '[[Skat]] i zgłoszenie gry',
  summary: 'Podnieść [[skat]] czy grać [[reka:B]]? I co wyrzucić?',
  steps: [
    {
      title: 'Po wygranej [[licytacja:Ms]]',
      text:
        'Jako [[rozgrywajacy]] masz dwie drogi:\n\n' +
        '**1. Podnieść [[skat]]** — bierzesz 2 karty ze stołu, potem odkładasz („wyrzucasz”) dowolne 2 karty z powrotem i zgłaszasz grę.\n\n' +
        '**2. Grać [[reka:B]]** — nie patrzysz w [[skat]], ale gra jest warta o poziom więcej.',
    },
    {
      title: 'Co wyrzucić do [[skat:D]]',
      text:
        'Wyrzucone karty liczą się dla ciebie — na koniec ich [[oczko:Mlm]] dostaje [[rozgrywajacy]]. Dlatego dobrze wyrzucić:\n\n' +
        '• **wartościowe karty, które mogłyby przepaść** — np. dziesiątkę bez [[as:D]] w tym samym kolorze,\n\n' +
        '• karty, dzięki którym **pozbywasz się całego koloru** — wtedy możesz go potem przebijać [[atu:Nlm]].\n\n' +
        'Wyrzucanie [[atu:Dlm]] jest dozwolone, ale prawie nigdy nie ma sensu.',
    },
    {
      title: 'Kiedy grać [[reka:B]]?',
      text:
        'Gdy twoje karty są tak mocne, że [[skat]] niewiele by pomógł — albo gdy potrzebujesz dodatkowego poziomu, żeby gra była warta wylicytowanej stawki.',
    },
  ],
  exercises: [
    {
      type: 'discard',
      id: 'm4-l19-k1',
      prompt: 'Grasz [[graKolorowa:B]], [[atu]]: [[suit:h]]. Masz 12 kart (razem ze [[skat:N]]). Wybierz 2 karty do wyrzucenia.',
      game: HEARTS,
      cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 'c-K', 's-10', 's-9', 'd-8'],
      best: [
        ['s-10', 's-9'],
        ['s-10', 'd-8'],
      ],
      wrongExplain: 'Najbardziej zagrożona jest [[card:s-10]] — w [[skat:Ms]] jej 10 [[oczko:Dlm]] będzie bezpieczne.',
      explain:
        '[[Card:s-10]] bez [[as:D]] łatwo przepadnie, a w [[skat:Ms]] jej [[oczko:Mlm]] są twoje. Pozbywając się całego koloru, zyskujesz możliwość przebijania go [[atu:Nlm]].',
    },
    {
      type: 'discard',
      id: 'm4-l19-k2',
      prompt: 'Grasz [[grand:B]]. Wybierz 2 karty do wyrzucenia.',
      game: GRAND,
      cards: ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 'c-K', 's-A', 's-10', 'h-A', 'h-10', 'd-10', 'd-K'],
      best: [['d-10', 'd-K']],
      explain:
        '[[Card:d-10]] i [[card:d-K]] bez [[as:D]] to łatwy łup dla [[obronca:Dlm]]. W [[skat:Ms]] ich 14 [[oczko:Dlm]] liczy się dla ciebie, a kolor [[suit:d]] znika z twojej ręki.',
    },
    {
      type: 'quiz',
      id: 'm4-l19-q1',
      prompt: 'Do kogo należą [[oczko:Mlm]] kart wyrzuconych do [[skat:D]]?',
      options: [
        { id: 'a', text: 'Do [[rozgrywajacy:D]]' },
        { id: 'b', text: 'Do [[obronca:Dlm]]' },
        { id: 'c', text: 'Do nikogo' },
      ],
      correct: 'a',
      explain: '[[Skat]] należy do [[rozgrywajacy:D]] — także karty, które sam do niego wyrzucił.',
    },
    {
      type: 'quiz',
      id: 'm4-l19-q2',
      prompt: 'Grasz [[reka:B]]. O ile rośnie mnożnik?',
      options: [
        { id: 'a', text: '+0' },
        { id: 'b', text: '+1' },
        { id: 'c', text: '+2' },
      ],
      correct: 'b',
      explain: '[[Reka]] to jeden dodatkowy poziom mnożnika.',
    },
    {
      type: 'quiz',
      id: 'm4-l19-q3',
      prompt: 'Grasz [[reka:B]], [[atu]]: [[suit:s]], [[mit]] 3, i wygrywasz. Ile jest warta gra?',
      cards: ['c-J', 's-J', 'h-J', 's-A', 's-K', 's-9', 's-8', 'c-A', 'h-10', 'd-7', 'd-8', 'c-7'],
      options: [
        { id: 'a', text: '44' },
        { id: 'b', text: '55' },
        { id: 'c', text: '66' },
      ],
      correct: 'b',
      verify: {
        kind: 'settle',
        declaration: { game: SPADES, hand: true, announce: 'none' },
        outcome: { declarerPoints: 70, declarerTricks: 6 },
        result: 'value',
      },
      explain: '3 ([[matador:Mlm]]) + 1 (gra) + 1 ([[reka]]) = 5. 11 × 5 = 55.',
    },
  ],
};
```

- [ ] **Step 4: Dodaj moduł 4 do kursu**

W `src/content/course.ts` dodaj importy `l17`, `l18`, `l19` i po module `m3` dopisz:

```ts
    { id: 'm4', title: 'Licytacja', lessons: [l17, l18, l19] },
```

- [ ] **Step 5: Dopisz test integracyjny**

W `src/ui/App.test.tsx` (wewnątrz `describe('aplikacja', ...)`):

```tsx
  it('lekcja 19: wybór kart do skata', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { route: '/lekcja/m4-l19-skat', storage: storageWithState({ unlockAll: true }) });
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'dziesiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'dziewiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'Wyrzuć do skata' }));
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Do skata trafia 10 oczek.')).toBeInTheDocument();
  });
```

- [ ] **Step 6: Uruchom wszystko**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/content src/ui/App.test.tsx
git commit -m "feat(content): lekcje 17–19 — przebieg licytacji, do ilu licytować, skat" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Specyfikacja — decyzje z realizacji i sprawdzenie w przeglądarce

**Files:**
- Modify: `docs/superpowers/specs/2026-11-12-skat-trainer-design.md` (dopisana sekcja na końcu)

- [ ] **Step 1: Dopisz sekcję 9 na końcu specyfikacji**

```markdown
## 9. Decyzje podjęte w trakcie realizacji (Plany 1–3)

- **Ćwiczenie `bid` zastąpione** quizami z polem `verify` (odpowiedź liczona silnikiem: `points`, `trickWinner`, `matadors`, `maxBid`, `nextBid`, `settle`) oraz ćwiczeniem `discard` (wybór 2 kart do skata). Wybór gry pozostaje zwykłym quizem.
- **Przyciemnianie niedozwolonych kart** dotyczy mini-rozdań; w ćwiczeniach „zagraj kartę” jest wyłączone, bo rozpoznanie dozwolonej karty jest ich celem.
- **Liczba zadań w lekcji:** zwykle 3–5, w lekcjach ćwiczących kolejność kart do 7.
- **Punkty kontrolne w mini-rozdaniach** (pytania w trakcie gry) — przeniesione do Planu 4 (moduł 6).
- **Nazwy kart odmieniają się przez przypadki:** `[[card:h-10:B]]` → „dziesiątkę czerwienną”.
- **Kontra/re** — w Planie 4 (lekcja 30), razem z ewentualną zmianą zapisu wyniku.
- **Zależności modułów:** `engine` ← `bots` ← `content` (walidacja treści używa silnika i botów) ← `exercises`/`ui`; `glossary` zależy tylko od `engine`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-11-12-skat-trainer-design.md
git commit -m "docs: decyzje z realizacji planów 1–3 w specyfikacji" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 3: Sprawdzenie w przeglądarce (wykonuje koordynator)**

Widok 375 px, „Odblokuj wszystkie lekcje”. Sprawdź:
1. Mapa kursu pokazuje moduły 3 i 4.
2. Lekcja 13: rząd 12 kart rozgrywającego mieści się (zawija się), odpowiedzi „Z 2 / Bez 2” po polsku i „Mit 2 / Ohne 2” w języku potocznym.
3. Lekcja 16: wartości ujemne wyświetlają się ze znakiem minus.
4. Lekcja 19: wybór 2 kart, przycisk „Wyrzuć do skata”, informacja o oczkach w skacie.
5. Talia francuska i język potoczny w lekcjach 12–19.
6. Konsola bez nowych błędów.

**Uwaga:** przed testami w przeglądarce zapisz bieżący stan `localStorage` (`skat-trener:v1`) użytkownika i przywróć go po testach, żeby nie nadpisać jego postępu.
