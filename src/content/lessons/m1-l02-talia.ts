// src/content/lessons/m1-l02-talia.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm1-l02-talia',
  title: 'Talia',
  summary: '32 karty, 4 kolory i ich kolejność.',
  steps: [
    {
      title: 'Cztery kolory',
      text:
        'Do skata używa się **32 kart**: 4 kolory po 8 kart.\n\n' +
        'W ustawieniach możesz wybrać talię — niemiecką (Altenburg) albo francuską. Zasady są w obu identyczne.',
      cards: ['c-A', 's-A', 'h-A', 'd-A'],
      cardsCaption: 'Kolory: [[suit:c]], [[suit:s]], [[suit:h]] i [[suit:d]].',
    },
    {
      title: 'Osiem kart w kolorze',
      text: 'W każdym kolorze są: 7, 8, 9, 10, [[walet]], [[dama]], [[krol]] i [[as]].',
      cards: ['h-7', 'h-8', 'h-9', 'h-10', 'h-J', 'h-Q', 'h-K', 'h-A'],
      cardsCaption: 'Wszystkie karty jednego koloru.',
    },
    {
      title: 'Kolejność kolorów',
      text:
        'Kolory mają stałą kolejność starszeństwa. Kolor **[[suit:c]]** jest najstarszy, potem **[[suit:s]]**, **[[suit:h]]**, a najmłodszy jest **[[suit:d]]**.\n\n' +
        'Ta kolejność zdecyduje o sile [[walet:Dlm]] i o wartości gier — wrócimy do niej jeszcze nie raz.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm1-l02-q1',
      prompt: 'Jaka to karta?',
      cards: ['s-Q'],
      options: [
        { id: 'a', text: '[[card:s-Q]]' },
        { id: 'b', text: '[[card:s-K]]' },
        { id: 'c', text: '[[card:c-Q]]' },
      ],
      correct: 'a',
      explain: 'To [[card:s-Q]].',
    },
    {
      type: 'quiz',
      id: 'm1-l02-q2',
      prompt: 'Która karta to [[card:d-J]]?',
      options: [
        { id: 'a', card: 'd-J' },
        { id: 'b', card: 'h-J' },
        { id: 'c', card: 'd-Q' },
        { id: 'd', card: 'd-K' },
      ],
      correct: 'a',
      explain: 'Szukana karta to [[walet]] w kolorze [[suit:d]].',
    },
    {
      type: 'quiz',
      id: 'm1-l02-q3',
      prompt: 'Ile kart liczy talia do skata?',
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '32' },
        { id: 'c', text: '52' },
      ],
      correct: 'b',
      explain: '4 kolory × 8 kart = **32**.',
    },
    {
      type: 'quiz',
      id: 'm1-l02-q4',
      prompt: 'Który kolor jest najstarszy?',
      options: [
        { id: 'a', text: '[[suit:c]]' },
        { id: 'b', text: '[[suit:s]]' },
        { id: 'c', text: '[[suit:h]]' },
        { id: 'd', text: '[[suit:d]]' },
      ],
      correct: 'a',
      explain: 'Kolejność od najstarszego: [[suit:c]], [[suit:s]], [[suit:h]], [[suit:d]].',
    },
    {
      type: 'quiz',
      id: 'm1-l02-q5',
      prompt: 'Który kolor jest najmłodszy?',
      options: [
        { id: 'a', text: '[[suit:c]]' },
        { id: 'b', text: '[[suit:s]]' },
        { id: 'c', text: '[[suit:h]]' },
        { id: 'd', text: '[[suit:d]]' },
      ],
      correct: 'd',
      explain: 'Najmłodszy jest kolor [[suit:d]].',
    },
  ],
};
