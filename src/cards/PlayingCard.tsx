// src/cards/PlayingCard.tsx
import { suitOf, type CardId } from '../engine';
import { cardName, rankLabel } from '../glossary';
import { useTextContext } from '../state/AppStateContext';
import { SUIT_COLORS, SuitSymbol } from './SuitSymbol';

interface Props {
  card: CardId;
  selected?: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PlayingCard({ card, selected = false, dimmed = false, disabled = false, onClick }: Props) {
  const ctx = useTextContext();
  const label = cardName(card, ctx);
  const className = ['card', selected && 'card--selected', dimmed && 'card--dimmed'].filter(Boolean).join(' ');
  const face = <CardFace card={card} />;
  if (onClick) {
    return (
      <button type="button" className={className} aria-label={label} aria-pressed={selected} disabled={disabled} onClick={onClick}>
        {face}
      </button>
    );
  }
  return (
    <span className={className} role="img" aria-label={label}>
      {face}
    </span>
  );
}

function CardFace({ card }: { card: CardId }) {
  const ctx = useTextContext();
  const suit = suitOf(card);
  const color = SUIT_COLORS[ctx.deck][suit];
  const label = rankLabel(card, ctx);
  return (
    <svg viewBox="0 0 60 90" className="card__svg" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="58" height="88" rx="6" className="card__bg" />
      <text x="5" y="15" className="card__index" fill={color}>
        {label}
      </text>
      <g transform="translate(5 19) scale(0.12)">
        <SuitSymbol suit={suit} deck={ctx.deck} />
      </g>
      <g transform="translate(15 30) scale(0.3)">
        <SuitSymbol suit={suit} deck={ctx.deck} />
      </g>
      <g transform="rotate(180 30 45)">
        <text x="5" y="15" className="card__index" fill={color}>
          {label}
        </text>
      </g>
    </svg>
  );
}
