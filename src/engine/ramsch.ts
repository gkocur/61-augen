// src/engine/ramsch.ts
import type { Seat } from './game';

export type Triple = [number, number, number];

export interface RamschInput {
  /** Oczka graczy po rozdaniu (skat liczony u gracza, który wziął ostatnią lewę); suma 120. */
  points: Triple;
  /** Liczba wziętych lew; suma 10. */
  tricks: Triple;
  /** Ile razy przekazano skat bez oglądania (Schieberamsch); każde przekazanie podwaja wynik. */
  pushes?: number;
}

export interface RamschResult {
  losers: Seat[];
  /** Gracze bez lewy. */
  jungfrau: Seat[];
  /** Gracz, który wziął wszystkie lewy. */
  durchmarsch: Seat | null;
  scores: Triple;
}

const SEATS: readonly Seat[] = [0, 1, 2];
export const DURCHMARSCH_SCORE = 120;

/** Rozliczenie ramsza (wariant towarzyski — patrz specyfikacja, sekcja 9). */
export function scoreRamsch({ points, tricks, pushes = 0 }: RamschInput): RamschResult {
  const valid =
    [...points, ...tricks, pushes].every((n) => Number.isInteger(n) && n >= 0) &&
    points[0] + points[1] + points[2] === 120 &&
    tricks[0] + tricks[1] + tricks[2] === 10 &&
    pushes <= 3 &&
    SEATS.every((s) => tricks[s] > 0 || points[s] === 0);
  if (!valid) throw new Error('Nieprawidłowy wynik ramsza');

  const jungfrau = SEATS.filter((s) => tricks[s] === 0);
  const durchmarsch = SEATS.find((s) => tricks[s] === 10) ?? null;
  const scores: Triple = [0, 0, 0];
  if (durchmarsch !== null) {
    scores[durchmarsch] = DURCHMARSCH_SCORE;
    return { losers: [], jungfrau, durchmarsch, scores };
  }
  const max = Math.max(...points);
  const tied = SEATS.filter((s) => points[s] === max);
  const losers = tied.length === 3 ? [] : tied;
  const factor = 2 ** (jungfrau.length + pushes);
  for (const s of losers) scores[s] = -points[s] * factor;
  return { losers, jungfrau, durchmarsch: null, scores };
}
