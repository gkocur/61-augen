// src/cards/TrickView.tsx
import { nextSeat, type CardId, type Seat } from '../engine';
import { useText } from '../state/AppStateContext';
import { PlayingCard } from './PlayingCard';

export const SEAT_LABEL: Record<Seat, string> = { 0: '[[Przodek]]', 1: '[[Srodek]]', 2: '[[Zadek]]' };
/** Pozycja w miejscowniku: „siedzisz na ręku / na przodku”. */
export const SEAT_AT: Record<Seat, string> = { 0: '[[przodek:Ms]]', 1: '[[srodek:Ms]]', 2: '[[zadek:Ms]]' };

interface Props {
  cards: CardId[];
  leader: Seat;
  you: Seat;
  emptyText?: string;
}

export function TrickView({ cards, leader, you, emptyText = 'Stół jest pusty — wychodzisz pierwszy.' }: Props) {
  const t = useText();
  return (
    <div className="trick" role="group" aria-label="Karty na stole">
      {cards.length === 0 ? (
        <p className="trick__empty">{emptyText}</p>
      ) : (
        <ol className="trick__cards">
          {cards.map((card, i) => {
            const seat = nextSeat(leader, i);
            return (
              <li key={card} className="trick__slot">
                <PlayingCard card={card} />
                <span className="trick__label">{seat === you ? 'Ty' : t(SEAT_LABEL[seat])}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
