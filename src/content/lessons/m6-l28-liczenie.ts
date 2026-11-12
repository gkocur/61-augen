// src/content/lessons/m6-l28-liczenie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm6-l28-liczenie',
  title: 'Liczenie w trakcie gry',
  summary: 'Ile mamy [[oczko:Dlm]]? Ile [[atu:Dlm]] już wyszło?',
  steps: [
    {
      title: 'Licz [[oczko:Blm]]',
      text:
        'Dobry gracz w każdej chwili wie, ile [[oczko:Dlm]] ma jego strona. [[Obronca:Mlm]] potrzebują 60 — wtedy [[rozgrywajacy]] przegrywa.',
    },
    {
      title: 'Licz [[atu:Blm]]',
      text: 'W [[graKolorowa:Ms]] jest 11 [[atu:Dlm]]. Licząc, ile już wyszło, wiesz, ile jeszcze jest w grze.',
    },
    {
      title: 'Pauzy w rozdaniu',
      text:
        'W tym rozdaniu gra kilka razy się zatrzyma i padnie pytanie. Odpowiadaj z pamięci — liczy się wynik rozdania i poprawne odpowiedzi.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm6-l28-q1',
      prompt: 'Ile [[oczko:Dlm]] potrzebują [[obronca:Mlm]], żeby [[rozgrywajacy]] przegrał?',
      options: [
        { id: 'a', text: '59' },
        { id: 'b', text: '60' },
        { id: 'c', text: '61' },
      ],
      correct: 'b',
      explain: '[[Rozgrywajacy]] potrzebuje 61 — przy 60 [[oczko:Mslm]] [[obronca:Dlm]] już przegrywa.',
    },
    {
      type: 'miniDeal',
      id: 'm6-l28-d1',
      prompt:
        'Grasz w obronie przeciwko grze z [[atu:Nlm]] w kolorze [[suit:h]]. Pilnuj liczby [[oczko:Dlm]] i [[atu:Dlm]] — w trakcie gry padną pytania.',
      game: HEARTS,
      declarer: 2,
      you: 0,
      hands: [
        ['h-J', 'h-A', 'h-10', 'h-Q', 'c-A', 'c-10', 'c-Q', 's-K', 'd-K', 'd-Q'],
        ['c-J', 'h-9', 'c-K', 'c-8', 's-10', 's-Q', 's-8', 'd-A', 'd-10', 'd-9'],
        ['s-J', 'd-J', 'h-K', 'h-8', 'h-7', 'c-9', 'c-7', 's-A', 's-7', 'd-8'],
      ],
      skat: ['s-9', 'd-7'],
      solution: ['c-A', 'h-J', 'd-K', 'c-Q', 'd-Q', 'h-Q', 'h-10', 'h-A', 's-K', 'c-10'],
      goal: { kind: 'win' },
      checkpoints: [
        { afterTrick: 3, ask: 'yourPoints' },
        { afterTrick: 5, ask: 'trumpsPlayed' },
        { afterTrick: 7, ask: 'yourPoints' },
      ],
      explain: 'Liczenie mówi ci, kiedy [[obronca:Mlm]] mają już 60 [[oczko:Dlm]] i ile [[atu:Dlm]] jeszcze jest w grze.',
    },
  ],
};
