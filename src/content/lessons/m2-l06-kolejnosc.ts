// src/content/lessons/m2-l06-kolejnosc.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

// Gra kolorowa z atu w kolorze, którego nie ma w zadaniach, i bez waletów —
// lekcja uczy wyłącznie kolejności kart w kolorze; rodzaj gry nie jest pokazywany.
const PLAIN: GameType = { kind: 'suit', trump: 'd' };
const PROMPT = 'Zagrano kolejno trzy karty. Która bierze {lewę|sztycha}?';
const VERIFY = { kind: 'trickWinner', game: PLAIN } as const;

export const lesson: Lesson = {
  id: 'm2-l06-kolejnosc',
  title: 'Kolejność kart w kolorze',
  summary: 'Która karta bierze [[lewa:B]]? Dziesiątka zaskakuje.',
  steps: [
    {
      title: 'Kto bierze [[lewa:B]]?',
      text:
        'Gdy wszyscy dokładają do koloru wyjścia, {lewę|sztycha} bierze **najwyższa karta w tym kolorze**.\n\n' +
        'Karta w innym kolorze nie bierze {lewy|sztycha} — nawet [[as]]. (Wyjątkiem są [[atu:Mlm]], które poznasz w następnej lekcji.)',
    },
    {
      title: 'Kolejność od najsilniejszej',
      text:
        '**[[As]] · 10 · [[krol]] · [[dama]] · 9 · 8 · 7**\n\n' +
        'Uwaga: **dziesiątka jest silniejsza od [[krol:D]]** — tak jak jest od niego cenniejsza w [[oczko:Mslm]]. [[Walet:Dlm]] nie ma w tej kolejności — o nich w lekcji 8.',
      cards: ['h-A', 'h-10', 'h-K', 'h-Q', 'h-9', 'h-8', 'h-7'],
      cardsCaption: 'Kolejność w kolorze — od najsilniejszej.',
    },
    {
      title: 'Siła a wartość',
      text:
        'Siła karty (czy bierze {lewę|sztycha}) i jej wartość w [[oczko:Mslm]] to dwie różne rzeczy. ' +
        'Dziewiątka jest silniejsza od ósemki, choć obie są warte 0 [[oczko:Dlm]].',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l06-q1',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 's-K' },
        { id: 'b', card: 's-10' },
        { id: 'c', card: 's-9' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'Dziesiątka jest silniejsza od [[krol:D]].',
    },
    {
      type: 'quiz',
      id: 'm2-l06-q2',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'c-Q' },
        { id: 'b', card: 'c-A' },
        { id: 'c', card: 'c-10' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'Najsilniejszą kartą w kolorze jest [[as]].',
    },
    {
      type: 'quiz',
      id: 'm2-l06-q3',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-9' },
        { id: 'b', card: 's-A' },
        { id: 'c', card: 'h-8' },
      ],
      correct: 'a',
      verify: VERIFY,
      explain:
        'Wyjście było w kolorze [[suit:h]]. [[Card:s-A]] jest w innym kolorze, więc nie bierze {lewy|sztycha} — wygrywa [[card:h-9]], najwyższa karta w kolorze wyjścia.',
    },
    {
      type: 'quiz',
      id: 'm2-l06-q4',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 's-7' },
        { id: 'b', card: 's-Q' },
        { id: 'c', card: 's-K' },
      ],
      correct: 'c',
      verify: VERIFY,
      explain: '[[Krol]] jest silniejszy od [[dama:D]].',
    },
    {
      type: 'quiz',
      id: 'm2-l06-q5',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-K' },
        { id: 'b', card: 'c-10' },
        { id: 'c', card: 'h-Q' },
      ],
      correct: 'a',
      verify: VERIFY,
      explain: 'W kolorze wyjścia ([[suit:h]]) najwyżej stoi [[krol]]. Dziesiątka jest w innym kolorze.',
    },
    {
      type: 'playCard',
      id: 'm2-l06-p1',
      prompt: 'Na stole leżą [[card:c-K]] i [[card:c-9]]. Zagraj kartę, która weźmie {lewę|sztycha}.',
      game: PLAIN,
      showGame: false,
      leader: 1,
      trick: ['c-K', 'c-9'],
      hand: ['c-10', 'c-7', 'h-A'],
      mode: 'best',
      best: ['c-10'],
      wrongExplain: { 'c-7': 'Siódemka nie przebije [[krol:D]].' },
      explain: '[[Card:c-10]] jest silniejsza od [[krol:D]] i bierze {lewę|sztycha}.',
    },
  ],
};
