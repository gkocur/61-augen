// src/ui/LessonPage.tsx
import { useParams } from 'react-router-dom';
import { COURSE } from '../content/course';
import { useAppState } from '../state/AppStateContext';
import { flattenLessons, lessonAfter, lessonNumber, lessonStatuses } from '../state/progress';
import { LessonPlayer } from './LessonPlayer';
import { NotFound } from './NotFound';

export function LessonRoute() {
  const { lessonId = '' } = useParams();
  return <LessonPage key={lessonId} lessonId={lessonId} />;
}

function LessonPage({ lessonId }: { lessonId: string }) {
  const { state, recordLessonResult } = useAppState();
  const lesson = flattenLessons(COURSE).find((l) => l.id === lessonId);
  if (!lesson) return <NotFound message="Nie ma takiej lekcji." />;
  if (lessonStatuses(COURSE, state)[lesson.id] === 'locked') {
    return <NotFound message="Ta lekcja jest jeszcze zablokowana." />;
  }
  const next = lessonAfter(COURSE, lesson.id);
  return (
    <LessonPlayer
      lesson={lesson}
      lessonNumber={lessonNumber(COURSE, lesson.id)}
      onFinish={(score) => recordLessonResult(lesson.id, score)}
      nextLessonPath={next ? `/lekcja/${next.id}` : null}
    />
  );
}
