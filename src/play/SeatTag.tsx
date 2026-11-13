// src/play/SeatTag.tsx — plakietka przeciwnika nad stołem 3D: kto, na jakim miejscu, ile kart i co powiedział
import { SEAT_LABEL } from '../cards/TrickView';
import type { Seat } from '../engine';
import { pluralPl } from '../glossary';
import { useText } from '../state/AppStateContext';
import type { Side } from '../three/sceneCards';

interface Props {
  side: Side;
  seat: Seat;
  cardCount: number;
  isDeclarer: boolean;
  active: boolean;
  /** Nazwa gracza (np. „Bot z lewej”); bez niej plakietka pokazuje samą pozycję. */
  name?: string;
  speech?: string;
}

export function SeatTag({ side, seat, cardCount, isDeclarer, active, name, speech }: Props) {
  const t = useText();
  const position = t(SEAT_LABEL[seat]);
  const count = `${cardCount} ${pluralPl(cardCount, ['karta', 'karty', 'kart'])}`;
  const title = name ?? position;
  const label = `${title}${name ? `, ${position}` : ''}${isDeclarer ? t(', [[rozgrywajacy]]') : ''}: ${count}${speech ? `, mówi: ${speech}` : ''}`;
  return (
    <div className={`seat-tag seat-tag--${side}${active ? ' seat-tag--active' : ''}`} role="img" aria-label={label}>
      <span className="seat-tag__name" aria-hidden="true">
        {title}
      </span>
      <span className="seat-tag__meta" aria-hidden="true">
        {name ? `${position}, ` : ''}
        {count}
      </span>
      {isDeclarer && (
        <span className="seat-tag__role" aria-hidden="true">
          {t('[[rozgrywajacy]]')}
        </span>
      )}
      {speech && (
        <span className="seat-tag__speech" aria-hidden="true">
          {speech}
        </span>
      )}
    </div>
  );
}
