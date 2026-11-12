# Trener skata — Plan 6: dodatek (ramsz, bocki), grafiki kart, E2E, wdrożenie

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Cel:** domknąć wersję 1 kursu:
- dodatek „Warianty towarzyskie” z lekcjami 31 (ramsz) i 32 (bocki);
- prawdziwe grafiki kart z Wikimedia Commons ze stroną atrybucji;
- test E2E w Playwright w widoku telefonu;
- automatyczne wdrożenie na GitHub Pages.

**Architektura:**
- **Silnik:** dostaje rodzaj gry `ramsch`, w którym karty grają jak w grandzie (atu tylko walety). Dochodzi funkcja `scoreRamsch`, która rozlicza ramsza (przegrywający, jungfrau, durchmarsch, przekazania skata), oraz mnożnik `bock` w `settle`.
- **Treść:** nowy rodzaj sprawdzenia quizu `ramsch`, moduły opcjonalne (`optional`) i trzy terminy w słowniku.
- **Karty:** `PlayingCard` pokazuje plik SVG z `public/cards/<talia>/<karta>.svg`. Gdy obrazek się nie wczyta, wraca do obecnego, rysowanego w kodzie SVG.
- **Narzędzia i wdrożenie:** Playwright testuje zbudowaną stronę (`vite preview`) w oknie 375 px. GitHub Actions uruchamia testy, buduje stronę i publikuje ją na Pages.

**Stos:** Vite 6, React 18, TypeScript 5 (strict), Vitest 3 + RTL, @playwright/test (Chromium), GitHub Actions (`actions/upload-pages-artifact`, `actions/deploy-pages`).

**Decyzje przyjęte przy pisaniu planu (wpisywane do specyfikacji w Task 3):**
- **Wersja ramsza:** jedna z popularnych odmian (źródła: pagat.com, skat.eu, de/en Wikipedia „Ramsch”). Lekcja mówi wprost, że szczegóły ustala się przed grą. Zasady:
  - ramsza gra się, gdy wszyscy spasują;
  - atu są tylko walety, a kolejność kart jest jak w grandzie;
  - każdy gra sam;
  - skat dostaje ten, kto weźmie ostatnią lewę;
  - przegrywa gracz z największą liczbą oczek i zapisuje minus tyle oczek, a pozostali zapisują 0;
  - przy remisie przegrywają obaj; gdy wszyscy mają po 40, nikt nic nie zapisuje;
  - jungfrau (gracz bez lewy) podwaja wynik przegrywającego;
  - durchmarsch (wszystkie lewy) daje temu graczowi +120;
  - każde przekazanie skata bez oglądania (Schieberamsch) podwaja wynik.
- **Bez mini-rozdania w ramszu:** specyfikacja przewidywała w lekcji 31 quiz i mini-rozdanie. Boty i cele mini-rozdań zakładają rozgrywającego i drużyny, a ramsz ich nie ma, więc lekcja 31 ma quizy i ćwiczenia „zagraj kartę”. Walidator odrzuca mini-rozdanie z grą `ramsch`. Pełny ramsz z botami wejdzie razem z trybem pełnej gry (sekcja 7 specyfikacji).
- **Bock:** podwaja wynik gry (wartość po sprawdzeniu przelicytowania, tak jak kontra) i łączy się z kontrą i re. Runda bocków trwa tyle gier, ilu jest graczy. Typowe powody rundy: 60:60, przegrana gra z kontrą, przegrany grand (lista do ustalenia przy stole).
- **Talie** (sprawdzone przez API Commons, wszystkie 64 pliki istnieją):
  - **Altenburg:** zestaw „German Skat cards (SVG set by Mfrasca)”, czyli uproszczony wzór saksoński/Altenburg z XSkat. Autor: Gunter Gerhardt (XSkat), wersja SVG: Mfrasca, licencja **CC BY-SA 3.0**. Około 2 MB (około 370 KB po gzip).
  - **Francuska:** zestaw Adriana Kennarda („SVG playing cards 6”), licencja **CC0**. Około 0,55 MB.
  - **Rewers:** obie talie zachowują obecny, rysowany rewers (zestaw Altenburg nie ma rewersu).
- **Wdrożenie:** repozytorium nie ma jeszcze zdalnego originu. Plan dodaje workflow i README z instrukcją. Utworzenie repozytorium na GitHubie, wypchnięcie kodu i włączenie Pages robi właściciel projektu, a nie wykonawca planu.

---

## Struktura plików (zmiany w Planie 6)

```
src/engine/game.ts               ZMIANA: GameType += { kind: 'ramsch' }
src/engine/scoring.ts            ZMIANA: ramsz nie do zgłoszenia; SettleInput.bock
src/engine/ramsch.ts             NOWY: scoreRamsch
src/engine/index.ts              ZMIANA: eksport ramsch
src/glossary/game.ts             ZMIANA: etykieta ramsza
src/glossary/terms.ts            ZMIANA: ramsz, jungfrau, durchmarsch, bock
src/content/types.ts             ZMIANA: QuizVerify ramsch, settle.bock, CourseModule.optional
src/content/verify.ts            ZMIANA: sprawdzenie ramsch, bock
src/content/validate.ts          ZMIANA: brak mini-rozdań w ramszu
src/ui/CourseMap.tsx             ZMIANA: nagłówek „Dodatek”, komunikat ukończenia kursu
src/content/lessons/d-l31-ramsz.ts   NOWY
src/content/lessons/d-l32-bocki.ts   NOWY
src/content/course.ts            ZMIANA: moduł dodatku
scripts/fetch-cards.mjs          NOWY: pobranie grafik z Commons
public/cards/altenburg/*.svg     NOWE (32 pliki)
public/cards/french/*.svg        NOWE (32 pliki)
src/vite-env.d.ts                NOWY: typy vite/client (import.meta.glob w teście)
src/cards/deckCredits.ts         NOWY: atrybucja talii
src/cards/PlayingCard.tsx        ZMIANA: obrazek + zapasowy SVG
src/ui/AboutCardsPage.tsx        NOWY: strona „O kartach”
src/ui/App.tsx, src/ui/Layout.tsx  ZMIANA: trasa /o-kartach, stopka
src/styles.css                   ZMIANA: .card__img, .app-footer, .about-cards
playwright.config.ts, e2e/course.spec.ts  NOWE
vite.config.ts, package.json, .gitignore  ZMIANA
.github/workflows/deploy.yml     NOWY
README.md                        NOWY
docs/superpowers/specs/2026-11-12-skat-trainer-design.md  ZMIANA
```

---

### Task 1: Silnik — ramsz i bock

**Pliki:**
- Modyfikuj: `src/engine/game.ts`, `src/engine/scoring.ts`, `src/engine/index.ts`, `src/glossary/game.ts`, `src/glossary/terms.ts`
- Utwórz: `src/engine/ramsch.ts`, `src/engine/ramsch.test.ts`
- Testy: `src/engine/order.test.ts`, `src/engine/scoring.test.ts`, `src/glossary/game.test.ts`

- [ ] **Step 1: Testy kolejności kart w ramszu**

Dopisz w `src/engine/order.test.ts` (import `GameType` już jest albo dodaj z `./game`):

```ts
describe('ramsz', () => {
  const ramsch: GameType = { kind: 'ramsch' };
  it('atu są tylko walety', () => {
    expect(isTrump('d-J', ramsch)).toBe(true);
    expect(isTrump('h-A', ramsch)).toBe(false);
  });
  it('lewę bierze najwyższa karta koloru albo walet', () => {
    expect(trickWinner(['h-A', 'h-10', 'c-7'], ramsch)).toBe(0);
    expect(trickWinner(['h-A', 'd-J', 'h-7'], ramsch)).toBe(1);
  });
});
```

- [ ] **Step 2: Testy `scoreRamsch`**

Utwórz `src/engine/ramsch.test.ts`:

```ts
// src/engine/ramsch.test.ts
import { describe, expect, it } from 'vitest';
import { scoreRamsch } from './ramsch';

describe('scoreRamsch', () => {
  it('przegrywa gracz z największą liczbą oczek', () => {
    expect(scoreRamsch({ points: [52, 41, 27], tricks: [4, 4, 2] })).toEqual({
      losers: [0], jungfrau: [], durchmarsch: null, scores: [-52, 0, 0],
    });
  });
  it('jungfrau podwaja wynik przegrywającego', () => {
    expect(scoreRamsch({ points: [70, 50, 0], tricks: [7, 3, 0] })).toMatchObject({ jungfrau: [2], scores: [-140, 0, 0] });
  });
  it('durchmarsch: +120 dla gracza, który wziął wszystkie lewy', () => {
    expect(scoreRamsch({ points: [0, 120, 0], tricks: [0, 10, 0] })).toEqual({
      losers: [], jungfrau: [0, 2], durchmarsch: 1, scores: [0, 120, 0],
    });
  });
  it('każde przekazanie skata podwaja wynik', () => {
    expect(scoreRamsch({ points: [61, 35, 24], tricks: [5, 3, 2], pushes: 1 }).scores).toEqual([-122, 0, 0]);
    expect(scoreRamsch({ points: [61, 35, 24], tricks: [5, 3, 2], pushes: 2 }).scores).toEqual([-244, 0, 0]);
  });
  it('remis: przegrywają obaj; trzy razy po 40 — nikt nie przegrywa', () => {
    expect(scoreRamsch({ points: [50, 50, 20], tricks: [4, 4, 2] })).toMatchObject({ losers: [0, 1], scores: [-50, -50, 0] });
    expect(scoreRamsch({ points: [40, 40, 40], tricks: [3, 3, 4] })).toMatchObject({ losers: [], scores: [0, 0, 0] });
  });
  it('odrzuca niemożliwe wyniki', () => {
    expect(() => scoreRamsch({ points: [50, 50, 50], tricks: [4, 4, 2] })).toThrow('Nieprawidłowy wynik ramsza');
    expect(() => scoreRamsch({ points: [60, 40, 20], tricks: [5, 3, 1] })).toThrow('Nieprawidłowy wynik ramsza');
    expect(() => scoreRamsch({ points: [100, 10, 10], tricks: [8, 2, 0] })).toThrow('Nieprawidłowy wynik ramsza');
    expect(() => scoreRamsch({ points: [60, 40, 20], tricks: [5, 3, 2], pushes: 4 })).toThrow('Nieprawidłowy wynik ramsza');
  });
});
```

(Trzeci przypadek odrzucenia: gracz bez lewy nie może mieć oczek, bo skat trafia do gracza, który wziął ostatnią lewę.)

- [ ] **Step 3: Testy bocka i ramsza w `settle`**

Dopisz w `src/engine/scoring.test.ts` (używa istniejących `decl`, `hearts`, `HEARTS_WITH_2`):

```ts
describe('bock', () => {
  const outcome = (points: number, tricks: number) => ({ declarerPoints: points, declarerTricks: tricks });
  it('bock podwaja wartość gry', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), bock: true })).toMatchObject({ won: true, value: 60, score: 60 });
  });
  it('bock łączy się z kontrą; przegrana liczona podwójnie', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(55, 4), doubling: 'kontra', bock: true })).toMatchObject({ won: false, value: 120, score: -240 });
  });
  it('bock w nullu', () => {
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: outcome(0, 0), bock: true })).toMatchObject({ value: 46 });
  });
  it('przelicytowanie sprawdza się bez bocka', () => {
    // 30 < 40 -> 40, w bocku 80
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), bid: 40, bock: true })).toMatchObject({ overbid: true, value: 80, score: -160 });
  });
});

describe('ramsz w wycenie', () => {
  it('ramsza nie da się zgłosić ani wycenić', () => {
    expect(declarationIssue(decl({ kind: 'ramsch' }))).toBe('Ramsza się nie zgłasza — to gra bez rozgrywającego');
    expect(() => settle({ declaration: decl({ kind: 'ramsch' }), declarerCards: [], outcome: { declarerPoints: 60, declarerTricks: 5 } })).toThrow('Ramsza się nie zgłasza');
    expect(() => matadors(HEARTS_WITH_2, { kind: 'ramsch' })).toThrow('Ramsz nie ma matadorów');
  });
});
```

Uwaga: przy wartości bazowej 10 (kier) i przelicytowaniu do 40 wartość to 40 (10 × ⌈40/10⌉), a w bocku 80. Jeśli `HEARTS_WITH_2` w tym pliku daje inną wartość niż 30, oblicz oczekiwane liczby według reguły przelicytowania z silnika (to sam mechanizm co w istniejącym teście „przelicytowanie z re”) i wpisz je.

- [ ] **Step 4: Test etykiety ramsza**

W `src/glossary/game.test.ts` dopisz:

```ts
it('etykieta ramsza', () => {
  expect(gameLabel({ kind: 'ramsch' }, { deck: 'altenburg', register: 'official' })).toBe('Ramsz · atu: tylko niżniki');
  expect(gameLabel({ kind: 'ramsch' }, { deck: 'french', register: 'colloquial' })).toBe('Ramsz · trumf: tylko jopki');
});
```

Drugie oczekiwanie wynika z form słownika: `atu` w rejestrze potocznym to „trumf”, a `walet:Mlm` w talii francuskiej, w rejestrze potocznym, to „jopki”.

- [ ] **Step 5: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/engine src/glossary`
Expected: FAIL. Brakuje modułu `./ramsch`, typ `GameType` nie zna `ramsch`, a `settle` nie zna `bock`.

- [ ] **Step 6: Implementacja**

`src/engine/game.ts`:

```ts
export type GameType = { kind: 'suit'; trump: Suit } | { kind: 'grand' } | { kind: 'null' } | { kind: 'ramsch' };
```

`src/engine/order.ts` nie wymaga zmian: dla rodzaju innego niż `null` walety są atu, a kolor atu ma tylko gra kolorowa. Ramsz działa więc jak grand.

`src/engine/ramsch.ts`:

```ts
// src/engine/ramsch.ts
import type { Seat } from './game';

export type Triple = [number, number, number];

export interface RamschInput {
  /** Oczka graczy po rozdaniu (skat liczony u gracza, który wziął ostatnią lewę); suma 120. */
  points: Triple;
  /** Liczba wziętych lew; suma 10. */
  tricks: Triple;
  /** Ile razy przekazano skat bez oglądania (Schieberamsch); każde przekazanie podwaja wynik. */
  pushes?: number;
}

export interface RamschResult {
  losers: Seat[];
  /** Gracze bez lewy. */
  jungfrau: Seat[];
  /** Gracz, który wziął wszystkie lewy. */
  durchmarsch: Seat | null;
  scores: Triple;
}

const SEATS: readonly Seat[] = [0, 1, 2];
export const DURCHMARSCH_SCORE = 120;

/** Rozliczenie ramsza (wariant towarzyski — patrz specyfikacja, sekcja 9). */
export function scoreRamsch({ points, tricks, pushes = 0 }: RamschInput): RamschResult {
  const valid =
    [...points, ...tricks, pushes].every((n) => Number.isInteger(n) && n >= 0) &&
    points[0] + points[1] + points[2] === 120 &&
    tricks[0] + tricks[1] + tricks[2] === 10 &&
    pushes <= 3 &&
    SEATS.every((s) => tricks[s] > 0 || points[s] === 0);
  if (!valid) throw new Error('Nieprawidłowy wynik ramsza');

  const jungfrau = SEATS.filter((s) => tricks[s] === 0);
  const durchmarsch = SEATS.find((s) => tricks[s] === 10) ?? null;
  const scores: Triple = [0, 0, 0];
  if (durchmarsch !== null) {
    scores[durchmarsch] = DURCHMARSCH_SCORE;
    return { losers: [], jungfrau, durchmarsch, scores };
  }
  const max = Math.max(...points);
  const tied = SEATS.filter((s) => points[s] === max);
  const losers = tied.length === 3 ? [] : tied;
  const factor = 2 ** (jungfrau.length + pushes);
  for (const s of losers) scores[s] = -points[s] * factor;
  return { losers, jungfrau, durchmarsch: null, scores };
}
```

`src/engine/index.ts`: dopisz `export * from './ramsch';`.

`src/engine/scoring.ts`:
1. `declarationIssue`: na początku funkcji:
   ```ts
   if (d.game.kind === 'ramsch') return 'Ramsza się nie zgłasza — to gra bez rozgrywającego';
   ```
2. `baseValue`: przed `return game.kind === 'grand' ? …`:
   ```ts
   if (game.kind === 'ramsch') throw new Error('Ramsz nie ma wartości gry');
   ```
3. `matadorOrder`: na początku:
   ```ts
   if (game.kind === 'ramsch') throw new Error('Ramsz nie ma matadorów');
   ```
4. `SettleInput`: dodaj pole
   ```ts
   /** Gra w rundzie bocków: wartość ×2 (łączy się z kontrą/re). */
   bock?: boolean;
   ```
5. `settle`: w destrukturyzacji parametrów dodaj `bock`. Zmień wyliczenie mnożnika na
   ```ts
   const factor = (doubling ? DOUBLING_FACTOR[doubling] : 1) * (bock ? 2 : 1);
   ```
   Tuż po bloku `if (d.game.kind === 'null') { … }` dodaj (to zawęża typ, bo `declarationIssue` rzuciło już wcześniej):
   ```ts
   if (d.game.kind === 'ramsch') throw new Error('Ramsza się nie zgłasza');
   ```

`src/glossary/game.ts`, w `switch` dodaj:

```ts
    case 'ramsch':
      return resolveText('[[Ramsz]] · [[atu]]: tylko [[walet:Mlm]]', ctx);
```

`src/glossary/terms.ts`: dopisz na końcu obiektu `TERMS`, po `szmirowanie`. Formy oznaczone ⚠ trafią do sekcji 8 specyfikacji do weryfikacji przez autora.

```ts
  ramsz: plain(same({ M: 'ramsz', g: 'm', D: 'ramsza', B: 'ramsza', N: 'ramszem', Ms: 'ramszu' })),
  jungfrau: plain({
    official: { M: 'dziewica', g: 'f', D: 'dziewicy', B: 'dziewicę', N: 'dziewicą' },
    colloquial: { M: 'jungfrau', g: 'f', D: 'jungfrau', B: 'jungfrau', N: 'jungfrau' },
  }),
  durchmarsch: plain({
    official: { M: 'przemarsz', g: 'm', D: 'przemarszu', B: 'przemarsz', N: 'przemarszem' },
    colloquial: { M: 'durchmarsz', g: 'm', D: 'durchmarszu', B: 'durchmarsz', N: 'durchmarszem' },
  }),
  bock: plain({
    official: { M: 'bock', g: 'm', D: 'bocka', Mlm: 'bocki', Dlm: 'bocków' },
    colloquial: { M: 'bok', g: 'm', D: 'boka', Mlm: 'boki', Dlm: 'boków' },
  }),
```

Uruchom `npm run typecheck`. Każde inne miejsce, w którym TypeScript zgłosi nieobsłużony `ramsch` (np. wyczerpujący `switch`), obsłuż tak:
- funkcje związane ze zgłoszeniem gry rzucają `Error('Ramsza się nie zgłasza')`;
- funkcje gry w karty traktują ramsz jak grand.

Zapisz w raporcie każde takie miejsce.

- [ ] **Step 7: Uruchom testy**

Run: `npm test -- --run && npm run typecheck`
Expected: PASS (wszystkie dotychczasowe testy i nowe).

- [ ] **Step 8: Commit**

```bash
git add src/engine src/glossary
git commit -m "feat(engine): ramsz (rozliczenie, kolejność kart) i bock w wycenie gry"
```

---

### Task 2: Treść — sprawdzanie ramsza i bocka, moduł opcjonalny

**Pliki:**
- Modyfikuj: `src/content/types.ts`, `src/content/verify.ts`, `src/content/validate.ts`, `src/ui/CourseMap.tsx`
- Testy: `src/content/verify.test.ts`, `src/content/validate.test.ts`, `src/ui/App.test.tsx`

- [ ] **Step 1: Testy sprawdzania quizów**

Dopisz w `src/content/verify.test.ts` (dopasuj import `QuizExerciseData`/`verifyQuiz` do istniejącego pliku):

```ts
describe('verify: ramsz i bock', () => {
  const q = (verify: QuizExerciseData['verify'], answer: string, cards?: QuizExerciseData['cards']): QuizExerciseData => ({
    type: 'quiz', id: 'q', prompt: 'P', cards,
    options: [{ id: 'a', text: answer }, { id: 'b', text: 'x' }], correct: 'a', explain: 'E', verify,
  });
  it('ramsch: wynik gracza z miejsca seat', () => {
    expect(verifyQuiz(q({ kind: 'ramsch', points: [52, 41, 27], tricks: [4, 4, 2], seat: 0 }, '-52'))).toEqual([]);
    expect(verifyQuiz(q({ kind: 'ramsch', points: [52, 41, 27], tricks: [4, 4, 2], seat: 1 }, '-52'))).toEqual([
      'poprawna odpowiedź powinna wynosić 0',
    ]);
    expect(verifyQuiz(q({ kind: 'ramsch', points: [61, 35, 24], tricks: [5, 3, 2], pushes: 1, seat: 0 }, '-122'))).toEqual([]);
  });
  it('ramsch: niemożliwy wynik to błąd sprawdzania', () => {
    expect(verifyQuiz(q({ kind: 'ramsch', points: [50, 50, 50], tricks: [4, 4, 2], seat: 0 }, '-50'))).toEqual([
      'błąd sprawdzania: Nieprawidłowy wynik ramsza',
    ]);
  });
  it('settle z bockiem', () => {
    const cards = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;
    const declaration = { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' } as const;
    expect(verifyQuiz(q({ kind: 'settle', declaration, outcome: { declarerPoints: 75, declarerTricks: 6 }, bock: true, result: 'value' }, '60', [...cards]))).toEqual([]);
  });
});
```

- [ ] **Step 2: Test walidatora — ramsz bez mini-rozdań**

Dopisz w `src/content/validate.test.ts` (wewnątrz `describe('validateCourse')`):

```ts
  it('mini-rozdanie w ramszu jest odrzucane', () => {
    const ramschDeal: MiniDealExerciseData = {
      type: 'miniDeal', id: 'r1', prompt: 'P', explain: 'E', game: { kind: 'ramsch' }, declarer: 0, you: 0,
      hands: [['c-A'], ['c-7'], ['c-8']], skat: [], solution: ['c-A'], goal: { kind: 'minPoints', points: 0 },
    };
    expect(validateCourse(courseWith(lessonWith([ramschDeal])))).toEqual([
      'l1/r1: mini-rozdanie w ramszu nie jest obsługiwane — boty nie grają ramsza',
    ]);
  });
```

(Sprawdź w pliku, jak walidator buduje prefiks komunikatów (`l1/r1: …`), i dopasuj go, jeśli jest inny.)

- [ ] **Step 3: Testy mapy kursu**

Dopisz w `src/ui/App.test.tsx`:

```ts
  it('moduł opcjonalny ma nagłówek „Dodatek”', () => {
    const optional = COURSE.modules.find((m) => m.optional);
    renderWithProviders(<AppRoutes />);
    expect(optional).toBeDefined();
    expect(screen.getByRole('heading', { name: `Dodatek: ${optional!.title}` })).toBeInTheDocument();
  });

  it('po zaliczeniu wszystkich lekcji: gratulacje', () => {
    const lessons = Object.fromEntries(
      COURSE.modules.flatMap((m) => m.lessons).map((l) => [l.id, { status: 'passed' as const, bestScore: 1, attempts: 1 }]),
    );
    renderWithProviders(<AppRoutes />, { storage: storageWithState({}, lessons) });
    expect(screen.getByText('Ukończono cały kurs. Gratulacje!')).toBeInTheDocument();
  });
```

Pierwszy test przejdzie dopiero po Task 3, który doda moduł dodatku. Na razie oznacz go jako `it.todo('moduł opcjonalny ma nagłówek „Dodatek”')`, a w Task 3 zamień na pełny test powyżej. Drugi test musi przejść już w tym zadaniu.

Uwaga: tytuł modułu w nagłówku przechodzi przez `t()`. Tytuł dodatku nie zawiera tokenów, więc `optional!.title` wystarcza.

- [ ] **Step 4: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/content src/ui`
Expected: FAIL (brak `ramsch` w `QuizVerify`, brak `bock`, komunikat walidatora, tekst gratulacji).

- [ ] **Step 5: Implementacja**

`src/content/types.ts`:
- import z silnika rozszerz o `Triple`;
- w opisie `QuizVerify` dopisz punkt:
  ```
   * - `ramsch`: rozliczenie ramsza (`scoreRamsch`) — porównywany jest wynik gracza `seat`;
  ```
- w unii `QuizVerify` zmień wariant `settle` i dodaj `ramsch`:
  ```ts
  | { kind: 'settle'; declaration: Declaration; outcome: PlayOutcome; bid?: number; doubling?: Doubling; bock?: boolean; result: 'value' | 'score' | 'tournament' }
  | { kind: 'ramsch'; points: Triple; tricks: Triple; pushes?: number; seat: Seat };
  ```
- w `CourseModule` dodaj:
  ```ts
  /** Moduł dodatkowy (np. warianty towarzyskie) — na mapie „Dodatek” zamiast numeru. */
  optional?: boolean;
  ```

`src/content/verify.ts`:
- import z silnika rozszerz o `scoreRamsch`;
- w `settle` przekaż `bock: verify.bock` do wywołania `settle({...})`;
- dodaj przypadek:
  ```ts
      case 'ramsch':
        return expect(String(scoreRamsch(verify).scores[verify.seat]));
  ```

`src/content/validate.ts`, na początku `validateMiniDeal`:

```ts
  if (ex.game.kind === 'ramsch') {
    report('mini-rozdanie w ramszu nie jest obsługiwane — boty nie grają ramsza');
    return;
  }
```

`src/ui/CourseMap.tsx`:
- nagłówek modułu:
  ```tsx
          <h2>
            {module.optional ? 'Dodatek' : `Moduł ${moduleIndex + 1}`}: {t(module.title)}
          </h2>
  ```
- komunikat po ukończeniu:
  ```tsx
        <p>Ukończono cały kurs. Gratulacje!</p>
  ```

- [ ] **Step 6: Uruchom testy**

Run: `npm test -- --run && npm run typecheck`
Expected: PASS (z jednym `todo`).

- [ ] **Step 7: Commit**

```bash
git add src/content src/ui
git commit -m "feat(content): sprawdzanie ramsza i bocka w quizach, moduł opcjonalny na mapie kursu"
```

---

### Task 3: Lekcje 31–32 i specyfikacja

**Pliki:**
- Utwórz: `src/content/lessons/d-l31-ramsz.ts`, `src/content/lessons/d-l32-bocki.ts`
- Modyfikuj: `src/content/course.ts`, `src/ui/App.test.tsx` (zamiana `it.todo`), `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`

Zasady tekstów (jak w Planach 3–5):
- nazwy kart i rang zapisuj tokenami (`[[card:s-K:B]]`, `[[as:B]]`), nigdy na sztywno, bo zależą od talii i rejestru („as” albo „daus”);
- alternacji `{oficjalna|potoczna}` używaj tylko tam, gdzie przymiotnik lub zaimek musi się zgodzić z rodzajem terminu (`lewa` ż. / `sztych` m.).

- [ ] **Step 1: Lekcja 31 — ramsz**

```ts
// src/content/lessons/d-l31-ramsz.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const RAMSCH: GameType = { kind: 'ramsch' };

export const lesson: Lesson = {
  id: 'd-l31-ramsz',
  title: '[[Ramsz]]',
  summary: 'Gdy wszyscy spasują: każdy gra sam i unika [[oczko:Dlm]].',
  steps: [
    {
      title: 'Kiedy gra się [[ramsz:B]]',
      text:
        'Według oficjalnych przepisów (ISkO), gdy wszyscy trzej gracze spasują, rozdanie przepada i karty rozdaje następny gracz. ' +
        'Przy wielu stołach gra się wtedy **[[ramsz:B]]**. To wariant towarzyski — nie ma go w ISkO, a szczegóły ustala się przed grą. ' +
        'Poniżej jedna z najpopularniejszych wersji.',
    },
    {
      title: 'Każdy gra sam',
      text:
        'W [[ramsz:Ms]] nie ma [[rozgrywajacy:D]] ani drużyn. Każdy zbiera swoje [[lewa:Blm]] i stara się wziąć jak najmniej [[oczko:Dlm]]. ' +
        '[[Atu:Nlm]] są tylko [[walet:Mlm]] — kolejność kart jest taka jak w grandzie.',
    },
    {
      title: 'Kto przegrywa',
      text:
        '[[Skat]] dostaje gracz, który weźmie ostatnią [[lewa:B]]. Przegrywa ten, kto ma najwięcej [[oczko:Dlm]] — zapisuje tyle punktów na minus. ' +
        'Pozostali zapisują 0. Przy remisie przegrywają obaj.',
    },
    {
      title: 'Premie i kary',
      text:
        '**[[Jungfrau]]** to gracz, który nie wziął {żadnej|żadnego} [[lewa:D]] — wtedy wynik przegrywającego się podwaja. ' +
        '**[[Durchmarsch]]** to wzięcie wszystkich [[lewa:Dlm]] — taki gracz zapisuje +120. ' +
        'W odmianie z przekazywaniem [[skat:D]] (Schieberamsch) każde przekazanie [[skat:D]] bez oglądania podwaja wynik.',
    },
    {
      title: 'Jak grać',
      text:
        'Pozbywaj się wysokich kart, gdy [[lewa:B]] i tak bierze ktoś inny — zwłaszcza [[as:Dlm]] i [[dziesiatka:Dlm]]. Wychodź niskimi kartami. ' +
        'Uważaj na [[walet:Blm]]: to [[atu:Mlm]], więc łatwo nimi wziąć [[lewa:B]].',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'd-l31-q1',
      prompt: 'Kiedy gra się [[ramsz:B]]?',
      options: [
        { id: 'a', text: 'Gdy wszyscy spasują' },
        { id: 'b', text: 'Gdy [[rozgrywajacy]] przegra' },
        { id: 'c', text: 'Po każdym grandzie' },
      ],
      correct: 'a',
      explain: '[[Ramsz]] zastępuje rozdanie, w którym nikt nie chciał grać.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q2',
      prompt: 'Ile [[atu:Dlm]] masz w [[ramsz:Ms]]?',
      cards: ['c-J', 'h-J', 'h-A', 'h-10', 'h-K', 's-A', 's-7', 'd-9', 'd-8', 'c-7'],
      options: [
        { id: 'a', text: '2' },
        { id: 'b', text: '5' },
        { id: 'c', text: '0' },
      ],
      correct: 'a',
      verify: { kind: 'trumpCount', game: RAMSCH },
      explain: '[[Atu:Nlm]] są tylko [[walet:Mlm]] — tu dwa. Pozostałe karty to zwykłe kolory.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q3',
      prompt:
        'Po [[ramsz:Ms]] masz 52 [[oczko:Mlm]], pozostali gracze 41 i 27. Każdy wziął co najmniej {jedną|jednego} [[lewa:B]]. Ile zapisujesz?',
      options: [
        { id: 'a', text: '−52', value: '-52' },
        { id: 'b', text: '0' },
        { id: 'c', text: '+52', value: '52' },
      ],
      correct: 'a',
      verify: { kind: 'ramsch', points: [52, 41, 27], tricks: [4, 4, 2], seat: 0 },
      explain: 'Masz najwięcej [[oczko:Dlm]], więc przegrywasz: −52. Pozostali zapisują 0.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q4',
      prompt:
        'Masz 70 [[oczko:Dlm]], drugi gracz 50, a trzeci nie wziął {żadnej|żadnego} [[lewa:D]]. Ile zapisujesz?',
      options: [
        { id: 'a', text: '−70', value: '-70' },
        { id: 'b', text: '−140', value: '-140' },
        { id: 'c', text: '−210', value: '-210' },
      ],
      correct: 'b',
      verify: { kind: 'ramsch', points: [70, 50, 0], tricks: [7, 3, 0], seat: 0 },
      explain: 'Przegrywasz z 70 [[oczko:Nlm]], a [[jungfrau]] przy stole podwaja wynik: −140.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q5',
      prompt: 'Wziąłeś wszystkie [[lewa:Blm]]. Ile zapisujesz?',
      options: [
        { id: 'a', text: '+120', value: '120' },
        { id: 'b', text: '−120', value: '-120' },
        { id: 'c', text: '0' },
      ],
      correct: 'a',
      verify: { kind: 'ramsch', points: [120, 0, 0], tricks: [10, 0, 0], seat: 0 },
      explain: '[[Durchmarsch]] to wygrana: +120. Pozostali zapisują 0.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q6',
      prompt:
        '[[Skat]] przekazano raz bez oglądania. Masz 61 [[oczko:Dlm]], pozostali gracze 35 i 24. Ile zapisujesz?',
      options: [
        { id: 'a', text: '−61', value: '-61' },
        { id: 'b', text: '−122', value: '-122' },
        { id: 'c', text: '−244', value: '-244' },
      ],
      correct: 'b',
      verify: { kind: 'ramsch', points: [61, 35, 24], tricks: [5, 3, 2], pushes: 1, seat: 0 },
      explain: 'Jedno przekazanie [[skat:D]] podwaja wynik: 61 × 2 = 122 na minus.',
    },
    {
      type: 'playCard',
      id: 'd-l31-p1',
      prompt:
        'Gracie [[ramsz:B]]. [[Przodek]] wyszedł [[card:s-A:N]], [[srodek]] dołożył [[card:s-10:B]]. Którą kartę dołożyć?',
      game: RAMSCH,
      leader: 0,
      trick: ['s-A', 's-10'],
      hand: ['s-K', 's-7', 'h-A', 'c-9'],
      mode: 'best',
      best: ['s-K'],
      wrongExplain: {
        's-7': '[[Card:s-7]] też nie bierze [[lewa:D]], ale [[card:s-K]] zostanie w twojej ręce i później może kosztować cię 4 [[oczko:Mlm]].',
      },
      explain: '[[Card:s-A]] i tak bierze [[lewa:B]]. Pozbądź się [[card:s-K:D]] — jego 4 [[oczko:Mlm]] trafią do [[przodek:D]], a nie do ciebie.',
    },
    {
      type: 'playCard',
      id: 'd-l31-p2',
      prompt:
        'Gracie [[ramsz:B]]. [[Przodek]] wyszedł [[card:d-9:N]], [[srodek]] dołożył [[card:d-K:B]]. Nie masz tego koloru. Którą kartę oddać?',
      game: RAMSCH,
      leader: 0,
      trick: ['d-9', 'd-K'],
      hand: ['c-A', 'c-7', 'h-10', 'h-8', 's-J'],
      mode: 'best',
      best: ['c-A'],
      wrongExplain: {
        's-J': '[[Card:s-J]] to [[atu]] — wziąłbyś [[lewa:B]] razem z [[card:d-K:N]].',
        'h-10': '[[Card:h-10]] też oddaje [[oczko:Mlm]], ale [[card:c-A]] jest wart więcej (11).',
        'c-7': 'Niska karta przyda się później, żeby nie brać [[lewa:Dlm]]. Teraz pozbądź się [[card:c-A:D]].',
        'h-8': 'Niska karta przyda się później, żeby nie brać [[lewa:Dlm]]. Teraz pozbądź się [[card:c-A:D]].',
      },
      explain: 'Kto nie ma koloru, może zrzucić dowolną kartę. Oddaj [[card:c-A:B]] — 11 [[oczko:Dlm]] trafi do [[srodek:D]], który bierze [[lewa:B]].',
    },
    {
      type: 'playCard',
      id: 'd-l31-p3',
      prompt: 'Gracie [[ramsz:B]]. Wychodzisz. Którą kartę zagrać?',
      game: RAMSCH,
      leader: 0,
      trick: [],
      hand: ['c-7', 'c-8', 'h-K', 's-A', 'd-J'],
      mode: 'best',
      best: ['c-7', 'c-8'],
      wrongExplain: {
        's-A': '[[Card:s-A]] najpewniej weźmie [[lewa:B]] — razem z [[oczko:Nlm]] dołożonymi przez innych.',
        'h-K': '[[Card:h-K]] weźmie [[lewa:B]], jeśli nikt nie ma w tym kolorze [[as:D]] ani [[dziesiatka:D]].',
        'd-J': '[[Card:d-J]] to [[atu]] — weźmie [[lewa:B]], jeśli inni nie mają wyższych [[walet:Dlm]].',
      },
      explain: 'Wychodź niską kartą: [[card:c-7]] i [[card:c-8]] prawie na pewno przegrają z kartami pozostałych graczy.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 32 — bocki**

```ts
// src/content/lessons/d-l32-bocki.ts
import type { Declaration } from '../../engine';
import type { Lesson } from '../types';

const HEARTS_DECL: Declaration = { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' };
const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;

export const lesson: Lesson = {
  id: 'd-l32-bocki',
  title: '[[Bock:Mlm]] i zasady domowe',
  summary: 'Runda podwójnych gier — kiedy się zaczyna i ile trwa.',
  steps: [
    {
      title: 'Runda [[bock:Dlm]]',
      text:
        'Przy wielu stołach po pewnych zdarzeniach gra się **rundę [[bock:Dlm]]**: każda gra w tej rundzie liczy się podwójnie. ' +
        'Runda trwa tyle gier, ilu jest graczy przy stole — przy trzech osobach trzy gry. To zasada domowa: nie ma jej w ISkO.',
    },
    {
      title: 'Kiedy zaczyna się runda',
      text:
        'Najczęstsze powody: wynik 60:60, przegrana gra z kontrą, przegrany [[grand]]. Każdy stół wybiera własną listę — ustalcie ją przed grą.',
    },
    {
      title: 'Jak liczyć',
      text:
        '[[Bock]] podwaja wynik gry, a nie stawki w [[licytacja:Ms]] — licytujesz tak samo jak zwykle. ' +
        '[[Bock]] łączy się z kontrą: gra z kontrą w rundzie [[bock:Dlm]] liczy się czterokrotnie.',
    },
    {
      title: 'Runda [[ramsz:D]]',
      text:
        'Często po rundzie [[bock:Dlm]] gra się rundę [[ramsz:D]] — tyle gier [[ramsz:D]], ilu jest graczy. ' +
        'Gdy w trakcie rundy [[bock:Dlm]] wydarzy się kolejny powód, stoły liczą to różnie: kolejna runda po tej albo podwojenie w podwojeniu. To też ustala się wcześniej.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'd-l32-q1',
      prompt: 'Ile gier trwa runda [[bock:Dlm]] przy stole trzyosobowym?',
      options: [
        { id: 'a', text: '1' },
        { id: 'b', text: '3' },
        { id: 'c', text: '6' },
      ],
      correct: 'b',
      explain: 'Runda trwa tyle gier, ilu jest graczy — każdy raz rozdaje.',
    },
    {
      type: 'quiz',
      id: 'd-l32-q2',
      prompt: '[[Atu]]: [[suit:h]], [[mit]] 2. Gra jest wygrana bez [[krawiec:D]] w rundzie [[bock:Dlm]]. Ile jest warta?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '30' },
        { id: 'b', text: '60' },
        { id: 'c', text: '120' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: HEARTS_DECL, outcome: { declarerPoints: 75, declarerTricks: 6 }, bock: true, result: 'value' },
      explain: 'Zwykle 10 × 3 = 30. [[Bock]] podwaja: 60.',
    },
    {
      type: 'quiz',
      id: 'd-l32-q3',
      prompt:
        '[[Atu]]: [[suit:h]], [[mit]] 2, kontra, runda [[bock:Dlm]]. [[Rozgrywajacy]] przegrywa z 55 [[oczko:Nlm]]. Jaki jest wynik?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '−120', value: '-120' },
        { id: 'b', text: '−240', value: '-240' },
        { id: 'c', text: '−480', value: '-480' },
      ],
      correct: 'b',
      verify: {
        kind: 'settle',
        declaration: HEARTS_DECL,
        outcome: { declarerPoints: 55, declarerTricks: 4 },
        doubling: 'kontra',
        bock: true,
        result: 'score',
      },
      explain: 'Wartość: 30 × 2 (kontra) × 2 ([[bock]]) = 120. Przegrana liczy się podwójnie: −240.',
    },
    {
      type: 'quiz',
      id: 'd-l32-q4',
      prompt: 'Które zdarzenie często rozpoczyna rundę [[bock:Dlm]]?',
      options: [
        { id: 'a', text: 'Wynik 60:60' },
        { id: 'b', text: 'Wygrana [[graKolorowa]]' },
        { id: 'c', text: 'Pas wszystkich graczy' },
      ],
      correct: 'a',
      explain: 'Wynik 60:60 to jeden z typowych powodów. Pas wszystkich prowadzi zwykle do [[ramsz:D]], a nie do rundy [[bock:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'd-l32-q5',
      prompt: 'Czy [[bock]] zmienia stawki w [[licytacja:Ms]]?',
      options: [
        { id: 'a', text: 'Nie — licytuje się tak samo, podwaja się tylko wynik' },
        { id: 'b', text: 'Tak — wszystkie stawki są podwójne' },
      ],
      correct: 'a',
      explain: '[[Licytacja]] przebiega zwykle; [[bock]] mnoży dopiero wynik zapisanej gry.',
    },
  ],
};
```

- [ ] **Step 3: Moduł dodatku**

W `src/content/course.ts` dodaj importy:

```ts
import { lesson as l31 } from './lessons/d-l31-ramsz';
import { lesson as l32 } from './lessons/d-l32-bocki';
```

i ostatni moduł:

```ts
    { id: 'dodatek', title: 'Warianty towarzyskie', optional: true, lessons: [l31, l32] },
```

W `src/ui/App.test.tsx` zamień `it.todo('moduł opcjonalny ma nagłówek „Dodatek”')` na pełny test z Task 2, Step 3.

- [ ] **Step 4: Testy treści i przegląd tekstów**

Run: `npm test -- --run && npm run typecheck`
Expected: PASS. Walidator sprawdza dozwolone karty, tokeny, formy słownika i wyniki quizów przez `verify`.

Jeśli walidator zgłosi brak formy w słowniku (np. `walet:Blm`, `as:Dlm`, `atu:Mlm`), dopisz brakującą formę do istniejącego wpisu w `terms.ts`, w tej samej konwencji co sąsiednie formy, i wymień ją w raporcie. Innych zmian w słowniku nie rób.

Run: `npm run texts -- d-l3`
Przeczytaj wszystkie 4 konteksty (talia × rejestr). Sprawdź, czy nie zostały surowe `[[`, „undefined”, błędy odmiany lub rodzaju (np. „sztych … którą”). Popraw tylko oczywiste usterki, a wątpliwości opisz w raporcie.

- [ ] **Step 5: Specyfikacja**

W `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`:
1. W tabeli słownika (sekcja 8) dopisz pod wierszem `| bock | bok ⚠ |`:
   ```
   | gracz bez lewy w ramszu | dziewica ⚠ / jungfrau |
   | wzięcie wszystkich lew w ramszu | przemarsz ⚠ / durchmarsz ⚠ |
   ```
   (Format tabeli dopasuj do istniejących wierszy — kolumny: termin oficjalny | potoczny.)
2. W sekcji 8.3 dopisz punkt:
   ```
   - Ramsz i bocki: warianty towarzyskie spoza ISkO; kurs uczy jednej popularnej wersji (sekcja 9) i podkreśla, że szczegóły ustala się przed grą.
   ```
3. Nagłówek sekcji 9 zmień na „(Plany 1–6)” i dopisz punkty:
   ```
   - **Ramsz (Plan 6):** skat dla biorącego ostatnią lewę; przegrywa gracz z największą liczbą oczek (minus tyle oczek), remis — przegrywają obaj, 40/40/40 — bez zapisu; jungfrau ×2; durchmarsch +120; każde przekazanie skata ×2. Lekcja 31 bez mini-rozdania (boty nie grają ramsza) — quizy i „zagraj kartę”.
   - **Bock (Plan 6):** ×2 do wartości gry (po sprawdzeniu przelicytowania), łączy się z kontrą/re; runda = tyle gier, ilu graczy.
   - **Grafiki kart (Plan 6):** Altenburg — XSkat (Gunter Gerhardt), SVG: Mfrasca, CC BY-SA 3.0; francuska — Adrian Kennard, CC0; rewers rysowany w kodzie; atrybucja na stronie „O kartach”.
   - **Wdrożenie (Plan 6):** GitHub Actions (testy, E2E, build) → GitHub Pages; repozytorium i włączenie Pages po stronie właściciela.
   ```
4. W punkcie „Podział dalszych prac” dopisz na końcu: „Plan 6 zrealizowany — wersja 1 kompletna.”

- [ ] **Step 6: Commit**

```bash
git add src/content src/ui/App.test.tsx src/glossary/terms.ts docs/superpowers/specs/2026-11-12-skat-trainer-design.md
git commit -m "feat(content): dodatek — lekcje 31–32: ramsz i bocki"
```

---

### Task 4: Grafiki kart z Wikimedia Commons i strona „O kartach”

**Pliki:**
- Utwórz: `scripts/fetch-cards.mjs`, `public/cards/altenburg/*.svg`, `public/cards/french/*.svg`, `src/vite-env.d.ts`, `src/cards/deckCredits.ts`, `src/ui/AboutCardsPage.tsx`, `src/ui/AboutCardsPage.test.tsx`
- Modyfikuj: `src/cards/PlayingCard.tsx`, `src/cards/cards.test.tsx`, `src/ui/App.tsx`, `src/ui/Layout.tsx`, `src/styles.css`

- [ ] **Step 1: Skrypt pobierający grafiki**

```js
// scripts/fetch-cards.mjs
// Jednorazowe pobranie grafik kart z Wikimedia Commons do public/cards/<talia>/<karta>.svg.
// Uruchom: node scripts/fetch-cards.mjs   (pliki trafiają do repozytorium; skrypt dokumentuje ich pochodzenie)
// Licencje i autorzy: src/cards/deckCredits.ts.
import { mkdir, writeFile } from 'node:fs/promises';

const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Altenburg: „German Skat cards (SVG set by Mfrasca)”, CC BY-SA 3.0.
const GERMAN_SUIT = { c: 'eichel', s: 'blatt', h: 'hart', d: 'schellen' };
const GERMAN_FACES = {
  c: { J: '11 unter', Q: '12 ober', K: '13 konig', A: '01 daus' },
  h: { J: '11 unter', Q: '12 ober', K: '13 konig', A: '01 daus' },
  s: { J: '11 jack', Q: '12 queen', K: '13 king', A: '01 daus' },
  d: { J: '11 jack', Q: '12 queen', K: '13 king', A: '01' },
};
const germanFile = (suit, rank) => {
  const r = { 7: '07', 8: '08', 9: '09', 10: '10' }[rank] ?? GERMAN_FACES[suit][rank];
  return `Playing card-german-${GERMAN_SUIT[suit]}-${r}.svg`;
};

// Francuska: Adrian Kennard („SVG playing cards 6”), CC0.
const frenchFile = (suit, rank) => `${rank}${suit.toUpperCase()}.svg`;

const DECKS = { altenburg: germanFile, french: frenchFile };

async function download(name) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name.replaceAll(' ', '_'))}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'skat-trener-card-fetch/1.0 (static site asset script)' } });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const text = await res.text();
  if (!/<svg[\s>]/.test(text)) throw new Error(`${name}: to nie jest plik SVG`);
  return text;
}

for (const [deck, fileFor] of Object.entries(DECKS)) {
  await mkdir(`public/cards/${deck}`, { recursive: true });
  for (const suit of ['c', 's', 'h', 'd']) {
    for (const rank of RANKS) {
      const name = fileFor(suit, rank);
      const svg = await download(name);
      await writeFile(`public/cards/${deck}/${suit}-${rank}.svg`, svg);
      console.log(`${deck}/${suit}-${rank}.svg  ←  ${name} (${svg.length} B)`);
      await new Promise((r) => setTimeout(r, 200)); // grzecznie wobec serwerów Wikimedia
    }
  }
}
```

Run: `node scripts/fetch-cards.mjs`
Expected: 64 linie, każda z rozmiarem większym od 0. Po zakończeniu `ls public/cards/altenburg | wc -l` i `ls public/cards/french | wc -l` dają po 32.

Sprawdź też, że pliki nie odwołują się do zasobów zewnętrznych:

Run: `grep -l "xlink:href=\"http\|href=\"http\|<image" public/cards/*/*.svg`
Expected: brak wyników. Jeśli coś się znajdzie, przerwij i zgłoś to w raporcie (BLOCKED).

- [ ] **Step 2: Typy Vite i dane atrybucji**

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />
```

```ts
// src/cards/deckCredits.ts
import type { DeckKind } from '../glossary';

export interface DeckCredit {
  deck: DeckKind;
  name: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  changes: string;
}

export const DECK_CREDITS: readonly DeckCredit[] = [
  {
    deck: 'altenburg',
    name: 'Talia Altenburg (wzór saksoński z programu XSkat)',
    author: 'Gunter Gerhardt (XSkat, xskat.de); wersja SVG: Mfrasca',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    source: 'https://commons.wikimedia.org/wiki/Category:German_Skat_cards_(SVG_set_by_Mfrasca)',
    changes: 'Rysunki bez zmian; zmieniono tylko nazwy plików.',
  },
  {
    deck: 'french',
    name: 'Talia francuska',
    author: 'Adrian Kennard (TheRealRevK)',
    license: 'CC0 1.0 (domena publiczna)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://commons.wikimedia.org/wiki/Category:SVG_playing_cards_6',
    changes: 'Rysunki bez zmian; zmieniono tylko nazwy plików.',
  },
];
```

(Sprawdź, czy `DeckKind` jest eksportowane z `src/glossary/index.ts`. Jeśli nie, zaimportuj je z `../glossary/types`.)

- [ ] **Step 3: Testy karty z obrazkiem**

Dopisz w `src/cards/cards.test.tsx` (dodaj import `fireEvent` z `@testing-library/react` i `cardImageUrl` z `./PlayingCard`):

```ts
  it('karta pokazuje grafikę wybranej talii', () => {
    renderWithProviders(<PlayingCard card="h-10" />);
    const img = screen.getByRole('img', { name: 'dziesiątka czerwienna' }).querySelector('img');
    expect(img).toHaveAttribute('src', 'cards/altenburg/h-10.svg');
    expect(img).toHaveAttribute('alt', '');
  });

  it('talia francuska: grafika z katalogu french', () => {
    renderWithProviders(<PlayingCard card="c-J" />, { storage: storageWithState({ deck: 'french' }) });
    expect(screen.getByRole('img', { name: 'walet trefl' }).querySelector('img')).toHaveAttribute('src', 'cards/french/c-J.svg');
  });

  it('gdy grafika się nie wczyta, karta rysuje się w kodzie', () => {
    renderWithProviders(<PlayingCard card="h-10" />);
    const card = screen.getByRole('img', { name: 'dziesiątka czerwienna' });
    fireEvent.error(card.querySelector('img')!);
    expect(card.querySelector('img')).toBeNull();
    expect(card.querySelector('svg.card__svg')).not.toBeNull();
  });

  it('w repozytorium są grafiki wszystkich 64 kart', () => {
    const files = Object.keys(import.meta.glob('../../public/cards/*/*.svg'));
    const decks = ['altenburg', 'french'];
    const cards = ['c', 's', 'h', 'd'].flatMap((s) => ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'].map((r) => `${s}-${r}`));
    const expected = decks.flatMap((d) => cards.map((c) => `../../public/cards/${d}/${c}.svg`));
    expect(files.sort()).toEqual(expected.sort());
    expect(cardImageUrl('h-10', 'french')).toBe('cards/french/h-10.svg');
  });
```

Jeśli Vite nie chce globować katalogu `public/` (ostrzeżenie albo pusta lista), dodaj do wzorca zapytanie `{ query: '?url' }`. Gdy to nie pomoże, przenieś sprawdzenie kompletu plików do kroku 1 (`ls … | wc -l`) i opisz to w raporcie.

- [ ] **Step 4: Test strony „O kartach”**

```tsx
// src/ui/AboutCardsPage.test.tsx
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { AppRoutes } from './App';

describe('strona „O kartach”', () => {
  it('stopka prowadzi do strony z atrybucją obu talii', () => {
    renderWithProviders(<AppRoutes />);
    expect(screen.getByRole('link', { name: 'O kartach i licencjach' })).toHaveAttribute('href', '/o-kartach');
  });

  it('podaje autora, licencję i źródło każdej talii', () => {
    renderWithProviders(<AppRoutes />, { route: '/o-kartach' });
    expect(screen.getByRole('heading', { name: 'O kartach' })).toBeInTheDocument();
    expect(screen.getByText(/Gunter Gerhardt/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CC BY-SA 3.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/3.0/');
    expect(screen.getByText(/Adrian Kennard/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Źródło w Wikimedia Commons' })).toHaveLength(2);
  });
});
```

- [ ] **Step 5: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/cards src/ui`
Expected: FAIL (brak `img`, `cardImageUrl`, trasy i stopki).

- [ ] **Step 6: Implementacja karty**

W `src/cards/PlayingCard.tsx`:
- dodaj import `useState` z `react` i typ `DeckKind` (z tego samego źródła co w `deckCredits.ts`);
- dodaj eksport:
  ```ts
  /** Ścieżka względna — działa przy `base: './'` także w podkatalogu GitHub Pages. */
  export function cardImageUrl(card: CardId, deck: DeckKind): string {
    return `cards/${deck}/${card}.svg`;
  }
  ```
- w `PlayingCard` zamień `const face = <CardFace card={card} />;` na
  ```tsx
  const face = <CardImage key={`${ctx.deck}-${card}`} card={card} deck={ctx.deck} />;
  ```
  oraz dodaj komponent:
  ```tsx
  /** Grafika z Wikimedia; gdy się nie wczyta — karta rysowana w kodzie (CardFace). */
  function CardImage({ card, deck }: { card: CardId; deck: DeckKind }) {
    const [failed, setFailed] = useState(false);
    if (failed) return <CardFace card={card} />;
    return (
      <img className="card__img" src={cardImageUrl(card, deck)} alt="" draggable={false} onError={() => setFailed(true)} />
    );
  }
  ```

Klucz `key` z talią i kartą resetuje stan `failed` przy zmianie talii albo karty. Obrazek ma `alt=""`, bo nazwę karty niesie `aria-label` przycisku albo `span role="img"`.

W `src/styles.css`, pod regułą `.card__svg`, dodaj:

```css
.card__img {
  display: block; width: 100%; aspect-ratio: 2 / 3; object-fit: contain;
  border-radius: 6px; background: #fff;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.35));
  -webkit-user-drag: none; user-select: none;
}
```

Proporcje 2:3 to te same proporcje co zapasowy SVG (60 × 90). Karty niemieckie (0,64) i francuskie (0,71) mieszczą się w nich dzięki `object-fit: contain`, więc wysokość ręki się nie zmienia.

- [ ] **Step 7: Strona „O kartach”, trasa i stopka**

```tsx
// src/ui/AboutCardsPage.tsx
import { DECK_CREDITS } from '../cards/deckCredits';

export function AboutCardsPage() {
  return (
    <div className="about-cards">
      <h1>O kartach</h1>
      <p>Grafiki kart pochodzą z Wikimedia Commons. Dziękujemy autorom za udostępnienie ich na wolnych licencjach.</p>
      {DECK_CREDITS.map((credit) => (
        <section key={credit.deck} className="about-cards__deck">
          <h2>{credit.name}</h2>
          <dl>
            <dt>Autor</dt>
            <dd>{credit.author}</dd>
            <dt>Licencja</dt>
            <dd>
              <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
                {credit.license}
              </a>
            </dd>
            <dt>Zmiany</dt>
            <dd>{credit.changes}</dd>
          </dl>
          <p>
            <a href={credit.source} target="_blank" rel="noreferrer">
              Źródło w Wikimedia Commons
            </a>
          </p>
        </section>
      ))}
      <p>Grafiki talii Altenburg można rozpowszechniać dalej na tej samej licencji (CC BY-SA 3.0). Rewers kart i pozostała grafika aplikacji są częścią aplikacji.</p>
    </div>
  );
}
```

W `src/ui/App.tsx` dodaj import i trasę przed `path="*"`:

```tsx
          <Route path="/o-kartach" element={<AboutCardsPage />} />
```

W `src/ui/Layout.tsx` dodaj stopkę pod `<main>`:

```tsx
      <footer className="app-footer">
        <Link to="/o-kartach">O kartach i licencjach</Link>
      </footer>
```

W `src/styles.css` dopisz:

```css
.app-footer { text-align: center; padding: 24px 16px 32px; font-size: 0.85rem; color: var(--muted); }
.app-footer a { color: inherit; }
.about-cards dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; margin: 8px 0; }
.about-cards dt { font-weight: 600; }
.about-cards dd { margin: 0; overflow-wrap: anywhere; }
```

- [ ] **Step 8: Uruchom testy**

Run: `npm test -- --run && npm run typecheck && npm run build`
Expected: PASS. Build kopiuje `public/cards` do `dist/cards`, co potwierdza `ls dist/cards/altenburg | wc -l`, dające 32.

- [ ] **Step 9: Commit**

```bash
git add scripts/fetch-cards.mjs public/cards src/vite-env.d.ts src/cards src/ui src/styles.css
git commit -m "feat(cards): grafiki kart z Wikimedia Commons, zapasowy rysunek i strona „O kartach”"
```

---

### Task 5: Test E2E (Playwright, widok telefonu)

**Pliki:**
- Utwórz: `playwright.config.ts`, `e2e/course.spec.ts`
- Modyfikuj: `package.json`, `vite.config.ts`, `.gitignore`

- [ ] **Step 1: Instalacja**

Run: `npm install -D @playwright/test && npx playwright install chromium`
Expected: pakiet w `devDependencies` i pobrana przeglądarka Chromium.

- [ ] **Step 2: Konfiguracja**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/',
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    locale: 'pl-PL',
  },
  projects: [{ name: 'telefon', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

`package.json`, w `scripts`: `"e2e": "playwright test"`.

`vite.config.ts`: Vitest nie może zbierać plików `e2e/*.spec.ts`. Dodaj import `configDefaults` z `vitest/config`, a w `test` pole:

```ts
    exclude: [...configDefaults.exclude, 'e2e/**'],
```

`.gitignore`: dopisz `test-results/` i `playwright-report/`.

Pliki `e2e/` i `playwright.config.ts` nie trafiają do `tsconfig.json` (`include` zostaje bez zmian). Playwright kompiluje je sam, a ich typy zależą od `@types/node`, którego projekt nie używa.

- [ ] **Step 3: Testy E2E**

```ts
// e2e/course.spec.ts
import { expect, test, type Page } from '@playwright/test';

const noHorizontalScroll = async (page: Page) => {
  const { scroll, client } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(scroll).toBeLessThanOrEqual(client);
};

test('lekcja 1: od teorii do zaliczenia i odblokowania lekcji 2; postęp po przeładowaniu', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Kurs skata' })).toBeVisible();
  await noHorizontalScroll(page);
  await page.getByRole('link', { name: 'Zacznij naukę' }).click();

  await expect(page.getByRole('heading', { name: 'Lekcja 1: Czym jest skat?' })).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Dalej' }).click();

  for (const answer of ['3', '61', '120', 'Razem, jako drużyna']) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await expect(page.getByText('Dobrze!')).toBeVisible();
    await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'Lekcja zaliczona!' })).toBeVisible();
  await noHorizontalScroll(page);

  await page.getByRole('link', { name: 'Następna lekcja' }).click();
  await expect(page.getByRole('heading', { name: 'Lekcja 2: Talia' })).toBeVisible();

  await page.reload();
  await page.goto('./#/');
  await expect(page.getByRole('link', { name: 'Kontynuuj' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Czym jest skat\?.*Zaliczona/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Talia.*Dostępna/ })).toBeVisible();
});

test('karty: grafiki obu talii wczytują się, układ mieści się w 375 px', async ({ page }) => {
  await page.goto('./#/ustawienia');
  const images = page.locator('img.card__img');
  await expect(images).toHaveCount(4);
  for (const img of await images.all()) {
    await expect(img).toHaveAttribute('src', /cards\/altenburg\//);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await noHorizontalScroll(page);

  await page.getByLabel('Francuska').check();
  await expect(images.first()).toHaveAttribute('src', /cards\/french\//);
  await expect.poll(() => images.first().evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);

  await page.getByRole('link', { name: 'O kartach i licencjach' }).click();
  await expect(page.getByRole('heading', { name: 'O kartach' })).toBeVisible();
  await noHorizontalScroll(page);
});
```

Uwaga do pierwszego testu:
- dostępna nazwa linku lekcji na mapie składa się z numeru, tytułu, opisu i statusu (zob. `LessonItem` w `CourseMap.tsx`), stąd wyrażenia regularne;
- jeśli `Talia` dopasuje też inny link, zawęź wzorzec (np. `/^2.*Talia/`).

- [ ] **Step 4: Uruchom E2E**

Run: `npm run e2e`
Expected: 2 passed.

Jeśli jakiś test nie przechodzi przez różnicę w nazwach dostępnych (np. inny tekst przycisku), dopasuj selektor do rzeczywistego UI. Nie zmieniaj UI pod test. Opisz takie poprawki w raporcie.

Run też: `npm test -- --run`. Expected: PASS (Vitest nie zbiera plików `e2e/`).

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e package.json package-lock.json vite.config.ts .gitignore
git commit -m "test(e2e): przejście lekcji i grafiki kart w widoku telefonu (Playwright)"
```

---

### Task 6: Wdrożenie na GitHub Pages i README

**Pliki:**
- Utwórz: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Workflow**

```yaml
# .github/workflows/deploy.yml
name: Testy i wdrożenie

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run e2e
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        if: github.event_name != 'pull_request'
        with:
          path: dist

  deploy:
    if: github.event_name != 'pull_request'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Uwagi:
- `npm run e2e` buduje stronę sam (przez `webServer`). Drugi build tworzy świeży `dist` do publikacji.
- Wymóg `engines.node >=22.4` spełnia Node 22 w CI (najnowsze wydanie 22.x).

Sprawdź składnię lokalnie:

Run: `node -e "const y=require('fs').readFileSync('.github/workflows/deploy.yml','utf8'); if(/\t/.test(y)) throw new Error('tabulatory w YAML'); console.log('ok')"`
Expected: `ok`. Jeśli dostępne jest `npx --yes yaml-lint` albo `actionlint`, możesz ich użyć, ale nie jest to wymagane.

- [ ] **Step 2: README**

````markdown
# Trener skata

Kurs skata po polsku — od podstaw do taktyki — z ćwiczeniami w przeglądarce. Bez logowania; postęp zapisuje się lokalnie (localStorage).

## Uruchomienie

```bash
npm install
npm run dev        # serwer deweloperski (http://localhost:5173)
npm test           # testy jednostkowe i treści (Vitest)
npm run e2e        # test E2E w widoku telefonu (Playwright; pierwszy raz: npx playwright install chromium)
npm run build      # wersja produkcyjna w dist/
npm run texts -- m1-l01   # podgląd tekstów lekcji we wszystkich wariantach talii i języka
```

Wymagany Node.js 22.4 lub nowszy.

## Wdrożenie (GitHub Pages)

1. Utwórz repozytorium na GitHubie i wypchnij gałąź `main`.
2. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Każde wypchnięcie na `main` uruchamia workflow „Testy i wdrożenie” (`.github/workflows/deploy.yml`): testy, E2E, build i publikację. Adres strony pojawi się w podsumowaniu zadania `deploy`.

Aplikacja używa `HashRouter` i ścieżek względnych (`base: './'`), więc działa w podkatalogu Pages bez dodatkowej konfiguracji.

## Treść kursu

- Lekcje: `src/content/lessons/` (dane typowane; test treści sprawdza je silnikiem gry).
- Słownik terminów (oficjalne / potoczne): `src/glossary/terms.ts`, nazwy kart: `src/glossary/cardNames.ts`.
- Specyfikacja: `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`.

## Grafiki kart

Grafiki pochodzą z Wikimedia Commons (szczegóły na stronie „O kartach” w aplikacji i w `src/cards/deckCredits.ts`):

- talia Altenburg — Gunter Gerhardt (XSkat), wersja SVG: Mfrasca, licencja [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/);
- talia francuska — Adrian Kennard, [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

Pliki pobiera skrypt `node scripts/fetch-cards.mjs`.
````

- [ ] **Step 3: Pełna weryfikacja**

Run: `npm run typecheck && npm test -- --run && npm run e2e && npm run build`
Expected: wszystko PASS.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: testy, E2E i wdrożenie na GitHub Pages; README"
```

- [ ] **Step 5 (kontroler, nie wykonawca): sprawdzenie w przeglądarce**

W panelu przeglądarki (serwer `skat-dev`):
1. Zapisz wartości `localStorage['skat-trener:v1']` i `localStorage['skat-trener:v1:backup']` i po teście przywróć je dokładnie.
2. Obejrzyj karty obu talii w ustawieniach, w lekcji z ręką i w mini-rozdaniu (lekcja 11). Sprawdź, czy grafiki są czytelne w szerokości 375 px i czy ręka się nie rozjeżdża.
3. Sprawdź lekcje 31 i 32 w obu rejestrach oraz stronę „O kartach”.

Wypchnięcie do GitHuba i włączenie Pages należy do właściciela projektu (README, sekcja „Wdrożenie”).
