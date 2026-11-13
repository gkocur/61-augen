import { buildSceneCards, sideOf } from './sceneCards';

describe('sideOf', () => {
  it('następny gracz siedzi po lewej, poprzedni po prawej', () => {
    expect(sideOf(1, 1)).toBe('you');
    expect(sideOf(2, 1)).toBe('left');
    expect(sideOf(0, 1)).toBe('right');
  });
});

describe('buildSceneCards', () => {
  it('rozkłada rękę, przeciwników, lewę, stosy i skat', () => {
    const cards = buildSceneCards({
      you: 0,
      hand: ['c-J', 'h-A'],
      left: ['s-7'],
      right: ['d-8', 'd-9'],
      trick: { cards: ['c-A', 'c-10'], leader: 1 },
      taken: [
        { leader: 0, cards: ['h-7', 'h-8', 'h-9'], winner: 2 },
        { leader: 2, cards: ['s-A', 's-10', 's-K'], winner: 2 },
      ],
      skat: { cards: ['d-7', 'd-A'], faceUp: false },
    });
    const place = (id: string) => cards.find((c) => c.id === id)?.place;
    expect(place('h-A')).toEqual({ zone: 'hand', index: 1, count: 2 });
    expect(place('s-7')).toEqual({ zone: 'opp', side: 'left', index: 0, count: 1 });
    expect(place('d-9')).toEqual({ zone: 'opp', side: 'right', index: 1, count: 2 });
    // Wyszedł środek (po lewej), dołożył zadek (po prawej).
    expect(place('c-A')).toEqual({ zone: 'trick', side: 'left', order: 0 });
    expect(place('c-10')).toEqual({ zone: 'trick', side: 'right', order: 1 });
    // Obie lewy wziął gracz z prawej: jeden stos, kolejne indeksy.
    expect(place('h-7')).toEqual({ zone: 'pile', side: 'right', index: 0 });
    expect(place('s-K')).toEqual({ zone: 'pile', side: 'right', index: 5 });
    expect(place('d-A')).toEqual({ zone: 'skat', index: 1, faceUp: false });
    expect(cards).toHaveLength(15);
  });

  it('każda karta występuje tylko raz — karta z lewy nie dubluje się w ręce', () => {
    const cards = buildSceneCards({ you: 0, hand: ['c-J', 'h-A'], trick: { cards: ['c-J'], leader: 0 } });
    expect(cards.filter((c) => c.id === 'c-J')).toEqual([{ id: 'c-J', place: { zone: 'trick', side: 'you', order: 0 } }]);
  });
});
