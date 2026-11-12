# Trener skata — Plan 1: fundament i pierwsze lekcje

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Działająca, statyczna aplikacja web (mobile-first) z mapą kursu, odtwarzaczem lekcji, ćwiczeniami typu `quiz` i `playCard`, ustawieniami talii i „języka”, słowniczkiem, zapisem postępu w przeglądarce oraz lekcjami 1–5 kursu.

**Architecture:** Vite + React + TypeScript. Czysty silnik zasad (`src/engine`) bez zależności od Reacta; słownik terminów z odmianą (`src/glossary`) rozwiązujący tokeny w tekstach lekcji; stan w `localStorage` z wersjonowanym schematem (`src/state`); treść kursu jako typowane dane (`src/content`) walidowane testem; komponenty kart, ćwiczeń i ekranów (`src/cards`, `src/exercises`, `src/components`, `src/ui`).

**Tech Stack:** Node 26, npm, Vite 6, React 18, React Router 6 (HashRouter), TypeScript 5, Vitest 3 + jsdom, React Testing Library, user-event.

**Specyfikacja:** `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`

**Konwencje:**
- Identyfikatory w kodzie po angielsku, teksty interfejsu i treść po polsku.
- Karty: `<kolor>-<ranga>`, kolory `c s h d` (♣ ♠ ♥ ♦), rangi `7 8 9 10 J Q K A`.
- Miejsca przy stole: `Seat = 0 | 1 | 2` (0 = przodek, 1 = środek, 2 = zadek).
- Tokeny w tekstach: `[[termin]]`, `[[termin:B]]` (przypadek), `[[Termin]]` (wielka litera), `[[card:h-10]]`, `[[suit:c]]`, `{wariant oficjalny|wariant potoczny}`.
- Wszystkie polecenia uruchamiaj w `/Users/gkocur/skat`.

---

## Struktura plików (po Planie 1)

```
.gitignore
index.html
package.json
tsconfig.json
vite.config.ts
.claude/launch.json
src/
  main.tsx                      punkt wejścia
  styles.css                    style globalne (tokeny, jasny/ciemny motyw)
  engine/
    cards.ts                    karty, kolory, rangi, oczka
    game.ts                     rodzaje gier, miejsca przy stole
    order.ts                    atu, siła kart, zwycięzca lewy, sortowanie ręki
    rules.ts                    dozwolone zagrania
    index.ts
  glossary/
    types.ts                    typy słownika (rejestr, talia, przypadki)
    terms.ts                    DANE: terminy z odmianą (do poprawek przez autora)
    cardNames.ts                DANE: nazwy kolorów, figur, oznaczenia na kartach
    text.ts                     rozwiązywanie i sprawdzanie tokenów
    index.ts
  state/
    types.ts                    kształt zapisu
    storage.ts                  odczyt/zapis/migracje localStorage
    progress.ts                 statusy lekcji, odblokowywanie, zapis wyniku
    AppStateContext.tsx         provider + hooki (useAppState, useText…)
  content/
    types.ts                    typy lekcji i ćwiczeń
    pick.ts                     losowanie zadań z puli
    validate.ts                 walidacja treści kursu
    course.ts                   lista modułów i lekcji
    lessons/m1-l01-czym-jest-skat.ts
    lessons/m1-l02-talia.ts
    lessons/m1-l03-oczka.ts
    lessons/m1-l04-rozdanie.ts
    lessons/m2-l05-dokladanie.ts
  cards/
    SuitSymbol.tsx              symbole kolorów (SVG) obu talii
    PlayingCard.tsx             karta (SVG), przycisk lub obrazek
    Hand.tsx                    ręka gracza + rząd kart (CardRow)
    TrickView.tsx               karty na stole z etykietami miejsc
  components/
    RichText.tsx                akapity + **pogrubienie** + tokeny
    Feedback.tsx                informacja zwrotna po odpowiedzi
  exercises/
    evaluatePlay.ts             ocena zagrania (czysta funkcja)
    QuizExercise.tsx
    PlayCardExercise.tsx
    ExerciseView.tsx
  ui/
    App.tsx                     providery + router + trasy
    Layout.tsx                  nagłówek, nawigacja, baner zapisu
    ErrorBoundary.tsx
    CourseMap.tsx
    LessonPlayer.tsx
    LessonPage.tsx
    SettingsPage.tsx
    GlossaryPage.tsx
    NotFound.tsx
  test/
    setup.ts
    storage.ts                  pamięć testowa + gotowe ustawienia
    render.tsx                  renderWithProviders
```

Testy leżą obok plików (`*.test.ts` / `*.test.tsx`).

---

### Task 1: Szkielet projektu

**Files:**
- Create: `.gitignore`, `package.json` (przez npm), `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/test/setup.ts`

- [ ] **Step 1: Zainicjuj repozytorium i pakiet**

```bash
cd /Users/gkocur/skat
git init
npm init -y
npm pkg delete main
npm pkg set name=skat-trener type=module
npm pkg set private=true --json
npm pkg set scripts.dev="vite" scripts.build="tsc && vite build" scripts.preview="vite preview" scripts.test="vitest run" scripts.typecheck="tsc"
```

- [ ] **Step 2: Zainstaluj zależności**

```bash
npm install react@18 react-dom@18 react-router-dom@6
npm install -D vite@6 @vitejs/plugin-react@4 typescript@5 vitest@3 jsdom@26 @testing-library/react@16 @testing-library/dom@10 @testing-library/user-event@14 @testing-library/jest-dom@6 @types/react@18 @types/react-dom@18
```

Expected: instalacja bez błędów (ostrzeżenia `npm warn` są w porządku).

- [ ] **Step 3: Utwórz `.gitignore`**

```gitignore
node_modules/
dist/
coverage/
*.log
.DS_Store
```

- [ ] **Step 4: Utwórz `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 5: Utwórz `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 6: Utwórz `index.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Trener skata</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Utwórz tymczasowy `src/main.tsx`** (zastąpiony w Task 16)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h1>Trener skata</h1>
  </StrictMode>,
);
```

- [ ] **Step 8: Utwórz `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

afterEach(() => {
  window.localStorage.clear();
});
```

- [ ] **Step 9: Sprawdź typy i runner testów**

Run: `npm run typecheck && npx vitest run --passWithNoTests`
Expected: brak błędów TypeScript; Vitest kończy się komunikatem „No test files found, exiting with code 0”.

- [ ] **Step 10: Commit**

```bash
git add .gitignore package.json package-lock.json tsconfig.json vite.config.ts index.html src docs
git commit -m "chore: szkielet projektu Vite + React + TypeScript" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Silnik — karty i oczka

**Files:**
- Create: `src/engine/cards.ts`
- Test: `src/engine/cards.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/engine/cards.test.ts
import { describe, expect, it } from 'vitest';
import { ALL_CARDS, cardPoints, isCardId, isSuit, rankOf, suitOf, sumPoints } from './cards';

describe('karty', () => {
  it('talia ma 32 różne karty', () => {
    expect(ALL_CARDS).toHaveLength(32);
    expect(new Set(ALL_CARDS).size).toBe(32);
  });

  it('rozpoznaje poprawne identyfikatory kart', () => {
    expect(isCardId('h-10')).toBe(true);
    expect(isCardId('c-J')).toBe(true);
    expect(isCardId('h-1')).toBe(false);
    expect(isCardId('x-A')).toBe(false);
    expect(isCardId('h-j')).toBe(false);
  });

  it('rozpoznaje kolory', () => {
    expect(isSuit('d')).toBe(true);
    expect(isSuit('x')).toBe(false);
  });

  it('rozkłada identyfikator na kolor i rangę', () => {
    expect(suitOf('h-10')).toBe('h');
    expect(rankOf('h-10')).toBe('10');
    expect(rankOf('c-J')).toBe('J');
  });

  it('liczy oczka kart', () => {
    expect(cardPoints('s-A')).toBe(11);
    expect(cardPoints('d-10')).toBe(10);
    expect(cardPoints('c-K')).toBe(4);
    expect(cardPoints('h-Q')).toBe(3);
    expect(cardPoints('c-J')).toBe(2);
    expect(cardPoints('h-9')).toBe(0);
    expect(sumPoints(['h-A', 's-10', 'c-K'])).toBe(25);
    expect(sumPoints(ALL_CARDS)).toBe(120);
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/engine/cards.test.ts`
Expected: FAIL — „Failed to resolve import "./cards"”.

- [ ] **Step 3: Zaimplementuj**

```ts
// src/engine/cards.ts
export const SUITS = ['c', 's', 'h', 'd'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
export type Rank = (typeof RANKS)[number];

export type CardId = `${Suit}-${Rank}`;

export const ALL_CARDS: readonly CardId[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => `${suit}-${rank}` as CardId),
);

export function isCardId(value: string): value is CardId {
  return (ALL_CARDS as readonly string[]).includes(value);
}

export function isSuit(value: string): value is Suit {
  return (SUITS as readonly string[]).includes(value);
}

export function suitOf(card: CardId): Suit {
  return card.split('-')[0] as Suit;
}

export function rankOf(card: CardId): Rank {
  return card.split('-')[1] as Rank;
}

const POINTS: Record<Rank, number> = { '7': 0, '8': 0, '9': 0, '10': 10, J: 2, Q: 3, K: 4, A: 11 };

export function cardPoints(card: CardId): number {
  return POINTS[rankOf(card)];
}

export function sumPoints(cards: readonly CardId[]): number {
  return cards.reduce((total, card) => total + cardPoints(card), 0);
}
```

- [ ] **Step 4: Uruchom test**

Run: `npx vitest run src/engine/cards.test.ts`
Expected: PASS (5 testów).

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): karty, kolory, rangi i oczka" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Silnik — rodzaje gier, atu, zwycięzca lewy

**Files:**
- Create: `src/engine/game.ts`, `src/engine/order.ts`
- Test: `src/engine/order.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/engine/order.test.ts
import { describe, expect, it } from 'vitest';
import type { GameType } from './game';
import { nextSeat } from './game';
import { isTrump, leadOf, sortHand, trickWinner } from './order';

const hearts: GameType = { kind: 'suit', trump: 'h' };
const grand: GameType = { kind: 'grand' };
const nullGame: GameType = { kind: 'null' };

describe('miejsca przy stole', () => {
  it('przechodzą cyklicznie 0 → 1 → 2 → 0', () => {
    expect(nextSeat(0)).toBe(1);
    expect(nextSeat(2)).toBe(0);
    expect(nextSeat(1, 2)).toBe(0);
  });
});

describe('atu', () => {
  it('w grze kolorowej atu to walety i kolor atu', () => {
    expect(isTrump('c-J', hearts)).toBe(true);
    expect(isTrump('h-7', hearts)).toBe(true);
    expect(isTrump('c-A', hearts)).toBe(false);
    expect(leadOf('d-J', hearts)).toBe('trump');
    expect(leadOf('s-A', hearts)).toBe('s');
  });

  it('w grandzie atu to tylko walety', () => {
    expect(isTrump('d-J', grand)).toBe(true);
    expect(isTrump('h-A', grand)).toBe(false);
  });

  it('w nullu nie ma atu', () => {
    expect(isTrump('c-J', nullGame)).toBe(false);
    expect(leadOf('c-J', nullGame)).toBe('c');
  });
});

describe('zwycięzca lewy', () => {
  it('gra kolorowa: wyższa karta koloru wyjścia, 10 bije króla', () => {
    expect(trickWinner(['s-K', 's-10', 's-A'], hearts)).toBe(2);
    expect(trickWinner(['s-10', 's-K', 's-9'], hearts)).toBe(0);
    expect(trickWinner(['h-10', 'h-K', 'h-A'], hearts)).toBe(2);
  });

  it('gra kolorowa: atu bije kolor, walet bije atu, karty innych kolorów nie biorą', () => {
    expect(trickWinner(['s-K', 's-10', 'h-7'], hearts)).toBe(2);
    expect(trickWinner(['h-A', 'd-J', 'c-J'], hearts)).toBe(2);
    expect(trickWinner(['s-A', 'c-A', 'd-A'], hearts)).toBe(0);
  });

  it('grand: walety w kolejności ♣ ♠ ♥ ♦', () => {
    expect(trickWinner(['h-A', 'd-J', 's-A'], grand)).toBe(1);
    expect(trickWinner(['c-J', 's-J', 'h-J'], grand)).toBe(0);
    expect(trickWinner(['d-J', 'h-J', 'c-7'], grand)).toBe(1);
  });

  it('null: kolejność A K D W 10 9 8 7, walet zwykłą kartą koloru', () => {
    expect(trickWinner(['h-10', 'h-J', 'h-9'], nullGame)).toBe(1);
    expect(trickWinner(['s-K', 's-A', 'c-A'], nullGame)).toBe(1);
    expect(trickWinner(['d-7', 'h-A', 'c-J'], nullGame)).toBe(0);
  });

  it('pusta lewa to błąd', () => {
    expect(() => trickWinner([], hearts)).toThrow();
  });
});

describe('sortowanie ręki', () => {
  it('gra kolorowa: najpierw atu malejąco, potem kolory ♣ ♠ ♥ ♦', () => {
    expect(sortHand(['s-A', 'h-7', 'c-J', 'h-A', 'd-J', 's-10'], hearts)).toEqual([
      'c-J', 'd-J', 'h-A', 'h-7', 's-A', 's-10',
    ]);
  });

  it('null: kolory ♣ ♠ ♥ ♦, w kolorze kolejność nulla', () => {
    expect(sortHand(['h-J', 'c-7', 'h-10', 'c-A'], nullGame)).toEqual(['c-A', 'c-7', 'h-J', 'h-10']);
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/engine/order.test.ts`
Expected: FAIL — „Failed to resolve import "./game"”.

- [ ] **Step 3: Zaimplementuj `game.ts`**

```ts
// src/engine/game.ts
import type { Suit } from './cards';

export type GameType = { kind: 'suit'; trump: Suit } | { kind: 'grand' } | { kind: 'null' };

/** 0 = przodek, 1 = środek, 2 = zadek. */
export type Seat = 0 | 1 | 2;

export function nextSeat(seat: Seat, steps = 1): Seat {
  return ((seat + steps) % 3) as Seat;
}
```

- [ ] **Step 4: Zaimplementuj `order.ts`**

```ts
// src/engine/order.ts
import { SUITS, rankOf, suitOf, type CardId, type Rank, type Suit } from './cards';
import type { GameType } from './game';

/** Kolor wyjścia: zwykły kolor albo atu. */
export type Lead = Suit | 'trump';

const JACK_STRENGTH: Record<Suit, number> = { c: 4, s: 3, h: 2, d: 1 };
const NORMAL_ORDER: readonly Rank[] = ['7', '8', '9', 'Q', 'K', '10', 'A'];
const NULL_ORDER: readonly Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function isTrump(card: CardId, game: GameType): boolean {
  if (game.kind === 'null') return false;
  if (rankOf(card) === 'J') return true;
  return game.kind === 'suit' && suitOf(card) === game.trump;
}

export function leadOf(card: CardId, game: GameType): Lead {
  return isTrump(card, game) ? 'trump' : suitOf(card);
}

/** Siła karty w obrębie jej grupy (atu albo kolor). Walety w atu: 101–104. */
function strength(card: CardId, game: GameType): number {
  if (game.kind === 'null') return NULL_ORDER.indexOf(rankOf(card));
  if (rankOf(card) === 'J') return 100 + JACK_STRENGTH[suitOf(card)];
  return NORMAL_ORDER.indexOf(rankOf(card));
}

function beats(challenger: CardId, current: CardId, game: GameType): boolean {
  const challengerTrump = isTrump(challenger, game);
  const currentTrump = isTrump(current, game);
  if (challengerTrump !== currentTrump) return challengerTrump;
  if (!challengerTrump && suitOf(challenger) !== suitOf(current)) return false;
  return strength(challenger, game) > strength(current, game);
}

/** Indeks karty (0–2), która bierze lewę. */
export function trickWinner(trick: readonly CardId[], game: GameType): number {
  if (trick.length === 0) throw new Error('Pusta lewa nie ma zwycięzcy');
  let best = 0;
  for (let i = 1; i < trick.length; i++) {
    if (beats(trick[i], trick[best], game)) best = i;
  }
  return best;
}

/** Kolejność wyświetlania: atu (malejąco), potem kolory ♣ ♠ ♥ ♦ (malejąco). */
export function sortHand(hand: readonly CardId[], game: GameType): CardId[] {
  const group = (card: CardId) => (isTrump(card, game) ? -1 : SUITS.indexOf(suitOf(card)));
  return [...hand].sort((a, b) => group(a) - group(b) || strength(b, game) - strength(a, game));
}
```

- [ ] **Step 5: Uruchom test**

Run: `npx vitest run src/engine/order.test.ts`
Expected: PASS (11 testów).

- [ ] **Step 6: Commit**

```bash
git add src/engine
git commit -m "feat(engine): rodzaje gier, atu, zwycięzca lewy, sortowanie ręki" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Silnik — dozwolone zagrania

**Files:**
- Create: `src/engine/rules.ts`, `src/engine/index.ts`
- Test: `src/engine/rules.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/engine/rules.test.ts
import { describe, expect, it } from 'vitest';
import type { GameType } from './game';
import { isLegalMove, legalMoves } from './rules';

const hearts: GameType = { kind: 'suit', trump: 'h' };
const grand: GameType = { kind: 'grand' };
const nullGame: GameType = { kind: 'null' };

describe('dozwolone zagrania', () => {
  it('przy pustej lewie wolno zagrać każdą kartę', () => {
    expect(legalMoves(['c-A', 'h-7'], [], hearts)).toEqual(['c-A', 'h-7']);
  });

  it('trzeba dołożyć do koloru; walet nie należy do swojego koloru', () => {
    expect(legalMoves(['c-J', 'c-7', 'h-A'], ['c-A'], hearts)).toEqual(['c-7']);
  });

  it('na wyjście w atu trzeba dać atu, także waleta', () => {
    expect(legalMoves(['c-J', 's-A'], ['h-9'], hearts)).toEqual(['c-J']);
  });

  it('grand: na waleta trzeba dać waleta', () => {
    expect(legalMoves(['c-A', 'd-J'], ['c-J'], grand)).toEqual(['d-J']);
  });

  it('grand: walet nie dokłada do koloru — bez koloru wolno wszystko', () => {
    expect(legalMoves(['c-J', 's-7'], ['c-A'], grand)).toEqual(['c-J', 's-7']);
  });

  it('null: walet jest zwykłą kartą swojego koloru', () => {
    expect(legalMoves(['c-J', 'h-7'], ['c-A'], nullGame)).toEqual(['c-J']);
  });

  it('isLegalMove odrzuca kartę spoza ręki', () => {
    expect(isLegalMove('s-A', ['c-7'], [], hearts)).toBe(false);
    expect(isLegalMove('c-7', ['c-7', 'h-A'], ['c-K'], hearts)).toBe(true);
    expect(isLegalMove('h-A', ['c-7', 'h-A'], ['c-K'], hearts)).toBe(false);
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/engine/rules.test.ts`
Expected: FAIL — „Failed to resolve import "./rules"”.

- [ ] **Step 3: Zaimplementuj**

```ts
// src/engine/rules.ts
import type { CardId } from './cards';
import type { GameType } from './game';
import { leadOf } from './order';

export function legalMoves(hand: readonly CardId[], trick: readonly CardId[], game: GameType): CardId[] {
  if (trick.length === 0) return [...hand];
  const lead = leadOf(trick[0], game);
  const following = hand.filter((card) => leadOf(card, game) === lead);
  return following.length > 0 ? following : [...hand];
}

export function isLegalMove(
  card: CardId,
  hand: readonly CardId[],
  trick: readonly CardId[],
  game: GameType,
): boolean {
  return hand.includes(card) && legalMoves(hand, trick, game).includes(card);
}
```

```ts
// src/engine/index.ts
export * from './cards';
export * from './game';
export * from './order';
export * from './rules';
```

- [ ] **Step 4: Uruchom wszystkie testy silnika**

Run: `npx vitest run src/engine`
Expected: PASS (3 pliki).

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): dozwolone zagrania" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Słownik — typy i terminy

**Files:**
- Create: `src/glossary/types.ts`, `src/glossary/terms.ts`
- Test: `src/glossary/terms.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/glossary/terms.test.ts
import { describe, expect, it } from 'vitest';
import { TERMS, formVariants, formsFor } from './terms';

describe('słownik terminów', () => {
  it('każdy termin ma mianownik w każdym wariancie', () => {
    for (const [key, term] of Object.entries(TERMS)) {
      for (const forms of formVariants(term)) {
        expect(forms.M, key).toBeTruthy();
      }
    }
  });

  it('terminy zwykłe zależą tylko od rejestru', () => {
    expect(formsFor(TERMS.lewa, { deck: 'altenburg', register: 'official' }).B).toBe('lewę');
    expect(formsFor(TERMS.lewa, { deck: 'french', register: 'colloquial' }).M).toBe('sztych');
  });

  it('nazwy figur zależą od talii i rejestru', () => {
    expect(formsFor(TERMS.walet, { deck: 'altenburg', register: 'official' }).M).toBe('niżnik');
    expect(formsFor(TERMS.walet, { deck: 'altenburg', register: 'colloquial' }).M).toBe('uner');
    expect(formsFor(TERMS.walet, { deck: 'french', register: 'official' }).M).toBe('walet');
    expect(formsFor(TERMS.walet, { deck: 'french', register: 'colloquial' }).M).toBe('jopek');
  });

  it('terminy zależne od talii mają 4 warianty, zwykłe 2', () => {
    expect(formVariants(TERMS.walet)).toHaveLength(4);
    expect(formVariants(TERMS.lewa)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/glossary/terms.test.ts`
Expected: FAIL — „Failed to resolve import "./terms"”.

- [ ] **Step 3: Zaimplementuj `types.ts`**

```ts
// src/glossary/types.ts
export type Register = 'official' | 'colloquial';
export type DeckKind = 'altenburg' | 'french';

/** M D C B N Ms = przypadki l.p.; z sufiksem „lm” = l.mn. */
export const CASES = ['M', 'D', 'C', 'B', 'N', 'Ms', 'Mlm', 'Dlm', 'Clm', 'Blm', 'Nlm', 'Mslm'] as const;
export type CaseKey = (typeof CASES)[number];

export type Gender = 'm' | 'f' | 'n';

export type Forms = { M: string; g?: Gender } & Partial<Record<Exclude<CaseKey, 'M'>, string>>;

export interface RegisterForms {
  official: Forms;
  colloquial: Forms;
}

export type Term =
  | { kind: 'plain'; forms: RegisterForms }
  | { kind: 'deck'; byDeck: Record<DeckKind, RegisterForms> };

export interface TextContext {
  deck: DeckKind;
  register: Register;
}
```

- [ ] **Step 4: Zaimplementuj `terms.ts`**

```ts
// src/glossary/terms.ts
// DANE DO WERYFIKACJI przez autora kursu — patrz specyfikacja, sekcja 8.
// Formy dodajemy tylko wtedy, gdy są używane w treści (test treści wyłapie braki).
import type { DeckKind, Forms, RegisterForms, Term, TextContext } from './types';

const same = (forms: Forms): RegisterForms => ({ official: forms, colloquial: forms });
const plain = (forms: RegisterForms): Term => ({ kind: 'plain', forms });
const byDeck = (decks: Record<DeckKind, RegisterForms>): Term => ({ kind: 'deck', byDeck: decks });

export const TERMS: Record<string, Term> = {
  lewa: plain({
    official: {
      M: 'lewa', g: 'f', D: 'lewy', C: 'lewie', B: 'lewę', N: 'lewą', Ms: 'lewie',
      Mlm: 'lewy', Dlm: 'lew', Clm: 'lewom', Blm: 'lewy', Nlm: 'lewami', Mslm: 'lewach',
    },
    colloquial: {
      M: 'sztych', g: 'm', D: 'sztycha', C: 'sztychowi', B: 'sztycha', N: 'sztychem', Ms: 'sztychu',
      Mlm: 'sztychy', Dlm: 'sztychów', Clm: 'sztychom', Blm: 'sztychy', Nlm: 'sztychami', Mslm: 'sztychach',
    },
  }),
  atu: plain({
    official: { M: 'atu', g: 'n', D: 'atu', B: 'atu', Mlm: 'atuty', Dlm: 'atutów', Blm: 'atuty', Nlm: 'atutami' },
    colloquial: { M: 'trumf', g: 'm', D: 'trumfa', B: 'trumfa', Mlm: 'trumfy', Dlm: 'trumfów', Blm: 'trumfy', Nlm: 'trumfami' },
  }),
  rozgrywajacy: plain({
    official: {
      M: 'rozgrywający', g: 'm', D: 'rozgrywającego', C: 'rozgrywającemu', B: 'rozgrywającego',
      N: 'rozgrywającym', Ms: 'rozgrywającym',
    },
    colloquial: { M: 'szpiler', g: 'm', D: 'szpilera', C: 'szpilerowi', B: 'szpilera', N: 'szpilerem', Ms: 'szpilerze' },
  }),
  obronca: plain({
    official: {
      M: 'obrońca', g: 'm', D: 'obrońcy', C: 'obrońcy', B: 'obrońcę', N: 'obrońcą',
      Mlm: 'obrońcy', Dlm: 'obrońców', Clm: 'obrońcom', Blm: 'obrońców', Nlm: 'obrońcami',
    },
    colloquial: {
      M: 'przeciwnik', g: 'm', D: 'przeciwnika', C: 'przeciwnikowi', B: 'przeciwnika', N: 'przeciwnikiem',
      Mlm: 'przeciwnicy', Dlm: 'przeciwników', Clm: 'przeciwnikom', Blm: 'przeciwników', Nlm: 'przeciwnikami',
    },
  }),
  przodek: plain({
    official: { M: 'przodek', g: 'm', D: 'przodka', C: 'przodkowi', B: 'przodka', N: 'przodkiem', Ms: 'przodku' },
    colloquial: { M: 'forhand', g: 'm', D: 'forhandu', C: 'forhandowi', B: 'forhand', N: 'forhandem', Ms: 'forhandzie' },
  }),
  srodek: plain({
    official: { M: 'środek', g: 'm', D: 'środka', C: 'środkowi', B: 'środek', N: 'środkiem', Ms: 'środku' },
    colloquial: { M: 'mitelhand', g: 'm', D: 'mitelhandu', C: 'mitelhandowi', B: 'mitelhand', N: 'mitelhandem', Ms: 'mitelhandzie' },
  }),
  zadek: plain({
    official: { M: 'zadek', g: 'm', D: 'zadka', C: 'zadkowi', B: 'zadek', N: 'zadkiem', Ms: 'zadku' },
    colloquial: { M: 'hinterhand', g: 'm', D: 'hinterhandu', C: 'hinterhandowi', B: 'hinterhand', N: 'hinterhandem', Ms: 'hinterhandzie' },
  }),
  oczko: plain({
    official: { M: 'oczko', g: 'n', D: 'oczka', B: 'oczko', Mlm: 'oczka', Dlm: 'oczek', Blm: 'oczka', Nlm: 'oczkami', Mslm: 'oczkach' },
    colloquial: { M: 'auga', g: 'f', D: 'augi', B: 'augę', Mlm: 'augi', Dlm: 'aug', Blm: 'augi', Nlm: 'augami', Mslm: 'augach' },
  }),
  skat: plain(same({ M: 'skat', g: 'm', D: 'skata', C: 'skatowi', B: 'skat', N: 'skatem', Ms: 'skacie' })),
  licytacja: plain({
    official: { M: 'licytacja', g: 'f', D: 'licytacji', B: 'licytację', N: 'licytacją', Ms: 'licytacji' },
    colloquial: { M: 'reizowanie', g: 'n', D: 'reizowania', B: 'reizowanie', N: 'reizowaniem', Ms: 'reizowaniu' },
  }),
  graKolorowa: plain({
    official: { M: 'gra kolorowa', g: 'f', D: 'gry kolorowej', B: 'grę kolorową', N: 'grą kolorową', Ms: 'grze kolorowej' },
    colloquial: { M: 'farbszpil', g: 'm', D: 'farbszpila', B: 'farbszpila', N: 'farbszpilem', Ms: 'farbszpilu' },
  }),
  grand: plain(same({ M: 'grand', g: 'm', D: 'granda', B: 'granda', N: 'grandem', Ms: 'grandzie' })),
  null: plain({
    official: { M: 'null', g: 'm', D: 'nulla', B: 'nulla', N: 'nullem', Ms: 'nullu', Mlm: 'nulle' },
    colloquial: { M: 'nul', g: 'm', D: 'nula', B: 'nula', N: 'nulem', Ms: 'nulu', Mlm: 'nule' },
  }),

  // Rangi kart (używane też do nazw kart — muszą mieć rodzaj `g`).
  siodemka: plain(same({ M: 'siódemka', g: 'f', Mlm: 'siódemki', Dlm: 'siódemek' })),
  osemka: plain(same({ M: 'ósemka', g: 'f', Mlm: 'ósemki', Dlm: 'ósemek' })),
  dziewiatka: plain(same({ M: 'dziewiątka', g: 'f', Mlm: 'dziewiątki', Dlm: 'dziewiątek' })),
  dziesiatka: plain(same({ M: 'dziesiątka', g: 'f', D: 'dziesiątki', B: 'dziesiątkę', N: 'dziesiątką', Mlm: 'dziesiątki', Dlm: 'dziesiątek' })),
  walet: byDeck({
    altenburg: {
      official: { M: 'niżnik', g: 'm', D: 'niżnika', B: 'niżnika', N: 'niżnikiem', Mlm: 'niżniki', Dlm: 'niżników', Blm: 'niżniki', Nlm: 'niżnikami' },
      colloquial: { M: 'uner', g: 'm', D: 'unera', B: 'unera', N: 'unerem', Mlm: 'unery', Dlm: 'unerów', Blm: 'unery', Nlm: 'unerami' },
    },
    french: {
      official: { M: 'walet', g: 'm', D: 'waleta', B: 'waleta', N: 'waletem', Mlm: 'walety', Dlm: 'waletów', Blm: 'walety', Nlm: 'waletami' },
      colloquial: { M: 'jopek', g: 'm', D: 'jopka', B: 'jopka', N: 'jopkiem', Mlm: 'jopki', Dlm: 'jopków', Blm: 'jopki', Nlm: 'jopkami' },
    },
  }),
  dama: byDeck({
    altenburg: {
      official: { M: 'wyżnik', g: 'm', D: 'wyżnika', B: 'wyżnika', N: 'wyżnikiem', Mlm: 'wyżniki', Dlm: 'wyżników' },
      colloquial: { M: 'ober', g: 'm', D: 'obera', B: 'obera', N: 'oberem', Mlm: 'obery', Dlm: 'oberów' },
    },
    french: same({ M: 'dama', g: 'f', D: 'damy', B: 'damę', N: 'damą', Mlm: 'damy', Dlm: 'dam' }),
  }),
  krol: plain(same({ M: 'król', g: 'm', D: 'króla', B: 'króla', N: 'królem', Mlm: 'króle', Dlm: 'królów' })),
  as: byDeck({
    altenburg: {
      official: { M: 'as', g: 'm', D: 'asa', B: 'asa', N: 'asem', Mlm: 'asy', Dlm: 'asów' },
      colloquial: { M: 'daus', g: 'm', D: 'dausa', B: 'dausa', N: 'dausem', Mlm: 'dausy', Dlm: 'dausów' },
    },
    french: same({ M: 'as', g: 'm', D: 'asa', B: 'asa', N: 'asem', Mlm: 'asy', Dlm: 'asów' }),
  }),
};

export function formsFor(term: Term, ctx: TextContext): Forms {
  const registers = term.kind === 'plain' ? term.forms : term.byDeck[ctx.deck];
  return registers[ctx.register];
}

/** Wszystkie warianty form (2 dla terminów zwykłych, 4 dla zależnych od talii). */
export function formVariants(term: Term): Forms[] {
  const registerSets = term.kind === 'plain' ? [term.forms] : [term.byDeck.altenburg, term.byDeck.french];
  return registerSets.flatMap((r) => [r.official, r.colloquial]);
}
```

- [ ] **Step 5: Uruchom test**

Run: `npx vitest run src/glossary/terms.test.ts`
Expected: PASS (4 testy).

- [ ] **Step 6: Commit**

```bash
git add src/glossary
git commit -m "feat(glossary): typy i terminy z odmianą" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Słownik — nazwy kart

**Files:**
- Create: `src/glossary/cardNames.ts`
- Test: `src/glossary/cardNames.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/glossary/cardNames.test.ts
import { describe, expect, it } from 'vitest';
import { RANKS } from '../engine';
import { RANK_TERM, cardName, rankLabel, suitName } from './cardNames';
import { TERMS, formVariants } from './terms';

describe('nazwy kart', () => {
  it('Altenburg, oficjalnie: przymiotnik zgodny z rodzajem', () => {
    const ctx = { deck: 'altenburg', register: 'official' } as const;
    expect(cardName('c-J', ctx)).toBe('niżnik żołędny');
    expect(cardName('h-10', ctx)).toBe('dziesiątka czerwienna');
    expect(cardName('s-A', ctx)).toBe('as zielony');
  });

  it('Altenburg, potocznie', () => {
    expect(cardName('d-A', { deck: 'altenburg', register: 'colloquial' })).toBe('daus szele');
  });

  it('talia francuska: nazwa koloru po figurze', () => {
    expect(cardName('h-10', { deck: 'french', register: 'official' })).toBe('dziesiątka kier');
    expect(cardName('s-Q', { deck: 'french', register: 'official' })).toBe('dama pik');
    expect(cardName('c-J', { deck: 'french', register: 'colloquial' })).toBe('jopek trefl');
  });

  it('nazwy kolorów', () => {
    expect(suitName('c', { deck: 'altenburg', register: 'official' })).toBe('żołądź');
    expect(suitName('c', { deck: 'french', register: 'official' })).toBe('trefl');
  });

  it('oznaczenia figur na kartach', () => {
    expect(rankLabel('c-J', { deck: 'altenburg', register: 'official' })).toBe('N');
    expect(rankLabel('c-J', { deck: 'french', register: 'official' })).toBe('W');
    expect(rankLabel('h-10', { deck: 'french', register: 'colloquial' })).toBe('10');
  });

  it('każda ranga ma termin z rodzajem gramatycznym w każdym wariancie', () => {
    for (const rank of RANKS) {
      const term = TERMS[RANK_TERM[rank]];
      expect(term, rank).toBeDefined();
      for (const forms of formVariants(term)) expect(forms.g, rank).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/glossary/cardNames.test.ts`
Expected: FAIL — „Failed to resolve import "./cardNames"”.

- [ ] **Step 3: Zaimplementuj**

```ts
// src/glossary/cardNames.ts
// DANE DO WERYFIKACJI przez autora kursu — patrz specyfikacja, sekcja 8.1.
import { rankOf, suitOf, type CardId, type Rank, type Suit } from '../engine';
import { TERMS, formsFor } from './terms';
import type { DeckKind, Register, TextContext } from './types';

export interface SuitName {
  /** Nazwa koloru jako rzeczownik, np. „czerwień”, „kier”. */
  noun: string;
  /** Przymiotnik do nazwy karty; gdy brak — nazwa karty to „figura + rzeczownik”. */
  adj?: { m: string; f: string };
}

export const SUIT_NAMES: Record<DeckKind, Record<Register, Record<Suit, SuitName>>> = {
  altenburg: {
    official: {
      c: { noun: 'żołądź', adj: { m: 'żołędny', f: 'żołędna' } },
      s: { noun: 'zielone', adj: { m: 'zielony', f: 'zielona' } },
      h: { noun: 'czerwień', adj: { m: 'czerwienny', f: 'czerwienna' } },
      d: { noun: 'dzwonek', adj: { m: 'dzwonkowy', f: 'dzwonkowa' } },
    },
    colloquial: {
      c: { noun: 'ajchel' },
      s: { noun: 'grin' },
      h: { noun: 'herc' },
      d: { noun: 'szele' },
    },
  },
  french: {
    official: { c: { noun: 'trefl' }, s: { noun: 'pik' }, h: { noun: 'kier' }, d: { noun: 'karo' } },
    colloquial: { c: { noun: 'trefl' }, s: { noun: 'pik' }, h: { noun: 'kier' }, d: { noun: 'karo' } },
  },
};

export const RANK_TERM: Record<Rank, string> = {
  '7': 'siodemka',
  '8': 'osemka',
  '9': 'dziewiatka',
  '10': 'dziesiatka',
  J: 'walet',
  Q: 'dama',
  K: 'krol',
  A: 'as',
};

const NUMBERS = { '7': '7', '8': '8', '9': '9', '10': '10' } as const;

/** Oznaczenie w rogu karty. */
export const RANK_LABELS: Record<DeckKind, Record<Register, Record<Rank, string>>> = {
  altenburg: {
    official: { ...NUMBERS, J: 'N', Q: 'W', K: 'K', A: 'A' },
    colloquial: { ...NUMBERS, J: 'U', Q: 'O', K: 'K', A: 'D' },
  },
  french: {
    official: { ...NUMBERS, J: 'W', Q: 'D', K: 'K', A: 'A' },
    colloquial: { ...NUMBERS, J: 'J', Q: 'D', K: 'K', A: 'A' },
  },
};

export function suitName(suit: Suit, ctx: TextContext): string {
  return SUIT_NAMES[ctx.deck][ctx.register][suit].noun;
}

export function cardName(card: CardId, ctx: TextContext): string {
  const rank = formsFor(TERMS[RANK_TERM[rankOf(card)]], ctx);
  const suit = SUIT_NAMES[ctx.deck][ctx.register][suitOf(card)];
  if (suit.adj) return `${rank.M} ${rank.g === 'f' ? suit.adj.f : suit.adj.m}`;
  return `${rank.M} ${suit.noun}`;
}

export function rankLabel(card: CardId, ctx: TextContext): string {
  return RANK_LABELS[ctx.deck][ctx.register][rankOf(card)];
}
```

- [ ] **Step 4: Uruchom test**

Run: `npx vitest run src/glossary/cardNames.test.ts`
Expected: PASS (6 testów).

- [ ] **Step 5: Commit**

```bash
git add src/glossary
git commit -m "feat(glossary): nazwy kart dla obu talii i rejestrów" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Słownik — tokeny w tekstach

**Files:**
- Create: `src/glossary/text.ts`, `src/glossary/index.ts`
- Test: `src/glossary/text.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/glossary/text.test.ts
import { describe, expect, it } from 'vitest';
import { findTextIssues, resolveText } from './text';

const official = { deck: 'altenburg', register: 'official' } as const;
const colloquial = { deck: 'altenburg', register: 'colloquial' } as const;
const french = { deck: 'french', register: 'official' } as const;

describe('resolveText', () => {
  it('podstawia termin w wybranym przypadku', () => {
    expect(resolveText('Weź [[lewa:B]].', official)).toBe('Weź lewę.');
    expect(resolveText('Weź [[lewa:B]].', colloquial)).toBe('Weź sztycha.');
  });

  it('domyślnie używa mianownika i umie wielką literę', () => {
    expect(resolveText('[[Rozgrywajacy]] gra sam.', official)).toBe('Rozgrywający gra sam.');
    expect(resolveText('Gra [[rozgrywajacy]].', colloquial)).toBe('Gra szpiler.');
  });

  it('wybiera wariant frazy według rejestru', () => {
    expect(resolveText('{w tej lewie|w tym sztychu}', official)).toBe('w tej lewie');
    expect(resolveText('{w tej lewie|w tym sztychu}', colloquial)).toBe('w tym sztychu');
  });

  it('rozwiązuje tokeny wewnątrz wariantów', () => {
    expect(resolveText('{[[lewa]] wygrana|[[lewa]] wygrany}', colloquial)).toBe('sztych wygrany');
  });

  it('podstawia nazwy kart i kolorów', () => {
    expect(resolveText('[[card:h-10]]', french)).toBe('dziesiątka kier');
    expect(resolveText('[[Card:c-J]]', official)).toBe('Niżnik żołędny');
    expect(resolveText('[[suit:c]]', official)).toBe('żołądź');
  });

  it('awaryjnie: nieznany termin zostaje jak jest, brak formy → oficjalny mianownik', () => {
    expect(resolveText('[[nieznany]]', official)).toBe('[[nieznany]]');
    expect(resolveText('[[skat:Dlm]]', colloquial)).toBe('skat');
  });
});

describe('findTextIssues', () => {
  it('poprawny tekst nie ma problemów', () => {
    expect(findTextIssues('')).toEqual([]);
    expect(findTextIssues('Weź [[lewa:B]] {tu|tam} [[card:h-10]] [[suit:d]]')).toEqual([]);
  });

  it('zgłasza nieznane terminy, formy, karty i kolory', () => {
    expect(findTextIssues('[[nieznany]]')).toEqual(['Nieznany termin: nieznany']);
    expect(findTextIssues('[[lewa:X]]')).toEqual(['Nieznana forma: X']);
    expect(findTextIssues('[[skat:Dlm]]')).toEqual(['Brak formy Dlm dla terminu skat']);
    expect(findTextIssues('[[card:h-11]]')).toEqual(['Nieznana karta: h-11']);
    expect(findTextIssues('[[suit:x]]')).toEqual(['Nieznany kolor: x']);
    expect(findTextIssues('[[lewa:B:C]]')).toEqual(['Zły token: lewa:B:C']);
  });

  it('zgłasza błędy składni', () => {
    expect(findTextIssues('{a|}')).toEqual(['Pusta alternatywa: {a|}']);
    expect(findTextIssues('{bez kreski}')).toEqual(['Niedomknięta alternatywa']);
    expect(findTextIssues('[[lewa')).toEqual(['Niedomknięty token']);
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/glossary/text.test.ts`
Expected: FAIL — „Failed to resolve import "./text"”.

- [ ] **Step 3: Zaimplementuj `text.ts`**

```ts
// src/glossary/text.ts
import { isCardId, isSuit } from '../engine';
import { cardName, suitName } from './cardNames';
import { TERMS, formVariants, formsFor } from './terms';
import { CASES, type CaseKey, type TextContext } from './types';

const ALT = /\{([^{}|]*)\|([^{}|]*)\}/g;
const TOKEN = /\[\[([^[\]]+)\]\]/g;

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isCaseKey = (s: string): s is CaseKey => (CASES as readonly string[]).includes(s);
const hasTerm = (key: string) => Object.hasOwn(TERMS, key);

interface ParsedToken {
  key: string;
  arg: string | undefined;
  capital: boolean;
  extra: boolean;
}

function parseToken(raw: string): ParsedToken {
  const [head = '', arg, ...rest] = raw.split(':');
  return { key: lowerFirst(head), arg, capital: head !== lowerFirst(head), extra: rest.length > 0 };
}

function lookup(key: string, arg: string | undefined, ctx: TextContext): string | null {
  if (key === 'card') return arg !== undefined && isCardId(arg) ? cardName(arg, ctx) : null;
  if (key === 'suit') return arg !== undefined && isSuit(arg) ? suitName(arg, ctx) : null;
  if (!hasTerm(key)) return null;
  const term = TERMS[key];
  const caseKey = arg ?? 'M';
  const word = isCaseKey(caseKey) ? formsFor(term, ctx)[caseKey] : undefined;
  return word ?? formsFor(term, { ...ctx, register: 'official' }).M;
}

function resolveToken(raw: string, ctx: TextContext): string {
  const { key, arg, capital, extra } = parseToken(raw);
  const word = extra ? null : lookup(key, arg, ctx);
  if (word === null) return `[[${raw}]]`;
  return capital ? upperFirst(word) : word;
}

export function resolveText(text: string, ctx: TextContext): string {
  const chosen = text.replace(ALT, (_match, official: string, colloquial: string) =>
    ctx.register === 'official' ? official : colloquial,
  );
  return chosen.replace(TOKEN, (_match, raw: string) => resolveToken(raw, ctx));
}

function checkToken(raw: string): string | null {
  const { key, arg, extra } = parseToken(raw);
  if (extra) return `Zły token: ${raw}`;
  if (key === 'card') return arg !== undefined && isCardId(arg) ? null : `Nieznana karta: ${arg ?? ''}`;
  if (key === 'suit') return arg !== undefined && isSuit(arg) ? null : `Nieznany kolor: ${arg ?? ''}`;
  if (!hasTerm(key)) return `Nieznany termin: ${key}`;
  const caseKey = arg ?? 'M';
  if (!isCaseKey(caseKey)) return `Nieznana forma: ${caseKey}`;
  const missing = formVariants(TERMS[key]).some((forms) => forms[caseKey] === undefined);
  return missing ? `Brak formy ${caseKey} dla terminu ${key}` : null;
}

/** Lista problemów z tokenami i składnią w tekście (pusta = OK). */
export function findTextIssues(text: string): string[] {
  const issues: string[] = [];
  const withoutAlts = text.replace(ALT, (match, official: string, colloquial: string) => {
    if (official.trim() === '' || colloquial.trim() === '') issues.push(`Pusta alternatywa: ${match}`);
    return ' ';
  });
  if (/[{}|]/.test(withoutAlts)) issues.push('Niedomknięta alternatywa');
  for (const match of text.matchAll(TOKEN)) {
    const issue = checkToken(match[1]);
    if (issue) issues.push(issue);
  }
  const withoutTokens = text.replace(TOKEN, '');
  if (withoutTokens.includes('[[') || withoutTokens.includes(']]')) issues.push('Niedomknięty token');
  return issues;
}
```

```ts
// src/glossary/index.ts
export * from './types';
export * from './terms';
export * from './cardNames';
export * from './text';
```

- [ ] **Step 4: Uruchom testy słownika**

Run: `npx vitest run src/glossary`
Expected: PASS (3 pliki).

- [ ] **Step 5: Commit**

```bash
git add src/glossary
git commit -m "feat(glossary): rozwiązywanie i sprawdzanie tokenów w tekstach" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Zapis stanu w przeglądarce

**Files:**
- Create: `src/state/types.ts`, `src/state/storage.ts`, `src/test/storage.ts`
- Test: `src/state/storage.test.ts`

- [ ] **Step 1: Utwórz pomocnicze magazyny testowe**

```ts
// src/test/storage.ts
import { STORAGE_KEY, createDefaultState } from '../state/storage';
import type { AppState, Settings } from '../state/types';

export function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, String(value));
    },
  };
}

export function storageWithState(settings: Partial<Settings> = {}, lessons: AppState['lessons'] = {}): Storage {
  const state = createDefaultState();
  return createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ ...state, settings: { ...state.settings, ...settings }, lessons }),
  });
}

export function brokenStorage(): Storage {
  const fail = () => {
    throw new Error('Brak dostępu');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}
```

- [ ] **Step 2: Napisz test**

```ts
// src/state/storage.test.ts
import { describe, expect, it } from 'vitest';
import { brokenStorage, createMemoryStorage } from '../test/storage';
import { STORAGE_KEY, createDefaultState, loadState, migrate, saveState } from './storage';

describe('zapis stanu', () => {
  it('bez dostępu do pamięci: stan domyślny i komunikat', () => {
    expect(loadState(null)).toEqual({ state: createDefaultState(), notice: 'unavailable' });
    expect(loadState(brokenStorage()).notice).toBe('unavailable');
  });

  it('pusta pamięć: stan domyślny bez komunikatu', () => {
    const { state, notice } = loadState(createMemoryStorage());
    expect(notice).toBeNull();
    expect(state.settings).toEqual({ deck: 'altenburg', register: 'official', unlockAll: false });
  });

  it('zapisany stan wraca po odczycie', () => {
    const storage = createMemoryStorage();
    const state = createDefaultState();
    state.settings.deck = 'french';
    state.lessons['m1-l01'] = { status: 'passed', bestScore: 1, attempts: 2 };
    expect(saveState(storage, state)).toBe(true);
    expect(loadState(storage)).toEqual({ state, notice: null });
  });

  it('uszkodzony JSON lub nieznana wersja: reset z komunikatem', () => {
    expect(loadState(createMemoryStorage({ [STORAGE_KEY]: 'nie json' })).notice).toBe('corrupted');
    expect(loadState(createMemoryStorage({ [STORAGE_KEY]: '{"schemaVersion":99}' })).notice).toBe('corrupted');
  });

  it('migracja v1 naprawia złe pola i odrzuca złe wpisy lekcji', () => {
    const state = migrate({
      schemaVersion: 1,
      settings: { deck: 'xyz', register: 'colloquial', unlockAll: 'tak' },
      lessons: {
        ok: { status: 'failed', bestScore: 0.5, attempts: 1 },
        zly: { status: 'cos', bestScore: 2, attempts: -1 },
      },
    });
    expect(state).toEqual({
      schemaVersion: 1,
      settings: { deck: 'altenburg', register: 'colloquial', unlockAll: false },
      lessons: { ok: { status: 'failed', bestScore: 0.5, attempts: 1 } },
    });
  });

  it('zapis nie udaje się bez pamięci', () => {
    expect(saveState(null, createDefaultState())).toBe(false);
    expect(saveState(brokenStorage(), createDefaultState())).toBe(false);
  });

  it('każdy stan domyślny to nowy obiekt', () => {
    const a = createDefaultState();
    a.settings.deck = 'french';
    expect(createDefaultState().settings.deck).toBe('altenburg');
  });
});
```

- [ ] **Step 3: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/state/storage.test.ts`
Expected: FAIL — „Failed to resolve import "./storage"”.

- [ ] **Step 4: Zaimplementuj `types.ts`**

```ts
// src/state/types.ts
import type { DeckKind, Register } from '../glossary';

export interface Settings {
  deck: DeckKind;
  register: Register;
  unlockAll: boolean;
}

export interface LessonProgress {
  status: 'passed' | 'failed';
  /** Najlepszy wynik 0–1. */
  bestScore: number;
  attempts: number;
}

export interface AppState {
  schemaVersion: 1;
  settings: Settings;
  lessons: Record<string, LessonProgress>;
}
```

- [ ] **Step 5: Zaimplementuj `storage.ts`**

```ts
// src/state/storage.ts
import type { AppState, LessonProgress, Settings } from './types';

export const STORAGE_KEY = 'skat-trener:v1';

export type LoadNotice = 'unavailable' | 'corrupted' | null;

export interface LoadResult {
  state: AppState;
  notice: LoadNotice;
}

export function createDefaultState(): AppState {
  return {
    schemaVersion: 1,
    settings: { deck: 'altenburg', register: 'official', unlockAll: false },
    lessons: {},
  };
}

/** localStorage, o ile działa (tryb prywatny / blokada → null). */
export function getBrowserStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const probe = '__skat_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function loadState(storage: Storage | null): LoadResult {
  if (!storage) return { state: createDefaultState(), notice: 'unavailable' };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: createDefaultState(), notice: 'unavailable' };
  }
  if (raw === null) return { state: createDefaultState(), notice: null };
  try {
    const migrated = migrate(JSON.parse(raw));
    if (migrated) return { state: migrated, notice: null };
  } catch {
    // uszkodzony JSON — obsłużony niżej
  }
  return { state: createDefaultState(), notice: 'corrupted' };
}

export function saveState(storage: Storage | null, state: AppState): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Sprowadza zapisane dane do bieżącego schematu; null = nie da się odczytać. */
export function migrate(data: unknown): AppState | null {
  if (!isRecord(data)) return null;
  switch (data.schemaVersion) {
    case 1:
      return sanitizeV1(data);
    default:
      return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback;
}

function sanitizeV1(data: Record<string, unknown>): AppState {
  const defaults = createDefaultState().settings;
  const raw: Record<string, unknown> = isRecord(data.settings) ? data.settings : {};
  const settings: Settings = {
    deck: oneOf(raw.deck, ['altenburg', 'french'] as const, defaults.deck),
    register: oneOf(raw.register, ['official', 'colloquial'] as const, defaults.register),
    unlockAll: typeof raw.unlockAll === 'boolean' ? raw.unlockAll : defaults.unlockAll,
  };
  const lessons: Record<string, LessonProgress> = {};
  if (isRecord(data.lessons)) {
    for (const [id, value] of Object.entries(data.lessons)) {
      const progress = sanitizeLesson(value);
      if (progress) lessons[id] = progress;
    }
  }
  return { schemaVersion: 1, settings, lessons };
}

function sanitizeLesson(value: unknown): LessonProgress | null {
  if (!isRecord(value)) return null;
  const { status, bestScore, attempts } = value;
  if (status !== 'passed' && status !== 'failed') return null;
  if (typeof bestScore !== 'number' || !Number.isFinite(bestScore) || bestScore < 0 || bestScore > 1) return null;
  if (typeof attempts !== 'number' || !Number.isInteger(attempts) || attempts < 0) return null;
  return { status, bestScore, attempts };
}
```

- [ ] **Step 6: Uruchom test**

Run: `npx vitest run src/state/storage.test.ts`
Expected: PASS (7 testów).

- [ ] **Step 7: Commit**

```bash
git add src/state src/test
git commit -m "feat(state): wersjonowany zapis postępu w localStorage" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Typy treści, losowanie zadań, postęp kursu

**Files:**
- Create: `src/content/types.ts`, `src/content/pick.ts`, `src/state/progress.ts`
- Test: `src/content/pick.test.ts`, `src/state/progress.test.ts`

- [ ] **Step 1: Utwórz typy treści**

```ts
// src/content/types.ts
import type { CardId, GameType, Seat } from '../engine';

export interface TheoryStep {
  title?: string;
  text: string;
  cards?: CardId[];
  cardsCaption?: string;
}

/** Odpowiedź w quizie: tekst ALBO karta. */
export interface QuizOption {
  id: string;
  text?: string;
  card?: CardId;
}

export interface QuizExerciseData {
  type: 'quiz';
  id: string;
  prompt: string;
  cards?: CardId[];
  options: QuizOption[];
  correct: string;
  explain: string;
}

export interface PlayCardExerciseData {
  type: 'playCard';
  id: string;
  prompt: string;
  game: GameType;
  /** Kto wyszedł do lewy; gracz siedzi na miejscu leader + trick.length. */
  leader: Seat;
  trick: CardId[];
  hand: CardId[];
  /** `legal` — wystarczy dozwolona karta; `best` — tylko karty z `best`. */
  mode: 'legal' | 'best';
  best?: CardId[];
  /** Przyciemniaj niedozwolone karty (od lekcji 8). */
  showLegal?: boolean;
  explain: string;
  wrongExplain?: Partial<Record<CardId, string>>;
}

export type ExerciseData = QuizExerciseData | PlayCardExerciseData;

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

- [ ] **Step 2: Napisz test losowania**

```ts
// src/content/pick.test.ts
import { describe, expect, it } from 'vitest';
import { pickExercises } from './pick';
import type { ExerciseData, Lesson } from './types';

const quiz = (id: string): ExerciseData => ({
  type: 'quiz', id, prompt: 'P', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correct: 'a', explain: 'E',
});

const lesson = (drawCount?: number): Lesson => ({
  id: 'l', title: 'T', summary: '', steps: [], exercises: ['1', '2', '3', '4'].map(quiz), drawCount,
});

describe('pickExercises', () => {
  it('bez drawCount zwraca wszystkie zadania po kolei (nowa tablica)', () => {
    const l = lesson();
    const picked = pickExercises(l);
    expect(picked.map((e) => e.id)).toEqual(['1', '2', '3', '4']);
    expect(picked).not.toBe(l.exercises);
  });

  it('z drawCount losuje tyle różnych zadań z puli', () => {
    const picked = pickExercises(lesson(2), () => 0);
    expect(picked).toHaveLength(2);
    expect(new Set(picked.map((e) => e.id)).size).toBe(2);
  });
});
```

- [ ] **Step 3: Zaimplementuj losowanie**

```ts
// src/content/pick.ts
import type { ExerciseData, Lesson } from './types';

export function pickExercises(lesson: Lesson, random: () => number = Math.random): ExerciseData[] {
  const pool = [...lesson.exercises];
  const count = lesson.drawCount ?? pool.length;
  if (count >= pool.length) return pool;
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
```

- [ ] **Step 4: Napisz test postępu**

```ts
// src/state/progress.test.ts
import { describe, expect, it } from 'vitest';
import type { Course, Lesson } from '../content/types';
import { lessonAfter, lessonNumber, lessonStatuses, nextLessonId, recordResult } from './progress';
import { createDefaultState } from './storage';

const lesson = (id: string): Lesson => ({ id, title: id, summary: '', steps: [], exercises: [] });
const course: Course = {
  modules: [
    { id: 'm1', title: 'M1', lessons: [lesson('a'), lesson('b')] },
    { id: 'm2', title: 'M2', lessons: [lesson('c')] },
  ],
};

describe('postęp kursu', () => {
  it('na starcie dostępna jest tylko pierwsza lekcja', () => {
    expect(lessonStatuses(course, createDefaultState())).toEqual({ a: 'available', b: 'locked', c: 'locked' });
    expect(nextLessonId(course, createDefaultState())).toBe('a');
  });

  it('zaliczenie odblokowuje następną lekcję, także w kolejnym module', () => {
    let state = recordResult(createDefaultState(), 'a', 1);
    state = recordResult(state, 'b', 0.8);
    expect(lessonStatuses(course, state)).toEqual({ a: 'passed', b: 'passed', c: 'available' });
    expect(nextLessonId(course, state)).toBe('c');
  });

  it('wynik poniżej 80% nie zalicza lekcji', () => {
    const state = recordResult(createDefaultState(), 'a', 0.75);
    expect(state.lessons.a).toEqual({ status: 'failed', bestScore: 0.75, attempts: 1 });
    expect(lessonStatuses(course, state).b).toBe('locked');
  });

  it('gorszy wynik nie cofa zaliczenia ani najlepszego wyniku', () => {
    let state = recordResult(createDefaultState(), 'a', 1);
    state = recordResult(state, 'a', 0.2);
    expect(state.lessons.a).toEqual({ status: 'passed', bestScore: 1, attempts: 2 });
  });

  it('„odblokuj wszystko” udostępnia każdą lekcję', () => {
    const state = createDefaultState();
    state.settings.unlockAll = true;
    expect(lessonStatuses(course, state)).toEqual({ a: 'available', b: 'available', c: 'available' });
  });

  it('po zaliczeniu wszystkiego nie ma następnej lekcji', () => {
    let state = createDefaultState();
    for (const id of ['a', 'b', 'c']) state = recordResult(state, id, 1);
    expect(nextLessonId(course, state)).toBeNull();
  });

  it('numeracja i kolejna lekcja', () => {
    expect(lessonNumber(course, 'c')).toBe(3);
    expect(lessonAfter(course, 'b')?.id).toBe('c');
    expect(lessonAfter(course, 'c')).toBeNull();
  });
});
```

- [ ] **Step 5: Zaimplementuj postęp**

```ts
// src/state/progress.ts
import type { Course, Lesson } from '../content/types';
import type { AppState } from './types';

export const PASS_THRESHOLD = 0.8;

export type LessonStatus = 'locked' | 'available' | 'passed';

export function flattenLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function isPassingScore(score: number): boolean {
  return score >= PASS_THRESHOLD;
}

export function lessonStatuses(course: Course, state: AppState): Record<string, LessonStatus> {
  const statuses: Record<string, LessonStatus> = {};
  let previousPassed = true;
  for (const lesson of flattenLessons(course)) {
    const passed = state.lessons[lesson.id]?.status === 'passed';
    statuses[lesson.id] = passed ? 'passed' : state.settings.unlockAll || previousPassed ? 'available' : 'locked';
    previousPassed = passed;
  }
  return statuses;
}

export function nextLessonId(course: Course, state: AppState): string | null {
  const statuses = lessonStatuses(course, state);
  return flattenLessons(course).find((lesson) => statuses[lesson.id] === 'available')?.id ?? null;
}

export function lessonNumber(course: Course, lessonId: string): number {
  return flattenLessons(course).findIndex((lesson) => lesson.id === lessonId) + 1;
}

export function lessonAfter(course: Course, lessonId: string): Lesson | null {
  const lessons = flattenLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;
}

export function recordResult(state: AppState, lessonId: string, score: number): AppState {
  const previous = state.lessons[lessonId];
  const passed = isPassingScore(score) || previous?.status === 'passed';
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: {
        status: passed ? 'passed' : 'failed',
        bestScore: Math.max(score, previous?.bestScore ?? 0),
        attempts: (previous?.attempts ?? 0) + 1,
      },
    },
  };
}
```

- [ ] **Step 6: Uruchom testy**

Run: `npx vitest run src/content/pick.test.ts src/state/progress.test.ts`
Expected: PASS (2 + 7 testów).

- [ ] **Step 7: Commit**

```bash
git add src/content src/state
git commit -m "feat: typy treści, losowanie zadań i postęp kursu" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Kontekst stanu aplikacji

**Files:**
- Create: `src/state/AppStateContext.tsx`, `src/test/render.tsx`
- Test: `src/state/AppStateContext.test.tsx`

- [ ] **Step 1: Utwórz helper renderowania**

```tsx
// src/test/render.tsx
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../state/AppStateContext';
import { createMemoryStorage } from './storage';

export function renderWithProviders(
  ui: ReactElement,
  { storage = createMemoryStorage(), route = '/' }: { storage?: Storage | null; route?: string } = {},
) {
  const result = render(
    <AppStateProvider storage={storage}>
      <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {ui}
      </MemoryRouter>
    </AppStateProvider>,
  );
  return { ...result, storage };
}
```

- [ ] **Step 2: Napisz test**

```tsx
// src/state/AppStateContext.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { createMemoryStorage } from '../test/storage';
import { useAppState, useText } from './AppStateContext';
import { STORAGE_KEY } from './storage';

function Probe() {
  const { state, notice, updateSettings, recordLessonResult, resetProgress } = useAppState();
  const t = useText();
  return (
    <div>
      <p>talia: {state.settings.deck}</p>
      <p>komunikat: {notice ?? 'brak'}</p>
      <p>termin: {t('[[lewa]]')}</p>
      <p>lekcje: {Object.keys(state.lessons).join(',') || 'brak'}</p>
      <button onClick={() => updateSettings({ deck: 'french', register: 'colloquial' })}>zmień</button>
      <button onClick={() => recordLessonResult('x', 1)}>zalicz</button>
      <button onClick={resetProgress}>zeruj</button>
    </div>
  );
}

describe('AppStateProvider', () => {
  it('zmienia ustawienia, tłumaczy teksty i zapisuje w pamięci', async () => {
    const user = userEvent.setup();
    const { storage } = renderWithProviders(<Probe />);
    expect(screen.getByText('termin: lewa')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zmień' }));
    expect(screen.getByText('talia: french')).toBeInTheDocument();
    expect(screen.getByText('termin: sztych')).toBeInTheDocument();
    expect(JSON.parse(storage!.getItem(STORAGE_KEY)!).settings.deck).toBe('french');
  });

  it('reset zeruje postęp, ale zostawia ustawienia', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />);
    await user.click(screen.getByRole('button', { name: 'zmień' }));
    await user.click(screen.getByRole('button', { name: 'zalicz' }));
    expect(screen.getByText('lekcje: x')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zeruj' }));
    expect(screen.getByText('lekcje: brak')).toBeInTheDocument();
    expect(screen.getByText('talia: french')).toBeInTheDocument();
  });

  it('bez pamięci zgłasza komunikat', () => {
    renderWithProviders(<Probe />, { storage: null });
    expect(screen.getByText('komunikat: unavailable')).toBeInTheDocument();
  });

  it('uszkodzony zapis zgłasza komunikat', () => {
    renderWithProviders(<Probe />, { storage: createMemoryStorage({ [STORAGE_KEY]: '{' }) });
    expect(screen.getByText('komunikat: corrupted')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/state/AppStateContext.test.tsx`
Expected: FAIL — „Failed to resolve import "../state/AppStateContext"”.

- [ ] **Step 4: Zaimplementuj**

```tsx
// src/state/AppStateContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { resolveText, type TextContext } from '../glossary';
import { recordResult } from './progress';
import { createDefaultState, getBrowserStorage, loadState, saveState, type LoadNotice } from './storage';
import type { AppState, Settings } from './types';

interface AppStateApi {
  state: AppState;
  notice: LoadNotice;
  updateSettings: (patch: Partial<Settings>) => void;
  recordLessonResult: (lessonId: string, score: number) => void;
  resetProgress: () => void;
  dismissNotice: () => void;
}

const AppStateCtx = createContext<AppStateApi | null>(null);

interface ProviderProps {
  children: ReactNode;
  /** undefined = localStorage przeglądarki; null = brak pamięci. */
  storage?: Storage | null;
}

export function AppStateProvider({ children, storage }: ProviderProps) {
  const [store] = useState<Storage | null>(() => (storage === undefined ? getBrowserStorage() : storage));
  const [initial] = useState(() => loadState(store));
  const [state, setState] = useState<AppState>(initial.state);
  const [notice, setNotice] = useState<LoadNotice>(initial.notice);

  useEffect(() => {
    if (store && !saveState(store, state)) setNotice('unavailable');
  }, [store, state]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);
  const recordLessonResult = useCallback((lessonId: string, score: number) => {
    setState((s) => recordResult(s, lessonId, score));
  }, []);
  const resetProgress = useCallback(() => {
    setState((s) => ({ ...createDefaultState(), settings: s.settings }));
  }, []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const api = useMemo(
    () => ({ state, notice, updateSettings, recordLessonResult, resetProgress, dismissNotice }),
    [state, notice, updateSettings, recordLessonResult, resetProgress, dismissNotice],
  );
  return <AppStateCtx.Provider value={api}>{children}</AppStateCtx.Provider>;
}

export function useAppState(): AppStateApi {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useAppState użyty poza AppStateProvider');
  return ctx;
}

export function useTextContext(): TextContext {
  const { deck, register } = useAppState().state.settings;
  return useMemo(() => ({ deck, register }), [deck, register]);
}

export function useText(): (text: string) => string {
  const ctx = useTextContext();
  return useCallback((text: string) => resolveText(text, ctx), [ctx]);
}
```

- [ ] **Step 5: Uruchom test**

Run: `npx vitest run src/state/AppStateContext.test.tsx`
Expected: PASS (4 testy).

- [ ] **Step 6: Commit**

```bash
git add src/state src/test
git commit -m "feat(state): provider stanu aplikacji i hooki tekstowe" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Karty — symbole, karta, ręka, stół

**Files:**
- Create: `src/cards/SuitSymbol.tsx`, `src/cards/PlayingCard.tsx`, `src/cards/Hand.tsx`, `src/cards/TrickView.tsx`
- Test: `src/cards/cards.test.tsx`

- [ ] **Step 1: Napisz test**

```tsx
// src/cards/cards.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import { storageWithState } from '../test/storage';
import { Hand } from './Hand';
import { PlayingCard } from './PlayingCard';
import { TrickView } from './TrickView';

describe('karty', () => {
  it('karta ma nazwę z wybranej talii (domyślnie Altenburg)', () => {
    renderWithProviders(<PlayingCard card="h-10" />);
    expect(screen.getByRole('img', { name: 'dziesiątka czerwienna' })).toBeInTheDocument();
  });

  it('w talii francuskiej nazwy francuskie', () => {
    renderWithProviders(<PlayingCard card="c-J" />, { storage: storageWithState({ deck: 'french' }) });
    expect(screen.getByRole('img', { name: 'walet trefl' })).toBeInTheDocument();
  });

  it('karta z onClick jest przyciskiem', async () => {
    const onClick = vi.fn();
    renderWithProviders(<PlayingCard card="s-A" onClick={onClick} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'as zielony' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ręka zgłasza kliknięcie karty i zaznacza wybraną', async () => {
    const onCardClick = vi.fn();
    renderWithProviders(<Hand cards={['h-7', 'c-A']} selected="c-A" onCardClick={onCardClick} />);
    expect(screen.getByRole('button', { name: 'as żołędny' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(screen.getByRole('button', { name: 'siódemka czerwienna' }));
    expect(onCardClick).toHaveBeenCalledWith('h-7');
  });

  it('stół podpisuje karty miejscami graczy', () => {
    renderWithProviders(<TrickView cards={['h-K', 'h-A']} leader={2} you={0} />);
    expect(screen.getByText('Zadek')).toBeInTheDocument();
    expect(screen.getByText('Ty')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/cards/cards.test.tsx`
Expected: FAIL — „Failed to resolve import "./Hand"”.

- [ ] **Step 3: Zaimplementuj `SuitSymbol.tsx`**

```tsx
// src/cards/SuitSymbol.tsx
// Własne, proste symbole (zastępcze). Grafiki z Wikimedia dochodzą w Planie 3.
import type { Suit } from '../engine';
import type { DeckKind } from '../glossary';

export const SUIT_COLORS: Record<DeckKind, Record<Suit, string>> = {
  altenburg: { c: '#6d4c1f', s: '#2e7d32', h: '#c62828', d: '#d39b00' },
  french: { c: '#1b1b1b', s: '#1b1b1b', h: '#c62828', d: '#c62828' },
};

const HEART =
  'M50 88 C20 65 5 46 5 30 C5 15 17 5 30 5 C40 5 47 12 50 20 C53 12 60 5 70 5 C83 5 95 15 95 30 C95 46 80 65 50 88 Z';
const SPADE =
  'M50 5 C35 25 8 40 8 60 C8 75 20 82 32 82 C40 82 46 78 48 74 C47 84 42 92 35 95 L65 95 C58 92 53 84 52 74 C54 78 60 82 68 82 C80 82 92 75 92 60 C92 40 65 25 50 5 Z';

/** Symbol koloru narysowany w polu 100×100. */
export function SuitSymbol({ suit, deck }: { suit: Suit; deck: DeckKind }) {
  const color = SUIT_COLORS[deck][suit];
  return deck === 'french' ? <FrenchSymbol suit={suit} color={color} /> : <GermanSymbol suit={suit} color={color} />;
}

function FrenchSymbol({ suit, color }: { suit: Suit; color: string }) {
  switch (suit) {
    case 'h':
      return <path d={HEART} fill={color} />;
    case 'd':
      return <path d="M50 4 L86 50 L50 96 L14 50 Z" fill={color} />;
    case 's':
      return <path d={SPADE} fill={color} />;
    case 'c':
      return (
        <g fill={color}>
          <circle cx="50" cy="28" r="19" />
          <circle cx="27" cy="58" r="19" />
          <circle cx="73" cy="58" r="19" />
          <path d="M45 50 C45 75 40 88 30 96 L70 96 C60 88 55 75 55 50 Z" />
        </g>
      );
  }
}

function GermanSymbol({ suit, color }: { suit: Suit; color: string }) {
  switch (suit) {
    case 'h':
      return <path d={HEART} fill={color} />;
    case 'c':
      return (
        <g>
          <rect x="46" y="6" width="8" height="16" rx="3" fill="#4e3412" />
          <ellipse cx="50" cy="64" rx="22" ry="30" fill={color} />
          <path d="M22 46 C22 22 78 22 78 46 C78 54 22 54 22 46 Z" fill="#4e3412" />
        </g>
      );
    case 's':
      return (
        <g>
          <path d="M50 96 L50 84 C18 74 8 42 50 4 C92 42 82 74 50 84" fill={color} />
          <path d="M50 84 L50 20" stroke="#1b5e20" strokeWidth="3" fill="none" />
        </g>
      );
    case 'd':
      return (
        <g>
          <circle cx="50" cy="12" r="6" fill={color} />
          <path
            d="M50 16 C30 16 26 36 26 54 C26 68 20 74 14 80 L86 80 C80 74 74 68 74 54 C74 36 70 16 50 16 Z"
            fill={color}
            stroke="#8a6400"
            strokeWidth="2"
          />
          <rect x="14" y="78" width="72" height="6" rx="3" fill="#8a6400" />
          <circle cx="50" cy="90" r="7" fill="#8a6400" />
        </g>
      );
  }
}
```

- [ ] **Step 4: Zaimplementuj `PlayingCard.tsx`**

```tsx
// src/cards/PlayingCard.tsx
import { suitOf, type CardId } from '../engine';
import { cardName, rankLabel } from '../glossary';
import { useTextContext } from '../state/AppStateContext';
import { SUIT_COLORS, SuitSymbol } from './SuitSymbol';

interface Props {
  card: CardId;
  selected?: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PlayingCard({ card, selected = false, dimmed = false, disabled = false, onClick }: Props) {
  const ctx = useTextContext();
  const label = cardName(card, ctx);
  const className = ['card', selected && 'card--selected', dimmed && 'card--dimmed'].filter(Boolean).join(' ');
  const face = <CardFace card={card} />;
  if (onClick) {
    return (
      <button type="button" className={className} aria-label={label} aria-pressed={selected} disabled={disabled} onClick={onClick}>
        {face}
      </button>
    );
  }
  return (
    <span className={className} role="img" aria-label={label}>
      {face}
    </span>
  );
}

function CardFace({ card }: { card: CardId }) {
  const ctx = useTextContext();
  const suit = suitOf(card);
  const color = SUIT_COLORS[ctx.deck][suit];
  const label = rankLabel(card, ctx);
  return (
    <svg viewBox="0 0 60 90" className="card__svg" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="58" height="88" rx="6" className="card__bg" />
      <text x="5" y="15" className="card__index" fill={color}>
        {label}
      </text>
      <g transform="translate(5 19) scale(0.12)">
        <SuitSymbol suit={suit} deck={ctx.deck} />
      </g>
      <g transform="translate(15 30) scale(0.3)">
        <SuitSymbol suit={suit} deck={ctx.deck} />
      </g>
      <g transform="rotate(180 30 45)">
        <text x="5" y="15" className="card__index" fill={color}>
          {label}
        </text>
      </g>
    </svg>
  );
}
```

- [ ] **Step 5: Zaimplementuj `Hand.tsx`**

```tsx
// src/cards/Hand.tsx
import type { CardId } from '../engine';
import { PlayingCard } from './PlayingCard';

interface HandProps {
  cards: CardId[];
  selected?: CardId | null;
  isDimmed?: (card: CardId) => boolean;
  onCardClick?: (card: CardId) => void;
  disabled?: boolean;
}

/** Ręka gracza: zachodzące na siebie karty, do klikania. */
export function Hand({ cards, selected = null, isDimmed, onCardClick, disabled = false }: HandProps) {
  return (
    <ul className="hand" aria-label="Twoje karty">
      {cards.map((card) => (
        <li key={card} className="hand__slot">
          <PlayingCard
            card={card}
            selected={card === selected}
            dimmed={isDimmed?.(card) ?? false}
            disabled={disabled}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

/** Rząd kart do pokazania (bez interakcji). */
export function CardRow({ cards }: { cards: CardId[] }) {
  return (
    <ul className="card-row">
      {cards.map((card) => (
        <li key={card}>
          <PlayingCard card={card} />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 6: Zaimplementuj `TrickView.tsx`**

```tsx
// src/cards/TrickView.tsx
import { nextSeat, type CardId, type Seat } from '../engine';
import { useText } from '../state/AppStateContext';
import { PlayingCard } from './PlayingCard';

export const SEAT_LABEL: Record<Seat, string> = { 0: '[[Przodek]]', 1: '[[Srodek]]', 2: '[[Zadek]]' };

interface Props {
  cards: CardId[];
  leader: Seat;
  you: Seat;
}

export function TrickView({ cards, leader, you }: Props) {
  const t = useText();
  return (
    <div className="trick" aria-label="Karty na stole">
      {cards.length === 0 ? (
        <p className="trick__empty">Stół jest pusty — wychodzisz pierwszy.</p>
      ) : (
        <ol className="trick__cards">
          {cards.map((card, i) => {
            const seat = nextSeat(leader, i);
            return (
              <li key={card} className="trick__slot">
                <PlayingCard card={card} />
                <span className="trick__label">{seat === you ? 'Ty' : t(SEAT_LABEL[seat])}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Uruchom test**

Run: `npx vitest run src/cards/cards.test.tsx`
Expected: PASS (5 testów).

- [ ] **Step 8: Commit**

```bash
git add src/cards
git commit -m "feat(cards): karty SVG obu talii, ręka i stół" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Tekst sformatowany, informacja zwrotna, ćwiczenie quiz

**Files:**
- Create: `src/components/RichText.tsx`, `src/components/Feedback.tsx`, `src/exercises/QuizExercise.tsx`
- Test: `src/exercises/QuizExercise.test.tsx`

- [ ] **Step 1: Napisz test**

```tsx
// src/exercises/QuizExercise.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { QuizExerciseData } from '../content/types';
import { renderWithProviders } from '../test/render';
import { QuizExercise } from './QuizExercise';

const textQuiz: QuizExerciseData = {
  type: 'quiz',
  id: 't-q1',
  prompt: 'Ile kart ma **[[skat]]**?',
  options: [
    { id: 'a', text: '2' },
    { id: 'b', text: '3' },
  ],
  correct: 'a',
  explain: '[[Skat]] to dwie karty.',
};

const cardQuiz: QuizExerciseData = {
  type: 'quiz',
  id: 't-q2',
  prompt: 'Wskaż [[card:d-J]].',
  options: [
    { id: 'a', card: 'd-J' },
    { id: 'b', card: 'h-J' },
  ],
  correct: 'a',
  explain: 'To [[card:d-J]].',
};

describe('QuizExercise', () => {
  it('pokazuje pytanie z tokenami i pogrubieniem', () => {
    renderWithProviders(<QuizExercise exercise={textQuiz} onAnswered={vi.fn()} />);
    expect(screen.getByText('skat', { selector: 'strong' })).toBeInTheDocument();
  });

  it('dobra odpowiedź: informacja i blokada przycisków', async () => {
    const onAnswered = vi.fn();
    renderWithProviders(<QuizExercise exercise={textQuiz} onAnswered={onAnswered} />);
    await userEvent.setup().click(screen.getByRole('button', { name: '2' }));
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled();
  });

  it('zła odpowiedź: informacja z wyjaśnieniem, jedna ocena', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<QuizExercise exercise={textQuiz} onAnswered={onAnswered} />);
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText('Niestety nie.')).toBeInTheDocument();
    expect(screen.getByText('Skat to dwie karty.')).toBeInTheDocument();
  });

  it('odpowiedzi w postaci kart', async () => {
    const onAnswered = vi.fn();
    renderWithProviders(<QuizExercise exercise={cardQuiz} onAnswered={onAnswered} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'niżnik dzwonkowy' }));
    expect(onAnswered).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/exercises/QuizExercise.test.tsx`
Expected: FAIL — „Failed to resolve import "./QuizExercise"”.

- [ ] **Step 3: Zaimplementuj `RichText.tsx` i `Feedback.tsx`**

```tsx
// src/components/RichText.tsx
import type { ReactNode } from 'react';
import { useText } from '../state/AppStateContext';

/** Tekst lekcji: tokeny słownika, akapity (pusta linia) i **pogrubienie**. */
export function RichText({ text }: { text: string }) {
  const t = useText();
  const paragraphs = t(text).split(/\n\s*\n/);
  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{renderBold(paragraph)}</p>
      ))}
    </>
  );
}

function renderBold(paragraph: string): ReactNode[] {
  return paragraph
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((part) => part !== '')
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
    );
}
```

```tsx
// src/components/Feedback.tsx
import type { ReactNode } from 'react';

export function Feedback({ correct, children }: { correct: boolean; children: ReactNode }) {
  return (
    <div className={`feedback feedback--${correct ? 'ok' : 'bad'}`} role="status">
      <strong className="feedback__title">{correct ? 'Dobrze!' : 'Niestety nie.'}</strong>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Zaimplementuj `QuizExercise.tsx`**

```tsx
// src/exercises/QuizExercise.tsx
import { useState } from 'react';
import { CardRow } from '../cards/Hand';
import { PlayingCard } from '../cards/PlayingCard';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import type { QuizExerciseData } from '../content/types';
import { useText } from '../state/AppStateContext';

interface Props {
  exercise: QuizExerciseData;
  onAnswered: (correct: boolean) => void;
}

export function QuizExercise({ exercise, onAnswered }: Props) {
  const t = useText();
  const [chosen, setChosen] = useState<string | null>(null);
  const answered = chosen !== null;

  const choose = (id: string) => {
    if (answered) return;
    setChosen(id);
    onAnswered(id === exercise.correct);
  };

  const optionState = (id: string) => {
    if (!answered) return '';
    if (id === exercise.correct) return 'option--correct';
    return id === chosen ? 'option--wrong' : '';
  };

  const cardOptions = exercise.options.every((option) => option.card !== undefined);

  return (
    <section className="exercise">
      <div className="exercise__prompt">
        <RichText text={exercise.prompt} />
      </div>
      {exercise.cards && <CardRow cards={exercise.cards} />}
      <div className={cardOptions ? 'options options--cards' : 'options'}>
        {exercise.options.map((option) =>
          option.card ? (
            <div key={option.id} className={`option-card ${optionState(option.id)}`}>
              <PlayingCard
                card={option.card}
                selected={option.id === chosen}
                disabled={answered}
                onClick={() => choose(option.id)}
              />
            </div>
          ) : (
            <button
              key={option.id}
              type="button"
              className={`option ${optionState(option.id)}`}
              disabled={answered}
              onClick={() => choose(option.id)}
            >
              {t(option.text ?? '')}
            </button>
          ),
        )}
      </div>
      {answered && (
        <Feedback correct={chosen === exercise.correct}>
          <RichText text={exercise.explain} />
        </Feedback>
      )}
    </section>
  );
}
```

- [ ] **Step 5: Uruchom test**

Run: `npx vitest run src/exercises/QuizExercise.test.tsx`
Expected: PASS (4 testy).

- [ ] **Step 6: Commit**

```bash
git add src/components src/exercises
git commit -m "feat(exercises): ćwiczenie quiz z informacją zwrotną" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Ćwiczenie „zagraj kartę”

**Files:**
- Create: `src/exercises/evaluatePlay.ts`, `src/exercises/PlayCardExercise.tsx`, `src/exercises/ExerciseView.tsx`
- Test: `src/exercises/evaluatePlay.test.ts`, `src/exercises/PlayCardExercise.test.tsx`

- [ ] **Step 1: Napisz test oceny zagrania**

```ts
// src/exercises/evaluatePlay.test.ts
import { describe, expect, it } from 'vitest';
import type { PlayCardExerciseData } from '../content/types';
import { evaluatePlay } from './evaluatePlay';

const base: PlayCardExerciseData = {
  type: 'playCard',
  id: 't',
  prompt: '',
  game: { kind: 'suit', trump: 'c' },
  leader: 0,
  trick: ['h-K'],
  hand: ['h-7', 'h-A', 's-10'],
  mode: 'legal',
  explain: '',
};

describe('evaluatePlay', () => {
  it('tryb legal: każda dozwolona karta jest dobra', () => {
    expect(evaluatePlay(base, 'h-7')).toEqual({ correct: true, legal: true, message: null });
  });

  it('niedozwolona karta jest zła z wyjaśnieniem', () => {
    const result = evaluatePlay(base, 's-10');
    expect(result.correct).toBe(false);
    expect(result.legal).toBe(false);
    expect(result.message).toMatch(/nie wolno/);
  });

  it('tryb best: dozwolona, ale nie najlepsza — komunikat z danych albo domyślny', () => {
    const best = { ...base, mode: 'best' as const, best: ['h-A' as const], wrongExplain: { 'h-7': 'Szkoda.' } };
    expect(evaluatePlay(best, 'h-A').correct).toBe(true);
    expect(evaluatePlay(best, 'h-7')).toEqual({ correct: false, legal: true, message: 'Szkoda.' });
    expect(evaluatePlay({ ...best, wrongExplain: undefined }, 'h-7').message).toMatch(/nie najlepsza/);
  });
});
```

- [ ] **Step 2: Zaimplementuj ocenę**

```ts
// src/exercises/evaluatePlay.ts
import { isLegalMove, type CardId } from '../engine';
import type { PlayCardExerciseData } from '../content/types';

export interface PlayEvaluation {
  correct: boolean;
  legal: boolean;
  /** Dodatkowy komunikat (może zawierać tokeny słownika). */
  message: string | null;
}

export function evaluatePlay(exercise: PlayCardExerciseData, card: CardId): PlayEvaluation {
  const legal = isLegalMove(card, exercise.hand, exercise.trick, exercise.game);
  if (!legal) {
    return {
      correct: false,
      legal,
      message: 'Tej karty nie wolno zagrać — masz kartę, którą musisz dołożyć do wyjścia.',
    };
  }
  if (exercise.mode === 'legal' || (exercise.best ?? []).includes(card)) {
    return { correct: true, legal, message: null };
  }
  return {
    correct: false,
    legal,
    message: exercise.wrongExplain?.[card] ?? 'Ta karta jest dozwolona, ale nie najlepsza.',
  };
}
```

- [ ] **Step 3: Uruchom test oceny**

Run: `npx vitest run src/exercises/evaluatePlay.test.ts`
Expected: PASS (3 testy).

- [ ] **Step 4: Napisz test komponentu**

```tsx
// src/exercises/PlayCardExercise.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PlayCardExerciseData } from '../content/types';
import { renderWithProviders } from '../test/render';
import { PlayCardExercise } from './PlayCardExercise';

const exercise: PlayCardExerciseData = {
  type: 'playCard',
  id: 't-p1',
  prompt: 'Zagraj dozwoloną kartę.',
  game: { kind: 'suit', trump: 'c' },
  leader: 0,
  trick: ['h-K'],
  hand: ['h-7', 'h-A', 's-10'],
  mode: 'legal',
  explain: 'Musisz dołożyć do koloru.',
};

describe('PlayCardExercise', () => {
  it('pierwsze dotknięcie wybiera, drugie zagrywa', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<PlayCardExercise exercise={exercise} onAnswered={onAnswered} />);
    const card = screen.getByRole('button', { name: 'siódemka czerwienna' });
    await user.click(card);
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(onAnswered).not.toHaveBeenCalled();
    await user.click(card);
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Ty')).toBeInTheDocument();
    expect(screen.getByText('Przodek')).toBeInTheDocument();
  });

  it('wybór innej karty przenosi zaznaczenie', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlayCardExercise exercise={exercise} onAnswered={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'siódemka czerwienna' }));
    await user.click(screen.getByRole('button', { name: 'as czerwienny' }));
    expect(screen.getByRole('button', { name: 'as czerwienny' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'siódemka czerwienna' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('niedozwolona karta: zła odpowiedź z wyjaśnieniem', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<PlayCardExercise exercise={exercise} onAnswered={onAnswered} />);
    const card = screen.getByRole('button', { name: 'dziesiątka zielona' });
    await user.click(card);
    await user.click(card);
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText(/nie wolno zagrać/)).toBeInTheDocument();
    expect(screen.getByText('Musisz dołożyć do koloru.')).toBeInTheDocument();
  });

  it('tryb best: komunikat dla dozwolonej, ale słabej karty', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    const best: PlayCardExerciseData = {
      ...exercise,
      mode: 'best',
      best: ['h-A'],
      wrongExplain: { 'h-7': 'Szkoda oddać [[lewa:B]].' },
    };
    renderWithProviders(<PlayCardExercise exercise={best} onAnswered={onAnswered} />);
    const card = screen.getByRole('button', { name: 'siódemka czerwienna' });
    await user.click(card);
    await user.click(card);
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText('Szkoda oddać lewę.')).toBeInTheDocument();
  });

  it('showLegal przyciemnia niedozwolone karty', () => {
    renderWithProviders(<PlayCardExercise exercise={{ ...exercise, showLegal: true }} onAnswered={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'dziesiątka zielona' })).toHaveClass('card--dimmed');
    expect(screen.getByRole('button', { name: 'as czerwienny' })).not.toHaveClass('card--dimmed');
  });
});
```

- [ ] **Step 5: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/exercises/PlayCardExercise.test.tsx`
Expected: FAIL — „Failed to resolve import "./PlayCardExercise"”.

- [ ] **Step 6: Zaimplementuj `PlayCardExercise.tsx`**

```tsx
// src/exercises/PlayCardExercise.tsx
import { useMemo, useState } from 'react';
import { Hand } from '../cards/Hand';
import { TrickView } from '../cards/TrickView';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import type { PlayCardExerciseData } from '../content/types';
import { legalMoves, nextSeat, sortHand, type CardId } from '../engine';
import { evaluatePlay } from './evaluatePlay';

interface Props {
  exercise: PlayCardExerciseData;
  onAnswered: (correct: boolean) => void;
}

export function PlayCardExercise({ exercise, onAnswered }: Props) {
  const you = nextSeat(exercise.leader, exercise.trick.length);
  const hand = useMemo(() => sortHand(exercise.hand, exercise.game), [exercise]);
  const legal = useMemo(() => legalMoves(exercise.hand, exercise.trick, exercise.game), [exercise]);
  const [selected, setSelected] = useState<CardId | null>(null);
  const [played, setPlayed] = useState<CardId | null>(null);

  const handleClick = (card: CardId) => {
    if (played) return;
    if (selected !== card) {
      setSelected(card);
      return;
    }
    setPlayed(card);
    onAnswered(evaluatePlay(exercise, card).correct);
  };

  const result = played ? evaluatePlay(exercise, played) : null;

  return (
    <section className="exercise">
      <div className="exercise__prompt">
        <RichText text={exercise.prompt} />
      </div>
      <TrickView cards={played ? [...exercise.trick, played] : exercise.trick} leader={exercise.leader} you={you} />
      {!played && <p className="hint">Dotknij kartę, aby ją wybrać, i dotknij jej ponownie, aby zagrać.</p>}
      <Hand
        cards={hand.filter((card) => card !== played)}
        selected={selected}
        isDimmed={exercise.showLegal ? (card) => !legal.includes(card) : undefined}
        onCardClick={handleClick}
        disabled={played !== null}
      />
      {result && (
        <Feedback correct={result.correct}>
          {result.message && <RichText text={result.message} />}
          <RichText text={exercise.explain} />
        </Feedback>
      )}
    </section>
  );
}
```

- [ ] **Step 7: Zaimplementuj `ExerciseView.tsx`**

```tsx
// src/exercises/ExerciseView.tsx
import type { ExerciseData } from '../content/types';
import { PlayCardExercise } from './PlayCardExercise';
import { QuizExercise } from './QuizExercise';

interface Props {
  exercise: ExerciseData;
  onAnswered: (correct: boolean) => void;
}

export function ExerciseView({ exercise, onAnswered }: Props) {
  switch (exercise.type) {
    case 'quiz':
      return <QuizExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'playCard':
      return <PlayCardExercise exercise={exercise} onAnswered={onAnswered} />;
  }
}
```

- [ ] **Step 8: Uruchom testy ćwiczeń**

Run: `npx vitest run src/exercises`
Expected: PASS (3 pliki).

- [ ] **Step 9: Commit**

```bash
git add src/exercises
git commit -m "feat(exercises): ćwiczenie „zagraj kartę” z oceną silnikiem" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Odtwarzacz lekcji

**Files:**
- Create: `src/ui/LessonPlayer.tsx`
- Test: `src/ui/LessonPlayer.test.tsx`

- [ ] **Step 1: Napisz test**

```tsx
// src/ui/LessonPlayer.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Lesson } from '../content/types';
import { renderWithProviders } from '../test/render';
import { LessonPlayer } from './LessonPlayer';

const lesson: Lesson = {
  id: 't-l1',
  title: 'Testowa lekcja',
  summary: '',
  steps: [{ title: 'Teoria', text: 'To jest [[skat]].' }],
  exercises: [
    { type: 'quiz', id: 'q1', prompt: 'Pytanie 1', options: [{ id: 'a', text: 'Tak' }, { id: 'b', text: 'Nie' }], correct: 'a', explain: 'E1' },
    { type: 'quiz', id: 'q2', prompt: 'Pytanie 2', options: [{ id: 'a', text: 'Tak' }, { id: 'b', text: 'Nie' }], correct: 'b', explain: 'E2' },
  ],
};

describe('LessonPlayer', () => {
  it('teoria → zadania → zaliczenie', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderWithProviders(<LessonPlayer lesson={lesson} lessonNumber={7} onFinish={onFinish} nextLessonPath="/lekcja/x" />);
    expect(screen.getByRole('heading', { name: 'Lekcja 7: Testowa lekcja' })).toBeInTheDocument();
    expect(screen.getByText('To jest skat.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dalej' }));

    expect(screen.getByText('Zadanie 1 z 2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dalej' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tak' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));

    expect(screen.getByText('Zadanie 2 z 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nie' }));
    await user.click(screen.getByRole('button', { name: 'Zakończ' }));

    expect(onFinish).toHaveBeenCalledWith(1);
    expect(screen.getByRole('heading', { name: 'Lekcja zaliczona!' })).toBeInTheDocument();
    expect(screen.getByText('Wynik: 2 z 2 (100%).')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Następna lekcja' })).toHaveAttribute('href', '/lekcja/x');
  });

  it('niezaliczenie i ponowna próba od zadań', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderWithProviders(<LessonPlayer lesson={lesson} lessonNumber={1} onFinish={onFinish} nextLessonPath={null} />);
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Nie' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Tak' }));
    await user.click(screen.getByRole('button', { name: 'Zakończ' }));

    expect(onFinish).toHaveBeenCalledWith(0);
    expect(screen.getByRole('heading', { name: 'Jeszcze nie tym razem' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Następna lekcja' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(screen.getByText('Zadanie 1 z 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tak' })).toBeEnabled();
  });

  it('powrót do teorii z podsumowania', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LessonPlayer lesson={lesson} lessonNumber={1} onFinish={vi.fn()} nextLessonPath={null} />);
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Nie' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Tak' }));
    await user.click(screen.getByRole('button', { name: 'Zakończ' }));
    await user.click(screen.getByRole('button', { name: 'Wróć do teorii' }));
    expect(screen.getByText('To jest skat.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/ui/LessonPlayer.test.tsx`
Expected: FAIL — „Failed to resolve import "./LessonPlayer"”.

- [ ] **Step 3: Zaimplementuj**

```tsx
// src/ui/LessonPlayer.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CardRow } from '../cards/Hand';
import { RichText } from '../components/RichText';
import { pickExercises } from '../content/pick';
import type { Lesson } from '../content/types';
import { ExerciseView } from '../exercises/ExerciseView';
import { useText } from '../state/AppStateContext';
import { isPassingScore } from '../state/progress';

type Phase = { kind: 'theory'; index: number } | { kind: 'exercise'; index: number } | { kind: 'summary' };

interface Props {
  lesson: Lesson;
  lessonNumber: number;
  onFinish: (score: number) => void;
  nextLessonPath: string | null;
}

export function LessonPlayer({ lesson, lessonNumber, onFinish, nextLessonPath }: Props) {
  const t = useText();
  const firstPhase = (): Phase => (lesson.steps.length > 0 ? { kind: 'theory', index: 0 } : { kind: 'exercise', index: 0 });
  const [attempt, setAttempt] = useState(0);
  const [exercises, setExercises] = useState(() => pickExercises(lesson));
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<Phase>(firstPhase);

  const total = lesson.steps.length + exercises.length;
  const position =
    phase.kind === 'theory' ? phase.index : phase.kind === 'exercise' ? lesson.steps.length + phase.index : total;
  const answeredCurrent = phase.kind === 'exercise' && results.length > phase.index;
  const correctCount = results.filter(Boolean).length;

  const handleAnswered = (index: number) => (correct: boolean) => {
    setResults((r) => (r.length > index ? r : [...r, correct]));
  };

  const next = () => {
    if (phase.kind === 'theory') {
      setPhase(
        phase.index + 1 < lesson.steps.length ? { kind: 'theory', index: phase.index + 1 } : { kind: 'exercise', index: 0 },
      );
    } else if (phase.kind === 'exercise') {
      if (phase.index + 1 < exercises.length) {
        setPhase({ kind: 'exercise', index: phase.index + 1 });
      } else {
        onFinish(correctCount / exercises.length);
        setPhase({ kind: 'summary' });
      }
    }
  };

  const restart = (fromTheory: boolean) => {
    setAttempt((a) => a + 1);
    setExercises(pickExercises(lesson));
    setResults([]);
    setPhase(fromTheory ? firstPhase() : { kind: 'exercise', index: 0 });
  };

  return (
    <article className="lesson">
      <h1 className="lesson__title">
        Lekcja {lessonNumber}: {t(lesson.title)}
      </h1>
      <progress className="lesson__progress" max={total} value={position} aria-label="Postęp lekcji" />

      {phase.kind === 'theory' && <TheoryView lesson={lesson} index={phase.index} />}

      {phase.kind === 'exercise' && (
        <>
          <p className="lesson__counter">
            Zadanie {phase.index + 1} z {exercises.length}
          </p>
          <ExerciseView
            key={`${attempt}-${phase.index}`}
            exercise={exercises[phase.index]}
            onAnswered={handleAnswered(phase.index)}
          />
        </>
      )}

      {phase.kind === 'summary' && (
        <Summary
          correct={correctCount}
          total={exercises.length}
          nextLessonPath={nextLessonPath}
          hasTheory={lesson.steps.length > 0}
          onRetry={() => restart(false)}
          onTheory={() => restart(true)}
        />
      )}

      {(phase.kind === 'theory' || answeredCurrent) && (
        <div className="lesson__actions">
          <button type="button" className="button button--primary" onClick={next}>
            {phase.kind === 'exercise' && phase.index + 1 === exercises.length ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      )}
    </article>
  );
}

function TheoryView({ lesson, index }: { lesson: Lesson; index: number }) {
  const t = useText();
  const step = lesson.steps[index];
  return (
    <section className="theory">
      {step.title && <h2>{t(step.title)}</h2>}
      <RichText text={step.text} />
      {step.cards && (
        <figure className="theory__cards">
          <CardRow cards={step.cards} />
          {step.cardsCaption && <figcaption>{t(step.cardsCaption)}</figcaption>}
        </figure>
      )}
    </section>
  );
}

interface SummaryProps {
  correct: number;
  total: number;
  nextLessonPath: string | null;
  hasTheory: boolean;
  onRetry: () => void;
  onTheory: () => void;
}

function Summary({ correct, total, nextLessonPath, hasTheory, onRetry, onTheory }: SummaryProps) {
  const score = correct / total;
  const passed = isPassingScore(score);
  return (
    <section className="summary">
      <h2>{passed ? 'Lekcja zaliczona!' : 'Jeszcze nie tym razem'}</h2>
      <p>
        Wynik: {correct} z {total} ({Math.round(score * 100)}%).
      </p>
      {!passed && <p>Do zaliczenia potrzeba co najmniej 80%.</p>}
      <div className="summary__actions">
        {passed && nextLessonPath && (
          <Link className="button button--primary" to={nextLessonPath}>
            Następna lekcja
          </Link>
        )}
        <button type="button" className="button" onClick={onRetry}>
          Spróbuj ponownie
        </button>
        {hasTheory && (
          <button type="button" className="button" onClick={onTheory}>
            Wróć do teorii
          </button>
        )}
        <Link className="button" to="/">
          Mapa kursu
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Uruchom test**

Run: `npx vitest run src/ui/LessonPlayer.test.tsx`
Expected: PASS (3 testy).

- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): odtwarzacz lekcji z podsumowaniem i ponowną próbą" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Walidacja treści i lekcje 1–5

**Files:**
- Create: `src/content/validate.ts`, `src/content/course.ts`, `src/content/lessons/m1-l01-czym-jest-skat.ts`, `src/content/lessons/m1-l02-talia.ts`, `src/content/lessons/m1-l03-oczka.ts`, `src/content/lessons/m1-l04-rozdanie.ts`, `src/content/lessons/m2-l05-dokladanie.ts`
- Test: `src/content/validate.test.ts`, `src/content/course.test.ts`

- [ ] **Step 1: Napisz test walidatora**

```ts
// src/content/validate.test.ts
import { describe, expect, it } from 'vitest';
import type { Course, ExerciseData, Lesson } from './types';
import { validateCourse } from './validate';

const quiz = (overrides: Partial<Extract<ExerciseData, { type: 'quiz' }>> = {}): ExerciseData => ({
  type: 'quiz', id: 'q1', prompt: 'P', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
  correct: 'a', explain: 'E', ...overrides,
});

const lessonWith = (exercises: ExerciseData[], overrides: Partial<Lesson> = {}): Lesson => ({
  id: 'l1', title: 'T', summary: 'S', steps: [], exercises, ...overrides,
});

const courseWith = (...lessons: Lesson[]): Course => ({ modules: [{ id: 'm1', title: 'M', lessons }] });

describe('validateCourse', () => {
  it('poprawny kurs nie ma problemów', () => {
    expect(validateCourse(courseWith(lessonWith([quiz()])))).toEqual([]);
  });

  it('wykrywa powtórzone identyfikatory', () => {
    const issues = validateCourse(courseWith(lessonWith([quiz()]), lessonWith([quiz()])));
    expect(issues).toContain('Powtórzona lekcja: l1');
    expect(issues).toContain('Powtórzone ćwiczenie: q1');
  });

  it('wykrywa lekcję bez ćwiczeń i zły drawCount', () => {
    expect(validateCourse(courseWith(lessonWith([])))).toContain('l1: brak ćwiczeń');
    expect(validateCourse(courseWith(lessonWith([quiz()], { drawCount: 3 })))).toContain('l1: drawCount poza zakresem');
  });

  it('wykrywa błędy quizu', () => {
    expect(validateCourse(courseWith(lessonWith([quiz({ correct: 'z' })])))).toContain(
      'l1/q1: poprawna odpowiedź „z” nie istnieje',
    );
    expect(validateCourse(courseWith(lessonWith([quiz({ options: [{ id: 'a', text: 'A', card: 'h-7' }, { id: 'b' }] })])))).toEqual([
      'l1/q1: odpowiedź a musi mieć tekst albo kartę',
      'l1/q1: odpowiedź b musi mieć tekst albo kartę',
    ]);
  });

  it('wykrywa błędne tokeny w tekstach', () => {
    expect(validateCourse(courseWith(lessonWith([quiz({ prompt: '[[nieznany]]' })])))).toEqual([
      'l1/q1: Nieznany termin: nieznany',
    ]);
  });

  it('wykrywa błędy „zagraj kartę”', () => {
    const play: ExerciseData = {
      type: 'playCard', id: 'p1', prompt: 'P', explain: 'E', game: { kind: 'null' }, leader: 0,
      trick: ['h-K'], hand: ['h-K', 'h-7', 's-A'], mode: 'best', best: ['s-A'],
    };
    const issues = validateCourse(courseWith(lessonWith([play])));
    expect(issues).toContain('l1/p1: karta h-K występuje więcej niż raz');
    expect(issues).toContain('l1/p1: najlepsza karta s-A jest niedozwolona');
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/content/validate.test.ts`
Expected: FAIL — „Failed to resolve import "./validate"”.

- [ ] **Step 3: Zaimplementuj walidator**

```ts
// src/content/validate.ts
import { isLegalMove, type CardId } from '../engine';
import { findTextIssues } from '../glossary';
import type { Course, ExerciseData, PlayCardExerciseData, QuizExerciseData } from './types';

type Report = (message: string) => void;

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

function validateExercise(exercise: ExerciseData, report: Report, checkText: (text: string | undefined) => void) {
  switch (exercise.type) {
    case 'quiz':
      return validateQuiz(exercise, report, checkText);
    case 'playCard':
      return validatePlayCard(exercise, report, checkText);
  }
}

function validateQuiz(quiz: QuizExerciseData, report: Report, checkText: (text: string | undefined) => void) {
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
}

function validatePlayCard(ex: PlayCardExerciseData, report: Report, checkText: (text: string | undefined) => void) {
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

function checkUnique(cards: readonly CardId[], report: Report) {
  const seen = new Set<CardId>();
  for (const card of cards) {
    if (seen.has(card)) report(`karta ${card} występuje więcej niż raz`);
    seen.add(card);
  }
}
```

- [ ] **Step 4: Uruchom test walidatora**

Run: `npx vitest run src/content/validate.test.ts`
Expected: PASS (6 testów).

- [ ] **Step 5: Napisz test kursu**

```ts
// src/content/course.test.ts
import { describe, expect, it } from 'vitest';
import { COURSE } from './course';
import { validateCourse } from './validate';

describe('treść kursu', () => {
  it('przechodzi walidację', () => {
    expect(validateCourse(COURSE)).toEqual([]);
  });
});
```

- [ ] **Step 6: Utwórz lekcję 1**

```ts
// src/content/lessons/m1-l01-czym-jest-skat.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm1-l01-czym-jest-skat',
  title: 'Czym jest skat?',
  summary: 'Trzech graczy, jeden przeciw dwóm i magiczne 61.',
  steps: [
    {
      title: 'Jeden przeciw dwóm',
      text:
        'Skat to gra karciana dla trzech osób. W każdym rozdaniu jeden gracz zostaje **[[rozgrywajacy:N]]** i gra sam przeciwko pozostałym dwóm.\n\n' +
        'Ci dwaj to **[[obronca:Mlm]]** — grają razem, jak drużyna, i wspólnie liczą zdobyte karty.',
    },
    {
      title: 'Gra o [[oczko:Blm]]',
      text:
        'Wszystkie karty w talii są warte razem **120** [[oczko:Dlm]].\n\n' +
        '[[Rozgrywajacy]] wygrywa, jeśli w zdobytych [[lewa:Mslm]] ma co najmniej **61** [[oczko:Dlm]]. Jeśli ma 60 lub mniej, wygrywają [[obronca:Mlm]].',
    },
    {
      title: 'Kto gra?',
      text:
        'Kto zostaje [[rozgrywajacy:N]], rozstrzyga **[[licytacja]]**: gracze kolejno podbijają stawkę, a ten, kto zaoferuje najwięcej, gra.\n\n' +
        '[[Licytacja:B]] poznasz dokładnie w module 4 — na razie wystarczy wiedzieć, że jest.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm1-l01-q1',
      prompt: 'Ile osób gra w jednym rozdaniu skata?',
      options: [
        { id: 'a', text: '2' },
        { id: 'b', text: '3' },
        { id: 'c', text: '4' },
      ],
      correct: 'b',
      explain: 'W skata grają trzy osoby: [[rozgrywajacy]] przeciwko dwóm [[obronca:Clm]].',
    },
    {
      type: 'quiz',
      id: 'm1-l01-q2',
      prompt: 'Ile [[oczko:Dlm]] musi zdobyć [[rozgrywajacy]], żeby wygrać?',
      options: [
        { id: 'a', text: '60' },
        { id: 'b', text: '61' },
        { id: 'c', text: '90' },
      ],
      correct: 'b',
      explain: 'Wystarczy **61** ze 120. Przy 60 [[oczko:Dlm]] nie ma remisu — [[rozgrywajacy]] przegrywa.',
    },
    {
      type: 'quiz',
      id: 'm1-l01-q3',
      prompt: 'Ile [[oczko:Dlm]] są warte razem wszystkie karty?',
      options: [
        { id: 'a', text: '100' },
        { id: 'b', text: '120' },
        { id: 'c', text: '130' },
      ],
      correct: 'b',
      explain: 'Cała talia jest warta **120** [[oczko:Dlm]]. Dokładnie policzymy je w lekcji 3.',
    },
    {
      type: 'quiz',
      id: 'm1-l01-q4',
      prompt: 'Jak grają [[obronca:Mlm]]?',
      options: [
        { id: 'a', text: 'Każdy na siebie' },
        { id: 'b', text: 'Razem, jako drużyna' },
        { id: 'c', text: 'Razem z [[rozgrywajacy:N]]' },
      ],
      correct: 'b',
      explain: '[[Obronca:Mlm]] tworzą drużynę i wspólnie pilnują, żeby [[rozgrywajacy]] nie zdobył 61 [[oczko:Dlm]].',
    },
  ],
};
```

- [ ] **Step 7: Utwórz lekcję 2**

```ts
// src/content/lessons/m1-l02-talia.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm1-l02-talia',
  title: 'Talia',
  summary: '32 karty, 4 kolory i ich kolejność.',
  steps: [
    {
      title: 'Cztery kolory',
      text:
        'Do skata używa się **32 kart**: 4 kolory po 8 kart.\n\n' +
        'W ustawieniach możesz wybrać wygląd talii — niemiecką (Altenburg) albo francuską. Zasady są w obu identyczne.',
      cards: ['c-A', 's-A', 'h-A', 'd-A'],
      cardsCaption: 'Kolory: [[suit:c]], [[suit:s]], [[suit:h]] i [[suit:d]].',
    },
    {
      title: 'Osiem kart w kolorze',
      text: 'W każdym kolorze są: 7, 8, 9, 10, [[walet]], [[dama]], [[krol]] i [[as]].',
      cards: ['h-7', 'h-8', 'h-9', 'h-10', 'h-J', 'h-Q', 'h-K', 'h-A'],
      cardsCaption: 'Wszystkie karty jednego koloru.',
    },
    {
      title: 'Kolejność kolorów',
      text:
        'Kolory mają stałą kolejność starszeństwa. Kolor **[[suit:c]]** jest najstarszy, potem **[[suit:s]]**, **[[suit:h]]**, a najmłodszy jest **[[suit:d]]**.\n\n' +
        'Ta kolejność zdecyduje o sile [[walet:Dlm]] i o wartości gier — wrócimy do niej jeszcze nie raz.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm1-l02-q1',
      prompt: 'Jaka to karta?',
      cards: ['s-Q'],
      options: [
        { id: 'a', text: '[[card:s-Q]]' },
        { id: 'b', text: '[[card:s-K]]' },
        { id: 'c', text: '[[card:c-Q]]' },
      ],
      correct: 'a',
      explain: 'To [[card:s-Q]].',
    },
    {
      type: 'quiz',
      id: 'm1-l02-q2',
      prompt: 'Która karta to [[card:d-J]]?',
      options: [
        { id: 'a', card: 'd-J' },
        { id: 'b', card: 'h-J' },
        { id: 'c', card: 'd-Q' },
        { id: 'd', card: 'd-K' },
      ],
      correct: 'a',
      explain: 'Szukana karta to [[walet]] w kolorze [[suit:d]].',
    },
    {
      type: 'quiz',
      id: 'm1-l02-q3',
      prompt: 'Ile kart liczy talia do skata?',
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '32' },
        { id: 'c', text: '52' },
      ],
      correct: 'b',
      explain: '4 kolory × 8 kart = **32**.',
    },
    {
      type: 'quiz',
      id: 'm1-l02-q4',
      prompt: 'Który kolor jest najstarszy?',
      options: [
        { id: 'a', text: '[[suit:c]]' },
        { id: 'b', text: '[[suit:s]]' },
        { id: 'c', text: '[[suit:h]]' },
        { id: 'd', text: '[[suit:d]]' },
      ],
      correct: 'a',
      explain: 'Kolejność od najstarszego: [[suit:c]], [[suit:s]], [[suit:h]], [[suit:d]].',
    },
    {
      type: 'quiz',
      id: 'm1-l02-q5',
      prompt: 'Który kolor jest najmłodszy?',
      options: [
        { id: 'a', text: '[[suit:c]]' },
        { id: 'b', text: '[[suit:s]]' },
        { id: 'c', text: '[[suit:h]]' },
        { id: 'd', text: '[[suit:d]]' },
      ],
      correct: 'd',
      explain: 'Najmłodszy jest kolor [[suit:d]].',
    },
  ],
};
```

- [ ] **Step 8: Utwórz lekcję 3**

```ts
// src/content/lessons/m1-l03-oczka.ts
import type { Lesson } from '../types';

const PROMPT = 'Ile [[oczko:Dlm]] jest {w tej lewie|w tym sztychu}?';

export const lesson: Lesson = {
  id: 'm1-l03-oczka',
  title: 'Ile są warte karty',
  summary: '[[As]] 11, dziesiątka 10, a co z resztą?',
  steps: [
    {
      title: 'Wartości kart',
      text:
        '**[[As]]** 11 · **dziesiątka** 10 · **[[krol]]** 4 · **[[dama]]** 3 · **[[walet]]** 2.\n\n' +
        'Siódemki, ósemki i dziewiątki nie mają żadnych [[oczko:Dlm]].',
      cards: ['h-A', 'h-10', 'h-K', 'h-Q', 'h-J', 'h-9'],
    },
    {
      title: 'Uważaj na dziesiątkę',
      text:
        'Dziesiątka jest warta **10** [[oczko:Dlm]] — więcej niż [[krol]]! Początkujący często o tym zapominają.\n\n' +
        'Dziesiątki i [[as:Mlm]] to najcenniejsze karty w grze.',
    },
    {
      title: 'Ile jest razem?',
      text:
        'W każdym kolorze jest 11 + 10 + 4 + 3 + 2 = **30** [[oczko:Dlm]], a w całej talii 4 × 30 = **120**.\n\n' +
        'Gdy liczysz [[oczko:Blm]] w [[lewa:Ms]], dodaj wartości trzech kart.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm1-l03-q1',
      prompt: PROMPT,
      cards: ['h-A', 's-10', 'c-K'],
      options: [
        { id: 'a', text: '25' },
        { id: 'b', text: '24' },
        { id: 'c', text: '21' },
      ],
      correct: 'a',
      explain: '11 + 10 + 4 = **25**.',
    },
    {
      type: 'quiz',
      id: 'm1-l03-q2',
      prompt: PROMPT,
      cards: ['d-J', 'c-9', 'd-Q'],
      options: [
        { id: 'a', text: '5' },
        { id: 'b', text: '6' },
        { id: 'c', text: '0' },
      ],
      correct: 'a',
      explain: '2 + 0 + 3 = **5**.',
    },
    {
      type: 'quiz',
      id: 'm1-l03-q3',
      prompt: 'Która karta jest warta więcej?',
      options: [
        { id: 'a', card: 's-10' },
        { id: 'b', card: 's-K' },
      ],
      correct: 'a',
      explain: 'Dziesiątka (10) jest warta więcej niż [[krol]] (4).',
    },
    {
      type: 'quiz',
      id: 'm1-l03-q4',
      prompt: PROMPT,
      cards: ['c-A', 'c-10', 'h-A'],
      options: [
        { id: 'a', text: '31' },
        { id: 'b', text: '32' },
        { id: 'c', text: '22' },
      ],
      correct: 'b',
      explain: '11 + 10 + 11 = **32**.',
    },
    {
      type: 'quiz',
      id: 'm1-l03-q5',
      prompt: 'Ile [[oczko:Dlm]] jest warta dziewiątka?',
      options: [
        { id: 'a', text: '0' },
        { id: 'b', text: '9' },
        { id: 'c', text: '1' },
      ],
      correct: 'a',
      explain: 'Siódemki, ósemki i dziewiątki nie mają żadnych [[oczko:Dlm]].',
    },
  ],
};
```

- [ ] **Step 9: Utwórz lekcję 4**

```ts
// src/content/lessons/m1-l04-rozdanie.ts
import type { Lesson } from '../types';

const SEATS = [
  { id: 'a', text: '[[Przodek]]' },
  { id: 'b', text: '[[Srodek]]' },
  { id: 'c', text: '[[Zadek]]' },
];

export const lesson: Lesson = {
  id: 'm1-l04-rozdanie',
  title: 'Rozdanie i pozycje',
  summary: 'Kto dostaje karty i kto wychodzi pierwszy.',
  steps: [
    {
      title: 'Rozdanie',
      text:
        'Każdy gracz dostaje **10 kart**. Dwie pozostałe karty leżą zakryte na środku stołu — to **[[skat]]**.\n\n' +
        '3 × 10 + 2 = 32, czyli cała talia.',
    },
    {
      title: 'Pozycje przy stole',
      text:
        'Karty rozdaje się zgodnie z ruchem wskazówek zegara. Pierwszy gracz po lewej stronie rozdającego to **[[przodek]]**, następny to **[[srodek]]**, a trzeci to **[[zadek]]**.\n\n' +
        'Przy trzech graczach [[zadek]] jest zarazem rozdającym.',
    },
    {
      title: 'Kto zaczyna?',
      text:
        '**[[Przodek]]** zawsze wychodzi {do pierwszej lewy|do pierwszego sztycha} — bez względu na to, kto jest [[rozgrywajacy:N]].\n\n' +
        '{Każdą następną lewę rozpoczyna gracz, który wziął poprzednią.|Każdego następnego sztycha rozpoczyna gracz, który wziął poprzedniego.}',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm1-l04-q1',
      prompt: 'Ile kart leży w [[skat:Ms]]?',
      options: [
        { id: 'a', text: '2' },
        { id: 'b', text: '3' },
        { id: 'c', text: '10' },
      ],
      correct: 'a',
      explain: '[[Skat]] to zawsze 2 karty.',
    },
    {
      type: 'quiz',
      id: 'm1-l04-q2',
      prompt: 'Kto wychodzi {do pierwszej lewy|do pierwszego sztycha}?',
      options: [...SEATS, { id: 'd', text: '[[Rozgrywajacy]]' }],
      correct: 'a',
      explain: 'Zawsze [[przodek]] — nawet jeśli [[rozgrywajacy:N]] jest ktoś inny.',
    },
    {
      type: 'quiz',
      id: 'm1-l04-q3',
      prompt: 'Kto rozdaje karty przy trzech graczach?',
      options: SEATS,
      correct: 'c',
      explain: 'Przy trzech graczach rozdający to [[zadek]], a [[przodek]] siedzi po jego lewej stronie.',
    },
    {
      type: 'quiz',
      id: 'm1-l04-q4',
      prompt: 'Kto rozpoczyna {drugą lewę|drugiego sztycha}?',
      options: [
        { id: 'a', text: '[[Przodek]]' },
        { id: 'b', text: '{Gracz, który wziął pierwszą lewę|Gracz, który wziął pierwszego sztycha}' },
        { id: 'c', text: '[[Rozgrywajacy]]' },
      ],
      correct: 'b',
      explain: '{Każdą lewę poza pierwszą rozpoczyna ten, kto wziął poprzednią.|Każdego sztycha poza pierwszym rozpoczyna ten, kto wziął poprzedniego.}',
    },
    {
      type: 'quiz',
      id: 'm1-l04-q5',
      prompt: 'Ile kart dostaje każdy gracz?',
      options: [
        { id: 'a', text: '8' },
        { id: 'b', text: '10' },
        { id: 'c', text: '12' },
      ],
      correct: 'b',
      explain: 'Każdy dostaje 10 kart, a 2 trafiają do [[skat:D]].',
    },
  ],
};
```

- [ ] **Step 10: Utwórz lekcję 5**

```ts
// src/content/lessons/m2-l05-dokladanie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

// Gra bez atu (technicznie: null), a w rękach nie ma waletów —
// lekcja uczy wyłącznie obowiązku dokładania do koloru.
const NO_TRUMPS: GameType = { kind: 'null' };
const PROMPT_END = 'Zagraj dozwoloną kartę.';

export const lesson: Lesson = {
  id: 'm2-l05-dokladanie',
  title: '[[Lewa]] i dokładanie do koloru',
  summary: 'Najważniejsza zasada rozgrywki: dokładaj do koloru.',
  steps: [
    {
      title: 'Czym jest [[lewa]]?',
      text:
        '**[[Lewa]]** to jedna kolejka: każdy z trzech graczy kładzie na stół po jednej karcie. W rozdaniu jest 10 [[lewa:Dlm]] — tyle, ile kart w ręce.\n\n' +
        'Karty {z wziętej lewy trafiają do gracza, który ją wziął|z wziętego sztycha trafiają do gracza, który go wziął}, a ich [[oczko:Mlm]] liczą się dla niego lub jego drużyny.',
    },
    {
      title: 'Kolor wyjścia',
      text:
        'Pierwsza karta {w lewie|w sztychu} wyznacza **kolor wyjścia**. Pozostali gracze **muszą dołożyć kartę w tym samym kolorze**, jeśli ją mają.\n\n' +
        'To obowiązek, a nie wybór — nawet gdy szkoda ci tej karty.',
    },
    {
      title: 'Nie masz koloru?',
      text:
        'Jeśli nie masz żadnej karty w kolorze wyjścia, możesz zagrać **dowolną** kartę.\n\n' +
        'W tej lekcji nie ma jeszcze [[atu:Dlm]] ani [[walet:Dlm]] w rękach — poznasz je w lekcjach 7–8.',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm2-l05-p1',
      prompt: `Na stole leży [[card:h-K]]. ${PROMPT_END}`,
      game: NO_TRUMPS,
      leader: 0,
      trick: ['h-K'],
      hand: ['h-7', 'h-A', 's-10', 'c-K', 'd-8'],
      mode: 'legal',
      explain: 'Masz karty w kolorze [[suit:h]], więc musisz dołożyć jedną z nich: [[card:h-7]] albo [[card:h-A]].',
    },
    {
      type: 'playCard',
      id: 'm2-l05-p2',
      prompt: `Na stole leżą [[card:s-9]] i [[card:s-A]]. ${PROMPT_END}`,
      game: NO_TRUMPS,
      leader: 1,
      trick: ['s-9', 's-A'],
      hand: ['c-10', 'c-8', 'h-Q', 'd-A', 'd-9'],
      mode: 'legal',
      explain: 'Nie masz żadnej karty w kolorze [[suit:s]], więc wolno ci zagrać dowolną kartę.',
    },
    {
      type: 'playCard',
      id: 'm2-l05-p3',
      prompt: `Na stole leży [[card:d-10]]. ${PROMPT_END}`,
      game: NO_TRUMPS,
      leader: 2,
      trick: ['d-10'],
      hand: ['d-7', 'c-A', 'c-K', 'h-10', 's-8'],
      mode: 'legal',
      explain: 'Jedyną kartą w kolorze [[suit:d]] jest [[card:d-7]] — musisz ją dołożyć, choć nie weźmie {tej lewy|tego sztycha}.',
    },
    {
      type: 'playCard',
      id: 'm2-l05-p4',
      prompt: `Na stole leżą [[card:c-Q]] i [[card:c-7]]. ${PROMPT_END}`,
      game: NO_TRUMPS,
      leader: 1,
      trick: ['c-Q', 'c-7'],
      hand: ['c-A', 'c-9', 'h-A', 's-7'],
      mode: 'legal',
      explain: 'Masz dwie karty w kolorze [[suit:c]]: możesz dołożyć [[card:c-A]] (i wziąć {lewę|sztycha}) albo [[card:c-9]].',
    },
  ],
};
```

- [ ] **Step 11: Utwórz `course.ts`**

```ts
// src/content/course.ts
import { lesson as l01 } from './lessons/m1-l01-czym-jest-skat';
import { lesson as l02 } from './lessons/m1-l02-talia';
import { lesson as l03 } from './lessons/m1-l03-oczka';
import { lesson as l04 } from './lessons/m1-l04-rozdanie';
import { lesson as l05 } from './lessons/m2-l05-dokladanie';
import type { Course } from './types';

export const COURSE: Course = {
  modules: [
    { id: 'm1', title: 'Pierwsze kroki', lessons: [l01, l02, l03, l04] },
    { id: 'm2', title: 'Rozgrywka lew', lessons: [l05] },
  ],
};
```

- [ ] **Step 12: Uruchom testy treści**

Run: `npx vitest run src/content`
Expected: PASS. Jeśli `course.test.ts` zgłosi problemy (np. brakującą formę terminu), popraw treść lub dodaj formę w `src/glossary/terms.ts` i uruchom ponownie.

- [ ] **Step 13: Commit**

```bash
git add src/content
git commit -m "feat(content): walidacja treści i lekcje 1–5" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Ekrany aplikacji i trasy

**Files:**
- Create: `src/ui/Layout.tsx`, `src/ui/ErrorBoundary.tsx`, `src/ui/NotFound.tsx`, `src/ui/CourseMap.tsx`, `src/ui/LessonPage.tsx`, `src/ui/SettingsPage.tsx`, `src/ui/GlossaryPage.tsx`, `src/ui/App.tsx`
- Modify: `src/main.tsx` (całość)
- Test: `src/ui/App.test.tsx`

- [ ] **Step 1: Napisz test integracyjny**

```tsx
// src/ui/App.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { COURSE } from '../content/course';
import { resolveText } from '../glossary';
import { STORAGE_KEY } from '../state/storage';
import { renderWithProviders } from '../test/render';
import { createMemoryStorage, storageWithState } from '../test/storage';
import { AppRoutes } from './App';

const firstLesson = COURSE.modules[0].lessons[0];

describe('aplikacja', () => {
  it('mapa kursu: pierwsza lekcja dostępna, druga zablokowana', () => {
    renderWithProviders(<AppRoutes />);
    expect(screen.getByRole('link', { name: 'Zacznij naukę' })).toHaveAttribute('href', `/lekcja/${firstLesson.id}`);
    expect(screen.getByRole('link', { name: /Czym jest skat\?/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Talia/ })).not.toBeInTheDocument();
    expect(screen.getByText('Talia')).toBeInTheDocument();
  });

  it('przejście lekcji 1 zalicza ją i odblokowuje lekcję 2', async () => {
    const user = userEvent.setup();
    const { storage } = renderWithProviders(<AppRoutes />, { route: `/lekcja/${firstLesson.id}` });
    const ctx = { deck: 'altenburg', register: 'official' } as const;

    for (let i = 0; i < firstLesson.steps.length; i++) {
      await user.click(screen.getByRole('button', { name: 'Dalej' }));
    }
    for (const exercise of firstLesson.exercises) {
      if (exercise.type !== 'quiz') throw new Error('Lekcja 1 ma tylko quizy');
      const option = exercise.options.find((o) => o.id === exercise.correct)!;
      await user.click(screen.getByRole('button', { name: resolveText(option.text!, ctx) }));
      await user.click(screen.getByRole('button', { name: /^(Dalej|Zakończ)$/ }));
    }

    expect(screen.getByRole('heading', { name: 'Lekcja zaliczona!' })).toBeInTheDocument();
    expect(JSON.parse(storage!.getItem(STORAGE_KEY)!).lessons[firstLesson.id].status).toBe('passed');

    await user.click(screen.getByRole('link', { name: 'Mapa kursu' }));
    expect(screen.getByRole('link', { name: /Talia/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kontynuuj' })).toBeInTheDocument();
  });

  it('zablokowana lekcja nie daje się otworzyć', () => {
    renderWithProviders(<AppRoutes />, { route: '/lekcja/m1-l03-oczka' });
    expect(screen.getByText('Ta lekcja jest jeszcze zablokowana.')).toBeInTheDocument();
  });

  it('nieznana lekcja', () => {
    renderWithProviders(<AppRoutes />, { route: '/lekcja/nie-ma' });
    expect(screen.getByText('Nie ma takiej lekcji.')).toBeInTheDocument();
  });

  it('ustawienia: zmiana talii i języka działa od razu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { route: '/ustawienia' });
    expect(screen.getByRole('img', { name: 'niżnik żołędny' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Francuska/ }));
    expect(screen.getByRole('img', { name: 'walet trefl' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Potoczny/ }));
    expect(screen.getByRole('img', { name: 'jopek trefl' })).toBeInTheDocument();
  });

  it('ustawienia: odblokuj wszystko i reset postępu', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const storage = storageWithState({}, { [firstLesson.id]: { status: 'passed', bestScore: 1, attempts: 1 } });
    renderWithProviders(<AppRoutes />, { route: '/ustawienia', storage });
    await user.click(screen.getByRole('checkbox', { name: 'Odblokuj wszystkie lekcje' }));
    await user.click(screen.getByRole('button', { name: 'Wyzeruj postęp' }));
    expect(screen.getByText('Postęp został wyzerowany.')).toBeInTheDocument();
    const saved = JSON.parse(storage.getItem(STORAGE_KEY)!);
    expect(saved.lessons).toEqual({});
    expect(saved.settings.unlockAll).toBe(true);
  });

  it('słowniczek pokazuje oba warianty terminów', () => {
    renderWithProviders(<AppRoutes />, { route: '/slowniczek' });
    expect(screen.getByRole('cell', { name: 'lewa' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'sztych' })).toBeInTheDocument();
  });

  it('baner o uszkodzonym zapisie', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { storage: createMemoryStorage({ [STORAGE_KEY]: 'zepsute' }) });
    expect(screen.getByRole('alert')).toHaveTextContent('uszkodzony');
    await user.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/ui/App.test.tsx`
Expected: FAIL — „Failed to resolve import "./App"”.

- [ ] **Step 3: Zaimplementuj `Layout.tsx`, `ErrorBoundary.tsx`, `NotFound.tsx`**

```tsx
// src/ui/Layout.tsx
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext';

const NOTICE_TEXT = {
  unavailable: 'Ta przeglądarka nie pozwala zapisać postępu (np. tryb prywatny). Po zamknięciu strony postęp zostanie utracony.',
  corrupted: 'Zapisany postęp był uszkodzony i został wyzerowany.',
} as const;

export function Layout({ children }: { children: ReactNode }) {
  const { notice, dismissNotice } = useAppState();
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-header__brand">
          Trener skata
        </Link>
        <nav className="app-header__nav">
          <NavLink to="/slowniczek">Słowniczek</NavLink>
          <NavLink to="/ustawienia">Ustawienia</NavLink>
        </nav>
      </header>
      {notice && (
        <div className="notice" role="alert">
          <p>{NOTICE_TEXT[notice]}</p>
          <button type="button" className="button" onClick={dismissNotice}>
            Zamknij
          </button>
        </div>
      )}
      <main className="app-main">{children}</main>
    </div>
  );
}
```

```tsx
// src/ui/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-screen">
          <h1>Coś poszło nie tak</h1>
          <p>Twój postęp jest bezpieczny.</p>
          <a href="#/" className="button" onClick={() => this.setState({ error: null })}>
            Wróć do mapy kursu
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
```

```tsx
// src/ui/NotFound.tsx
import { Link } from 'react-router-dom';

export function NotFound({ message = 'Nie ma takiej strony.' }: { message?: string }) {
  return (
    <div className="not-found">
      <p>{message}</p>
      <Link className="button" to="/">
        Mapa kursu
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Zaimplementuj `CourseMap.tsx`**

```tsx
// src/ui/CourseMap.tsx
import { Link } from 'react-router-dom';
import { COURSE } from '../content/course';
import type { Lesson } from '../content/types';
import { useAppState, useText } from '../state/AppStateContext';
import { lessonNumber, lessonStatuses, nextLessonId, type LessonStatus } from '../state/progress';

const STATUS_TEXT: Record<LessonStatus, string> = {
  locked: 'Zablokowana',
  available: 'Dostępna',
  passed: 'Zaliczona',
};

export function CourseMap() {
  const { state } = useAppState();
  const t = useText();
  const statuses = lessonStatuses(COURSE, state);
  const nextId = nextLessonId(COURSE, state);
  const started = Object.keys(state.lessons).length > 0;

  return (
    <div className="course-map">
      <h1>Kurs skata</h1>
      {nextId ? (
        <Link className="button button--primary" to={`/lekcja/${nextId}`}>
          {started ? 'Kontynuuj' : 'Zacznij naukę'}
        </Link>
      ) : (
        <p>Ukończono wszystkie dostępne lekcje. Kolejne pojawią się wkrótce!</p>
      )}
      {COURSE.modules.map((module, moduleIndex) => (
        <section key={module.id} className="module">
          <h2>
            Moduł {moduleIndex + 1}: {t(module.title)}
          </h2>
          <ol className="lesson-list">
            {module.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                status={statuses[lesson.id]}
                bestScore={state.lessons[lesson.id]?.bestScore}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function LessonItem({ lesson, status, bestScore }: { lesson: Lesson; status: LessonStatus; bestScore?: number }) {
  const t = useText();
  const body = (
    <>
      <span className="lesson-item__num">{lessonNumber(COURSE, lesson.id)}</span>
      <span className="lesson-item__text">
        <span className="lesson-item__title">{t(lesson.title)}</span>
        <span className="lesson-item__summary">{t(lesson.summary)}</span>
      </span>
      <span className="lesson-item__status">
        {STATUS_TEXT[status]}
        {bestScore !== undefined && ` · ${Math.round(bestScore * 100)}%`}
      </span>
    </>
  );
  return (
    <li className={`lesson-item lesson-item--${status}`}>
      {status === 'locked' ? (
        <div className="lesson-item__body">{body}</div>
      ) : (
        <Link className="lesson-item__body" to={`/lekcja/${lesson.id}`}>
          {body}
        </Link>
      )}
    </li>
  );
}
```

- [ ] **Step 5: Zaimplementuj `LessonPage.tsx`**

```tsx
// src/ui/LessonPage.tsx
import { useParams } from 'react-router-dom';
import { COURSE } from '../content/course';
import { useAppState } from '../state/AppStateContext';
import { flattenLessons, lessonAfter, lessonNumber, lessonStatuses } from '../state/progress';
import { LessonPlayer } from './LessonPlayer';
import { NotFound } from './NotFound';

export function LessonRoute() {
  const { lessonId = '' } = useParams();
  return <LessonPage key={lessonId} lessonId={lessonId} />;
}

function LessonPage({ lessonId }: { lessonId: string }) {
  const { state, recordLessonResult } = useAppState();
  const lesson = flattenLessons(COURSE).find((l) => l.id === lessonId);
  if (!lesson) return <NotFound message="Nie ma takiej lekcji." />;
  if (lessonStatuses(COURSE, state)[lesson.id] === 'locked') {
    return <NotFound message="Ta lekcja jest jeszcze zablokowana." />;
  }
  const next = lessonAfter(COURSE, lesson.id);
  return (
    <LessonPlayer
      lesson={lesson}
      lessonNumber={lessonNumber(COURSE, lesson.id)}
      onFinish={(score) => recordLessonResult(lesson.id, score)}
      nextLessonPath={next ? `/lekcja/${next.id}` : null}
    />
  );
}
```

- [ ] **Step 6: Zaimplementuj `SettingsPage.tsx`**

```tsx
// src/ui/SettingsPage.tsx
import { useState } from 'react';
import { CardRow } from '../cards/Hand';
import { resolveText } from '../glossary';
import { useAppState } from '../state/AppStateContext';

const EXAMPLE = '[[lewa]], [[rozgrywajacy]], [[walet]]';

export function SettingsPage() {
  const { state, updateSettings, resetProgress } = useAppState();
  const { deck, register, unlockAll } = state.settings;
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    if (window.confirm('Na pewno usunąć cały postęp kursu? Tego nie da się cofnąć.')) {
      resetProgress();
      setResetDone(true);
    }
  };

  return (
    <div className="settings">
      <h1>Ustawienia</h1>

      <fieldset className="settings__group">
        <legend>Talia</legend>
        <label className="settings__option">
          <input type="radio" name="deck" checked={deck === 'altenburg'} onChange={() => updateSettings({ deck: 'altenburg' })} />
          Altenburg (niemiecka)
        </label>
        <label className="settings__option">
          <input type="radio" name="deck" checked={deck === 'french'} onChange={() => updateSettings({ deck: 'french' })} />
          Francuska
        </label>
        <CardRow cards={['c-J', 's-A', 'h-10', 'd-K']} />
      </fieldset>

      <fieldset className="settings__group">
        <legend>Język</legend>
        <label className="settings__option">
          <input
            type="radio"
            name="register"
            checked={register === 'official'}
            onChange={() => updateSettings({ register: 'official' })}
          />
          Oficjalny turniejowy (np. {resolveText(EXAMPLE, { deck, register: 'official' })})
        </label>
        <label className="settings__option">
          <input
            type="radio"
            name="register"
            checked={register === 'colloquial'}
            onChange={() => updateSettings({ register: 'colloquial' })}
          />
          Potoczny (np. {resolveText(EXAMPLE, { deck, register: 'colloquial' })})
        </label>
      </fieldset>

      <fieldset className="settings__group">
        <legend>Postęp</legend>
        <label className="settings__option">
          <input type="checkbox" checked={unlockAll} onChange={(e) => updateSettings({ unlockAll: e.target.checked })} />
          Odblokuj wszystkie lekcje
        </label>
        <button type="button" className="button button--danger" onClick={handleReset}>
          Wyzeruj postęp
        </button>
        {resetDone && <p role="status">Postęp został wyzerowany.</p>}
      </fieldset>
    </div>
  );
}
```

- [ ] **Step 7: Zaimplementuj `GlossaryPage.tsx`**

```tsx
// src/ui/GlossaryPage.tsx
import { Link } from 'react-router-dom';
import { SUITS } from '../engine';
import { TERMS, formsFor, suitName, type TextContext } from '../glossary';
import { useTextContext } from '../state/AppStateContext';

export function GlossaryPage() {
  const ctx = useTextContext();
  const other: TextContext = { ...ctx, register: ctx.register === 'official' ? 'colloquial' : 'official' };
  const otherLabel = other.register === 'official' ? 'Oficjalnie' : 'Potocznie';
  const rows = Object.entries(TERMS)
    .map(([key, term]) => ({ key, main: formsFor(term, ctx).M, alt: formsFor(term, other).M }))
    .sort((a, b) => a.main.localeCompare(b.main, 'pl'));

  return (
    <div className="glossary">
      <h1>Słowniczek</h1>
      <p>
        Terminy w wybranym języku ({ctx.register === 'official' ? 'oficjalnym' : 'potocznym'}), obok drugi wariant.
        Język i talię zmienisz w <Link to="/ustawienia">ustawieniach</Link>.
      </p>
      <table className="glossary__table">
        <thead>
          <tr>
            <th>Termin</th>
            <th>{otherLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.main}</td>
              <td>{row.alt === row.main ? '—' : row.alt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Kolory</h2>
      <table className="glossary__table">
        <thead>
          <tr>
            <th>Kolor</th>
            <th>{otherLabel}</th>
          </tr>
        </thead>
        <tbody>
          {SUITS.map((suit) => (
            <tr key={suit}>
              <td>{suitName(suit, ctx)}</td>
              <td>{suitName(suit, other) === suitName(suit, ctx) ? '—' : suitName(suit, other)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 8: Zaimplementuj `App.tsx` i podmień `main.tsx`**

```tsx
// src/ui/App.tsx
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from '../state/AppStateContext';
import { CourseMap } from './CourseMap';
import { ErrorBoundary } from './ErrorBoundary';
import { GlossaryPage } from './GlossaryPage';
import { Layout } from './Layout';
import { LessonRoute } from './LessonPage';
import { NotFound } from './NotFound';
import { SettingsPage } from './SettingsPage';

export function AppRoutes() {
  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<CourseMap />} />
          <Route path="/lekcja/:lessonId" element={<LessonRoute />} />
          <Route path="/ustawienia" element={<SettingsPage />} />
          <Route path="/slowniczek" element={<GlossaryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}

export function App() {
  return (
    <AppStateProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </HashRouter>
    </AppStateProvider>
  );
}
```

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './ui/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Utwórz pusty `src/styles.css` (wypełniany w Task 17), żeby import działał:

```bash
touch src/styles.css
```

- [ ] **Step 9: Uruchom test integracyjny**

Run: `npx vitest run src/ui/App.test.tsx`
Expected: PASS (8 testów).

- [ ] **Step 10: Uruchom wszystkie testy i sprawdź typy**

Run: `npm test && npm run typecheck`
Expected: wszystkie testy PASS, brak błędów TypeScript.

- [ ] **Step 11: Commit**

```bash
git add src
git commit -m "feat(ui): mapa kursu, strona lekcji, ustawienia, słowniczek i trasy" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Style mobile-first, build i sprawdzenie w przeglądarce

**Files:**
- Modify: `src/styles.css` (całość)
- Create: `.claude/launch.json`

- [ ] **Step 1: Napisz `src/styles.css`**

```css
/* src/styles.css — mobile-first, jasny i ciemny motyw */
:root {
  --bg: #f6f4ef;
  --surface: #ffffff;
  --text: #1f2421;
  --muted: #5d665f;
  --accent: #1f6f4a;
  --accent-contrast: #ffffff;
  --border: #d9d4c7;
  --ok-bg: #e3f3e8;
  --ok-text: #155c33;
  --bad-bg: #fbe4e2;
  --bad-text: #8f1d17;
  --felt: #2f6b4f;
  --felt-text: #f1f7f3;
  --danger: #b3261e;
  --radius: 12px;
  color-scheme: light dark;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #151a17;
    --surface: #1f2622;
    --text: #e7ece8;
    --muted: #a3ada6;
    --accent: #5cc28f;
    --accent-contrast: #0d1a13;
    --border: #34403a;
    --ok-bg: #163525;
    --ok-text: #9be3b9;
    --bad-bg: #3d1b19;
    --bad-text: #f4b4ae;
    --felt: #1d4433;
    --felt-text: #e3f1e9;
    --danger: #f2867e;
  }
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); }
h1 { font-size: 1.5rem; line-height: 1.25; margin: 0 0 12px; }
h2 { font-size: 1.15rem; margin: 20px 0 8px; }
a { color: var(--accent); }

/* Układ */
.app-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 16px; background: var(--surface); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 10;
}
.app-header__brand { font-weight: 700; text-decoration: none; color: var(--text); }
.app-header__nav { display: flex; gap: 16px; }
.app-header__nav a { text-decoration: none; color: var(--muted); }
.app-header__nav a.active { color: var(--accent); font-weight: 600; }
.app-main { max-width: 720px; margin: 0 auto; padding: 16px; }

.notice {
  display: flex; align-items: center; gap: 12px; justify-content: space-between;
  margin: 12px 16px 0; padding: 12px; border-radius: var(--radius);
  background: var(--bad-bg); color: var(--bad-text);
}
.notice p { margin: 0; }

/* Przyciski */
.button {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; padding: 8px 18px; border-radius: 999px;
  border: 1px solid var(--border); background: var(--surface); color: var(--text);
  font: inherit; font-weight: 600; text-decoration: none; cursor: pointer;
}
.button--primary { background: var(--accent); border-color: var(--accent); color: var(--accent-contrast); }
.button--danger { color: var(--danger); border-color: var(--danger); }
.button:focus-visible, .option:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

/* Mapa kursu */
.course-map > .button { margin-bottom: 8px; }
.lesson-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.lesson-item__body {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text); text-decoration: none;
}
.lesson-item__num {
  flex: none; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
  background: var(--bg); font-weight: 700;
}
.lesson-item--passed .lesson-item__num { background: var(--accent); color: var(--accent-contrast); }
.lesson-item__text { flex: 1; display: grid; }
.lesson-item__title { font-weight: 600; }
.lesson-item__summary, .lesson-item__status { color: var(--muted); font-size: 0.85rem; }
.lesson-item__status { flex: none; text-align: right; }
.lesson-item--locked .lesson-item__body { opacity: 0.55; }

/* Lekcja */
.lesson__progress { width: 100%; height: 8px; accent-color: var(--accent); margin-bottom: 12px; }
.lesson__counter { color: var(--muted); margin: 0 0 4px; font-size: 0.9rem; }
.lesson__actions, .summary__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.lesson__actions .button { width: 100%; }
.theory__cards { margin: 12px 0; }
.theory__cards figcaption { text-align: center; color: var(--muted); font-size: 0.9rem; }

/* Ćwiczenia */
.exercise__prompt p { font-size: 1.05rem; margin: 0 0 12px; }
.options { display: grid; gap: 8px; margin-top: 12px; }
.options--cards { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.option {
  min-height: 48px; padding: 10px 14px; text-align: left; font: inherit;
  border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface); color: var(--text); cursor: pointer;
}
.option:disabled { cursor: default; }
.option--correct { background: var(--ok-bg); border-color: var(--ok-text); color: var(--ok-text); }
.option--wrong { background: var(--bad-bg); border-color: var(--bad-text); color: var(--bad-text); }
.option-card { border-radius: 10px; padding: 4px; border: 2px solid transparent; }
.option-card.option--correct { border-color: var(--ok-text); }
.option-card.option--wrong { border-color: var(--bad-text); }
.hint { color: var(--muted); font-size: 0.85rem; text-align: center; margin: 8px 0 0; }

.feedback { margin-top: 16px; padding: 12px; border-radius: var(--radius); }
.feedback p { margin: 4px 0 0; }
.feedback--ok { background: var(--ok-bg); color: var(--ok-text); }
.feedback--bad { background: var(--bad-bg); color: var(--bad-text); }

/* Karty */
.card {
  display: inline-block; width: var(--card-w, 56px); padding: 0; margin: 0;
  border: 0; background: none; border-radius: 6px; line-height: 0;
  transition: transform 0.12s ease;
}
button.card { cursor: pointer; }
button.card:disabled { cursor: default; }
button.card:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.card__svg { width: 100%; height: auto; display: block; filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.35)); }
.card__bg { fill: #fff; stroke: #bdb6a6; stroke-width: 1; }
.card__index { font: 700 13px system-ui, sans-serif; }
.card--selected { transform: translateY(-12px); }
.card--dimmed { opacity: 0.45; }

.card-row { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 0; margin: 12px 0; }
.hand { --card-w: 52px; list-style: none; display: flex; justify-content: center; padding: 16px 0 0; margin: 0; }
.hand__slot + .hand__slot { margin-left: -20px; }

.trick { background: var(--felt); color: var(--felt-text); border-radius: 16px; padding: 16px; min-height: 140px; display: grid; place-items: center; }
.trick__empty { margin: 0; }
.trick__cards { list-style: none; display: flex; gap: 12px; justify-content: center; padding: 0; margin: 0; }
.trick__slot { display: flex; flex-direction: column; align-items: center; gap: 4px; --card-w: 60px; }
.trick__label { font-size: 0.8rem; }

/* Ustawienia i słowniczek */
.settings__group { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); margin: 0 0 16px; padding: 12px 16px; display: grid; gap: 10px; }
.settings__group legend { font-weight: 700; padding: 0 4px; }
.settings__option { display: flex; gap: 10px; align-items: flex-start; min-height: 32px; }
.settings__option input { margin-top: 4px; }
.glossary__table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: var(--radius); overflow: hidden; }
.glossary__table th, .glossary__table td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border); }
.glossary__table th { color: var(--muted); font-weight: 600; }

.error-screen, .not-found { text-align: center; padding: 32px 0; }

@media (min-width: 600px) {
  .hand { --card-w: 64px; }
  .hand__slot + .hand__slot { margin-left: -16px; }
  .lesson__actions .button { width: auto; }
}
```

- [ ] **Step 2: Zbuduj aplikację**

Run: `npm run build`
Expected: `tsc` bez błędów, Vite tworzy `dist/` („✓ built in …”).

- [ ] **Step 3: Dodaj konfigurację serwera dla podglądu** (`.claude/launch.json`)

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "skat-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 5173
    }
  ]
}
```

- [ ] **Step 4: Sprawdź aplikację w przeglądarce (szerokość telefonu 375 px)**

Uruchom serwer `skat-dev` (narzędzie podglądu albo `npm run dev`) i otwórz `http://localhost:5173`. Sprawdź:
1. Mapa kursu: przycisk „Zacznij naukę”, lekcja 1 dostępna, 2–5 zablokowane.
2. Przejdź lekcję 1 do końca — podsumowanie, lekcja 2 odblokowana na mapie.
3. Ustawienia: talia francuska → karty z symbolami ♣♠♥♦; język potoczny → w lekcjach „sztych”, „szpiler”.
4. Lekcja 5 (włącz „Odblokuj wszystkie lekcje”): ręka 4–5 kart mieści się w szerokości ekranu bez przewijania w poziomie; wybrana karta unosi się, drugie dotknięcie zagrywa, karta pojawia się na stole z podpisem „Ty”.
5. Przeładowanie strony zachowuje postęp i ustawienia.
6. Ciemny motyw systemu: tekst czytelny, karty białe.

Popraw style, jeśli coś się nie mieści, i powtórz `npm test && npm run build`.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css .claude/launch.json
git commit -m "feat(ui): style mobile-first z jasnym i ciemnym motywem" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Kolejne plany (do rozpisania po zakończeniu Planu 1)

**Plan 2 — Wartość gry, licytacja, mini-rozdania, lekcje 6–19**
- Silnik: wartość gry (matadory, mnożniki, nulle, przegrana ×2, przelicytowanie, kontra/re, Seeger-Fabian), stawki licytacji (generowane i testowane), przebieg licytacji, stan pełnego rozdania (kolejne lewy, liczenie oczek, wynik).
- Ćwiczenia `bid` (maksymalna stawka / wybór gry / 2 karty do skata / wartość gry) i `miniDeal` (stół z zakrytymi kartami przeciwników, punkty kontrolne).
- Boty: interfejs `chooseCard(stan, gracz)`, skrypt z ćwiczenia + heurystyka zastępcza.
- Walidacja treści rozszerzona o nowe typy (wartości zgodne z silnikiem, dozwolone skrypty botów).
- Treść: lekcje 6–19 (reszta modułu 2, moduły 3–4) i nowe terminy w słowniku (krawiec, czarny, z ręki, kontra, pas…).

**Plan 3 — Taktyka, dodatek, karty z Wikimedia, wydanie**
- Treść: moduły 5–6 (lekcje 20–30) i dodatek (ramsz, bocki — z rozszerzeniem silnika o ramsza).
- Testy modułowe na końcu każdego modułu (+ zapis wyników w stanie, migracja schematu v1 → v2).
- Grafiki kart z Wikimedia Commons (dobór talii, kopie lokalne, strona „O kartach” z atrybucją; renderer SVG zostaje jako zapasowy).
- Test E2E (Playwright) w widoku telefonu, wdrożenie na GitHub Pages (GitHub Actions).
