// src/content/lessons/m2-l08-walety.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const PLAY = 'Zagraj dozwoloną kartę.';

export const lesson: Lesson = {
  id: 'm2-l08-walety',
  title: '[[Walet]] należy do [[atu:D]]',
  summary: 'Najczęstszy błąd początkujących — i jak go uniknąć.',
  steps: [
    {
      title: 'Najczęstszy błąd',
      text:
        'W [[graKolorowa:Ms]] (i w [[grand:Ms]]) **[[walet]] nie należy do swojego koloru**. ' +
        '[[Card:c-J]] nie jest kartą koloru [[suit:c]] — jest [[atu:N]].',
    },
    {
      title: 'Wyjście w zwykłym kolorze',
      text:
        'Gdy wyjście jest w kolorze [[suit:c]], a jedyną twoją kartą „w tym kolorze” jest [[card:c-J]] — to tak naprawdę **nie masz koloru wyjścia**. Możesz zagrać dowolną kartę.\n\n' +
        'I odwrotnie: gdy masz [[card:c-J:B]] i [[card:c-7:B]], musisz dołożyć siódemkę — [[walet]] tego nie załatwi.',
    },
    {
      title: 'Wyjście w [[atu:Ms]]',
      text:
        'Gdy wychodzi [[atu]] — również [[walet]] — musisz dołożyć [[atu:B]], {jeśli je masz|jeśli go masz}. [[Walet]] w twojej ręce też się liczy jako [[atu]].\n\n' +
        'Wyjątek: w [[null:Ms]] nie ma [[atu:D]], a [[walet]] jest zwykłą kartą swojego koloru (lekcja 10).',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm2-l08-p1',
      prompt: `Na stole leży [[card:c-A]]. ${PLAY}`,
      game: HEARTS,
      leader: 0,
      trick: ['c-A'],
      hand: ['c-J', 'c-7', 's-K'],
      mode: 'legal',
      explain:
        'Musisz dołożyć [[card:c-7:B]] — to twoja jedyna karta w kolorze [[suit:c]]. [[Card:c-J]] jest [[atu:N]], nie kartą koloru [[suit:c]].',
    },
    {
      type: 'playCard',
      id: 'm2-l08-p2',
      prompt: `Na stole leży [[card:h-9]]. ${PLAY}`,
      game: HEARTS,
      leader: 0,
      trick: ['h-9'],
      hand: ['s-J', 's-A', 'd-K'],
      mode: 'legal',
      explain:
        'Wyszła [[card:h-9]], czyli [[atu]]. Jedynym [[atu:N]] w twojej ręce jest [[card:s-J]] — musisz go dołożyć.',
    },
    {
      type: 'playCard',
      id: 'm2-l08-p3',
      prompt: `Na stole leży [[card:s-10]]. ${PLAY}`,
      game: HEARTS,
      leader: 0,
      trick: ['s-10'],
      hand: ['s-J', 's-8', 'h-7'],
      mode: 'legal',
      explain: 'Musisz dołożyć [[card:s-8:B]]. [[Card:s-J]] nie należy do koloru [[suit:s]] — jest [[atu:N]].',
    },
    {
      type: 'playCard',
      id: 'm2-l08-p4',
      prompt: `Na stole leży [[card:c-J]]. ${PLAY}`,
      game: HEARTS,
      leader: 0,
      trick: ['c-J'],
      hand: ['h-7', 'c-A', 'c-10'],
      mode: 'legal',
      explain:
        'Wyszedł [[walet]], czyli [[atu]]. Masz [[card:h-7:B]], która jest [[atu:N]], więc musisz ją dołożyć — choć [[suit:c]] też masz.',
    },
    {
      type: 'quiz',
      id: 'm2-l08-q1',
      prompt: 'Ile kart jest [[atu:N]] w [[graKolorowa:Ms]]?',
      options: [
        { id: 'a', text: '7' },
        { id: 'b', text: '8' },
        { id: 'c', text: '11' },
      ],
      correct: 'c',
      explain: '4 [[walet:Mlm]] i 7 kart koloru [[atu:D]] — razem 11.',
    },
  ],
};
