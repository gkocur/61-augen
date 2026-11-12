// src/content/types.ts
import type { CardId, GameType, Hands, Seat } from '../engine';

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

/**
 * Sprawdzenie poprawnej odpowiedzi silnikiem (w teście treści):
 * - `points`: tekst poprawnej odpowiedzi = suma oczek kart z `cards`;
 * - `trickWinner`: odpowiedzi to 3 karty w kolejności zagrania, poprawna bierze lewę w grze `game`.
 */
export type QuizVerify = { kind: 'points' } | { kind: 'trickWinner'; game: GameType };

export interface QuizExerciseData {
  type: 'quiz';
  id: string;
  prompt: string;
  cards?: CardId[];
  options: QuizOption[];
  correct: string;
  explain: string;
  verify?: QuizVerify;
}

export interface PlayCardExerciseData {
  type: 'playCard';
  id: string;
  prompt: string;
  game: GameType;
  /** Pokazuj etykietę rodzaju gry (domyślnie tak). */
  showGame?: boolean;
  /** Kto wyszedł do lewy; gracz siedzi na miejscu leader + trick.length. */
  leader: Seat;
  trick: CardId[];
  hand: CardId[];
  /** `legal` — wystarczy dozwolona karta; `best` — tylko karty z `best`. */
  mode: 'legal' | 'best';
  best?: CardId[];
  /** Przyciemniaj niedozwolone karty. */
  showLegal?: boolean;
  explain: string;
  wrongExplain?: Partial<Record<CardId, string>>;
}

/** `win` — twoja strona wygrywa rozdanie (pełne rozdanie); `minPoints` — twoja strona ma co najmniej tyle oczek. */
export type MiniDealGoal = { kind: 'win' } | { kind: 'minPoints'; points: number };

export interface MiniDealExerciseData {
  type: 'miniDeal';
  id: string;
  prompt: string;
  game: GameType;
  declarer: Seat;
  /** Miejsce gracza. */
  you: Seat;
  /** Kto wychodzi do pierwszej lewy (domyślnie przodek). */
  leader?: Seat;
  hands: Hands;
  skat: CardId[];
  /** Zaplanowane karty botów (gracz `you` nie ma skryptu). */
  scripts?: Partial<Record<Seat, CardId[]>>;
  /** Wzorcowe zagrania gracza — test treści sprawdza, że prowadzą do celu. */
  solution: CardId[];
  goal: MiniDealGoal;
  explain: string;
}

export type ExerciseData = QuizExerciseData | PlayCardExerciseData | MiniDealExerciseData;

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
