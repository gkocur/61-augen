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
    expect(formsFor(TERMS.walet, { deck: 'altenburg', register: 'colloquial' }).M).toBe('unter');
    expect(formsFor(TERMS.walet, { deck: 'french', register: 'official' }).M).toBe('walet');
    expect(formsFor(TERMS.walet, { deck: 'french', register: 'colloquial' }).M).toBe('unter');
  });

  it('terminy zależne od talii mają 4 warianty, zwykłe 2', () => {
    expect(formVariants(TERMS.walet)).toHaveLength(4);
    expect(formVariants(TERMS.lewa)).toHaveLength(2);
  });

  it('terminy wyceny i licytacji w obu rejestrach', () => {
    const off = { deck: 'altenburg', register: 'official' } as const;
    const col = { deck: 'altenburg', register: 'colloquial' } as const;
    expect(formsFor(TERMS.krawiec, off).B).toBe('krawca');
    expect(formsFor(TERMS.krawiec, col).M).toBe('szneider');
    expect(formsFor(TERMS.czarny, col).M).toBe('szwarc');
    expect(formsFor(TERMS.reka, off).Ms).toBe('grze z ręki');
    expect(formsFor(TERMS.mit, col).M).toBe('mit');
    expect(formsFor(TERMS.ohne, off).M).toBe('bez');
    expect(formsFor(TERMS.matador, off).Dlm).toBe('szczytów');
  });
});
