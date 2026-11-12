// src/exercises/QuizExercise.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { QuizExerciseData } from '../content/types';
import { renderWithProviders } from '../test/render';
import { QuizExercise } from './QuizExercise';

const textQuiz: QuizExerciseData = {
  type: 'quiz',
  id: 't-q1',
  prompt: 'Ile kart ma **[[skat]]**?',
  options: [
    { id: 'a', text: '2' },
    { id: 'b', text: '3' },
  ],
  correct: 'a',
  explain: '[[Skat]] to dwie karty.',
};

const cardQuiz: QuizExerciseData = {
  type: 'quiz',
  id: 't-q2',
  prompt: 'Wskaż [[card:d-J]].',
  options: [
    { id: 'a', card: 'd-J' },
    { id: 'b', card: 'h-J' },
  ],
  correct: 'a',
  explain: 'To [[card:d-J]].',
};

describe('QuizExercise', () => {
  it('pokazuje pytanie z tokenami i pogrubieniem', () => {
    renderWithProviders(<QuizExercise exercise={textQuiz} onAnswered={vi.fn()} />);
    expect(screen.getByText('skat', { selector: 'strong' })).toBeInTheDocument();
  });

  it('dobra odpowiedź: informacja i blokada przycisków', async () => {
    const onAnswered = vi.fn();
    renderWithProviders(<QuizExercise exercise={textQuiz} onAnswered={onAnswered} />);
    await userEvent.setup().click(screen.getByRole('button', { name: '2' }));
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dobrze!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled();
  });

  it('zła odpowiedź: informacja z wyjaśnieniem, jedna ocena', async () => {
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    renderWithProviders(<QuizExercise exercise={textQuiz} onAnswered={onAnswered} />);
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText('Niestety nie.')).toBeInTheDocument();
    expect(screen.getByText('Skat to dwie karty.')).toBeInTheDocument();
  });

  it('odpowiedzi w postaci kart', async () => {
    const onAnswered = vi.fn();
    renderWithProviders(<QuizExercise exercise={cardQuiz} onAnswered={onAnswered} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'niżnik dzwonkowy' }));
    expect(onAnswered).toHaveBeenCalledWith(true);
  });
});
