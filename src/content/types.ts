// src/content/types.ts
import type { CardId, GameType, Seat } from '../engine';

export interface TheoryStep {
  title?: string;
  text: string;
  cards?: CardId[];
  cardsCaption?: string;
}

/** Odpowiedź w quizie: tekst ALBO karta. */
export interface QuizOption {
  id: string;
  text?: string;
  card?: CardId;
}

export interface QuizExerciseData {
  type: 'quiz';
  id: string;
  prompt: string;
  cards?: CardId[];
  options: QuizOption[];
  correct: string;
  explain: string;
}

export interface PlayCardExerciseData {
  type: 'playCard';
  id: string;
  prompt: string;
  game: GameType;
  /** Kto wyszedł do lewy; gracz siedzi na miejscu leader + trick.length. */
  leader: Seat;
  trick: CardId[];
  hand: CardId[];
  /** `legal` — wystarczy dozwolona karta; `best` — tylko karty z `best`. */
  mode: 'legal' | 'best';
  best?: CardId[];
  /** Przyciemniaj niedozwolone karty (od lekcji 8). */
  showLegal?: boolean;
  explain: string;
  wrongExplain?: Partial<Record<CardId, string>>;
}

export type ExerciseData = QuizExerciseData | PlayCardExerciseData;

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  steps: TheoryStep[];
  exercises: ExerciseData[];
  /** Ile zadań losować z puli; brak = wszystkie po kolei. */
  drawCount?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  modules: CourseModule[];
}
