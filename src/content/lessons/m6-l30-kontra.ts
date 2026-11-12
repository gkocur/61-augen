// src/content/lessons/m6-l30-kontra.ts
import type { Declaration } from '../../engine';
import type { Lesson } from '../types';

const HEARTS_DECL: Declaration = { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' };
const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;
const WON = { declarerPoints: 75, declarerTricks: 6 };

export const lesson: Lesson = {
  id: 'm6-l30-kontra',
  title: 'Kontra i re',
  summary: 'Podwojenie stawki — kiedy się opłaca.',
  steps: [
    {
      title: 'Czym jest kontra',
      text:
        '**Kontra** to zapowiedź [[obronca:D]]: „ta gra przegra”. Podwaja wartość gry. [[Rozgrywajacy]] może odpowiedzieć **re** — wtedy wartość rośnie czterokrotnie.',
    },
    {
      title: 'Zasady',
      text:
        'Kontry i re nie ma w oficjalnych przepisach (ISkO), ale gra się z nimi w ligach i przy wielu stołach. Zwykle kontrę mówi się, zanim padnie pierwsza karta. Szczegóły — np. kto może kontrować — ustala się przed grą.',
    },
    {
      title: 'Kiedy kontrować',
      text:
        'Kontruj, gdy masz mocne karty przeciwko zgłoszonej grze: kilka [[atu:Dlm]] (najlepiej wysokich) i [[as:Mlm]] z boku. Kontra przy słabych kartach to podwójna strata.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm6-l30-q1',
      prompt: '[[Atu]]: [[suit:h]], [[mit]] 2. Gra jest wygrana, a była kontra. Ile jest warta?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '30' },
        { id: 'b', text: '60' },
        { id: 'c', text: '120' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: HEARTS_DECL, outcome: WON, doubling: 'kontra', result: 'value' },
      explain: 'Bez kontry: 10 × 3 = 30. Kontra podwaja: 60.',
    },
    {
      type: 'quiz',
      id: 'm6-l30-q2',
      prompt: 'Ta sama gra, ale po kontrze padło re. Ile jest warta?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '60' },
        { id: 'b', text: '120' },
        { id: 'c', text: '240' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: HEARTS_DECL, outcome: WON, doubling: 're', result: 'value' },
      explain: 'Re to czterokrotność: 30 × 4 = 120.',
    },
    {
      type: 'quiz',
      id: 'm6-l30-q3',
      prompt:
        '[[Atu]]: [[suit:h]], [[mit]] 2, kontra. [[Rozgrywajacy]] przegrywa z 55 [[oczko:Nlm]]. Jaki jest wynik?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '−60', value: '-60' },
        { id: 'b', text: '−120', value: '-120' },
        { id: 'c', text: '−240', value: '-240' },
      ],
      correct: 'b',
      verify: {
        kind: 'settle',
        declaration: HEARTS_DECL,
        outcome: { declarerPoints: 55, declarerTricks: 4 },
        doubling: 'kontra',
        result: 'score',
      },
      explain: 'Wartość z kontrą: 60. Przegrana liczy się podwójnie: −120.',
    },
    {
      type: 'quiz',
      id: 'm6-l30-q4',
      prompt: 'Zgłoszono grę z [[atu:Nlm]] w kolorze [[suit:s]]. Czy z tymi kartami kontrować?',
      cards: ['c-J', 's-J', 's-A', 's-10', 'h-A', 'h-10', 'd-A', 'c-8', 'd-7', 'h-9'],
      options: [
        { id: 'a', text: 'Tak — mocne [[atu:Mlm]] i [[as:Mlm]]' },
        { id: 'b', text: 'Nie — to za mało' },
      ],
      correct: 'a',
      explain:
        'Masz cztery wysokie [[atu:Mlm]] ([[card:c-J]], [[card:s-J]], [[card:s-A]], [[card:s-10]]) i dwa [[as:Mlm]] z boku — [[rozgrywajacy]] będzie miał bardzo trudno.',
    },
    {
      type: 'quiz',
      id: 'm6-l30-q5',
      prompt: 'Kto może powiedzieć re?',
      options: [
        { id: 'a', text: '[[Rozgrywajacy]] — w odpowiedzi na kontrę' },
        { id: 'b', text: 'Każdy [[obronca]]' },
        { id: 'c', text: 'Partner kontrującego' },
      ],
      correct: 'a',
      explain: 'Re to odpowiedź [[rozgrywajacy:D]] na kontrę.',
    },
  ],
};
