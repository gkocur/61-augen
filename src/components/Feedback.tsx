// src/components/Feedback.tsx
import type { ReactNode } from 'react';

export function Feedback({ correct, children }: { correct: boolean; children: ReactNode }) {
  return (
    <div className={`feedback feedback--${correct ? 'ok' : 'bad'}`}>
      <strong className="feedback__title">{correct ? 'Dobrze!' : 'Niestety nie.'}</strong>
      {children}
    </div>
  );
}
