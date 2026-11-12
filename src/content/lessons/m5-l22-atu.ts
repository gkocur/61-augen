// src/content/lessons/m5-l22-atu.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm5-l22-atu',
  title: 'Ciągnięcie [[atu:Dlm]]',
  summary: 'Zabierz [[obronca:Clm]] możliwość przebijania.',
  steps: [
    {
      title: 'Dlaczego wyciągać [[atu:Blm]]',
      text:
        'Dopóki [[obronca:Mlm]] mają [[atu:Blm]], mogą przebić twoje [[as:Blm]] i dziesiątki z boku. ' +
        'Dlatego mając mocne [[atu:Blm]], zwykle zaczynasz od ich wyciągania: zagrywasz [[atu:Blm]], a [[obronca:Mlm]] muszą je dokładać.',
    },
    {
      title: 'Licz [[atu:Blm]]',
      text:
        'W [[graKolorowa:Ms]] jest 11 [[atu:Dlm]]. Odejmij swoje (i te ze [[skat:D]]) — resztę mają [[obronca:Mlm]]. ' +
        'Licząc, ile już wyszło, zawsze wiesz, kiedy [[obronca:Mlm]] są bez [[atu:Dlm]].',
    },
    {
      title: 'Kiedy nie wyciągać',
      text:
        'Gdy masz mało [[atu:Dlm]] i pusty kolor, zachowaj je do przebijania tego koloru — każde przebicie to {dodatkowa lewa|dodatkowy sztych}.',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm5-l22-p1',
      prompt: 'Wychodzisz jako [[rozgrywajacy]]. [[Obronca:Mlm]] mają jeszcze [[atu:Blm]]. Którą kartę zagrać?',
      game: HEARTS,
      leader: 0,
      trick: [],
      hand: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'c-A', 's-A', 'd-9'],
      mode: 'best',
      best: ['c-J', 's-J'],
      wrongExplain: {
        'c-A': 'Zanim zagrasz [[as:B]] z boku, wyciągnij [[atu:Blm]] — inaczej [[obronca]] może go przebić.',
        's-A': 'Zanim zagrasz [[as:B]] z boku, wyciągnij [[atu:Blm]] — inaczej [[obronca]] może go przebić.',
        'h-A': 'Zacznij od najwyższych [[atu:Dlm]] — [[card:h-A:B]] mogą przebić [[walet:Mlm]] [[obronca:Dlm]].',
        'h-10': 'Zacznij od najwyższych [[atu:Dlm]] — dziesiątkę mogą przebić [[walet:Mlm]] [[obronca:Dlm]].',
        'h-K': 'Zacznij od najwyższych [[atu:Dlm]] — [[krol:B]] łatwo przebić.',
        'd-9': 'Oddajesz [[lewa:B]] bez potrzeby.',
      },
      explain: '[[Walet:Mlm]] to twoje najwyższe [[atu:Mlm]]: wezmą [[lewa:Blm]] i zabiorą [[atu:Blm]] [[obronca:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'm5-l22-q1',
      prompt: 'Masz 6 [[atu:Dlm]], a w [[skat:Ms]] nie ma żadnego. Ile [[atu:Dlm]] mają razem [[obronca:Mlm]] w [[graKolorowa:Ms]]?',
      options: [
        { id: 'a', text: '4' },
        { id: 'b', text: '5' },
        { id: 'c', text: '6' },
      ],
      correct: 'b',
      explain: '11 − 6 = 5.',
    },
    {
      type: 'miniDeal',
      id: 'm5-l22-d1',
      prompt: 'Rozegraj rozdanie jako [[rozgrywajacy]] i wygraj. Zastanów się, od czego zacząć.',
      game: HEARTS,
      declarer: 0,
      you: 0,
      hands: [
        ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'c-9', 's-A', 'd-A', 'd-9'],
        ['c-A', 'c-10', 'c-K', 'c-8', 's-K', 's-7', 'd-10', 'd-K', 'd-Q', 'd-7'],
        ['h-J', 'd-J', 'h-9', 'h-8', 'h-7', 'c-Q', 'c-7', 's-10', 's-Q', 's-8'],
      ],
      skat: ['s-9', 'd-8'],
      solution: ['c-J', 's-J', 'h-A', 'c-9', 'h-Q', 'h-10', 's-A', 'h-K', 'd-A', 'd-9'],
      mistakes: [['s-A', 'd-A', 'c-9', 'h-Q', 'c-J', 's-J', 'h-A', 'h-K', 'h-10', 'd-9']],
      goal: { kind: 'win' },
      explain:
        'Wyciągając najpierw [[atu:Blm]] ([[card:c-J]], [[card:s-J]], [[card:h-A]]…), zabierasz [[obronca:Clm]] możliwość przebijania. ' +
        'Gdy zaczyna się od [[as:Dlm]], [[zadek]] przebija je [[atu:Nlm]] — i gra przepada.',
    },
  ],
};
