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
        'Gdy masz w kolorze [[as:B]] i 10, zagraj najpierw [[as:B]] — weźmie {lewę|sztych} na pewno. Dziesiątka staje się wtedy najwyższą kartą koloru.',
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
        'Gdy nie możesz dołożyć do koloru ani przebić, a {lewę|sztych} i tak bierze [[obronca]], oddaj kartę **bez wartości** — siódemkę, ósemkę albo dziewiątkę. Każde oddane oczko liczy się dla [[obronca:Dlm]].',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm5-l23-p1',
      prompt: '[[Obronca:Mlm]] nie mają już [[atu:Dlm]]. Wychodzisz. Zagraj kartę, która na pewno weźmie {lewę|sztych}.',
      game: HEARTS,
      leader: 0,
      trick: [],
      hand: ['c-10', 'c-8', 's-A', 's-K', 'd-9', 'd-8'],
      mode: 'best',
      best: ['s-A'],
      wrongExplain: {
        'c-10': '[[Card:c-A]] jest jeszcze u [[obronca:Dlm]] — zabierze twoją dziesiątkę.',
        'c-8': 'Niska karta nie weźmie {lewy|sztychu}.',
        's-K': '[[Card:s-K]] przegra z [[card:s-10:N]], jeśli ma ją [[obronca]].',
        'd-9': 'Niska karta nie weźmie {lewy|sztychu}.',
        'd-8': 'Niska karta nie weźmie {lewy|sztychu}.',
      },
      explain: '[[Card:s-A]] to najwyższa karta koloru — przy braku [[atu:Dlm]] u [[obronca:Dlm]] bierze na pewno.',
    },
    {
      type: 'playCard',
      id: 'm5-l23-p2',
      prompt:
        '[[Atu:Mlm]] już wyszły. Na stole leży [[card:c-K]], a po tobie zagra jeszcze [[obronca]]. Weź {tę lewę|ten sztych} bez ryzyka.',
      game: HEARTS,
      leader: 2,
      trick: ['c-K'],
      hand: ['c-A', 'c-10', 'c-7', 's-9', 'd-A'],
      mode: 'best',
      best: ['c-A'],
      wrongExplain: {
        'c-10': 'Dziesiątka bije [[krol:B]], ale ostatni gracz może mieć [[card:c-A:B]] — wtedy dziesiątka przepada.',
        'c-7': 'Oddajesz {lewę|sztych} z [[krol:N]].',
      },
      explain: '[[Card:c-A]] bierze na pewno i zgarnia [[krol:B]]: 15 [[oczko:Dlm]].',
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
      best: ['c-7', 's-8'],
      wrongExplain: {
        'c-10': 'Oddajesz 10 [[oczko:Dlm]] — lepiej kartę bez wartości.',
        's-K': 'Oddajesz 4 [[oczko:Mlm]] — lepiej kartę bez wartości.',
      },
      explain: '{Lewę|Sztycha} i tak bierze [[obronca]] — oddaj kartę, która nie ma żadnych [[oczko:Dlm]].',
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
