// src/content/lessons/m5-l25-null-reka.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm5-l25-null-reka',
  title: 'Ręka do [[null:D]]',
  summary: 'Niskie karty dobre, samotne wysokie — groźne.',
  steps: [
    {
      title: 'Czego szukasz',
      text:
        'Do [[null:D]] potrzebujesz kart, którymi zawsze można zejść pod cudzą kartę: **siódemek, ósemek, dziewiątek**. W każdym kolorze, który masz, najlepiej mieć siódemkę.',
    },
    {
      title: 'Groźne karty',
      text:
        '**Wysoka karta bez niskich** w tym samym kolorze — np. samotny [[as]] albo [[krol]] — to prawie pewna przegrana: gdy [[obronca]] wyjdzie w ten kolor, trzeba ją dołożyć i wziąć [[lewa:B]].\n\n' +
        'Groźny jest też kolor z luką, np. 7 i [[as]]: za drugim razem trzeba dołożyć [[as:B]].',
    },
    {
      title: 'Pusty kolor to zaleta',
      text:
        'Gdy w [[null:Ms]] nie masz jakiegoś koloru, a [[obronca:Mlm]] w nim wyjdą, możesz pozbyć się swojej najgroźniejszej karty.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm5-l25-q1',
      prompt: 'Czy to dobra ręka do [[null:D]]?',
      cards: ['c-7', 'c-8', 's-7', 's-9', 'h-7', 'h-8', 'h-10', 'd-7', 'd-9', 'd-J'],
      options: [
        { id: 'a', text: 'Tak, dobra ręka do [[null:D]]' },
        { id: 'b', text: 'Nie, za dużo wysokich kart' },
      ],
      correct: 'a',
      explain: 'W każdym kolorze masz siódemkę i niskie karty — trudno zmusić cię do wzięcia [[lewa:D]].',
    },
    {
      type: 'quiz',
      id: 'm5-l25-q2',
      prompt: 'Która karta jest w [[null:Ms]] najgroźniejsza?',
      cards: ['c-7', 'c-8', 'c-9', 's-7', 's-8', 's-10', 'h-7', 'h-8', 'h-9', 'd-A'],
      options: [
        { id: 'a', card: 'd-A' },
        { id: 'b', card: 's-10' },
        { id: 'c', card: 'h-9' },
      ],
      correct: 'a',
      explain:
        '[[Card:d-A]] to jedyna karta w kolorze [[suit:d]] — gdy [[obronca]] w nim wyjdzie, trzeba ją dołożyć i wziąć [[lewa:B]].',
    },
    {
      type: 'quiz',
      id: 'm5-l25-q3',
      prompt: 'Którą grę zgłosić z tymi kartami?',
      cards: ['c-7', 'c-8', 's-7', 's-8', 's-9', 'h-7', 'h-9', 'd-7', 'd-8', 'd-10'],
      options: [
        { id: 'a', text: '[[Null]]' },
        { id: 'b', text: '[[GraKolorowa]], [[atu]]: [[suit:s]]' },
        { id: 'c', text: '[[Grand]]' },
      ],
      correct: 'a',
      explain:
        'Bez [[walet:Dlm]] i [[as:Dlm]] trudno wygrać grę z [[atu:Nlm]] — ale do [[null:D]] te karty są idealne.',
    },
    {
      type: 'quiz',
      id: 'm5-l25-q4',
      prompt:
        'W kolorze [[suit:h]] masz tylko [[card:h-7:B]] i [[card:h-A:B]]. Co się stanie, gdy [[obronca:Mlm]] dwa razy zagrają ten kolor?',
      options: [
        { id: 'a', text: 'Za drugim razem trzeba dołożyć [[card:h-A:B]] i wziąć [[lewa:B]]' },
        { id: 'b', text: 'Nic — zawsze można zejść niżej' },
        { id: 'c', text: 'Można zagrać inny kolor' },
      ],
      correct: 'a',
      explain: 'Po siódemce zostaje tylko [[as]] — a do koloru wyjścia trzeba dołożyć.',
    },
  ],
};
