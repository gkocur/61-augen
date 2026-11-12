// src/ui/CourseMap.tsx
import { Link } from 'react-router-dom';
import { COURSE } from '../content/course';
import type { Lesson } from '../content/types';
import { useAppState, useText } from '../state/AppStateContext';
import { lessonNumber, lessonStatuses, nextLessonId, type LessonStatus } from '../state/progress';

const STATUS_TEXT: Record<LessonStatus, string> = {
  locked: 'Zablokowana',
  available: 'Dostępna',
  passed: 'Zaliczona',
};

export function CourseMap() {
  const { state } = useAppState();
  const t = useText();
  const statuses = lessonStatuses(COURSE, state);
  const nextId = nextLessonId(COURSE, state);
  const started = Object.keys(state.lessons).length > 0;

  return (
    <div className="course-map">
      <h1>Kurs skata</h1>
      {nextId ? (
        <Link className="button button--primary" to={`/lekcja/${nextId}`}>
          {started ? 'Kontynuuj' : 'Zacznij naukę'}
        </Link>
      ) : (
        <p>Ukończono cały kurs. Gratulacje!</p>
      )}
      {COURSE.modules.map((module, moduleIndex) => (
        <section key={module.id} className="module">
          <h2>
            {module.optional ? 'Dodatek' : `Moduł ${COURSE.modules.slice(0, moduleIndex + 1).filter((m) => !m.optional).length}`}: {t(module.title)}
          </h2>
          <ol className="lesson-list">
            {module.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                status={statuses[lesson.id]}
                bestScore={state.lessons[lesson.id]?.bestScore}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function LessonItem({ lesson, status, bestScore }: { lesson: Lesson; status: LessonStatus; bestScore?: number }) {
  const t = useText();
  const body = (
    <>
      <span className="lesson-item__num">{lessonNumber(COURSE, lesson.id)}</span>
      <span className="lesson-item__text">
        <span className="lesson-item__title">{t(lesson.title)}</span>
        <span className="lesson-item__summary">{t(lesson.summary)}</span>
      </span>
      <span className="lesson-item__status">
        {STATUS_TEXT[status]}
        {bestScore !== undefined && ` · ${Math.round(bestScore * 100)}%`}
      </span>
    </>
  );
  return (
    <li className={`lesson-item lesson-item--${status}`}>
      {status === 'locked' ? (
        <div className="lesson-item__body">{body}</div>
      ) : (
        <Link className="lesson-item__body" to={`/lekcja/${lesson.id}`}>
          {body}
        </Link>
      )}
    </li>
  );
}
