// src/content/lessons/m3-l13-matadory.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const HEARTS: GameType = { kind: 'suit', trump: 'h' };
const CLUBS: GameType = { kind: 'suit', trump: 'c' };
const GRAND: GameType = { kind: 'grand' };
const ASK = 'Z iloma [[matador:Nlm]] grasz?';

export const lesson: Lesson = {
  id: 'm3-l13-matadory',
  title: '[[Matador:Mlm]]',
  summary: '„[[Mit]] ilu” i „[[ohne]] ilu” — podstawa mnożnika.',
  steps: [
    {
      title: 'Czym są [[matador:Mlm]]?',
      text:
        '**[[Matador:Mlm]]** to najwyższe [[atu:Mlm]] liczone od samej góry, bez przerwy: [[card:c-J]], [[card:s-J]], [[card:h-J]], [[card:d-J]], potem [[as]], 10, [[krol]]… koloru [[atu:Dlm]].\n\n' +
        '[[Matador:Mlm]] liczy się z kart [[rozgrywajacy:D]] **razem ze [[skat:N]]**.',
    },
    {
      title: '„[[Mit]] ilu”',
      text:
        'Jeśli masz [[card:c-J:B]], liczysz, ile kolejnych najwyższych [[atu:Dlm]] masz bez przerwy. ' +
        'Masz [[card:c-J:B]] i [[card:s-J:B]], ale brakuje [[card:h-J:D]]? Grasz **[[mit]] 2**.',
      cards: ['c-J', 's-J', 'd-J'],
      cardsCaption: '[[Mit]] 2 — brakuje [[card:h-J:D]].',
    },
    {
      title: '„[[Ohne]] ilu”',
      text:
        'Jeśli **nie masz** [[card:c-J:D]], liczysz, ilu najwyższych [[atu:Dlm]] brakuje ci od góry. ' +
        'Pierwszy, jakiego masz, to [[card:h-J]]? Grasz **[[ohne]] 2**.\n\n' +
        'W obu przypadkach **mnożnik = [[matador:Mlm]] + 1** (za samą grę), więc [[mit]] 2 i [[ohne]] 2 dają ten sam mnożnik: 3.\n\n' +
        'W [[grand:Ms]] [[matador:Mlm]] to tylko [[walet:Mlm]] — najwyżej 4.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm3-l13-q1',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      cards: ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'],
      options: [
        { id: 'a', text: '[[Mit]] 1', value: 'z1' },
        { id: 'b', text: '[[Mit]] 2', value: 'z2' },
        { id: 'c', text: '[[Ohne]] 2', value: 'bez2' },
      ],
      correct: 'b',
      verify: { kind: 'matadors', game: HEARTS },
      explain: 'Masz [[card:c-J:B]] i [[card:s-J:B]], brakuje [[card:h-J:D]] — to [[mit]] 2, mnożnik 3.',
    },
    {
      type: 'quiz',
      id: 'm3-l13-q2',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:h]]. ${ASK}`,
      cards: ['h-J', 'd-J', 'h-A', 'h-K', 'h-9', 'c-A', 'c-K', 's-A', 's-10', 's-9', 'd-A', 'd-10'],
      options: [
        { id: 'a', text: '[[Mit]] 2', value: 'z2' },
        { id: 'b', text: '[[Ohne]] 2', value: 'bez2' },
        { id: 'c', text: '[[Ohne]] 3', value: 'bez3' },
      ],
      correct: 'b',
      verify: { kind: 'matadors', game: HEARTS },
      explain: 'Brakuje [[card:c-J:D]] i [[card:s-J:D]], a [[card:h-J:B]] masz — to [[ohne]] 2, mnożnik 3.',
    },
    {
      type: 'quiz',
      id: 'm3-l13-q3',
      prompt: `[[GraKolorowa]], [[atu]]: [[suit:c]]. ${ASK}`,
      cards: ['c-J', 's-J', 'h-J', 'd-J', 'c-A', 'c-10', 'c-K', 'c-9', 's-A', 'h-A', 'h-10', 'd-7'],
      options: [
        { id: 'a', text: '[[Mit]] 4', value: 'z4' },
        { id: 'b', text: '[[Mit]] 6', value: 'z6' },
        { id: 'c', text: '[[Mit]] 7', value: 'z7' },
      ],
      correct: 'c',
      verify: { kind: 'matadors', game: CLUBS },
      explain:
        'Cztery [[walet:Mlm]], a potem [[as]], 10 i [[krol]] koloru [[suit:c]] — ciąg przerywa brak [[dama:D]]. To [[mit]] 7.',
    },
    {
      type: 'quiz',
      id: 'm3-l13-q4',
      prompt: `[[Grand]]. ${ASK}`,
      cards: ['c-J', 's-J', 'd-J', 'c-A', 'c-10', 's-A', 's-10', 'h-A', 'h-K', 'd-A', 'd-10', 'd-9'],
      options: [
        { id: 'a', text: '[[Mit]] 2', value: 'z2' },
        { id: 'b', text: '[[Mit]] 3', value: 'z3' },
        { id: 'c', text: '[[Ohne]] 1', value: 'bez1' },
      ],
      correct: 'a',
      verify: { kind: 'matadors', game: GRAND },
      explain: 'W [[grand:Ms]] liczą się tylko [[walet:Mlm]]: masz dwa najwyższe, brakuje [[card:h-J:D]].',
    },
    {
      type: 'quiz',
      id: 'm3-l13-q5',
      prompt: '[[Atu]]: [[suit:s]], [[mit]] 3. Ile jest warta wygrana gra (bez dodatków)?',
      options: [
        { id: 'a', text: '33' },
        { id: 'b', text: '44' },
        { id: 'c', text: '36' },
      ],
      correct: 'b',
      explain: '[[Mit]] 3 → mnożnik 3 + 1 = 4. 11 × 4 = 44.',
    },
  ],
};
