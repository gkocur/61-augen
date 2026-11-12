import { describe, expect, it } from 'vitest';
import { ALL_CARDS, cardPoints, isCardId, isSuit, rankOf, suitOf, sumPoints } from './cards';

describe('karty', () => {
  it('talia ma 32 różne karty', () => {
    expect(ALL_CARDS).toHaveLength(32);
    expect(new Set(ALL_CARDS).size).toBe(32);
  });

  it('rozpoznaje poprawne identyfikatory kart', () => {
    expect(isCardId('h-10')).toBe(true);
    expect(isCardId('c-J')).toBe(true);
    expect(isCardId('h-1')).toBe(false);
    expect(isCardId('x-A')).toBe(false);
    expect(isCardId('h-j')).toBe(false);
  });

  it('rozpoznaje kolory', () => {
    expect(isSuit('d')).toBe(true);
    expect(isSuit('x')).toBe(false);
  });

  it('rozkłada identyfikator na kolor i rangę', () => {
    expect(suitOf('h-10')).toBe('h');
    expect(rankOf('h-10')).toBe('10');
    expect(rankOf('c-J')).toBe('J');
  });

  it('liczy oczka kart', () => {
    expect(cardPoints('s-A')).toBe(11);
    expect(cardPoints('d-10')).toBe(10);
    expect(cardPoints('c-K')).toBe(4);
    expect(cardPoints('h-Q')).toBe(3);
    expect(cardPoints('c-J')).toBe(2);
    expect(cardPoints('h-9')).toBe(0);
    expect(sumPoints(['h-A', 's-10', 'c-K'])).toBe(25);
    expect(sumPoints(ALL_CARDS)).toBe(120);
  });
});
