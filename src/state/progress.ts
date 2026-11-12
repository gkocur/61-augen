// src/state/progress.ts
import type { Course, Lesson } from '../content/types';
import type { AppState } from './types';

export const PASS_THRESHOLD = 0.8;

export type LessonStatus = 'locked' | 'available' | 'passed';

export function flattenLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function isPassingScore(score: number): boolean {
  return score >= PASS_THRESHOLD;
}

export function lessonStatuses(course: Course, state: AppState): Record<string, LessonStatus> {
  const statuses: Record<string, LessonStatus> = {};
  let previousPassed = true;
  for (const lesson of flattenLessons(course)) {
    const passed = state.lessons[lesson.id]?.status === 'passed';
    statuses[lesson.id] = passed ? 'passed' : state.settings.unlockAll || previousPassed ? 'available' : 'locked';
    previousPassed = passed;
  }
  return statuses;
}

export function nextLessonId(course: Course, state: AppState): string | null {
  const statuses = lessonStatuses(course, state);
  return flattenLessons(course).find((lesson) => statuses[lesson.id] === 'available')?.id ?? null;
}

export function lessonNumber(course: Course, lessonId: string): number {
  return flattenLessons(course).findIndex((lesson) => lesson.id === lessonId) + 1;
}

export function lessonAfter(course: Course, lessonId: string): Lesson | null {
  const lessons = flattenLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;
}

export function recordResult(state: AppState, lessonId: string, score: number): AppState {
  const safe = Number.isFinite(score) ? Math.min(1, Math.max(0, score)) : 0;
  const previous = state.lessons[lessonId];
  const passed = isPassingScore(safe) || previous?.status === 'passed';
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: {
        status: passed ? 'passed' : 'failed',
        bestScore: Math.max(safe, previous?.bestScore ?? 0),
        attempts: (previous?.attempts ?? 0) + 1,
      },
    },
  };
}
