// src/state/progress.test.ts
import { describe, expect, it } from 'vitest';
import type { Course, Lesson } from '../content/types';
import { lessonAfter, lessonNumber, lessonStatuses, nextLessonId, recordResult } from './progress';
import { createDefaultState } from './storage';

const lesson = (id: string): Lesson => ({ id, title: id, summary: '', steps: [], exercises: [] });
const course: Course = {
  modules: [
    { id: 'm1', title: 'M1', lessons: [lesson('a'), lesson('b')] },
    { id: 'm2', title: 'M2', lessons: [lesson('c')] },
  ],
};

describe('moduł opcjonalny', () => {
  const withOptional: Course = {
    modules: [
      { id: 'm1', title: 'M1', lessons: [lesson('a'), lesson('b')] },
      { id: 'd', title: 'D', optional: true, lessons: [lesson('x')] },
    ],
  };
  it('nie blokuje ukończenia kursu', () => {
    let state = recordResult(createDefaultState(), 'a', 1);
    expect(nextLessonId(withOptional, state)).toBe('b');
    state = recordResult(state, 'b', 1);
    expect(nextLessonId(withOptional, state)).toBeNull();
    expect(lessonStatuses(withOptional, state).x).toBe('available');
    expect(lessonAfter(withOptional, 'b')?.id).toBe('x');
  });
});

describe('postęp kursu', () => {
  it('na starcie dostępna jest tylko pierwsza lekcja', () => {
    expect(lessonStatuses(course, createDefaultState())).toEqual({ a: 'available', b: 'locked', c: 'locked' });
    expect(nextLessonId(course, createDefaultState())).toBe('a');
  });

  it('zaliczenie odblokowuje następną lekcję, także w kolejnym module', () => {
    let state = recordResult(createDefaultState(), 'a', 1);
    state = recordResult(state, 'b', 0.8);
    expect(lessonStatuses(course, state)).toEqual({ a: 'passed', b: 'passed', c: 'available' });
    expect(nextLessonId(course, state)).toBe('c');
  });

  it('wynik poniżej 80% nie zalicza lekcji', () => {
    const state = recordResult(createDefaultState(), 'a', 0.75);
    expect(state.lessons.a).toEqual({ status: 'failed', bestScore: 0.75, attempts: 1 });
    expect(lessonStatuses(course, state).b).toBe('locked');
  });

  it('gorszy wynik nie cofa zaliczenia ani najlepszego wyniku', () => {
    let state = recordResult(createDefaultState(), 'a', 1);
    state = recordResult(state, 'a', 0.2);
    expect(state.lessons.a).toEqual({ status: 'passed', bestScore: 1, attempts: 2 });
  });

  it('„odblokuj wszystko” udostępnia każdą lekcję', () => {
    const state = createDefaultState();
    state.settings.unlockAll = true;
    expect(lessonStatuses(course, state)).toEqual({ a: 'available', b: 'available', c: 'available' });
  });

  it('po zaliczeniu wszystkiego nie ma następnej lekcji', () => {
    let state = createDefaultState();
    for (const id of ['a', 'b', 'c']) state = recordResult(state, id, 1);
    expect(nextLessonId(course, state)).toBeNull();
  });

  it('numeracja i kolejna lekcja', () => {
    expect(lessonNumber(course, 'c')).toBe(3);
    expect(lessonAfter(course, 'b')?.id).toBe('c');
    expect(lessonAfter(course, 'c')).toBeNull();
  });

  it('niepoprawny wynik jest sprowadzany do zakresu 0–1', () => {
    const state = createDefaultState();
    expect(recordResult(state, 'a', NaN).lessons.a).toEqual({ status: 'failed', bestScore: 0, attempts: 1 });
    expect(recordResult(state, 'a', 4 / 5).lessons.a.status).toBe('passed');
  });
});
