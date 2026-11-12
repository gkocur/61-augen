// src/content/lessons/m1-l03-oczka.ts
import type { Lesson } from '../types';

const PROMPT = 'Ile [[oczko:Dlm]] jest {w tej lewie|w tym sztychu}?';

export const lesson: Lesson = {
  id: 'm1-l03-oczka',
  title: 'Ile są warte karty',
  summary: '[[As]] 11, dziesiątka 10, a co z resztą?',
  steps: [
    {
      title: 'Wartości kart',
      text:
        '**[[As]]** 11 · **dziesiątka** 10 · **[[krol]]** 4 · **[[dama]]** 3 · **[[walet]]** 2.\n\n' +
        'Siódemki, ósemki i dziewiątki nie mają żadnych [[oczko:Dlm]].',
      cards: ['h-A', 'h-10', 'h-K', 'h-Q', 'h-J', 'h-9'],
    },
    {
      title: 'Uważaj na dziesiątkę',
      text:
        'Dziesiątka jest warta **10** [[oczko:Dlm]] — więcej niż [[krol]]! Początkujący często o tym zapominają.\n\n' +
        'Dziesiątki i [[as:Mlm]] to najcenniejsze karty w grze.',
    },
    {
      title: 'Ile jest razem?',
      text:
        'W każdym kolorze jest 11 + 10 + 4 + 3 + 2 = **30** [[oczko:Dlm]], a w całej talii 4 × 30 = **120**.\n\n' +
        'Gdy liczysz [[oczko:Blm]] w [[lewa:Ms]], dodaj wartości trzech kart.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm1-l03-q1',
      prompt: PROMPT,
      cards: ['h-A', 's-10', 'c-K'],
      options: [
        { id: 'a', text: '25' },
        { id: 'b', text: '24' },
        { id: 'c', text: '21' },
      ],
      correct: 'a',
      explain: '11 + 10 + 4 = **25**.',
    },
    {
      type: 'quiz',
      id: 'm1-l03-q2',
      prompt: PROMPT,
      cards: ['d-J', 'c-9', 'd-Q'],
      options: [
        { id: 'a', text: '5' },
        { id: 'b', text: '6' },
        { id: 'c', text: '0' },
      ],
      correct: 'a',
      explain: '2 + 0 + 3 = **5**.',
    },
    {
      type: 'quiz',
      id: 'm1-l03-q3',
      prompt: 'Która karta jest warta więcej?',
      options: [
        { id: 'a', card: 's-10' },
        { id: 'b', card: 's-K' },
      ],
      correct: 'a',
      explain: 'Dziesiątka (10) jest warta więcej niż [[krol]] (4).',
    },
    {
      type: 'quiz',
      id: 'm1-l03-q4',
      prompt: PROMPT,
      cards: ['c-A', 'c-10', 'h-A'],
      options: [
        { id: 'a', text: '31' },
        { id: 'b', text: '32' },
        { id: 'c', text: '22' },
      ],
      correct: 'b',
      explain: '11 + 10 + 11 = **32**.',
    },
    {
      type: 'quiz',
      id: 'm1-l03-q5',
      prompt: 'Ile [[oczko:Dlm]] jest warta dziewiątka?',
      options: [
        { id: 'a', text: '0' },
        { id: 'b', text: '9' },
        { id: 'c', text: '1' },
      ],
      correct: 'a',
      explain: 'Siódemki, ósemki i dziewiątki nie mają żadnych [[oczko:Dlm]].',
    },
  ],
};
