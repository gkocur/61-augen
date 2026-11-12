// src/ui/LessonPlayer.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CardRow } from '../cards/Hand';
import { RichText } from '../components/RichText';
import { pickExercises } from '../content/pick';
import type { Lesson } from '../content/types';
import { ExerciseView } from '../exercises/ExerciseView';
import { useText } from '../state/AppStateContext';
import { isPassingScore } from '../state/progress';

type Phase = { kind: 'theory'; index: number } | { kind: 'exercise'; index: number } | { kind: 'summary' };

interface Props {
  lesson: Lesson;
  lessonNumber: number;
  onFinish: (score: number) => void;
  nextLessonPath: string | null;
}

export function LessonPlayer({ lesson, lessonNumber, onFinish, nextLessonPath }: Props) {
  const t = useText();
  const firstPhase = (): Phase => (lesson.steps.length > 0 ? { kind: 'theory', index: 0 } : { kind: 'exercise', index: 0 });
  const [attempt, setAttempt] = useState(0);
  const [exercises, setExercises] = useState(() => pickExercises(lesson));
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<Phase>(firstPhase);

  const total = lesson.steps.length + exercises.length;
  const position =
    phase.kind === 'theory' ? phase.index : phase.kind === 'exercise' ? lesson.steps.length + phase.index : total;
  const answeredCurrent = phase.kind === 'exercise' && results.length > phase.index;
  const correctCount = results.filter(Boolean).length;

  const handleAnswered = (index: number) => (correct: boolean) => {
    setResults((r) => (r.length > index ? r : [...r, correct]));
  };

  const next = () => {
    if (phase.kind === 'theory') {
      setPhase(
        phase.index + 1 < lesson.steps.length ? { kind: 'theory', index: phase.index + 1 } : { kind: 'exercise', index: 0 },
      );
    } else if (phase.kind === 'exercise') {
      if (phase.index + 1 < exercises.length) {
        setPhase({ kind: 'exercise', index: phase.index + 1 });
      } else {
        onFinish(correctCount / exercises.length);
        setPhase({ kind: 'summary' });
      }
    }
  };

  const restart = (fromTheory: boolean) => {
    setAttempt((a) => a + 1);
    setExercises(pickExercises(lesson));
    setResults([]);
    setPhase(fromTheory ? firstPhase() : { kind: 'exercise', index: 0 });
  };

  return (
    <article className="lesson">
      <h1 className="lesson__title">
        Lekcja {lessonNumber}: {t(lesson.title)}
      </h1>
      <progress className="lesson__progress" max={total} value={position} aria-label="Postęp lekcji" />

      {phase.kind === 'theory' && <TheoryView lesson={lesson} index={phase.index} />}

      {phase.kind === 'exercise' && (
        <>
          <p className="lesson__counter">
            Zadanie {phase.index + 1} z {exercises.length}
          </p>
          <ExerciseView
            key={`${attempt}-${phase.index}`}
            exercise={exercises[phase.index]}
            onAnswered={handleAnswered(phase.index)}
          />
        </>
      )}

      {phase.kind === 'summary' && (
        <Summary
          correct={correctCount}
          total={exercises.length}
          nextLessonPath={nextLessonPath}
          hasTheory={lesson.steps.length > 0}
          onRetry={() => restart(false)}
          onTheory={() => restart(true)}
        />
      )}

      {(phase.kind === 'theory' || answeredCurrent) && (
        <div className="lesson__actions">
          <button type="button" className="button button--primary" onClick={next}>
            {phase.kind === 'exercise' && phase.index + 1 === exercises.length ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      )}
    </article>
  );
}

function TheoryView({ lesson, index }: { lesson: Lesson; index: number }) {
  const t = useText();
  const step = lesson.steps[index];
  return (
    <section className="theory">
      {step.title && <h2>{t(step.title)}</h2>}
      <RichText text={step.text} />
      {step.cards && (
        <figure className="theory__cards">
          <CardRow cards={step.cards} />
          {step.cardsCaption && <figcaption>{t(step.cardsCaption)}</figcaption>}
        </figure>
      )}
    </section>
  );
}

interface SummaryProps {
  correct: number;
  total: number;
  nextLessonPath: string | null;
  hasTheory: boolean;
  onRetry: () => void;
  onTheory: () => void;
}

function Summary({ correct, total, nextLessonPath, hasTheory, onRetry, onTheory }: SummaryProps) {
  const score = correct / total;
  const passed = isPassingScore(score);
  return (
    <section className="summary">
      <h2>{passed ? 'Lekcja zaliczona!' : 'Jeszcze nie tym razem'}</h2>
      <p>
        Wynik: {correct} z {total} ({Math.round(score * 100)}%).
      </p>
      {!passed && <p>Do zaliczenia potrzeba co najmniej 80%.</p>}
      <div className="summary__actions">
        {passed && nextLessonPath && (
          <Link className="button button--primary" to={nextLessonPath}>
            Następna lekcja
          </Link>
        )}
        <button type="button" className="button" onClick={onRetry}>
          Spróbuj ponownie
        </button>
        {hasTheory && (
          <button type="button" className="button" onClick={onTheory}>
            Wróć do teorii
          </button>
        )}
        <Link className="button" to="/">
          Mapa kursu
        </Link>
      </div>
    </section>
  );
}
