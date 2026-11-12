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
});

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
