// src/exercises/DiscardExercise.tsx
import { useMemo, useState } from 'react';
import { PlayingCard } from '../cards/PlayingCard';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import type { DiscardExerciseData } from '../content/types';
import { sortHand, sumPoints, type CardId } from '../engine';
import { countCase, pluralPl } from '../glossary';
import { useText } from '../state/AppStateContext';
import { isBestDiscard } from './evaluateDiscard';
import { GameBanner } from './GameBanner';

interface Props {
  exercise: DiscardExerciseData;
  onAnswered: (correct: boolean) => void;
}

export function DiscardExercise({ exercise, onAnswered }: Props) {
  const t = useText();
  const cards = useMemo(() => sortHand(exercise.cards, exercise.game), [exercise]);
  const [selected, setSelected] = useState<CardId[]>([]);
  const [done, setDone] = useState(false);

  const toggle = (card: CardId) => {
    if (done) return;
    setSelected((current) => {
      if (current.includes(card)) return current.filter((c) => c !== card);
      return current.length < 2 ? [...current, card] : current;
    });
  };

  const confirm = () => {
    if (done || selected.length !== 2) return;
    setDone(true);
    onAnswered(isBestDiscard(exercise, selected));
  };

  const correct = done && isBestDiscard(exercise, selected);
  const points = sumPoints(selected);
  const [bestA, bestB] = exercise.best[0];

  return (
    <section className="exercise">
      <div className="exercise__prompt">
        <RichText text={exercise.prompt} />
      </div>
      <GameBanner game={exercise.game} />
      <ul className="card-row" aria-label="Twoje karty">
        {cards.map((card) => (
          <li key={card}>
            <PlayingCard card={card} selected={selected.includes(card)} disabled={done} onClick={() => toggle(card)} />
          </li>
        ))}
      </ul>
      {!done && <p className="hint">Wybrane: {selected.length} z 2.</p>}
      <div className="exercise__actions">
        <button type="button" className="button button--primary" disabled={done || selected.length !== 2} onClick={confirm}>
          {t('Wyrzuć do [[skat:D]]')}
        </button>
      </div>
      <div className="feedback-region" role="status">
        {done && (
          <Feedback correct={correct}>
            <p>{t(`Do [[skat:D]] ${pluralPl(points, ['trafia', 'trafiają', 'trafia'])} ${points} [[oczko:${countCase(points)}]].`)}</p>
            {!correct && <RichText text={`Lepszy wybór: [[card:${bestA}]] i [[card:${bestB}]].`} />}
            {!correct && exercise.wrongExplain && <RichText text={exercise.wrongExplain} />}
            <RichText text={exercise.explain} />
          </Feedback>
        )}
      </div>
    </section>
  );
}
