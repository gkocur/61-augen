// src/exercises/MiniDealExercise.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Hand } from '../cards/Hand';
import { OpponentView } from '../cards/OpponentView';
import { SEAT_LABEL, TrickView } from '../cards/TrickView';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import { isGoalReached, miniDealBots, startMiniDeal, teamPoints } from '../content/miniDeal';
import type { MiniDealExerciseData } from '../content/types';
import { currentPlayer, isDealOver, legalMoves, nextSeat, playCard, sortHand, type CardId } from '../engine';
import { countCase } from '../glossary';
import { useText } from '../state/AppStateContext';
import { GameBanner } from './GameBanner';

const ILLEGAL_HINT = 'Tej karty nie możesz teraz zagrać — musisz dołożyć do wyjścia.';

interface Props {
  exercise: MiniDealExerciseData;
  onAnswered: (correct: boolean) => void;
  /** Opóźnienie ruchu bota w ms (zakończona lewa jest widoczna 1,5× dłużej). W testach 0. */
  delayMs?: number;
}

export function MiniDealExercise({ exercise, onAnswered, delayMs = 700 }: Props) {
  const t = useText();
  const { you, declarer } = exercise;
  const [deal, setDeal] = useState(() => startMiniDeal(exercise));
  const [seenTricks, setSeenTricks] = useState(0);
  const [selected, setSelected] = useState<CardId | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const bots = useMemo(() => miniDealBots(exercise), [exercise]);
  const reported = useRef(false);

  const over = isDealOver(deal);
  const tricksDone = deal.tricks.length;
  // Pochodne od liczby lew (bez opóźnienia o jeden render), żeby wynik nie mignął przed pokazaniem ostatniej lewy.
  const showLast = tricksDone > seenTricks;
  const current = currentPlayer(deal);
  const yourTurn = !over && !showLast && current === you;
  const legal = yourTurn ? legalMoves(deal.hands[you], deal.trick, deal.game) : [];
  const last = deal.tricks[tricksDone - 1];

  // Po zakończonej lewie pokazujemy ją przez chwilę.
  useEffect(() => {
    if (tricksDone <= seenTricks) return;
    const id = setTimeout(() => setSeenTricks(tricksDone), delayMs * 1.5);
    return () => clearTimeout(id);
  }, [tricksDone, seenTricks, delayMs]);

  // Ruch bota.
  useEffect(() => {
    if (over || showLast || current === you) return;
    const id = setTimeout(() => setDeal((d) => playCard(d, bots[current](d, current))), delayMs);
    return () => clearTimeout(id);
  }, [deal, over, showLast, current, you, bots, delayMs]);

  const reached = over && isGoalReached(exercise, deal);
  useEffect(() => {
    if (!over || showLast || reported.current) return;
    reported.current = true;
    onAnswered(reached);
  }, [over, showLast, reached, onAnswered]);

  const handleClick = (card: CardId) => {
    if (!yourTurn) return;
    if (!legal.includes(card)) {
      setHint(ILLEGAL_HINT);
      setSelected(null);
      return;
    }
    setHint(null);
    if (selected !== card) {
      setSelected(card);
      return;
    }
    setSelected(null);
    setDeal((d) => playCard(d, card));
  };

  const shown =
    deal.trick.length === 0 && showLast && last
      ? { cards: last.cards, leader: last.leader }
      : { cards: deal.trick, leader: deal.leader };

  let status: string;
  if (showLast && last) {
    status = last.winner === you ? t('Bierzesz {lewę|sztycha}.') : t(`{Lewę|Sztycha} bierze: ${SEAT_LABEL[last.winner]}.`);
  } else if (over) {
    status = 'Rozdanie zakończone.';
  } else if (yourTurn) {
    status = deal.trick.length === 0 ? 'Twój ruch — wychodzisz.' : 'Twój ruch.';
  } else {
    status = `Ruch: ${t(SEAT_LABEL[current])}…`;
  }

  const points = teamPoints(exercise, deal);
  const pointsText = (n: number) => `${n} ${t(`[[oczko:${countCase(n)}]]`)}`;

  return (
    <section className="exercise mini-deal">
      <div className="exercise__prompt">
        <RichText text={exercise.prompt} />
      </div>
      <GameBanner game={exercise.game} />
      <div className="mini-deal__opponents">
        {[nextSeat(you, 1), nextSeat(you, 2)].map((seat) => (
          <OpponentView
            key={seat}
            seat={seat}
            cardCount={deal.hands[seat].length}
            isDeclarer={seat === declarer}
            active={!over && current === seat}
          />
        ))}
      </div>
      <TrickView cards={shown.cards} leader={shown.leader} you={you} emptyText="Stół jest pusty." />
      <p className="mini-deal__status" aria-live="polite">
        {status}
      </p>
      <p className="mini-deal__score">
        Twoja strona: {pointsText(points.yours)} · druga strona: {pointsText(points.theirs)}
      </p>
      {hint && <p className="hint hint--warn">{hint}</p>}
      <Hand
        cards={sortHand(deal.hands[you], deal.game)}
        selected={selected}
        isDimmed={yourTurn ? (card) => !legal.includes(card) : undefined}
        onCardClick={handleClick}
        disabled={!yourTurn}
      />
      <p className="mini-deal__seat">
        Twoje miejsce: {t(SEAT_LABEL[you])}
        {you === declarer ? t(' · [[rozgrywajacy]]') : ''}
      </p>
      <div className="feedback-region" role="status">
        {over && !showLast && (
          <Feedback correct={reached}>
            <p>
              Wynik: twoja strona {pointsText(points.yours)}, druga strona {pointsText(points.theirs)}.
            </p>
            <RichText text={exercise.explain} />
          </Feedback>
        )}
      </div>
    </section>
  );
}
