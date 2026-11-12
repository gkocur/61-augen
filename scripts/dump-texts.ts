// scripts/dump-texts.ts
// Użycie: npm run texts [-- <prefiks id lekcji>]   np. npm run texts -- m5-l22
// Drukuje wszystkie teksty lekcji po rozwiązaniu tokenów w 4 kontekstach (talia × rejestr),
// żeby autor mógł sprawdzić gramatykę i słownictwo.
import { COURSE } from '../src/content/course';
import type { ExerciseData, Lesson } from '../src/content/types';
import { resolveText, type TextContext } from '../src/glossary';

const CONTEXTS: { label: string; ctx: TextContext }[] = [
  { label: 'Altenburg / oficjalny', ctx: { deck: 'altenburg', register: 'official' } },
  { label: 'Altenburg / potoczny', ctx: { deck: 'altenburg', register: 'colloquial' } },
  { label: 'francuska / oficjalny', ctx: { deck: 'french', register: 'official' } },
  { label: 'francuska / potoczny', ctx: { deck: 'french', register: 'colloquial' } },
];

function exerciseTexts(ex: ExerciseData): [string, string][] {
  const texts: [string, string][] = [[`${ex.id} pytanie`, ex.prompt], [`${ex.id} wyjaśnienie`, ex.explain]];
  if (ex.type === 'quiz') {
    for (const option of ex.options) if (option.text) texts.push([`${ex.id} odpowiedź ${option.id}`, option.text]);
  }
  if (ex.type === 'playCard') {
    for (const [card, text] of Object.entries(ex.wrongExplain ?? {})) if (text) texts.push([`${ex.id} błąd ${card}`, text]);
  }
  if (ex.type === 'discard' && ex.wrongExplain) texts.push([`${ex.id} błąd`, ex.wrongExplain]);
  return texts;
}

function lessonTexts(lesson: Lesson): [string, string][] {
  const texts: [string, string][] = [['tytuł', lesson.title], ['opis', lesson.summary]];
  lesson.steps.forEach((step, i) => {
    if (step.title) texts.push([`krok ${i + 1} tytuł`, step.title]);
    texts.push([`krok ${i + 1}`, step.text]);
    if (step.cardsCaption) texts.push([`krok ${i + 1} podpis`, step.cardsCaption]);
  });
  for (const ex of lesson.exercises) texts.push(...exerciseTexts(ex));
  return texts;
}

declare const process: { argv: string[] };
const prefix = process.argv[2] ?? '';
for (const lesson of COURSE.modules.flatMap((m) => m.lessons).filter((l) => l.id.startsWith(prefix))) {
  console.log(`\n==================== ${lesson.id} ====================`);
  for (const [where, text] of lessonTexts(lesson)) {
    console.log(`\n--- ${where}`);
    for (const { label, ctx } of CONTEXTS) console.log(`  [${label}] ${resolveText(text, ctx)}`);
  }
}
