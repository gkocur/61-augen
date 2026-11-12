// src/content/lessons/m6-l27-dokladanie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };

export const lesson: Lesson = {
  id: 'm6-l27-dokladanie',
  title: '[[Szmirowanie]] oczek partnerowi',
  summary: 'Dokładaj [[oczko:Blm]] tam, gdzie [[lewa:B]] na pewno bierze partner.',
  steps: [
    {
      title: 'Gdy [[lewa:B]] bierze partner',
      text:
        'Jeśli wiadomo, że [[lewa:B]] bierze twój partner, dołóż do niej jak najwięcej [[oczko:Dlm]] — dziesiątkę albo [[as:B]]. Wszystkie oczka w niej liczą się dla waszej strony.',
    },
    {
      title: 'Tylko gdy to pewne',
      text:
        'Dokładaj dopiero wtedy, gdy [[rozgrywajacy]] już zagrał albo na pewno nie przebije. Jeśli [[rozgrywajacy]] gra po tobie, może wziąć [[lewa:B]] razem z twoimi oczkami.',
    },
    {
      title: 'Gdy bierze [[rozgrywajacy]]',
      text: 'Gdy [[lewa:B]] i tak weźmie [[rozgrywajacy]], dołóż kartę bez wartości.',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm6-l27-p1',
      prompt:
        'Grasz w obronie. [[Rozgrywajacy]] ([[przodek]]) wyszedł [[card:s-9:N]], partner dołożył [[card:s-A:B]]. Grasz jako ostatni. Którą kartę dołożyć?',
      game: HEARTS,
      leader: 0,
      trick: ['s-9', 's-A'],
      hand: ['s-10', 's-7', 'c-8', 'd-9'],
      mode: 'best',
      best: ['s-10'],
      wrongExplain: { 's-7': 'Partner na pewno bierze [[lewa:B]] — dołóż mu 10 [[oczko:Dlm]].' },
      explain: '[[Card:s-10]] daje waszej stronie 10 [[oczko:Dlm]] więcej, a ryzyka nie ma — wszyscy już zagrali.',
    },
    {
      type: 'playCard',
      id: 'm6-l27-p2',
      prompt:
        'Partner ([[przodek]]) wyszedł [[card:d-A:N]]. Po tobie zagra jeszcze [[rozgrywajacy]] — może nie mieć koloru [[suit:d]] i przebić. Którą kartę dołożyć?',
      game: HEARTS,
      leader: 0,
      trick: ['d-A'],
      hand: ['d-10', 'd-7', 'c-9', 's-8'],
      mode: 'best',
      best: ['d-7'],
      wrongExplain: {
        'd-10': 'Jeśli [[rozgrywajacy]] przebije, twoja dziesiątka przepadnie. Dokładaj dopiero, gdy {lewa jest pewna|sztych jest pewny}.',
      },
      explain: 'Dołóż [[card:d-7:B]] — dziesiątkę zachowasz na pewniejszą okazję.',
    },
    {
      type: 'playCard',
      id: 'm6-l27-p3',
      prompt:
        '[[Rozgrywajacy]] ([[przodek]]) wyszedł [[card:c-A:N]], partner dołożył [[card:c-7:B]]. Nie masz koloru [[suit:c]] ani [[atu:Dlm]]. Którą kartę oddać?',
      game: HEARTS,
      leader: 0,
      trick: ['c-A', 'c-7'],
      hand: ['s-10', 's-8', 'd-K', 'd-7'],
      mode: 'best',
      best: ['s-8', 'd-7'],
      wrongExplain: {
        's-10': '10 [[oczko:Dlm]] dla [[rozgrywajacy:D]] — oddaj kartę bez wartości.',
        'd-K': '4 [[oczko:Mlm]] dla [[rozgrywajacy:D]] — oddaj kartę bez wartości.',
      },
      explain: '[[Lewa:B]] bierze [[rozgrywajacy]] — nie dokładaj mu żadnych [[oczko:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'm6-l27-q1',
      prompt: 'Kiedy dołożyć partnerowi dziesiątkę?',
      options: [
        { id: 'a', text: 'Gdy na pewno bierze [[lewa:B]]' },
        { id: 'b', text: 'Zawsze, gdy partner wychodzi' },
        { id: 'c', text: 'Nigdy' },
      ],
      correct: 'a',
      explain: 'Oczka dokłada się tylko do [[lewa:D]], którą partner na pewno weźmie — inaczej mogą trafić do [[rozgrywajacy:D]].',
    },
  ],
};
