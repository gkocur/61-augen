// src/content/lessons/m3-l14-poziomy.ts
import type { Announcement, Declaration, GameType } from '../../engine';
import type { Lesson } from '../types';

const decl = (game: GameType, hand = false, announce: Announcement = 'none'): Declaration => ({ game, hand, announce });
const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const DIAMONDS: GameType = { kind: 'suit', trump: 'd' };
const GRAND: GameType = { kind: 'grand' };
const ASK = 'Ile jest warta gra?';

const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;

export const lesson: Lesson = {
  id: 'm3-l14-poziomy',
  title: 'Mnożnik: [[reka]], [[krawiec]], [[czarny]]',
  summary: 'Kolejne poziomy podnoszą wartość gry.',
  steps: [
    {
      title: 'Z czego składa się mnożnik',
      text:
        'Do [[matador:Dlm]] dodaje się kolejne poziomy, każdy **+1**:\n\n' +
        '**gra** (zawsze) · **[[reka]]** (bez podnoszenia [[skat:D]]) · **[[krawiec]]** · **[[krawiec]] zapowiedziany** · **[[czarny]]** · **[[czarny]] zapowiedziany** · **[[otwarta]]**',
    },
    {
      title: '[[Krawiec]] i [[czarny]]',
      text:
        '**[[Krawiec]]**: jedna strona ma 90 [[oczko:Dlm]] lub więcej (druga najwyżej 30).\n\n' +
        '**[[Czarny]]**: jedna strona bierze wszystkie [[lewa:Blm]].\n\n' +
        'Oba poziomy liczą się także wtedy, gdy to [[rozgrywajacy]] przegrywa tak wysoko.',
    },
    {
      title: 'Zapowiedzi',
      text:
        'Zapowiedzieć [[krawiec:B]] albo [[czarny:B]] można tylko w [[reka:Ms]]. Zapowiedź dodaje swój poziom, ale jeśli się nie uda — gra jest przegrana. ' +
        'Zapowiedź [[czarny:D]] zawiera też zapowiedź [[krawiec:D]].\n\n' +
        '[[Otwarta]] (karty odkryte na stole) oznacza zapowiedź [[czarny:D]] i daje jeszcze jeden poziom.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l14-q1',
      prompt: `[[Atu]]: [[suit:h]], [[mit]] 2. [[Rozgrywajacy]] wygrywa, mając 75 [[oczko:Dlm]]. ${ASK}`,
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '20' },
        { id: 'b', text: '30' },
        { id: 'c', text: '40' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: decl(HEARTS), outcome: { declarerPoints: 75, declarerTricks: 6 }, result: 'value' },
      explain: 'Mnożnik: 2 ([[matador:Mlm]]) + 1 (gra) = 3. 10 × 3 = 30.',
    },
    {
      type: 'quiz',
      id: 'm3-l14-q2',
      prompt: `Te same karty, ale tym razem to [[reka]]: [[atu]] [[suit:h]], [[mit]] 2, wygrana z 70 [[oczko:Nlm]]. ${ASK}`,
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '30' },
        { id: 'b', text: '40' },
        { id: 'c', text: '50' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: decl(HEARTS, true), outcome: { declarerPoints: 70, declarerTricks: 6 }, result: 'value' },
      explain: '2 + 1 (gra) + 1 ([[reka]]) = 4. 10 × 4 = 40.',
    },
    {
      type: 'quiz',
      id: 'm3-l14-q3',
      prompt: `[[Atu]]: [[suit:c]], [[mit]] 1. [[Rozgrywajacy]] zdobył 95 [[oczko:Dlm]]. ${ASK}`,
      cards: ['c-J', 'h-J', 'c-A', 'c-10', 'c-K', 'c-Q', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'd-7'],
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '36' },
        { id: 'c', text: '48' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: decl(CLUBS), outcome: { declarerPoints: 95, declarerTricks: 8 }, result: 'value' },
      explain: '95 [[oczko:Dlm]] to [[krawiec]]: 1 + 1 (gra) + 1 ([[krawiec]]) = 3. 12 × 3 = 36.',
    },
    {
      type: 'quiz',
      id: 'm3-l14-q4',
      prompt: `[[Grand]], [[mit]] 2. [[Rozgrywajacy]] wziął wszystkie [[lewa:Blm]]. ${ASK}`,
      cards: ['c-J', 's-J', 'd-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-K', 'd-A', 'd-10', 'd-9'],
      options: [
        { id: 'a', text: '72' },
        { id: 'b', text: '96' },
        { id: 'c', text: '120' },
      ],
      correct: 'c',
      verify: { kind: 'settle', declaration: decl(GRAND), outcome: { declarerPoints: 120, declarerTricks: 10 }, result: 'value' },
      explain: '2 + 1 (gra) + 1 ([[krawiec]]) + 1 ([[czarny]]) = 5. 24 × 5 = 120.',
    },
    {
      type: 'quiz',
      id: 'm3-l14-q5',
      prompt: `[[Atu]]: [[suit:d]], [[ohne]] 1, [[reka]] z zapowiedzianym [[krawiec:N]]. [[Rozgrywajacy]] zdobył 92 [[oczko:Dlm]]. ${ASK}`,
      cards: ['s-J', 'h-J', 'd-A', 'd-10', 'd-K', 'd-Q', 'd-9', 'c-A', 'c-10', 's-A', 'h-A', 'h-10'],
      options: [
        { id: 'a', text: '36' },
        { id: 'b', text: '45' },
        { id: 'c', text: '54' },
      ],
      correct: 'b',
      verify: {
        kind: 'settle',
        declaration: decl(DIAMONDS, true, 'schneider'),
        outcome: { declarerPoints: 92, declarerTricks: 8 },
        result: 'value',
      },
      explain: '1 ([[matador:Mlm]]) + gra + [[reka]] + [[krawiec]] + zapowiedź = 5. 9 × 5 = 45.',
    },
  ],
};
