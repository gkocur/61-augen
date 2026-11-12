// src/content/lessons/m2-l11-pierwsze-rozdanie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm2-l11-pierwsze-rozdanie',
  title: 'Pierwsze pełne rozdanie',
  summary: 'Rozegraj 10 [[lewa:Dlm]] jako [[rozgrywajacy]].',
  steps: [
    {
      title: 'Całe rozdanie',
      text:
        'Czas na pełne rozdanie: 10 [[lewa:Dlm]]. {[[Przodek]] wychodzi do pierwszej lewy, a każdą następną zaczyna ten, kto wziął poprzednią.|[[Przodek]] wychodzi do pierwszego sztycha, a każdego następnego zaczyna ten, kto wziął poprzedniego.}\n\n' +
        'Na koniec liczymy [[oczko:Blm]]. [[Rozgrywajacy]] dostaje także karty ze [[skat:D]] — w [[graKolorowa:Ms]] i w [[grand:Ms]] ich [[oczko:Mlm]] liczą się dla niego.',
    },
    {
      title: 'Jak grać przy stole',
      text:
        'Twoje karty są na dole, zagrane karty — pośrodku stołu. Karty, których nie możesz zagrać, są przyciemnione. [[Obronca:Mlm]] zagrywają automatycznie.\n\n' +
        'Wskazówka: mając dużo [[atu:Dlm]], najpierw wyciągnij [[atu:Blm]] [[obronca:Dlm]] — zagrywaj [[walet:Blm]]. Potem zbieraj [[oczko:Blm]] [[as:Nlm]] i dziesiątkami.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l11-q1',
      prompt: 'Czyje są [[oczko:Mlm]] z kart w [[skat:Ms]] w [[graKolorowa:Ms]]?',
      options: [
        { id: 'a', text: '[[Rozgrywajacy:D]]' },
        { id: 'b', text: '[[Obronca:Dlm]]' },
        { id: 'c', text: 'Niczyje' },
      ],
      correct: 'a',
      explain: 'Karty ze [[skat:D]] liczą się dla [[rozgrywajacy:D]].',
    },
    {
      type: 'miniDeal',
      id: 'm2-l11-d1',
      prompt: 'Rozegraj całe rozdanie jako [[rozgrywajacy]] i zdobądź co najmniej 61 [[oczko:Dlm]].',
      game: HEARTS,
      declarer: 0,
      you: 0,
      hands: [
        ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'c-A', 'c-10', 's-A'],
        ['h-Q', 'h-9', 'c-K', 'c-Q', 'c-9', 'c-8', 's-10', 's-K', 'd-A', 'd-10'],
        ['h-8', 'h-7', 's-Q', 's-9', 's-8', 's-7', 'd-K', 'd-Q', 'd-9', 'd-8'],
      ],
      skat: ['c-7', 'd-7'],
      solution: ['c-J', 's-J', 'h-J', 'd-J', 'c-A', 'c-10', 's-A', 'h-A', 'h-10', 'h-K'],
      goal: { kind: 'win' },
      explain:
        'Z czterema [[walet:Nlm]] najpierw wyciąga się [[atu:Blm]] [[obronca:Dlm]]. Gdy już ich nie mają, nie mogą przebić twoich [[as:Dlm]] i dziesiątek — {lewy są twoje bez ryzyka|sztychy są twoje bez ryzyka}. Gdy zaczyna się od [[as:Dlm]], [[zadek]] może je przebić [[atu:Nlm]].',
    },
  ],
};
