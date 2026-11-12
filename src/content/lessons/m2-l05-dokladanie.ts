// src/content/lessons/m2-l05-dokladanie.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

// Gra bez atu (technicznie: null), a w rękach nie ma waletów —
// lekcja uczy wyłącznie obowiązku dokładania do koloru.
const NO_TRUMPS: GameType = { kind: 'null' };
const PROMPT_END = 'Zagraj dozwoloną kartę.';

export const lesson: Lesson = {
  id: 'm2-l05-dokladanie',
  title: '[[Lewa]] i dokładanie do koloru',
  summary: 'Najważniejsza zasada rozgrywki: dokładaj do koloru.',
  steps: [
    {
      title: 'Czym jest [[lewa]]?',
      text:
        '**[[Lewa]]** to jedna kolejka: każdy z trzech graczy kładzie na stół po jednej karcie. W rozdaniu jest 10 [[lewa:Dlm]] — tyle, ile kart w ręce.\n\n' +
        'Karty {z wziętej lewy trafiają do gracza, który ją wziął|z wziętego sztycha trafiają do gracza, który go wziął}, a ich [[oczko:Mlm]] liczą się dla niego lub jego drużyny.',
    },
    {
      title: 'Kolor wyjścia',
      text:
        'Pierwsza karta {w lewie|w sztychu} wyznacza **kolor wyjścia**. Pozostali gracze **muszą dołożyć kartę w tym samym kolorze**, jeśli ją mają.\n\n' +
        'To obowiązek, a nie wybór — nawet gdy szkoda ci tej karty.',
    },
    {
      title: 'Nie masz koloru?',
      text:
        'Jeśli nie masz żadnej karty w kolorze wyjścia, możesz zagrać **dowolną** kartę.\n\n' +
        'W tej lekcji nie ma jeszcze [[atu:Dlm]] ani [[walet:Dlm]] w rękach — poznasz je w lekcjach 7–8.',
    },
  ],
  exercises: [
    {
      type: 'playCard',
      id: 'm2-l05-p1',
      prompt: `Na stole leży [[card:h-K]]. ${PROMPT_END}`,
      game: NO_TRUMPS,
      leader: 0,
      trick: ['h-K'],
      hand: ['h-7', 'h-A', 's-10', 'c-K', 'd-8'],
      mode: 'legal',
      explain: 'Masz karty w kolorze [[suit:h]], więc musisz dołożyć jedną z nich: [[card:h-7]] albo [[card:h-A]].',
    },
    {
      type: 'playCard',
      id: 'm2-l05-p2',
      prompt: `Na stole leżą [[card:s-9]] i [[card:s-A]]. ${PROMPT_END}`,
      game: NO_TRUMPS,
      leader: 1,
      trick: ['s-9', 's-A'],
      hand: ['c-10', 'c-8', 'h-Q', 'd-A', 'd-9'],
      mode: 'legal',
      explain: 'Nie masz żadnej karty w kolorze [[suit:s]], więc wolno ci zagrać dowolną kartę.',
    },
    {
      type: 'playCard',
      id: 'm2-l05-p3',
      prompt: `Na stole leży [[card:d-10]]. ${PROMPT_END}`,
      game: NO_TRUMPS,
      leader: 2,
      trick: ['d-10'],
      hand: ['d-7', 'c-A', 'c-K', 'h-10', 's-8'],
      mode: 'legal',
      explain: 'Jedyną kartą w kolorze [[suit:d]] jest [[card:d-7]] — musisz ją dołożyć, choć nie weźmie {tej lewy|tego sztycha}.',
    },
    {
      type: 'playCard',
      id: 'm2-l05-p4',
      prompt: `Na stole leżą [[card:c-Q]] i [[card:c-7]]. ${PROMPT_END}`,
      game: NO_TRUMPS,
      leader: 1,
      trick: ['c-Q', 'c-7'],
      hand: ['c-A', 'c-9', 'h-A', 's-7'],
      mode: 'legal',
      explain: 'Masz dwie karty w kolorze [[suit:c]]: możesz dołożyć [[card:c-A]] (i wziąć {lewę|sztycha}) albo [[card:c-9]].',
    },
  ],
};
