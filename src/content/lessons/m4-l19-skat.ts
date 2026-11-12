// src/content/lessons/m4-l19-skat.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const SPADES: GameType = { kind: 'suit', trump: 's' };
const GRAND: GameType = { kind: 'grand' };

export const lesson: Lesson = {
  id: 'm4-l19-skat',
  title: '[[Skat]] i zgłoszenie gry',
  summary: 'Podnieść [[skat]] czy grać {z ręki|handa}? I co wyrzucić?',
  steps: [
    {
      title: 'Po wygraniu [[licytacja:D]]',
      text:
        'Jako [[rozgrywajacy]] masz dwie drogi:\n\n' +
        '**1. Podnieść [[skat]]** — bierzesz 2 karty ze stołu, potem odkładasz („wyrzucasz”) dowolne 2 karty z powrotem i zgłaszasz grę.\n\n' +
        '**2. Grać {z ręki|handa}** — nie patrzysz w [[skat]], ale gra jest warta o poziom więcej.',
    },
    {
      title: 'Co wyrzucić do [[skat:D]]',
      text:
        'Wyrzucone karty liczą się dla ciebie — na koniec ich [[oczko:Mlm]] dostaje [[rozgrywajacy]]. Dlatego dobrze wyrzucić:\n\n' +
        '• **wartościowe karty, które mogłyby przepaść** — np. dziesiątkę bez [[as:D]] w tym samym kolorze,\n\n' +
        '• karty, dzięki którym **pozbywasz się całego koloru** — wtedy możesz go potem przebijać [[atu:Nlm]].\n\n' +
        'Wyrzucanie [[atu:Dlm]] jest dozwolone, ale prawie nigdy nie ma sensu.',
    },
    {
      title: 'Kiedy grać {z ręki|handa}?',
      text:
        'Gdy twoje karty są tak mocne, że [[skat]] niewiele by pomógł — albo gdy potrzebujesz dodatkowego poziomu, żeby gra była warta wylicytowanej stawki.',
    },
  ],
  exercises: [
    {
      type: 'discard',
      id: 'm4-l19-k1',
      prompt: 'Grasz [[graKolorowa:B]], [[atu]]: [[suit:h]]. Masz 12 kart (razem ze [[skat:N]]). Wybierz 2 karty do wyrzucenia.',
      game: HEARTS,
      cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 'c-K', 's-10', 's-9', 'd-8'],
      best: [
        ['s-10', 's-9'],
        ['s-10', 'd-8'],
      ],
      wrongExplain: 'Wyrzuć [[card:s-10:B]] razem z kartą, dzięki której zostajesz bez jakiegoś koloru — w [[skat:Ms]] jej 10 [[oczko:Dlm]] nie przepadnie.',
      explain:
        '[[Card:s-10]] bez [[as:D]] łatwo przepadnie, a w [[skat:Ms]] jej [[oczko:Mlm]] są twoje. Pozbywając się całego koloru, zyskujesz możliwość przebijania go [[atu:Nlm]].',
    },
    {
      type: 'discard',
      id: 'm4-l19-k2',
      prompt: 'Grasz [[grand:B]]. Wybierz 2 karty do wyrzucenia.',
      game: GRAND,
      cards: ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 'c-K', 's-A', 's-10', 'h-A', 'h-10', 'd-10', 'd-K'],
      best: [['d-10', 'd-K']],
      explain:
        '[[Card:d-10]] i [[card:d-K]] bez [[as:D]] to łatwy łup dla [[obronca:Dlm]]. W [[skat:Ms]] ich 14 [[oczko:Dlm]] liczy się dla ciebie, a kolor [[suit:d]] znika z twojej ręki.',
    },
    {
      type: 'quiz',
      id: 'm4-l19-q1',
      prompt: 'Do kogo należą [[oczko:Mlm]] kart wyrzuconych do [[skat:D]]?',
      options: [
        { id: 'a', text: 'Do [[rozgrywajacy:D]]' },
        { id: 'b', text: 'Do [[obronca:Dlm]]' },
        { id: 'c', text: 'Do nikogo' },
      ],
      correct: 'a',
      explain: '[[Skat]] należy do [[rozgrywajacy:D]] — także karty, które sam do niego wyrzucił.',
    },
    {
      type: 'quiz',
      id: 'm4-l19-q2',
      prompt: 'Grasz {z ręki|handa}. O ile rośnie mnożnik?',
      options: [
        { id: 'a', text: '+0' },
        { id: 'b', text: '+1' },
        { id: 'c', text: '+2' },
      ],
      correct: 'b',
      explain: '[[Reka]] to jeden dodatkowy poziom mnożnika.',
    },
    {
      type: 'quiz',
      id: 'm4-l19-q3',
      prompt: 'Grasz {z ręki|handa}, [[atu]]: [[suit:s]], [[mit]] 3, i wygrywasz. Ile jest warta gra?',
      cards: ['c-J', 's-J', 'h-J', 's-A', 's-K', 's-9', 's-8', 'c-A', 'h-10', 'd-7', 'd-8', 'c-7'],
      options: [
        { id: 'a', text: '44' },
        { id: 'b', text: '55' },
        { id: 'c', text: '66' },
      ],
      correct: 'b',
      verify: {
        kind: 'settle',
        declaration: { game: SPADES, hand: true, announce: 'none' },
        outcome: { declarerPoints: 70, declarerTricks: 6 },
        result: 'value',
      },
      explain: '3 ([[matador:Mlm]]) + 1 (gra) + 1 ([[reka]]) = 5. 11 × 5 = 55.',
    },
    {
      type: 'quiz',
      id: 'm4-l19-q4',
      prompt: 'Po wygraniu [[licytacja:D]] masz te karty (razem ze [[skat:N]]). Którą grę najlepiej zgłosić?',
      cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-8', 'c-A', 's-7', 'd-7', 'c-8', 'd-8'],
      options: [
        { id: 'a', text: '[[GraKolorowa]], [[atu]]: [[suit:h]]' },
        { id: 'b', text: '[[Grand]]' },
        { id: 'c', text: '[[Null]]' },
      ],
      correct: 'a',
      explain:
        'Masz 2 [[walet:Mlm]] i pięć kart w kolorze [[suit:h]] — razem 7 [[atu:Dlm]]. Na [[grand:B]] masz za mało [[walet:Dlm]] i [[as:Dlm]], a wysokie karty wykluczają [[null:B]].',
    },
  ],
};
