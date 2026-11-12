// src/game/deal.test.ts
import { describe, expect, it } from 'vitest';
import { legalMoves, sumPoints, type CardId, type Seat } from '../engine';
import { heuristicBot } from '../bots';
import { applyGameAction, gameActor, replayGameDeal, startGameDeal, type GameAction, type GameDeal, type GameOptions } from './deal';
import type { DealtCards } from './random';

const CARDS: DealtCards = {
  hands: [
    ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 's-A', 'd-A'],
    ['h-J', 'd-J', 'c-10', 'c-K', 'c-Q', 'c-9', 's-10', 's-K', 'd-10', 'd-K'],
    ['h-8', 'h-7', 'c-8', 'c-7', 's-Q', 's-9', 's-8', 's-7', 'd-Q', 'd-9'],
  ],
  skat: ['d-8', 'd-7'],
};
const BOTH: GameOptions = { kontra: true, ramsch: true };
const HEARTS = { kind: 'suit', trump: 'h' } as const;

const act = (state: GameDeal, steps: [Seat, GameAction][]) => steps.reduce((s, [seat, a]) => applyGameAction(s, seat, a), state);
const pass: GameAction = { type: 'pass' };
const noDouble: GameAction = { type: 'noDouble' };
/** Ręka wygrywa licytację za 18 (pozostali pasują). */
const forehandWins = (options = BOTH) => act(startGameDeal(1, options, CARDS), [[1, pass], [2, pass], [0, { type: 'bid', value: 18 }]]);
const declaredHearts = (options = BOTH) =>
  act(forehandWins(options), [
    [0, { type: 'takeSkat' }],
    [0, { type: 'discard', cards: ['d-8', 'd-7'] }],
    [0, { type: 'declare', game: HEARTS, announce: 'none' }],
  ]);
/** Rozgrywa do końca: w grze — boty z heurystyką, w ramszu — pierwsza dozwolona karta. */
function playOut(state: GameDeal): GameDeal {
  let s = state;
  while (s.phase === 'play') {
    const seat = gameActor(s)!;
    const card = s.play!.game.kind === 'ramsch' ? legalMoves(s.play!.hands[seat], s.play!.trick, s.play!.game)[0] : heuristicBot(s.play!, seat);
    s = applyGameAction(s, seat, { type: 'play', card });
  }
  return s;
}

describe('rozdanie: licytacja i skat', () => {
  it('start: licytacja, mówi środkowa ręka', () => {
    const s = startGameDeal(1, BOTH, CARDS);
    expect(s.phase).toBe('bidding');
    expect(gameActor(s)).toBe(1);
  });

  it('zwycięzca licytacji zostaje rozgrywającym ze stawką', () => {
    const s = forehandWins();
    expect(s).toMatchObject({ phase: 'skat', declarer: 0, bid: 18 });
    expect(gameActor(s)).toBe(0);
  });

  it('podniesienie skata: 12 kart, potem wyrzucenie 2', () => {
    const taken = applyGameAction(forehandWins(), 0, { type: 'takeSkat' });
    expect(taken.phase).toBe('discard');
    expect(taken.hands[0]).toHaveLength(12);
    expect(taken.skat).toEqual([]);
    const discarded = applyGameAction(taken, 0, { type: 'discard', cards: ['d-A', 'd-8'] });
    expect(discarded.phase).toBe('declare');
    expect(discarded.hands[0]).toHaveLength(10);
    expect(discarded.skat).toEqual(['d-A', 'd-8']);
    expect(() => applyGameAction(taken, 0, { type: 'discard', cards: ['d-8', 'd-8'] })).toThrow('Wyrzuć 2 różne karty z ręki');
    expect(() => applyGameAction(taken, 0, { type: 'discard', cards: ['d-8', 'h-J'] })).toThrow('Wyrzuć 2 różne karty z ręki');
  });

  it('gra z ręki: skat zostaje, zapowiedzi dozwolone', () => {
    const hand = applyGameAction(forehandWins(), 0, { type: 'playHand' });
    expect(hand).toMatchObject({ phase: 'declare', hand: true, skat: ['d-8', 'd-7'] });
    const declared = applyGameAction(hand, 0, { type: 'declare', game: HEARTS, announce: 'schneider' });
    expect(declared.declaration).toEqual({ game: HEARTS, hand: true, announce: 'schneider' });
  });

  it('bez gry z ręki nie ma zapowiedzi', () => {
    const s = act(forehandWins(), [[0, { type: 'takeSkat' }], [0, { type: 'discard', cards: ['d-8', 'd-7'] }]]);
    expect(() => applyGameAction(s, 0, { type: 'declare', game: HEARTS, announce: 'schneider' })).toThrow(
      'Zapowiedzi są możliwe tylko w grze z ręki',
    );
  });

  it('null poniżej stawki jest niedozwolony (ISkO 3.6), null z ręki — tak', () => {
    const won24 = act(startGameDeal(1, BOTH, CARDS), [
      [1, { type: 'bid', value: 24 }], [0, { type: 'hold' }], [1, pass], [2, pass],
    ]);
    expect(won24).toMatchObject({ declarer: 0, bid: 24 });
    const afterSkat = act(won24, [[0, { type: 'takeSkat' }], [0, { type: 'discard', cards: ['d-8', 'd-7'] }]]);
    expect(() => applyGameAction(afterSkat, 0, { type: 'declare', game: { kind: 'null' }, announce: 'none' })).toThrow(
      'Nulla (23) nie można zgłosić po stawce 24 (ISkO 3.6)',
    );
    const hand = applyGameAction(won24, 0, { type: 'playHand' });
    expect(applyGameAction(hand, 0, { type: 'declare', game: { kind: 'null' }, announce: 'none' }).declaration?.game).toEqual({ kind: 'null' });
  });

  it('ramsza nie da się zgłosić', () => {
    const s = act(forehandWins(), [[0, { type: 'takeSkat' }], [0, { type: 'discard', cards: ['d-8', 'd-7'] }]]);
    expect(() => applyGameAction(s, 0, { type: 'declare', game: { kind: 'ramsch' }, announce: 'none' })).toThrow('Ramsza się nie zgłasza');
  });
});

describe('rozdanie: kontra i re', () => {
  it('obrońcy pytani po kolei; bez kontry — rozgrywka', () => {
    const s = declaredHearts();
    expect(s.phase).toBe('kontra');
    expect(gameActor(s)).toBe(1);
    const after = act(s, [[1, noDouble], [2, noDouble]]);
    expect(after).toMatchObject({ phase: 'play', doubling: null });
    expect(gameActor(after)).toBe(0);
  });

  it('kontra, potem re rozgrywającego', () => {
    const kontra = act(declaredHearts(), [[1, noDouble], [2, { type: 'double' }]]);
    expect(kontra).toMatchObject({ phase: 'kontra', doubling: 'kontra' });
    expect(gameActor(kontra)).toBe(0);
    expect(applyGameAction(kontra, 0, { type: 'double' })).toMatchObject({ phase: 'play', doubling: 're' });
    expect(applyGameAction(kontra, 0, noDouble)).toMatchObject({ phase: 'play', doubling: 'kontra' });
  });

  it('bez opcji kontry: od razu rozgrywka', () => {
    expect(declaredHearts({ kontra: false, ramsch: true }).phase).toBe('play');
  });
});

describe('rozdanie: rozgrywka i wynik', () => {
  it('pełne rozdanie kończy się rozliczeniem gry', () => {
    const done = playOut(act(declaredHearts(), [[1, noDouble], [2, { type: 'double' }], [0, noDouble]]));
    expect(done.phase).toBe('done');
    expect(gameActor(done)).toBeNull();
    const result = done.result!;
    if (result.kind !== 'game') throw new Error('oczekiwano gry');
    expect(result).toMatchObject({ declarer: 0, bid: 18, doubling: 'kontra' });
    // Kier z 2 (c-J, s-J): mnożnik 3, plus poziomy za krawca i czarnego; kontra ×2.
    const { schneider, schwarz } = result.settlement;
    expect(result.settlement.value).toBe(10 * (3 + (schneider ? 1 : 0) + (schwarz ? 1 : 0)) * 2);
    expect(result.outcome.declarerPoints).toBe(
      sumPoints(done.play!.tricks.filter((t) => t.winner === 0).flatMap((t) => t.cards)) + sumPoints(['d-8', 'd-7']),
    );
  });

  it('wszyscy pasują: bez ramsza rozdanie przepada', () => {
    const s = act(startGameDeal(1, { kontra: true, ramsch: false }, CARDS), [[1, pass], [2, pass], [0, pass]]);
    expect(s).toMatchObject({ phase: 'done', result: { kind: 'passedOut' } });
  });

  it('wszyscy pasują: z ramszem — ramsz do końca i rozliczenie', () => {
    const s = act(startGameDeal(1, BOTH, CARDS), [[1, pass], [2, pass], [0, pass]]);
    expect(s.phase).toBe('play');
    expect(s.play!.game).toEqual({ kind: 'ramsch' });
    expect(gameActor(s)).toBe(0);
    const done = playOut(s);
    const result = done.result!;
    if (result.kind !== 'ramsch') throw new Error('oczekiwano ramsza');
    expect(result.points.reduce((a, b) => a + b, 0)).toBe(120);
    expect(result.tricks.reduce((a, b) => a + b, 0)).toBe(10);
  });

  it('odrzuca ruch nie w kolejce i ruch nie w tej fazie', () => {
    expect(() => applyGameAction(startGameDeal(1, BOTH, CARDS), 0, pass)).toThrow('Teraz ruch gracza 1, a nie 0');
    expect(() => applyGameAction(forehandWins(), 0, { type: 'play', card: 'h-A' as CardId })).toThrow(
      'Ruch „play” jest niedozwolony w fazie „skat”',
    );
    const done = act(startGameDeal(1, { kontra: true, ramsch: false }, CARDS), [[1, pass], [2, pass], [0, pass]]);
    expect(() => applyGameAction(done, 0, pass)).toThrow('Rozdanie jest zakończone');
  });

  it('odtworzenie z ziarna i historii daje ten sam stan', () => {
    const s = act(startGameDeal(99, BOTH), [[1, pass], [2, pass], [0, pass]]);
    expect(replayGameDeal(99, BOTH, s.history)).toEqual(s);
    expect(s.history).toHaveLength(3);
  });
});
