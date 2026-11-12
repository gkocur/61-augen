// src/exercises/MiniDealExercise.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { CardRow, Hand } from '../cards/Hand';
import { OpponentView } from '../cards/OpponentView';
import { SEAT_LABEL, TrickView } from '../cards/TrickView';
import { Feedback } from '../components/Feedback';
import { RichText } from '../components/RichText';
import { checkpointAnswer, checkpointOptions, isGoalReached, miniDealBots, startMiniDeal, teamPoints } from '../content/miniDeal';
import type { CheckpointAsk, MiniDealCheckpoint, MiniDealExerciseData } from '../content/types';
import { currentPlayer, isDealOver, legalMoves, nextSeat, playCard, sortHand, type CardId } from '../engine';
import { countCase } from '../glossary';
import { useText } from '../state/AppStateContext';
import { GameBanner } from './GameBanner';

const ILLEGAL_HINT = 'Tej karty nie możesz teraz zagrać — musisz dołożyć do wyjścia.';

const CHECKPOINT_PROMPT: Record<CheckpointAsk, string> = {
  yourPoints: 'Ile [[oczko:Dlm]] ma teraz twoja strona?',
  trumpsPlayed: 'Ile [[atu:Dlm]] już wyszło?',
};

interface CheckResult {
  afterTrick: number;
  correctValue: number;
  chosen: number;
}

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
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const bots = useMemo(() => miniDealBots(exercise), [exercise]);
  const reported = useRef(false);
  const firstOption = useRef<HTMLButtonElement>(null);

  const over = isDealOver(deal);
  const tricksDone = deal.tricks.length;
  // Pochodne od liczby lew (bez opóźnienia o jeden render), żeby wynik nie mignął przed pokazaniem ostatniej lewy.
  const showLast = tricksDone > seenTricks;
  const pending: MiniDealCheckpoint | undefined =
    !over && !showLast
      ? exercise.checkpoints?.find((c) => c.afterTrick === tricksDone && !checks.some((r) => r.afterTrick === c.afterTrick))
      : undefined;
  const current = currentPlayer(deal);
  const yourTurn = !over && !showLast && !pending && current === you;
  const legal = yourTurn ? legalMoves(deal.hands[you], deal.trick, deal.game) : [];
  const last = deal.tricks[tricksDone - 1];

  // Po zakończonej lewie pokazujemy ją przez chwilę.
  useEffect(() => {
    if (tricksDone <= seenTricks) return;
    const id = setTimeout(() => setSeenTricks(tricksDone), delayMs * 1.5);
    return () => clearTimeout(id);
  }, [tricksDone, seenTricks, delayMs]);

  // Ruch bota (wstrzymany na czas pytania).
  useEffect(() => {
    if (over || showLast || pending || current === you) return;
    const id = setTimeout(() => setDeal((d) => {
        if (isDealOver(d)) return d;
        const seat = currentPlayer(d);
        return seat === you ? d : playCard(d, bots[seat](d, seat));
      }), delayMs);
    return () => clearTimeout(id);
  }, [deal, over, showLast, pending, current, you, bots, delayMs]);

  const pendingTrick = pending?.afterTrick;
  useEffect(() => {
    if (pendingTrick !== undefined) firstOption.current?.focus();
  }, [pendingTrick]);

  const checksOk = checks.every((r) => r.chosen === r.correctValue);
  const reached = over && isGoalReached(exercise, deal) && checksOk;
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
    setDeal((d) =>
      !isDealOver(d) && currentPlayer(d) === you && legalMoves(d.hands[you], d.trick, d.game).includes(card)
        ? playCard(d, card)
        : d,
    );
  };

  const answerCheckpoint = (checkpoint: MiniDealCheckpoint, value: number) => {
    const correctValue = checkpointAnswer(exercise, deal, checkpoint.ask);
    setChecks((list) =>
      list.some((r) => r.afterTrick === checkpoint.afterTrick)
        ? list
        : [...list, { afterTrick: checkpoint.afterTrick, correctValue, chosen: value }],
    );
  };

  const shown =
    deal.trick.length === 0 && showLast && last
      ? { cards: last.cards, leader: last.leader }
      : { cards: deal.trick, leader: deal.leader };

  let status: string;
  if (showLast && last) {
    status = last.winner === you ? t('Bierzesz [[lewa:B]].') : t(`[[Lewa:B]] bierze: ${SEAT_LABEL[last.winner]}.`);
  } else if (over) {
    status = 'Rozdanie zakończone.';
  } else if (pending) {
    status = 'Pauza — odpowiedz na pytanie.';
  } else if (yourTurn) {
    status = deal.trick.length === 0 ? 'Twój ruch — wychodzisz.' : 'Twój ruch.';
  } else {
    status = `Ruch: ${t(SEAT_LABEL[current])}…`;
  }

  const points = teamPoints(exercise, deal);
  const pointsText = (n: number) => `${n} ${t(`[[oczko:${countCase(n)}]]`)}`;

  const lastCheck = checks[checks.length - 1];
  const goodChecks = checks.filter((r) => r.chosen === r.correctValue).length;

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
            active={!over && !pending && current === seat}
          />
        ))}
      </div>
      {exercise.ouvert && you !== declarer && (
        <div className="mini-deal__open">
          <p className="mini-deal__open-label">{t('Karty [[rozgrywajacy:D]] — [[otwarta]]')}</p>
          <CardRow cards={sortHand(deal.hands[declarer], deal.game)} />
        </div>
      )}
      <TrickView cards={shown.cards} leader={shown.leader} you={you} emptyText="Stół jest pusty." />
      <p className="mini-deal__status" aria-live="polite">
        {status}
      </p>
      {pending && (
        <div className="checkpoint" role="group" aria-label="Pytanie w trakcie gry">
          <p className="checkpoint__prompt">{t(CHECKPOINT_PROMPT[pending.ask])}</p>
          <div className="checkpoint__options">
            {checkpointOptions(checkpointAnswer(exercise, deal, pending.ask), pending.ask, exercise.game, pending.afterTrick).map((value, i) => (
              <button key={value} ref={i === 0 ? firstOption : undefined} type="button" className="option" onClick={() => answerCheckpoint(pending, value)}>
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
      {exercise.checkpoints && exercise.checkpoints.length > 0 && (
        <p className="checkpoint__result" role="status">
          {!pending && lastCheck
            ? `${lastCheck.chosen === lastCheck.correctValue ? 'Dobra odpowiedź.' : 'Zła odpowiedź.'} Poprawnie: ${lastCheck.correctValue}.`
            : ''}
        </p>
      )}
      <p className="mini-deal__score">
        Twoja strona: {pointsText(points.yours)} · druga strona: {pointsText(points.theirs)}
      </p>
      <p className="hint hint--warn" role="status">
        {hint}
      </p>
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
            {checks.length > 0 && (
              <p>
                Pytania w trakcie gry: {goodChecks} z {checks.length} poprawnie.
              </p>
            )}
            <RichText text={exercise.explain} />
          </Feedback>
        )}
      </div>
    </section>
  );
}
