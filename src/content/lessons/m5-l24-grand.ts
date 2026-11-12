// src/content/lessons/m5-l24-grand.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const GRAND: GameType = { kind: 'grand' };
const GAME_OPTIONS = (suit: 'c' | 's' | 'h' | 'd') => [
  { id: 'a', text: '[[Grand]]' },
  { id: 'b', text: `[[GraKolorowa]], [[atu]]: [[suit:${suit}]]` },
  { id: 'c', text: '[[Null]]' },
];

export const lesson: Lesson = {
  id: 'm5-l24-grand',
  title: 'Kiedy grać [[grand:B]]',
  summary: '[[Walet:Mlm]], [[as:Mlm]] i długi kolor.',
  steps: [
    {
      title: 'Siła [[grand:D]]',
      text:
        'W [[grand:Ms]] są tylko 4 [[atu:Mlm]]. Dlatego liczą się: **[[walet:Mlm]]** (najlepiej co najmniej 2), **[[as:Mlm]]** i **długi, mocny kolor** — np. [[as]], 10, [[krol]] i kolejne.',
    },
    {
      title: 'Typowe ręce do [[grand:D]]',
      text:
        '• 3–4 [[walet:Mlm]] i kilka [[as:Dlm]] — prawie zawsze [[grand]].\n\n' +
        '• 2 [[walet:Mlm]], długi kolor z [[as:N]] i dziesiątką oraz drugi [[as]] — dobry [[grand]], zwłaszcza gdy wychodzisz jako [[przodek]].\n\n' +
        '• 1 [[walet]] — zwykle za mało.',
    },
    {
      title: 'Jak grać [[grand:B]]',
      text:
        'Najpierw [[walet:Mlm]]: jeden twój [[walet]] często wyciąga oba [[walet:Mlm]] [[obronca:Dlm]]. Potem graj długi kolor od góry — [[obronca:Mlm]] nie mają już czym przebijać.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm5-l24-q1',
      prompt: 'Którą grę zgłosić z tymi kartami?',
      cards: ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 's-A', 's-10', 's-K', 'h-A', 'd-7'],
      options: GAME_OPTIONS('s'),
      correct: 'a',
      explain:
        'Trzy [[walet:Mlm]] i trzy [[as:Mlm]], w tym dwa z dziesiątkami — to typowy [[grand]]. W kolorze [[suit:s]] gra byłaby warta dużo mniej.',
    },
    {
      type: 'quiz',
      id: 'm5-l24-q2',
      prompt: 'Którą grę zgłosić z tymi kartami?',
      cards: ['d-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'c-A', 's-8', 'd-7', 'd-8'],
      options: GAME_OPTIONS('h'),
      correct: 'b',
      explain:
        'Z jednym [[walet:N]] [[grand]] jest bardzo ryzykowny. Z [[walet:N]] i pięcioma kartami w kolorze [[suit:h]] masz 6 [[atu:Dlm]] — to {dobra gra kolorowa|dobry farbszpil}.',
    },
    {
      type: 'quiz',
      id: 'm5-l24-q3',
      prompt: '[[Grand]]. Do ilu możesz {licytować|rajcować} z tymi kartami?',
      cards: ['c-J', 's-J', 'c-A', 'c-10', 'c-K', 'c-Q', 'c-7', 's-A', 'h-Q', 'd-10'],
      options: [
        { id: 'a', text: '48' },
        { id: 'b', text: '72' },
        { id: 'c', text: '96' },
      ],
      correct: 'b',
      verify: { kind: 'maxBid', game: GRAND },
      explain: '[[Mit]] 2 → mnożnik 3. 24 × 3 = 72.',
    },
    {
      type: 'miniDeal',
      id: 'm5-l24-d1',
      prompt: 'Grasz [[grand:B]] z długim kolorem [[suit:c]]. Rozegraj rozdanie i wygraj.',
      game: GRAND,
      declarer: 0,
      you: 0,
      hands: [
        ['c-J', 's-J', 'c-A', 'c-10', 'c-K', 'c-Q', 'c-7', 's-A', 'h-Q', 'd-10'],
        ['h-J', 'c-9', 'c-8', 's-K', 's-Q', 'h-K', 'h-8', 'd-A', 'd-K', 'd-9'],
        ['d-J', 's-10', 's-9', 's-8', 'h-A', 'h-10', 'h-7', 'd-Q', 'd-8', 'd-7'],
      ],
      skat: ['h-9', 's-7'],
      solution: ['c-J', 'c-A', 's-A', 'c-10', 'd-10', 'h-Q', 's-J', 'c-K', 'c-Q', 'c-7'],
      mistakes: [['c-A', 'h-Q', 's-J', 's-A', 'c-10', 'd-10', 'c-J', 'c-K', 'c-7', 'c-Q']],
      goal: { kind: 'win' },
      explain:
        'Jeden [[card:c-J]] na początku wyciąga oba [[walet:Mlm]] [[obronca:Dlm]] — każdy z nich ma po jednym i musi go dołożyć. Potem kolor [[suit:c]] jest bezpieczny. ' +
        'Gdy zaczyna się od [[card:c-A:D]], [[obronca]] bez koloru [[suit:c]] przebija go [[walet:N]].',
    },
  ],
};
