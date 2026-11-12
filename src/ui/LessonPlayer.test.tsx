// src/ui/LessonPlayer.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Lesson } from '../content/types';
import { renderWithProviders } from '../test/render';
import { LessonPlayer } from './LessonPlayer';

const lesson: Lesson = {
  id: 't-l1',
  title: 'Testowa lekcja',
  summary: '',
  steps: [{ title: 'Teoria', text: 'To jest [[skat]].' }],
  exercises: [
    { type: 'quiz', id: 'q1', prompt: 'Pytanie 1', options: [{ id: 'a', text: 'Tak' }, { id: 'b', text: 'Nie' }], correct: 'a', explain: 'E1' },
    { type: 'quiz', id: 'q2', prompt: 'Pytanie 2', options: [{ id: 'a', text: 'Tak' }, { id: 'b', text: 'Nie' }], correct: 'b', explain: 'E2' },
  ],
};

describe('LessonPlayer', () => {
  it('teoria → zadania → zaliczenie', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderWithProviders(<LessonPlayer lesson={lesson} lessonNumber={7} onFinish={onFinish} nextLessonPath="/lekcja/x" />);
    expect(screen.getByRole('heading', { name: 'Lekcja 7: Testowa lekcja' })).toBeInTheDocument();
    expect(screen.getByText('To jest skat.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dalej' }));

    expect(screen.getByText('Zadanie 1 z 2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dalej' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tak' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));

    expect(screen.getByText('Zadanie 2 z 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nie' }));
    await user.click(screen.getByRole('button', { name: 'Zakończ' }));

    expect(onFinish).toHaveBeenCalledWith(1);
    expect(screen.getByRole('heading', { name: 'Lekcja zaliczona!' })).toBeInTheDocument();
    expect(screen.getByText('Wynik: 2 z 2 (100%).')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Następna lekcja' })).toHaveAttribute('href', '/lekcja/x');
  });

  it('niezaliczenie i ponowna próba od zadań', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderWithProviders(<LessonPlayer lesson={lesson} lessonNumber={1} onFinish={onFinish} nextLessonPath={null} />);
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Nie' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Tak' }));
    await user.click(screen.getByRole('button', { name: 'Zakończ' }));

    expect(onFinish).toHaveBeenCalledWith(0);
    expect(screen.getByRole('heading', { name: 'Jeszcze nie tym razem' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Następna lekcja' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(screen.getByText('Zadanie 1 z 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tak' })).toBeEnabled();
  });

  it('powrót do teorii z podsumowania', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LessonPlayer lesson={lesson} lessonNumber={1} onFinish={vi.fn()} nextLessonPath={null} />);
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Nie' }));
    await user.click(screen.getByRole('button', { name: 'Dalej' }));
    await user.click(screen.getByRole('button', { name: 'Tak' }));
    await user.click(screen.getByRole('button', { name: 'Zakończ' }));
    await user.click(screen.getByRole('button', { name: 'Wróć do teorii' }));
    expect(screen.getByText('To jest skat.')).toBeInTheDocument();
  });
});
