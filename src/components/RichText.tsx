// src/components/RichText.tsx
import type { ReactNode } from 'react';
import { useText } from '../state/AppStateContext';

/** Tekst lekcji: tokeny słownika, akapity (pusta linia) i **pogrubienie**. */
export function RichText({ text }: { text: string }) {
  const t = useText();
  const paragraphs = t(text).split(/\n\s*\n/).filter((p) => p.trim() !== '');
  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{renderBold(paragraph)}</p>
      ))}
    </>
  );
}

function renderBold(paragraph: string): ReactNode[] {
  return paragraph
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((part) => part !== '')
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
    );
}
