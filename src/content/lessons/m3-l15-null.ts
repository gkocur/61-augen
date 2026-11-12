// src/content/lessons/m3-l15-null.ts
import type { Announcement, Declaration } from '../../engine';
import type { Lesson } from '../types';

const nullDecl = (hand: boolean, announce: Announcement = 'none'): Declaration => ({ game: { kind: 'null' }, hand, announce });
const WON = { declarerPoints: 0, declarerTricks: 0 };

export const lesson: Lesson = {
  id: 'm3-l15-null',
  title: 'Wartość [[null:D]]',
  summary: 'Cztery stałe wartości: 23, 35, 46, 59.',
  steps: [
    {
      title: 'Stałe wartości',
      text:
        '[[Null]] nie ma [[matador:Dlm]] ani mnożnika — ma stałą wartość:\n\n' +
        '**[[Null]]** 23 · **{null z ręki|nul hand}** 35 · **{null otwarty|nul uwert}** 46 · **{null otwarty z ręki|nul uwert hand}** 59',
    },
    {
      title: '{Null otwarty|Nul uwert}',
      text:
        '[[Rozgrywajacy]] kładzie wszystkie swoje karty odkryte na stół, zanim padnie pierwsza karta. ' +
        '[[Obronca:Mlm]] widzą jego rękę — dlatego ta gra jest warta więcej.',
    },
    {
      title: 'Kiedy [[null]]?',
      text:
        '[[Null]] gra się z ręką pełną niskich kart: siódemek, ósemek, dziewiątek. Wysokie karty — zwłaszcza [[as:Mlm]] — są groźne, bo mogą wziąć [[lewa:B]]. Więcej o tym w module 5.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l15-q1',
      prompt: 'Ile jest wart [[null]]?',
      options: [
        { id: 'a', text: '23' },
        { id: 'b', text: '24' },
        { id: 'c', text: '35' },
      ],
      correct: 'a',
      verify: { kind: 'settle', declaration: nullDecl(false), outcome: WON, result: 'value' },
      explain: 'Zwykły [[null]] jest wart 23.',
    },
    {
      type: 'quiz',
      id: 'm3-l15-q2',
      prompt: 'Ile jest wart {null z ręki|nul hand}?',
      options: [
        { id: 'a', text: '35' },
        { id: 'b', text: '46' },
        { id: 'c', text: '59' },
      ],
      correct: 'a',
      verify: { kind: 'settle', declaration: nullDecl(true), outcome: WON, result: 'value' },
      explain: '{Null z ręki|Nul hand} jest wart 35.',
    },
    {
      type: 'quiz',
      id: 'm3-l15-q3',
      prompt: 'Ile jest wart {null otwarty|nul uwert}?',
      options: [
        { id: 'a', text: '35' },
        { id: 'b', text: '46' },
        { id: 'c', text: '59' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: nullDecl(false, 'ouvert'), outcome: WON, result: 'value' },
      explain: '{Null otwarty|Nul uwert} jest wart 46.',
    },
    {
      type: 'quiz',
      id: 'm3-l15-q4',
      prompt: 'Ile jest wart {null otwarty z ręki|nul uwert hand}?',
      options: [
        { id: 'a', text: '46' },
        { id: 'b', text: '59' },
        { id: 'c', text: '64' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: nullDecl(true, 'ouvert'), outcome: WON, result: 'value' },
      explain: 'To najdroższy [[null]]: 59.',
    },
    {
      type: 'quiz',
      id: 'm3-l15-q5',
      prompt: 'Ile [[matador:Dlm]] liczy się w [[null:Ms]]?',
      options: [
        { id: 'a', text: 'Wszystkie [[walet:Mlm]]' },
        { id: 'b', text: 'Żaden — [[null]] ma stałą wartość' },
        { id: 'c', text: 'Tylko [[as:Mlm]]' },
      ],
      correct: 'b',
      explain: 'W [[null:Ms]] nie ma [[atu:Dlm]] ani [[matador:Dlm]] — wartość jest stała.',
    },
  ],
};
