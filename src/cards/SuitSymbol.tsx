// src/cards/SuitSymbol.tsx
// Własne, proste symbole (zastępcze). Grafiki z Wikimedia dochodzą w Planie 3.
import type { Suit } from '../engine';
import type { DeckKind } from '../glossary';

export const SUIT_COLORS: Record<DeckKind, Record<Suit, string>> = {
  altenburg: { c: '#6d4c1f', s: '#2e7d32', h: '#c62828', d: '#d39b00' },
  french: { c: '#1b1b1b', s: '#1b1b1b', h: '#c62828', d: '#c62828' },
};

const HEART =
  'M50 88 C20 65 5 46 5 30 C5 15 17 5 30 5 C40 5 47 12 50 20 C53 12 60 5 70 5 C83 5 95 15 95 30 C95 46 80 65 50 88 Z';
const SPADE =
  'M50 5 C35 25 8 40 8 60 C8 75 20 82 32 82 C40 82 46 78 48 74 C47 84 42 92 35 95 L65 95 C58 92 53 84 52 74 C54 78 60 82 68 82 C80 82 92 75 92 60 C92 40 65 25 50 5 Z';

/** Symbol koloru narysowany w polu 100×100. */
export function SuitSymbol({ suit, deck }: { suit: Suit; deck: DeckKind }) {
  const color = SUIT_COLORS[deck][suit];
  return deck === 'french' ? <FrenchSymbol suit={suit} color={color} /> : <GermanSymbol suit={suit} color={color} />;
}

function FrenchSymbol({ suit, color }: { suit: Suit; color: string }) {
  switch (suit) {
    case 'h':
      return <path d={HEART} fill={color} />;
    case 'd':
      return <path d="M50 4 L86 50 L50 96 L14 50 Z" fill={color} />;
    case 's':
      return <path d={SPADE} fill={color} />;
    case 'c':
      return (
        <g fill={color}>
          <circle cx="50" cy="28" r="19" />
          <circle cx="27" cy="58" r="19" />
          <circle cx="73" cy="58" r="19" />
          <path d="M45 50 C45 75 40 88 30 96 L70 96 C60 88 55 75 55 50 Z" />
        </g>
      );
  }
}

function GermanSymbol({ suit, color }: { suit: Suit; color: string }) {
  switch (suit) {
    case 'h':
      return <path d={HEART} fill={color} />;
    case 'c':
      return (
        <g>
          <rect x="46" y="6" width="8" height="16" rx="3" fill="#4e3412" />
          <ellipse cx="50" cy="64" rx="22" ry="30" fill={color} />
          <path d="M22 46 C22 22 78 22 78 46 C78 54 22 54 22 46 Z" fill="#4e3412" />
        </g>
      );
    case 's':
      return (
        <g>
          <path d="M50 96 L50 84 C18 74 8 42 50 4 C92 42 82 74 50 84" fill={color} />
          <path d="M50 84 L50 20" stroke="#1b5e20" strokeWidth="3" fill="none" />
        </g>
      );
    case 'd':
      return (
        <g>
          <circle cx="50" cy="12" r="6" fill={color} />
          <path
            d="M50 16 C30 16 26 36 26 54 C26 68 20 74 14 80 L86 80 C80 74 74 68 74 54 C74 36 70 16 50 16 Z"
            fill={color}
            stroke="#8a6400"
            strokeWidth="2"
          />
          <rect x="14" y="78" width="72" height="6" rx="3" fill="#8a6400" />
          <circle cx="50" cy="90" r="7" fill="#8a6400" />
        </g>
      );
  }
}
