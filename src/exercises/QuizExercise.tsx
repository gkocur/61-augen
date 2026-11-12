// src/exercises/QuizExercise.tsx
import { useState } from 'react';
import { CardRow } from '../cards/Hand';
import { PlayingCard } from '../cards/PlayingCard';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import type { QuizExerciseData } from '../content/types';
import { useText } from '../state/AppStateContext';

interface Props {
  exercise: QuizExerciseData;
  onAnswered: (correct: boolean) => void;
}

export function QuizExercise({ exercise, onAnswered }: Props) {
  const t = useText();
  const [chosen, setChosen] = useState<string | null>(null);
  const answered = chosen !== null;

  const choose = (id: string) => {
    if (answered) return;
    setChosen(id);
    onAnswered(id === exercise.correct);
  };

  const optionState = (id: string) => {
    if (!answered) return '';
    if (id === exercise.correct) return 'option--correct';
    return id === chosen ? 'option--wrong' : '';
  };

  const cardOptions = exercise.options.every((option) => option.card !== undefined);

  return (
    <section className="exercise">
      <div className="exercise__prompt">
        <RichText text={exercise.prompt} />
      </div>
      {exercise.cards && <CardRow cards={exercise.cards} />}
      <div className={cardOptions ? 'options options--cards' : 'options'}>
        {exercise.options.map((option) =>
          option.card ? (
            <div key={option.id} className={`option-card ${optionState(option.id)}`}>
              <PlayingCard
                card={option.card}
                selected={option.id === chosen}
                disabled={answered}
                onClick={() => choose(option.id)}
              />
            </div>
          ) : (
            <button
              key={option.id}
              type="button"
              className={`option ${optionState(option.id)}`}
              disabled={answered}
              onClick={() => choose(option.id)}
            >
              {t(option.text ?? '')}
            </button>
          ),
        )}
      </div>
      <div className="feedback-region" role="status">
        {answered && (
          <Feedback correct={chosen === exercise.correct}>
            <RichText text={exercise.explain} />
          </Feedback>
        )}
      </div>
    </section>
  );
}
