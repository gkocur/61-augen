// src/bots/ramsch.test.ts
import { describe, expect, it } from 'vitest';
import { createDeal, playCard, type CardId, type Hands } from '../engine';
import { ramschBot } from './ramsch';

const ramsch = { kind: 'ramsch' } as const;
const at = (hands: Hands, played: CardId[] = []) =>
  played.reduce((s, c) => playCard(s, c), createDeal({ game: ramsch, declarer: 0, hands, skat: [] }));

describe('bot do ramsza', () => {
  it('wychodzi najniższą kartą koloru, nie waletem', () => {
    expect(ramschBot(at([['c-J', 'h-A', 'h-7', 's-K'], ['c-7', 'c-8', 'c-9', 'c-10'], ['d-7', 'd-8', 'd-9', 'd-10']]), 0)).toBe('h-7');
  });

  it('gdy nie musi brać — pozbywa się najcenniejszej karty, która nie bierze', () => {
    const s = at([['s-A', 'c-7'], ['s-K', 's-10'], ['s-7', 'c-8']], ['s-A']);
    expect(ramschBot(s, 1)).toBe('s-10');
  });

  it('gdy musi wziąć — bierze kartą z najmniejszą liczbą oczek', () => {
    const s = at([['s-7', 'c-7'], ['s-A', 's-9'], ['d-7', 'c-8']], ['s-7']);
    expect(ramschBot(s, 1)).toBe('s-9');
  });
});
