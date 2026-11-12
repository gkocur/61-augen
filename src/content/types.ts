// src/content/types.ts
import type { CardId, Declaration, Doubling, GameType, Hands, PlayOutcome, Seat } from '../engine';

export interface TheoryStep {
  title?: string;
  text: string;
  cards?: CardId[];
  cardsCaption?: string;
}

/** Odpowiedź w quizie: tekst ALBO karta. `value` — wartość maszynowa do sprawdzenia silnikiem (np. '-60', 'z2'). */
export interface QuizOption {
  id: string;
  text?: string;
  card?: CardId;
  value?: string;
}

/**
 * Sprawdzenie poprawnej odpowiedzi silnikiem (w teście treści). Porównywane jest `value ?? text` poprawnej odpowiedzi:
 * - `points`: suma oczek kart z `cards`;
 * - `trickWinner`: odpowiedzi to 3 karty w kolejności zagrania, poprawna bierze lewę w grze `game`;
 * - `matadors`: matadory kart z `cards` w grze `game`, w postaci 'z2' / 'bez3';
 * - `maxBid`: górna granica licytacji dla kart z `cards`;
 * - `nextBid`: stawka następna po `after`;
 * - `trumpCount`: liczba atu wśród kart z `cards` w grze `game`;
 * - `settle`: rozliczenie gry; `cards` = karty rozgrywającego (12, ze skatem; w nullu niepotrzebne);
 *   `result`: 'value' (wartość), 'score' (wynik ±), 'tournament' (punkty turniejowe rozgrywającego).
 */
export type QuizVerify =
  | { kind: 'points' }
  | { kind: 'trickWinner'; game: GameType }
  | { kind: 'matadors'; game: GameType }
  | { kind: 'maxBid'; game: GameType; hand?: boolean }
  | { kind: 'nextBid'; after: number }
  | { kind: 'trumpCount'; game: GameType }
  | { kind: 'settle'; declaration: Declaration; outcome: PlayOutcome; bid?: number; doubling?: Doubling; result: 'value' | 'score' | 'tournament' };

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

/** Wybór 2 kart do wyrzucenia do skata z 12 kart (ręka + podniesiony skat). */
export interface DiscardExerciseData {
  type: 'discard';
  id: string;
  prompt: string;
  /** Gra, którą rozgrywający zamierza zgłosić. */
  game: GameType;
  cards: CardId[];
  /** Dobre pary (kolejność w parze bez znaczenia); pierwsza jest pokazywana jako wzorcowa. */
  best: CardId[][];
  /** Pary też poprawne, ale słabsze od `best` — zaliczone z podpowiedzią lepszej pary. */
  acceptable?: CardId[][];
  explain: string;
  wrongExplain?: string;
}

export type ExerciseData = QuizExerciseData | PlayCardExerciseData | MiniDealExerciseData | DiscardExerciseData;

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
