// src/content/course.test.ts
import { describe, expect, it } from 'vitest';
import { COURSE } from './course';
import { validateCourse } from './validate';

describe('treść kursu', () => {
  it('przechodzi walidację (w tym sprawdzenia silnikiem)', () => {
    expect(validateCourse(COURSE)).toEqual([]);
  });
});
