// src/exercises/PlayCardExercise.tsx
import { useMemo, useState } from 'react';
import { Hand } from '../cards/Hand';
import { TrickView } from '../cards/TrickView';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import type { PlayCardExerciseData } from '../content/types';
import { legalMoves, nextSeat, sortHand, type CardId } from '../engine';
import { Stage3D, useStage3D } from '../three/Stage';
import { buildSceneCards } from '../three/sceneCards';
import { evaluatePlay } from './evaluatePlay';
import { GameBanner } from './GameBanner';

interface Props {
  exercise: PlayCardExerciseData;
  onAnswered: (correct: boolean) => void;
}

export function PlayCardExercise({ exercise, onAnswered }: Props) {
  const you = nextSeat(exercise.leader, exercise.trick.length);
  const hand = useMemo(() => sortHand(exercise.hand, exercise.game), [exercise]);
  const legal = useMemo(() => legalMoves(exercise.hand, exercise.trick, exercise.game), [exercise]);
  const [selected, setSelected] = useState<CardId | null>(null);
  const [played, setPlayed] = useState<CardId | null>(null);
  const stage3D = useStage3D();

  const handleClick = (card: CardId) => {
    if (played) return;
    if (selected !== card) {
      setSelected(card);
      return;
    }
    setPlayed(card);
    onAnswered(evaluatePlay(exercise, card).correct);
  };

  const result = played ? evaluatePlay(exercise, played) : null;

  return (
    <section className="exercise">
      <div className="exercise__prompt">
        <RichText text={exercise.prompt} />
      </div>
      {exercise.showGame !== false && <GameBanner game={exercise.game} />}
      {stage3D ? (
        <Stage3D
          className="stage--inline"
          label="Karty na stole i twoja ręka"
          cards={buildSceneCards({
            you,
            hand: hand.filter((card) => card !== played),
            trick: { cards: played ? [...exercise.trick, played] : exercise.trick, leader: exercise.leader },
          })}
          selected={selected && !played ? [selected] : []}
          dimmed={exercise.showLegal ? (card) => !legal.includes(card) : undefined}
          onCardClick={played ? undefined : handleClick}
          activeSide={played ? null : 'you'}
        >
          {!played && (
            <div className="hud__low">
              <p className="hud__hint">
                {selected ? 'Dotknij karty jeszcze raz, żeby ją zagrać.' : exercise.trick.length === 0 ? 'Stół jest pusty — wychodzisz pierwszy.' : 'Dotknij kartę, aby ją wybrać.'}
              </p>
            </div>
          )}
        </Stage3D>
      ) : (
        <>
          <TrickView cards={played ? [...exercise.trick, played] : exercise.trick} leader={exercise.leader} you={you} />
          {!played && <p className="hint">Dotknij kartę, aby ją wybrać, i dotknij jej ponownie, aby zagrać.</p>}
          <Hand
            cards={hand.filter((card) => card !== played)}
            selected={selected}
            isDimmed={exercise.showLegal ? (card) => !legal.includes(card) : undefined}
            onCardClick={handleClick}
            disabled={played !== null}
          />
        </>
      )}
      <div className="feedback-region" role="status">
        {result && (
          <Feedback correct={result.correct}>
            {result.message && <RichText text={result.message} />}
            <RichText text={exercise.explain} />
          </Feedback>
        )}
      </div>
    </section>
  );
}
