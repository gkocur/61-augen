// src/content/validate.ts
import { isLegalMove, type CardId } from '../engine';
import { findTextIssues } from '../glossary';
import { simulateMiniDeal } from './miniDeal';
import type {
  Course,
  DiscardExerciseData,
  ExerciseData,
  MiniDealExerciseData,
  PlayCardExerciseData,
  QuizExerciseData,
} from './types';
import { verifyQuiz } from './verify';

type Report = (message: string) => void;
type CheckText = (text: string | undefined) => void;

/** Lista problemów w treści kursu (pusta = OK). Uruchamiana w teście `course.test.ts`. */
export function validateCourse(course: Course): string[] {
  const issues: string[] = [];
  const moduleIds = new Set<string>();
  const lessonIds = new Set<string>();
  const exerciseIds = new Set<string>();

  const checkText = (where: string, text: string | undefined) => {
    if (text === undefined) return;
    for (const issue of findTextIssues(text)) issues.push(`${where}: ${issue}`);
  };

  for (const module of course.modules) {
    if (moduleIds.has(module.id)) issues.push(`Powtórzony moduł: ${module.id}`);
    moduleIds.add(module.id);
    checkText(module.id, module.title);
    if (module.lessons.length === 0) issues.push(`${module.id}: moduł bez lekcji`);

    for (const lesson of module.lessons) {
      if (lessonIds.has(lesson.id)) issues.push(`Powtórzona lekcja: ${lesson.id}`);
      lessonIds.add(lesson.id);
      checkText(lesson.id, lesson.title);
      checkText(lesson.id, lesson.summary);

      lesson.steps.forEach((step, i) => {
        const where = `${lesson.id} krok ${i + 1}`;
        checkText(where, step.title);
        checkText(where, step.text);
        checkText(where, step.cardsCaption);
        if (step.cards) checkUnique(step.cards, (m) => issues.push(`${where}: ${m}`));
      });

      if (lesson.exercises.length === 0) issues.push(`${lesson.id}: brak ćwiczeń`);
      if (lesson.drawCount !== undefined && (lesson.drawCount < 1 || lesson.drawCount > lesson.exercises.length)) {
        issues.push(`${lesson.id}: drawCount poza zakresem`);
      }

      for (const exercise of lesson.exercises) {
        if (exerciseIds.has(exercise.id)) issues.push(`Powtórzone ćwiczenie: ${exercise.id}`);
        exerciseIds.add(exercise.id);
        const where = `${lesson.id}/${exercise.id}`;
        const report: Report = (m) => issues.push(`${where}: ${m}`);
        checkText(where, exercise.prompt);
        checkText(where, exercise.explain);
        validateExercise(exercise, report, (text) => checkText(where, text));
      }
    }
  }
  return issues;
}

function validateExercise(exercise: ExerciseData, report: Report, checkText: CheckText) {
  switch (exercise.type) {
    case 'quiz':
      return validateQuiz(exercise, report, checkText);
    case 'playCard':
      return validatePlayCard(exercise, report, checkText);
    case 'miniDeal':
      return validateMiniDeal(exercise, report);
    case 'discard':
      return validateDiscard(exercise, report, checkText);
    default: {
      const unknown: never = exercise;
      report(`nieznany typ ćwiczenia: ${(unknown as { type: string }).type}`);
    }
  }
}

function validateQuiz(quiz: QuizExerciseData, report: Report, checkText: CheckText) {
  if (quiz.options.length < 2) report('quiz potrzebuje co najmniej 2 odpowiedzi');
  const ids = new Set<string>();
  for (const option of quiz.options) {
    if (ids.has(option.id)) report(`powtórzona odpowiedź ${option.id}`);
    ids.add(option.id);
    if ((option.text === undefined) === (option.card === undefined)) {
      report(`odpowiedź ${option.id} musi mieć tekst albo kartę`);
    }
    checkText(option.text);
  }
  if (!ids.has(quiz.correct)) report(`poprawna odpowiedź „${quiz.correct}” nie istnieje`);
  if (quiz.cards) checkUnique(quiz.cards, report);
  verifyQuiz(quiz).forEach(report);
}

function validatePlayCard(ex: PlayCardExerciseData, report: Report, checkText: CheckText) {
  if (ex.hand.length < 1 || ex.hand.length > 10) report('ręka musi mieć od 1 do 10 kart');
  if (ex.trick.length > 2) report('na stole mogą leżeć najwyżej 2 karty');
  checkUnique([...ex.trick, ...ex.hand], report);
  if (ex.mode === 'best') {
    if (!ex.best || ex.best.length === 0) report('tryb best wymaga listy najlepszych kart');
    for (const card of ex.best ?? []) {
      if (!ex.hand.includes(card)) report(`najlepsza karta ${card} nie jest w ręce`);
      else if (!isLegalMove(card, ex.hand, ex.trick, ex.game)) report(`najlepsza karta ${card} jest niedozwolona`);
    }
  }
  for (const [card, text] of Object.entries(ex.wrongExplain ?? {})) {
    if (!ex.hand.includes(card as CardId)) report(`wrongExplain dla karty spoza ręki: ${card}`);
    checkText(text);
  }
}

function validateMiniDeal(ex: MiniDealExerciseData, report: Report) {
  const size = ex.hands[0].length;
  if (size < 1 || size > 10 || ex.hands.some((hand) => hand.length !== size)) {
    report('ręce muszą mieć tyle samo kart (1–10)');
  }
  if (ex.skat.length > 2) report('skat ma najwyżej 2 karty');
  if (ex.goal.kind === 'win' && size !== 10) report('cel „win” wymaga pełnego rozdania (10 kart)');
  checkUnique([...ex.hands.flat(), ...ex.skat], report);
  if (ex.scripts?.[ex.you]) report('gracz nie może mieć skryptu');
  for (const seat of [0, 1, 2] as const) {
    for (const card of ex.scripts?.[seat] ?? []) {
      if (!ex.hands[seat].includes(card)) report(`skrypt gracza ${seat}: karty ${card} nie ma w ręce`);
    }
  }
  const outcome = simulateMiniDeal(ex);
  if (outcome.error) report(outcome.error);
  else if (!outcome.goalReached) report('wzorcowe rozegranie nie osiąga celu');
}

function validateDiscard(ex: DiscardExerciseData, report: Report, checkText: CheckText) {
  if (ex.cards.length !== 12) report('do wyrzucania potrzeba 12 kart (ręka + skat)');
  checkUnique(ex.cards, report);
  if (ex.best.length === 0) report('brak dobrych par do wyrzucenia');
  for (const pair of ex.best) {
    if (pair.length !== 2 || pair[0] === pair[1]) report(`zła para: ${pair.join(', ')}`);
    for (const card of pair) if (!ex.cards.includes(card)) report(`karta ${card} z pary nie jest w ręce`);
  }
  checkText(ex.wrongExplain);
}

function checkUnique(cards: readonly CardId[], report: Report) {
  const seen = new Set<CardId>();
  for (const card of cards) {
    if (seen.has(card)) report(`karta ${card} występuje więcej niż raz`);
    seen.add(card);
  }
}
