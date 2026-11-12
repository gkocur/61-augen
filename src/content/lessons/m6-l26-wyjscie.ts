// src/content/lessons/m6-l26-wyjscie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const NO_TRUMP_LEAD = 'Nie wychodź w [[atu:B]] — to pomaga [[rozgrywajacy:C]].';

export const lesson: Lesson = {
  id: 'm6-l26-wyjscie',
  title: 'Wyjście [[obronca:D]]',
  summary: 'Krótka droga — długi kolor, długa droga — krótki kolor.',
  steps: [
    {
      title: 'Gdzie siedzi [[rozgrywajacy]]?',
      text:
        'Gdy jako [[obronca]] wychodzisz, ważne jest, gdzie siedzi [[rozgrywajacy]]:\n\n' +
        '• **krótka droga** — [[rozgrywajacy]] gra zaraz po tobie, a twój partner na końcu,\n\n' +
        '• **długa droga** — twój partner gra zaraz po tobie, a [[rozgrywajacy]] na końcu.',
    },
    {
      title: 'Krótka droga — długi kolor',
      text:
        'Gdy [[rozgrywajacy]] siedzi zaraz za tobą, wyjdź w swój **długi kolor** (nie w [[atu:B]]). ' +
        'Twój partner gra po [[rozgrywajacy:Ms]] — zwykle ma mało kart w tym kolorze, więc może przebić albo dołożyć [[oczko:Blm]], widząc już kartę [[rozgrywajacy:D]].',
    },
    {
      title: 'Długa droga — krótki kolor',
      text:
        'Gdy [[rozgrywajacy]] gra jako ostatni, wyjdź w swój **krótki kolor** — najlepiej z pojedynczej karty. ' +
        'Gdy ten kolor wróci, możesz go przebić [[atu:N]] albo dołożyć [[oczko:Blm]] partnerowi.\n\n' +
        'To wskazówka, nie żelazna reguła — ale dobry punkt wyjścia.',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm6-l26-p1',
      prompt:
        '[[Rozgrywajacy]] siedzi zaraz po tobie ([[srodek]]) i gra z [[atu:Nlm]] w kolorze [[suit:c]]. Wychodzisz. Którą kartę zagrać?',
      game: CLUBS,
      leader: 0,
      trick: [],
      hand: ['h-A', 'h-K', 'h-9', 'h-8', 's-10', 'd-7', 'c-9', 'c-8'],
      mode: 'best',
      best: ['h-A', 'h-K', 'h-9', 'h-8'],
      wrongExplain: {
        's-10': 'To krótki kolor — przy krótkiej drodze wychodzi się w długi.',
        'd-7': 'To krótki kolor — przy krótkiej drodze wychodzi się w długi.',
        'c-9': NO_TRUMP_LEAD,
        'c-8': NO_TRUMP_LEAD,
      },
      explain:
        'Krótka droga — długi kolor: twój najdłuższy kolor to [[suit:h]]. Partner gra po [[rozgrywajacy:Ms]] i zobaczy jego kartę, zanim sam zagra.',
    },
    {
      type: 'playCard',
      id: 'm6-l26-p2',
      prompt:
        '[[Rozgrywajacy]] siedzi na końcu ([[zadek]]), twój partner zaraz po tobie. [[Atu]]: [[suit:c]]. Wychodzisz. Którą kartę zagrać?',
      game: CLUBS,
      leader: 0,
      trick: [],
      hand: ['s-7', 'h-K', 'h-Q', 'h-9', 'h-8', 'd-10', 'd-8', 'c-8'],
      mode: 'best',
      best: ['s-7'],
      wrongExplain: {
        'h-K': 'Przy długiej drodze wyjdź w krótki kolor, najlepiej z pojedynczej karty.',
        'h-Q': 'Przy długiej drodze wyjdź w krótki kolor, najlepiej z pojedynczej karty.',
        'h-9': 'Przy długiej drodze wyjdź w krótki kolor, najlepiej z pojedynczej karty.',
        'h-8': 'Przy długiej drodze wyjdź w krótki kolor, najlepiej z pojedynczej karty.',
        'd-10': 'Dziesiątka bez [[as:D]] łatwo przepada — a twój najkrótszy kolor to [[suit:s]].',
        'd-8': 'Masz krótszy kolor: [[suit:s]] — tylko jedna karta.',
        'c-8': NO_TRUMP_LEAD,
      },
      explain:
        'Długa droga — krótki kolor: [[card:s-7]] to twoja jedyna karta w kolorze [[suit:s]]. Gdy ten kolor wróci, możesz go przebić [[atu:N]].',
    },
    {
      type: 'quiz',
      id: 'm6-l26-q1',
      prompt: 'Twój partner gra zaraz po tobie, a [[rozgrywajacy]] na końcu. Jak nazywa się ta sytuacja?',
      options: [
        { id: 'a', text: 'Krótka droga' },
        { id: 'b', text: 'Długa droga' },
      ],
      correct: 'b',
      explain: 'Do [[rozgrywajacy:D]] jest „daleko” — gra jako ostatni. To długa droga: wychodzi się w krótki kolor.',
    },
    {
      type: 'quiz',
      id: 'm6-l26-q2',
      prompt: 'Przy „krótkiej drodze” kto gra zaraz po tobie?',
      options: [
        { id: 'a', text: '[[Rozgrywajacy]]' },
        { id: 'b', text: 'Twój partner' },
      ],
      correct: 'a',
      explain: 'Krótka droga: [[rozgrywajacy]] gra zaraz po tobie, a twój partner — za nim.',
    },
  ],
};
