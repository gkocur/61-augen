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
