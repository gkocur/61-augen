// src/content/lessons/m5-l20-ocena-reki.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const CLUB_HAND = ['c-J', 'h-J', 'c-A', 'c-K', 'c-8', 's-A', 's-10', 'd-A', 'h-9', 'd-7'] as const;

export const lesson: Lesson = {
  id: 'm5-l20-ocena-reki',
  title: 'Ocena ręki do [[graKolorowa:D]]',
  summary: 'Ile [[atu:Dlm]] wystarczy i co jeszcze się liczy.',
  steps: [
    {
      title: 'Licz [[atu:Blm]]',
      text:
        'Najważniejsza jest liczba [[atu:Dlm]] — razem z [[walet:Nlm]]. **5 [[atu:Dlm]]** to minimum, **6–7** to wygodna gra.\n\n' +
        'Liczą się też wysokie [[atu:Mlm]]: [[walet:Mlm]], [[as]] i 10 koloru [[atu:Dlm]].',
    },
    {
      title: 'Karty z boku',
      text:
        '**[[As:Mlm]] z boku** biorą {lewy|sztychy} i oczka, a **[[as]] z dziesiątką** w jednym kolorze to bardzo mocny kolor.\n\n' +
        'Niskie karty w różnych kolorach to raczej straty — im mniej takich kart, tym lepiej.',
    },
    {
      title: 'Który kolor na [[atu]]?',
      text:
        'Najczęściej ten, w którym masz najwięcej kart. Przy równej długości wybierz kolor z wyższymi kartami — albo droższy, jeśli to potrzebne do wylicytowanej stawki.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm5-l20-q1',
      prompt: 'Który kolor wybrać na [[atu]]?',
      cards: ['c-J', 'd-J', 's-A', 's-10', 's-K', 's-8', 's-7', 'h-A', 'c-9', 'd-7'],
      options: [
        { id: 'a', text: '[[Suit:c]]' },
        { id: 'b', text: '[[Suit:s]]' },
        { id: 'c', text: '[[Suit:h]]' },
        { id: 'd', text: '[[Suit:d]]' },
      ],
      correct: 'b',
      explain: 'W kolorze [[suit:s]] masz 5 kart — razem z dwoma [[walet:Nlm]] to 7 [[atu:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'm5-l20-q2',
      prompt: 'Czy z tymi kartami warto grać [[graKolorowa:B]]?',
      cards: ['s-J', 'h-A', 'h-K', 'h-8', 'c-A', 'c-10', 's-9', 's-7', 'd-8', 'd-7'],
      options: [
        { id: 'a', text: 'Tak, to dobra ręka' },
        { id: 'b', text: 'Raczej nie — za mało [[atu:Dlm]]' },
        { id: 'c', text: 'Tak, ale tylko jako [[null]]' },
      ],
      correct: 'b',
      explain:
        'W najlepszym kolorze ([[suit:h]]) masz razem z [[walet:N]] tylko 4 [[atu:Mlm]]. To za mało — [[obronca:Mlm]] mieliby ich więcej. Na [[null:B]] masz za dużo wysokich kart.',
    },
    {
      type: 'quiz',
      id: 'm5-l20-q3',
      prompt: 'Ile masz [[atu:Dlm]] w grze, w której [[atu]] to [[suit:c]]?',
      cards: [...CLUB_HAND],
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '5' },
        { id: 'c', text: '6' },
      ],
      correct: 'b',
      verify: { kind: 'trumpCount', game: CLUBS },
      explain: 'Dwa [[walet:Mlm]] i trzy karty koloru [[suit:c]] — razem 5.',
    },
    {
      type: 'quiz',
      id: 'm5-l20-q4',
      prompt: 'Te same karty, [[atu]]: [[suit:c]]. Do ilu możesz {licytować|reizować}?',
      cards: [...CLUB_HAND],
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '36' },
        { id: 'c', text: '48' },
      ],
      correct: 'a',
      verify: { kind: 'maxBid', game: CLUBS },
      explain: 'Masz [[card:c-J:B]], ale brakuje [[card:s-J:D]] — to [[mit]] 1, mnożnik 2. 12 × 2 = 24.',
    },
    {
      type: 'quiz',
      id: 'm5-l20-q5',
      prompt: 'Co jest najważniejsze przy ocenie ręki do [[graKolorowa:D]]?',
      options: [
        { id: 'a', text: 'Liczba [[atu:Dlm]]' },
        { id: 'b', text: 'Liczba dziewiątek' },
        { id: 'c', text: 'Liczba kolorów, w których masz karty' },
      ],
      correct: 'a',
      explain: 'Bez wystarczającej liczby [[atu:Dlm]] nawet [[as:Mlm]] z boku nie pomogą — [[obronca:Mlm]] je przebiją.',
    },
  ],
};
