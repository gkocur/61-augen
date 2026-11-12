// src/exercises/GameBanner.tsx
import type { GameType } from '../engine';
import { gameLabel } from '../glossary';
import { useTextContext } from '../state/AppStateContext';

export function GameBanner({ game }: { game: GameType }) {
  const ctx = useTextContext();
  return <p className="game-banner">{gameLabel(game, ctx)}</p>;
}
