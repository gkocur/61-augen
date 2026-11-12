// src/glossary/cardNames.test.ts
import { describe, expect, it } from 'vitest';
import { RANKS } from '../engine';
import { RANK_TERM, cardName, rankLabel, suitName } from './cardNames';
import { TERMS, formVariants } from './terms';

describe('nazwy kart', () => {
  it('Altenburg, oficjalnie: przymiotnik zgodny z rodzajem', () => {
    const ctx = { deck: 'altenburg', register: 'official' } as const;
    expect(cardName('c-J', ctx)).toBe('niżnik żołędny');
    expect(cardName('h-10', ctx)).toBe('dziesiątka czerwienna');
    expect(cardName('s-A', ctx)).toBe('as zielony');
  });

  it('Altenburg, potocznie', () => {
    expect(cardName('d-A', { deck: 'altenburg', register: 'colloquial' })).toBe('daus szele');
  });

  it('talia francuska: nazwa koloru po figurze', () => {
    expect(cardName('h-10', { deck: 'french', register: 'official' })).toBe('dziesiątka kier');
    expect(cardName('s-Q', { deck: 'french', register: 'official' })).toBe('dama pik');
    expect(cardName('c-J', { deck: 'french', register: 'colloquial' })).toBe('jopek trefl');
  });

  it('nazwy kolorów', () => {
    expect(suitName('c', { deck: 'altenburg', register: 'official' })).toBe('żołądź');
    expect(suitName('c', { deck: 'french', register: 'official' })).toBe('trefl');
  });

  it('oznaczenia figur na kartach', () => {
    expect(rankLabel('c-J', { deck: 'altenburg', register: 'official' })).toBe('N');
    expect(rankLabel('c-J', { deck: 'french', register: 'official' })).toBe('W');
    expect(rankLabel('h-10', { deck: 'french', register: 'colloquial' })).toBe('10');
  });

  it('każda ranga ma termin z rodzajem gramatycznym w każdym wariancie', () => {
    for (const rank of RANKS) {
      const term = TERMS[RANK_TERM[rank]];
      expect(term, rank).toBeDefined();
      for (const forms of formVariants(term)) expect(forms.g, rank).toBeDefined();
    }
  });
});
