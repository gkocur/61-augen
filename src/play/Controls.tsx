// src/play/Controls.tsx
import { useState } from 'react';
import { PlayingCard } from '../cards/PlayingCard';
import { SUITS, nullValue, sortHand, type Announcement, type CardId, type GameType, type Seat } from '../engine';
import { FIRST_BID, allowedBids, type GameAction, type GameDeal } from '../game';
import { useText } from '../state/AppStateContext';
import { gameShortName } from './labels';

interface ControlsProps {
  deal: GameDeal;
  you: Seat;
  onAction: (action: GameAction) => void;
}

/** Przyciski licytacji: kolejna stawka / „tak” / „pas” (albo „gram za 18” w ostatnim etapie). */
export function BiddingControls({ deal, onAction }: ControlsProps) {
  const a = deal.auction;
  const pass = (
    <button type="button" className="button" onClick={() => onAction({ type: 'pass' })}>
      Pas
    </button>
  );
  if (a.stage === 3) {
    return (
      <div className="game-bar" role="group" aria-label="Licytacja">
        <p className="game-bar__info">Nikt nie licytował. Możesz zagrać za {FIRST_BID} albo spasować.</p>
        <button type="button" className="button button--primary" onClick={() => onAction({ type: 'bid', value: FIRST_BID })}>
          Gram za {FIRST_BID}
        </button>
        {pass}
      </div>
    );
  }
  if (a.turn === 'listener') {
    return (
      <div className="game-bar" role="group" aria-label="Licytacja">
        <button type="button" className="button button--primary" onClick={() => onAction({ type: 'hold' })}>
          Tak ({a.highest})
        </button>
        {pass}
      </div>
    );
  }
  const next = allowedBids(a)[0];
  return (
    <div className="game-bar" role="group" aria-label="Licytacja">
      {next !== undefined && (
        <button type="button" className="button button--primary" onClick={() => onAction({ type: 'bid', value: next })}>
          Mówię {next}
        </button>
      )}
      {pass}
    </div>
  );
}

/** Podniesienie skata albo gra z ręki. */
export function SkatControls({ onAction }: ControlsProps) {
  const t = useText();
  return (
    <div className="game-bar" role="group" aria-label={t('[[Skat]]')}>
      <button type="button" className="button button--primary" onClick={() => onAction({ type: 'takeSkat' })}>
        {t('Podnieś [[skat:B]]')}
      </button>
      <button type="button" className="button" onClick={() => onAction({ type: 'playHand' })}>
        {t('{Graj z ręki|Graj handa}')}
      </button>
    </div>
  );
}

/** Wybór 2 kart z 12 do wyrzucenia do skata. */
export function DiscardControls({ deal, you, onAction }: ControlsProps) {
  const t = useText();
  const [selected, setSelected] = useState<CardId[]>([]);
  const cards = sortHand(deal.hands[you], { kind: 'grand' });
  const toggle = (card: CardId) =>
    setSelected((cur) => (cur.includes(card) ? cur.filter((c) => c !== card) : cur.length < 2 ? [...cur, card] : cur));
  return (
    <div className="game-bar game-bar--column" role="group" aria-label={t('Wyrzucanie do [[skat:D]]')}>
      <p className="game-bar__info">{t('Wybierz 2 karty do [[skat:D]].')}</p>
      <ul className="card-row" aria-label="Twoje karty">
        {cards.map((card) => (
          <li key={card}>
            <PlayingCard card={card} selected={selected.includes(card)} onClick={() => toggle(card)} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="button button--primary"
        disabled={selected.length !== 2}
        onClick={() => selected.length === 2 && onAction({ type: 'discard', cards: [selected[0], selected[1]] })}
      >
        {t('Wyrzuć do [[skat:D]]')}
      </button>
    </div>
  );
}

const GAMES: GameType[] = [...SUITS.map((trump) => ({ kind: 'suit', trump }) as GameType), { kind: 'grand' }, { kind: 'null' }];
const sameGame = (a: GameType, b: GameType) => JSON.stringify(a) === JSON.stringify(b);

/** Zgłoszenie gry: rodzaj gry, a przy grze z ręki także zapowiedź. */
export function DeclareControls({ deal, onAction }: ControlsProps) {
  const t = useText();
  const [game, setGame] = useState<GameType | null>(null);
  const [announce, setAnnounce] = useState<Announcement>('none');
  const bid = deal.bid!;
  const nullAllowed = (a: Announcement) => nullValue({ game: { kind: 'null' }, hand: deal.hand, announce: a }) >= bid;
  const announcements: { value: Announcement; label: string }[] =
    game?.kind === 'null'
      ? [
          { value: 'none', label: 'Bez zapowiedzi' },
          { value: 'ouvert', label: t('[[Otwarta]]') },
        ]
      : [
          { value: 'none', label: 'Bez zapowiedzi' },
          { value: 'schneider', label: t('[[Krawiec]]') },
          { value: 'schwarz', label: t('[[Czarny]]') },
          { value: 'ouvert', label: t('[[Otwarta]]') },
        ];
  const showAnnounce = game !== null && (deal.hand || game.kind === 'null');
  const valid = game !== null && (game.kind !== 'null' || nullAllowed(announce));

  const choose = (g: GameType) => {
    setGame(g);
    if (g.kind === 'null') setAnnounce(nullAllowed('none') ? 'none' : 'ouvert');
    else if (!deal.hand || game?.kind === 'null') setAnnounce('none');
  };

  return (
    <div className="game-bar game-bar--column" role="group" aria-label="Zgłoszenie gry">
      <p className="game-bar__info">Stawka: {bid}. Jaką grę zgłaszasz?</p>
      <div className="game-bar__choices">
        {GAMES.map((g) => {
          const disabled = g.kind === 'null' && !nullAllowed('none') && !nullAllowed('ouvert');
          return (
            <button
              key={JSON.stringify(g)}
              type="button"
              className={`option${game && sameGame(game, g) ? ' option--chosen' : ''}`}
              aria-pressed={game !== null && sameGame(game, g)}
              disabled={disabled}
              onClick={() => choose(g)}
            >
              {gameShortName(g, t)}
            </button>
          );
        })}
      </div>
      {showAnnounce && (
        <div className="game-bar__choices" role="radiogroup" aria-label="Zapowiedź">
          {announcements.map((a) => (
            <label key={a.value} className="settings__option">
              <input
                type="radio"
                name="announce"
                checked={announce === a.value}
                disabled={game?.kind === 'null' ? !nullAllowed(a.value) : !deal.hand && a.value !== 'none'}
                onChange={() => setAnnounce(a.value)}
              />
              {a.label}
            </label>
          ))}
        </div>
      )}
      <button
        type="button"
        className="button button--primary"
        disabled={!valid}
        onClick={() => game && onAction({ type: 'declare', game, announce: game.kind === 'null' || deal.hand ? announce : 'none' })}
      >
        Zgłoś grę
      </button>
    </div>
  );
}

/** Kontra (obrońca) albo re (rozgrywający po kontrze). */
export function KontraControls({ deal, you, onAction }: ControlsProps) {
  const isDeclarer = you === deal.declarer;
  return (
    <div className="game-bar" role="group" aria-label="Kontra i re">
      <button type="button" className="button" onClick={() => onAction({ type: 'double' })}>
        {isDeclarer ? 'Re' : 'Kontra'}
      </button>
      <button type="button" className="button button--primary" onClick={() => onAction({ type: 'noDouble' })}>
        {isDeclarer ? 'Bez re' : 'Bez kontry'}
      </button>
    </div>
  );
}
