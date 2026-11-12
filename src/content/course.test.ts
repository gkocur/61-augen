// src/content/course.test.ts
import { describe, expect, it } from 'vitest';
import { COURSE } from './course';
import { sumPoints } from '../engine';
import { flattenLessons } from '../state/progress';
import { validateCourse } from './validate';

describe('treść kursu', () => {
  it('przechodzi walidację', () => {
    expect(validateCourse(COURSE)).toEqual([]);
  });

  it('suma oczek w ćwiczeniach lekcji o oczkach zgadza się z kartami', () => {
    const lesson = flattenLessons(COURSE).find((l) => l.id === 'm1-l03-oczka');
    expect(lesson).toBeDefined();
    let checked = 0;
    for (const ex of lesson!.exercises) {
      if (ex.type !== 'quiz' || !ex.cards || !ex.prompt.includes('[[oczko:Dlm]] jest {w tej lewie')) continue;
      const correct = ex.options.find((o) => o.id === ex.correct);
      expect(correct?.text, ex.id).toBe(String(sumPoints(ex.cards)));
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });
});
