import { describe, expect, it } from 'vitest';
import type { GameType } from './game';
import { isLegalMove, legalMoves } from './rules';

const hearts: GameType = { kind: 'suit', trump: 'h' };
const grand: GameType = { kind: 'grand' };
const nullGame: GameType = { kind: 'null' };

describe('dozwolone zagrania', () => {
  it('przy pustej lewie wolno zagrać każdą kartę', () => {
    expect(legalMoves(['c-A', 'h-7'], [], hearts)).toEqual(['c-A', 'h-7']);
  });

  it('trzeba dołożyć do koloru; walet nie należy do swojego koloru', () => {
    expect(legalMoves(['c-J', 'c-7', 'h-A'], ['c-A'], hearts)).toEqual(['c-7']);
  });

  it('na wyjście w atu trzeba dać atu, także waleta', () => {
    expect(legalMoves(['c-J', 's-A'], ['h-9'], hearts)).toEqual(['c-J']);
  });

  it('grand: na waleta trzeba dać waleta', () => {
    expect(legalMoves(['c-A', 'd-J'], ['c-J'], grand)).toEqual(['d-J']);
  });

  it('grand: walet nie dokłada do koloru — bez koloru wolno wszystko', () => {
    expect(legalMoves(['c-J', 's-7'], ['c-A'], grand)).toEqual(['c-J', 's-7']);
  });

  it('null: walet jest zwykłą kartą swojego koloru', () => {
    expect(legalMoves(['c-J', 'h-7'], ['c-A'], nullGame)).toEqual(['c-J']);
  });

  it('isLegalMove odrzuca kartę spoza ręki', () => {
    expect(isLegalMove('s-A', ['c-7'], [], hearts)).toBe(false);
    expect(isLegalMove('c-7', ['c-7', 'h-A'], ['c-K'], hearts)).toBe(true);
    expect(isLegalMove('h-A', ['c-7', 'h-A'], ['c-K'], hearts)).toBe(false);
  });
});
