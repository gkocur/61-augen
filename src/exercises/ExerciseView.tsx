// src/exercises/ExerciseView.tsx
import type { ExerciseData } from '../content/types';
import { DiscardExercise } from './DiscardExercise';
import { MiniDealExercise } from './MiniDealExercise';
import { PlayCardExercise } from './PlayCardExercise';
import { QuizExercise } from './QuizExercise';

interface Props {
  exercise: ExerciseData;
  onAnswered: (correct: boolean) => void;
}

export function ExerciseView({ exercise, onAnswered }: Props) {
  switch (exercise.type) {
    case 'quiz':
      return <QuizExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'playCard':
      return <PlayCardExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'miniDeal':
      return <MiniDealExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'discard':
      return <DiscardExercise exercise={exercise} onAnswered={onAnswered} />;
  }
}
