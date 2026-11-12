// src/content/lessons/d-l32-bocki.ts
import type { Declaration } from '../../engine';
import type { Lesson } from '../types';

const HEARTS_DECL: Declaration = { game: { kind: 'suit', trump: 'h' }, hand: false, announce: 'none' };
const HEARTS_WITH_2 = ['c-J', 's-J', 'd-J', 'h-A', 'h-10', 'h-7', 'c-A', 'c-10', 's-A', 'd-9', 'd-8', 's-7'] as const;

export const lesson: Lesson = {
  id: 'd-l32-bocki',
  title: '[[Bock:Mlm]] i zasady domowe',
  summary: 'Runda podwójnych gier — kiedy się zaczyna i ile trwa.',
  steps: [
    {
      title: 'Runda [[bock:Dlm]]',
      text:
        'Przy wielu stołach po pewnych zdarzeniach gra się **rundę [[bock:Dlm]]**: każda gra w tej rundzie liczy się podwójnie. ' +
        'Runda trwa tyle gier, ilu jest graczy przy stole — przy trzech osobach trzy gry. To zasada domowa: nie ma jej w ISkO.',
    },
    {
      title: 'Kiedy zaczyna się runda',
      text:
        'Najczęstsze powody: wynik 60:60, przegrana gra z kontrą, przegrany [[grand]]. Każdy stół wybiera własną listę — ustalcie ją przed grą.',
    },
    {
      title: 'Jak liczyć',
      text:
        '[[Bock]] podwaja wynik gry, a nie stawki w [[licytacja:Ms]] — licytujesz tak samo jak zwykle. ' +
        '[[Bock]] łączy się z kontrą: gra z kontrą w rundzie [[bock:Dlm]] liczy się czterokrotnie.',
    },
    {
      title: 'Runda [[ramsz:D]]',
      text:
        'Często po rundzie [[bock:Dlm]] gra się rundę [[ramsz:D]] — tyle gier [[ramsz:D]], ilu jest graczy. ' +
        'Gdy w trakcie rundy [[bock:Dlm]] wydarzy się kolejny powód, stoły liczą to różnie: kolejna runda po tej albo podwojenie w podwojeniu. To też ustala się wcześniej.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'd-l32-q1',
      prompt: 'Ile gier trwa runda [[bock:Dlm]] przy stole trzyosobowym?',
      options: [
        { id: 'a', text: '1' },
        { id: 'b', text: '3' },
        { id: 'c', text: '6' },
      ],
      correct: 'b',
      explain: 'Runda trwa tyle gier, ilu jest graczy — każdy raz rozdaje.',
    },
    {
      type: 'quiz',
      id: 'd-l32-q2',
      prompt: '[[Atu]]: [[suit:h]], [[mit]] 2. Gra jest wygrana bez [[krawiec:D]] w rundzie [[bock:Dlm]]. Ile jest warta?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '30' },
        { id: 'b', text: '60' },
        { id: 'c', text: '120' },
      ],
      correct: 'b',
      verify: { kind: 'settle', declaration: HEARTS_DECL, outcome: { declarerPoints: 75, declarerTricks: 6 }, bock: true, result: 'value' },
      explain: 'Zwykle 10 × 3 = 30. [[Bock]] podwaja: 60.',
    },
    {
      type: 'quiz',
      id: 'd-l32-q3',
      prompt:
        '[[Atu]]: [[suit:h]], [[mit]] 2, kontra, runda [[bock:Dlm]]. [[Rozgrywajacy]] przegrywa z 55 [[oczko:Nlm]]. Jaki jest wynik?',
      cards: [...HEARTS_WITH_2],
      options: [
        { id: 'a', text: '−120', value: '-120' },
        { id: 'b', text: '−240', value: '-240' },
        { id: 'c', text: '−480', value: '-480' },
      ],
      correct: 'b',
      verify: {
        kind: 'settle',
        declaration: HEARTS_DECL,
        outcome: { declarerPoints: 55, declarerTricks: 4 },
        doubling: 'kontra',
        bock: true,
        result: 'score',
      },
      explain: 'Wartość: 30 × 2 (kontra) × 2 ([[bock]]) = 120. Przegrana liczy się podwójnie: −240.',
    },
    {
      type: 'quiz',
      id: 'd-l32-q4',
      prompt: 'Które zdarzenie często rozpoczyna rundę [[bock:Dlm]]?',
      options: [
        { id: 'a', text: 'Wynik 60:60' },
        { id: 'b', text: 'Wygrana [[graKolorowa]]' },
        { id: 'c', text: 'Pas wszystkich graczy' },
      ],
      correct: 'a',
      explain: 'Wynik 60:60 to jeden z typowych powodów. Pas wszystkich prowadzi zwykle do [[ramsz:D]], a nie do rundy [[bock:Dlm]].',
    },
    {
      type: 'quiz',
      id: 'd-l32-q5',
      prompt: 'Czy [[bock]] zmienia stawki w [[licytacja:Ms]]?',
      options: [
        { id: 'a', text: 'Nie — licytuje się tak samo, podwaja się tylko wynik' },
        { id: 'b', text: 'Tak — wszystkie stawki są podwójne' },
      ],
      correct: 'a',
      explain: '[[Licytacja]] przebiega zwykle; [[bock]] mnoży dopiero wynik zapisanej gry.',
    },
  ],
};
