// src/glossary/cardNames.test.ts
import { describe, expect, it } from 'vitest';
import { RANKS } from '../engine';
import { CARD_CASES, RANK_TERM, cardName, rankLabel, suitName } from './cardNames';
import { TERMS, formVariants } from './terms';

describe('nazwy kart', () => {
  it('Altenburg, oficjalnie: przymiotnik zgodny z rodzajem', () => {
    const ctx = { deck: 'altenburg', register: 'official' } as const;
    expect(cardName('c-J', ctx)).toBe('niżnik żołędny');
    expect(cardName('h-10', ctx)).toBe('dziesiątka czerwienna');
    expect(cardName('s-A', ctx)).toBe('as zielony');
  });

  it('Altenburg, potocznie', () => {
    expect(cardName('d-A', { deck: 'altenburg', register: 'colloquial' })).toBe('daus szel');
  });

  it('talia francuska: nazwa koloru po figurze', () => {
    expect(cardName('h-10', { deck: 'french', register: 'official' })).toBe('dziesiątka kier');
    expect(cardName('s-Q', { deck: 'french', register: 'official' })).toBe('dama pik');
    expect(cardName('c-J', { deck: 'french', register: 'colloquial' })).toBe('jopek krojc');
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

  it('nazwy kart w przypadkach — Altenburg, oficjalnie', () => {
    const ctx = { deck: 'altenburg', register: 'official' } as const;
    expect(cardName('h-10', ctx, 'B')).toBe('dziesiątkę czerwienną');
    expect(cardName('c-A', ctx, 'B')).toBe('asa żołędnego');
    expect(cardName('s-J', ctx, 'N')).toBe('niżnikiem zielonym');
    expect(cardName('d-7', ctx, 'D')).toBe('siódemki dzwonkowej');
    expect(cardName('h-K', ctx, 'Ms')).toBe('królu czerwiennym');
  });

  it('nazwy kart w przypadkach — kolor jako nieodmienny rzeczownik', () => {
    expect(cardName('c-A', { deck: 'french', register: 'official' }, 'N')).toBe('asem trefl');
    expect(cardName('s-Q', { deck: 'french', register: 'official' }, 'B')).toBe('damę pik');
    expect(cardName('d-J', { deck: 'altenburg', register: 'colloquial' }, 'D')).toBe('unera szel');
  });

  it('każda ranga ma wszystkie przypadki nazw kart w każdym wariancie', () => {
    for (const rank of RANKS) {
      for (const forms of formVariants(TERMS[RANK_TERM[rank]])) {
        for (const c of CARD_CASES) expect(forms[c], `${rank} ${c}`).toBeDefined();
      }
    }
  });
});
