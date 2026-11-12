import { describe, expect, it } from 'vitest';
import type { GameType } from './game';
import { nextSeat } from './game';
import { isTrump, leadOf, sortHand, trickWinner } from './order';

const hearts: GameType = { kind: 'suit', trump: 'h' };
const grand: GameType = { kind: 'grand' };
const nullGame: GameType = { kind: 'null' };

describe('miejsca przy stole', () => {
  it('przechodzą cyklicznie 0 → 1 → 2 → 0', () => {
    expect(nextSeat(0)).toBe(1);
    expect(nextSeat(2)).toBe(0);
    expect(nextSeat(1, 2)).toBe(0);
  });
});

describe('atu', () => {
  it('w grze kolorowej atu to walety i kolor atu', () => {
    expect(isTrump('c-J', hearts)).toBe(true);
    expect(isTrump('h-7', hearts)).toBe(true);
    expect(isTrump('c-A', hearts)).toBe(false);
    expect(leadOf('d-J', hearts)).toBe('trump');
    expect(leadOf('s-A', hearts)).toBe('s');
  });

  it('w grandzie atu to tylko walety', () => {
    expect(isTrump('d-J', grand)).toBe(true);
    expect(isTrump('h-A', grand)).toBe(false);
  });

  it('w nullu nie ma atu', () => {
    expect(isTrump('c-J', nullGame)).toBe(false);
    expect(leadOf('c-J', nullGame)).toBe('c');
  });
});

describe('zwycięzca lewy', () => {
  it('gra kolorowa: wyższa karta koloru wyjścia, 10 bije króla', () => {
    expect(trickWinner(['s-K', 's-10', 's-A'], hearts)).toBe(2);
    expect(trickWinner(['s-10', 's-K', 's-9'], hearts)).toBe(0);
    expect(trickWinner(['h-10', 'h-K', 'h-A'], hearts)).toBe(2);
  });

  it('gra kolorowa: atu bije kolor, walet bije atu, karty innych kolorów nie biorą', () => {
    expect(trickWinner(['s-K', 's-10', 'h-7'], hearts)).toBe(2);
    expect(trickWinner(['h-A', 'd-J', 'c-J'], hearts)).toBe(2);
    expect(trickWinner(['s-A', 'c-A', 'd-A'], hearts)).toBe(0);
  });

  it('grand: walety w kolejności ♣ ♠ ♥ ♦', () => {
    expect(trickWinner(['h-A', 'd-J', 's-A'], grand)).toBe(1);
    expect(trickWinner(['c-J', 's-J', 'h-J'], grand)).toBe(0);
    expect(trickWinner(['d-J', 'h-J', 'c-7'], grand)).toBe(1);
  });

  it('null: kolejność A K D W 10 9 8 7, walet zwykłą kartą koloru', () => {
    expect(trickWinner(['h-10', 'h-J', 'h-9'], nullGame)).toBe(1);
    expect(trickWinner(['s-K', 's-A', 'c-A'], nullGame)).toBe(1);
    expect(trickWinner(['d-7', 'h-A', 'c-J'], nullGame)).toBe(0);
  });

  it('pusta lewa to błąd', () => {
    expect(() => trickWinner([], hearts)).toThrow();
  });
});

describe('sortowanie ręki', () => {
  it('gra kolorowa: najpierw atu malejąco, potem kolory ♣ ♠ ♥ ♦', () => {
    expect(sortHand(['s-A', 'h-7', 'c-J', 'h-A', 'd-J', 's-10'], hearts)).toEqual([
      'c-J', 'd-J', 'h-A', 'h-7', 's-A', 's-10',
    ]);
  });

  it('null: kolory ♣ ♠ ♥ ♦, w kolorze kolejność nulla', () => {
    expect(sortHand(['h-J', 'c-7', 'h-10', 'c-A'], nullGame)).toEqual(['c-A', 'c-7', 'h-J', 'h-10']);
  });
});
