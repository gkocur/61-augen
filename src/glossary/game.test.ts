// src/glossary/game.test.ts
import { describe, expect, it } from 'vitest';
import { gameLabel } from './game';
import { countCase, pluralPl } from './plural';

const official = { deck: 'altenburg', register: 'official' } as const;
const colloquial = { deck: 'altenburg', register: 'colloquial' } as const;

describe('etykieta gry', () => {
  it('opisuje rodzaj gry i atu', () => {
    expect(gameLabel({ kind: 'suit', trump: 'h' }, official)).toBe('Gra kolorowa · atu: czerwień');
    expect(gameLabel({ kind: 'suit', trump: 'h' }, colloquial)).toBe('Farbszpil · trumf: herc');
    expect(gameLabel({ kind: 'grand' }, official)).toBe('Grand · atu: tylko niżniki');
    expect(gameLabel({ kind: 'null' }, colloquial)).toBe('Nul · bez trumfów');
  });
});

describe('liczebniki', () => {
  it('dobiera formę rzeczownika do liczby', () => {
    expect([1, 2, 4, 5, 11, 12, 22, 25, 0].map(countCase)).toEqual(['M', 'Mlm', 'Mlm', 'Dlm', 'Dlm', 'Dlm', 'Mlm', 'Dlm', 'Dlm']);
    expect(pluralPl(1, ['karta', 'karty', 'kart'])).toBe('karta');
    expect(pluralPl(3, ['karta', 'karty', 'kart'])).toBe('karty');
    expect(pluralPl(7, ['karta', 'karty', 'kart'])).toBe('kart');
  });
});
