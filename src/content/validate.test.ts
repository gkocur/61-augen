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
