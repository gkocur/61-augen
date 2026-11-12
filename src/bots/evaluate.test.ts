// src/bots/evaluate.test.ts
import { describe, expect, it } from 'vitest';
import type { CardId, Declaration } from '../engine';
import { chooseDiscard, chooseGame, evaluateHand, playableGames, wantsKontra, wantsRe } from './evaluate';

const STRONG_HEARTS: CardId[] = ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 'd-7', 's-8'];
/** 2 walety z treflowym, długi kolor z asem i dziesiątką i dwa asy z boku — dobry grand (jak w lekcji 24). */
const GRAND_TWO_JACKS: CardId[] = ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 's-A', 'd-7'];
const WEAK: CardId[] = ['h-8', 'h-7', 'c-8', 'c-K', 's-Q', 's-9', 'd-10', 'd-K', 'd-Q', 'c-9'];
const GRAND_HAND: CardId[] = ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 's-A', 'h-A', 'd-7', 'd-8', 's-9'];
const NULL_HAND: CardId[] = ['c-7', 'c-9', 's-7', 's-8', 'h-7', 'h-9', 'h-J', 'd-8', 'd-10', 's-10'];

describe('ocena ręki', () => {
  it('mocna ręka kierowa: kier z 2, licytacja do 30', () => {
    expect(evaluateHand(STRONG_HEARTS)).toEqual({ game: { kind: 'suit', trump: 'h' }, limit: 30 });
  });

  it('2 walety z treflowym i 3 asy: grand wygrywa z kolorem', () => {
    expect(evaluateHand(GRAND_TWO_JACKS)).toEqual({ game: { kind: 'grand' }, limit: 72 });
  });

  it('słaba ręka: brak gry', () => {
    expect(evaluateHand(WEAK)).toBeNull();
  });

  it('grand: 3 walety i 3 asy', () => {
    expect(evaluateHand(GRAND_HAND)).toEqual({ game: { kind: 'grand' }, limit: 96 });
  });

  it('null: niskie karty w każdym kolorze', () => {
    expect(playableGames(NULL_HAND).map((c) => c.game.kind)).toEqual(['null']);
    expect(evaluateHand(NULL_HAND)).toEqual({ game: { kind: 'null' }, limit: 23 });
  });
});

describe('wybór gry po licytacji', () => {
  it('grywalna gra warta stawkę', () => {
    expect(chooseGame([...STRONG_HEARTS, 'h-8', 'd-8'], 18)).toEqual({ kind: 'suit', trump: 'h' });
  });

  it('null odpada, gdy stawka przekracza 23 — wtedy kolor z największą liczbą atu', () => {
    expect(chooseGame([...NULL_HAND, 'c-8', 'd-7'], 18)).toEqual({ kind: 'null' });
    expect(chooseGame([...NULL_HAND, 'c-8', 'd-7'], 24).kind).toBe('suit');
  });
});

describe('wyrzucanie do skata', () => {
  it('kolor: chowa dziesiątkę i króla bez asa, nie wyrzuca atu ani asów', () => {
    const cards: CardId[] = ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 's-A', 'd-10', 'd-K', 'c-7'];
    expect(chooseDiscard(cards, { kind: 'suit', trump: 'h' }).sort()).toEqual(['d-10', 'd-K']);
  });

  it('null: wyrzuca najwyższe karty z kolorów bez siódemki', () => {
    const cards: CardId[] = ['c-7', 'c-8', 's-7', 's-9', 'h-7', 'h-8', 'd-8', 'd-9', 'd-A', 'c-9', 's-8', 'h-9'];
    expect(chooseDiscard(cards, { kind: 'null' })).toEqual(['d-A', 'd-9']);
  });

  it('zawsze 2 różne karty z ręki', () => {
    const cards: CardId[] = ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'h-8', 'h-7', 'c-A'];
    const [a, b] = chooseDiscard(cards, { kind: 'suit', trump: 'h' });
    expect(a).not.toBe(b);
    expect(cards).toContain(a);
    expect(cards).toContain(b);
  });
});

describe('kontra i re', () => {
  const hearts: Declaration = { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' };
  it('kontra przy mocnych atu i dwóch asach z boku', () => {
    expect(wantsKontra(['c-J', 'h-A', 'h-10', 'h-9', 'c-A', 's-A', 'd-7', 'd-8', 's-9', 'c-8'], hearts)).toBe(true);
    expect(wantsKontra(WEAK, hearts)).toBe(false);
    expect(wantsKontra(NULL_HAND, { ...hearts, game: { kind: 'null' } })).toBe(false);
  });

  it('re przy bardzo mocnej ręce', () => {
    expect(wantsRe(['c-J', 's-J', 'h-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'c-A', 's-A', 'd-7'], hearts)).toBe(true);
    expect(wantsRe(STRONG_HEARTS, hearts)).toBe(false);
  });
});
