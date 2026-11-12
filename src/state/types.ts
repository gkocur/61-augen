// src/state/types.ts
import type { DeckKind, Register } from '../glossary';

export interface Settings {
  deck: DeckKind;
  register: Register;
  unlockAll: boolean;
}

export interface LessonProgress {
  status: 'passed' | 'failed';
  /** Najlepszy wynik 0–1. */
  bestScore: number;
  attempts: number;
}

export interface AppState {
  schemaVersion: 1;
  settings: Settings;
  lessons: Record<string, LessonProgress>;
}
