// src/content/lessons/m3-l16-przegrana.ts
import type { Declaration, GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const plain = (game: GameType): Declaration => ({ game, hand: false, announce: 'none' });

const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;
const HEARTS_WITH_1 = ['c-J', 'h-J', 'h-A', 'h-10', 'h-K', 'h-8', 'c-A', 's-A', 's-10', 'd-A', 'd-K', 'd-7'] as const;
const CLUBS_WITH_1 = ['c-J', 'h-J', 'c-A', 'c-10', 'c-K', 'c-Q', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'd-7'] as const;
const LOST_55 = { declarerPoints: 55, declarerTricks: 4 };

export const lesson: Lesson = {
  id: 'm3-l16-przegrana',
  title: 'Przegrana, [[przelicytowanie]] i zapis wyniku',
  summary: 'Ile kosztuje przegrana i jak liczy się punkty w turnieju.',
  steps: [
    {
      title: 'Przegrana kosztuje podwójnie',
      text: 'Gdy [[rozgrywajacy]] przegra, wartość gry liczy się **podwójnie i na minus**. Gra warta 30 daje −60.',
    },
    {
      title: '[[Przelicytowanie]]',
      text:
        'Wartość gry musi być co najmniej równa wylicytowanej stawce. Jeśli po rozdaniu okaże się niższa (np. ze [[skat:N]] „[[ohne]] 3” zmieniło się w „[[mit]] 1”), gra jest **przegrana** — to [[przelicytowanie]].\n\n' +
        'Wtedy jej wartość to najmniejsza wielokrotność wartości bazowej, która sięga stawki. Przykład: stawka 36, gra z [[atu:Nlm]] w kolorze [[suit:h]] warta tylko 30 → liczy się 40, a przegrana daje −80.',
    },
    {
      title: 'Zapis turniejowy (Seeger-Fabian)',
      text:
        'W turniejach do wyniku dolicza się punkty za samą grę:\n\n' +
        '**wygrana: wartość + 50**\n\n' +
        '**przegrana: −2 × wartość − 50, a każdy z [[obronca:Dlm]] dostaje +40** (przy stole trzyosobowym).',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l16-q1',
      prompt: '[[Atu]]: [[suit:h]], [[mit]] 2. [[Rozgrywajacy]] ma tylko 55 [[oczko:Dlm]]. Jaki jest wynik gry?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '−30', value: '-30' },
        { id: 'b', text: '−60', value: '-60' },
        { id: 'c', text: '−90', value: '-90' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: plain(HEARTS), outcome: LOST_55, result: 'score' },
      explain: 'Gra jest warta 30 (10 × 3). Przegrana liczy się podwójnie: −60.',
    },
    {
      type: 'quiz',
      id: 'm3-l16-q2',
      prompt:
        'Wylicytowana stawka: 30. Gra: [[atu]] [[suit:h]], [[mit]] 1. [[Rozgrywajacy]] zdobył 80 [[oczko:Dlm]]. Jaki jest wynik?',
      cards: [...HEARTS_WITH_1],
      options: [
        { id: 'a', text: '+20', value: '20' },
        { id: 'b', text: '−40', value: '-40' },
        { id: 'c', text: '−60', value: '-60' },
      ],
      correct: 'c',
      verify: { kind: 'settle', declaration: plain(HEARTS), outcome: { declarerPoints: 80, declarerTricks: 7 }, bid: 30, result: 'score' },
      explain:
        'Gra jest warta tylko 20 (10 × 2), mniej niż stawka 30 — to [[przelicytowanie]]. Liczy się najmniejsza wielokrotność 10 nie mniejsza niż 30, czyli 30, i przegrana: −60.',
    },
    {
      type: 'quiz',
      id: 'm3-l16-q3',
      prompt:
        '[[Atu]]: [[suit:c]], [[mit]] 1, wygrana {z|ze} [[krawiec:N]] (95 [[oczko:Dlm]]). Ile punktów turniejowych dostaje [[rozgrywajacy]]?',
      cards: [...CLUBS_WITH_1],
      options: [
        { id: 'a', text: '36' },
        { id: 'b', text: '86' },
        { id: 'c', text: '72' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: plain(CLUBS), outcome: { declarerPoints: 95, declarerTricks: 8 }, result: 'tournament' },
      explain: 'Gra jest warta 36 (12 × 3). Wygrana w turnieju: 36 + 50 = 86.',
    },
    {
      type: 'quiz',
      id: 'm3-l16-q4',
      prompt:
        '[[Atu]]: [[suit:h]], [[mit]] 2, przegrana z 55 [[oczko:Nlm]]. Ile punktów turniejowych dostaje [[rozgrywajacy]]?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '−60', value: '-60' },
        { id: 'b', text: '−110', value: '-110' },
        { id: 'c', text: '−80', value: '-80' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: plain(HEARTS), outcome: LOST_55, result: 'tournament' },
      explain: 'Gra warta 30, przegrana: −2 × 30 − 50 = −110. Każdy z [[obronca:Dlm]] dostaje 40.',
    },
    {
      type: 'quiz',
      id: 'm3-l16-q5',
      prompt: 'Ile punktów turniejowych dostaje każdy [[obronca]], gdy [[rozgrywajacy]] przegra (stół trzyosobowy)?',
      options: [
        { id: 'a', text: '0' },
        { id: 'b', text: '40' },
        { id: 'c', text: '50' },
      ],
      correct: 'b',
      explain: 'Przy stole trzyosobowym każdy z [[obronca:Dlm]] dostaje 40 punktów za przegraną [[rozgrywajacy:D]].',
    },
  ],
};
