// src/exercises/evaluatePlay.ts
import { isLegalMove, type CardId } from '../engine';
import type { PlayCardExerciseData } from '../content/types';

export interface PlayEvaluation {
  correct: boolean;
  legal: boolean;
  /** Dodatkowy komunikat (może zawierać tokeny słownika). */
  message: string | null;
}

export function evaluatePlay(exercise: PlayCardExerciseData, card: CardId): PlayEvaluation {
  const legal = isLegalMove(card, exercise.hand, exercise.trick, exercise.game);
  if (!legal) {
    return {
      correct: false,
      legal,
      message: 'Tej karty nie wolno zagrać — masz kartę, którą musisz dołożyć do wyjścia.',
    };
  }
  if (exercise.mode === 'legal' || (exercise.best ?? []).includes(card)) {
    return { correct: true, legal, message: null };
  }
  return {
    correct: false,
    legal,
    message: exercise.wrongExplain?.[card] ?? 'Ta karta jest dozwolona, ale nie najlepsza.',
  };
}
