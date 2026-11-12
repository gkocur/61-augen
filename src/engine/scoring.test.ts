// src/engine/scoring.test.ts
import { describe, expect, it } from 'vitest';
import type { CardId } from './cards';
import type { GameType } from './game';
import { declarationIssue, matadors, nullValue, settle, tournamentPoints, type Declaration } from './scoring';

const hearts: GameType = { kind: 'suit', trump: 'h' };
const clubs: GameType = { kind: 'suit', trump: 'c' };
const diamonds: GameType = { kind: 'suit', trump: 'd' };
const grand: GameType = { kind: 'grand' };
const decl = (game: GameType, hand = false, announce: Declaration['announce'] = 'none'): Declaration => ({ game, hand, announce });

// ♥, z 2 (♣W ♠W, brak ♥W)
const HEARTS_WITH_2: CardId[] = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'];
// ♣, z 1
const CLUBS_WITH_1: CardId[] = ['c-J', 'h-J', 'c-A', 'c-10', 'c-K', 'c-Q', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'd-7'];
// ♦, bez 1
const DIAMONDS_WITHOUT_1: CardId[] = ['s-J', 'h-J', 'd-A', 'd-10', 'd-K', 'd-Q', 'd-9', 'c-A', 'c-10', 's-A', 'h-A', 'h-10'];
// grand, z 2
const GRAND_WITH_2: CardId[] = ['c-J', 's-J', 'd-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-K', 'd-A', 'd-10', 'd-9'];

describe('matadory', () => {
  it('z / bez w grze kolorowej', () => {
    expect(matadors(HEARTS_WITH_2, hearts)).toEqual({ with: true, count: 2 });
    expect(matadors(DIAMONDS_WITHOUT_1, diamonds)).toEqual({ with: false, count: 1 });
    expect(matadors(['h-J', 'd-J', 'h-A'], hearts)).toEqual({ with: false, count: 2 });
  });

  it('pełny ciąg: z 11 w kolorze, z 4 / bez 4 w grandzie', () => {
    const all: CardId[] = ['c-J', 's-J', 'h-J', 'd-J', 'c-A', 'c-10', 'c-K', 'c-Q', 'c-9', 'c-8', 'c-7'];
    expect(matadors(all, clubs)).toEqual({ with: true, count: 11 });
    expect(matadors(all, grand)).toEqual({ with: true, count: 4 });
    expect(matadors(['c-A', 's-A'], grand)).toEqual({ with: false, count: 4 });
  });

  it('null nie ma matadorów', () => {
    expect(() => matadors([], { kind: 'null' })).toThrow();
  });
});

describe('zgłoszenie gry', () => {
  it('zapowiedzi tylko z ręki; w nullu tylko otwarty', () => {
    expect(declarationIssue(decl(hearts, false, 'schneider'))).toMatch(/z ręki/);
    expect(declarationIssue(decl(hearts, true, 'schwarz'))).toBeNull();
    expect(declarationIssue(decl({ kind: 'null' }, false, 'schneider'))).toMatch(/null/i);
    expect(declarationIssue(decl({ kind: 'null' }, false, 'ouvert'))).toBeNull();
  });

  it('wartości nulla', () => {
    expect(nullValue(decl({ kind: 'null' }))).toBe(23);
    expect(nullValue(decl({ kind: 'null' }, true))).toBe(35);
    expect(nullValue(decl({ kind: 'null' }, false, 'ouvert'))).toBe(46);
    expect(nullValue(decl({ kind: 'null' }, true, 'ouvert'))).toBe(59);
  });
});

describe('rozliczenie gry', () => {
  const won = (points: number, tricks: number) => ({ declarerPoints: points, declarerTricks: tricks });

  it('zwykła wygrana: bazowa × (matadory + 1)', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: won(75, 6) })).toEqual({
      won: true, value: 30, score: 30, overbid: false, schneider: false, schwarz: false,
    });
  });

  it('z ręki +1, krawiec +1, czarny +1', () => {
    expect(settle({ declaration: decl(hearts, true), declarerCards: HEARTS_WITH_2, outcome: won(70, 6) }).value).toBe(40);
    expect(settle({ declaration: decl(clubs), declarerCards: CLUBS_WITH_1, outcome: won(95, 8) }).value).toBe(36);
    expect(settle({ declaration: decl(grand), declarerCards: GRAND_WITH_2, outcome: won(120, 10) }).value).toBe(120);
  });

  it('zapowiedziany krawiec: spełniony i niespełniony', () => {
    const ok = settle({ declaration: decl(diamonds, true, 'schneider'), declarerCards: DIAMONDS_WITHOUT_1, outcome: won(92, 8) });
    expect(ok).toMatchObject({ won: true, value: 45, score: 45 });
    const failed = settle({ declaration: decl(diamonds, true, 'schneider'), declarerCards: DIAMONDS_WITHOUT_1, outcome: won(85, 7) });
    expect(failed).toMatchObject({ won: false, value: 45, score: -90 });
  });

  it('gra otwarta: wszystkie poziomy', () => {
    const s = settle({ declaration: decl(hearts, true, 'ouvert'), declarerCards: HEARTS_WITH_2, outcome: won(120, 10) });
    expect(s).toMatchObject({ won: true, value: 90 });
  });

  it('przegrana liczy się podwójnie; krawiec także przy przegranej', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: won(55, 4) })).toMatchObject({ won: false, value: 30, score: -60 });
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: won(25, 2) })).toMatchObject({ won: false, value: 40, score: -80, schneider: true });
  });

  it('przelicytowanie: przegrana z wartością będącą wielokrotnością bazowej ≥ stawki', () => {
    const cards: CardId[] = ['c-J', 'h-J', 'h-A', 'h-10', 'h-K', 'h-8', 'c-A', 's-A', 's-10', 'd-A', 'd-K', 'd-7'];
    expect(settle({ declaration: decl(hearts), declarerCards: cards, outcome: won(80, 7), bid: 30 })).toEqual({
      won: false, value: 30, score: -60, overbid: true, schneider: false, schwarz: false,
    });
  });

  it('null: wygrana bez lew, przegrana podwójnie', () => {
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: won(0, 0) })).toMatchObject({ won: true, score: 23 });
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: won(4, 1) })).toMatchObject({ won: false, score: -46 });
  });

  it('niepoprawne zgłoszenie to błąd', () => {
    expect(() => settle({ declaration: decl(hearts, false, 'schwarz'), declarerCards: HEARTS_WITH_2, outcome: won(120, 10) })).toThrow();
  });
});

describe('przypadki brzegowe rozliczenia', () => {
  const o = (points: number, tricks: number) => ({ declarerPoints: points, declarerTricks: tricks });
  const run = (d: Declaration, cards: CardId[], points: number, tricks: number, bid?: number) =>
    settle({ declaration: d, declarerCards: cards, outcome: o(points, tricks), bid });

  it('60 oczek to przegrana, 61 to wygrana', () => {
    expect(run(decl(hearts), HEARTS_WITH_2, 60, 5)).toMatchObject({ won: false, score: -60 });
    expect(run(decl(hearts), HEARTS_WITH_2, 61, 5)).toMatchObject({ won: true, score: 30 });
  });

  it('krawiec dokładnie od 90 oczek; rozgrywający krawiec do 30 oczek', () => {
    expect(run(decl(hearts), HEARTS_WITH_2, 90, 7)).toMatchObject({ schneider: true, value: 40 });
    expect(run(decl(hearts), HEARTS_WITH_2, 30, 3)).toMatchObject({ won: false, schneider: true, value: 40, score: -80 });
    expect(run(decl(hearts), HEARTS_WITH_2, 31, 3)).toMatchObject({ won: false, schneider: false, score: -60 });
  });

  it('0 lew i 0 oczek to czarny przy przegranej', () => {
    expect(run(decl(hearts), HEARTS_WITH_2, 0, 0)).toMatchObject({ won: false, schwarz: true, value: 50, score: -100 });
  });

  it('nieudana zapowiedź czarnego', () => {
    expect(run(decl(hearts, true, 'schwarz'), HEARTS_WITH_2, 100, 9)).toMatchObject({ won: false, value: 80, score: -160 });
  });

  it('zapowiedziany krawiec i osiągnięty czarny', () => {
    expect(run(decl(hearts, true, 'schneider'), HEARTS_WITH_2, 120, 10)).toMatchObject({ won: true, value: 70 });
  });

  it('przelicytowanie: zaokrąglenie do wielokrotności bazowej', () => {
    const s = run(decl(diamonds), DIAMONDS_WITHOUT_1, 70, 6, 20);
    expect(s).toMatchObject({ won: false, value: 27, score: -54, overbid: true });
    expect(tournamentPoints(s)).toEqual({ declarer: -104, eachDefender: 40 });
  });

  it('przelicytowanie ratuje krawiec', () => {
    expect(run(decl(diamonds), DIAMONDS_WITHOUT_1, 95, 8, 27)).toMatchObject({ won: true, value: 27, overbid: false });
  });

  it('null otwarty z ręki przegrany', () => {
    expect(run(decl({ kind: 'null' }, true, 'ouvert'), [], 0, 1)).toMatchObject({ won: false, value: 59, score: -118 });
  });

  it('błędy: null po zbyt wysokiej stawce, niepoprawny wynik', () => {
    expect(() => run(decl({ kind: 'null' }), [], 0, 0, 24)).toThrow(/ISkO 3.6/);
    expect(() => run(decl({ kind: 'null' }), [], 0, 0, 23)).not.toThrow();
    expect(() => run(decl(hearts), HEARTS_WITH_2, 121, 10)).toThrow(/Nieprawidłowy/);
    expect(() => run(decl(hearts), HEARTS_WITH_2, 60, 11)).toThrow(/Nieprawidłowy/);
  });
});

describe('zapis Seeger-Fabian', () => {
  it('wygrana +50, przegrana −2×wartość −50 i +40 dla każdego obrońcy', () => {
    const win = settle({ declaration: decl(clubs), declarerCards: CLUBS_WITH_1, outcome: { declarerPoints: 95, declarerTricks: 8 } });
    expect(tournamentPoints(win)).toEqual({ declarer: 86, eachDefender: 0 });
    const loss = settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: { declarerPoints: 55, declarerTricks: 4 } });
    expect(tournamentPoints(loss)).toEqual({ declarer: -110, eachDefender: 40 });
  });
});

describe('kontra i re', () => {
  const outcome = (points: number, tricks: number) => ({ declarerPoints: points, declarerTricks: tricks });
  it('kontra podwaja, re czterokrotnie zwiększa wartość', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), doubling: 'kontra' })).toMatchObject({ won: true, value: 60, score: 60 });
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), doubling: 're' })).toMatchObject({ value: 120 });
  });
  it('przegrana z kontrą liczona podwójnie od podwojonej wartości', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(55, 4), doubling: 'kontra' })).toMatchObject({ won: false, value: 60, score: -120 });
  });
  it('null z kontrą i punkty turniejowe', () => {
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: outcome(0, 0), doubling: 'kontra' })).toMatchObject({ value: 46, score: 46 });
    const won = settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), doubling: 'kontra' });
    expect(tournamentPoints(won)).toEqual({ declarer: 110, eachDefender: 0 });
  });
  it('punkty turniejowe przegranej gry z kontrą', () => {
    const lost = settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(55, 4), doubling: 'kontra' });
    expect(tournamentPoints(lost)).toEqual({ declarer: -170, eachDefender: 40 });
  });
  it('przelicytowanie z re: wartość z przelicytowania razy 4', () => {
    // wartość 30 < stawka 40 -> 10 * ceil(40/10) = 40, z re 160
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), bid: 40, doubling: 're' })).toMatchObject({
      overbid: true,
      won: false,
      value: 160,
      score: -320,
    });
  });
  it('przegrany null z re', () => {
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: outcome(10, 1), doubling: 're' })).toMatchObject({ won: false, value: 92, score: -184 });
  });
});

describe('bock', () => {
  const outcome = (points: number, tricks: number) => ({ declarerPoints: points, declarerTricks: tricks });
  it('bock podwaja wartość gry', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), bock: true })).toMatchObject({ won: true, value: 60, score: 60 });
  });
  it('bock łączy się z kontrą; przegrana liczona podwójnie', () => {
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(55, 4), doubling: 'kontra', bock: true })).toMatchObject({ won: false, value: 120, score: -240 });
  });
  it('bock w nullu', () => {
    expect(settle({ declaration: decl({ kind: 'null' }), declarerCards: [], outcome: outcome(0, 0), bock: true })).toMatchObject({ value: 46 });
  });
  it('przelicytowanie sprawdza się bez bocka', () => {
    // 30 < 40 -> 40, w bocku 80
    expect(settle({ declaration: decl(hearts), declarerCards: HEARTS_WITH_2, outcome: outcome(75, 6), bid: 40, bock: true })).toMatchObject({ overbid: true, value: 80, score: -160 });
  });
});

describe('ramsz w wycenie', () => {
  it('ramsza nie da się zgłosić ani wycenić', () => {
    expect(declarationIssue(decl({ kind: 'ramsch' }))).toBe('Ramsza się nie zgłasza — to gra bez rozgrywającego');
    expect(() => settle({ declaration: decl({ kind: 'ramsch' }), declarerCards: [], outcome: { declarerPoints: 60, declarerTricks: 5 } })).toThrow('Ramsza się nie zgłasza');
    expect(() => matadors(HEARTS_WITH_2, { kind: 'ramsch' })).toThrow('Ramsz nie ma matadorów');
  });
});
