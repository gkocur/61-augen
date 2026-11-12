// src/glossary/terms.test.ts
import { describe, expect, it } from 'vitest';
import { TERMS, formVariants, formsFor } from './terms';

describe('słownik terminów', () => {
  it('każdy termin ma mianownik w każdym wariancie', () => {
    for (const [key, term] of Object.entries(TERMS)) {
      for (const forms of formVariants(term)) {
        expect(forms.M, key).toBeTruthy();
      }
    }
  });

  it('terminy zwykłe zależą tylko od rejestru', () => {
    expect(formsFor(TERMS.lewa, { deck: 'altenburg', register: 'official' }).B).toBe('lewę');
    expect(formsFor(TERMS.lewa, { deck: 'french', register: 'colloquial' }).M).toBe('sztych');
  });

  it('nazwy figur zależą od talii i rejestru', () => {
    expect(formsFor(TERMS.walet, { deck: 'altenburg', register: 'official' }).M).toBe('niżnik');
    expect(formsFor(TERMS.walet, { deck: 'altenburg', register: 'colloquial' }).M).toBe('uner');
    expect(formsFor(TERMS.walet, { deck: 'french', register: 'official' }).M).toBe('walet');
    expect(formsFor(TERMS.walet, { deck: 'french', register: 'colloquial' }).M).toBe('jopek');
  });

  it('terminy zależne od talii mają 4 warianty, zwykłe 2', () => {
    expect(formVariants(TERMS.walet)).toHaveLength(4);
    expect(formVariants(TERMS.lewa)).toHaveLength(2);
  });
});
