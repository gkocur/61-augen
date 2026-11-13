// src/three/Stage.tsx — rama sceny 3D: leniwie ładowany stół, nakładka HUD i klawiaturowy dostęp do ręki
import { Suspense, lazy, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cardName } from '../glossary';
import { useTextContext } from '../state/AppStateContext';
import { handMetrics, hasWebGL } from './layoutMath';
import type { TableSceneProps } from './TableScene';

const TableScene = lazy(() => import('./TableScene'));

/** Czy pokazywać stół 3D (sprawdzane raz na komponent). */
export function useStage3D(): boolean {
  const [ok] = useState(hasWebGL);
  return ok;
}

interface Props extends Omit<TableSceneProps, 'deck'> {
  /** Opis sceny dla czytników ekranu. */
  label: string;
  className?: string;
  /** Nakładka nad sceną (HUD). */
  children?: ReactNode;
}

export function Stage3D({ label, className = '', children, ...scene }: Props) {
  const ctx = useTextContext();
  const box = useRef<HTMLDivElement>(null);
  const [handPx, setHandPx] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (height > 0) setHandPx(Math.round(handMetrics(width / height).frac * height));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hand = scene.cards.filter((c) => c.place.zone === 'hand');
  return (
    <div ref={box} className={`stage ${className}`} style={{ '--hand-h': `${handPx}px` } as CSSProperties}>
      <div className="stage__canvas" role="img" aria-label={label}>
        <Suspense fallback={null}>
          <TableScene {...scene} deck={ctx.deck} />
        </Suspense>
      </div>
      <div className="stage__hud">{children}</div>
      {/* Te same karty jako przyciski: dla klawiatury i czytników ekranu (widoczne dopiero po wejściu fokusem). */}
      {scene.onCardClick && hand.length > 0 && (
        <ul className="stage__keys" aria-label="Twoje karty">
          {hand.map(({ id }) => (
            <li key={id}>
              <button
                type="button"
                aria-pressed={scene.selected?.includes(id) ?? false}
                aria-description={scene.dimmed?.(id) ? 'niedozwolona' : undefined}
                onClick={() => scene.onCardClick?.(id)}
              >
                {cardName(id, ctx)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
