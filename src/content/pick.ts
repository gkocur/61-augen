// src/content/pick.ts
import type { ExerciseData, Lesson } from './types';

export function pickExercises(lesson: Lesson, random: () => number = Math.random): ExerciseData[] {
  const pool = [...lesson.exercises];
  const count = lesson.drawCount ?? pool.length;
  if (count >= pool.length) return pool;
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
