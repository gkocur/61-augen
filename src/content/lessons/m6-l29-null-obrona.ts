// src/content/lessons/m6-l29-null-obrona.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm6-l29-null-obrona',
  title: 'Obrona przed [[null:N]]',
  summary: 'Znajdź lukę i zmuś [[rozgrywajacy:B]] do wzięcia [[lewa:D]].',
  steps: [
    {
      title: 'Cel obrony',
      text:
        'W [[null:Ms]] [[obronca:Mlm]] wygrywają, gdy [[rozgrywajacy]] weźmie {choć jedną lewę|choć jednego sztycha}.',
    },
    {
      title: 'Szukaj luki',
      text:
        'Groźny dla [[rozgrywajacy:D]] jest kolor z luką — np. 7, [[dama]], [[as]]. Gdy ten kolor zostanie zagrany dwa razy, za pierwszym razem zejdzie siódemką, ale za drugim musi dołożyć wysoką kartę.',
    },
    {
      title: '{Null otwarty|Nul uwert}',
      text:
        'W {nullu otwartym|nulu uwert} karty [[rozgrywajacy:D]] leżą odkryte — widać, gdzie jest luka. Zagraj w ten kolor kartami, które są wyższe od jego niskiej karty, ale niższe od wysokich.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm6-l29-q1',
      prompt: 'Kiedy [[obronca:Mlm]] wygrywają z [[null:N]]?',
      options: [
        { id: 'a', text: 'Gdy [[rozgrywajacy]] weźmie {choć jedną lewę|choć jednego sztycha}' },
        { id: 'b', text: 'Gdy zdobędą 61 [[oczko:Dlm]]' },
        { id: 'c', text: 'Nigdy' },
      ],
      correct: 'a',
      explain: 'W [[null:Ms]] [[oczko:Mlm]] się nie liczą — {wystarczy jedna wzięta lewa|wystarczy jeden wzięty sztych}.',
    },
    {
      type: 'quiz',
      id: 'm6-l29-q2',
      prompt:
        'W jednym z kolorów [[rozgrywajacy]] ma tylko [[card:s-7:B]], [[card:s-8:B]] i [[card:s-9:B]]. Czy da się go złapać w tym kolorze?',
      options: [
        { id: 'a', text: 'Nie — zawsze zejdzie niżej' },
        { id: 'b', text: 'Tak — wystarczy wyjść dziesiątką' },
      ],
      correct: 'a',
      explain: 'Na każdą kartę [[obronca:Dlm]] w tym kolorze [[rozgrywajacy]] ma niższą — luki nie ma.',
    },
    {
      type: 'miniDeal',
      id: 'm6-l29-d1',
      prompt:
        '{Null otwarty|Nul uwert}: karty [[rozgrywajacy:D]] widzisz. Wychodzisz — zmuś go do wzięcia [[lewa:D]].',
      game: { kind: 'null' },
      declarer: 1,
      you: 0,
      ouvert: true,
      hands: [
        ['c-Q', 's-A', 's-J', 'h-J', 'h-10', 'd-K', 'd-J', 'd-10', 'd-9', 'd-8'],
        ['c-J', 'c-9', 'c-8', 'c-7', 's-10', 's-8', 's-7', 'h-A', 'h-Q', 'h-7'],
        ['c-A', 'c-K', 'c-10', 's-9', 'h-K', 'h-9', 'h-8', 'd-A', 'd-Q', 'd-7'],
      ],
      skat: ['s-Q', 's-K'],
      solution: ['h-10', 'h-J'],
      mistakes: [['d-8', 'd-9', 'h-10', 'd-10', 's-J', 'h-J', 'd-J', 'c-Q', 'd-K', 's-A']],
      goal: { kind: 'win' },
      explain:
        '[[Rozgrywajacy]] ma tylko [[card:h-7:B]], [[card:h-Q:B]] i [[card:h-A:B]] — między siódemką a wysokimi kartami jest luka. Po [[card:h-10:Ms]] schodzi siódemką, ale po [[card:h-J:Ms]] musi dołożyć [[dama:B]] albo [[as:B]] — i bierze [[lewa:B]]. Gdy wyjdziesz w kolor, którego [[rozgrywajacy]] nie ma (tu: [[suit:d]]), zrzuci [[card:h-A:B]] i [[card:h-Q:B]] — luka zniknie.',
    },
  ],
};
