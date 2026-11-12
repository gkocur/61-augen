// src/cards/cards.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import { storageWithState } from '../test/storage';
import { Hand } from './Hand';
import { PlayingCard } from './PlayingCard';
import { TrickView } from './TrickView';

describe('karty', () => {
  it('karta ma nazwę z wybranej talii (domyślnie Altenburg)', () => {
    renderWithProviders(<PlayingCard card="h-10" />);
    expect(screen.getByRole('img', { name: 'dziesiątka czerwienna' })).toBeInTheDocument();
  });

  it('w talii francuskiej nazwy francuskie', () => {
    renderWithProviders(<PlayingCard card="c-J" />, { storage: storageWithState({ deck: 'french' }) });
    expect(screen.getByRole('img', { name: 'walet trefl' })).toBeInTheDocument();
  });

  it('karta z onClick jest przyciskiem', async () => {
    const onClick = vi.fn();
    renderWithProviders(<PlayingCard card="s-A" onClick={onClick} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'as zielony' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ręka zgłasza kliknięcie karty i zaznacza wybraną', async () => {
    const onCardClick = vi.fn();
    renderWithProviders(<Hand cards={['h-7', 'c-A']} selected="c-A" onCardClick={onCardClick} />);
    expect(screen.getByRole('button', { name: 'as żołędny' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(screen.getByRole('button', { name: 'siódemka czerwienna' }));
    expect(onCardClick).toHaveBeenCalledWith('h-7');
  });

  it('stół podpisuje karty miejscami graczy', () => {
    renderWithProviders(<TrickView cards={['h-K', 'h-A']} leader={2} you={0} />);
    expect(screen.getByText('Zadek')).toBeInTheDocument();
    expect(screen.getByText('Ty')).toBeInTheDocument();
  });

  it('niedozwolone karty mają opis dla czytników ekranu', () => {
    renderWithProviders(<Hand cards={['h-7']} isDimmed={() => true} onCardClick={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-description', 'niedozwolona');
  });
});
