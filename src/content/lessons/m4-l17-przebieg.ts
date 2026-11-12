// src/content/lessons/m4-l17-przebieg.ts
import type { Lesson } from '../types';

const NEXT = 'Jaka jest następna stawka po';

export const lesson: Lesson = {
  id: 'm4-l17-przebieg',
  title: 'Przebieg [[licytacja:D]]',
  summary: 'Kto do kogo mówi i jakimi liczbami.',
  steps: [
    {
      title: 'Licytujemy liczbami',
      text:
        'W [[licytacja:Ms]] nie mówi się, jaką grę chcesz grać, tylko **liczby** — wartości gier. Kto zaoferuje najwięcej, zostaje [[rozgrywajacy:N]] i musi zagrać grę wartą co najmniej tyle.\n\n' +
        'Kolejne stawki: **18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50…** — każda z nich to wartość jakiejś gry.',
    },
    {
      title: 'Kto do kogo',
      text:
        'Najpierw **[[srodek]] {licytuje|reizuje} do [[przodek:D]]**: podaje kolejne stawki, a [[przodek]] odpowiada „tak” (trzyma) albo „[[pas]]”. ' +
        'Potem **[[zadek]] {licytuje|reizuje} do zwycięzcy** pierwszej części.\n\n' +
        'Przy tej samej stawce wygrywa ten, kto odpowiada — wystarczy mu „tak”.',
    },
    {
      title: 'Gdy wszyscy pasują',
      text:
        'Jeśli [[srodek]] i [[zadek]] spasują, [[przodek]] może zagrać za 18 albo też spasować. ' +
        'Gdy pasują wszyscy, rozdanie nie jest grane, a karty rozdaje kolejny gracz.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm4-l17-q1',
      prompt: `${NEXT} 18?`,
      options: [
        { id: 'a', text: '20' },
        { id: 'b', text: '21' },
        { id: 'c', text: '22' },
      ],
      correct: 'a',
      verify: { kind: 'nextBid', after: 18 },
      explain: '20 to wartość gry z [[atu:Nlm]] w kolorze [[suit:h]] z mnożnikiem 2.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q2',
      prompt: `${NEXT} 24?`,
      options: [
        { id: 'a', text: '25' },
        { id: 'b', text: '27' },
        { id: 'c', text: '30' },
      ],
      correct: 'b',
      verify: { kind: 'nextBid', after: 24 },
      explain: '27 = 9 × 3. Wartości 25 i 26 nie ma żadna gra.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q3',
      prompt: `${NEXT} 36?`,
      options: [
        { id: 'a', text: '37' },
        { id: 'b', text: '40' },
        { id: 'c', text: '44' },
      ],
      correct: 'b',
      verify: { kind: 'nextBid', after: 36 },
      explain: '40 = 10 × 4.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q4',
      prompt: `${NEXT} 48?`,
      options: [
        { id: 'a', text: '50' },
        { id: 'b', text: '54' },
        { id: 'c', text: '60' },
      ],
      correct: 'a',
      verify: { kind: 'nextBid', after: 48 },
      explain: '50 = 10 × 5.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q5',
      prompt: 'Kto podaje pierwszą stawkę?',
      options: [
        { id: 'a', text: '[[Przodek]]' },
        { id: 'b', text: '[[Srodek]]' },
        { id: 'c', text: '[[Zadek]]' },
      ],
      correct: 'b',
      explain: 'Najpierw [[srodek]] {licytuje|reizuje} do [[przodek:D]], potem [[zadek]] do zwycięzcy.',
    },
    {
      type: 'quiz',
      id: 'm4-l17-q6',
      prompt: 'Kto wygrywa przy tej samej stawce?',
      options: [
        { id: 'a', text: 'Ten, kto podaje stawkę' },
        { id: 'b', text: 'Ten, kto odpowiada „tak”' },
        { id: 'c', text: 'Rozstrzyga losowanie' },
      ],
      correct: 'b',
      explain: 'Żeby przejąć grę, trzeba podać stawkę wyższą — odpowiadającemu wystarczy „tak”.',
    },
  ],
};
