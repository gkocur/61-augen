// src/content/lessons/m4-l18-ile-licytowac.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const ASK = 'Do ilu najwyżej możesz {licytować|reizować} z tymi kartami?';
const suit = (trump: 'c' | 's' | 'h' | 'd'): GameType => ({ kind: 'suit', trump });

export const lesson: Lesson = {
  id: 'm4-l18-ile-licytowac',
  title: 'Do ilu {licytować|reizować}',
  summary: 'Policz wartość swojej gry, zanim podasz stawkę.',
  steps: [
    {
      title: 'Licz, zanim powiesz',
      text:
        'Przed [[licytacja:N]] wybierz grę, którą chcesz zagrać, i policz jej wartość: **wartość bazowa × ([[matador:Mlm]] + 1)**. ' +
        'To twoja górna granica — {licytuj|reizuj} do niej, ale nie wyżej.',
    },
    {
      title: 'Przykład',
      text:
        'Chcesz grać z [[atu:Nlm]] w kolorze [[suit:h]] i masz [[mit]] 2. Mnożnik to 2 + 1 = 3, więc {licytujesz|reizujesz} najwyżej do 10 × 3 = **30**.',
    },
    {
      title: 'Uwaga przy grze [[ohne]]',
      text:
        'Przy [[ohne]] 2 czy [[ohne]] 3 ryzykujesz: jeśli w [[skat:Ms]] leży brakujący [[walet]], liczba [[matador:Dlm]] spada, a gra może się okazać warta mniej niż stawka — czyli [[przelicytowanie]].',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm4-l18-q1',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 's-10', 'd-9'],
      options: [
        { id: 'a', text: '20' },
        { id: 'b', text: '30' },
        { id: 'c', text: '40' },
      ],
      correct: 'b',
      verify: { kind: 'maxBid', game: suit('h') },
      explain: '[[Mit]] 2 → mnożnik 3. 10 × 3 = 30.',
    },
    {
      type: 'quiz',
      id: 'm4-l18-q2',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:c]]. ${ASK}`,
      cards: ['s-J', 'd-J', 'c-A', 'c-10', 'c-K', 'c-9', 'c-8', 'h-A', 's-A', 'd-10'],
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '36' },
        { id: 'c', text: '48' },
      ],
      correct: 'a',
      verify: { kind: 'maxBid', game: suit('c') },
      explain: 'Brakuje [[card:c-J:D]], ale [[card:s-J:B]] masz — to [[ohne]] 1, mnożnik 2. 12 × 2 = 24.',
    },
    {
      type: 'quiz',
      id: 'm4-l18-q3',
      prompt: `[[Grand]]. ${ASK}`,
      cards: ['c-J', 's-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'd-K'],
      options: [
        { id: 'a', text: '48' },
        { id: 'b', text: '72' },
        { id: 'c', text: '96' },
      ],
      correct: 'b',
      verify: { kind: 'maxBid', game: { kind: 'grand' } },
      explain: '[[Mit]] 2 → mnożnik 3. 24 × 3 = 72.',
    },
    {
      type: 'quiz',
      id: 'm4-l18-q4',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:s]]. ${ASK}`,
      cards: ['c-J', 's-J', 'h-J', 's-A', 's-K', 's-9', 's-8', 'c-A', 'h-10', 'd-7'],
      options: [
        { id: 'a', text: '33' },
        { id: 'b', text: '44' },
        { id: 'c', text: '55' },
      ],
      correct: 'b',
      verify: { kind: 'maxBid', game: suit('s') },
      explain: '[[Mit]] 3 → mnożnik 4. 11 × 4 = 44.',
    },
    {
      type: 'quiz',
      id: 'm4-l18-q5',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:d]]. ${ASK}`,
      cards: ['d-A', 'd-10', 'd-K', 'd-Q', 'd-9', 'd-8', 'c-A', 'c-10', 's-A', 'h-A'],
      options: [
        { id: 'a', text: '27' },
        { id: 'b', text: '36' },
        { id: 'c', text: '45' },
      ],
      correct: 'c',
      verify: { kind: 'maxBid', game: suit('d') },
      explain:
        'Nie masz żadnego [[walet:D]] — to [[ohne]] 4 (pierwsze [[atu]] w twojej ręce to [[card:d-A]]). Mnożnik 5, 9 × 5 = 45. Ale uwaga: [[walet]] w [[skat:Ms]] obniżyłby tę wartość.',
    },
  ],
};
