// src/game/botPlayer.test.ts
import { describe, expect, it } from 'vitest';
import { maxBidFor } from '../engine';
import { botAction } from './botPlayer';
import { applyGameAction, gameActor, replayGameDeal, startGameDeal, type GameDeal, type GameOptions } from './deal';
import type { DealtCards } from './random';

const OPTIONS: GameOptions = { kontra: true, ramsch: true };

/** Rozgrywa całe rozdanie samymi botami. */
function runBots(seed: number, options = OPTIONS, cards?: DealtCards): GameDeal {
  let s = startGameDeal(seed, options, cards);
  for (let i = 0; i < 200 && s.phase !== 'done'; i++) {
    const seat = gameActor(s)!;
    s = applyGameAction(s, seat, botAction(s, seat));
  }
  return s;
}

describe('bot w rozdaniu', () => {
  it('silna ręka licytuje i gra; słabe pasują', () => {
    const cards: DealtCards = {
      hands: [
        ['h-8', 'h-7', 'c-8', 'c-K', 's-Q', 's-9', 'd-10', 'd-K', 'd-Q', 'c-9'],
        ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 'd-7', 's-8'],
        ['h-J', 'd-J', 'c-10', 'c-Q', 'c-7', 's-10', 's-K', 's-7', 'd-9', 'd-8'],
      ],
      skat: ['s-A', 'd-A'],
    };
    const done = runBots(1, OPTIONS, cards);
    expect(done.declarer).toBe(1);
    expect(done.bid).toBeLessThanOrEqual(maxBidFor(cards.hands[1], { kind: 'suit', trump: 'h' }));
    expect(done.result?.kind).toBe('game');
  });

  it('licytuje kolejną stawką tylko do swojej granicy', () => {
    const s = startGameDeal(5, OPTIONS);
    const action = botAction(s, 1);
    expect(['bid', 'pass']).toContain(action.type);
    if (action.type === 'bid') expect(action.value).toBe(18);
  });
});

describe('podpowiedź w grze z ręki', () => {
  it('nie korzysta z ukrytego skata przy wyborze gry', () => {
    const cards: DealtCards = {
      hands: [
        ['s-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'h-8', 'c-A', 's-A', 'd-A'],
        ['h-J', 'd-J', 'c-10', 'c-K', 'c-Q', 'c-9', 's-10', 's-K', 'd-10', 'd-K'],
        ['h-7', 'c-8', 'c-7', 's-Q', 's-9', 's-8', 's-7', 'd-Q', 'd-9', 'd-8'],
      ],
      skat: ['c-J', 'd-7'],
    };
    let s = startGameDeal(1, OPTIONS, cards);
    s = applyGameAction(s, 1, { type: 'pass' });
    s = applyGameAction(s, 2, { type: 'pass' });
    s = applyGameAction(s, 0, { type: 'bid', value: 18 });
    s = applyGameAction(s, 0, { type: 'playHand' });
    expect(s.phase).toBe('declare');
    expect(botAction(s, 0)).toEqual({ type: 'declare', game: { kind: 'suit', trump: 'h' }, announce: 'none' });
  });
});

describe('odtwarzanie', () => {
  it('rozegrane przez boty rozdanie odtwarza się z ziarna i historii', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const done = runBots(seed);
      expect(replayGameDeal(seed, OPTIONS, done.history)).toEqual(done);
    }
  });
});

describe('symulacja: boty przeciwko botom', () => {
  it('300 losowych rozdań kończy się bez błędów i z poprawnym wynikiem', () => {
    const kinds = { game: 0, ramsch: 0, passedOut: 0 };
    for (let seed = 1; seed <= 300; seed++) {
      const done = runBots(seed, { kontra: true, ramsch: seed % 2 === 0 });
      expect(done.phase).toBe('done');
      const r = done.result!;
      kinds[r.kind]++;
      if (r.kind === 'game') {
        expect(r.outcome.declarerPoints).toBeGreaterThanOrEqual(0);
        expect(r.outcome.declarerPoints).toBeLessThanOrEqual(120);
        expect(r.settlement.value).toBeGreaterThan(0);
      }
      if (r.kind === 'ramsch') expect(r.points.reduce((a, b) => a + b, 0)).toBe(120);
    }
    // Rozsądek: większość rozdań to gry, ale zdarzają się też pasy — z ramszem i bez.
    expect(kinds.game).toBeGreaterThan(100);
    expect(kinds.ramsch).toBeGreaterThan(0);
    expect(kinds.passedOut).toBeGreaterThan(0);
  });
});
