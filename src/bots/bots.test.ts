// src/bots/bots.test.ts
import { describe, expect, it } from 'vitest';
import { createDeal, isDealOver, playCard, currentPlayer, type DealState, type GameType, type Hands } from '../engine';
import { createBot, heuristicBot } from './index';

const hearts: GameType = { kind: 'suit', trump: 'h' };

function stateAfter(game: GameType, declarer: 0 | 1 | 2, leader: 0 | 1 | 2, hands: Hands, plays: string[]): DealState {
  let state = createDeal({ game, declarer, leader, hands });
  for (const card of plays) state = playCard(state, card as never);
  return state;
}

describe('bot heurystyczny', () => {
  it('dokłada oczka, gdy lewę bierze partner', () => {
    const state = stateAfter(hearts, 0, 1, [['h-7'], ['s-A'], ['s-10', 's-7']], ['s-A']);
    expect(heuristicBot(state, 2)).toBe('s-10');
  });

  it('bierze lewę najtańszą wygrywającą kartą', () => {
    const state = stateAfter(hearts, 0, 1, [['s-A', 's-10', 'h-7'], ['s-K'], ['s-7']], ['s-K', 's-7']);
    expect(heuristicBot(state, 0)).toBe('s-10');
  });

  it('bez szans na lewę zrzuca najtańszą kartę', () => {
    const state = stateAfter(hearts, 0, 1, [['c-K', 'c-7'], ['s-A'], ['s-7']], ['s-A', 's-7']);
    expect(heuristicBot(state, 0)).toBe('c-7');
  });

  it('wyjście: rozgrywający ciągnie najwyższe atu, obrońca wychodzi asem', () => {
    const declarerLead = stateAfter(hearts, 0, 0, [['s-A', 'h-7', 'h-J'], [], []], []);
    expect(heuristicBot(declarerLead, 0)).toBe('h-J');
    const defenderLead = stateAfter(hearts, 0, 1, [[], ['s-7', 's-A', 'd-9'], []], []);
    expect(heuristicBot(defenderLead, 1)).toBe('s-A');
  });

  it('null: rozgrywający podkłada się pod lewę', () => {
    const state = stateAfter({ kind: 'null' }, 0, 1, [['h-10', 'h-7', 'h-A'], ['h-9'], ['h-8']], ['h-9', 'h-8']);
    expect(heuristicBot(state, 0)).toBe('h-7');
  });

  it('trzy boty rozgrywają całe rozdanie bez błędu', () => {
    let state = createDeal({
      game: hearts,
      declarer: 0,
      hands: [
        ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'c-A', 's-A', 'd-A'],
        ['h-Q', 'h-9', 'c-10', 'c-K', 'c-Q', 's-10', 's-K', 'd-10', 'd-9', 'd-8'],
        ['h-8', 'h-7', 'c-9', 'c-8', 'c-7', 's-Q', 's-9', 's-8', 'd-K', 'd-Q'],
      ],
      skat: ['d-7', 's-7'],
    });
    while (!isDealOver(state)) {
      const seat = currentPlayer(state);
      state = playCard(state, heuristicBot(state, seat));
    }
    expect(state.tricks).toHaveLength(10);
  });
});

describe('bot ze skryptem', () => {
  it('gra kartę ze skryptu, jeśli jest dozwolona; inaczej heurystyka', () => {
    const state = stateAfter(hearts, 0, 1, [['h-7'], ['s-A'], ['s-10', 's-7', 'c-9']], ['s-A']);
    expect(createBot(['s-7'])(state, 2)).toBe('s-7');
    expect(createBot(['c-9'])(state, 2)).toBe('s-10');
    expect(createBot()(state, 2)).toBe('s-10');
  });
});
