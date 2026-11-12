# Trener skata — Plan 4: taktyka rozgrywającego (moduł 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Moduł 5 „Taktyka rozgrywającego” (lekcje 20–25): ocena ręki, wyrzucanie do skata, ciągnięcie atu, gra kolorami z boku, grand i ręce do nulla. Do tego narzędzie dla autora do przeglądu wszystkich tekstów w 4 wariantach oraz ocena dwustopniowa w ćwiczeniu „do skata”.

**Architecture:** Bez nowych modułów. Zmiany w istniejących:
- **Ćwiczenie „do skata”** dostaje drugą listę par (`acceptable`): wybór z niej liczy się jako poprawny, ale komunikat podpowiada lepszą parę.
- **Quiz** dostaje nowy rodzaj sprawdzenia `trumpCount` (liczba atu w kartach).
- **Nowy skrypt** `npm run texts` drukuje teksty lekcji w 4 kontekstach (talia × rejestr), żeby autor i recenzent mogli sprawdzić gramatykę. Walidator sprawdza tylko tokeny i poprawne odpowiedzi.

**Rozdania w mini-rozdaniach** znaleziono skryptem na silniku i botach z Planu 2:
- **lekcja 22:** wyciąganie atu daje 88 oczek, wyjście asami 52 (przegrana);
- **lekcja 24, grand:** walet na początek daje 82 oczka, wyjście asem 28.

Walidator treści ponownie symuluje wzorcowe rozegranie, więc wynik jest sprawdzany w testach.

**Tech Stack:** jak w Planach 1–3.

**Specyfikacja:** `docs/superpowers/specs/2026-11-12-skat-trainer-design.md` (sekcja 4, moduł 5; sekcja 9).

**Kolejne plany:**
- **Plan 5 — moduł 6** (taktyka obrońców), kontra/re w silniku, punkty kontrolne w mini-rozdaniach.
- **Plan 6** — dodatek (ramsz, bocki), grafiki kart z Wikimedia, test E2E, wdrożenie.

**Konwencje:** jak w Planach 1–3 (commit z `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, punktowe zmiany w danych słownika, polecenia w `/Users/gkocur/skat`). **Teksty muszą być neutralne płciowo.** Nie piszemy „zagrałeś”/„wygrałaś”, tylko np. „po zagraniu”, „zagrywasz”.

---

## Struktura plików (zmiany w Planie 4)

```
scripts/dump-texts.ts             NOWY: teksty lekcji w 4 kontekstach
package.json                      ZMIANA: skrypt "texts"
tsconfig.json                     ZMIANA: include "scripts"
src/content/types.ts              ZMIANA: DiscardExerciseData.acceptable, QuizVerify trumpCount
src/content/verify.ts             ZMIANA: trumpCount
src/content/validate.ts           ZMIANA: walidacja acceptable
src/exercises/evaluateDiscard.ts  ZMIANA: gradeDiscard
src/exercises/DiscardExercise.tsx ZMIANA: ocena dwustopniowa
src/content/lessons/m5-l20-ocena-reki.ts … m5-l25-null-reka.ts   NOWE (6 lekcji)
src/content/course.ts             ZMIANA: moduł m5
docs/superpowers/specs/…-design.md ZMIANA: sekcja 9 (kolejne plany)
```

---

### Task 1: Narzędzie — teksty lekcji w 4 kontekstach

**Files:**
- Create: `scripts/dump-texts.ts`
- Modify: `package.json`, `tsconfig.json`

- [ ] **Step 1: Utwórz skrypt**

```ts
// scripts/dump-texts.ts
// Użycie: npm run texts [-- <prefiks id lekcji>]   np. npm run texts -- m5-l22
// Drukuje wszystkie teksty lekcji po rozwiązaniu tokenów w 4 kontekstach (talia × rejestr),
// żeby autor mógł sprawdzić gramatykę i słownictwo.
import { COURSE } from '../src/content/course';
import type { ExerciseData, Lesson } from '../src/content/types';
import { resolveText, type TextContext } from '../src/glossary';

const CONTEXTS: { label: string; ctx: TextContext }[] = [
  { label: 'Altenburg / oficjalny', ctx: { deck: 'altenburg', register: 'official' } },
  { label: 'Altenburg / potoczny', ctx: { deck: 'altenburg', register: 'colloquial' } },
  { label: 'francuska / oficjalny', ctx: { deck: 'french', register: 'official' } },
  { label: 'francuska / potoczny', ctx: { deck: 'french', register: 'colloquial' } },
];

function exerciseTexts(ex: ExerciseData): [string, string][] {
  const texts: [string, string][] = [[`${ex.id} pytanie`, ex.prompt], [`${ex.id} wyjaśnienie`, ex.explain]];
  if (ex.type === 'quiz') {
    for (const option of ex.options) if (option.text) texts.push([`${ex.id} odpowiedź ${option.id}`, option.text]);
  }
  if (ex.type === 'playCard') {
    for (const [card, text] of Object.entries(ex.wrongExplain ?? {})) if (text) texts.push([`${ex.id} błąd ${card}`, text]);
  }
  if (ex.type === 'discard' && ex.wrongExplain) texts.push([`${ex.id} błąd`, ex.wrongExplain]);
  return texts;
}

function lessonTexts(lesson: Lesson): [string, string][] {
  const texts: [string, string][] = [['tytuł', lesson.title], ['opis', lesson.summary]];
  lesson.steps.forEach((step, i) => {
    if (step.title) texts.push([`krok ${i + 1} tytuł`, step.title]);
    texts.push([`krok ${i + 1}`, step.text]);
    if (step.cardsCaption) texts.push([`krok ${i + 1} podpis`, step.cardsCaption]);
  });
  for (const ex of lesson.exercises) texts.push(...exerciseTexts(ex));
  return texts;
}

const prefix = process.argv[2] ?? '';
for (const lesson of COURSE.modules.flatMap((m) => m.lessons).filter((l) => l.id.startsWith(prefix))) {
  console.log(`\n==================== ${lesson.id} ====================`);
  for (const [where, text] of lessonTexts(lesson)) {
    console.log(`\n--- ${where}`);
    for (const { label, ctx } of CONTEXTS) console.log(`  [${label}] ${resolveText(text, ctx)}`);
  }
}
```

- [ ] **Step 2: Dodaj skrypt npm i obejmij katalog typami**

```bash
npm pkg set scripts.texts="vite-node scripts/dump-texts.ts"
```

W `tsconfig.json` zmień `"include": ["src", "vite.config.ts"]` na `"include": ["src", "scripts", "vite.config.ts"]`.

- [ ] **Step 3: Sprawdź**

Run: `npm run texts -- m1-l01 | head -20 && npm run typecheck`
Expected: wydruk tytułu lekcji 1 w 4 wariantach (np. `[Altenburg / potoczny] Czym jest skat?`), typecheck bez błędów.

- [ ] **Step 4: Commit**

```bash
git add scripts package.json tsconfig.json
git commit -m "feat(tools): podgląd tekstów lekcji w 4 kontekstach (npm run texts)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Ocena dwustopniowa w ćwiczeniu „do skata” i sprawdzenie liczby atu

**Files:**
- Modify: `src/content/types.ts`, `src/content/verify.ts`, `src/content/validate.ts`, `src/exercises/evaluateDiscard.ts`, `src/exercises/DiscardExercise.tsx`
- Test: `src/exercises/DiscardExercise.test.tsx`, `src/content/verify.test.ts`, `src/content/validate.test.ts` (dopisane testy)

- [ ] **Step 1: Dopisz testy**

W `src/exercises/DiscardExercise.test.tsx` (fixture `exercise` ma `best: [['s-10','s-9'], ['s-10','d-8']]`) zmień import na `import { gradeDiscard, isBestDiscard } from './evaluateDiscard';` i dopisz:

```tsx
describe('gradeDiscard', () => {
  const tiered = { ...exercise, best: [['s-10', 's-9']], acceptable: [['s-10', 'd-8']] } as typeof exercise;
  it('rozróżnia najlepszą, dopuszczalną i złą parę', () => {
    expect(gradeDiscard(tiered, ['s-9', 's-10'])).toBe('best');
    expect(gradeDiscard(tiered, ['d-8', 's-10'])).toBe('acceptable');
    expect(gradeDiscard(tiered, ['c-A', 'c-K'])).toBe('wrong');
  });

  it('para dopuszczalna jest zaliczona z podpowiedzią lepszej', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<DiscardExercise exercise={tiered} onAnswered={onAnswered} />);
    await user.click(screen.getByRole('button', { name: 'dziesiątka zielona' }));
    await user.click(screen.getByRole('button', { name: 'ósemka dzwonkowa' }));
    await user.click(screen.getByRole('button', { name: 'Wyrzuć do skata' }));
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByText('Dobry wybór, choć jeszcze lepiej: dziesiątka zielona i dziewiątka zielona.')).toBeInTheDocument();
  });
});
```

W `src/content/verify.test.ts` (wewnątrz `describe('verifyQuiz', …)`):

```ts
  it('liczba atu w kartach', () => {
    const q = quiz({
      cards: ['c-J', 'h-J', 'c-A', 'c-K', 'c-8', 's-A', 's-10', 'd-A', 'h-9', 'd-7'],
      verify: { kind: 'trumpCount', game: { kind: 'suit', trump: 'c' } },
    });
    expect(verifyQuiz({ ...q, options: [{ id: 'a', text: '5' }, { id: 'b', text: '3' }] })).toEqual([]);
    expect(verifyQuiz({ ...q, options: [{ id: 'a', text: '3' }, { id: 'b', text: '5' }] })).toEqual([
      'poprawna odpowiedź powinna wynosić 5',
    ]);
  });
```

W `src/content/validate.test.ts`, w teście „ćwiczenie „do skata”” (zmienna `discard`), dopisz na końcu:

```ts
    expect(validateCourse(courseWith(lessonWith([{ ...discard, acceptable: [['s-9', 's-10']] }])))).toEqual([
      'l1/k1: para s-9, s-10 jest jednocześnie najlepsza i dopuszczalna',
    ]);
    expect(validateCourse(courseWith(lessonWith([{ ...discard, acceptable: [['s-10', 'h-6' as never]] }])))).toContain(
      'l1/k1: karta h-6 z pary nie jest w ręce',
    );
```

- [ ] **Step 2: Uruchom testy i sprawdź, że nie przechodzą**

Run: `npx vitest run src/exercises/DiscardExercise.test.tsx src/content`
Expected: FAIL (brak `gradeDiscard`, `acceptable`, `trumpCount`).

- [ ] **Step 3: Rozszerz typy w `src/content/types.ts`**

W unii `QuizVerify` dodaj wariant (i dopisz do komentarza linię `* - \`trumpCount\`: liczba atu wśród kart z \`cards\` w grze \`game\`;`):

```ts
  | { kind: 'trumpCount'; game: GameType }
```

W `DiscardExerciseData` po polu `best` dodaj:

```ts
  /** Pary też poprawne, ale słabsze od `best` — zaliczone z podpowiedzią lepszej pary. */
  acceptable?: CardId[][];
```

- [ ] **Step 4: Dodaj `trumpCount` w `src/content/verify.ts`**

Dodaj `isTrump` do importu z `'../engine'` i w `switch` (np. po `case 'maxBid'`):

```ts
      case 'trumpCount':
        return needCards() ?? expect(String(quiz.cards!.filter((card) => isTrump(card, verify.game)).length));
```

- [ ] **Step 5: Waliduj `acceptable` w `src/content/validate.ts`**

Zastąp funkcję `validateDiscard`:

```ts
function validateDiscard(ex: DiscardExerciseData, report: Report, checkText: CheckText) {
  if (ex.cards.length !== 12) report('do wyrzucania potrzeba 12 kart (ręka + skat)');
  checkUnique(ex.cards, report);
  if (ex.best.length === 0) report('brak dobrych par do wyrzucenia');
  const key = (pair: CardId[]) => [...pair].sort().join(', ');
  const bestKeys = new Set(ex.best.map(key));
  for (const pair of [...ex.best, ...(ex.acceptable ?? [])]) {
    if (pair.length !== 2 || pair[0] === pair[1]) report(`zła para: ${pair.join(', ')}`);
    for (const card of pair) if (!ex.cards.includes(card)) report(`karta ${card} z pary nie jest w ręce`);
  }
  for (const pair of ex.acceptable ?? []) {
    if (bestKeys.has(key(pair))) report(`para ${key(pair)} jest jednocześnie najlepsza i dopuszczalna`);
  }
  checkText(ex.wrongExplain);
}
```

- [ ] **Step 6: Ocena dwustopniowa — zastąp `src/exercises/evaluateDiscard.ts`**

```ts
// src/exercises/evaluateDiscard.ts
import type { CardId } from '../engine';
import type { DiscardExerciseData } from '../content/types';

export type DiscardGrade = 'best' | 'acceptable' | 'wrong';

const samePair = (a: readonly CardId[], b: readonly CardId[]) =>
  a.length === 2 && b.length === 2 && a.every((card) => b.includes(card));

export function gradeDiscard(exercise: DiscardExerciseData, pair: readonly CardId[]): DiscardGrade {
  if (exercise.best.some((best) => samePair(best, pair))) return 'best';
  if ((exercise.acceptable ?? []).some((ok) => samePair(ok, pair))) return 'acceptable';
  return 'wrong';
}

/** Czy para jest jedną z najlepszych. */
export function isBestDiscard(exercise: DiscardExerciseData, pair: readonly CardId[]): boolean {
  return gradeDiscard(exercise, pair) === 'best';
}
```

- [ ] **Step 7: Komponent — `src/exercises/DiscardExercise.tsx`**

Zmień import na `import { gradeDiscard } from './evaluateDiscard';` i:
- w `confirm` zamień `onAnswered(isBestDiscard(exercise, selected));` na `onAnswered(gradeDiscard(exercise, selected) !== 'wrong');`;
- zamień `const correct = done && isBestDiscard(exercise, selected);` na:

```tsx
  const grade = done ? gradeDiscard(exercise, selected) : null;
  const correct = grade === 'best' || grade === 'acceptable';
```

- w `Feedback` zamień dwie linie zaczynające się od `{!correct &&` na:

```tsx
            {grade === 'acceptable' && (
              <RichText text={`Dobry wybór, choć jeszcze lepiej: [[card:${bestA}]] i [[card:${bestB}]].`} />
            )}
            {grade === 'wrong' && <RichText text={`Lepszy wybór: [[card:${bestA}]] i [[card:${bestB}]].`} />}
            {grade === 'wrong' && exercise.wrongExplain && <RichText text={exercise.wrongExplain} />}
```

- [ ] **Step 8: Uruchom testy**

Run: `npm test && npm run typecheck`
Expected: PASS (także dotychczasowe testy `DiscardExercise`: para z `best` to nadal „Dobrze!”).

- [ ] **Step 9: Commit**

```bash
git add src/content src/exercises
git commit -m "feat: dopuszczalne pary do skata i sprawdzanie liczby atu" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Lekcje 20–22

**Files:**
- Create: `src/content/lessons/m5-l20-ocena-reki.ts`, `src/content/lessons/m5-l21-wyrzucanie.ts`, `src/content/lessons/m5-l22-atu.ts`
- Modify: `src/content/course.ts`

Test treści sprawdza tokeny, odpowiedzi z `verify` i mini-rozdanie. Zgłoszony problem napraw w treści albo punktowo w słowniku i opisz w raporcie. Jeśli symulacja mini-rozdania nie osiąga celu, **nie zmieniaj silnika ani botów**, tylko zgłoś to w raporcie. Na koniec uruchom `npm run texts -- m5-l2` i przejrzyj wydruk pod kątem gramatyki (zgodność rodzaju i przypadku, zwłaszcza w języku potocznym). Usterki popraw tokenami albo alternatywą `{…|…}`.

- [ ] **Step 1: Lekcja 20**

```ts
// src/content/lessons/m5-l20-ocena-reki.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const CLUB_HAND = ['c-J', 'h-J', 'c-A', 'c-K', 'c-8', 's-A', 's-10', 'd-A', 'h-9', 'd-7'] as const;

export const lesson: Lesson = {
  id: 'm5-l20-ocena-reki',
  title: 'Ocena ręki do [[graKolorowa:D]]',
  summary: 'Ile [[atu:Dlm]] wystarczy i co jeszcze się liczy.',
  steps: [
    {
      title: 'Licz [[atu:Blm]]',
      text:
        'Najważniejsza jest liczba [[atu:Dlm]] — razem z [[walet:Nlm]]. **5 [[atu:Dlm]]** to minimum, **6–7** to wygodna gra.\n\n' +
        'Liczą się też wysokie [[atu:Mlm]]: [[walet:Mlm]], [[as]] i 10 koloru [[atu:Dlm]].',
    },
    {
      title: 'Karty z boku',
      text:
        '**[[As:Mlm]] z boku** biorą {lewy|sztychy} i oczka, a **[[as]] z dziesiątką** w jednym kolorze to bardzo mocny kolor.\n\n' +
        'Niskie karty w różnych kolorach to raczej straty — im mniej takich kart, tym lepiej.',
    },
    {
      title: 'Który kolor na [[atu:B]]?',
      text:
        'Najczęściej ten, w którym masz najwięcej kart. Przy równej długości wybierz kolor z wyższymi kartami — albo droższy, jeśli to potrzebne do wylicytowanej stawki.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm5-l20-q1',
      prompt: 'Który kolor wybrać na [[atu:B]]?',
      cards: ['c-J', 'd-J', 's-A', 's-10', 's-K', 's-8', 's-7', 'h-A', 'c-9', 'd-7'],
      options: [
        { id: 'a', text: '[[Suit:c]]' },
        { id: 'b', text: '[[Suit:s]]' },
        { id: 'c', text: '[[Suit:h]]' },
        { id: 'd', text: '[[Suit:d]]' },
      ],
      correct: 'b',
      explain: 'W kolorze [[suit:s]] masz 5 kart — razem z dwoma [[walet:Nlm]] to 7 [[atu:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'm5-l20-q2',
      prompt: 'Czy z tymi kartami warto grać [[graKolorowa:B]]?',
      cards: ['s-J', 'h-A', 'h-K', 'h-8', 'c-A', 'c-10', 's-9', 's-7', 'd-8', 'd-7'],
      options: [
        { id: 'a', text: 'Tak, to dobra ręka' },
        { id: 'b', text: 'Raczej nie — za mało [[atu:Dlm]]' },
        { id: 'c', text: 'Tak, ale tylko jako [[null]]' },
      ],
      correct: 'b',
      explain:
        'W najlepszym kolorze ([[suit:h]]) masz razem z [[walet:N]] tylko 4 [[atu:Mlm]]. To za mało — [[obronca:Mlm]] mieliby ich więcej. Na [[null:B]] masz za dużo wysokich kart.',
    },
    {
      type: 'quiz',
      id: 'm5-l20-q3',
      prompt: 'Ile masz [[atu:Dlm]] w grze, w której [[atu]] to [[suit:c]]?',
      cards: [...CLUB_HAND],
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '5' },
        { id: 'c', text: '6' },
      ],
      correct: 'b',
      verify: { kind: 'trumpCount', game: CLUBS },
      explain: 'Dwa [[walet:Mlm]] i trzy karty koloru [[suit:c]] — razem 5.',
    },
    {
      type: 'quiz',
      id: 'm5-l20-q4',
      prompt: 'Te same karty, [[atu]]: [[suit:c]]. Do ilu możesz {licytować|reizować}?',
      cards: [...CLUB_HAND],
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '36' },
        { id: 'c', text: '48' },
      ],
      correct: 'a',
      verify: { kind: 'maxBid', game: CLUBS },
      explain: 'Masz [[card:c-J:B]], ale brakuje [[card:s-J:D]] — to [[mit]] 1, mnożnik 2. 12 × 2 = 24.',
    },
    {
      type: 'quiz',
      id: 'm5-l20-q5',
      prompt: 'Co jest najważniejsze przy ocenie ręki do [[graKolorowa:D]]?',
      options: [
        { id: 'a', text: 'Liczba [[atu:Dlm]]' },
        { id: 'b', text: 'Liczba dziewiątek' },
        { id: 'c', text: 'Liczba kolorów, w których masz karty' },
      ],
      correct: 'a',
      explain: 'Bez wystarczającej liczby [[atu:Dlm]] nawet [[as:Mlm]] z boku nie pomogą — [[obronca:Mlm]] je przebiją.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 21**

```ts
// src/content/lessons/m5-l21-wyrzucanie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const GRAND: GameType = { kind: 'grand' };
const ASK = 'Masz 12 kart (razem ze [[skat:N]]). Wybierz 2 karty do wyrzucenia.';

export const lesson: Lesson = {
  id: 'm5-l21-wyrzucanie',
  title: 'Co wyrzucić do [[skat:D]] — zasady',
  summary: 'Chowaj zagrożone oczka i twórz puste kolory.',
  steps: [
    {
      title: 'Zagrożone dziesiątki',
      text:
        'Dziesiątka bez [[as:D]] w tym samym kolorze łatwo przepada — [[obronca]] zabierze ją [[as:N]]. ' +
        'Jeśli możesz, wyrzuć ją do [[skat:D]]: jej 10 [[oczko:Dlm]] będzie twoje.',
    },
    {
      title: 'Pusty kolor',
      text:
        'Wyrzucając wszystkie karty jednego koloru, robisz z niego **pusty kolor**. Gdy [[obronca:Mlm]] w nim wyjdą, możesz go przebić [[atu:N]]. ' +
        'Kolor z jedną lub dwiema kartami to dobry kandydat.',
    },
    {
      title: 'Czego nie wyrzucać',
      text:
        '[[Atu:Dlm]] zwykle się nie wyrzuca — są potrzebne w grze. Nie rozbijaj też pary **[[as]] + 10** w jednym kolorze: razem wezmą {dwie lewy|dwa sztychy}.',
    },
  ],
  exercises: [
    {
      type: 'discard',
      id: 'm5-l21-k1',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      game: HEARTS,
      cards: ['c-J', 'h-J', 'h-A', 'h-K', 'h-Q', 'h-9', 'h-7', 'c-A', 'c-10', 's-10', 'd-K', 'd-8'],
      best: [['s-10', 'd-K']],
      acceptable: [['s-10', 'd-8']],
      wrongExplain: '[[Card:s-10]] jest jedyną kartą w kolorze [[suit:s]] — bez [[as:D]] prawie na pewno przepadnie.',
      explain:
        'Wyrzucając [[card:s-10:B]], chowasz 10 [[oczko:Dlm]] i robisz pusty kolor [[suit:s]]. [[Card:d-K]] bez [[as:D]] też jest zagrożony — razem do [[skat:D]] trafia 14 [[oczko:Dlm]].',
    },
    {
      type: 'discard',
      id: 'm5-l21-k2',
      prompt: `[[Grand]]. ${ASK}`,
      game: GRAND,
      cards: ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 'c-K', 'c-9', 's-A', 's-10', 'h-10', 'h-8', 'd-9'],
      best: [['h-10', 'h-8']],
      acceptable: [['h-10', 'd-9']],
      wrongExplain: '[[Card:h-10]] bez [[as:D]] to łatwy łup dla [[obronca:Dlm]].',
      explain:
        'W kolorze [[suit:h]] masz tylko [[card:h-10:B]] i [[card:h-8:B]], bez [[as:D]]. Wyrzucając obie karty, chowasz 10 [[oczko:Dlm]] i robisz pusty kolor.',
    },
    {
      type: 'discard',
      id: 'm5-l21-k3',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      game: HEARTS,
      cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 'c-10', 'd-K', 'd-9', 's-8'],
      best: [['d-K', 'd-9']],
      acceptable: [['d-K', 's-8']],
      wrongExplain: 'Nie rozbijaj pary [[card:c-A]] + [[card:c-10]] — razem wezmą {dwie lewy|dwa sztychy}.',
      explain:
        'Kolor [[suit:c]] z [[as:N]] i dziesiątką jest mocny — zostaw go. Wyrzucając obie karty w kolorze [[suit:d]], chowasz [[krol:B]] i robisz pusty kolor.',
    },
    {
      type: 'quiz',
      id: 'm5-l21-q1',
      prompt: 'Po co wyrzuca się wszystkie karty krótkiego koloru?',
      options: [
        { id: 'a', text: 'Żeby móc potem przebijać ten kolor [[atu:N]]' },
        { id: 'b', text: 'Żeby mieć mniej kart w ręce' },
        { id: 'c', text: 'Bo tak każą przepisy' },
      ],
      correct: 'a',
      explain: 'Pusty kolor to dodatkowe {lewy|sztychy}: gdy [[obronca:Mlm]] w nim wyjdą, przebijasz [[atu:N]].',
    },
  ],
};
```

- [ ] **Step 3: Lekcja 22**

```ts
// src/content/lessons/m5-l22-atu.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm5-l22-atu',
  title: 'Ciągnięcie [[atu:Dlm]]',
  summary: 'Zabierz [[obronca:Dlm]] możliwość przebijania.',
  steps: [
    {
      title: 'Dlaczego wyciągać [[atu:Blm]]',
      text:
        'Dopóki [[obronca:Mlm]] mają [[atu:Blm]], mogą przebić twoje [[as:Blm]] i dziesiątki z boku. ' +
        'Dlatego przy mocnych [[atu:Nlm]] zaczyna się zwykle od ich wyciągania: zagrywasz [[atu:Blm]], a [[obronca:Mlm]] muszą je dokładać.',
    },
    {
      title: 'Licz [[atu:Blm]]',
      text:
        'W [[graKolorowa:Ms]] jest 11 [[atu:Dlm]]. Odejmij swoje (i te ze [[skat:D]]) — resztę mają [[obronca:Mlm]]. ' +
        'Licząc, ile już wyszło, zawsze wiadomo, kiedy [[obronca:Mlm]] są bez [[atu:Dlm]].',
    },
    {
      title: 'Kiedy nie wyciągać',
      text:
        'Gdy masz mało [[atu:Dlm]] i pusty kolor, zachowaj je do przebijania tego koloru — każde przebicie to {dodatkowa lewa|dodatkowy sztych}.',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm5-l22-p1',
      prompt: 'Wychodzisz jako [[rozgrywajacy]]. [[Obronca:Mlm]] mają jeszcze [[atu:Blm]]. Którą kartę zagrać?',
      game: HEARTS,
      leader: 0,
      trick: [],
      hand: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'c-A', 's-A', 'd-9'],
      mode: 'best',
      best: ['c-J', 's-J'],
      wrongExplain: {
        'c-A': 'Zanim zagrasz [[as:B]] z boku, wyciągnij [[atu:Blm]] — inaczej [[obronca]] może go przebić.',
        's-A': 'Zanim zagrasz [[as:B]] z boku, wyciągnij [[atu:Blm]] — inaczej [[obronca]] może go przebić.',
        'h-A': 'Zacznij od najwyższych [[atu:Dlm]] — [[card:h-A:B]] mogą przebić [[walet:Mlm]] [[obronca:Dlm]].',
        'h-10': 'Zacznij od najwyższych [[atu:Dlm]] — dziesiątkę mogą przebić [[walet:Mlm]] albo [[as]] [[obronca:Dlm]].',
        'h-K': 'Zacznij od najwyższych [[atu:Dlm]] — [[krol:B]] łatwo przebić.',
        'd-9': 'Oddajesz {lewę|sztycha} bez potrzeby.',
      },
      explain: '[[Walet:Mlm]] to twoje najwyższe [[atu:Mlm]]: wezmą {lewy|sztychy} i zabiorą [[atu:Blm]] [[obronca:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'm5-l22-q1',
      prompt: 'Masz 6 [[atu:Dlm]], a w [[skat:Ms]] nie ma żadnego. Ile [[atu:Dlm]] mają razem [[obronca:Mlm]] w [[graKolorowa:Ms]]?',
      options: [
        { id: 'a', text: '4' },
        { id: 'b', text: '5' },
        { id: 'c', text: '6' },
      ],
      correct: 'b',
      explain: '11 − 6 = 5.',
    },
    {
      type: 'miniDeal',
      id: 'm5-l22-d1',
      prompt: 'Rozegraj rozdanie jako [[rozgrywajacy]] i wygraj. Zastanów się, od czego zacząć.',
      game: HEARTS,
      declarer: 0,
      you: 0,
      hands: [
        ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'c-9', 's-A', 'd-A', 'd-9'],
        ['c-A', 'c-10', 'c-K', 'c-8', 's-K', 's-7', 'd-10', 'd-K', 'd-Q', 'd-7'],
        ['h-J', 'd-J', 'h-9', 'h-8', 'h-7', 'c-Q', 'c-7', 's-10', 's-Q', 's-8'],
      ],
      skat: ['s-9', 'd-8'],
      solution: ['c-J', 's-J', 'h-A', 'c-9', 'h-Q', 'h-10', 's-A', 'h-K', 'd-A', 'd-9'],
      goal: { kind: 'win' },
      explain:
        'Wyciągając najpierw [[atu:Blm]] ([[card:c-J]], [[card:s-J]], [[card:h-A]]…), zabierasz [[obronca:Dlm]] możliwość przebijania. ' +
        'Gdy zaczyna się od [[as:Dlm]], [[zadek]] przebija je [[atu:Nlm]] — i gra przepada.',
    },
  ],
};
```

- [ ] **Step 4: Dodaj moduł 5 do kursu**

W `src/content/course.ts` dodaj importy `l20`, `l21`, `l22` i po module `m4` dopisz:

```ts
    { id: 'm5', title: 'Taktyka rozgrywającego', lessons: [l20, l21, l22] },
```

- [ ] **Step 5: Uruchom testy i przejrzyj teksty**

Run: `npx vitest run src/content && npm test && npm run typecheck && npm run texts -- m5-l2`
Expected: testy PASS. Wydruk przejrzany, a usterki gramatyczne poprawione i opisane w raporcie.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat(content): lekcje 20–22 — ocena ręki, wyrzucanie, ciągnięcie atu" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Lekcje 23–25

**Files:**
- Create: `src/content/lessons/m5-l23-boczne-kolory.ts`, `src/content/lessons/m5-l24-grand.ts`, `src/content/lessons/m5-l25-null-reka.ts`
- Modify: `src/content/course.ts`, `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`

Zasady jak w Task 3: test treści, a po nim przegląd `npm run texts -- m5-l2`.

- [ ] **Step 1: Lekcja 23**

```ts
// src/content/lessons/m5-l23-boczne-kolory.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm5-l23-boczne-kolory',
  title: 'Gra kolorami z boku',
  summary: '[[As]] przed dziesiątką i ostrożnie z dziesiątką bez [[as:D]].',
  steps: [
    {
      title: '[[As]] i dziesiątka',
      text:
        'Gdy masz w kolorze [[as:B]] i 10, zagraj najpierw [[as:B]] — weźmie {lewę|sztycha} na pewno. Dziesiątka staje się wtedy najwyższą kartą koloru.',
    },
    {
      title: 'Dziesiątka bez [[as:D]]',
      text:
        'Nie wychodź dziesiątką, gdy [[as]] tego koloru jest jeszcze w grze — [[obronca]] zabierze ją [[as:N]] i zgarnie 21 [[oczko:Dlm]]. ' +
        'Lepiej poczekać, aż [[as]] wyjdzie.',
    },
    {
      title: 'Co oddać, gdy nie masz koloru',
      text:
        'Gdy nie możesz dołożyć do koloru ani przebić, a {lewę|sztycha} i tak bierze [[obronca]], oddaj kartę **bez wartości** — siódemkę, ósemkę albo dziewiątkę. Każde oddane oczko liczy się dla [[obronca:Dlm]].',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm5-l23-p1',
      prompt: '[[Obronca:Mlm]] nie mają już [[atu:Dlm]]. Wychodzisz. Zagraj kartę, która na pewno weźmie {lewę|sztycha}.',
      game: HEARTS,
      leader: 0,
      trick: [],
      hand: ['c-10', 'c-8', 's-A', 's-K', 'd-9', 'd-8'],
      mode: 'best',
      best: ['s-A'],
      wrongExplain: {
        'c-10': '[[Card:c-A]] jest jeszcze u [[obronca:Dlm]] — zabierze twoją dziesiątkę.',
        'c-8': 'Niska karta nie weźmie {lewy|sztycha}.',
        's-K': '[[Card:s-K]] przegra z [[card:s-10:N]], jeśli ma ją [[obronca]].',
        'd-9': 'Niska karta nie weźmie {lewy|sztycha}.',
        'd-8': 'Niska karta nie weźmie {lewy|sztycha}.',
      },
      explain: '[[Card:s-A]] to najwyższa karta koloru — przy braku [[atu:Dlm]] u [[obronca:Dlm]] bierze na pewno.',
    },
    {
      type: 'playCard',
      id: 'm5-l23-p2',
      prompt:
        '[[Atu:Mlm]] już wyszły. Na stole leży [[card:c-K]], a po tobie zagra jeszcze [[obronca]]. Weź {tę lewę|tego sztycha} bez ryzyka.',
      game: HEARTS,
      leader: 2,
      trick: ['c-K'],
      hand: ['c-A', 'c-10', 'c-7', 's-9', 'd-A'],
      mode: 'best',
      best: ['c-A'],
      wrongExplain: {
        'c-10': 'Dziesiątka bije [[krol:B]], ale ostatni gracz może mieć [[card:c-A:B]] — wtedy dziesiątka przepada.',
        'c-7': 'Oddajesz {lewę|sztycha} z [[krol:N]].',
      },
      explain: '[[Card:c-A]] bierze na pewno i zgarnia [[krol:B]]: 15 [[oczko:Dlm]].',
    },
    {
      type: 'playCard',
      id: 'm5-l23-p3',
      prompt:
        'Na stole leżą [[card:d-A]] i [[card:d-10]]. Nie masz kart w kolorze [[suit:d]] ani [[atu:Dlm]]. Którą kartę oddać?',
      game: HEARTS,
      leader: 1,
      trick: ['d-A', 'd-10'],
      hand: ['c-10', 'c-7', 's-K', 's-8'],
      mode: 'best',
      best: ['c-7', 's-8'],
      wrongExplain: {
        'c-10': 'Oddajesz 10 [[oczko:Dlm]] — lepiej kartę bez wartości.',
        's-K': 'Oddajesz 4 [[oczko:Mlm]] — lepiej kartę bez wartości.',
      },
      explain: '{Lewę|Sztycha} i tak bierze [[obronca]] — oddaj kartę, która nie ma żadnych [[oczko:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'm5-l23-q1',
      prompt: 'Ile [[oczko:Dlm]] zgarnia [[obronca]], biorąc [[as:N]] twoją dziesiątkę?',
      options: [
        { id: 'a', text: '10' },
        { id: 'b', text: '11' },
        { id: 'c', text: '21' },
      ],
      correct: 'c',
      explain: '11 ([[as]]) + 10 = 21 — {w jednej lewie|w jednym sztychu}.',
    },
  ],
};
```

- [ ] **Step 2: Lekcja 24**

```ts
// src/content/lessons/m5-l24-grand.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const GRAND: GameType = { kind: 'grand' };
const GAME_OPTIONS = (suit: 'c' | 's' | 'h' | 'd') => [
  { id: 'a', text: '[[Grand]]' },
  { id: 'b', text: `[[GraKolorowa]], [[atu]]: [[suit:${suit}]]` },
  { id: 'c', text: '[[Null]]' },
];

export const lesson: Lesson = {
  id: 'm5-l24-grand',
  title: 'Kiedy grać [[grand:B]]',
  summary: '[[Walet:Mlm]], [[as:Mlm]] i długi kolor.',
  steps: [
    {
      title: 'Siła [[grand:D]]',
      text:
        'W [[grand:Ms]] są tylko 4 [[atu:Mlm]]. Dlatego liczą się: **[[walet:Mlm]]** (najlepiej co najmniej 2), **[[as:Mlm]]** i **długi, mocny kolor** — np. [[as]], 10, [[krol]] i kolejne.',
    },
    {
      title: 'Typowe ręce do [[grand:D]]',
      text:
        '• 3–4 [[walet:Mlm]] i kilka [[as:Dlm]] — prawie zawsze [[grand]].\n\n' +
        '• 2 [[walet:Mlm]], długi kolor z [[as:N]] i dziesiątką oraz drugi [[as]] — dobry [[grand]], zwłaszcza gdy wychodzisz jako [[przodek]].\n\n' +
        '• 1 [[walet]] — zwykle za mało.',
    },
    {
      title: 'Jak grać [[grand:B]]',
      text:
        'Najpierw [[walet:Mlm]]: jeden twój [[walet]] często wyciąga oba [[walet:Mlm]] [[obronca:Dlm]]. Potem graj długi kolor od góry — [[obronca:Mlm]] nie mają już czym przebijać.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm5-l24-q1',
      prompt: 'Którą grę zgłosić z tymi kartami?',
      cards: ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 's-A', 's-10', 's-K', 'h-A', 'd-7'],
      options: GAME_OPTIONS('s'),
      correct: 'a',
      explain:
        'Trzy [[walet:Mlm]] i trzy [[as:Mlm]], w tym dwa z dziesiątkami — to typowy [[grand]]. W kolorze [[suit:s]] gra byłaby warta dużo mniej.',
    },
    {
      type: 'quiz',
      id: 'm5-l24-q2',
      prompt: 'Którą grę zgłosić z tymi kartami?',
      cards: ['d-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 's-8', 'd-7', 'd-8'],
      options: GAME_OPTIONS('h'),
      correct: 'b',
      explain:
        'Z jednym [[walet:N]] [[grand]] jest bardzo ryzykowny. Z [[walet:N]] i pięcioma kartami w kolorze [[suit:h]] masz 6 [[atu:Dlm]] — to solidna [[graKolorowa]].',
    },
    {
      type: 'quiz',
      id: 'm5-l24-q3',
      prompt: '[[Grand]]. Do ilu możesz {licytować|reizować} z tymi kartami?',
      cards: ['c-J', 's-J', 'c-A', 'c-10', 'c-K', 'c-Q', 'c-7', 's-A', 'h-Q', 'd-10'],
      options: [
        { id: 'a', text: '48' },
        { id: 'b', text: '72' },
        { id: 'c', text: '96' },
      ],
      correct: 'b',
      verify: { kind: 'maxBid', game: GRAND },
      explain: '[[Mit]] 2 → mnożnik 3. 24 × 3 = 72.',
    },
    {
      type: 'miniDeal',
      id: 'm5-l24-d1',
      prompt: 'Grasz [[grand:B]] z długim kolorem [[suit:c]]. Rozegraj rozdanie i wygraj.',
      game: GRAND,
      declarer: 0,
      you: 0,
      hands: [
        ['c-J', 's-J', 'c-A', 'c-10', 'c-K', 'c-Q', 'c-7', 's-A', 'h-Q', 'd-10'],
        ['h-J', 'c-9', 'c-8', 's-K', 's-Q', 'h-K', 'h-8', 'd-A', 'd-K', 'd-9'],
        ['d-J', 's-10', 's-9', 's-8', 'h-A', 'h-10', 'h-7', 'd-Q', 'd-8', 'd-7'],
      ],
      skat: ['h-9', 's-7'],
      solution: ['c-J', 'c-A', 's-A', 'c-10', 'd-10', 'h-Q', 's-J', 'c-K', 'c-Q', 'c-7'],
      goal: { kind: 'win' },
      explain:
        'Jeden [[card:c-J]] na początku wyciąga oba [[walet:Mlm]] [[obronca:Dlm]] — każdy z nich ma po jednym i musi go dołożyć. Potem kolor [[suit:c]] jest bezpieczny. ' +
        'Gdy zaczyna się od [[card:c-A:D]], [[obronca]] bez koloru [[suit:c]] przebija go [[walet:N]].',
    },
  ],
};
```

- [ ] **Step 3: Lekcja 25**

```ts
// src/content/lessons/m5-l25-null-reka.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm5-l25-null-reka',
  title: 'Ręka do [[null:D]]',
  summary: 'Niskie karty dobre, samotne wysokie — groźne.',
  steps: [
    {
      title: 'Czego szukasz',
      text:
        'Do [[null:D]] potrzebujesz kart, którymi zawsze można zejść pod cudzą kartę: **siódemek, ósemek, dziewiątek**. W każdym kolorze, który masz, najlepiej mieć siódemkę.',
    },
    {
      title: 'Groźne karty',
      text:
        '**Wysoka karta bez niskich** w tym samym kolorze — np. samotny [[as]] albo [[krol]] — to prawie pewna przegrana: gdy [[obronca]] wyjdzie w ten kolor, trzeba ją dołożyć i wziąć {lewę|sztycha}.\n\n' +
        'Groźny jest też kolor z luką, np. 7 i [[as]]: za drugim razem trzeba dołożyć [[as:B]].',
    },
    {
      title: 'Pusty kolor to zaleta',
      text:
        'Gdy w [[null:Ms]] nie masz jakiegoś koloru, a [[obronca:Mlm]] w nim wyjdą, możesz pozbyć się swojej najgroźniejszej karty.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm5-l25-q1',
      prompt: 'Czy to dobra ręka do [[null:D]]?',
      cards: ['c-7', 'c-8', 's-7', 's-9', 'h-7', 'h-8', 'h-10', 'd-7', 'd-9', 'd-J'],
      options: [
        { id: 'a', text: 'Tak, dobra ręka do [[null:D]]' },
        { id: 'b', text: 'Nie, za dużo wysokich kart' },
      ],
      correct: 'a',
      explain: 'W każdym kolorze masz siódemkę i niskie karty — trudno zmusić cię do wzięcia {lewy|sztycha}.',
    },
    {
      type: 'quiz',
      id: 'm5-l25-q2',
      prompt: 'Która karta jest w [[null:Ms]] najgroźniejsza?',
      cards: ['c-7', 'c-8', 'c-9', 's-7', 's-8', 's-10', 'h-7', 'h-8', 'h-9', 'd-A'],
      options: [
        { id: 'a', card: 'd-A' },
        { id: 'b', card: 's-10' },
        { id: 'c', card: 'h-9' },
      ],
      correct: 'a',
      explain:
        '[[Card:d-A]] to jedyna karta w kolorze [[suit:d]] — gdy [[obronca]] w nim wyjdzie, trzeba ją dołożyć i wziąć {lewę|sztycha}.',
    },
    {
      type: 'quiz',
      id: 'm5-l25-q3',
      prompt: 'Którą grę zgłosić z tymi kartami?',
      cards: ['c-7', 'c-8', 's-7', 's-8', 's-9', 'h-7', 'h-9', 'd-7', 'd-8', 'd-10'],
      options: [
        { id: 'a', text: '[[Null]]' },
        { id: 'b', text: '[[GraKolorowa]], [[atu]]: [[suit:s]]' },
        { id: 'c', text: '[[Grand]]' },
      ],
      correct: 'a',
      explain:
        'Bez [[walet:Dlm]] i [[as:Dlm]] trudno wygrać grę z [[atu:Nlm]] — ale do [[null:D]] te karty są idealne.',
    },
    {
      type: 'quiz',
      id: 'm5-l25-q4',
      prompt:
        'W kolorze [[suit:h]] masz tylko [[card:h-7:B]] i [[card:h-A:B]]. Co się stanie, gdy [[obronca:Mlm]] dwa razy zagrają ten kolor?',
      options: [
        { id: 'a', text: 'Za drugim razem trzeba dołożyć [[card:h-A:B]] i wziąć {lewę|sztycha}' },
        { id: 'b', text: 'Nic — zawsze można zejść niżej' },
        { id: 'c', text: 'Można zagrać inny kolor' },
      ],
      correct: 'a',
      explain: 'Po siódemce zostaje tylko [[as]] — a z koloru wyjścia trzeba dołożyć.',
    },
  ],
};
```

- [ ] **Step 4: Rozszerz moduł 5 i uzupełnij specyfikację**

W `src/content/course.ts` dodaj importy `l23`, `l24`, `l25` i ustaw `m5` na `lessons: [l20, l21, l22, l23, l24, l25]`.

W `docs/superpowers/specs/2026-11-12-skat-trainer-design.md` w sekcji 9 dopisz:

```markdown
- **Podział dalszych prac:** Plan 4 — moduł 5; Plan 5 — moduł 6, kontra/re, punkty kontrolne; Plan 6 — dodatek, grafiki z Wikimedia, E2E, wdrożenie.
- **Rozdania w lekcjach taktycznych** wyszukiwane skryptem na silniku i botach (pouczające: dobra decyzja wygrywa, typowy błąd przegrywa); walidator treści ponownie symuluje wzorcowe rozegranie.
- **Przegląd tekstów:** `npm run texts [-- prefiks]` drukuje teksty lekcji w 4 kontekstach (talia × rejestr).
```

- [ ] **Step 5: Uruchom wszystko i przejrzyj teksty**

Run: `npm test && npm run typecheck && npm run build && npm run texts -- m5-l2`
Expected: testy i build PASS. Wydruk przejrzany, a usterki poprawione i opisane w raporcie.

- [ ] **Step 6: Commit**

```bash
git add src/content docs/superpowers/specs/2026-11-12-skat-trainer-design.md
git commit -m "feat(content): lekcje 23–25 — kolory z boku, grand, ręka do nulla" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Sprawdzenie w przeglądarce (wykonuje koordynator)**

Przed testami zapisz `localStorage['skat-trener:v1']` użytkownika, a po testach przywróć go dokładnie w tej postaci. Widok 375 px, „Odblokuj wszystkie lekcje”. Sprawdź:
1. Lekcja 21: ocena dwustopniowa (para dopuszczalna, czyli „Dobry wybór, choć jeszcze lepiej…”).
2. Lekcja 22: mini-rozdanie. Wyjście asami kończy się przegraną, a wyciągnięcie atu wygraną.
3. Lekcja 24: mini-rozdanie w grandzie.
4. Talia francuska i język potoczny w lekcjach 20–25.
5. Konsola bez nowych błędów.
