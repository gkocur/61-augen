// src/engine/deal.test.ts
import { describe, expect, it } from 'vitest';
import { createDeal, currentPlayer, dealResult, isDealOver, playCard, sameTeam, type DealState } from './deal';
import type { GameType } from './game';

const hearts: GameType = { kind: 'suit', trump: 'h' };

const smallDeal = (): DealState =>
  createDeal({
    game: hearts,
    declarer: 0,
    hands: [['c-J', 'c-A'], ['c-7', 's-10'], ['c-8', 's-A']],
    skat: ['d-10'],
  });

describe('rozdanie', () => {
  it('przodek zaczyna, kolejka idzie zgodnie z miejscami', () => {
    let state = smallDeal();
    expect(currentPlayer(state)).toBe(0);
    state = playCard(state, 'c-J');
    expect(currentPlayer(state)).toBe(1);
    expect(state.hands[0]).toEqual(['c-A']);
    expect(state.trick).toEqual(['c-J']);
  });

  it('po trzech kartach lewa trafia do zwycięzcy, który wychodzi dalej', () => {
    let state = smallDeal();
    for (const card of ['c-J', 's-10', 'c-8'] as const) state = playCard(state, card);
    expect(state.trick).toEqual([]);
    expect(state.tricks).toEqual([{ leader: 0, cards: ['c-J', 's-10', 'c-8'], winner: 0 }]);
    expect(currentPlayer(state)).toBe(0);
  });

  it('odrzuca niedozwolone zagranie i grę po końcu rozdania', () => {
    const afterLead = playCard(smallDeal(), 'c-A');
    expect(() => playCard(afterLead, 's-10')).toThrow(/Niedozwolone/);
    let state = smallDeal();
    for (const card of ['c-J', 's-10', 'c-8', 'c-A', 'c-7', 's-A'] as const) state = playCard(state, card);
    expect(isDealOver(state)).toBe(true);
    expect(() => playCard(state, 'c-A')).toThrow(/zakończone/);
  });

  it('wynik: oczka rozgrywającego liczą skat, wygrana od 61', () => {
    let state = smallDeal();
    for (const card of ['c-J', 's-10', 'c-8', 'c-A', 'c-7', 's-A'] as const) state = playCard(state, card);
    expect(dealResult(state)).toEqual({ declarerPoints: 44, defenderPoints: 0, declarerTricks: 2, declarerWon: false });
  });

  it('null kończy się, gdy rozgrywający weźmie lewę', () => {
    let state = createDeal({
      game: { kind: 'null' },
      declarer: 1,
      hands: [['h-7', 's-7'], ['h-A', 's-8'], ['h-8', 's-9']],
    });
    for (const card of ['h-7', 'h-A', 'h-8'] as const) state = playCard(state, card);
    expect(isDealOver(state)).toBe(true);
    expect(dealResult(state).declarerWon).toBe(false);
  });

  it('drużyny: obrońcy grają razem', () => {
    expect(sameTeam(1, 2, 0)).toBe(true);
    expect(sameTeam(0, 1, 0)).toBe(false);
    expect(sameTeam(0, 0, 0)).toBe(true);
  });
});
