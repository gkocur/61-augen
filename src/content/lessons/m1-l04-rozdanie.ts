// src/content/lessons/m1-l04-rozdanie.ts
import type { Lesson } from '../types';

const SEATS = [
  { id: 'a', text: '[[Przodek]]' },
  { id: 'b', text: '[[Srodek]]' },
  { id: 'c', text: '[[Zadek]]' },
];

export const lesson: Lesson = {
  id: 'm1-l04-rozdanie',
  title: 'Rozdanie i pozycje',
  summary: 'Kto dostaje karty i kto wychodzi pierwszy.',
  steps: [
    {
      title: 'Rozdanie',
      text:
        'Każdy gracz dostaje **10 kart**. Dwie pozostałe karty leżą zakryte na środku stołu — to **[[skat]]**.\n\n' +
        '3 × 10 + 2 = 32, czyli cała talia.',
    },
    {
      title: 'Pozycje przy stole',
      text:
        'Karty rozdaje się zgodnie z ruchem wskazówek zegara. Pierwszy gracz po lewej stronie rozdającego to **[[przodek]]**, następny to **[[srodek]]**, a trzeci to **[[zadek]]**.\n\n' +
        'Przy trzech graczach [[zadek]] jest zarazem rozdającym.',
    },
    {
      title: 'Kto zaczyna?',
      text:
        '**[[Przodek]]** zawsze wychodzi {do pierwszej lewy|do pierwszego sztycha} — bez względu na to, kto jest [[rozgrywajacy:N]].\n\n' +
        '{Każdą następną lewę rozpoczyna gracz, który wziął poprzednią.|Każdego następnego sztycha rozpoczyna gracz, który wziął poprzedniego.}',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm1-l04-q1',
      prompt: 'Ile kart leży w [[skat:Ms]]?',
      options: [
        { id: 'a', text: '2' },
        { id: 'b', text: '3' },
        { id: 'c', text: '10' },
      ],
      correct: 'a',
      explain: '[[Skat]] to zawsze 2 karty.',
    },
    {
      type: 'quiz',
      id: 'm1-l04-q2',
      prompt: 'Kto wychodzi {do pierwszej lewy|do pierwszego sztycha}?',
      options: [...SEATS, { id: 'd', text: '[[Rozgrywajacy]]' }],
      correct: 'a',
      explain: 'Zawsze [[przodek]] — nawet jeśli [[rozgrywajacy:N]] jest ktoś inny.',
    },
    {
      type: 'quiz',
      id: 'm1-l04-q3',
      prompt: 'Kto rozdaje karty przy trzech graczach?',
      options: SEATS,
      correct: 'c',
      explain: 'Przy trzech graczach rozdający to [[zadek]], a [[przodek]] siedzi po jego lewej stronie.',
    },
    {
      type: 'quiz',
      id: 'm1-l04-q4',
      prompt: 'Kto rozpoczyna {drugą lewę|drugiego sztycha}?',
      options: [
        { id: 'a', text: '[[Przodek]]' },
        { id: 'b', text: '{Gracz, który wziął pierwszą lewę|Gracz, który wziął pierwszego sztycha}' },
        { id: 'c', text: '[[Rozgrywajacy]]' },
      ],
      correct: 'b',
      explain: '{Każdą lewę poza pierwszą rozpoczyna ten, kto wziął poprzednią.|Każdego sztycha poza pierwszym rozpoczyna ten, kto wziął poprzedniego.}',
    },
    {
      type: 'quiz',
      id: 'm1-l04-q5',
      prompt: 'Ile kart dostaje każdy gracz?',
      options: [
        { id: 'a', text: '8' },
        { id: 'b', text: '10' },
        { id: 'c', text: '12' },
      ],
      correct: 'b',
      explain: 'Każdy dostaje 10 kart, a 2 trafiają do [[skat:D]].',
    },
  ],
};
