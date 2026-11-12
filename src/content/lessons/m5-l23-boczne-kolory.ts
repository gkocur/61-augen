// src/content/lessons/m5-l23-boczne-kolory.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm5-l23-boczne-kolory',
  title: 'Gra kolorami z boku',
  summary: '[[As]] przed dziesiątką i ostrożnie z dziesiątką bez [[as:D]].',
  steps: [
    {
      title: '[[As]] i dziesiątka',
      text:
        'Gdy masz w kolorze [[as:B]] i 10, a [[obronca:Mlm]] nie mogą przebić, obie karty są pewne. Zwykle gra się najpierw [[as:B]], potem dziesiątkę.',
    },
    {
      title: 'Dziesiątka bez [[as:D]]',
      text:
        'Nie wychodź dziesiątką, gdy [[as]] tego koloru jest jeszcze w grze — [[obronca]] zabierze ją [[as:N]] i zgarnie 21 [[oczko:Dlm]]. ' +
        'Lepiej poczekać, aż [[as]] wyjdzie.',
    },
    {
      title: 'Co oddać, gdy nie masz koloru',
      text:
        'Gdy nie możesz dołożyć do koloru ani przebić, a [[lewa:B]] i tak bierze [[obronca]], oddaj kartę **bez wartości** — siódemkę, ósemkę albo dziewiątkę. Każde oddane oczko liczy się dla [[obronca:Dlm]].',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm5-l23-p1',
      prompt: '[[Obronca:Mlm]] nie mają już [[atu:Dlm]]. [[Card:c-A]] jest jeszcze u [[obronca:Dlm]]. Wychodzisz. Zagraj kartę, która na pewno weźmie [[lewa:B]].',
      game: HEARTS,
      leader: 0,
      trick: [],
      hand: ['c-10', 'c-8', 's-A', 's-K', 'd-9', 'd-8'],
      mode: 'best',
      best: ['s-A'],
      wrongExplain: {
        'c-10': '[[Card:c-A]] jest jeszcze u [[obronca:Dlm]] — zabierze twoją dziesiątkę.',
        'c-8': 'Niska karta nie weźmie [[lewa:D]].',
        's-K': '[[Card:s-K]] przegra z [[card:s-10:N]], jeśli ma ją [[obronca]].',
        'd-9': 'Niska karta nie weźmie [[lewa:D]].',
        'd-8': 'Niska karta nie weźmie [[lewa:D]].',
      },
      explain: '[[Card:s-A]] to najwyższa karta koloru — przy braku [[atu:Dlm]] u [[obronca:Dlm]] bierze na pewno.',
    },
    {
      type: 'playCard',
      id: 'm5-l23-p2',
      prompt:
        '[[Atu:Mlm]] już wyszły. Na stole leży [[card:c-K]], a po tobie zagra jeszcze [[obronca]]. Weź {tę lewę|tego sztycha} bez ryzyka.',
      game: HEARTS,
      leader: 2,
      trick: ['c-K'],
      hand: ['c-A', 'c-10', 'c-7', 's-9', 'd-A'],
      mode: 'best',
      best: ['c-A', 'c-10'],
      wrongExplain: {
        'c-7': 'Oddajesz [[lewa:B]] z [[krol:N]].',
      },
      explain: 'Masz [[card:c-A:B]] i dziesiątkę — skoro [[atu:Mlm]] wyszły, obie karty wezmą [[lewa:B]] na pewno. Zwykle gra się najpierw [[as:B]].',
    },
    {
      type: 'playCard',
      id: 'm5-l23-p3',
      prompt:
        'Na stole leżą [[card:d-A]] i [[card:d-10]]. Nie masz kart w kolorze [[suit:d]] ani [[atu:Dlm]]. Którą kartę oddać?',
      game: HEARTS,
      leader: 1,
      trick: ['d-A', 'd-10'],
      hand: ['c-10', 'c-7', 's-K', 's-8'],
      mode: 'best',
      best: ['s-8'],
      wrongExplain: {
        'c-7': '[[Card:c-7]] chroni twoją dziesiątkę w kolorze [[suit:c]] — lepiej oddać [[card:s-8:B]] i zostawić samotnego [[krol:B]] (4 [[oczko:Mlm]]) zamiast samotnej dziesiątki.',
        'c-10': 'Oddajesz 10 [[oczko:Dlm]] — lepiej kartę bez wartości.',
        's-K': 'Oddajesz 4 [[oczko:Mlm]] — lepiej kartę bez wartości.',
      },
      explain: '[[Lewa:B]] i tak bierze [[obronca]] — oddaj kartę bez [[oczko:Dlm]]. Spośród dwóch takich kart wybierz tę, która nie zostawia samotnej dziesiątki.',
    },
    {
      type: 'quiz',
      id: 'm5-l23-q1',
      prompt: 'Ile [[oczko:Dlm]] zgarnia [[obronca]], biorąc [[as:N]] twoją dziesiątkę?',
      options: [
        { id: 'a', text: '10' },
        { id: 'b', text: '11' },
        { id: 'c', text: '21' },
      ],
      correct: 'c',
      explain: '11 ([[as]]) + 10 = 21 — {w jednej lewie|w jednym sztychu}.',
    },
  ],
};
