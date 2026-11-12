# Trener skata — Plan 2: rozgrywka (moduł 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ukończony moduł 2 kursu (lekcje 6–11): kolejność kart, atu, walety, grand, null i pierwsze pełne rozdanie przeciwko botom. Do tego nazwy kart w przypadkach, etykieta rodzaju gry, quizy sprawdzane silnikiem i nowe ćwiczenie `miniDeal`.

**Architecture:** Silnik dostaje stan całego rozdania (`src/engine/deal.ts`), a nowy moduł `src/bots` — boty heurystyczne i skryptowane z jednym interfejsem `Bot`. Logika mini-rozdania (start, boty, cel, symulacja wzorcowego rozegrania) jest czystym kodem w `src/content/miniDeal.ts`. Korzystają z niej walidator treści i komponent `MiniDealExercise`. Słownik obsługuje przypadki nazw kart (`[[card:h-10:B]]` daje „dziesiątkę czerwienną”).

**Tech Stack:** jak w Planie 1 — Vite 6, React 18, TypeScript 5, Vitest 3 + jsdom, React Testing Library, user-event. Node ≥ 22.4 (testy uruchamiane z `--no-experimental-webstorage`, skonfigurowane w `vite.config.ts`).

**Specyfikacja:** `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`. Plan 1: `docs/superpowers/plans/2026-11-12-skat-trainer-plan-1-fundament.md` (zrealizowany).

**Zmiana podziału planów:** pierwotny „Plan 2” rozdzielamy na dwie części.
- **Plan 2 (ten): rozgrywka, moduł 2.**
- **Plan 3: wartość gry i licytacja, moduły 3–4.** Obejmuje wycenę gier, stawki i przebieg licytacji, ćwiczenie `bid` oraz lekcje 12–19.
- **Plan 4: taktyka, dodatek, grafiki z Wikimedia, E2E i wdrożenie.**

**Konwencje (jak w Planie 1):**
- Identyfikatory w kodzie po angielsku, teksty po polsku.
- Karty: `<kolor>-<ranga>`, kolory `c s h d`, rangi `7 8 9 10 J Q K A`. Miejsca `Seat = 0 | 1 | 2` (przodek, środek, zadek).
- Tokeny: `[[termin]]`, `[[termin:B]]`, `[[Termin]]`, `[[card:h-10]]`, `[[card:h-10:B]]` (nowe), `[[suit:c]]`, `{oficjalnie|potocznie}`.
- Każde zadanie kończy się commitem z linią `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Polecenia uruchamiaj w `/Users/gkocur/skat`.

**Uwaga o danych słownika:** autor kursu może edytować `src/glossary/terms.ts` i `src/glossary/cardNames.ts`. Przed Task 1 uruchom `git status` i `git log -3 -- src/glossary`. W tych dwóch plikach rób **punktowe** zmiany narzędziem Edit, nigdy nie nadpisuj ich w całości. Jeśli autor zmienił jakieś słowo, zostaw jego wersję i dopisz tylko brakujące formy.

---

## Struktura plików (zmiany w Planie 2)

```
src/
  engine/
    order.ts          ZMIANA: eksport cardStrength
    deal.ts           NOWY: stan rozdania, zagranie, koniec, wynik, drużyny
    index.ts          ZMIANA: eksport deal
  bots/
    types.ts          NOWY: typ Bot
    heuristic.ts      NOWY: prosty bot heurystyczny
    scripted.ts       NOWY: bot ze skryptem + fabryka createBot
    index.ts          NOWY
  glossary/
    terms.ts          ZMIANA (punktowo): formy rang w l.poj., atu N/Ms, as Blm/Nlm
    cardNames.ts      ZMIANA (punktowo): przymiotniki przez temat (adjStem), przypadki nazw kart
    text.ts           ZMIANA: [[card:x:PRZYPADEK]]
    game.ts           NOWY: gameLabel
    plural.ts         NOWY: countCase, pluralPl
    index.ts          ZMIANA: eksport game, plural
  content/
    types.ts          ZMIANA: verify w quizie, showGame, MiniDealExerciseData
    miniDeal.ts       NOWY: start, boty, punkty, cel, symulacja
    validate.ts       ZMIANA: verify, showGame, miniDeal
    course.ts         ZMIANA: lekcje 6–11
    course.test.ts    ZMIANA: usunięty test „sum oczek” (zastąpiony przez verify)
    lessons/m1-l03-oczka.ts         ZMIANA: verify points
    lessons/m2-l05-dokladanie.ts    ZMIANA: showGame: false
    lessons/m2-l06-kolejnosc.ts     NOWY
    lessons/m2-l07-atu.ts           NOWY
    lessons/m2-l08-walety.ts        NOWY
    lessons/m2-l09-grand.ts         NOWY
    lessons/m2-l10-null.ts          NOWY
    lessons/m2-l11-pierwsze-rozdanie.ts  NOWY
  cards/
    TrickView.tsx     ZMIANA: prop emptyText
    CardBack.tsx      NOWY: rewers karty
    OpponentView.tsx  NOWY: przeciwnik (miejsce, liczba kart, aktywność)
  exercises/
    GameBanner.tsx    NOWY: etykieta rodzaju gry
    PlayCardExercise.tsx  ZMIANA: GameBanner (showGame)
    MiniDealExercise.tsx  NOWY
    ExerciseView.tsx  ZMIANA: case miniDeal
  styles.css          ZMIANA: adaptacyjna szerokość kart, przeciwnicy, baner gry
```

---

### Task 1: Nazwy kart w przypadkach

**Files:**
- Modify: `src/glossary/terms.ts` (punktowo), `src/glossary/cardNames.ts` (punktowo), `src/glossary/text.ts` (całość)
- Test: `src/glossary/cardNames.test.ts`, `src/glossary/text.test.ts`

- [ ] **Step 1: Sprawdź stan plików słownika**

Run: `git status --short && git log --oneline -3 -- src/glossary`
Jeśli `terms.ts` lub `cardNames.ts` mają zmiany autora (niezacommitowane albo commit spoza planów), uwzględnij je w kolejnych krokach: dodawaj formy do słów autora, nie zmieniaj ich.

- [ ] **Step 2: Dopisz testy (na końcu istniejących plików testowych)**

Dopisz do `src/glossary/cardNames.test.ts` (wewnątrz `describe('nazwy kart', ...)`):

```ts
  it('nazwy kart w przypadkach — Altenburg, oficjalnie', () => {
    const ctx = { deck: 'altenburg', register: 'official' } as const;
    expect(cardName('h-10', ctx, 'B')).toBe('dziesiątkę czerwienną');
    expect(cardName('c-A', ctx, 'B')).toBe('asa żołędnego');
    expect(cardName('s-J', ctx, 'N')).toBe('niżnikiem zielonym');
    expect(cardName('d-7', ctx, 'D')).toBe('siódemki dzwonkowej');
    expect(cardName('h-K', ctx, 'Ms')).toBe('królu czerwiennym');
  });

  it('nazwy kart w przypadkach — kolor jako nieodmienny rzeczownik', () => {
    expect(cardName('c-A', { deck: 'french', register: 'official' }, 'N')).toBe('asem trefl');
    expect(cardName('s-Q', { deck: 'french', register: 'official' }, 'B')).toBe('damę pik');
    expect(cardName('d-J', { deck: 'altenburg', register: 'colloquial' }, 'D')).toBe('unera szele');
  });

  it('każda ranga ma wszystkie przypadki nazw kart w każdym wariancie', () => {
    for (const rank of RANKS) {
      for (const forms of formVariants(TERMS[RANK_TERM[rank]])) {
        for (const c of CARD_CASES) expect(forms[c], `${rank} ${c}`).toBeDefined();
      }
    }
  });
```

i zmień import na górze pliku na:

```ts
import { CARD_CASES, RANK_TERM, cardName, rankLabel, suitName } from './cardNames';
```

Dopisz do `src/glossary/text.test.ts` w `describe('resolveText', ...)`:

```ts
  it('podstawia nazwy kart w przypadkach', () => {
    expect(resolveText('Dołóż [[card:h-10:B]].', official)).toBe('Dołóż dziesiątkę czerwienną.');
    expect(resolveText('[[Card:c-A:N]]', french)).toBe('Asem trefl');
  });
```

i w `describe('findTextIssues', ...)`:

```ts
  it('sprawdza przypadki nazw kart', () => {
    expect(findTextIssues('[[card:h-10:B]]')).toEqual([]);
    expect(findTextIssues('[[card:h-10:X]]')).toEqual(['Nieznana forma karty: X']);
    expect(findTextIssues('[[card:h-10:B:C]]')).toEqual(['Zły token: card:h-10:B:C']);
    expect(findTextIssues('[[suit:c:B]]')).toEqual(['Zły token: suit:c:B']);
  });
```

- [ ] **Step 3: Uruchom testy i sprawdź, że nie przechodzą**

Run: `npx vitest run src/glossary`
Expected: FAIL. `CARD_CASES` nie istnieje, a `cardName` ignoruje przypadek.

- [ ] **Step 4: Uzupełnij formy w `src/glossary/terms.ts` (punktowo, narzędziem Edit)**

Dopisz brakujące formy, zachowując istniejące słowa. Docelowe wpisy przy obecnych danych:

```ts
  atu: plain({
    official: { M: 'atu', g: 'n', D: 'atu', B: 'atu', N: 'atu', Ms: 'atu', Mlm: 'atuty', Dlm: 'atutów', Blm: 'atuty', Nlm: 'atutami' },
    colloquial: { M: 'trumf', g: 'm', D: 'trumfa', B: 'trumfa', N: 'trumfem', Ms: 'trumfie', Mlm: 'trumfy', Dlm: 'trumfów', Blm: 'trumfy', Nlm: 'trumfami' },
  }),
```

```ts
  siodemka: plain(same({ M: 'siódemka', g: 'f', D: 'siódemki', C: 'siódemce', B: 'siódemkę', N: 'siódemką', Ms: 'siódemce', Mlm: 'siódemki', Dlm: 'siódemek' })),
  osemka: plain(same({ M: 'ósemka', g: 'f', D: 'ósemki', C: 'ósemce', B: 'ósemkę', N: 'ósemką', Ms: 'ósemce', Mlm: 'ósemki', Dlm: 'ósemek' })),
  dziewiatka: plain(same({ M: 'dziewiątka', g: 'f', D: 'dziewiątki', C: 'dziewiątce', B: 'dziewiątkę', N: 'dziewiątką', Ms: 'dziewiątce', Mlm: 'dziewiątki', Dlm: 'dziewiątek' })),
  dziesiatka: plain(same({ M: 'dziesiątka', g: 'f', D: 'dziesiątki', C: 'dziesiątce', B: 'dziesiątkę', N: 'dziesiątką', Ms: 'dziesiątce', Mlm: 'dziesiątki', Dlm: 'dziesiątek' })),
```

W `walet`, `dama`, `krol` i `as` dopisz `C` i `Ms` (l.poj.) w każdym wariancie, a w `as` także `Blm` i `Nlm`:
- `niżnik`: `C: 'niżnikowi', Ms: 'niżniku'`; `uner`: `C: 'unerowi', Ms: 'unerze'`; `walet`: `C: 'waletowi', Ms: 'walecie'`; `jopek`: `C: 'jopkowi', Ms: 'jopku'`
- `wyżnik`: `C: 'wyżnikowi', Ms: 'wyżniku'`; `ober`: `C: 'oberowi', Ms: 'oberze'`; `dama`: `C: 'damie', Ms: 'damie'`
- `król`: `C: 'królowi', Ms: 'królu'`
- `as` (Altenburg oficjalnie i francuska): `C: 'asowi', Ms: 'asie', Blm: 'asy', Nlm: 'asami'`; `daus`: `C: 'dausowi', Ms: 'dausie', Blm: 'dausy', Nlm: 'dausami'`

- [ ] **Step 5: Zmień przymiotniki kolorów w `src/glossary/cardNames.ts` (punktowo)**

1. Zastąp interfejs `SuitName`:

```ts
export interface SuitName {
  /** Nazwa koloru jako rzeczownik, np. „czerwień”, „kier”. */
  noun: string;
  /** Temat przymiotnika (np. „czerwienn”) — końcówka zależy od rodzaju i przypadku.
   *  Gdy brak — nazwa karty to „figura + rzeczownik” (np. „as kier”). */
  adjStem?: string;
}
```

2. W `SUIT_NAMES.altenburg.official` zamień `adj: { m: '…y', f: '…a' }` na `adjStem` (temat = forma męska bez końcowego `y`):

```ts
      c: { noun: 'żołądź', adjStem: 'żołędn' },
      s: { noun: 'zielone', adjStem: 'zielon' },
      h: { noun: 'czerwień', adjStem: 'czerwienn' },
      d: { noun: 'dzwonek', adjStem: 'dzwonkow' },
```

3. Zastąp funkcję `cardName` i dodaj nad nią stałe:

```ts
/** Przypadki, w jakich można odmienić nazwę karty: `[[card:h-10:B]]`. */
export const CARD_CASES = ['M', 'D', 'C', 'B', 'N', 'Ms'] as const;
export type CardCase = (typeof CARD_CASES)[number];

// Figury (as, król, niżnik…) są w kartach rzeczownikami żywotnymi: biernik = dopełniacz („asa żołędnego”).
const ADJ_ENDINGS: Record<'m' | 'f', Record<CardCase, string>> = {
  m: { M: 'y', D: 'ego', C: 'emu', B: 'ego', N: 'ym', Ms: 'ym' },
  f: { M: 'a', D: 'ej', C: 'ej', B: 'ą', N: 'ą', Ms: 'ej' },
};

export function cardName(card: CardId, ctx: TextContext, caseKey: CardCase = 'M'): string {
  const rankForms = formsFor(TERMS[RANK_TERM[rankOf(card)]], ctx);
  const rank = rankForms[caseKey] ?? rankForms.M;
  const suit = SUIT_NAMES[ctx.deck][ctx.register][suitOf(card)];
  if (suit.adjStem) return `${rank} ${suit.adjStem}${ADJ_ENDINGS[rankForms.g === 'f' ? 'f' : 'm'][caseKey]}`;
  return `${rank} ${suit.noun}`;
}
```

- [ ] **Step 6: Zastąp `src/glossary/text.ts`**

```ts
// src/glossary/text.ts
import { isCardId, isSuit } from '../engine';
import { CARD_CASES, cardName, suitName, type CardCase } from './cardNames';
import { TERMS, formVariants, formsFor } from './terms';
import { CASES, type CaseKey, type TextContext } from './types';

const ALT = /\{([^{}|]*)\|([^{}|]*)\}/g;
const TOKEN = /\[\[([^[\]]+)\]\]/g;

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isCaseKey = (s: string): s is CaseKey => (CASES as readonly string[]).includes(s);
const isCardCase = (s: string): s is CardCase => (CARD_CASES as readonly string[]).includes(s);
const hasTerm = (key: string) => Object.hasOwn(TERMS, key);

interface ParsedToken {
  key: string;
  arg: string | undefined;
  /** Przypadek nazwy karty (tylko dla `card`). */
  cardCase: string | undefined;
  capital: boolean;
  extra: boolean;
}

function parseToken(raw: string): ParsedToken {
  const [head = '', arg, ...rest] = raw.split(':');
  const key = lowerFirst(head);
  const allowsCase = key === 'card';
  return {
    key,
    arg,
    cardCase: allowsCase ? rest[0] : undefined,
    capital: head !== key,
    extra: rest.length > (allowsCase ? 1 : 0),
  };
}

function lookup(token: ParsedToken, ctx: TextContext): string | null {
  const { key, arg, cardCase } = token;
  if (key === 'card') {
    if (arg === undefined || !isCardId(arg)) return null;
    const c = cardCase ?? 'M';
    return isCardCase(c) ? cardName(arg, ctx, c) : null;
  }
  if (key === 'suit') return arg !== undefined && isSuit(arg) ? suitName(arg, ctx) : null;
  if (!hasTerm(key)) return null;
  const term = TERMS[key];
  const caseKey = arg ?? 'M';
  const word = isCaseKey(caseKey) ? formsFor(term, ctx)[caseKey] : undefined;
  return word ?? formsFor(term, { ...ctx, register: 'official' }).M;
}

function resolveToken(raw: string, ctx: TextContext): string {
  const token = parseToken(raw);
  const word = token.extra ? null : lookup(token, ctx);
  if (word === null) return `[[${raw}]]`;
  return token.capital ? upperFirst(word) : word;
}

export function resolveText(text: string, ctx: TextContext): string {
  const chosen = text.replace(ALT, (_match, official: string, colloquial: string) =>
    ctx.register === 'official' ? official : colloquial,
  );
  return chosen.replace(TOKEN, (_match, raw: string) => resolveToken(raw, ctx));
}

function checkToken(raw: string): string | null {
  const { key, arg, cardCase, extra } = parseToken(raw);
  if (extra) return `Zły token: ${raw}`;
  if (key === 'card') {
    if (arg === undefined || !isCardId(arg)) return `Nieznana karta: ${arg ?? ''}`;
    return cardCase === undefined || isCardCase(cardCase) ? null : `Nieznana forma karty: ${cardCase}`;
  }
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

- [ ] **Step 7: Uruchom testy słownika i całość**

Run: `npx vitest run src/glossary && npm test && npm run typecheck`
Expected: PASS (dotychczasowe testy nazw kart w mianowniku też przechodzą).

- [ ] **Step 8: Commit**

```bash
git add src/glossary
git commit -m "feat(glossary): nazwy kart w przypadkach" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Silnik — stan rozdania

**Files:**
- Modify: `src/engine/order.ts` (całość), `src/engine/index.ts`
- Create: `src/engine/deal.ts`
- Test: `src/engine/deal.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/engine/deal.test.ts
import { describe, expect, it } from 'vitest';
import { createDeal, currentPlayer, dealResult, isDealOver, playCard, sameTeam, type DealState } from './deal';
import type { GameType } from './game';

const hearts: GameType = { kind: 'suit', trump: 'h' };

const smallDeal = (): DealState =>
  createDeal({
    game: hearts,
    declarer: 0,
    hands: [['c-J', 'c-A'], ['c-7', 's-10'], ['c-8', 's-A']],
    skat: ['d-10'],
  });

describe('rozdanie', () => {
  it('przodek zaczyna, kolejka idzie zgodnie z miejscami', () => {
    let state = smallDeal();
    expect(currentPlayer(state)).toBe(0);
    state = playCard(state, 'c-J');
    expect(currentPlayer(state)).toBe(1);
    expect(state.hands[0]).toEqual(['c-A']);
    expect(state.trick).toEqual(['c-J']);
  });

  it('po trzech kartach lewa trafia do zwycięzcy, który wychodzi dalej', () => {
    let state = smallDeal();
    for (const card of ['c-J', 's-10', 'c-8'] as const) state = playCard(state, card);
    expect(state.trick).toEqual([]);
    expect(state.tricks).toEqual([{ leader: 0, cards: ['c-J', 's-10', 'c-8'], winner: 0 }]);
    expect(currentPlayer(state)).toBe(0);
  });

  it('odrzuca niedozwolone zagranie i grę po końcu rozdania', () => {
    const afterLead = playCard(smallDeal(), 'c-A');
    expect(() => playCard(afterLead, 's-10')).toThrow(/Niedozwolone/);
    let state = smallDeal();
    for (const card of ['c-J', 's-10', 'c-8', 'c-A', 'c-7', 's-A'] as const) state = playCard(state, card);
    expect(isDealOver(state)).toBe(true);
    expect(() => playCard(state, 'c-A')).toThrow(/zakończone/);
  });

  it('wynik: oczka rozgrywającego liczą skat, wygrana od 61', () => {
    let state = smallDeal();
    for (const card of ['c-J', 's-10', 'c-8', 'c-A', 'c-7', 's-A'] as const) state = playCard(state, card);
    expect(dealResult(state)).toEqual({ declarerPoints: 44, defenderPoints: 0, declarerTricks: 2, declarerWon: false });
  });

  it('null kończy się, gdy rozgrywający weźmie lewę', () => {
    let state = createDeal({
      game: { kind: 'null' },
      declarer: 1,
      hands: [['h-7', 's-7'], ['h-A', 's-8'], ['h-8', 's-9']],
    });
    for (const card of ['h-7', 'h-A', 'h-8'] as const) state = playCard(state, card);
    expect(isDealOver(state)).toBe(true);
    expect(dealResult(state).declarerWon).toBe(false);
  });

  it('drużyny: obrońcy grają razem', () => {
    expect(sameTeam(1, 2, 0)).toBe(true);
    expect(sameTeam(0, 1, 0)).toBe(false);
    expect(sameTeam(0, 0, 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/engine/deal.test.ts`
Expected: FAIL — „Failed to resolve import "./deal"”.

- [ ] **Step 3: Udostępnij siłę karty — zastąp `src/engine/order.ts`**

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

/**
 * Siła karty w obrębie jej grupy (atu albo kolor). Walety w atu: 101–104.
 * Porównywalna tylko między kartami tej samej grupy.
 */
export function cardStrength(card: CardId, game: GameType): number {
  if (game.kind === 'null') return NULL_ORDER.indexOf(rankOf(card));
  if (rankOf(card) === 'J') return 100 + JACK_STRENGTH[suitOf(card)];
  return NORMAL_ORDER.indexOf(rankOf(card));
}

function beats(challenger: CardId, current: CardId, game: GameType): boolean {
  const challengerTrump = isTrump(challenger, game);
  const currentTrump = isTrump(current, game);
  if (challengerTrump !== currentTrump) return challengerTrump;
  if (!challengerTrump && suitOf(challenger) !== suitOf(current)) return false;
  return cardStrength(challenger, game) > cardStrength(current, game);
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
  return [...hand].sort((a, b) => group(a) - group(b) || cardStrength(b, game) - cardStrength(a, game));
}
```

- [ ] **Step 4: Zaimplementuj `deal.ts`**

```ts
// src/engine/deal.ts
import { sumPoints, type CardId } from './cards';
import { nextSeat, type GameType, type Seat } from './game';
import { trickWinner } from './order';
import { isLegalMove } from './rules';

export type Hands = [CardId[], CardId[], CardId[]];

export interface CompletedTrick {
  leader: Seat;
  cards: CardId[];
  winner: Seat;
}

export interface DealState {
  game: GameType;
  declarer: Seat;
  hands: Hands;
  skat: CardId[];
  /** Kto wychodzi do bieżącej lewy. */
  leader: Seat;
  /** Karty bieżącej (niepełnej) lewy. */
  trick: CardId[];
  tricks: CompletedTrick[];
}

export interface DealSetup {
  game: GameType;
  declarer: Seat;
  hands: Hands;
  skat?: CardId[];
  leader?: Seat;
}

export function createDeal(setup: DealSetup): DealState {
  return {
    game: setup.game,
    declarer: setup.declarer,
    hands: [[...setup.hands[0]], [...setup.hands[1]], [...setup.hands[2]]],
    skat: [...(setup.skat ?? [])],
    leader: setup.leader ?? 0,
    trick: [],
    tricks: [],
  };
}

export function currentPlayer(state: DealState): Seat {
  return nextSeat(state.leader, state.trick.length);
}

/** Rozgrywający gra sam; obrońcy tworzą drużynę. */
export function sameTeam(a: Seat, b: Seat, declarer: Seat): boolean {
  return a === b || (a !== declarer && b !== declarer);
}

export function isDealOver(state: DealState): boolean {
  if (state.trick.length === 0 && state.hands.every((hand) => hand.length === 0)) return true;
  return state.game.kind === 'null' && state.tricks.some((t) => t.winner === state.declarer);
}

export function playCard(state: DealState, card: CardId): DealState {
  if (isDealOver(state)) throw new Error('Rozdanie jest zakończone');
  const seat = currentPlayer(state);
  if (!isLegalMove(card, state.hands[seat], state.trick, state.game)) {
    throw new Error(`Niedozwolone zagranie: ${card}`);
  }
  const hands = state.hands.map((hand, i) => (i === seat ? hand.filter((c) => c !== card) : hand)) as Hands;
  const trick = [...state.trick, card];
  if (trick.length < 3) return { ...state, hands, trick };
  const winner = nextSeat(state.leader, trickWinner(trick, state.game));
  return {
    ...state,
    hands,
    trick: [],
    leader: winner,
    tricks: [...state.tricks, { leader: state.leader, cards: trick, winner }],
  };
}

export interface DealResult {
  declarerPoints: number;
  defenderPoints: number;
  declarerTricks: number;
  declarerWon: boolean;
}

/** Wynik (także w trakcie): oczka z wziętych lew; skat liczy się rozgrywającemu poza nullem. */
export function dealResult(state: DealState): DealResult {
  const declarerTricks = state.tricks.filter((t) => t.winner === state.declarer);
  const defenderTricks = state.tricks.filter((t) => t.winner !== state.declarer);
  const skatPoints = state.game.kind === 'null' ? 0 : sumPoints(state.skat);
  const declarerPoints = sumPoints(declarerTricks.flatMap((t) => t.cards)) + skatPoints;
  const defenderPoints = sumPoints(defenderTricks.flatMap((t) => t.cards));
  const declarerWon = state.game.kind === 'null' ? declarerTricks.length === 0 : declarerPoints >= 61;
  return { declarerPoints, defenderPoints, declarerTricks: declarerTricks.length, declarerWon };
}
```

Dopisz do `src/engine/index.ts`:

```ts
export * from './deal';
```

- [ ] **Step 5: Uruchom testy silnika**

Run: `npx vitest run src/engine && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/engine
git commit -m "feat(engine): stan rozdania, kolejne lewy i wynik" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Boty

**Files:**
- Create: `src/bots/types.ts`, `src/bots/heuristic.ts`, `src/bots/scripted.ts`, `src/bots/index.ts`
- Test: `src/bots/bots.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/bots/bots.test.ts
import { describe, expect, it } from 'vitest';
import { createDeal, isDealOver, playCard, currentPlayer, type DealState, type GameType, type Hands } from '../engine';
import { createBot, heuristicBot } from './index';

const hearts: GameType = { kind: 'suit', trump: 'h' };

function stateAfter(game: GameType, declarer: 0 | 1 | 2, leader: 0 | 1 | 2, hands: Hands, plays: string[]): DealState {
  let state = createDeal({ game, declarer, leader, hands });
  for (const card of plays) state = playCard(state, card as never);
  return state;
}

describe('bot heurystyczny', () => {
  it('dokłada oczka, gdy lewę bierze partner', () => {
    const state = stateAfter(hearts, 0, 1, [['h-7'], ['s-A'], ['s-10', 's-7']], ['s-A']);
    expect(heuristicBot(state, 2)).toBe('s-10');
  });

  it('bierze lewę najtańszą wygrywającą kartą', () => {
    const state = stateAfter(hearts, 0, 1, [['s-A', 's-10', 'h-7'], ['s-K'], ['s-7']], ['s-K', 's-7']);
    expect(heuristicBot(state, 0)).toBe('s-10');
  });

  it('bez szans na lewę zrzuca najtańszą kartę', () => {
    const state = stateAfter(hearts, 0, 1, [['c-K', 'c-7'], ['s-A'], ['s-7']], ['s-A', 's-7']);
    expect(heuristicBot(state, 0)).toBe('c-7');
  });

  it('wyjście: rozgrywający ciągnie najwyższe atu, obrońca wychodzi asem', () => {
    const declarerLead = stateAfter(hearts, 0, 0, [['s-A', 'h-7', 'h-J'], [], []], []);
    expect(heuristicBot(declarerLead, 0)).toBe('h-J');
    const defenderLead = stateAfter(hearts, 0, 1, [[], ['s-7', 's-A', 'd-9'], []], []);
    expect(heuristicBot(defenderLead, 1)).toBe('s-A');
  });

  it('null: rozgrywający podkłada się pod lewę', () => {
    const state = stateAfter({ kind: 'null' }, 0, 1, [['h-10', 'h-7', 'h-A'], ['h-9'], ['h-8']], ['h-9', 'h-8']);
    expect(heuristicBot(state, 0)).toBe('h-7');
  });

  it('trzy boty rozgrywają całe rozdanie bez błędu', () => {
    let state = createDeal({
      game: hearts,
      declarer: 0,
      hands: [
        ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'c-A', 's-A', 'd-A'],
        ['h-Q', 'h-9', 'c-10', 'c-K', 'c-Q', 's-10', 's-K', 'd-10', 'd-9', 'd-8'],
        ['h-8', 'h-7', 'c-9', 'c-8', 'c-7', 's-Q', 's-9', 's-8', 'd-K', 'd-Q'],
      ],
      skat: ['d-7', 's-7'],
    });
    while (!isDealOver(state)) {
      const seat = currentPlayer(state);
      state = playCard(state, heuristicBot(state, seat));
    }
    expect(state.tricks).toHaveLength(10);
  });
});

describe('bot ze skryptem', () => {
  it('gra kartę ze skryptu, jeśli jest dozwolona; inaczej heurystyka', () => {
    const state = stateAfter(hearts, 0, 1, [['h-7'], ['s-A'], ['s-10', 's-7', 'c-9']], ['s-A']);
    expect(createBot(['s-7'])(state, 2)).toBe('s-7');
    expect(createBot(['c-9'])(state, 2)).toBe('s-10');
    expect(createBot()(state, 2)).toBe('s-10');
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/bots`
Expected: FAIL — „Failed to resolve import "./index"”.

- [ ] **Step 3: Zaimplementuj boty**

```ts
// src/bots/types.ts
import type { CardId, DealState, Seat } from '../engine';

/** Wybiera dozwoloną kartę dla gracza `seat`, który jest teraz na ruchu. */
export type Bot = (state: DealState, seat: Seat) => CardId;
```

```ts
// src/bots/heuristic.ts
import {
  cardPoints,
  cardStrength,
  isTrump,
  legalMoves,
  nextSeat,
  rankOf,
  sameTeam,
  trickWinner,
  type CardId,
  type GameType,
} from '../engine';
import type { Bot } from './types';

function minBy(cards: CardId[], key: (card: CardId) => number): CardId {
  return cards.reduce((best, card) => (key(card) < key(best) ? card : best));
}

function maxBy(cards: CardId[], key: (card: CardId) => number): CardId {
  return cards.reduce((best, card) => (key(card) > key(best) ? card : best));
}

/** Im mniej, tym „tańsza” karta: najpierw oczka, potem atu, potem siła. */
function cheapness(card: CardId, game: GameType): number {
  return cardPoints(card) * 1000 + (isTrump(card, game) ? 500 : 0) + cardStrength(card, game);
}

/** Prosty bot do ćwiczeń — gra poprawnie, ale nie jest silnym przeciwnikiem. */
export const heuristicBot: Bot = (state, seat) => {
  const { game, trick } = state;
  const legal = legalMoves(state.hands[seat], trick, game);
  if (legal.length === 0) throw new Error(`Gracz ${seat} nie ma kart`);
  const strength = (card: CardId) => cardStrength(card, game);
  const winsNow = (card: CardId) => trickWinner([...trick, card], game) === trick.length;

  if (game.kind === 'null') {
    if (seat !== state.declarer || trick.length === 0) return minBy(legal, strength);
    const safe = legal.filter((card) => !winsNow(card));
    return safe.length > 0 ? maxBy(safe, strength) : minBy(legal, strength);
  }

  if (trick.length === 0) {
    const trumps = legal.filter((card) => isTrump(card, game));
    if (seat === state.declarer && trumps.length > 0) return maxBy(trumps, strength);
    const ace = legal.find((card) => rankOf(card) === 'A' && !isTrump(card, game));
    return ace ?? minBy(legal, (card) => cheapness(card, game));
  }

  const winnerSeat = nextSeat(state.leader, trickWinner(trick, game));
  if (sameTeam(winnerSeat, seat, state.declarer)) {
    // Partner bierze lewę — dokładamy jak najwięcej oczek, najchętniej nie z atu.
    return maxBy(legal, (card) => (isTrump(card, game) ? 0 : 100_000) + cardPoints(card) * 1000 - strength(card));
  }
  const winners = legal.filter(winsNow);
  if (winners.length > 0) return minBy(winners, (card) => (isTrump(card, game) ? 1000 : 0) + strength(card));
  return minBy(legal, (card) => cheapness(card, game));
};
```

```ts
// src/bots/scripted.ts
import { legalMoves, type CardId } from '../engine';
import { heuristicBot } from './heuristic';
import type { Bot } from './types';

/** Gra pierwszą kartę ze skryptu, którą jeszcze ma — o ile jest dozwolona; inaczej `fallback`. */
export function scriptedBot(script: readonly CardId[], fallback: Bot = heuristicBot): Bot {
  return (state, seat) => {
    const hand = state.hands[seat];
    const next = script.find((card) => hand.includes(card));
    if (next && legalMoves(hand, state.trick, state.game).includes(next)) return next;
    return fallback(state, seat);
  };
}

export function createBot(script?: readonly CardId[]): Bot {
  return script && script.length > 0 ? scriptedBot(script) : heuristicBot;
}
```

```ts
// src/bots/index.ts
export * from './types';
export * from './heuristic';
export * from './scripted';
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/bots && npm run typecheck`
Expected: PASS (7 testów).

- [ ] **Step 5: Commit**

```bash
git add src/bots
git commit -m "feat(bots): bot heurystyczny i bot ze skryptem" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Słownik — etykieta gry i liczebniki

**Files:**
- Create: `src/glossary/game.ts`, `src/glossary/plural.ts`
- Modify: `src/glossary/index.ts`
- Test: `src/glossary/game.test.ts`

- [ ] **Step 1: Napisz test**

```ts
// src/glossary/game.test.ts
import { describe, expect, it } from 'vitest';
import { gameLabel } from './game';
import { countCase, pluralPl } from './plural';

const official = { deck: 'altenburg', register: 'official' } as const;
const colloquial = { deck: 'altenburg', register: 'colloquial' } as const;

describe('etykieta gry', () => {
  it('opisuje rodzaj gry i atu', () => {
    expect(gameLabel({ kind: 'suit', trump: 'h' }, official)).toBe('Gra kolorowa · atu: czerwień');
    expect(gameLabel({ kind: 'suit', trump: 'h' }, colloquial)).toBe('Farbszpil · trumf: herc');
    expect(gameLabel({ kind: 'grand' }, official)).toBe('Grand · atu: tylko niżniki');
    expect(gameLabel({ kind: 'null' }, colloquial)).toBe('Nul · bez trumfa');
  });
});

describe('liczebniki', () => {
  it('dobiera formę rzeczownika do liczby', () => {
    expect([1, 2, 4, 5, 11, 12, 22, 25, 0].map(countCase)).toEqual(['M', 'Mlm', 'Mlm', 'Dlm', 'Dlm', 'Dlm', 'Mlm', 'Dlm', 'Dlm']);
    expect(pluralPl(1, ['karta', 'karty', 'kart'])).toBe('karta');
    expect(pluralPl(3, ['karta', 'karty', 'kart'])).toBe('karty');
    expect(pluralPl(7, ['karta', 'karty', 'kart'])).toBe('kart');
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/glossary/game.test.ts`
Expected: FAIL — „Failed to resolve import "./game"”.

- [ ] **Step 3: Zaimplementuj**

```ts
// src/glossary/plural.ts
/** Forma rzeczownika po liczebniku: 1 → M, 2–4 (bez 12–14) → Mlm, reszta → Dlm. */
export function countCase(n: number): 'M' | 'Mlm' | 'Dlm' {
  if (n === 1) return 'M';
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'Mlm';
  return 'Dlm';
}

/** Dla zwykłych słów spoza słownika, np. pluralPl(5, ['karta', 'karty', 'kart']). */
export function pluralPl(n: number, [one, few, many]: [string, string, string]): string {
  const c = countCase(n);
  return c === 'M' ? one : c === 'Mlm' ? few : many;
}
```

```ts
// src/glossary/game.ts
import type { GameType } from '../engine';
import { resolveText } from './text';
import type { TextContext } from './types';

export function gameLabel(game: GameType, ctx: TextContext): string {
  switch (game.kind) {
    case 'suit':
      return resolveText(`[[GraKolorowa]] · [[atu]]: [[suit:${game.trump}]]`, ctx);
    case 'grand':
      return resolveText('[[Grand]] · [[atu]]: tylko [[walet:Mlm]]', ctx);
    case 'null':
      return resolveText('[[Null]] · bez [[atu:D]]', ctx);
  }
}
```

Dopisz do `src/glossary/index.ts`:

```ts
export * from './game';
export * from './plural';
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/glossary && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/glossary
git commit -m "feat(glossary): etykieta rodzaju gry i liczebniki" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Treść — typy, logika mini-rozdania, walidacja

**Files:**
- Modify: `src/content/types.ts` (całość), `src/content/validate.ts` (całość), `src/content/course.test.ts` (całość), `src/content/lessons/m1-l03-oczka.ts`, `src/content/lessons/m2-l05-dokladanie.ts`
- Create: `src/content/miniDeal.ts`
- Test: `src/content/miniDeal.test.ts`, `src/content/validate.test.ts` (dopisane testy)

- [ ] **Step 1: Zastąp `src/content/types.ts`**

```ts
// src/content/types.ts
import type { CardId, GameType, Hands, Seat } from '../engine';

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

/**
 * Sprawdzenie poprawnej odpowiedzi silnikiem (w teście treści):
 * - `points`: tekst poprawnej odpowiedzi = suma oczek kart z `cards`;
 * - `trickWinner`: odpowiedzi to 3 karty w kolejności zagrania, poprawna bierze lewę w grze `game`.
 */
export type QuizVerify = { kind: 'points' } | { kind: 'trickWinner'; game: GameType };

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

export type ExerciseData = QuizExerciseData | PlayCardExerciseData | MiniDealExerciseData;

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

- [ ] **Step 2: Napisz test logiki mini-rozdania**

```ts
// src/content/miniDeal.test.ts
import { describe, expect, it } from 'vitest';
import { playCard } from '../engine';
import { isGoalReached, simulateMiniDeal, startMiniDeal, teamPoints } from './miniDeal';
import type { MiniDealExerciseData } from './types';

const exercise: MiniDealExerciseData = {
  type: 'miniDeal',
  id: 't-m1',
  prompt: 'P',
  game: { kind: 'suit', trump: 'h' },
  declarer: 0,
  you: 0,
  hands: [['c-J', 'c-A'], ['c-7', 's-7'], ['c-8', 's-8']],
  skat: [],
  solution: ['c-J', 'c-A'],
  goal: { kind: 'minPoints', points: 13 },
  explain: 'E',
};

describe('mini-rozdanie', () => {
  it('wzorcowe rozegranie osiąga cel', () => {
    expect(simulateMiniDeal(exercise)).toEqual({ error: null, goalReached: true });
  });

  it('zbyt wysoki cel nie jest osiągnięty', () => {
    expect(simulateMiniDeal({ ...exercise, goal: { kind: 'minPoints', points: 14 } }).goalReached).toBe(false);
  });

  it('błędne rozwiązanie jest zgłaszane', () => {
    expect(simulateMiniDeal({ ...exercise, solution: ['c-A', 'h-7'] }).error).toMatch(/niedozwolone|brak/i);
    expect(simulateMiniDeal({ ...exercise, solution: ['c-J'] }).error).toMatch(/za mało/);
  });

  it('punkty liczone z perspektywy gracza', () => {
    let state = startMiniDeal(exercise);
    for (const card of ['c-J', 'c-7', 'c-8'] as const) state = playCard(state, card);
    expect(teamPoints(exercise, state)).toEqual({ yours: 2, theirs: 0 });
    expect(teamPoints({ ...exercise, you: 1 }, state)).toEqual({ yours: 0, theirs: 2 });
    expect(isGoalReached({ ...exercise, goal: { kind: 'minPoints', points: 2 } }, state)).toBe(true);
  });
});
```

- [ ] **Step 3: Zaimplementuj `src/content/miniDeal.ts`**

```ts
// src/content/miniDeal.ts
import { createBot, type Bot } from '../bots';
import {
  createDeal,
  currentPlayer,
  dealResult,
  isDealOver,
  playCard,
  type CardId,
  type DealState,
  type Seat,
} from '../engine';
import type { MiniDealExerciseData } from './types';

export function startMiniDeal(ex: MiniDealExerciseData): DealState {
  return createDeal({ game: ex.game, declarer: ex.declarer, hands: ex.hands, skat: ex.skat, leader: ex.leader ?? 0 });
}

export function miniDealBots(ex: MiniDealExerciseData): Record<Seat, Bot> {
  return { 0: createBot(ex.scripts?.[0]), 1: createBot(ex.scripts?.[1]), 2: createBot(ex.scripts?.[2]) };
}

/** Oczka strony gracza i strony przeciwnej (w trakcie i po rozdaniu). */
export function teamPoints(ex: MiniDealExerciseData, state: DealState): { yours: number; theirs: number } {
  const { declarerPoints, defenderPoints } = dealResult(state);
  return ex.you === ex.declarer
    ? { yours: declarerPoints, theirs: defenderPoints }
    : { yours: defenderPoints, theirs: declarerPoints };
}

export function isGoalReached(ex: MiniDealExerciseData, state: DealState): boolean {
  if (ex.goal.kind === 'minPoints') return teamPoints(ex, state).yours >= ex.goal.points;
  const { declarerWon } = dealResult(state);
  return ex.you === ex.declarer ? declarerWon : !declarerWon;
}

/** Rozgrywa rozdanie: gracz gra `solution`, reszta — boty ćwiczenia. */
export function simulateMiniDeal(ex: MiniDealExerciseData): { error: string | null; goalReached: boolean } {
  const bots = miniDealBots(ex);
  let state = startMiniDeal(ex);
  let next = 0;
  while (!isDealOver(state)) {
    const seat = currentPlayer(state);
    let card: CardId | undefined;
    if (seat === ex.you) {
      card = ex.solution[next++];
      if (card === undefined) return { error: 'za mało kart w rozwiązaniu', goalReached: false };
    } else {
      card = bots[seat](state, seat);
    }
    try {
      state = playCard(state, card);
    } catch {
      return { error: `niedozwolone zagranie ${card} (gracz ${seat})`, goalReached: false };
    }
  }
  return { error: null, goalReached: isGoalReached(ex, state) };
}
```

- [ ] **Step 4: Dopisz testy walidatora**

W `src/content/validate.test.ts` rozszerz import typów do `import type { Course, ExerciseData, Lesson, MiniDealExerciseData } from './types';` i dopisz (wewnątrz `describe('validateCourse', ...)`):

```ts
  it('verify: suma oczek musi zgadzać się z kartami', () => {
    const points = quiz({
      cards: ['h-A', 's-10'],
      options: [{ id: 'a', text: '20' }, { id: 'b', text: '21' }],
      correct: 'a',
      verify: { kind: 'points' },
    });
    expect(validateCourse(courseWith(lessonWith([points])))).toEqual(['l1/q1: poprawna odpowiedź powinna wynosić 21']);
  });

  it('verify: zwycięzca lewy liczony silnikiem', () => {
    const winner = quiz({
      options: [{ id: 'a', card: 's-K' }, { id: 'b', card: 's-10' }, { id: 'c', card: 's-9' }],
      correct: 'a',
      verify: { kind: 'trickWinner', game: { kind: 'suit', trump: 'd' } },
    });
    expect(validateCourse(courseWith(lessonWith([winner])))).toEqual(['l1/q1: lewę bierze s-10, a nie s-K']);
  });

  it('mini-rozdanie: wzorcowe rozegranie musi osiągać cel', () => {
    const deal: MiniDealExerciseData = {
      type: 'miniDeal', id: 'd1', prompt: 'P', explain: 'E', game: { kind: 'suit', trump: 'h' },
      declarer: 0, you: 0, hands: [['c-J', 'c-A'], ['c-7', 's-7'], ['c-8', 's-8']], skat: [],
      solution: ['c-J', 'c-A'], goal: { kind: 'minPoints', points: 13 },
    };
    expect(validateCourse(courseWith(lessonWith([deal])))).toEqual([]);
    expect(validateCourse(courseWith(lessonWith([{ ...deal, goal: { kind: 'minPoints', points: 50 } }])))).toEqual([
      'l1/d1: wzorcowe rozegranie nie osiąga celu',
    ]);
    expect(validateCourse(courseWith(lessonWith([{ ...deal, goal: { kind: 'win' } }])))).toContain(
      'l1/d1: cel „win” wymaga pełnego rozdania (10 kart)',
    );
    expect(validateCourse(courseWith(lessonWith([{ ...deal, hands: [['c-J', 'c-A'], ['c-7', 'c-J'], ['c-8', 's-8']] }])))).toContain(
      'l1/d1: karta c-J występuje więcej niż raz',
    );
  });
```

- [ ] **Step 5: Zastąp `src/content/validate.ts`**

```ts
// src/content/validate.ts
import { isLegalMove, sumPoints, trickWinner, type CardId } from '../engine';
import { findTextIssues } from '../glossary';
import { simulateMiniDeal } from './miniDeal';
import type { Course, ExerciseData, MiniDealExerciseData, PlayCardExerciseData, QuizExerciseData } from './types';

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
  verifyQuiz(quiz, report);
}

function verifyQuiz(quiz: QuizExerciseData, report: Report) {
  const correct = quiz.options.find((option) => option.id === quiz.correct);
  if (!quiz.verify || !correct) return;
  if (quiz.verify.kind === 'points') {
    if (!quiz.cards) return report('verify points wymaga kart w pytaniu');
    const expected = String(sumPoints(quiz.cards));
    if (correct.text !== expected) report(`poprawna odpowiedź powinna wynosić ${expected}`);
    return;
  }
  const cards = quiz.options.map((option) => option.card);
  if (cards.length !== 3 || cards.some((card) => card === undefined)) {
    return report('verify trickWinner wymaga dokładnie 3 odpowiedzi-kart');
  }
  const trick = cards as CardId[];
  checkUnique(trick, report);
  const winner = trick[trickWinner(trick, quiz.verify.game)];
  if (correct.card !== winner) report(`lewę bierze ${winner}, a nie ${correct.card}`);
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

function checkUnique(cards: readonly CardId[], report: Report) {
  const seen = new Set<CardId>();
  for (const card of cards) {
    if (seen.has(card)) report(`karta ${card} występuje więcej niż raz`);
    seen.add(card);
  }
}
```

- [ ] **Step 6: Zastąp ręczny test sum oczek polem `verify`**

W `src/content/lessons/m1-l03-oczka.ts` dodaj `verify: { kind: 'points' },` w ćwiczeniach `m1-l03-q1`, `m1-l03-q2` i `m1-l03-q4` (tych z `cards`).

W `src/content/lessons/m2-l05-dokladanie.ts` dodaj `showGame: false,` w każdym ćwiczeniu `playCard` (`m2-l05-p1` … `p4`), bo lekcja celowo nie pokazuje rodzaju gry.

Zastąp `src/content/course.test.ts`:

```ts
// src/content/course.test.ts
import { describe, expect, it } from 'vitest';
import { COURSE } from './course';
import { validateCourse } from './validate';

describe('treść kursu', () => {
  it('przechodzi walidację (w tym sprawdzenia silnikiem)', () => {
    expect(validateCourse(COURSE)).toEqual([]);
  });
});
```

- [ ] **Step 7: Uruchom testy**

Run: `npx vitest run src/content && npm test && npm run typecheck`
Expected: PASS. Uwaga: `ExerciseView.tsx` może zgłosić błąd TypeScript („not all code paths return a value” / brak przypadku `miniDeal`). Jeśli tak, dodaj tymczasowo `case 'miniDeal': return null;`. Task 7 zastąpi to komponentem.

- [ ] **Step 8: Commit**

```bash
git add src/content src/exercises
git commit -m "feat(content): quizy sprawdzane silnikiem i logika mini-rozdań" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Etykieta gry, rewers i przeciwnicy

**Files:**
- Create: `src/exercises/GameBanner.tsx`, `src/cards/CardBack.tsx`, `src/cards/OpponentView.tsx`
- Modify: `src/exercises/PlayCardExercise.tsx`, `src/cards/TrickView.tsx`
- Test: `src/exercises/PlayCardExercise.test.tsx` (dopisane), `src/cards/cards.test.tsx` (dopisane)

- [ ] **Step 1: Dopisz testy**

W `src/exercises/PlayCardExercise.test.tsx` (wewnątrz `describe`):

```tsx
  it('pokazuje rodzaj gry, chyba że showGame: false', () => {
    const { unmount } = renderWithProviders(<PlayCardExercise exercise={exercise} onAnswered={vi.fn()} />);
    expect(screen.getByText('Gra kolorowa · atu: żołądź')).toBeInTheDocument();
    unmount();
    renderWithProviders(<PlayCardExercise exercise={{ ...exercise, showGame: false }} onAnswered={vi.fn()} />);
    expect(screen.queryByText(/Gra kolorowa/)).not.toBeInTheDocument();
  });
```

W `src/cards/cards.test.tsx` (wewnątrz `describe`) oraz w importach `import { OpponentView } from './OpponentView';`:

```tsx
  it('przeciwnik: miejsce, rola i liczba kart', () => {
    renderWithProviders(<OpponentView seat={1} cardCount={7} isDeclarer active={false} />);
    expect(screen.getByRole('group', { name: 'Środek · rozgrywający: 7 kart' })).toBeInTheDocument();
  });

  it('przeciwnik: odmiana liczby kart', () => {
    renderWithProviders(<OpponentView seat={2} cardCount={3} isDeclarer={false} active />);
    expect(screen.getByRole('group', { name: 'Zadek: 3 karty' })).toHaveClass('opponent--active');
  });

  it('stół: własny tekst pustego stołu', () => {
    renderWithProviders(<TrickView cards={[]} leader={0} you={1} emptyText="Stół jest pusty." />);
    expect(screen.getByText('Stół jest pusty.')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Uruchom testy i sprawdź, że nie przechodzą**

Run: `npx vitest run src/exercises/PlayCardExercise.test.tsx src/cards`
Expected: FAIL (brak `OpponentView`, brak etykiety gry).

- [ ] **Step 3: Zaimplementuj `GameBanner` i podłącz go**

```tsx
// src/exercises/GameBanner.tsx
import type { GameType } from '../engine';
import { gameLabel } from '../glossary';
import { useTextContext } from '../state/AppStateContext';

export function GameBanner({ game }: { game: GameType }) {
  const ctx = useTextContext();
  return <p className="game-banner">{gameLabel(game, ctx)}</p>;
}
```

W `src/exercises/PlayCardExercise.tsx` dodaj import `import { GameBanner } from './GameBanner';` i zaraz po bloku `<div className="exercise__prompt">…</div>` wstaw:

```tsx
      {exercise.showGame !== false && <GameBanner game={exercise.game} />}
```

- [ ] **Step 4: Zaimplementuj rewers i widok przeciwnika**

```tsx
// src/cards/CardBack.tsx
/** Rewers karty (dekoracyjny). */
export function CardBack() {
  return (
    <svg viewBox="0 0 60 90" className="card__svg" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="58" height="88" rx="6" className="card__back" />
      <rect x="6" y="6" width="48" height="78" rx="4" className="card__back-inner" />
    </svg>
  );
}
```

```tsx
// src/cards/OpponentView.tsx
import type { Seat } from '../engine';
import { pluralPl } from '../glossary';
import { useText } from '../state/AppStateContext';
import { CardBack } from './CardBack';
import { SEAT_LABEL } from './TrickView';

interface Props {
  seat: Seat;
  cardCount: number;
  isDeclarer: boolean;
  /** Ten gracz jest teraz na ruchu. */
  active: boolean;
}

export function OpponentView({ seat, cardCount, isDeclarer, active }: Props) {
  const t = useText();
  const name = t(SEAT_LABEL[seat]) + (isDeclarer ? t(' · [[rozgrywajacy]]') : '');
  const count = `${cardCount} ${pluralPl(cardCount, ['karta', 'karty', 'kart'])}`;
  return (
    <div className={`opponent${active ? ' opponent--active' : ''}`} role="group" aria-label={`${name}: ${count}`}>
      <span className="opponent__name" aria-hidden="true">
        {name}
      </span>
      <span className="opponent__stack" aria-hidden="true">
        <span className="card">
          <CardBack />
        </span>
        <span className="opponent__count">{cardCount}</span>
      </span>
    </div>
  );
}
```

W `src/cards/TrickView.tsx` dodaj do `Props` pole `emptyText?: string;`, zmień sygnaturę na `export function TrickView({ cards, leader, you, emptyText = 'Stół jest pusty — wychodzisz pierwszy.' }: Props)` i w akapicie pustego stołu wstaw `{emptyText}` w miejsce stałego tekstu.

- [ ] **Step 5: Uruchom testy**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/cards src/exercises
git commit -m "feat(ui): etykieta gry, rewers karty i widok przeciwnika" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Ćwiczenie „mini-rozdanie”

**Files:**
- Create: `src/exercises/MiniDealExercise.tsx`
- Modify: `src/exercises/ExerciseView.tsx` (całość)
- Test: `src/exercises/MiniDealExercise.test.tsx`

- [ ] **Step 1: Napisz test**

```tsx
// src/exercises/MiniDealExercise.test.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { MiniDealExerciseData } from '../content/types';
import { renderWithProviders } from '../test/render';
import { MiniDealExercise } from './MiniDealExercise';

const declarerDeal: MiniDealExerciseData = {
  type: 'miniDeal',
  id: 't-m1',
  prompt: 'Zagraj.',
  game: { kind: 'suit', trump: 'h' },
  declarer: 0,
  you: 0,
  hands: [['c-J', 'c-A'], ['c-7', 's-7'], ['c-8', 's-8']],
  skat: [],
  solution: ['c-J', 'c-A'],
  goal: { kind: 'minPoints', points: 13 },
  explain: 'Wyjaśnienie.',
};

async function playTwice(user: ReturnType<typeof userEvent.setup>, name: string) {
  const card = screen.getByRole('button', { name });
  await waitFor(() => expect(card).toBeEnabled());
  await user.click(card);
  await user.click(card);
}

describe('MiniDealExercise', () => {
  it('rozgrywa rozdanie z botami i ocenia cel', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<MiniDealExercise exercise={declarerDeal} onAnswered={onAnswered} delayMs={0} />);
    expect(screen.getByText('Gra kolorowa · atu: czerwień')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Środek: 2 karty' })).toBeInTheDocument();

    await playTwice(user, 'niżnik żołędny');
    await playTwice(user, 'as żołędny');

    expect(await screen.findByText('Dobrze!')).toBeInTheDocument();
    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Wyjaśnienie.')).toBeInTheDocument();
  });

  it('nieosiągnięty cel to zła odpowiedź', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(
      <MiniDealExercise exercise={{ ...declarerDeal, goal: { kind: 'minPoints', points: 14 } }} onAnswered={onAnswered} delayMs={0} />,
    );
    await playTwice(user, 'niżnik żołędny');
    await playTwice(user, 'as żołędny');
    expect(await screen.findByText('Niestety nie.')).toBeInTheDocument();
    expect(onAnswered).toHaveBeenCalledWith(false);
  });

  it('bot wychodzi, a niedozwolona karta daje podpowiedź', async () => {
    const user = userEvent.setup();
    const defending: MiniDealExerciseData = {
      ...declarerDeal,
      you: 1,
      hands: [['c-A', 's-A'], ['c-7', 'h-7'], ['c-8', 's-8']],
      solution: ['c-7', 'h-7'],
      goal: { kind: 'minPoints', points: 0 },
    };
    renderWithProviders(<MiniDealExercise exercise={defending} onAnswered={vi.fn()} delayMs={0} />);
    expect(await screen.findByRole('img', { name: 'as żołędny' })).toBeInTheDocument();
    const trump = screen.getByRole('button', { name: 'siódemka czerwienna' });
    await waitFor(() => expect(trump).toBeEnabled());
    await user.click(trump);
    expect(screen.getByText(/nie możesz teraz zagrać/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Uruchom test i sprawdź, że nie przechodzi**

Run: `npx vitest run src/exercises/MiniDealExercise.test.tsx`
Expected: FAIL — „Failed to resolve import "./MiniDealExercise"”.

- [ ] **Step 3: Zaimplementuj komponent**

```tsx
// src/exercises/MiniDealExercise.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Hand } from '../cards/Hand';
import { OpponentView } from '../cards/OpponentView';
import { SEAT_LABEL, TrickView } from '../cards/TrickView';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import { isGoalReached, miniDealBots, startMiniDeal, teamPoints } from '../content/miniDeal';
import type { MiniDealExerciseData } from '../content/types';
import { currentPlayer, isDealOver, legalMoves, nextSeat, playCard, sortHand, type CardId } from '../engine';
import { countCase } from '../glossary';
import { useText } from '../state/AppStateContext';
import { GameBanner } from './GameBanner';

const ILLEGAL_HINT = 'Tej karty nie możesz teraz zagrać — musisz dołożyć do wyjścia.';

interface Props {
  exercise: MiniDealExerciseData;
  onAnswered: (correct: boolean) => void;
  /** Opóźnienie ruchu bota w ms (zakończona lewa jest widoczna 1,5× dłużej). W testach 0. */
  delayMs?: number;
}

export function MiniDealExercise({ exercise, onAnswered, delayMs = 700 }: Props) {
  const t = useText();
  const { you, declarer } = exercise;
  const [deal, setDeal] = useState(() => startMiniDeal(exercise));
  const [showLast, setShowLast] = useState(false);
  const [selected, setSelected] = useState<CardId | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const bots = useMemo(() => miniDealBots(exercise), [exercise]);
  const reported = useRef(false);

  const over = isDealOver(deal);
  const current = currentPlayer(deal);
  const yourTurn = !over && !showLast && current === you;
  const legal = yourTurn ? legalMoves(deal.hands[you], deal.trick, deal.game) : [];
  const tricksDone = deal.tricks.length;
  const last = deal.tricks[tricksDone - 1];

  // Po zakończonej lewie pokazujemy ją przez chwilę.
  useEffect(() => {
    if (tricksDone === 0) return;
    setShowLast(true);
    const id = setTimeout(() => setShowLast(false), delayMs * 1.5);
    return () => clearTimeout(id);
  }, [tricksDone, delayMs]);

  // Ruch bota.
  useEffect(() => {
    if (over || showLast || current === you) return;
    const id = setTimeout(() => setDeal((d) => playCard(d, bots[current](d, current))), delayMs);
    return () => clearTimeout(id);
  }, [deal, over, showLast, current, you, bots, delayMs]);

  const reached = over && isGoalReached(exercise, deal);
  useEffect(() => {
    if (!over || showLast || reported.current) return;
    reported.current = true;
    onAnswered(reached);
  }, [over, showLast, reached, onAnswered]);

  const handleClick = (card: CardId) => {
    if (!yourTurn) return;
    if (!legal.includes(card)) {
      setHint(ILLEGAL_HINT);
      setSelected(null);
      return;
    }
    setHint(null);
    if (selected !== card) {
      setSelected(card);
      return;
    }
    setSelected(null);
    setDeal((d) => playCard(d, card));
  };

  const shown =
    deal.trick.length === 0 && showLast && last
      ? { cards: last.cards, leader: last.leader }
      : { cards: deal.trick, leader: deal.leader };

  let status: string;
  if (showLast && last) {
    status = last.winner === you ? t('Bierzesz {lewę|sztycha}.') : t(`{Lewę|Sztycha} bierze: ${SEAT_LABEL[last.winner]}.`);
  } else if (over) {
    status = 'Rozdanie zakończone.';
  } else if (yourTurn) {
    status = deal.trick.length === 0 ? 'Twój ruch — wychodzisz.' : 'Twój ruch.';
  } else {
    status = `Ruch: ${t(SEAT_LABEL[current])}…`;
  }

  const points = teamPoints(exercise, deal);
  const pointsText = (n: number) => `${n} ${t(`[[oczko:${countCase(n)}]]`)}`;

  return (
    <section className="exercise mini-deal">
      <div className="exercise__prompt">
        <RichText text={exercise.prompt} />
      </div>
      <GameBanner game={exercise.game} />
      <div className="mini-deal__opponents">
        {[nextSeat(you, 1), nextSeat(you, 2)].map((seat) => (
          <OpponentView
            key={seat}
            seat={seat}
            cardCount={deal.hands[seat].length}
            isDeclarer={seat === declarer}
            active={!over && current === seat}
          />
        ))}
      </div>
      <TrickView cards={shown.cards} leader={shown.leader} you={you} emptyText="Stół jest pusty." />
      <p className="mini-deal__status" aria-live="polite">
        {status}
      </p>
      <p className="mini-deal__score">
        Twoja strona: {pointsText(points.yours)} · druga strona: {pointsText(points.theirs)}
      </p>
      {hint && <p className="hint hint--warn">{hint}</p>}
      <Hand
        cards={sortHand(deal.hands[you], deal.game)}
        selected={selected}
        isDimmed={yourTurn ? (card) => !legal.includes(card) : undefined}
        onCardClick={handleClick}
        disabled={!yourTurn}
      />
      <p className="mini-deal__seat">
        Twoje miejsce: {t(SEAT_LABEL[you])}
        {you === declarer ? t(' · [[rozgrywajacy]]') : ''}
      </p>
      <div className="feedback-region" role="status">
        {over && !showLast && (
          <Feedback correct={reached}>
            <p>
              Wynik: twoja strona {pointsText(points.yours)}, druga strona {pointsText(points.theirs)}.
            </p>
            <RichText text={exercise.explain} />
          </Feedback>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Podłącz w `ExerciseView` — zastąp `src/exercises/ExerciseView.tsx`**

```tsx
// src/exercises/ExerciseView.tsx
import type { ExerciseData } from '../content/types';
import { MiniDealExercise } from './MiniDealExercise';
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
    case 'miniDeal':
      return <MiniDealExercise exercise={exercise} onAnswered={onAnswered} />;
  }
}
```

- [ ] **Step 5: Uruchom testy**

Run: `npx vitest run src/exercises && npm test && npm run typecheck`
Expected: PASS. Sprawdź też, że w wyjściu testów nie ma ostrzeżeń `act(...)`. Jeśli są, owiń oczekiwania w `waitFor`/`findBy*`, nie wyciszaj ostrzeżeń.

- [ ] **Step 6: Commit**

```bash
git add src/exercises
git commit -m "feat(exercises): mini-rozdanie z botami" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Style — szerokość kart, przeciwnicy, baner gry

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Zmień szerokość kart w ręce i w rzędach**

Zastąp linię `.card-row { … }` oraz `.hand { … }` (obecnie z `--card-w: 52px`):

```css
.card-row { --card-w: clamp(36px, calc((100vw - 32px - 56px) / 8), 56px); list-style: none; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 0; margin: 12px 0; }
.hand { --card-w: clamp(40px, calc((100vw - 32px + 180px) / 10), 52px); list-style: none; display: flex; justify-content: center; padding: 16px 0 0; margin: 0; }
```

(10 kart przy zakładce −20 px: 10·w − 180 px mieści się w szerokości ekranu minus 32 px marginesów. Reguła `@media (min-width: 600px)` z 64 px zostaje bez zmian.)

- [ ] **Step 2: Dopisz style nowych elementów (przed blokiem `@media (min-width: 600px)`)**

```css
/* Baner gry i mini-rozdanie */
.game-banner {
  display: inline-block; margin: 0 0 12px; padding: 4px 12px; border-radius: 999px;
  background: var(--surface); border: 1px solid var(--border); font-size: 0.9rem; font-weight: 600;
}
.mini-deal__opponents { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.opponent {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 6px 10px; border-radius: var(--radius); border: 2px solid transparent;
}
.opponent--active { border-color: var(--accent); }
.opponent__name { font-size: 0.85rem; color: var(--muted); }
.opponent__stack { --card-w: 28px; display: flex; align-items: center; gap: 6px; }
.opponent__count { font-weight: 700; }
.card__back { fill: #2f5d8a; stroke: #bdb6a6; stroke-width: 1; }
.card__back-inner { fill: none; stroke: rgb(255 255 255 / 0.55); stroke-width: 2; }
.mini-deal__status { text-align: center; color: var(--muted); margin: 8px 0 0; min-height: 1.5em; }
.mini-deal__score { text-align: center; font-weight: 600; margin: 4px 0 0; }
.mini-deal__seat { text-align: center; color: var(--muted); font-size: 0.85rem; margin: 8px 0 0; }
.hint--warn { color: var(--bad-text); }
```

- [ ] **Step 3: Zbuduj**

Run: `npm test && npm run build`
Expected: PASS, build bez błędów.

- [ ] **Step 4: Commit**

```bash
git add src/styles.css
git commit -m "feat(ui): style mini-rozdania i adaptacyjna szerokość kart" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Lekcje 6–8

**Files:**
- Create: `src/content/lessons/m2-l06-kolejnosc.ts`, `src/content/lessons/m2-l07-atu.ts`, `src/content/lessons/m2-l08-walety.ts`
- Modify: `src/content/course.ts`

Test treści (`src/content/course.test.ts`) sprawdzi tokeny, dozwolone zagrania i zwycięzców lew silnikiem. Zgłoszony problem napraw w treści (albo dopisz brakującą formę w `terms.ts`) i opisz to w raporcie.

- [ ] **Step 1: Lekcja 6**

```ts
// src/content/lessons/m2-l06-kolejnosc.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

// Gra kolorowa z atu w kolorze, którego nie ma w zadaniach, i bez waletów —
// lekcja uczy wyłącznie kolejności kart w kolorze; rodzaj gry nie jest pokazywany.
const PLAIN: GameType = { kind: 'suit', trump: 'd' };
const PROMPT = 'Zagrano kolejno trzy karty. Która bierze {lewę|sztycha}?';
const VERIFY = { kind: 'trickWinner', game: PLAIN } as const;

export const lesson: Lesson = {
  id: 'm2-l06-kolejnosc',
  title: 'Kolejność kart w kolorze',
  summary: 'Która karta bierze [[lewa:B]]? Dziesiątka zaskakuje.',
  steps: [
    {
      title: 'Kto bierze [[lewa:B]]?',
      text:
        'Gdy wszyscy dokładają do koloru wyjścia, {lewę|sztycha} bierze **najwyższa karta w tym kolorze**.\n\n' +
        'Karta w innym kolorze nie bierze {lewy|sztycha} — nawet [[as]]. (Wyjątkiem są [[atu:Mlm]], które poznasz w następnej lekcji.)',
    },
    {
      title: 'Kolejność od najsilniejszej',
      text:
        '**[[As]] · 10 · [[krol]] · [[dama]] · 9 · 8 · 7**\n\n' +
        'Uwaga: **dziesiątka jest silniejsza od [[krol:D]]** — tak jak jest od niego cenniejsza w [[oczko:Mslm]]. [[Walet:Dlm]] nie ma w tej kolejności — o nich w lekcji 8.',
      cards: ['h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'h-8', 'h-7'],
      cardsCaption: 'Kolejność w kolorze — od najsilniejszej.',
    },
    {
      title: 'Siła a wartość',
      text:
        'Siła karty (czy bierze {lewę|sztycha}) i jej wartość w [[oczko:Mslm]] to dwie różne rzeczy. ' +
        'Dziewiątka jest silniejsza od ósemki, choć obie są warte 0 [[oczko:Dlm]].',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l06-q1',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 's-K' },
        { id: 'b', card: 's-10' },
        { id: 'c', card: 's-9' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'Dziesiątka jest silniejsza od [[krol:D]].',
    },
    {
      type: 'quiz',
      id: 'm2-l06-q2',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'c-Q' },
        { id: 'b', card: 'c-A' },
        { id: 'c', card: 'c-10' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'Najsilniejszą kartą w kolorze jest [[as]].',
    },
    {
      type: 'quiz',
      id: 'm2-l06-q3',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-9' },
        { id: 'b', card: 's-A' },
        { id: 'c', card: 'h-8' },
      ],
      correct: 'a',
      verify: VERIFY,
      explain:
        'Wyjście było w kolorze [[suit:h]]. [[Card:s-A]] jest w innym kolorze, więc nie bierze {lewy|sztycha} — wygrywa [[card:h-9]], najwyższa karta w kolorze wyjścia.',
    },
    {
      type: 'quiz',
      id: 'm2-l06-q4',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 's-7' },
        { id: 'b', card: 's-Q' },
        { id: 'c', card: 's-K' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Krol]] jest silniejszy od [[dama:D]].',
    },
    {
      type: 'quiz',
      id: 'm2-l06-q5',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-K' },
        { id: 'b', card: 'c-10' },
        { id: 'c', card: 'h-Q' },
      ],
      correct: 'a',
      verify: VERIFY,
      explain: 'W kolorze wyjścia ([[suit:h]]) najwyżej stoi [[krol]]. Dziesiątka jest w innym kolorze.',
    },
    {
      type: 'playCard',
      id: 'm2-l06-p1',
      prompt: 'Na stole leżą [[card:c-K]] i [[card:c-9]]. Zagraj kartę, która weźmie {lewę|sztycha}.',
      game: PLAIN,
      showGame: false,
      leader: 1,
      trick: ['c-K', 'c-9'],
      hand: ['c-10', 'c-7', 'h-A'],
      mode: 'best',
      best: ['c-10'],
      wrongExplain: { 'c-7': 'Siódemka nie przebije [[krol:D]].' },
      explain: '[[Card:c-10]] jest silniejsza od [[krol:D]] i bierze {lewę|sztycha}.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 7**

```ts
// src/content/lessons/m2-l07-atu.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const PROMPT = '[[GraKolorowa]], [[atu]]: [[suit:h]]. Która karta bierze {lewę|sztycha}?';
const VERIFY = { kind: 'trickWinner', game: HEARTS } as const;

export const lesson: Lesson = {
  id: 'm2-l07-atu',
  title: '[[Atu]] w [[graKolorowa:Ms]]',
  summary: 'Karta [[atu:D]] bije nawet [[as:B]].',
  steps: [
    {
      title: 'Czym jest [[atu]]?',
      text:
        'W **[[graKolorowa:Ms]]** [[rozgrywajacy]] wybiera jeden kolor na **[[atu]]**. ' +
        'Karta w kolorze [[atu:D]] bije każdą kartę zwykłego koloru — nawet [[as:B]]!',
    },
    {
      title: 'Także [[walet:Mlm]] są [[atu:Nlm]]',
      text:
        'Do [[atu:D]] należą również **wszystkie cztery [[walet:Mlm]]** — i to one są najsilniejsze, w kolejności: [[card:c-J]], [[card:s-J]], [[card:h-J]], [[card:d-J]].\n\n' +
        'Razem [[atu:Mlm]] to 11 kart: 4 [[walet:Mlm]] i 7 kart koloru [[atu:D]].',
      cards: ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'h-8', 'h-7'],
      cardsCaption: '[[Atu:Mlm]], gdy kolorem [[atu:D]] jest [[suit:h]] — od najsilniejszego.',
    },
    {
      title: 'Kto bierze [[lewa:B]]?',
      text:
        'Jeśli {w lewie|w sztychu} jest choć jedna karta [[atu:D]], wygrywa **{najwyższe atu|najwyższy trumf}**. ' +
        'Jeśli nie ma żadnej — najwyższa karta w kolorze wyjścia, jak w poprzedniej lekcji.\n\n' +
        '[[Atu]] wolno zagrać tylko wtedy, gdy nie masz koloru wyjścia (albo gdy wyjście jest w [[atu:Ms]]).',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l07-q1',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 's-A' },
        { id: 'b', card: 's-10' },
        { id: 'c', card: 'h-7' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Card:h-7]] to [[atu]], więc bije nawet [[as:B]].',
    },
    {
      type: 'quiz',
      id: 'm2-l07-q2',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-A' },
        { id: 'b', card: 'd-J' },
        { id: 'c', card: 'h-10' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain:
        '[[Card:d-J]] to najsłabszy z [[walet:Dlm]], ale i tak bije wszystkie pozostałe karty koloru [[atu:D]] — także [[as:B]].',
    },
    {
      type: 'quiz',
      id: 'm2-l07-q3',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 's-J' },
        { id: 'b', card: 'c-J' },
        { id: 'c', card: 'h-J' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'Kolejność [[walet:Dlm]]: [[suit:c]], [[suit:s]], [[suit:h]], [[suit:d]].',
    },
    {
      type: 'quiz',
      id: 'm2-l07-q4',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'c-A' },
        { id: 'b', card: 'c-K' },
        { id: 'c', card: 'd-A' },
      ],
      correct: 'a',
      verify: VERIFY,
      explain: 'Nikt nie zagrał [[atu:D]], więc wygrywa najwyższa karta w kolorze wyjścia ([[suit:c]]).',
    },
    {
      type: 'quiz',
      id: 'm2-l07-q5',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-9' },
        { id: 'b', card: 'h-A' },
        { id: 'c', card: 'c-J' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Walet:Mlm]] są silniejsze od wszystkich kart koloru [[atu:D]].',
    },
    {
      type: 'playCard',
      id: 'm2-l07-p1',
      prompt: 'Na stole leży [[card:s-A]]. Zagraj dozwoloną kartę.',
      game: HEARTS,
      leader: 0,
      trick: ['s-A'],
      hand: ['s-7', 'h-8', 'c-K'],
      mode: 'legal',
      explain:
        'Masz kartę w kolorze wyjścia — [[card:s-7:B]] — więc musisz ją dołożyć. [[Atu]] możesz zagrać dopiero wtedy, gdy koloru wyjścia nie masz.',
    },
    {
      type: 'playCard',
      id: 'm2-l07-p2',
      prompt: 'Na stole leży [[card:s-A]]. Weź {tę lewę|tego sztycha}.',
      game: HEARTS,
      leader: 0,
      trick: ['s-A'],
      hand: ['h-8', 'c-K', 'd-9'],
      mode: 'best',
      best: ['h-8'],
      wrongExplain: {
        'c-K': 'Bez [[atu:D]] nie przebijesz [[as:D]].',
        'd-9': 'Bez [[atu:D]] nie przebijesz [[as:D]].',
      },
      explain:
        'Nie masz koloru [[suit:s]], więc możesz przebić [[as:B]] kartą [[atu:D]] — [[card:h-8:N]].',
    },
  ],
};
```

- [ ] **Step 3: Lekcja 8**

```ts
// src/content/lessons/m2-l08-walety.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const PLAY = 'Zagraj dozwoloną kartę.';

export const lesson: Lesson = {
  id: 'm2-l08-walety',
  title: '[[Walet]] należy do [[atu:D]]',
  summary: 'Najczęstszy błąd początkujących — i jak go uniknąć.',
  steps: [
    {
      title: 'Najczęstszy błąd',
      text:
        'W [[graKolorowa:Ms]] (i w [[grand:Ms]]) **[[walet]] nie należy do swojego koloru**. ' +
        '[[Card:c-J]] nie jest kartą koloru [[suit:c]] — jest [[atu:N]].',
    },
    {
      title: 'Wyjście w zwykłym kolorze',
      text:
        'Gdy wyjście jest w kolorze [[suit:c]], a jedyną twoją kartą „w tym kolorze” jest [[card:c-J]] — to tak naprawdę **nie masz koloru wyjścia**. Możesz zagrać dowolną kartę.\n\n' +
        'I odwrotnie: gdy masz [[card:c-J:B]] i [[card:c-7:B]], musisz dołożyć siódemkę — [[walet]] tego nie załatwi.',
    },
    {
      title: 'Wyjście w [[atu:Ms]]',
      text:
        'Gdy wychodzi [[atu]] — również [[walet]] — musisz dołożyć [[atu:B]], {jeśli je masz|jeśli go masz}. [[Walet]] w twojej ręce też się liczy jako [[atu]].\n\n' +
        'Wyjątek: w [[null:Ms]] nie ma [[atu:D]], a [[walet]] jest zwykłą kartą swojego koloru (lekcja 10).',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm2-l08-p1',
      prompt: `Na stole leży [[card:c-A]]. ${PLAY}`,
      game: HEARTS,
      leader: 0,
      trick: ['c-A'],
      hand: ['c-J', 'c-7', 's-K'],
      mode: 'legal',
      explain:
        'Musisz dołożyć [[card:c-7:B]] — to twoja jedyna karta w kolorze [[suit:c]]. [[Card:c-J]] jest [[atu:N]], nie kartą koloru [[suit:c]].',
    },
    {
      type: 'playCard',
      id: 'm2-l08-p2',
      prompt: `Na stole leży [[card:h-9]]. ${PLAY}`,
      game: HEARTS,
      leader: 0,
      trick: ['h-9'],
      hand: ['s-J', 's-A', 'd-K'],
      mode: 'legal',
      explain:
        'Wyszła [[card:h-9]], czyli [[atu]]. Jedynym [[atu:N]] w twojej ręce jest [[card:s-J]] — musisz go dołożyć.',
    },
    {
      type: 'playCard',
      id: 'm2-l08-p3',
      prompt: `Na stole leży [[card:s-10]]. ${PLAY}`,
      game: HEARTS,
      leader: 0,
      trick: ['s-10'],
      hand: ['s-J', 's-8', 'h-7'],
      mode: 'legal',
      explain: 'Musisz dołożyć [[card:s-8:B]]. [[Card:s-J]] nie należy do koloru [[suit:s]] — jest [[atu:N]].',
    },
    {
      type: 'playCard',
      id: 'm2-l08-p4',
      prompt: `Na stole leży [[card:c-J]]. ${PLAY}`,
      game: HEARTS,
      leader: 0,
      trick: ['c-J'],
      hand: ['h-7', 'c-A', 'c-10'],
      mode: 'legal',
      explain:
        'Wyszedł [[walet]], czyli [[atu]]. Masz [[card:h-7:B]], która jest [[atu:N]], więc musisz ją dołożyć — choć [[suit:c]] też masz.',
    },
    {
      type: 'quiz',
      id: 'm2-l08-q1',
      prompt: 'Ile kart jest [[atu:N]] w [[graKolorowa:Ms]]?',
      options: [
        { id: 'a', text: '7' },
        { id: 'b', text: '8' },
        { id: 'c', text: '11' },
      ],
      correct: 'c',
      explain: '4 [[walet:Mlm]] i 7 kart koloru [[atu:D]] — razem 11.',
    },
  ],
};
```

- [ ] **Step 4: Dodaj lekcje 6–8 do kursu**

W `src/content/course.ts` dodaj importy:

```ts
import { lesson as l06 } from './lessons/m2-l06-kolejnosc';
import { lesson as l07 } from './lessons/m2-l07-atu';
import { lesson as l08 } from './lessons/m2-l08-walety';
```

i zmień moduł `m2` na `{ id: 'm2', title: 'Rozgrywka lew', lessons: [l05, l06, l07, l08] }`.

- [ ] **Step 5: Uruchom testy treści**

Run: `npx vitest run src/content && npm test && npm run typecheck`
Expected: PASS (`validateCourse(COURSE)` zwraca `[]`).

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat(content): lekcje 6–8 — kolejność kart, atu, walety" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Lekcje 9–11

**Files:**
- Create: `src/content/lessons/m2-l09-grand.ts`, `src/content/lessons/m2-l10-null.ts`, `src/content/lessons/m2-l11-pierwsze-rozdanie.ts`
- Modify: `src/content/course.ts`

- [ ] **Step 1: Lekcja 9**

```ts
// src/content/lessons/m2-l09-grand.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const GRAND: GameType = { kind: 'grand' };
const PROMPT = '[[Grand]]. Która karta bierze {lewę|sztycha}?';
const VERIFY = { kind: 'trickWinner', game: GRAND } as const;
const PLAY = 'Zagraj dozwoloną kartę.';

export const lesson: Lesson = {
  id: 'm2-l09-grand',
  title: '[[Grand]]',
  summary: 'Gra, w której [[atu:Mlm]] są tylko [[walet:Mlm]].',
  steps: [
    {
      title: 'Tylko [[walet:Mlm]]',
      text:
        'W **[[grand:Ms]]** jedynymi [[atu:Nlm]] są **cztery [[walet:Mlm]]**, w kolejności: [[card:c-J]], [[card:s-J]], [[card:h-J]], [[card:d-J]].\n\n' +
        'Wszystkie cztery kolory są zwykłe — w każdym zostaje 7 kart: [[as]], 10, [[krol]], [[dama]], 9, 8, 7.',
      cards: ['c-J', 's-J', 'h-J', 'd-J'],
      cardsCaption: '[[Atu:Mlm]] w [[grand:Ms]].',
    },
    {
      title: 'Dokładanie w [[grand:Ms]]',
      text:
        'Gdy wychodzi [[walet]], trzeba dołożyć [[walet:B]], jeśli się go ma. ' +
        'Gdy wychodzi zwykły kolor, [[walet]] go nie obsługuje — liczą się tylko pozostałe karty tego koloru.',
    },
    {
      title: 'Kiedy grać [[grand:B]]?',
      text:
        '[[Grand]] jest wart najwięcej spośród zwykłych gier (wyceny poznasz w module 3). ' +
        'Gra się go zwykle z kilkoma [[walet:Nlm]] i mocnymi kolorami — szczegóły w module 5.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l09-q1',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-A' },
        { id: 'b', card: 'h-10' },
        { id: 'c', card: 'd-J' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Card:d-J]] to [[atu]] — bije każdą kartę zwykłego koloru.',
    },
    {
      type: 'quiz',
      id: 'm2-l09-q2',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'c-10' },
        { id: 'b', card: 'c-A' },
        { id: 'c', card: 'h-J' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Walet]] bije [[as:B]] — w [[grand:Ms]] to on jest [[atu:N]].',
    },
    {
      type: 'quiz',
      id: 'm2-l09-q3',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-K' },
        { id: 'b', card: 'h-A' },
        { id: 'c', card: 's-A' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'Nikt nie zagrał [[walet:D]], więc wygrywa najwyższa karta w kolorze wyjścia.',
    },
    {
      type: 'playCard',
      id: 'm2-l09-p1',
      prompt: `Na stole leży [[card:c-J]]. ${PLAY}`,
      game: GRAND,
      leader: 0,
      trick: ['c-J'],
      hand: ['c-A', 'c-10', 's-J', 'h-7'],
      mode: 'legal',
      explain: 'Wyszedł [[walet]], a jedynym [[walet:N]] w twojej ręce jest [[card:s-J]] — musisz go dołożyć.',
    },
    {
      type: 'playCard',
      id: 'm2-l09-p2',
      prompt: `Na stole leży [[card:c-A]]. ${PLAY}`,
      game: GRAND,
      leader: 0,
      trick: ['c-A'],
      hand: ['c-J', 'c-7', 'h-K'],
      mode: 'legal',
      explain: 'Musisz dołożyć [[card:c-7:B]]. W [[grand:Ms]] [[card:c-J]] jest [[atu:N]], a nie kartą koloru [[suit:c]].',
    },
    {
      type: 'playCard',
      id: 'm2-l09-p3',
      prompt: `Na stole leży [[card:h-10]]. ${PLAY}`,
      game: GRAND,
      leader: 0,
      trick: ['h-10'],
      hand: ['h-K', 'd-J', 's-A'],
      mode: 'legal',
      explain: 'Masz [[card:h-K:B]], więc musisz dołożyć do koloru [[suit:h]]. [[Card:d-J]] do tego koloru nie należy.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 10**

```ts
// src/content/lessons/m2-l10-null.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const NULL_GAME: GameType = { kind: 'null' };
const PROMPT = '[[Null]]. Która karta bierze {lewę|sztycha}?';
const VERIFY = { kind: 'trickWinner', game: NULL_GAME } as const;

export const lesson: Lesson = {
  id: 'm2-l10-null',
  title: '[[Null]]',
  summary: 'Gra, w której nie wolno wziąć ani jednej [[lewa:D]].',
  steps: [
    {
      title: 'Gra bez [[lewa:Dlm]]',
      text:
        'W **[[null:Ms]]** [[rozgrywajacy]] {**nie może wziąć ani jednej lewy**. Jeśli weźmie choć jedną — przegrywa.|**nie może wziąć ani jednego sztycha**. Jeśli weźmie choć jednego — przegrywa.}\n\n' +
        '[[Oczko:Mlm]] nie mają tu żadnego znaczenia.',
    },
    {
      title: 'Bez [[atu:D]], inna kolejność',
      text:
        'W [[null:Ms]] nie ma [[atu:D]], a [[walet]] jest zwykłą kartą swojego koloru. Kolejność w każdym kolorze:\n\n' +
        '**[[As]] · [[krol]] · [[dama]] · [[walet]] · 10 · 9 · 8 · 7**\n\n' +
        'Dziesiątka stoi tu między [[walet:N]] a dziewiątką.',
      cards: ['h-A', 'h-K', 'h-Q', 'h-J', 'h-10', 'h-9', 'h-8', 'h-7'],
      cardsCaption: 'Kolejność w [[null:Ms]] — od najsilniejszej.',
    },
    {
      title: 'Dokładanie do koloru',
      text:
        'Dokładanie działa normalnie: jeśli masz kolor wyjścia, musisz go dołożyć. [[Card:c-J]] jest w [[null:Ms]] kartą koloru [[suit:c]].',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l10-q1',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-10' },
        { id: 'b', card: 'h-J' },
        { id: 'c', card: 'h-9' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'W [[null:Ms]] [[walet]] jest silniejszy od dziesiątki.',
    },
    {
      type: 'quiz',
      id: 'm2-l10-q2',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'c-J' },
        { id: 'b', card: 'c-A' },
        { id: 'c', card: 'h-A' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain:
        '[[Walet]] jest tu zwykłą kartą koloru [[suit:c]], a [[as]] jest od niego silniejszy. [[Card:h-A]] jest w innym kolorze.',
    },
    {
      type: 'playCard',
      id: 'm2-l10-p1',
      prompt: 'Na stole leży [[card:c-K]]. Zagraj dozwoloną kartę.',
      game: NULL_GAME,
      leader: 0,
      trick: ['c-K'],
      hand: ['c-J', 'h-J', 's-7'],
      mode: 'legal',
      explain: 'W [[null:Ms]] [[card:c-J]] należy do koloru [[suit:c]] — musisz go dołożyć.',
    },
    {
      type: 'playCard',
      id: 'm2-l10-p2',
      prompt:
        'Grasz jako [[rozgrywajacy]]. Na stole leżą [[card:s-9]] i [[card:s-Q]]. Zagraj tak, żeby nie wziąć {lewy|sztycha}.',
      game: NULL_GAME,
      leader: 1,
      trick: ['s-9', 's-Q'],
      hand: ['s-K', 's-10', 'd-A'],
      mode: 'best',
      best: ['s-10'],
      wrongExplain: {
        's-K': '[[Krol]] jest silniejszy od [[dama:D]] — {ta lewa byłaby twoja|ten sztych byłby twój}.',
      },
      explain: 'Dziesiątka jest w [[null:Ms]] słabsza od [[dama:D]], więc {lewę|sztycha} weźmie kto inny.',
    },
    {
      type: 'quiz',
      id: 'm2-l10-q3',
      prompt: 'Ile [[lewa:Dlm]] może wziąć [[rozgrywajacy]] w [[null:Ms]], żeby wygrać?',
      options: [
        { id: 'a', text: '0' },
        { id: 'b', text: '1' },
        { id: 'c', text: '5' },
      ],
      correct: 'a',
      explain:
        '{Ani jednej — każda wzięta lewa oznacza przegraną.|Ani jednego — każdy wzięty sztych oznacza przegraną.}',
    },
  ],
};
```

- [ ] **Step 3: Lekcja 11**

```ts
// src/content/lessons/m2-l11-pierwsze-rozdanie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm2-l11-pierwsze-rozdanie',
  title: 'Pierwsze pełne rozdanie',
  summary: 'Rozegraj 10 [[lewa:Dlm]] jako [[rozgrywajacy]].',
  steps: [
    {
      title: 'Całe rozdanie',
      text:
        'Czas na pełne rozdanie: 10 [[lewa:Dlm]]. {[[Przodek]] wychodzi do pierwszej lewy, a każdą następną zaczyna ten, kto wziął poprzednią.|[[Przodek]] wychodzi do pierwszego sztycha, a każdego następnego zaczyna ten, kto wziął poprzedniego.}\n\n' +
        'Na koniec liczymy [[oczko:Blm]]. [[Rozgrywajacy]] dostaje także karty ze [[skat:D]] — w [[graKolorowa:Ms]] ich [[oczko:Mlm]] liczą się dla niego.',
    },
    {
      title: 'Jak grać przy stole',
      text:
        'Twoje karty są na dole, karty na stole — pośrodku. Karty, których nie możesz zagrać, są przyciemnione. [[Obronca:Mlm]] zagrywają automatycznie.\n\n' +
        'Wskazówka: mając dużo [[atu:Dlm]], najpierw wyciągnij [[atu:Blm]] [[obronca:Dlm]] — zagrywaj [[walet:Blm]]. Potem zbieraj [[oczko:Blm]] [[as:Nlm]] i dziesiątkami.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l11-q1',
      prompt: 'Czyje są [[oczko:Mlm]] z kart w [[skat:Ms]] w [[graKolorowa:Ms]]?',
      options: [
        { id: 'a', text: '[[Rozgrywajacy:D]]' },
        { id: 'b', text: '[[Obronca:Dlm]]' },
        { id: 'c', text: 'Niczyje' },
      ],
      correct: 'a',
      explain: 'Karty ze [[skat:D]] liczą się dla [[rozgrywajacy:D]].',
    },
    {
      type: 'miniDeal',
      id: 'm2-l11-d1',
      prompt: 'Rozegraj całe rozdanie jako [[rozgrywajacy]] i zdobądź co najmniej 61 [[oczko:Dlm]].',
      game: HEARTS,
      declarer: 0,
      you: 0,
      hands: [
        ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'c-A', 's-A', 'd-A'],
        ['h-Q', 'h-9', 'c-10', 'c-K', 'c-Q', 's-10', 's-K', 'd-10', 'd-9', 'd-8'],
        ['h-8', 'h-7', 'c-9', 'c-8', 'c-7', 's-Q', 's-9', 's-8', 'd-K', 'd-Q'],
      ],
      skat: ['d-7', 's-7'],
      solution: ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'c-A', 's-A', 'd-A'],
      goal: { kind: 'win' },
      explain:
        'Z czterema [[walet:Nlm]] najpierw wyciąga się [[atu:Blm]] [[obronca:Dlm]]. Gdy już ich nie mają, [[as:Mlm]] i dziesiątki biorą {lewy|sztychy} bez ryzyka.',
    },
  ],
};
```

- [ ] **Step 4: Dodaj lekcje 9–11 do kursu**

W `src/content/course.ts` dodaj importy `l09`, `l10`, `l11` (analogicznie do Task 9) i ustaw moduł `m2` na:

```ts
    { id: 'm2', title: 'Rozgrywka lew', lessons: [l05, l06, l07, l08, l09, l10, l11] },
```

- [ ] **Step 5: Uruchom testy treści i całość**

Run: `npx vitest run src/content && npm test && npm run typecheck && npm run build`
Expected: PASS. `validateCourse` zasymuluje mini-rozdanie z lekcji 11 i potwierdzi, że wzorcowe rozegranie wygrywa.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat(content): lekcje 9–11 — grand, null, pierwsze rozdanie" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Test integracyjny i sprawdzenie w przeglądarce

**Files:**
- Modify: `src/ui/App.test.tsx` (dopisany test)

- [ ] **Step 1: Dopisz test integracyjny**

W `src/ui/App.test.tsx` (wewnątrz `describe('aplikacja', ...)`):

```tsx
  it('lekcja 11 pokazuje stół mini-rozdania po teorii i quizie', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, {
      route: '/lekcja/m2-l11-pierwsze-rozdanie',
      storage: storageWithState({ unlockAll: true }),
    });
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Rozgrywającego' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    expect(screen.getByText('Gra kolorowa · atu: czerwień')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Środek: 10 kart' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Twoje karty' }).children).toHaveLength(10);
  });
```

- [ ] **Step 2: Uruchom wszystko**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/App.test.tsx
git commit -m "test(ui): lekcja 11 z mini-rozdaniem" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Sprawdzenie w przeglądarce (wykonuje koordynator)**

Serwer `skat-dev` z `.claude/launch.json`, widok 375 px, „Odblokuj wszystkie lekcje”. Sprawdź:
1. Lekcja 7: baner „Gra kolorowa · atu: czerwień”, rząd 11 kart w teorii.
2. Lekcja 8: wyjaśnienia z kartami w bierniku („dołożyć siódemkę żołędną”).
3. Lekcja 11: całe rozdanie przeciwko botom. Ruchy botów są widoczne, zakończona lewa chwilę zostaje na stole, oczka się aktualizują. Ręka z 10 kartami mieści się bez przewijania w poziomie, a na końcu pojawia się wynik.
4. Talia francuska i język potoczny w lekcjach 7–11.
5. Konsola bez błędów.
