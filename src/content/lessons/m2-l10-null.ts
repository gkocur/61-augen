// src/content/lessons/m2-l10-null.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const NULL_GAME: GameType = { kind: 'null' };
const PROMPT = '[[Null]]. Która karta bierze {lewę|sztycha}?';
const VERIFY = { kind: 'trickWinner', game: NULL_GAME } as const;

export const lesson: Lesson = {
  id: 'm2-l10-null',
  title: '[[Null]]',
  summary: 'Gra, w której nie wolno wziąć ani jednej [[lewa:D]].',
  steps: [
    {
      title: 'Gra bez [[lewa:Dlm]]',
      text:
        'W **[[null:Ms]]** [[rozgrywajacy]] {**nie może wziąć ani jednej lewy**. Jeśli weźmie choć jedną — przegrywa.|**nie może wziąć ani jednego sztycha**. Jeśli weźmie choć jednego — przegrywa.}\n\n' +
        '[[Oczko:Mlm]] nie mają tu żadnego znaczenia.',
    },
    {
      title: 'Bez [[atu:D]], inna kolejność',
      text:
        'W [[null:Ms]] nie ma [[atu:D]], a [[walet]] jest zwykłą kartą swojego koloru. Kolejność w każdym kolorze:\n\n' +
        '**[[As]] · [[krol]] · [[dama]] · [[walet]] · 10 · 9 · 8 · 7**\n\n' +
        'Dziesiątka stoi tu między [[walet:N]] a dziewiątką.',
      cards: ['h-A', 'h-K', 'h-Q', 'h-J', 'h-10', 'h-9', 'h-8', 'h-7'],
      cardsCaption: 'Kolejność w [[null:Ms]] — od najsilniejszej.',
    },
    {
      title: 'Dokładanie do koloru',
      text:
        'Dokładanie działa normalnie: jeśli masz kolor wyjścia, musisz go dołożyć. [[Card:c-J]] jest w [[null:Ms]] kartą koloru [[suit:c]].',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm2-l10-q1',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'h-10' },
        { id: 'b', card: 'h-J' },
        { id: 'c', card: 'h-9' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain: 'W [[null:Ms]] [[walet]] jest silniejszy od dziesiątki.',
    },
    {
      type: 'quiz',
      id: 'm2-l10-q2',
      prompt: PROMPT,
      options: [
        { id: 'a', card: 'c-J' },
        { id: 'b', card: 'c-A' },
        { id: 'c', card: 'h-A' },
      ],
      correct: 'b',
      verify: VERIFY,
      explain:
        '[[Walet]] jest tu zwykłą kartą koloru [[suit:c]], a [[as]] jest od niego silniejszy. [[Card:h-A]] jest w innym kolorze.',
    },
    {
      type: 'playCard',
      id: 'm2-l10-p1',
      prompt: 'Na stole leży [[card:c-K]]. Zagraj dozwoloną kartę.',
      game: NULL_GAME,
      leader: 0,
      trick: ['c-K'],
      hand: ['c-J', 'h-J', 's-7'],
      mode: 'legal',
      explain: 'W [[null:Ms]] [[card:c-J]] należy do koloru [[suit:c]] — musisz go dołożyć.',
    },
    {
      type: 'playCard',
      id: 'm2-l10-p2',
      prompt:
        'Grasz jako [[rozgrywajacy]]. Na stole leżą [[card:s-9]] i [[card:s-Q]]. Zagraj tak, żeby nie wziąć {lewy|sztycha}.',
      game: NULL_GAME,
      leader: 1,
      trick: ['s-9', 's-Q'],
      hand: ['s-K', 's-10', 'd-A'],
      mode: 'best',
      best: ['s-10'],
      wrongExplain: {
        's-K': '[[Krol]] jest silniejszy od [[dama:D]] — {ta lewa byłaby twoja|ten sztych byłby twój}.',
      },
      explain: 'Dziesiątka jest w [[null:Ms]] słabsza od [[dama:D]], więc {lewę|sztycha} weźmie kto inny.',
    },
    {
      type: 'quiz',
      id: 'm2-l10-q3',
      prompt: 'Ile [[lewa:Dlm]] może wziąć [[rozgrywajacy]] w [[null:Ms]], żeby wygrać?',
      options: [
        { id: 'a', text: '0' },
        { id: 'b', text: '1' },
        { id: 'c', text: '5' },
      ],
      correct: 'a',
      explain:
        '{Ani jednej — każda wzięta lewa oznacza przegraną.|Ani jednego — każdy wzięty sztych oznacza przegraną.}',
    },
  ],
};
