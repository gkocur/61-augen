// src/game/auction.test.ts
import { describe, expect, it } from 'vitest';
import type { Seat } from '../engine';
import { allowedBids, applyAuction, auctionActor, startAuction, type AuctionAction, type AuctionState } from './auction';

const run = (steps: [Seat, AuctionAction][]): AuctionState =>
  steps.reduce((a, [seat, action]) => applyAuction(a, seat, action), startAuction());
const bid = (value: number): AuctionAction => ({ type: 'bid', value });
const hold: AuctionAction = { type: 'hold' };
const pass: AuctionAction = { type: 'pass' };

describe('licytacja (ISkO)', () => {
  it('zaczyna środkowa ręka, mówiąc do ręki', () => {
    const a = startAuction();
    expect(auctionActor(a)).toBe(1);
    expect(allowedBids(a)[0]).toBe(18);
  });

  it('środkowa mówi, ręka trzyma, środkowa pasuje; ostatnia przebija i wygrywa', () => {
    const a = run([
      [1, bid(18)], [0, hold], [1, bid(20)], [0, hold], [1, pass],
      [2, bid(22)], [0, pass],
    ]);
    expect(a).toMatchObject({ stage: 'done', winner: 2, highest: 22 });
    expect(auctionActor(a)).toBeNull();
  });

  it('ręka pasuje na 18; ostatnia ręka nie licytuje — wygrywa środkowa za 18', () => {
    const a = run([[1, bid(18)], [0, pass], [2, pass]]);
    expect(a).toMatchObject({ stage: 'done', winner: 1, highest: 18 });
  });

  it('w etapie 2 ostatnia ręka mówi do zwycięzcy etapu 1', () => {
    const a = run([[1, bid(18)], [0, pass]]);
    expect(a).toMatchObject({ stage: 2, bidder: 2, listener: 1 });
    expect(auctionActor(a)).toBe(2);
    expect(allowedBids(a)[0]).toBe(20);
  });

  it('nikt nic nie mówi: ręka może zagrać za 18', () => {
    const a = run([[1, pass], [2, pass]]);
    expect(a.stage).toBe(3);
    expect(auctionActor(a)).toBe(0);
    expect(allowedBids(a)).toEqual([18]);
    expect(applyAuction(a, 0, bid(18))).toMatchObject({ stage: 'done', winner: 0, highest: 18 });
    expect(applyAuction(a, 0, pass)).toMatchObject({ stage: 'done', winner: null, highest: null });
  });

  it('ostatnia ręka mówi do ręki, gdy środkowa od razu pasuje', () => {
    const a = run([[1, pass], [2, bid(18)], [0, hold], [2, pass]]);
    expect(a).toMatchObject({ stage: 'done', winner: 0, highest: 18 });
  });

  it('odrzuca ruchy nie w swojej kolejce i złe stawki', () => {
    const a = startAuction();
    expect(() => applyAuction(a, 0, bid(18))).toThrow('Teraz mówi gracz 1');
    expect(() => applyAuction(a, 1, bid(19))).toThrow('Niedozwolona stawka: 19');
    expect(() => applyAuction(a, 1, hold)).toThrow('Mówiący podaje stawkę albo pasuje');
    const afterBid = applyAuction(a, 1, bid(20));
    expect(() => applyAuction(afterBid, 0, bid(22))).toThrow('Odpowiadający mówi „tak” albo pasuje');
    const higher = applyAuction(applyAuction(afterBid, 0, hold), 1, bid(23));
    expect(higher.highest).toBe(23);
    expect(() => applyAuction(applyAuction(higher, 0, hold), 1, bid(23))).toThrow('Niedozwolona stawka: 23');
    expect(() => applyAuction(run([[1, pass], [2, pass]]), 0, bid(20))).toThrow('Ręka może tylko zagrać za 18');
    expect(() => applyAuction(run([[1, pass], [2, pass], [0, pass]]), 0, pass)).toThrow('Licytacja jest zakończona');
  });

  it('zapisuje przebieg wypowiedzi', () => {
    const a = run([[1, bid(18)], [0, hold], [1, pass]]);
    expect(a.log.map((e) => [e.seat, e.action.type])).toEqual([[1, 'bid'], [0, 'hold'], [1, 'pass']]);
  });
});
