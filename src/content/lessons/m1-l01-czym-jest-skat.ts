// src/content/lessons/m1-l01-czym-jest-skat.ts
import type { Lesson } from '../types';

export const lesson: Lesson = {
  id: 'm1-l01-czym-jest-skat',
  title: 'Czym jest [[skat]]?',
  summary: 'Trzech graczy, jeden przeciw dwóm i magiczne 61.',
  steps: [
    {
      title: 'Jeden przeciw dwóm',
      text:
        '[[Skat]] to gra karciana dla trzech osób. W rozdaniu zwykle jeden gracz zostaje **[[rozgrywajacy:N]]** i gra sam przeciwko pozostałym dwóm.\n\n' +
        'Ci dwaj to **[[obronca:Mlm]]** — grają razem, jak drużyna, i wspólnie liczą zdobyte karty.',
    },
    {
      title: 'Gra o [[oczko:Blm]]',
      text:
        'Wszystkie karty w talii są warte razem **120** [[oczko:Dlm]].\n\n' +
        'Karty zdobywa się w kolejkach: każdy z trzech graczy kładzie na stół jedną kartę, a jeden z nich zabiera wszystkie trzy. Taka kolejka to **[[lewa]]**. {Kto ją bierze|Kto go bierze}, dowiesz się w module 2.\n\n' +
        '[[Rozgrywajacy]] wygrywa, jeśli w zdobytych [[lewa:Mslm]] ma co najmniej **61** [[oczko:Dlm]]. Jeśli ma 60 lub mniej, wygrywają [[obronca:Mlm]].',
    },
    {
      title: 'Kto gra?',
      text:
        'Kto zostaje [[rozgrywajacy:N]], rozstrzyga **[[licytacja]]**: gracze kolejno podbijają stawkę, a ten, kto zaoferuje najwięcej, gra.\n\n' +
        '[[Licytacja:B]] poznasz dokładnie w module 4 — na razie wystarczy wiedzieć, że jest.',
    },
  ],
  exercises: [
    {
      type: 'quiz',
      id: 'm1-l01-q1',
      prompt: 'Ile osób gra w jednym rozdaniu [[skat:D]]?',
      options: [
        { id: 'a', text: '2' },
        { id: 'b', text: '3' },
        { id: 'c', text: '4' },
      ],
      correct: 'b',
      explain: 'W [[skat:D]] grają trzy osoby: [[rozgrywajacy]] przeciwko dwóm [[obronca:Clm]].',
    },
    {
      type: 'quiz',
      id: 'm1-l01-q2',
      prompt: 'Ile [[oczko:Dlm]] musi zdobyć [[rozgrywajacy]], żeby wygrać?',
      options: [
        { id: 'a', text: '60' },
        { id: 'b', text: '61' },
        { id: 'c', text: '90' },
      ],
      correct: 'b',
      explain: 'Wystarczy **61** ze 120. Przy 60 [[oczko:Mslm]] nie ma remisu — [[rozgrywajacy]] przegrywa.',
    },
    {
      type: 'quiz',
      id: 'm1-l01-q3',
      prompt: 'Ile [[oczko:Dlm]] są warte razem wszystkie karty?',
      options: [
        { id: 'a', text: '100' },
        { id: 'b', text: '120' },
        { id: 'c', text: '130' },
      ],
      correct: 'b',
      explain: 'Cała talia jest warta **120** [[oczko:Dlm]]. Dokładnie policzymy je w lekcji 3.',
    },
    {
      type: 'quiz',
      id: 'm1-l01-q4',
      prompt: 'Jak grają [[obronca:Mlm]]?',
      options: [
        { id: 'a', text: 'Każdy na siebie' },
        { id: 'b', text: 'Razem, jako drużyna' },
        { id: 'c', text: 'Po stronie [[rozgrywajacy:D]]' },
      ],
      correct: 'b',
      explain: '[[Obronca:Mlm]] tworzą drużynę i wspólnie pilnują, żeby [[rozgrywajacy]] nie zdobył 61 [[oczko:Dlm]].',
    },
  ],
};
