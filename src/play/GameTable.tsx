// src/play/GameTable.tsx
import { useEffect, useState } from 'react';
import { CardRow, Hand } from '../cards/Hand';
import { OpponentView } from '../cards/OpponentView';
import { SEAT_AT, TrickView } from '../cards/TrickView';
import { legalMoves, nextSeat, sortHand, type CardId, type GameType, type Seat } from '../engine';
import { GameBanner } from '../exercises/GameBanner';
import { botAction, gameActor, playerAt, type GameAction, type GameDeal, type PlayerId } from '../game';
import { useText } from '../state/AppStateContext';
import { BiddingControls, DeclareControls, DiscardControls, KontraControls, SkatControls } from './Controls';
import { DealSummary } from './DealSummary';
import { PLAYER_NAME, speechText } from './labels';
import { Stage3D, useStage3D } from '../three/Stage';
import { buildSceneCards, sideOf } from '../three/sceneCards';
import { SeatTag } from './SeatTag';

const ILLEGAL_HINT = 'Tej karty nie możesz teraz zagrać — musisz dołożyć do wyjścia.';
const SORT_BEFORE_DECLARE: GameType = { kind: 'grand' };

interface Props {
  deal: GameDeal;
  dealNo: number;
  dealer: PlayerId;
  you: Seat;
  onAction: (seat: Seat, action: GameAction) => void;
  onNextDeal: () => void;
  onShowTable: () => void;
  /** Opóźnienie ruchu bota w ms (zakończona lewa jest widoczna 1,5× dłużej). W testach 0. */
  delayMs?: number;
}

/** Ostatnia wypowiedź każdego gracza w licytacji i przy kontrze. */
function speeches(deal: GameDeal): Partial<Record<Seat, string>> {
  const out: Partial<Record<Seat, string>> = {};
  let kontraSaid = false;
  for (const { seat, action } of deal.history) {
    // Po zgłoszeniu gry dymki z licytacji znikają — zostają tylko kontra i re.
    if (action.type === 'declare') for (const s of Object.keys(out)) delete out[Number(s) as Seat];
    const text = speechText(action, kontraSaid);
    if (text !== undefined) out[seat] = text;
    if (action.type === 'double') kontraSaid = true;
  }
  return out;
}

export function GameTable({ deal, dealNo, dealer, you, onAction, onNextDeal, onShowTable, delayMs = 800 }: Props) {
  const t = useText();
  // Po wczytaniu zapisu zakończone lewy są już „obejrzane”.
  const [seenTricks, setSeenTricks] = useState(() => deal.play?.tricks.length ?? 0);
  const [selected, setSelected] = useState<CardId | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [discards, setDiscards] = useState<CardId[]>([]);
  const stage3D = useStage3D();

  const play = deal.play;
  const tricksDone = play?.tricks.length ?? 0;
  const showLast = tricksDone > seenTricks;
  const actor = gameActor(deal);
  const botTurn = actor !== null && actor !== you;

  useEffect(() => {
    if (tricksDone <= seenTricks) return;
    const id = setTimeout(() => setSeenTricks(tricksDone), delayMs * 1.5);
    return () => clearTimeout(id);
  }, [tricksDone, seenTricks, delayMs]);

  // Ruch bota po krótkiej przerwie (po zakończonej lewie — dopiero gdy zniknie ze stołu).
  useEffect(() => {
    if (!botTurn || showLast) return;
    const id = setTimeout(() => onAction(actor, botAction(deal, actor)), delayMs);
    return () => clearTimeout(id);
  }, [deal, actor, botTurn, showLast, onAction, delayMs]);

  const act = (action: GameAction) => onAction(you, action);
  const yourTurn = actor === you && !showLast;
  const game = deal.declaration?.game ?? play?.game ?? SORT_BEFORE_DECLARE;
  const handCards = play ? play.hands[you] : deal.hands[you];
  const legal = yourTurn && deal.phase === 'play' && play ? legalMoves(play.hands[you], play.trick, play.game) : [];

  const clickCard = (card: CardId) => {
    if (!yourTurn || deal.phase !== 'play') return;
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
    act({ type: 'play', card });
  };

  const said = deal.phase === 'bidding' || deal.phase === 'kontra' || deal.phase === 'skat' ? speeches(deal) : {};
  const last = play?.tricks[tricksDone - 1];
  const shown =
    play && play.trick.length === 0 && showLast && last
      ? { cards: last.cards, leader: last.leader }
      : { cards: play?.trick ?? [], leader: play?.leader ?? 0 };
  const name = (seat: Seat) => (seat === you ? 'Ty' : PLAYER_NAME[playerAt(seat, dealer)]);

  let status = '';
  if (showLast && last) status = last.winner === you ? t('Bierzesz [[lewa:B]].') : `${t('[[Lewa:B]] bierze')}: ${name(last.winner)}.`;
  else if (deal.phase === 'done') status = 'Rozdanie zakończone.';
  else if (botTurn) status = `Ruch: ${name(actor)}…`;
  else if (deal.phase === 'play') status = play!.trick.length === 0 ? 'Twój ruch — wychodzisz.' : 'Twój ruch.';
  else status = 'Twój ruch.';

  if (stage3D) {
    const discarding = yourTurn && deal.phase === 'discard';
    const playing = deal.phase === 'play';
    const showingLast = Boolean(play && play.trick.length === 0 && showLast && last);
    const hands = play ? play.hands : deal.hands;
    const left = nextSeat(you, 1);
    const right = nextSeat(you, 2);
    const cards = buildSceneCards({
      you,
      hand: sortHand(handCards, game),
      left: hands[left],
      right: hands[right],
      trick: play ? shown : undefined,
      taken: play ? (showingLast ? play.tricks.slice(0, -1) : play.tricks) : [],
      skat: { cards: deal.skat.length > 0 ? deal.skat : (play?.skat ?? []), faceUp: deal.phase === 'done' },
    });
    const toggleDiscard = (card: CardId) =>
      setDiscards((cur) => (cur.includes(card) ? cur.filter((c) => c !== card) : cur.length < 2 ? [...cur, card] : cur));
    const tag = (seat: Seat) => (
      <SeatTag
        side={sideOf(seat, you)}
        name={name(seat)}
        seat={seat}
        cardCount={hands[seat].length}
        isDeclarer={seat === deal.declarer}
        active={actor === seat && !showLast}
        speech={said[seat]}
      />
    );
    return (
      <section className="game-table game-table--3d">
        <Stage3D
          className="stage--game"
          label="Stół do gry"
          cards={cards}
          selected={discarding ? discards : selected ? [selected] : []}
          dimmed={yourTurn && playing ? (card) => !legal.includes(card) : undefined}
          onCardClick={discarding ? toggleDiscard : yourTurn && playing ? clickCard : undefined}
          activeSide={playing && actor !== null && !showLast ? sideOf(actor, you) : null}
        >
          <div className="hud__top">
            {tag(left)}
            <div className="hud__center">
              <p className="hud__deal">
                Rozdanie {dealNo}, {t(`siedzisz na ${SEAT_AT[you]}`)}
                {deal.bid !== null && `, stawka ${deal.bid}`}
                {deal.doubling && `, ${deal.doubling}`}
                {deal.hand && t(', [[reka]]')}
              </p>
              {(deal.declaration || play?.game.kind === 'ramsch') && <GameBanner game={game} />}
            </div>
            {tag(right)}
          </div>

          {yourTurn && deal.phase !== 'play' && (
            <div className="hud__panel">
              {deal.phase === 'bidding' && <BiddingControls deal={deal} you={you} onAction={act} />}
              {deal.phase === 'skat' && <SkatControls deal={deal} you={you} onAction={act} />}
              {deal.phase === 'declare' && <DeclareControls deal={deal} you={you} onAction={act} />}
              {deal.phase === 'kontra' && <KontraControls deal={deal} you={you} onAction={act} />}
              {discarding && (
                <div className="game-bar game-bar--column" role="group" aria-label={t('Wyrzucanie do [[skat:D]]')}>
                  <p className="game-bar__info">{t('Wybierz 2 karty do [[skat:D]].')} Wybrane: {discards.length} z 2.</p>
                  <button
                    type="button"
                    className="button button--primary"
                    disabled={discards.length !== 2}
                    onClick={() => discards.length === 2 && act({ type: 'discard', cards: [discards[0], discards[1]] })}
                  >
                    {t('Wyrzuć do [[skat:D]]')}
                  </button>
                </div>
              )}
            </div>
          )}

          {deal.phase === 'done' && (
            <div className="hud__panel hud__panel--summary">
              <DealSummary deal={deal} dealer={dealer} you={you} onNextDeal={onNextDeal} onShowTable={onShowTable} />
              {play && (
                <figure className="game-table__skat">
                  <CardRow cards={deal.skat} />
                  <figcaption>{t('[[Skat]]')}</figcaption>
                </figure>
              )}
            </div>
          )}

          {deal.phase !== 'done' && (
            <div className="hud__low">
              {said[you] && <p className="hud__said">Twoja odpowiedź: {said[you]}</p>}
              <p className={`hud__status${yourTurn ? ' hud__status--you' : ''}`} aria-live="polite">
                {status}
              </p>
              <p className="hud__hint" role="status">
                {hint ?? (yourTurn && playing && selected ? 'Dotknij karty jeszcze raz, żeby ją zagrać.' : '')}
              </p>
            </div>
          )}
        </Stage3D>
      </section>
    );
  }

  return (
    <section className="game-table">
      <p className="game-table__head">
        Rozdanie {dealNo} · {t(`Siedzisz na ${SEAT_AT[you]}`)}
        {deal.bid !== null && ` · stawka ${deal.bid}`}
        {deal.doubling && ` · ${deal.doubling}`}
        {deal.hand && t(' · [[reka]]')}
      </p>
      {(deal.declaration || play?.game.kind === 'ramsch') && <GameBanner game={game} />}
      <div className="mini-deal__opponents">
        {[nextSeat(you, 1), nextSeat(you, 2)].map((seat) => (
          <OpponentView
            key={seat}
            seat={seat}
            player={name(seat)}
            cardCount={(play ? play.hands[seat] : deal.hands[seat]).length}
            isDeclarer={seat === deal.declarer}
            active={actor === seat && !showLast}
            speech={said[seat]}
          />
        ))}
      </div>

      {play && deal.phase !== 'done' && <TrickView cards={shown.cards} leader={shown.leader} you={you} emptyText="Stół jest pusty." />}

      <p className="mini-deal__status" aria-live="polite">
        {status}
      </p>
      {said[you] && <p className="game-table__you-said">Twoja odpowiedź: {said[you]}</p>}

      {yourTurn && deal.phase === 'bidding' && <BiddingControls deal={deal} you={you} onAction={act} />}
      {yourTurn && deal.phase === 'skat' && <SkatControls deal={deal} you={you} onAction={act} />}
      {yourTurn && deal.phase === 'discard' && <DiscardControls deal={deal} you={you} onAction={act} />}
      {yourTurn && deal.phase === 'declare' && <DeclareControls deal={deal} you={you} onAction={act} />}
      {yourTurn && deal.phase === 'kontra' && <KontraControls deal={deal} you={you} onAction={act} />}

      {deal.phase === 'done' && <DealSummary deal={deal} dealer={dealer} you={you} onNextDeal={onNextDeal} onShowTable={onShowTable} />}

      {!(deal.phase === 'discard' && yourTurn) && deal.phase !== 'done' && (
        <>
          <p className="hint hint--warn" role="status">
            {hint}
          </p>
          <Hand
            cards={sortHand(handCards, game)}
            selected={selected}
            isDimmed={yourTurn && deal.phase === 'play' ? (card) => !legal.includes(card) : undefined}
            onCardClick={clickCard}
            disabled={!(yourTurn && deal.phase === 'play')}
          />
        </>
      )}
      {deal.phase === 'done' && play && (
        <figure className="game-table__skat">
          <CardRow cards={deal.skat} />
          <figcaption>{t('[[Skat]]')}</figcaption>
        </figure>
      )}
    </section>
  );
}
