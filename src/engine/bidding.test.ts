// src/engine/bidding.test.ts
import { describe, expect, it } from 'vitest';
import { BID_VALUES, maxBidFor, nextBid } from './bidding';

// Lista ze specyfikacji (sekcja 3.1) — wszystkie możliwe wartości gier od 18.
const SPEC_BIDS = [
  18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88,
  90, 96, 99, 100, 108, 110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168,
  170, 176, 180, 187, 192, 198, 204, 216, 240, 264,
];

describe('stawki licytacji', () => {
  it('generowana lista zgadza się ze specyfikacją', () => {
    expect(BID_VALUES).toEqual(SPEC_BIDS);
  });

  it('kolejna stawka', () => {
    expect(nextBid(null)).toBe(18);
    expect(nextBid(18)).toBe(20);
    expect(nextBid(24)).toBe(27);
    expect(nextBid(36)).toBe(40);
    expect(nextBid(25)).toBe(27);
    expect(nextBid(264)).toBeNull();
  });

  it('górna granica licytacji dla ręki', () => {
    expect(maxBidFor(['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 's-10', 'd-9'], { kind: 'suit', trump: 'h' })).toBe(30);
    expect(maxBidFor(['c-J', 's-J', 'h-A'], { kind: 'suit', trump: 'h' }, true)).toBe(40);
    expect(maxBidFor(['d-A', 'd-10', 'c-A'], { kind: 'suit', trump: 'd' })).toBe(45);
    expect(maxBidFor(['c-J', 's-J', 'c-A'], { kind: 'grand' })).toBe(72);
    expect(maxBidFor([], { kind: 'null' })).toBe(23);
    expect(maxBidFor([], { kind: 'null' }, true)).toBe(35);
  });
});
