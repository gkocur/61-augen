// src/content/verify.ts
import { isTrump, matadors, maxBidFor, nextBid, settle, sumPoints, tournamentPoints, trickWinner, type CardId } from '../engine';
import type { QuizExerciseData } from './types';

/** Problemy z odpowiedzią quizu sprawdzaną silnikiem (pusta lista = OK). */
export function verifyQuiz(quiz: QuizExerciseData): string[] {
  const verify = quiz.verify;
  const correct = quiz.options.find((option) => option.id === quiz.correct);
  if (!verify || !correct) return [];
  const answer = correct.value ?? correct.text;
  const expect = (expected: string) => (answer === expected ? [] : [`poprawna odpowiedź powinna wynosić ${expected}`]);
  const needCards = (): string[] | null => (quiz.cards ? null : [`verify ${verify.kind} wymaga kart w pytaniu`]);

  try {
    switch (verify.kind) {
      case 'points':
        return needCards() ?? expect(String(sumPoints(quiz.cards!)));
      case 'trickWinner': {
        const cards = quiz.options.map((option) => option.card);
        if (cards.length !== 3 || cards.some((card) => card === undefined)) {
          return ['verify trickWinner wymaga dokładnie 3 odpowiedzi-kart'];
        }
        const trick = cards as CardId[];
        if (new Set(trick).size !== 3) return ['karty w odpowiedziach muszą być różne'];
        const winner = trick[trickWinner(trick, verify.game)];
        return correct.card === winner ? [] : [`lewę bierze ${winner}, a nie ${correct.card}`];
      }
      case 'matadors': {
        if (!quiz.cards) return needCards()!;
        const m = matadors(quiz.cards, verify.game);
        return expect(`${m.with ? 'z' : 'bez'}${m.count}`);
      }
      case 'maxBid':
        return needCards() ?? expect(String(maxBidFor(quiz.cards!, verify.game, verify.hand)));
      case 'trumpCount':
        return needCards() ?? expect(String(quiz.cards!.filter((card) => isTrump(card, verify.game)).length));
      case 'nextBid': {
        const next = nextBid(verify.after);
        return next === null ? [`brak stawki po ${verify.after}`] : expect(String(next));
      }
      case 'settle': {
        if (verify.declaration.game.kind !== 'null' && !quiz.cards) return needCards()!;
        const s = settle({ declaration: verify.declaration, declarerCards: quiz.cards ?? [], outcome: verify.outcome, bid: verify.bid, doubling: verify.doubling });
        const result = verify.result === 'value' ? s.value : verify.result === 'score' ? s.score : tournamentPoints(s).declarer;
        return expect(String(result));
      }
    }
  } catch (error) {
    return [`błąd sprawdzania: ${(error as Error).message}`];
  }
}
