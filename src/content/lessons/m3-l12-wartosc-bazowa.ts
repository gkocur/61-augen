// src/content/lessons/m3-l12-wartosc-bazowa.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm3-l12-wartosc-bazowa',
  title: 'Wartość bazowa gry',
  summary: 'Ile jest warta gra? Zaczynamy od wartości bazowej.',
  steps: [
    {
      title: 'Jak liczy się wartość gry?',
      text:
        'Wynik rozdania to nie tylko wygrana czy przegrana. Każda gra ma **wartość**, którą liczy się tak:\n\n' +
        '**wartość bazowa × mnożnik**\n\n' +
        'W tym module poznasz obie części. Zaczynamy od wartości bazowej.',
    },
    {
      title: 'Wartości bazowe',
      text:
        '[[GraKolorowa]] — zależy od koloru [[atu:Dlm]]:\n\n' +
        '**[[suit:d]] 9 · [[suit:h]] 10 · [[suit:s]] 11 · [[suit:c]] 12**\n\n' +
        '**[[Grand]] — 24.**\n\n' +
        'Kolejność jest taka sama jak starszeństwo kolorów, które już znasz.',
      cards: ['d-A', 'h-A', 's-A', 'c-A'],
      cardsCaption: 'Od najtańszego do najdroższego koloru [[atu:Dlm]].',
    },
    {
      title: '[[Null]] to wyjątek',
      text: '[[Null]] ma stałą wartość, bez mnożnika — poznasz ją w lekcji 15.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l12-q1',
      prompt: '[[GraKolorowa]], [[atu]]: [[suit:h]]. Jaka jest wartość bazowa?',
      options: [
        { id: 'a', text: '9' },
        { id: 'b', text: '10' },
        { id: 'c', text: '11' },
        { id: 'd', text: '12' },
      ],
      correct: 'b',
      explain: 'Kolor [[suit:h]] ma wartość bazową 10.',
    },
    {
      type: 'quiz',
      id: 'm3-l12-q2',
      prompt: 'Który kolor [[atu:Dlm]] ma najwyższą wartość bazową?',
      options: [
        { id: 'a', text: '[[Suit:c]]' },
        { id: 'b', text: '[[Suit:s]]' },
        { id: 'c', text: '[[Suit:h]]' },
        { id: 'd', text: '[[Suit:d]]' },
      ],
      correct: 'a',
      explain: '[[Suit:c]] — 12. Najtańszy jest kolor [[suit:d]] — 9.',
    },
    {
      type: 'quiz',
      id: 'm3-l12-q3',
      prompt: 'Ile wynosi wartość bazowa [[grand:D]]?',
      options: [
        { id: 'a', text: '12' },
        { id: 'b', text: '20' },
        { id: 'c', text: '24' },
      ],
      correct: 'c',
      explain: '[[Grand]] ma wartość bazową 24 — dwa razy więcej niż najdroższy kolor.',
    },
    {
      type: 'quiz',
      id: 'm3-l12-q4',
      prompt: '[[GraKolorowa]], [[atu]]: [[suit:s]]. Jaka jest wartość bazowa?',
      options: [
        { id: 'a', text: '9' },
        { id: 'b', text: '11' },
        { id: 'c', text: '12' },
      ],
      correct: 'b',
      explain: 'Kolor [[suit:s]] ma wartość bazową 11.',
    },
    {
      type: 'quiz',
      id: 'm3-l12-q5',
      prompt: '[[Atu]] to [[suit:d]], a mnożnik wynosi 3. Ile jest warta gra?',
      options: [
        { id: 'a', text: '27' },
        { id: 'b', text: '30' },
        { id: 'c', text: '36' },
      ],
      correct: 'a',
      explain: '9 × 3 = 27.',
    },
  ],
};
