// src/glossary/game.ts
import type { GameType } from '../engine';
import { resolveText } from './text';
import type { TextContext } from './types';

export function gameLabel(game: GameType, ctx: TextContext): string {
  switch (game.kind) {
    case 'suit':
      return resolveText(`[[GraKolorowa]] · [[atu]]: [[suit:${game.trump}]]`, ctx);
    case 'grand':
      return resolveText('[[Grand]] · [[atu]]: tylko [[walet:Mlm]]', ctx);
    case 'null':
      return resolveText('[[Null]] · bez [[atu:Dlm]]', ctx);
  }
}
