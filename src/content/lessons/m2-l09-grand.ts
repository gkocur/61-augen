// src/content/lessons/m2-l09-grand.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const GRAND: GameType = { kind: 'grand' };
const PROMPT = '[[Grand]]. Która karta bierze {lewę|sztycha}?';
const VERIFY = { kind: 'trickWinner', game: GRAND } as const;
const PLAY = 'Zagraj dozwoloną kartę.';

export const lesson: Lesson = {
  id: 'm2-l09-grand',
  title: '[[Grand]]',
  summary: 'Gra, w której [[atu:Mlm]] są tylko [[walet:Mlm]].',
  steps: [
    {
      title: 'Tylko [[walet:Mlm]]',
      text:
        'W **[[grand:Ms]]** jedynymi [[atu:Nlm]] są **cztery [[walet:Mlm]]**, w kolejności: [[card:c-J]], [[card:s-J]], [[card:h-J]], [[card:d-J]].\n\n' +
        'Wszystkie cztery kolory są zwykłe — w każdym zostaje 7 kart: [[as]], 10, [[krol]], [[dama]], 9, 8, 7.',
      cards: ['c-J', 's-J', 'h-J', 'd-J'],
      cardsCaption: '[[Atu:Mlm]] w [[grand:Ms]].',
    },
    {
      title: 'Dokładanie w [[grand:Ms]]',
      text:
        'Gdy wychodzi [[walet]], trzeba dołożyć [[walet:B]], jeśli się go ma. ' +
        'Gdy wychodzi zwykły kolor, [[walet]] go nie obsługuje — liczą się tylko pozostałe karty tego koloru.',
    },
    {
      title: 'Kiedy grać [[grand:B]]?',
      text:
        '[[Grand]] jest wart najwięcej spośród zwykłych gier (wyceny poznasz w module 3). ' +
        'Gra się go zwykle z kilkoma [[walet:Nlm]] i mocnymi kolorami — szczegóły w module 5.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l09-q1',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-A' },
        { id: 'b', card: 'h-10' },
        { id: 'c', card: 'd-J' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Card:d-J]] to [[atu]] — bije każdą kartę zwykłego koloru.',
    },
    {
      type: 'quiz',
      id: 'm2-l09-q2',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'c-10' },
        { id: 'b', card: 'c-A' },
        { id: 'c', card: 'h-J' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Walet]] bije [[as:B]] — w [[grand:Ms]] to on jest [[atu:N]].',
    },
    {
      type: 'quiz',
      id: 'm2-l09-q3',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-K' },
        { id: 'b', card: 'h-A' },
        { id: 'c', card: 's-A' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'Nikt nie zagrał [[walet:D]], więc wygrywa najwyższa karta w kolorze wyjścia.',
    },
    {
      type: 'playCard',
      id: 'm2-l09-p1',
      prompt: `Na stole leży [[card:c-J]]. ${PLAY}`,
      game: GRAND,
      leader: 0,
      trick: ['c-J'],
      hand: ['c-A', 'c-10', 's-J', 'h-7'],
      mode: 'legal',
      explain: 'Wyszedł [[walet]], a jedynym [[walet:N]] w twojej ręce jest [[card:s-J]] — musisz go dołożyć.',
    },
    {
      type: 'playCard',
      id: 'm2-l09-p2',
      prompt: `Na stole leży [[card:c-A]]. ${PLAY}`,
      game: GRAND,
      leader: 0,
      trick: ['c-A'],
      hand: ['c-J', 'c-7', 'h-K'],
      mode: 'legal',
      explain: 'Musisz dołożyć [[card:c-7:B]]. W [[grand:Ms]] [[card:c-J]] jest [[atu:N]], a nie kartą koloru [[suit:c]].',
    },
    {
      type: 'playCard',
      id: 'm2-l09-p3',
      prompt: `Na stole leży [[card:h-10]]. ${PLAY}`,
      game: GRAND,
      leader: 0,
      trick: ['h-10'],
      hand: ['h-K', 'd-J', 's-A'],
      mode: 'legal',
      explain: 'Masz [[card:h-K:B]], więc musisz dołożyć do koloru [[suit:h]]. [[Card:d-J]] do tego koloru nie należy.',
    },
  ],
};
