# Trener skata — Plan 5: taktyka obrońców, kontra i re (moduł 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Moduł 6 „Taktyka obrońców” (lekcje 26–30): wyjście obrońcy, dokładanie oczek partnerowi, liczenie w trakcie gry, obrona przed nullem i kontra z re. Do tego kontra/re w silniku wyceny oraz trzy rozszerzenia mini-rozdań:
- **punkty kontrolne**, czyli pytania w trakcie gry z odpowiedzią liczoną na żywo;
- **gra otwarta**, w której karty rozgrywającego leżą odkryte;
- **błędne rozegrania** sprawdzane w teście treści: typowy błąd musi rzeczywiście przegrywać.

**Architecture:**
- `settle` dostaje parametr `doubling` (`'kontra'` ×2, `'re'` ×4).
- `MiniDealExerciseData` dostaje opcjonalne pola `checkpoints`, `ouvert` i `mistakes`.
- Logika punktów kontrolnych (poprawna odpowiedź i warianty do wyboru) jest czystym kodem w `src/content/miniDeal.ts`. Walidator sprawdza strukturę i symuluje błędne rozegrania.
- Komponent `MiniDealExercise` wstrzymuje grę na czas pytania i pokazuje karty rozgrywającego w grze otwartej.

**Ustalenia ze źródeł:**
- **„Krótka droga — długi kolor”** (*kurzer Weg, lange Farbe*): gdy rozgrywający gra zaraz po wychodzącym obrońcy, ten wychodzi w swój długi kolor (nie w atu). Partner siedzi za rozgrywającym i może przebić albo dołożyć oczka.
- **„Długa droga — krótki kolor”**: gdy rozgrywający gra jako ostatni, obrońca wychodzi w krótki kolor, najlepiej z pojedynczej karty.
- Źródła traktują obie zasady jako wskazówkę, nie żelazną regułę: skatinsel.academy, euroskat.com, online-skatclub.de, skatstube.de.
- **Kontra/re** nie należą do ISkO. Gra się z nimi w ligach i przy wielu stołach, ale szczegóły (kto i kiedy może kontrować) się różnią. Typowo kontra podwaja wartość gry, a re ją czterokrotnie podnosi; kontrę mówi się przed pierwszą kartą. Lekcja 30 przedstawia to uczciwie jako dodatek do zasad.

**Rozdania** wyszukano skryptem na silniku i botach, a potem potwierdzono na dokładnych danych (kolejność kart w ręce ma znaczenie dla botów):
- **Lekcja 28:** obrońcy wygrywają 62 oczkami.
- **Lekcja 29 (null otwarty):** dwa wyjścia w kier (10, potem walet) łapią rozgrywającego z kierami 7–D–A. Naiwne „zawsze najniższa karta” przegrywa.
- **Sekwencje błędów do lekcji 22 i 24** (asy przed atu): 52 i 28 oczek, czyli przegrane.

**Tech Stack:** jak w Planach 1–4.

**Konwencje:** jak w Planach 1–4 (commit z `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, punktowe zmiany w danych słownika, teksty neutralne płciowo, polecenia w `/Users/gkocur/skat`). Słowo „lewa” zawsze przez token `[[lewa:…]]`; alternatywę `{…|…}` stosujemy tylko tam, gdzie przymiotnik lub zaimek musi się zgadzać z rodzajem. Po każdej lekcji uruchom `npm run texts -- <prefiks>` i przejrzyj gramatykę we wszystkich 4 kontekstach.

---

## Struktura plików (zmiany w Planie 5)

```
src/engine/scoring.ts            ZMIANA: Doubling, settle({ doubling })
src/glossary/terms.ts            ZMIANA (punktowo): szmirowanie
src/content/types.ts             ZMIANA: QuizVerify settle.doubling; MiniDealCheckpoint; ouvert, checkpoints, mistakes
src/content/verify.ts            ZMIANA: doubling w settle
src/content/miniDeal.ts          ZMIANA: simulateMiniDeal(ex, line), checkpointAnswer, checkpointOptions
src/content/validate.ts          ZMIANA: walidacja checkpoints/ouvert/mistakes
src/exercises/MiniDealExercise.tsx  ZMIANA (całość): punkty kontrolne, gra otwarta
src/styles.css                   ZMIANA: style pytań i odkrytych kart
src/content/lessons/m5-l22-atu.ts, m5-l24-grand.ts   ZMIANA: mistakes
src/content/lessons/m6-l26-wyjscie.ts … m6-l30-kontra.ts   NOWE (5 lekcji)
src/content/course.ts            ZMIANA: moduł m6
docs/superpowers/specs/…-design.md  ZMIANA: sekcje 8.3 i 9
```

---

### Task 1: Kontra i re w wycenie; termin „szmirowanie”

**Files:**
- Modify: `src/engine/scoring.ts`, `src/content/types.ts`, `src/content/verify.ts`, `src/glossary/terms.ts`
- Test: `src/engine/scoring.test.ts`, `src/content/verify.test.ts` (dopisane testy)

- [ ] **Step 1: Dopisz testy**

W `src/engine/scoring.test.ts` (nowy `describe` na końcu pliku, korzysta z istniejących `decl`, `hearts`, `HEARTS_WITH_2`):

```ts
describe('kontra i re', () => {
  const outcome = (points: number, tricks: number) => ({ declarerPoints: points, declarerTricks: tricks });
  it('kontra podwaja, re czterokrotnie zwiększa wartość', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), doubling: 'kontra' })).toMatchObject({ won: true, value: 60, score: 60 });
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), doubling: 're' })).toMatchObject({ value: 120 });
  });
  it('przegrana z kontrą liczona podwójnie od podwojonej wartości', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(55, 4), doubling: 'kontra' })).toMatchObject({ won: false, value: 60, score: -120 });
  });
  it('null z kontrą i punkty turniejowe', () => {
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: outcome(0, 0), doubling: 'kontra' })).toMatchObject({ value: 46, score: 46 });
    const won = settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), doubling: 'kontra' });
    expect(tournamentPoints(won)).toEqual({ declarer: 110, eachDefender: 0 });
  });
});
```

W `src/content/verify.test.ts` (wewnątrz `describe('verifyQuiz', …)`):

```ts
  it('rozliczenie z kontrą', () => {
    const q = quiz({
      cards: [...HEARTS_WITH_2],
      options: [{ id: 'a', text: '60' }, { id: 'b', text: '30' }],
      verify: {
        kind: 'settle',
        declaration: { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' },
        outcome: { declarerPoints: 75, declarerTricks: 6 },
        doubling: 'kontra',
        result: 'value',
      },
    });
    expect(verifyQuiz(q)).toEqual([]);
  });
```

- [ ] **Step 2: Uruchom testy i sprawdź, że nie przechodzą**

Run: `npx vitest run src/engine/scoring.test.ts src/content/verify.test.ts`
Expected: FAIL (`doubling` nieznane albo wartość bez podwojenia).

- [ ] **Step 3: Silnik — `src/engine/scoring.ts`**

Pod definicją `Announcement` dodaj:

```ts
/** Kontra (×2) i re (×4) — dodatek spoza ISkO, typowy w ligach i przy wielu stołach. */
export type Doubling = 'kontra' | 're';
const DOUBLING_FACTOR: Record<Doubling, number> = { kontra: 2, re: 4 };
```

W `SettleInput` dodaj pole:

```ts
  /** Kontra/re: mnoży wartość gry (także przelicytowanej i nulla). */
  doubling?: Doubling;
```

W `settle`:
- zmień sygnaturę na `export function settle({ declaration: d, declarerCards, outcome, bid, doubling }: SettleInput): Settlement {`;
- tuż po sprawdzeniu poprawności wyniku dodaj `const factor = doubling ? DOUBLING_FACTOR[doubling] : 1;`;
- w gałęzi nulla zmień `const value = nullValue(d);` na `const base = nullValue(d);`. Sprawdzanie stawki zostaw na `base` (`bid > base`, w komunikacie `(${base})`), a dalej użyj `const value = base * factor;`;
- na końcu (po bloku przelicytowania, przed `return`) dodaj `value *= factor;`.

- [ ] **Step 4: Treść — typy i weryfikacja**

W `src/content/types.ts` dodaj `Doubling` do importu z `'../engine'`. W wariancie `settle` unii `QuizVerify` dodaj `doubling?: Doubling;` (między `bid?: number;` a `result`). W `src/content/verify.ts` w `case 'settle'` przekaż `doubling: verify.doubling` do `settle(…)`.

- [ ] **Step 5: Słownik — termin „szmirowanie”**

W `src/glossary/terms.ts` dopisz przed zamykającym `};` obiektu `TERMS` (po ostatnim wpisie):

```ts
  szmirowanie: plain({
    official: { M: 'dokładanie', g: 'n', D: 'dokładania', B: 'dokładanie', N: 'dokładaniem', Ms: 'dokładaniu' },
    colloquial: { M: 'szmirowanie', g: 'n', D: 'szmirowania', B: 'szmirowanie', N: 'szmirowaniem', Ms: 'szmirowaniu' },
  }),
```

- [ ] **Step 6: Uruchom testy**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/engine src/content src/glossary
git commit -m "feat(engine): kontra i re w wycenie gry; termin szmirowanie" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Mini-rozdania — punkty kontrolne, gra otwarta, błędne rozegrania

**Files:**
- Modify: `src/content/types.ts`, `src/content/miniDeal.ts`, `src/content/validate.ts`, `src/content/lessons/m5-l22-atu.ts`, `src/content/lessons/m5-l24-grand.ts`
- Test: `src/content/miniDeal.test.ts`, `src/content/validate.test.ts` (dopisane testy)

- [ ] **Step 1: Typy — `src/content/types.ts`**

Nad `MiniDealExerciseData` dodaj:

```ts
/** Pytanie w trakcie mini-rozdania, zadawane po zakończeniu lewy `afterTrick`; odpowiedź liczona na żywo. */
export type CheckpointAsk = 'yourPoints' | 'trumpsPlayed';

export interface MiniDealCheckpoint {
  afterTrick: number;
  ask: CheckpointAsk;
}
```

W `MiniDealExerciseData` po `goal: MiniDealGoal;` dodaj:

```ts
  /** Pytania w trakcie gry; ćwiczenie zaliczone tylko przy celu osiągniętym i wszystkich dobrych odpowiedziach. */
  checkpoints?: MiniDealCheckpoint[];
  /** Gra otwarta: karty rozgrywającego są widoczne (tylko gdy gracz nie jest rozgrywającym). */
  ouvert?: boolean;
  /** Typowe błędne rozegrania gracza — test treści sprawdza, że NIE osiągają celu. */
  mistakes?: CardId[][];
```

- [ ] **Step 2: Dopisz testy logiki**

W `src/content/miniDeal.test.ts` zmień import na `import { checkpointAnswer, checkpointOptions, isGoalReached, simulateMiniDeal, startMiniDeal, teamPoints } from './miniDeal';` i dopisz w `describe`:

```ts
  it('symulacja dowolnej linii gracza', () => {
    expect(simulateMiniDeal(exercise, ['c-A', 'c-J'])).toMatchObject({ error: null });
  });

  it('odpowiedzi punktów kontrolnych liczone na żywo', () => {
    let state = startMiniDeal(exercise);
    for (const card of ['c-J', 'c-7', 'c-8'] as const) state = playCard(state, card);
    expect(checkpointAnswer(exercise, state, 'yourPoints')).toBe(2);
    expect(checkpointAnswer(exercise, state, 'trumpsPlayed')).toBe(1);
  });

  it('warianty odpowiedzi: poprawna i dwie inne, bez liczb ujemnych', () => {
    expect(checkpointOptions(2, 'yourPoints')).toEqual([2, 12, 22]);
    expect(checkpointOptions(35, 'yourPoints')).toEqual([25, 35, 45]);
    expect(checkpointOptions(0, 'trumpsPlayed')).toEqual([0, 1, 2]);
    expect(checkpointOptions(4, 'trumpsPlayed')).toEqual([3, 4, 5]);
  });
```

W `src/content/validate.test.ts`, w teście „mini-rozdanie: wzorcowe rozegranie musi osiągać cel” (zmienna `deal`), dopisz na końcu:

```ts
    expect(validateCourse(courseWith(lessonWith([{ ...deal, mistakes: [['c-J', 'c-A']] }])))).toEqual([
      'l1/d1: błędne rozegranie 1 osiąga cel',
    ]);
    expect(validateCourse(courseWith(lessonWith([{ ...deal, checkpoints: [{ afterTrick: 2, ask: 'yourPoints' }] }])))).toEqual([
      'l1/d1: punkt kontrolny po lewie 2 musi być między 1 a 1',
    ]);
    expect(validateCourse(courseWith(lessonWith([{ ...deal, ouvert: true }])))).toEqual([
      'l1/d1: gra otwarta ma sens tylko, gdy gracz nie jest rozgrywającym',
    ]);
```

- [ ] **Step 3: Uruchom testy i sprawdź, że nie przechodzą**

Run: `npx vitest run src/content`
Expected: FAIL.

- [ ] **Step 4: Logika — `src/content/miniDeal.ts`**

Dodaj `isTrump` do importu z `'../engine'`, `CheckpointAsk` do importu typów z `'./types'`. Zmień `simulateMiniDeal`, żeby przyjmowała linię gracza, i dopisz funkcje punktów kontrolnych:

```ts
/** Rozgrywa rozdanie: gracz gra `line` (domyślnie `solution`), reszta — boty ćwiczenia. */
export function simulateMiniDeal(
  ex: MiniDealExerciseData,
  line: readonly CardId[] = ex.solution,
): { error: string | null; goalReached: boolean } {
  const bots = miniDealBots(ex);
  let state = startMiniDeal(ex);
  let next = 0;
  while (!isDealOver(state)) {
    const seat = currentPlayer(state);
    let card: CardId | undefined;
    if (seat === ex.you) {
      card = line[next++];
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

/** Poprawna odpowiedź na pytanie w trakcie gry, dla bieżącego stanu rozdania. */
export function checkpointAnswer(ex: MiniDealExerciseData, state: DealState, ask: CheckpointAsk): number {
  if (ask === 'yourPoints') return teamPoints(ex, state).yours;
  return state.tricks.flatMap((trick) => trick.cards).filter((card) => isTrump(card, state.game)).length;
}

/** Trzy warianty do wyboru (rosnąco): poprawny i dwa sąsiednie, bez liczb ujemnych. */
export function checkpointOptions(correct: number, ask: CheckpointAsk): number[] {
  const step = ask === 'yourPoints' ? 10 : 1;
  const candidates = correct - step >= 0 ? [correct - step, correct, correct + step] : [correct, correct + step, correct + 2 * step];
  return candidates.sort((a, b) => a - b);
}
```

(Usuń starą wersję `simulateMiniDeal`.)

- [ ] **Step 5: Walidacja — `src/content/validate.ts`**

Na końcu funkcji `validateMiniDeal` (zastąp jej ostatnie trzy linie z `simulateMiniDeal`) wstaw:

```ts
  const outcome = simulateMiniDeal(ex);
  if (outcome.error) report(outcome.error);
  else if (!outcome.goalReached) report('wzorcowe rozegranie nie osiąga celu');

  (ex.mistakes ?? []).forEach((line, i) => {
    const result = simulateMiniDeal(ex, line);
    if (result.error) report(`błędne rozegranie ${i + 1}: ${result.error}`);
    else if (result.goalReached) report(`błędne rozegranie ${i + 1} osiąga cel`);
  });

  const seen = new Set<number>();
  for (const checkpoint of ex.checkpoints ?? []) {
    if (!Number.isInteger(checkpoint.afterTrick) || checkpoint.afterTrick < 1 || checkpoint.afterTrick > size - 1) {
      report(`punkt kontrolny po lewie ${checkpoint.afterTrick} musi być między 1 a ${size - 1}`);
    }
    if (seen.has(checkpoint.afterTrick)) report(`powtórzony punkt kontrolny po lewie ${checkpoint.afterTrick}`);
    seen.add(checkpoint.afterTrick);
    if (checkpoint.ask === 'trumpsPlayed' && ex.game.kind === 'null') report('w nullu nie ma atu do liczenia');
  }

  if (ex.ouvert && ex.you === ex.declarer) report('gra otwarta ma sens tylko, gdy gracz nie jest rozgrywającym');
```

- [ ] **Step 6: Błędne rozegrania w lekcjach 22 i 24**

W `src/content/lessons/m5-l22-atu.ts` w ćwiczeniu `m5-l22-d1` po `solution` dodaj:

```ts
      mistakes: [['s-A', 'd-A', 'c-9', 'h-Q', 'c-J', 's-J', 'h-A', 'h-K', 'h-10', 'd-9']],
```

W `src/content/lessons/m5-l24-grand.ts` w ćwiczeniu `m5-l24-d1` po `solution` dodaj:

```ts
      mistakes: [['c-A', 'h-Q', 's-J', 's-A', 'c-10', 'd-10', 'c-J', 'c-K', 'c-7', 'c-Q']],
```

(Obie sekwencje pochodzą z symulacji „asy przed atu” na dokładnych rękach z lekcji: 52 i 28 oczek.)

- [ ] **Step 7: Uruchom testy**

Run: `npm test && npm run typecheck`
Expected: PASS (także `course.test.ts`, który sprawdza teraz błędne rozegrania z lekcji 22 i 24).

- [ ] **Step 8: Commit**

```bash
git add src/content
git commit -m "feat(content): punkty kontrolne, gra otwarta i sprawdzane błędne rozegrania w mini-rozdaniach" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Mini-rozdanie w UI — pytania w trakcie gry i karty odkryte

**Files:**
- Modify: `src/exercises/MiniDealExercise.tsx` (całość), `src/styles.css`
- Test: `src/exercises/MiniDealExercise.test.tsx` (dopisane testy)

- [ ] **Step 1: Dopisz testy**

W `src/exercises/MiniDealExercise.test.tsx` (wewnątrz `describe('MiniDealExercise', …)`; korzysta z istniejących `declarerDeal` i `playTwice`):

```tsx
  it('pytanie w trakcie gry: dobra odpowiedź i zaliczenie', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(
      <MiniDealExercise exercise={{ ...declarerDeal, checkpoints: [{ afterTrick: 1, ask: 'yourPoints' }] }} onAnswered={onAnswered} delayMs={0} />,
    );
    await playTwice(user, 'niżnik żołędny');
    const question = await screen.findByRole('group', { name: 'Pytanie w trakcie gry' });
    expect(question).toHaveTextContent('Ile oczek ma teraz twoja strona?');
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('Dobra odpowiedź. Poprawnie: 2.')).toBeInTheDocument();
    await playTwice(user, 'as żołędny');
    expect(await screen.findByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Pytania w trakcie gry: 1 z 1 poprawnie.')).toBeInTheDocument();
    expect(onAnswered).toHaveBeenCalledWith(true);
  });

  it('zła odpowiedź w trakcie gry: ćwiczenie niezaliczone', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(
      <MiniDealExercise exercise={{ ...declarerDeal, checkpoints: [{ afterTrick: 1, ask: 'yourPoints' }] }} onAnswered={onAnswered} delayMs={0} />,
    );
    await playTwice(user, 'niżnik żołędny');
    await screen.findByRole('group', { name: 'Pytanie w trakcie gry' });
    await user.click(screen.getByRole('button', { name: '12' }));
    expect(screen.getByText('Zła odpowiedź. Poprawnie: 2.')).toBeInTheDocument();
    await playTwice(user, 'as żołędny');
    expect(await screen.findByText('Niestety nie.')).toBeInTheDocument();
    expect(onAnswered).toHaveBeenCalledWith(false);
  });

  it('gra otwarta: karty rozgrywającego są widoczne', () => {
    const open: MiniDealExerciseData = {
      ...declarerDeal,
      you: 1,
      ouvert: true,
      hands: [['c-A', 's-A'], ['c-7', 'h-7'], ['c-8', 's-8']],
      solution: ['c-7', 'h-7'],
      goal: { kind: 'minPoints', points: 0 },
    };
    renderWithProviders(<MiniDealExercise exercise={open} onAnswered={vi.fn()} delayMs={10_000} />);
    expect(screen.getByText('Karty rozgrywającego — gra otwarta')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'as zielony' })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Uruchom testy i sprawdź, że nie przechodzą**

Run: `npx vitest run src/exercises/MiniDealExercise.test.tsx`
Expected: FAIL (brak pytania i kart odkrytych).

- [ ] **Step 3: Zastąp `src/exercises/MiniDealExercise.tsx`**

```tsx
// src/exercises/MiniDealExercise.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { CardRow, Hand } from '../cards/Hand';
import { OpponentView } from '../cards/OpponentView';
import { SEAT_LABEL, TrickView } from '../cards/TrickView';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import { checkpointAnswer, checkpointOptions, isGoalReached, miniDealBots, startMiniDeal, teamPoints } from '../content/miniDeal';
import type { CheckpointAsk, MiniDealCheckpoint, MiniDealExerciseData } from '../content/types';
import { currentPlayer, isDealOver, legalMoves, nextSeat, playCard, sortHand, type CardId } from '../engine';
import { countCase } from '../glossary';
import { useText } from '../state/AppStateContext';
import { GameBanner } from './GameBanner';

const ILLEGAL_HINT = 'Tej karty nie możesz teraz zagrać — musisz dołożyć do wyjścia.';

const CHECKPOINT_PROMPT: Record<CheckpointAsk, string> = {
  yourPoints: 'Ile [[oczko:Dlm]] ma teraz twoja strona?',
  trumpsPlayed: 'Ile [[atu:Dlm]] już wyszło?',
};

interface CheckResult {
  afterTrick: number;
  correctValue: number;
  chosen: number;
}

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
  const [seenTricks, setSeenTricks] = useState(0);
  const [selected, setSelected] = useState<CardId | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const bots = useMemo(() => miniDealBots(exercise), [exercise]);
  const reported = useRef(false);

  const over = isDealOver(deal);
  const tricksDone = deal.tricks.length;
  // Pochodne od liczby lew (bez opóźnienia o jeden render), żeby wynik nie mignął przed pokazaniem ostatniej lewy.
  const showLast = tricksDone > seenTricks;
  const pending: MiniDealCheckpoint | undefined =
    !over && !showLast
      ? exercise.checkpoints?.find((c) => c.afterTrick === tricksDone && !checks.some((r) => r.afterTrick === c.afterTrick))
      : undefined;
  const current = currentPlayer(deal);
  const yourTurn = !over && !showLast && !pending && current === you;
  const legal = yourTurn ? legalMoves(deal.hands[you], deal.trick, deal.game) : [];
  const last = deal.tricks[tricksDone - 1];

  // Po zakończonej lewie pokazujemy ją przez chwilę.
  useEffect(() => {
    if (tricksDone <= seenTricks) return;
    const id = setTimeout(() => setSeenTricks(tricksDone), delayMs * 1.5);
    return () => clearTimeout(id);
  }, [tricksDone, seenTricks, delayMs]);

  // Ruch bota (wstrzymany na czas pytania).
  useEffect(() => {
    if (over || showLast || pending || current === you) return;
    const id = setTimeout(
      () =>
        setDeal((d) => {
          if (isDealOver(d)) return d;
          const seat = currentPlayer(d);
          return seat === you ? d : playCard(d, bots[seat](d, seat));
        }),
      delayMs,
    );
    return () => clearTimeout(id);
  }, [deal, over, showLast, pending, current, you, bots, delayMs]);

  const checksOk = checks.every((r) => r.chosen === r.correctValue);
  const reached = over && isGoalReached(exercise, deal) && checksOk;
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
    setDeal((d) =>
      !isDealOver(d) && currentPlayer(d) === you && legalMoves(d.hands[you], d.trick, d.game).includes(card)
        ? playCard(d, card)
        : d,
    );
  };

  const answerCheckpoint = (checkpoint: MiniDealCheckpoint, value: number) => {
    const correctValue = checkpointAnswer(exercise, deal, checkpoint.ask);
    setChecks((list) =>
      list.some((r) => r.afterTrick === checkpoint.afterTrick)
        ? list
        : [...list, { afterTrick: checkpoint.afterTrick, correctValue, chosen: value }],
    );
  };

  const shown =
    deal.trick.length === 0 && showLast && last
      ? { cards: last.cards, leader: last.leader }
      : { cards: deal.trick, leader: deal.leader };

  let status: string;
  if (showLast && last) {
    status = last.winner === you ? t('Bierzesz [[lewa:B]].') : t(`[[Lewa:B]] bierze: ${SEAT_LABEL[last.winner]}.`);
  } else if (over) {
    status = 'Rozdanie zakończone.';
  } else if (pending) {
    status = 'Pauza — odpowiedz na pytanie.';
  } else if (yourTurn) {
    status = deal.trick.length === 0 ? 'Twój ruch — wychodzisz.' : 'Twój ruch.';
  } else {
    status = `Ruch: ${t(SEAT_LABEL[current])}…`;
  }

  const points = teamPoints(exercise, deal);
  const pointsText = (n: number) => `${n} ${t(`[[oczko:${countCase(n)}]]`)}`;
  const lastCheck = checks[checks.length - 1];
  const goodChecks = checks.filter((r) => r.chosen === r.correctValue).length;

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
      {exercise.ouvert && you !== declarer && (
        <div className="mini-deal__open">
          <p className="mini-deal__open-label">{t('Karty [[rozgrywajacy:D]] — [[otwarta]]')}</p>
          <CardRow cards={sortHand(deal.hands[declarer], deal.game)} />
        </div>
      )}
      <TrickView cards={shown.cards} leader={shown.leader} you={you} emptyText="Stół jest pusty." />
      <p className="mini-deal__status" aria-live="polite">
        {status}
      </p>
      {pending && (
        <div className="checkpoint" role="group" aria-label="Pytanie w trakcie gry">
          <p className="checkpoint__prompt">{t(CHECKPOINT_PROMPT[pending.ask])}</p>
          <div className="checkpoint__options">
            {checkpointOptions(checkpointAnswer(exercise, deal, pending.ask), pending.ask).map((value) => (
              <button key={value} type="button" className="option" onClick={() => answerCheckpoint(pending, value)}>
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
      {!pending && lastCheck && (
        <p className="checkpoint__result" role="status">
          {lastCheck.chosen === lastCheck.correctValue ? 'Dobra odpowiedź.' : 'Zła odpowiedź.'} Poprawnie: {lastCheck.correctValue}.
        </p>
      )}
      <p className="mini-deal__score">
        Twoja strona: {pointsText(points.yours)} · druga strona: {pointsText(points.theirs)}
      </p>
      <p className="hint hint--warn" role="status">
        {hint}
      </p>
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
            {checks.length > 0 && (
              <p>
                Pytania w trakcie gry: {goodChecks} z {checks.length} poprawnie.
              </p>
            )}
            <RichText text={exercise.explain} />
          </Feedback>
        )}
      </div>
    </section>
  );
}
```

Uwaga: komunikat stanu używa teraz tokenów `[[lewa:B]]` / `[[Lewa:B]]` zamiast alternatywy (spójnie ze słownikiem).

- [ ] **Step 4: Style — `src/styles.css`**

Przed blokiem `@media (min-width: 600px)` dopisz:

```css
.checkpoint { margin: 12px 0 0; padding: 12px; border: 2px solid var(--accent); border-radius: var(--radius); background: var(--surface); }
.checkpoint__prompt { margin: 0 0 8px; font-weight: 600; text-align: center; }
.checkpoint__options { display: flex; gap: 8px; justify-content: center; }
.checkpoint__options .option { min-width: 64px; text-align: center; }
.checkpoint__result { text-align: center; margin: 8px 0 0; font-weight: 600; }
.mini-deal__open { margin: 4px 0 8px; }
.mini-deal__open-label { text-align: center; color: var(--muted); font-size: 0.85rem; margin: 0; }
```

- [ ] **Step 5: Uruchom testy**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS, bez ostrzeżeń `act(...)`.

- [ ] **Step 6: Commit**

```bash
git add src/exercises src/styles.css
git commit -m "feat(exercises): pytania w trakcie mini-rozdania i gra otwarta" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Lekcje 26–27

**Files:**
- Create: `src/content/lessons/m6-l26-wyjscie.ts`, `src/content/lessons/m6-l27-dokladanie.ts`
- Modify: `src/content/course.ts`

Po dodaniu uruchom `npx vitest run src/content` oraz `npm run texts -- m6-l2` i popraw gramatykę (lista poprawek w raporcie).

- [ ] **Step 1: Lekcja 26**

```ts
// src/content/lessons/m6-l26-wyjscie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const NO_TRUMP_LEAD = 'Nie wychodź w [[atu:B]] — to pomaga [[rozgrywajacy:C]].';

export const lesson: Lesson = {
  id: 'm6-l26-wyjscie',
  title: 'Wyjście [[obronca:D]]',
  summary: 'Krótka droga — długi kolor, długa droga — krótki kolor.',
  steps: [
    {
      title: 'Gdzie siedzi [[rozgrywajacy]]?',
      text:
        'Gdy jako [[obronca]] wychodzisz, ważne jest, gdzie siedzi [[rozgrywajacy]]:\n\n' +
        '• **krótka droga** — [[rozgrywajacy]] gra zaraz po tobie, a twój partner na końcu,\n\n' +
        '• **długa droga** — twój partner gra zaraz po tobie, a [[rozgrywajacy]] na końcu.',
    },
    {
      title: 'Krótka droga — długi kolor',
      text:
        'Gdy [[rozgrywajacy]] siedzi zaraz za tobą, wyjdź w swój **długi kolor** (nie w [[atu:B]]). ' +
        'Twój partner gra po [[rozgrywajacy:Ms]] — zwykle ma mało kart w tym kolorze, więc może przebić albo dołożyć [[oczko:Blm]], widząc już kartę [[rozgrywajacy:D]].',
    },
    {
      title: 'Długa droga — krótki kolor',
      text:
        'Gdy [[rozgrywajacy]] gra jako ostatni, wyjdź w swój **krótki kolor** — najlepiej z pojedynczej karty. ' +
        'Gdy ten kolor wróci, możesz go przebić [[atu:N]] albo dołożyć [[oczko:Blm]] partnerowi.\n\n' +
        'To wskazówka, nie żelazna reguła — ale dobry punkt wyjścia.',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm6-l26-p1',
      prompt:
        '[[Rozgrywajacy]] siedzi zaraz po tobie ([[srodek]]) i gra z [[atu:Nlm]] w kolorze [[suit:c]]. Wychodzisz. Którą kartę zagrać?',
      game: CLUBS,
      leader: 0,
      trick: [],
      hand: ['h-A', 'h-K', 'h-9', 'h-8', 's-10', 'd-7', 'c-9', 'c-8'],
      mode: 'best',
      best: ['h-A', 'h-K', 'h-9', 'h-8'],
      wrongExplain: {
        's-10': 'To krótki kolor — przy krótkiej drodze wychodzi się w długi.',
        'd-7': 'To krótki kolor — przy krótkiej drodze wychodzi się w długi.',
        'c-9': NO_TRUMP_LEAD,
        'c-8': NO_TRUMP_LEAD,
      },
      explain:
        'Krótka droga — długi kolor: twój najdłuższy kolor to [[suit:h]]. Partner gra po [[rozgrywajacy:Ms]] i zobaczy jego kartę, zanim sam zagra.',
    },
    {
      type: 'playCard',
      id: 'm6-l26-p2',
      prompt:
        '[[Rozgrywajacy]] siedzi na końcu ([[zadek]]), twój partner zaraz po tobie. [[Atu]]: [[suit:c]]. Wychodzisz. Którą kartę zagrać?',
      game: CLUBS,
      leader: 0,
      trick: [],
      hand: ['s-7', 'h-K', 'h-Q', 'h-9', 'h-8', 'd-10', 'd-8', 'c-8'],
      mode: 'best',
      best: ['s-7'],
      wrongExplain: {
        'h-K': 'Przy długiej drodze wyjdź w krótki kolor, najlepiej z pojedynczej karty.',
        'h-Q': 'Przy długiej drodze wyjdź w krótki kolor, najlepiej z pojedynczej karty.',
        'h-9': 'Przy długiej drodze wyjdź w krótki kolor, najlepiej z pojedynczej karty.',
        'h-8': 'Przy długiej drodze wyjdź w krótki kolor, najlepiej z pojedynczej karty.',
        'd-10': 'Dziesiątka bez [[as:D]] łatwo przepada — a twój najkrótszy kolor to [[suit:s]].',
        'd-8': 'Masz krótszy kolor: [[suit:s]] — tylko jedna karta.',
        'c-8': NO_TRUMP_LEAD,
      },
      explain:
        'Długa droga — krótki kolor: [[card:s-7]] to twoja jedyna karta w kolorze [[suit:s]]. Gdy ten kolor wróci, możesz go przebić [[atu:N]].',
    },
    {
      type: 'quiz',
      id: 'm6-l26-q1',
      prompt: 'Twój partner gra zaraz po tobie, a [[rozgrywajacy]] na końcu. Jak nazywa się ta sytuacja?',
      options: [
        { id: 'a', text: 'Krótka droga' },
        { id: 'b', text: 'Długa droga' },
      ],
      correct: 'b',
      explain: 'Do [[rozgrywajacy:D]] jest „daleko” — gra jako ostatni. To długa droga: wychodzi się w krótki kolor.',
    },
    {
      type: 'quiz',
      id: 'm6-l26-q2',
      prompt: 'Przy „krótkiej drodze” kto gra zaraz po tobie?',
      options: [
        { id: 'a', text: '[[Rozgrywajacy]]' },
        { id: 'b', text: 'Twój partner' },
      ],
      correct: 'a',
      explain: 'Krótka droga: [[rozgrywajacy]] gra zaraz po tobie, a twój partner — za nim.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 27**

```ts
// src/content/lessons/m6-l27-dokladanie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm6-l27-dokladanie',
  title: '[[Szmirowanie]] oczek partnerowi',
  summary: 'Dokładaj [[oczko:Blm]] tam, gdzie [[lewa:B]] na pewno bierze partner.',
  steps: [
    {
      title: 'Gdy [[lewa:B]] bierze partner',
      text:
        'Jeśli wiadomo, że [[lewa:B]] bierze twój partner, dołóż do niej jak najwięcej [[oczko:Dlm]] — dziesiątkę albo [[as:B]]. Wszystkie oczka w niej liczą się dla waszej strony.',
    },
    {
      title: 'Tylko gdy to pewne',
      text:
        'Dokładaj dopiero wtedy, gdy [[rozgrywajacy]] już zagrał albo na pewno nie przebije. Jeśli [[rozgrywajacy]] gra po tobie, może wziąć [[lewa:B]] razem z twoimi oczkami.',
    },
    {
      title: 'Gdy bierze [[rozgrywajacy]]',
      text: 'Gdy [[lewa:B]] i tak weźmie [[rozgrywajacy]], dołóż kartę bez wartości.',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm6-l27-p1',
      prompt:
        'Grasz w obronie. [[Rozgrywajacy]] ([[przodek]]) wyszedł [[card:s-9:N]], partner dołożył [[card:s-A:B]]. Grasz jako ostatni. Którą kartę dołożyć?',
      game: HEARTS,
      leader: 0,
      trick: ['s-9', 's-A'],
      hand: ['s-10', 's-7', 'c-8', 'd-9'],
      mode: 'best',
      best: ['s-10'],
      wrongExplain: { 's-7': 'Partner na pewno bierze [[lewa:B]] — dołóż mu 10 [[oczko:Dlm]].' },
      explain: '[[Card:s-10]] daje waszej stronie 10 [[oczko:Dlm]] więcej, a ryzyka nie ma — wszyscy już zagrali.',
    },
    {
      type: 'playCard',
      id: 'm6-l27-p2',
      prompt:
        'Partner ([[przodek]]) wyszedł [[card:d-A:N]]. Po tobie zagra jeszcze [[rozgrywajacy]] — może nie mieć koloru [[suit:d]] i przebić. Którą kartę dołożyć?',
      game: HEARTS,
      leader: 0,
      trick: ['d-A'],
      hand: ['d-10', 'd-7', 'c-9', 's-8'],
      mode: 'best',
      best: ['d-7'],
      wrongExplain: {
        'd-10': 'Jeśli [[rozgrywajacy]] przebije, twoja dziesiątka przepadnie. Dokładaj dopiero, gdy {lewa jest pewna|sztych jest pewny}.',
      },
      explain: 'Dołóż [[card:d-7:B]] — dziesiątkę zachowasz na pewniejszą okazję.',
    },
    {
      type: 'playCard',
      id: 'm6-l27-p3',
      prompt:
        '[[Rozgrywajacy]] ([[przodek]]) wyszedł [[card:c-A:N]], partner dołożył [[card:c-7:B]]. Nie masz koloru [[suit:c]] ani [[atu:Dlm]]. Którą kartę oddać?',
      game: HEARTS,
      leader: 0,
      trick: ['c-A', 'c-7'],
      hand: ['s-10', 's-8', 'd-K', 'd-7'],
      mode: 'best',
      best: ['s-8', 'd-7'],
      wrongExplain: {
        's-10': '10 [[oczko:Dlm]] dla [[rozgrywajacy:D]] — oddaj kartę bez wartości.',
        'd-K': '4 [[oczko:Mlm]] dla [[rozgrywajacy:D]] — oddaj kartę bez wartości.',
      },
      explain: '[[Lewa:B]] bierze [[rozgrywajacy]] — nie dokładaj mu żadnych [[oczko:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'm6-l27-q1',
      prompt: 'Kiedy dołożyć partnerowi dziesiątkę?',
      options: [
        { id: 'a', text: 'Gdy na pewno bierze [[lewa:B]]' },
        { id: 'b', text: 'Zawsze, gdy partner wychodzi' },
        { id: 'c', text: 'Nigdy' },
      ],
      correct: 'a',
      explain: 'Oczka dokłada się tylko do [[lewa:D]], którą partner na pewno weźmie — inaczej mogą trafić do [[rozgrywajacy:D]].',
    },
  ],
};
```

- [ ] **Step 3: Dodaj moduł 6 do kursu**

W `src/content/course.ts` dodaj importy `l26`, `l27` i po module `m5` dopisz:

```ts
    { id: 'm6', title: 'Taktyka obrońców', lessons: [l26, l27] },
```

- [ ] **Step 4: Testy i przegląd tekstów**

Run: `npx vitest run src/content && npm test && npm run typecheck && npm run texts -- m6-l2`
Expected: testy PASS. Teksty przejrzane, a poprawki gramatyczne opisane w raporcie.

- [ ] **Step 5: Commit**

```bash
git add src/content
git commit -m "feat(content): lekcje 26–27 — wyjście obrońcy, szmirowanie" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Lekcje 28–30 i specyfikacja

**Files:**
- Create: `src/content/lessons/m6-l28-liczenie.ts`, `src/content/lessons/m6-l29-null-obrona.ts`, `src/content/lessons/m6-l30-kontra.ts`
- Modify: `src/content/course.ts`, `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`

- [ ] **Step 1: Lekcja 28**

```ts
// src/content/lessons/m6-l28-liczenie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm6-l28-liczenie',
  title: 'Liczenie w trakcie gry',
  summary: 'Ile mamy [[oczko:Dlm]]? Ile [[atu:Dlm]] już wyszło?',
  steps: [
    {
      title: 'Licz [[oczko:Blm]]',
      text:
        'Dobry gracz w każdej chwili wie, ile [[oczko:Dlm]] ma jego strona. [[Obronca:Mlm]] potrzebują 60 — wtedy [[rozgrywajacy]] przegrywa.',
    },
    {
      title: 'Licz [[atu:Blm]]',
      text: 'W [[graKolorowa:Ms]] jest 11 [[atu:Dlm]]. Licząc, ile już wyszło, wiesz, ile jeszcze jest w grze.',
    },
    {
      title: 'Pauzy w rozdaniu',
      text:
        'W tym rozdaniu gra kilka razy się zatrzyma i padnie pytanie. Odpowiadaj z pamięci — liczy się wynik rozdania i poprawne odpowiedzi.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm6-l28-q1',
      prompt: 'Ile [[oczko:Dlm]] potrzebują [[obronca:Mlm]], żeby [[rozgrywajacy]] przegrał?',
      options: [
        { id: 'a', text: '59' },
        { id: 'b', text: '60' },
        { id: 'c', text: '61' },
      ],
      correct: 'b',
      explain: '[[Rozgrywajacy]] potrzebuje 61 — przy 60 [[oczko:Mslm]] [[obronca:Dlm]] już przegrywa.',
    },
    {
      type: 'miniDeal',
      id: 'm6-l28-d1',
      prompt:
        'Grasz w obronie przeciwko grze z [[atu:Nlm]] w kolorze [[suit:h]]. Pilnuj liczby [[oczko:Dlm]] i [[atu:Dlm]] — w trakcie gry padną pytania.',
      game: HEARTS,
      declarer: 2,
      you: 0,
      hands: [
        ['h-J', 'h-A', 'h-10', 'h-Q', 'c-A', 'c-10', 'c-Q', 's-K', 'd-K', 'd-Q'],
        ['c-J', 'h-9', 'c-K', 'c-8', 's-10', 's-Q', 's-8', 'd-A', 'd-10', 'd-9'],
        ['s-J', 'd-J', 'h-K', 'h-8', 'h-7', 'c-9', 'c-7', 's-A', 's-7', 'd-8'],
      ],
      skat: ['s-9', 'd-7'],
      solution: ['c-A', 'h-J', 'd-K', 'c-Q', 'd-Q', 'h-Q', 'h-10', 'h-A', 's-K', 'c-10'],
      goal: { kind: 'win' },
      checkpoints: [
        { afterTrick: 3, ask: 'yourPoints' },
        { afterTrick: 5, ask: 'trumpsPlayed' },
        { afterTrick: 7, ask: 'yourPoints' },
      ],
      explain: 'Liczenie mówi ci, kiedy [[obronca:Mlm]] mają już 60 [[oczko:Dlm]] i ile [[atu:Dlm]] jeszcze jest w grze.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 29**

```ts
// src/content/lessons/m6-l29-null-obrona.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm6-l29-null-obrona',
  title: 'Obrona przed [[null:N]]',
  summary: 'Znajdź lukę i zmuś [[rozgrywajacy:B]] do wzięcia [[lewa:D]].',
  steps: [
    {
      title: 'Cel obrony',
      text:
        'W [[null:Ms]] [[obronca:Mlm]] wygrywają, gdy [[rozgrywajacy]] weźmie {choć jedną lewę|choć jednego sztycha}.',
    },
    {
      title: 'Szukaj luki',
      text:
        'Groźny dla [[rozgrywajacy:D]] jest kolor z luką — np. 7, [[dama]], [[as]]. Gdy ten kolor zostanie zagrany dwa razy, za pierwszym razem zejdzie siódemką, ale za drugim musi dołożyć wysoką kartę.',
    },
    {
      title: '{Null otwarty|Nul uwert}',
      text:
        'W {nullu otwartym|nulu uwert} karty [[rozgrywajacy:D]] leżą odkryte — widać, gdzie jest luka. Zagraj w ten kolor kartami, które są wyższe od jego niskiej karty, ale niższe od wysokich.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm6-l29-q1',
      prompt: 'Kiedy [[obronca:Mlm]] wygrywają z [[null:N]]?',
      options: [
        { id: 'a', text: 'Gdy [[rozgrywajacy]] weźmie {choć jedną lewę|choć jednego sztycha}' },
        { id: 'b', text: 'Gdy zdobędą 61 [[oczko:Dlm]]' },
        { id: 'c', text: 'Nigdy' },
      ],
      correct: 'a',
      explain: 'W [[null:Ms]] [[oczko:Mlm]] się nie liczą — {wystarczy jedna wzięta lewa|wystarczy jeden wzięty sztych}.',
    },
    {
      type: 'quiz',
      id: 'm6-l29-q2',
      prompt:
        '[[Rozgrywajacy]] ma w kolorze [[suit:s]] tylko [[card:s-7:B]], [[card:s-8:B]] i [[card:s-9:B]]. Czy da się go złapać w tym kolorze?',
      options: [
        { id: 'a', text: 'Nie — zawsze zejdzie niżej' },
        { id: 'b', text: 'Tak — wystarczy wyjść dziesiątką' },
      ],
      correct: 'a',
      explain: 'Na każdą kartę [[obronca:Dlm]] w tym kolorze [[rozgrywajacy]] ma niższą — luki nie ma.',
    },
    {
      type: 'miniDeal',
      id: 'm6-l29-d1',
      prompt:
        '{Null otwarty|Nul uwert}: karty [[rozgrywajacy:D]] widzisz. Wychodzisz — zmuś go do wzięcia [[lewa:D]].',
      game: { kind: 'null' },
      declarer: 1,
      you: 0,
      ouvert: true,
      hands: [
        ['c-Q', 's-A', 's-J', 'h-J', 'h-10', 'd-K', 'd-J', 'd-10', 'd-9', 'd-8'],
        ['c-J', 'c-9', 'c-8', 'c-7', 's-10', 's-8', 's-7', 'h-A', 'h-Q', 'h-7'],
        ['c-A', 'c-K', 'c-10', 's-9', 'h-K', 'h-9', 'h-8', 'd-A', 'd-Q', 'd-7'],
      ],
      skat: ['s-Q', 's-K'],
      solution: ['h-10', 'h-J'],
      mistakes: [['d-8', 'd-9', 'h-10', 'd-10', 's-J', 'h-J', 'd-J', 'c-Q', 'd-K', 's-A']],
      goal: { kind: 'win' },
      explain:
        '[[Rozgrywajacy]] ma w kolorze [[suit:h]] tylko [[card:h-7:B]], [[card:h-Q:B]] i [[card:h-A:B]]. Po [[card:h-10:N]] schodzi siódemką, ale po [[card:h-J:N]] musi dołożyć [[dama:B]] albo [[as:B]] — i bierze [[lewa:B]].',
    },
  ],
};
```

- [ ] **Step 3: Lekcja 30**

```ts
// src/content/lessons/m6-l30-kontra.ts
import type { Declaration } from '../../engine';
import type { Lesson } from '../types';

const HEARTS_DECL: Declaration = { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' };
const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;
const WON = { declarerPoints: 75, declarerTricks: 6 };

export const lesson: Lesson = {
  id: 'm6-l30-kontra',
  title: 'Kontra i re',
  summary: 'Podwojenie stawki — kiedy się opłaca.',
  steps: [
    {
      title: 'Czym jest kontra',
      text:
        '**Kontra** to zapowiedź [[obronca:D]]: „ta gra przegra”. Podwaja wartość gry. [[Rozgrywajacy]] może odpowiedzieć **re** — wtedy wartość rośnie czterokrotnie.',
    },
    {
      title: 'Zasady',
      text:
        'Kontry i re nie ma w oficjalnych przepisach (ISkO), ale gra się z nimi w ligach i przy wielu stołach. Zwykle kontrę mówi się, zanim padnie pierwsza karta. Szczegóły — np. kto może kontrować — ustala się przed grą.',
    },
    {
      title: 'Kiedy kontrować',
      text:
        'Kontruj, gdy masz mocne karty przeciwko zgłoszonej grze: kilka [[atu:Dlm]] (najlepiej wysokich) i [[as:Mlm]] z boku. Kontra przy słabych kartach to podwójna strata.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm6-l30-q1',
      prompt: '[[Atu]]: [[suit:h]], [[mit]] 2. Gra jest wygrana, a była kontra. Ile jest warta?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '30' },
        { id: 'b', text: '60' },
        { id: 'c', text: '120' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: HEARTS_DECL, outcome: WON, doubling: 'kontra', result: 'value' },
      explain: 'Bez kontry: 10 × 3 = 30. Kontra podwaja: 60.',
    },
    {
      type: 'quiz',
      id: 'm6-l30-q2',
      prompt: 'Ta sama gra, ale po kontrze padło re. Ile jest warta?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '60' },
        { id: 'b', text: '120' },
        { id: 'c', text: '240' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: HEARTS_DECL, outcome: WON, doubling: 're', result: 'value' },
      explain: 'Re to czterokrotność: 30 × 4 = 120.',
    },
    {
      type: 'quiz',
      id: 'm6-l30-q3',
      prompt:
        '[[Atu]]: [[suit:h]], [[mit]] 2, kontra. [[Rozgrywajacy]] przegrywa z 55 [[oczko:Nlm]]. Jaki jest wynik?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '−60', value: '-60' },
        { id: 'b', text: '−120', value: '-120' },
        { id: 'c', text: '−240', value: '-240' },
      ],
      correct: 'b',
      verify: {
        kind: 'settle',
        declaration: HEARTS_DECL,
        outcome: { declarerPoints: 55, declarerTricks: 4 },
        doubling: 'kontra',
        result: 'score',
      },
      explain: 'Wartość z kontrą: 60. Przegrana liczy się podwójnie: −120.',
    },
    {
      type: 'quiz',
      id: 'm6-l30-q4',
      prompt: 'Zgłoszono grę z [[atu:Nlm]] w kolorze [[suit:s]]. Czy z tymi kartami kontrować?',
      cards: ['c-J', 's-J', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'c-8', 'd-7', 'h-9'],
      options: [
        { id: 'a', text: 'Tak — mocne [[atu:Mlm]] i [[as:Mlm]]' },
        { id: 'b', text: 'Nie — to za mało' },
      ],
      correct: 'a',
      explain:
        'Masz cztery wysokie [[atu:Mlm]] ([[card:c-J]], [[card:s-J]], [[card:s-A]], [[card:s-10]]) i dwa [[as:Mlm]] z boku — [[rozgrywajacy]] będzie miał bardzo trudno.',
    },
    {
      type: 'quiz',
      id: 'm6-l30-q5',
      prompt: 'Kto może powiedzieć re?',
      options: [
        { id: 'a', text: '[[Rozgrywajacy]] — w odpowiedzi na kontrę' },
        { id: 'b', text: 'Każdy [[obronca]]' },
        { id: 'c', text: 'Partner kontrującego' },
      ],
      correct: 'a',
      explain: 'Re to odpowiedź [[rozgrywajacy:D]] na kontrę.',
    },
  ],
};
```

- [ ] **Step 4: Rozszerz moduł 6 i uzupełnij specyfikację**

W `src/content/course.ts` dodaj importy `l28`, `l29`, `l30` i ustaw `m6` na `lessons: [l26, l27, l28, l29, l30]`.

W `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`:
- w sekcji 8.3 zastąp punkt o kontrze/re (z ⚠) punktem: `- Kontra/re: nie należą do ISkO; w kursie jako dodatek (kontra ×2, re ×4, zapowiedź przed pierwszą kartą); szczegóły ustala się przed grą.`
- w sekcji 9 zmień nagłówek na `(Plany 1–5)` i dopisz:

```markdown
- **Mini-rozdania:** pytania w trakcie gry (`checkpoints` — liczba oczek strony gracza, liczba wyszłych atu), gra otwarta (`ouvert`), typowe błędy (`mistakes`) sprawdzane w teście treści.
- **Zasada wyjść obrońcy** zweryfikowana w źródłach: krótka droga (rozgrywający gra zaraz po wychodzącym) — długi kolor; długa droga — krótki kolor.
```

- [ ] **Step 5: Testy i przegląd tekstów**

Run: `npm test && npm run typecheck && npm run build && npm run texts -- m6-l`
Expected: testy i build PASS. Teksty lekcji 26–30 przejrzane we wszystkich 4 kontekstach, a poprawki opisane w raporcie.

- [ ] **Step 6: Commit**

```bash
git add src/content docs/superpowers/specs/2026-11-12-skat-trainer-design.md
git commit -m "feat(content): lekcje 28–30 — liczenie, obrona przed nullem, kontra i re" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Sprawdzenie w przeglądarce (wykonuje koordynator)**

Przed testami zapisz `localStorage['skat-trener:v1']` użytkownika, a po testach przywróć go dokładnie w tej postaci. Widok 375 px. Sprawdź:
1. Lekcja 28: trzy pytania w trakcie rozdania, gra wstrzymana na czas pytania, wynik z liczbą poprawnych odpowiedzi.
2. Lekcja 29: odkryte karty rozgrywającego. Dwa wyjścia w kier kończą się wygraną obrony.
3. Lekcja 30: wartości z kontrą i re.
4. Talia francuska i język potoczny w lekcjach 26–30.
5. Konsola bez nowych błędów.
