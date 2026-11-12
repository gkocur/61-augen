// src/content/validate.test.ts
import { describe, expect, it } from 'vitest';
import type { Course, DiscardExerciseData, ExerciseData, Lesson, MiniDealExerciseData } from './types';
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
    expect(validateCourse(courseWith(lessonWith([{ ...deal, mistakes: [['c-J', 'c-A']] }])))).toEqual([
      'l1/d1: błędne rozegranie 1 osiąga cel',
    ]);
    expect(validateCourse(courseWith(lessonWith([{ ...deal, checkpoints: [{ afterTrick: 2, ask: 'yourPoints' }] }])))).toEqual([
      'l1/d1: punkt kontrolny po lewie 2 musi być między 1 a 1',
    ]);
    expect(validateCourse(courseWith(lessonWith([{ ...deal, mistakes: [['h-7', 'c-A']] }])))[0]).toMatch(
      /^l1\/d1: błędne rozegranie 1: niedozwolone zagranie/,
    );
    expect(
      validateCourse(courseWith(lessonWith([{ ...deal, checkpoints: [{ afterTrick: 1, ask: 'yourPoints' }, { afterTrick: 1, ask: 'yourPoints' }] }]))),
    ).toEqual(['l1/d1: powtórzony punkt kontrolny po lewie 1']);
    const nullDeal: MiniDealExerciseData = {
      ...deal, game: { kind: 'null' }, goal: { kind: 'win' },
      checkpoints: [{ afterTrick: 1, ask: 'trumpsPlayed' }, { afterTrick: 2, ask: 'trumpsPlayed' }],
    };
    const nullErrors = validateCourse(courseWith(lessonWith([nullDeal]))).filter((e) => e.includes('w nullu nie ma atu do liczenia'));
    expect(nullErrors).toEqual(['l1/d1: w nullu nie ma atu do liczenia']);
    expect(validateCourse(courseWith(lessonWith([{ ...deal, ouvert: true }])))).toEqual([
      'l1/d1: gra otwarta ma sens tylko, gdy gracz nie jest rozgrywającym',
    ]);
  });

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
    expect(validateCourse(courseWith(lessonWith([{ ...discard, acceptable: [['s-9', 's-10']] }])))).toEqual([
      'l1/k1: para s-10, s-9 jest jednocześnie najlepsza i dopuszczalna',
    ]);
    expect(validateCourse(courseWith(lessonWith([{ ...discard, acceptable: [['s-10', 'h-6' as never]] }])))).toContain(
      'l1/k1: karta h-6 z pary nie jest w ręce',
    );
  });
});
