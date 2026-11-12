// src/content/lessons/m2-l07-atu.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const PROMPT = '[[GraKolorowa]], [[atu]]: [[suit:h]]. Która karta bierze {lewę|sztycha}?';
const VERIFY = { kind: 'trickWinner', game: HEARTS } as const;

export const lesson: Lesson = {
  id: 'm2-l07-atu',
  title: '[[Atu]] w [[graKolorowa:Ms]]',
  summary: '[[Atu]] bije nawet [[as:B]].',
  steps: [
    {
      title: 'Czym jest [[atu]]?',
      text:
        'W **[[graKolorowa:Ms]]** [[rozgrywajacy]] wybiera jeden kolor na **[[atu]]**. ' +
        'Karta w kolorze [[atu:D]] bije każdą kartę zwykłego koloru — nawet [[as:B]]!',
    },
    {
      title: 'Także [[walet:Mlm]] są [[atu:Nlm]]',
      text:
        'Do [[atu:Dlm]] należą również **wszystkie cztery [[walet:Mlm]]** — i to one są najsilniejsze, w kolejności: [[card:c-J]], [[card:s-J]], [[card:h-J]], [[card:d-J]].\n\n' +
        'Razem [[atu:Mlm]] to 11 kart: 4 [[walet:Mlm]] i 7 kart koloru [[atu:D]].',
      cards: ['c-J', 's-J', 'h-J', 'd-J', 'h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'h-8', 'h-7'],
      cardsCaption: '[[Atu:Mlm]], gdy kolorem [[atu:D]] jest [[suit:h]] — od najsilniejszego.',
    },
    {
      title: 'Kto bierze [[lewa:B]]?',
      text:
        'Jeśli {w lewie|w sztychu} jest {choć jedna karta atu|choć jeden trumf}, wygrywa **{najwyższe atu|najwyższy trumf}**. ' +
        'Jeśli nie ma żadnej — najwyższa karta w kolorze wyjścia, jak w poprzedniej lekcji.\n\n' +
        '[[Atu:B]] wolno zagrać tylko wtedy, gdy nie masz koloru wyjścia (albo gdy wyjście jest w [[atu:Ms]]).',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l07-q1',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 's-A' },
        { id: 'b', card: 's-10' },
        { id: 'c', card: 'h-7' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Card:h-7]] to [[atu]], więc bije nawet [[as:B]].',
    },
    {
      type: 'quiz',
      id: 'm2-l07-q2',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-A' },
        { id: 'b', card: 'd-J' },
        { id: 'c', card: 'h-10' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain:
        '[[Card:d-J]] to najsłabszy z [[walet:Dlm]], ale i tak bije wszystkie karty koloru [[atu:D]] — także [[as:B]].',
    },
    {
      type: 'quiz',
      id: 'm2-l07-q3',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 's-J' },
        { id: 'b', card: 'c-J' },
        { id: 'c', card: 'h-J' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'Kolejność [[walet:Dlm]]: [[suit:c]], [[suit:s]], [[suit:h]], [[suit:d]].',
    },
    {
      type: 'quiz',
      id: 'm2-l07-q4',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'c-A' },
        { id: 'b', card: 'c-K' },
        { id: 'c', card: 'd-A' },
      ],
      correct: 'a',
      verify: VERIFY,
      explain: 'Nikt nie zagrał [[atu:D]], więc wygrywa najwyższa karta w kolorze wyjścia ([[suit:c]]).',
    },
    {
      type: 'quiz',
      id: 'm2-l07-q5',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-9' },
        { id: 'b', card: 'h-A' },
        { id: 'c', card: 'c-J' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Walet:Mlm]] są silniejsze od wszystkich kart koloru [[atu:D]].',
    },
    {
      type: 'playCard',
      id: 'm2-l07-p1',
      prompt: 'Na stole leży [[card:s-A]]. Zagraj dozwoloną kartę.',
      game: HEARTS,
      leader: 0,
      trick: ['s-A'],
      hand: ['s-7', 'h-8', 'c-K'],
      mode: 'legal',
      explain:
        'Masz kartę w kolorze wyjścia — [[card:s-7:B]] — więc musisz ją dołożyć. [[Atu:B]] możesz zagrać dopiero wtedy, gdy koloru wyjścia nie masz.',
    },
    {
      type: 'playCard',
      id: 'm2-l07-p2',
      prompt: 'Na stole leży [[card:s-A]]. Weź {tę lewę|tego sztycha}.',
      game: HEARTS,
      leader: 0,
      trick: ['s-A'],
      hand: ['h-8', 'c-K', 'd-9'],
      mode: 'best',
      best: ['h-8'],
      wrongExplain: {
        'c-K': 'Bez [[atu:D]] nie przebijesz [[as:D]].',
        'd-9': 'Bez [[atu:D]] nie przebijesz [[as:D]].',
      },
      explain:
        'Nie masz koloru [[suit:s]], więc możesz przebić [[as:B]] {kartą atu|trumfem} — [[card:h-8:N]].',
    },
  ],
};
