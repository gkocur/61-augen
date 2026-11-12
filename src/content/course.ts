// src/content/course.ts
import { lesson as l01 } from './lessons/m1-l01-czym-jest-skat';
import { lesson as l02 } from './lessons/m1-l02-talia';
import { lesson as l03 } from './lessons/m1-l03-oczka';
import { lesson as l04 } from './lessons/m1-l04-rozdanie';
import { lesson as l05 } from './lessons/m2-l05-dokladanie';
import { lesson as l06 } from './lessons/m2-l06-kolejnosc';
import { lesson as l07 } from './lessons/m2-l07-atu';
import { lesson as l08 } from './lessons/m2-l08-walety';
import type { Course } from './types';

export const COURSE: Course = {
  modules: [
    { id: 'm1', title: 'Pierwsze kroki', lessons: [l01, l02, l03, l04] },
    { id: 'm2', title: 'Rozgrywka lew', lessons: [l05, l06, l07, l08] },
  ],
};
