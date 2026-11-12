// src/content/lessons/d-l31-ramsz.ts
import type { GameType } from '../../engine';
import type { Lesson } from '../types';

const RAMSCH: GameType = { kind: 'ramsch' };

export const lesson: Lesson = {
  id: 'd-l31-ramsz',
  title: '[[Ramsz]]',
  summary: 'Gdy wszyscy spasują: każdy gra sam i unika [[oczko:Dlm]].',
  steps: [
    {
      title: 'Kiedy gra się [[ramsz:B]]',
      text:
        'Według oficjalnych przepisów (ISkO), gdy wszyscy trzej gracze spasują, rozdanie przepada i karty rozdaje następny gracz. ' +
        'Przy wielu stołach gra się wtedy **[[ramsz:B]]**. To wariant towarzyski — nie ma go w ISkO, a szczegóły ustala się przed grą. ' +
        'Poniżej jedna z najpopularniejszych wersji.',
    },
    {
      title: 'Każdy gra sam',
      text:
        'W [[ramsz:Ms]] nie ma [[rozgrywajacy:D]] ani drużyn. Każdy zbiera swoje [[lewa:Blm]] i stara się wziąć jak najmniej [[oczko:Dlm]]. ' +
        '[[Atu:Nlm]] są tylko [[walet:Mlm]] — kolejność kart jest taka jak w grandzie.',
    },
    {
      title: 'Kto przegrywa',
      text:
        '[[Skat]] dostaje gracz, który weźmie {ostatnią|ostatniego} [[lewa:B]]. Przegrywa ten, kto ma najwięcej [[oczko:Dlm]] — zapisuje tyle punktów na minus. ' +
        'Pozostali zapisują 0. Przy remisie przegrywają obaj.',
    },
    {
      title: 'Premie i kary',
      text:
        '**[[Jungfrau]]** to gracz, który nie wziął {żadnej|żadnego} [[lewa:D]] — wtedy wynik przegrywającego się podwaja. ' +
        '**[[Durchmarsch]]** to wzięcie wszystkich [[lewa:Dlm]] — taki gracz zapisuje +120 (bez podwajania). ' +
        'W odmianie z przekazywaniem [[skat:D]] (Schieberamsch) każde przekazanie [[skat:D]] bez oglądania podwaja wynik.',
    },
    {
      title: 'Jak grać',
      text:
        'Pozbywaj się wysokich kart, gdy [[lewa:B]] i tak bierze ktoś inny — zwłaszcza [[as:Dlm]] i [[dziesiatka:Dlm]]. Wychodź niskimi kartami. ' +
        'Uważaj na [[walet:Blm]]: to [[atu:Mlm]], więc łatwo nimi wziąć [[lewa:B]].',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'd-l31-q1',
      prompt: 'Kiedy gra się [[ramsz:B]]?',
      options: [
        { id: 'a', text: 'Gdy wszyscy spasują' },
        { id: 'b', text: 'Gdy [[rozgrywajacy]] przegra' },
        { id: 'c', text: 'Po każdym grandzie' },
      ],
      correct: 'a',
      explain: '[[Ramsz]] zastępuje rozdanie, w którym nikt nie chciał grać.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q2',
      prompt: 'Ile [[atu:Dlm]] masz w [[ramsz:Ms]]?',
      cards: ['c-J', 'h-J', 'h-A', 'h-10', 'h-K', 's-A', 's-7', 'd-9', 'd-8', 'c-7'],
      options: [
        { id: 'a', text: '2' },
        { id: 'b', text: '5' },
        { id: 'c', text: '0' },
      ],
      correct: 'a',
      verify: { kind: 'trumpCount', game: RAMSCH },
      explain: '[[Atu:Nlm]] są tylko [[walet:Mlm]] — tu dwa. Pozostałe karty to zwykłe kolory.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q3',
      prompt:
        'Po [[ramsz:Ms]] masz 52 [[oczko:Mlm]], pozostali gracze 41 i 27. Każdy wziął co najmniej {jedną|jednego} [[lewa:B]]. Ile zapisujesz?',
      options: [
        { id: 'a', text: '−52', value: '-52' },
        { id: 'b', text: '0' },
        { id: 'c', text: '+52', value: '52' },
      ],
      correct: 'a',
      verify: { kind: 'ramsch', points: [52, 41, 27], tricks: [4, 4, 2], seat: 0 },
      explain: 'Masz najwięcej [[oczko:Dlm]], więc przegrywasz: −52. Pozostali zapisują 0.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q4',
      prompt:
        'Masz 70 [[oczko:Dlm]], drugi gracz 50, a trzeci nie wziął {żadnej|żadnego} [[lewa:D]]. Ile zapisujesz?',
      options: [
        { id: 'a', text: '−70', value: '-70' },
        { id: 'b', text: '−140', value: '-140' },
        { id: 'c', text: '−210', value: '-210' },
      ],
      correct: 'b',
      verify: { kind: 'ramsch', points: [70, 50, 0], tricks: [7, 3, 0], seat: 0 },
      explain: 'Przegrywasz z 70 [[oczko:Nlm]], a [[jungfrau]] przy stole podwaja wynik: −140.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q5',
      prompt: 'Wziąłeś wszystkie [[lewa:Blm]]. Ile zapisujesz?',
      options: [
        { id: 'a', text: '+120', value: '120' },
        { id: 'b', text: '−120', value: '-120' },
        { id: 'c', text: '0' },
      ],
      correct: 'a',
      verify: { kind: 'ramsch', points: [120, 0, 0], tricks: [10, 0, 0], seat: 0 },
      explain: '[[Durchmarsch]] to wygrana: +120. Pozostali zapisują 0.',
    },
    {
      type: 'quiz',
      id: 'd-l31-q6',
      prompt:
        '[[Skat]] przekazano raz bez oglądania. Masz 61 [[oczko:Dlm]], pozostali gracze 35 i 24. Ile zapisujesz?',
      options: [
        { id: 'a', text: '−61', value: '-61' },
        { id: 'b', text: '−122', value: '-122' },
        { id: 'c', text: '−244', value: '-244' },
      ],
      correct: 'b',
      verify: { kind: 'ramsch', points: [61, 35, 24], tricks: [5, 3, 2], pushes: 1, seat: 0 },
      explain: 'Jedno przekazanie [[skat:D]] podwaja wynik: 61 × 2 = 122 na minus.',
    },
    {
      type: 'playCard',
      id: 'd-l31-p1',
      prompt:
        'Gracie [[ramsz:B]]. [[Przodek]] wyszedł [[card:s-A:N]], [[srodek]] dołożył [[card:s-10:B]]. Którą kartę dołożyć?',
      game: RAMSCH,
      leader: 0,
      trick: ['s-A', 's-10'],
      hand: ['s-K', 's-7', 'h-A', 'c-9'],
      mode: 'best',
      best: ['s-K'],
      wrongExplain: {
        's-7': '[[Card:s-7]] też nie bierze [[lewa:D]], ale [[card:s-K]] zostanie w twojej ręce i później może kosztować cię 4 [[oczko:Mlm]].',
      },
      explain: '[[Card:s-A]] i tak bierze [[lewa:B]]. Pozbądź się [[card:s-K:D]] — jego 4 [[oczko:Mlm]] trafią do [[przodek:D]], a nie do ciebie.',
    },
    {
      type: 'playCard',
      id: 'd-l31-p2',
      prompt:
        'Gracie [[ramsz:B]]. [[Przodek]] wyszedł [[card:d-9:N]], [[srodek]] dołożył [[card:d-K:B]]. Nie masz tego koloru. Którą kartę oddać?',
      game: RAMSCH,
      leader: 0,
      trick: ['d-9', 'd-K'],
      hand: ['c-A', 'c-7', 'h-10', 'h-8', 's-J'],
      mode: 'best',
      best: ['c-A'],
      wrongExplain: {
        's-J': '[[Card:s-J]] to [[atu]] — wziąłbyś [[lewa:B]] razem z [[card:d-K:N]].',
        'h-10': '[[Card:h-10]] też oddaje [[oczko:Mlm]], ale [[card:c-A]] jest wart więcej (11).',
        'c-7': 'Niska karta przyda się później, żeby nie brać [[lewa:Dlm]]. Teraz pozbądź się [[card:c-A:D]].',
        'h-8': 'Niska karta przyda się później, żeby nie brać [[lewa:Dlm]]. Teraz pozbądź się [[card:c-A:D]].',
      },
      explain: 'Kto nie ma koloru, może zrzucić dowolną kartę. Oddaj [[card:c-A:B]] — 11 [[oczko:Dlm]] trafi do [[srodek:D]], który bierze [[lewa:B]].',
    },
    {
      type: 'playCard',
      id: 'd-l31-p3',
      prompt: 'Gracie [[ramsz:B]]. Wychodzisz. Którą kartę zagrać?',
      game: RAMSCH,
      leader: 0,
      trick: [],
      hand: ['c-7', 'c-8', 'h-K', 's-A', 'd-J'],
      mode: 'best',
      best: ['c-7', 'c-8'],
      wrongExplain: {
        's-A': '[[Card:s-A]] najpewniej weźmie [[lewa:B]] — razem z [[oczko:Nlm]] dołożonymi przez innych.',
        'h-K': '[[Card:h-K]] weźmie [[lewa:B]], jeśli nikt nie ma w tym kolorze [[as:D]] ani [[dziesiatka:D]].',
        'd-J': '[[Card:d-J]] to [[atu]] — weźmie [[lewa:B]], jeśli inni nie mają wyższych [[walet:Dlm]].',
      },
      explain: 'Wychodź niską kartą: [[card:c-7]] i [[card:c-8]] prawie na pewno przegrają z kartami pozostałych graczy.',
    },
  ],
};
