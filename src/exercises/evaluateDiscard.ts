// src/exercises/evaluateDiscard.ts
import type { CardId } from '../engine';
import type { DiscardExerciseData } from '../content/types';

export function isBestDiscard(exercise: DiscardExerciseData, pair: readonly CardId[]): boolean {
  return pair.length === 2 && exercise.best.some((best) => best.length === 2 && best.every((card) => pair.includes(card)));
}
