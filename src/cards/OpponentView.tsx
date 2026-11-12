// src/cards/OpponentView.tsx
import type { Seat } from '../engine';
import { pluralPl } from '../glossary';
import { useText } from '../state/AppStateContext';
import { CardBack } from './CardBack';
import { SEAT_LABEL } from './TrickView';

interface Props {
  seat: Seat;
  cardCount: number;
  isDeclarer: boolean;
  /** Ten gracz jest teraz na ruchu. */
  active: boolean;
}

export function OpponentView({ seat, cardCount, isDeclarer, active }: Props) {
  const t = useText();
  const name = t(SEAT_LABEL[seat]) + (isDeclarer ? t(' · [[rozgrywajacy]]') : '');
  const count = `${cardCount} ${pluralPl(cardCount, ['karta', 'karty', 'kart'])}`;
  return (
    <div className={`opponent${active ? ' opponent--active' : ''}`} role="img" aria-label={`${name}: ${count}`}>
      <span className="opponent__name" aria-hidden="true">
        {name}
      </span>
      <span className="opponent__stack" aria-hidden="true">
        <span className="card">
          <CardBack />
        </span>
        <span className="opponent__count">{cardCount}</span>
      </span>
    </div>
  );
}
