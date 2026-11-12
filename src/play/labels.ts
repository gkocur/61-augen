// src/play/labels.ts
import type { GameType } from '../engine';
import type { GameAction, PlayerId } from '../game';

export const PLAYER_NAME: Record<PlayerId, string> = { 0: 'Ty', 1: 'Bot z lewej', 2: 'Bot z prawej' };

/** Liczba ze znakiem: +80, −110, 0. */
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Krótka nazwa gry (tokeny słownika): kolor atu, Grand, Null, Ramsz. */
export function gameShortName(game: GameType, t: (text: string) => string): string {
  switch (game.kind) {
    case 'suit':
      return upperFirst(t(`[[suit:${game.trump}]]`));
    case 'grand':
      return t('[[Grand]]');
    case 'null':
      return t('[[Null]]');
    case 'ramsch':
      return t('[[Ramsz]]');
  }
}

/** Tekst wypowiedzi w dymku przy graczu (licytacja, kontra/re). */
export function speechText(action: GameAction, kontraSaid: boolean): string | undefined {
  switch (action.type) {
    case 'bid':
      return String(action.value);
    case 'hold':
      return 'tak';
    case 'pass':
      return 'pas';
    case 'double':
      return kontraSaid ? 're' : 'kontra';
    case 'noDouble':
      return kontraSaid ? 'bez re' : 'bez kontry';
    default:
      return undefined;
  }
}
