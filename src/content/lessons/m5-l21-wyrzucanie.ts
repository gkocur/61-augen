// src/content/lessons/m5-l21-wyrzucanie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const GRAND: GameType = { kind: 'grand' };
const ASK = 'Masz 12 kart (razem ze [[skat:N]]). Wybierz 2 karty do wyrzucenia.';

export const lesson: Lesson = {
  id: 'm5-l21-wyrzucanie',
  title: 'Co wyrzucić do [[skat:D]] — zasady',
  summary: 'Chowaj zagrożone oczka i twórz puste kolory.',
  steps: [
    {
      title: 'Zagrożone dziesiątki',
      text:
        'Dziesiątka bez [[as:D]] w tym samym kolorze łatwo przepada — [[obronca]] zabierze ją [[as:N]]. ' +
        'Jeśli możesz, wyrzuć ją do [[skat:D]]: jej 10 [[oczko:Dlm]] będzie twoje.',
    },
    {
      title: 'Pusty kolor',
      text:
        'Wyrzucając wszystkie karty jednego koloru, robisz z niego **pusty kolor**. Gdy [[obronca:Mlm]] w nim wyjdą, możesz go przebić [[atu:N]]. ' +
        'Kolor z jedną lub dwiema kartami to dobry kandydat.',
    },
    {
      title: 'Czego nie wyrzucać',
      text:
        '[[Atu:Dlm]] zwykle się nie wyrzuca — są potrzebne w grze. Nie rozbijaj też pary **[[as]] + 10** w jednym kolorze: razem wezmą {dwie lewy|dwa sztychy}.',
    },
  ],
  exercises: [
    {
      type: 'discard',
      id: 'm5-l21-k1',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      game: HEARTS,
      cards: ['c-J', 'h-J', 'h-A', 'h-K', 'h-Q', 'h-9', 'h-7', 'c-A', 'c-10', 's-10', 'd-K', 'd-8'],
      best: [['s-10', 'd-K']],
      acceptable: [['s-10', 'd-8']],
      wrongExplain: '[[Card:s-10]] jest jedyną kartą w kolorze [[suit:s]] — bez [[as:D]] prawie na pewno przepadnie.',
      explain:
        'Wyrzucając [[card:s-10:B]], chowasz 10 [[oczko:Dlm]] i robisz pusty kolor [[suit:s]]. [[Card:d-K]] bez [[as:D]] też jest zagrożony — razem do [[skat:D]] trafia 14 [[oczko:Dlm]].',
    },
    {
      type: 'discard',
      id: 'm5-l21-k2',
      prompt: `[[Grand]]. ${ASK}`,
      game: GRAND,
      cards: ['c-J', 's-J', 'h-J', 'c-A', 'c-10', 'c-K', 'c-9', 's-A', 's-10', 'h-10', 'h-8', 'd-9'],
      best: [['h-10', 'h-8']],
      acceptable: [['h-10', 'd-9']],
      wrongExplain: '[[Card:h-10]] bez [[as:D]] to łatwy łup dla [[obronca:Dlm]].',
      explain:
        'W kolorze [[suit:h]] masz tylko [[card:h-10:B]] i [[card:h-8:B]], bez [[as:D]]. Wyrzucając obie karty, chowasz 10 [[oczko:Dlm]] i robisz pusty kolor.',
    },
    {
      type: 'discard',
      id: 'm5-l21-k3',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      game: HEARTS,
      cards: ['c-J', 's-J', 'h-A', 'h-10', 'h-K', 'h-9', 'h-7', 'c-A', 'c-10', 'd-K', 'd-9', 's-8'],
      best: [['d-K', 'd-9']],
      acceptable: [['d-K', 's-8']],
      wrongExplain: 'Nie rozbijaj pary [[card:c-A]] + [[card:c-10]] — razem wezmą {dwie lewy|dwa sztychy}.',
      explain:
        'Kolor [[suit:c]] z [[as:N]] i dziesiątką jest mocny — zostaw go. Wyrzucając obie karty w kolorze [[suit:d]], chowasz [[krol:B]] i robisz pusty kolor.',
    },
    {
      type: 'quiz',
      id: 'm5-l21-q1',
      prompt: 'Po co wyrzuca się wszystkie karty krótkiego koloru?',
      options: [
        { id: 'a', text: 'Żeby móc potem przebijać ten kolor [[atu:N]]' },
        { id: 'b', text: 'Żeby mieć mniej kart w ręce' },
        { id: 'c', text: 'Bo tak każą przepisy' },
      ],
      correct: 'a',
      explain: 'Pusty kolor to dodatkowe {lewy|sztychy}: gdy [[obronca:Mlm]] w nim wyjdą, przebijasz [[atu:N]].',
    },
  ],
};
