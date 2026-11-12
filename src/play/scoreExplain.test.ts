// src/play/scoreExplain.test.ts
import { describe, expect, it } from 'vitest';
import { settle, type CardId, type Declaration, type Doubling, type PlayOutcome } from '../engine';
import type { GameResult } from '../game';
import { findTextIssues, resolveText, type TextContext } from '../glossary';
import { scoreSteps } from './scoreExplain';

type GameOutcome = Extract<GameResult, { kind: 'game' }>;

const official: TextContext = { deck: 'altenburg', register: 'official' };
const colloquial: TextContext = { deck: 'altenburg', register: 'colloquial' };

function game(declaration: Declaration, cards: CardId[], outcome: PlayOutcome, bid: number, doubling: Doubling | null = null): GameOutcome {
  const settlement = settle({ declaration, declarerCards: cards, outcome, bid, doubling: doubling ?? undefined });
  return { kind: 'game', declarer: 0, declaration, bid, doubling, outcome, settlement };
}

const steps = (g: GameOutcome, cards: CardId[], ctx = official) => scoreSteps(g, cards).map((s) => resolveText(s, ctx));

const MIT_3: CardId[] = ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-7', 'd-7', 'd-8', 'd-9'];
const plain = (game: Declaration['game'], hand = false, announce: Declaration['announce'] = 'none'): Declaration => ({ game, hand, announce });

describe('rozpisanie wyniku rozgrywającego', () => {
  it('przegrany grand: wartość bazowa, mnożnik, podwójna przegrana i Seeger-Fabian', () => {
    const g = game(plain({ kind: 'grand' }), MIT_3, { declarerPoints: 52, declarerTricks: 4 }, 18);
    expect(steps(g, MIT_3)).toEqual([
      'Wartość bazowa: grand = 24.',
      'Szczyty liczysz z kart rozgrywającego razem ze skatem. Mnożnik: 3 (z 3) + 1 (gra) = 4.',
      'Wartość gry: 24 × 4 = 96.',
      'Gra przegrana: rozgrywający ma 52 oczka, a potrzeba co najmniej 61. Przegrana liczy się podwójnie: −2 × 96 = −192.',
      'Zapis Seegera-Fabiana: za przegraną −50, czyli −192 − 50 = −242 dla rozgrywającego, a każdy z obrońców dostaje +40.',
    ]);
  });

  it('wygrana z kontrą, bez matadorów i z krawcem', () => {
    const cards: CardId[] = ['d-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 'c-10', 's-A', 's-10', 'd-A', 'd-10'];
    const g = game(plain({ kind: 'suit', trump: 'h' }), cards, { declarerPoints: 95, declarerTricks: 8 }, 18, 'kontra');
    expect(steps(g, cards)).toEqual([
      'Wartość bazowa: czerwień = 10.',
      'Szczyty liczysz z kart rozgrywającego razem ze skatem. Mnożnik: 3 (bez 3) + 1 (gra) + 1 (krawiec) = 5.',
      'Wartość gry: 10 × 5 = 50.',
      'Kontra: wartość × 2 = 100.',
      'Gra wygrana: rozgrywający ma 95 oczek (potrzeba co najmniej 61). Wynik: +100.',
      'Zapis Seegera-Fabiana: za wygraną +50, czyli 100 + 50 = +150 dla rozgrywającego.',
    ]);
  });

  it('przelicytowanie: wartość podniesiona do stawki', () => {
    const cards: CardId[] = ['c-J', 'h-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'c-A', 'c-10', 's-A', 's-10', 'd-A', 'd-10'];
    const g = game(plain({ kind: 'suit', trump: 'h' }), cards, { declarerPoints: 70, declarerTricks: 6 }, 36);
    const s = steps(g, cards);
    expect(s[2]).toBe('Wartość gry: 10 × 2 = 20.');
    expect(s[3]).toBe(
      'Przelicytowanie: wartość 20 jest niższa od stawki 36, więc gra jest przegrana. Liczy się najmniejsza wielokrotność wartości bazowej, która sięga stawki: 10 × 4 = 40.',
    );
    expect(s[4]).toBe('Gra przegrana przez przelicytowanie — 70 oczek rozgrywającego nic tu nie zmienia. Przegrana liczy się podwójnie: −2 × 40 = −80.');
  });

  it('gra z ręki z zapowiedzią krawca', () => {
    const g = game(plain({ kind: 'grand' }, true, 'schneider'), MIT_3, { declarerPoints: 92, declarerTricks: 8 }, 18);
    const s = steps(g, MIT_3);
    expect(s[1]).toBe(
      'Szczyty liczysz z kart rozgrywającego razem ze skatem. Mnożnik: 3 (z 3) + 1 (gra) + 1 (gra z ręki) + 1 (krawiec) + 1 (zapowiedź krawca) = 7.',
    );
    expect(s[3]).toBe('Gra wygrana: rozgrywający ma 92 oczka — zapowiedział krawca, a potrzeba co najmniej 90. Wynik: +168.');
  });

  it('null z ręki: stała wartość, przegrana po wzięciu lewy', () => {
    const g = game(plain({ kind: 'null' }, true), MIT_3, { declarerPoints: 10, declarerTricks: 1 }, 18);
    expect(steps(g, MIT_3, colloquial)).toEqual([
      'Null (hand) ma stałą wartość 35 — bez mnożnika.',
      'Gra przegrana: szpiler wziął sztycha. Przegrana liczy się podwójnie: −2 × 35 = −70.',
      'Zapis Seegera-Fabiana: za przegraną −50, czyli −70 − 50 = −120 dla szpilera, a każdy z przeciwników dostaje +40.',
    ]);
  });

  it('teksty mają poprawne tokeny słowniczka', () => {
    const cases = [
      game(plain({ kind: 'null' }, false, 'ouvert'), MIT_3, { declarerPoints: 0, declarerTricks: 0 }, 18),
      game(plain({ kind: 'grand' }, true, 'ouvert'), MIT_3, { declarerPoints: 120, declarerTricks: 10 }, 18, 're'),
      game(plain({ kind: 'grand' }, true, 'schwarz'), MIT_3, { declarerPoints: 100, declarerTricks: 9 }, 18),
    ];
    for (const g of cases) {
      for (const s of scoreSteps(g, MIT_3)) {
        expect(findTextIssues(s)).toEqual([]);
        expect(resolveText(s, colloquial)).not.toMatch(/\[\[|\{/);
      }
    }
  });
});
