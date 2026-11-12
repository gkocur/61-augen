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
