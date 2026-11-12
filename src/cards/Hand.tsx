// src/cards/Hand.tsx
import type { CardId } from '../engine';
import { PlayingCard } from './PlayingCard';

interface HandProps {
  cards: CardId[];
  selected?: CardId | null;
  isDimmed?: (card: CardId) => boolean;
  onCardClick?: (card: CardId) => void;
  disabled?: boolean;
}

/** Ręka gracza: zachodzące na siebie karty, do klikania. */
export function Hand({ cards, selected = null, isDimmed, onCardClick, disabled = false }: HandProps) {
  return (
    <ul className="hand" aria-label="Twoje karty">
      {cards.map((card) => (
        <li key={card} className="hand__slot">
          <PlayingCard
            card={card}
            selected={card === selected}
            dimmed={isDimmed?.(card) ?? false}
            disabled={disabled}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

/** Rząd kart do pokazania (bez interakcji). */
export function CardRow({ cards }: { cards: CardId[] }) {
  return (
    <ul className="card-row">
      {cards.map((card) => (
        <li key={card}>
          <PlayingCard card={card} />
        </li>
      ))}
    </ul>
  );
}
