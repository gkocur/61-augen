// src/glossary/text.test.ts
import { describe, expect, it } from 'vitest';
import { findTextIssues, resolveText } from './text';

const official = { deck: 'altenburg', register: 'official' } as const;
const colloquial = { deck: 'altenburg', register: 'colloquial' } as const;
const french = { deck: 'french', register: 'official' } as const;

describe('resolveText', () => {
  it('podstawia termin w wybranym przypadku', () => {
    expect(resolveText('Weź [[lewa:B]].', official)).toBe('Weź lewę.');
    expect(resolveText('Weź [[lewa:B]].', colloquial)).toBe('Weź sztycha.');
  });

  it('domyślnie używa mianownika i umie wielką literę', () => {
    expect(resolveText('[[Rozgrywajacy]] gra sam.', official)).toBe('Rozgrywający gra sam.');
    expect(resolveText('Gra [[rozgrywajacy]].', colloquial)).toBe('Gra szpiler.');
  });

  it('wybiera wariant frazy według rejestru', () => {
    expect(resolveText('{w tej lewie|w tym sztychu}', official)).toBe('w tej lewie');
    expect(resolveText('{w tej lewie|w tym sztychu}', colloquial)).toBe('w tym sztychu');
  });

  it('rozwiązuje tokeny wewnątrz wariantów', () => {
    expect(resolveText('{[[lewa]] wygrana|[[lewa]] wygrany}', colloquial)).toBe('sztych wygrany');
  });

  it('podstawia nazwy kart i kolorów', () => {
    expect(resolveText('[[card:h-10]]', french)).toBe('dziesiątka kier');
    expect(resolveText('[[Card:c-J]]', official)).toBe('Niżnik żołędny');
    expect(resolveText('[[suit:c]]', official)).toBe('żołądź');
  });

  it('awaryjnie: nieznany termin zostaje jak jest, brak formy → oficjalny mianownik', () => {
    expect(resolveText('[[nieznany]]', official)).toBe('[[nieznany]]');
    expect(resolveText('[[skat:Dlm]]', colloquial)).toBe('skat');
  });
});

describe('findTextIssues', () => {
  it('poprawny tekst nie ma problemów', () => {
    expect(findTextIssues('')).toEqual([]);
    expect(findTextIssues('Weź [[lewa:B]] {tu|tam} [[card:h-10]] [[suit:d]]')).toEqual([]);
  });

  it('zgłasza nieznane terminy, formy, karty i kolory', () => {
    expect(findTextIssues('[[nieznany]]')).toEqual(['Nieznany termin: nieznany']);
    expect(findTextIssues('[[lewa:X]]')).toEqual(['Nieznana forma: X']);
    expect(findTextIssues('[[skat:Dlm]]')).toEqual(['Brak formy Dlm dla terminu skat']);
    expect(findTextIssues('[[card:h-11]]')).toEqual(['Nieznana karta: h-11']);
    expect(findTextIssues('[[suit:x]]')).toEqual(['Nieznany kolor: x']);
    expect(findTextIssues('[[lewa:B:C]]')).toEqual(['Zły token: lewa:B:C']);
  });

  it('zgłasza błędy składni', () => {
    expect(findTextIssues('{a|}')).toEqual(['Pusta alternatywa: {a|}']);
    expect(findTextIssues('{bez kreski}')).toEqual(['Niedomknięta alternatywa']);
    expect(findTextIssues('[[lewa')).toEqual(['Niedomknięty token']);
  });
});
