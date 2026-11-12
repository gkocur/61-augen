// src/cards/CardBack.tsx
/** Rewers karty (dekoracyjny). */
export function CardBack() {
  return (
    <svg viewBox="0 0 60 90" className="card__svg" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="58" height="88" rx="6" className="card__back" />
      <rect x="6" y="6" width="48" height="78" rx="4" className="card__back-inner" />
    </svg>
  );
}
