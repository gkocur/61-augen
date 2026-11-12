// src/cards/cards.test.tsx
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import { storageWithState } from '../test/storage';
import { Hand } from './Hand';
import { OpponentView } from './OpponentView';
import { cardImageUrl, PlayingCard } from './PlayingCard';
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
    await userEvent.setup().click(screen.getByRole('button', { name: 'tuz zielony' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ręka zgłasza kliknięcie karty i zaznacza wybraną', async () => {
    const onCardClick = vi.fn();
    renderWithProviders(<Hand cards={['h-7', 'c-A']} selected="c-A" onCardClick={onCardClick} />);
    expect(screen.getByRole('button', { name: 'tuz żołędny' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(screen.getByRole('button', { name: 'siódemka czerwienna' }));
    expect(onCardClick).toHaveBeenCalledWith('h-7');
  });

  it('stół podpisuje karty miejscami graczy', () => {
    renderWithProviders(<TrickView cards={['h-K', 'h-A']} leader={2} you={0} />);
    expect(screen.getByText('Ostatnia ręka')).toBeInTheDocument();
    expect(screen.getByText('Ty')).toBeInTheDocument();
  });

  it('niedozwolone karty mają opis dla czytników ekranu', () => {
    renderWithProviders(<Hand cards={['h-7']} isDimmed={() => true} onCardClick={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-description', 'niedozwolona');
  });

  it('przeciwnik: miejsce, rola i liczba kart', () => {
    renderWithProviders(<OpponentView seat={1} cardCount={7} isDeclarer active={false} />);
    expect(screen.getByRole('img', { name: 'Środkowa ręka · rozgrywający: 7 kart' })).toBeInTheDocument();
  });

  it('przeciwnik: odmiana liczby kart', () => {
    renderWithProviders(<OpponentView seat={2} cardCount={3} isDeclarer={false} active />);
    expect(screen.getByRole('img', { name: 'Ostatnia ręka: 3 karty' })).toHaveClass('opponent--active');
  });

  it('stół: własny tekst pustego stołu', () => {
    renderWithProviders(<TrickView cards={[]} leader={0} you={1} emptyText="Stół jest pusty." />);
    expect(screen.getByText('Stół jest pusty.')).toBeInTheDocument();
  });

  it('karta pokazuje grafikę wybranej talii', () => {
    renderWithProviders(<PlayingCard card="h-10" />);
    const img = screen.getByRole('img', { name: 'dziesiątka czerwienna' }).querySelector('img');
    expect(img).toHaveAttribute('src', 'cards/altenburg/h-10.svg');
    expect(img).toHaveAttribute('alt', '');
  });

  it('talia francuska: grafika z katalogu french', () => {
    renderWithProviders(<PlayingCard card="c-J" />, { storage: storageWithState({ deck: 'french' }) });
    expect(screen.getByRole('img', { name: 'walet trefl' }).querySelector('img')).toHaveAttribute('src', 'cards/french/c-J.svg');
  });

  it('gdy grafika się nie wczyta, karta rysuje się w kodzie', () => {
    renderWithProviders(<PlayingCard card="h-10" />);
    const card = screen.getByRole('img', { name: 'dziesiątka czerwienna' });
    fireEvent.error(card.querySelector('img')!);
    expect(card.querySelector('img')).toBeNull();
    expect(card.querySelector('svg.card__svg')).not.toBeNull();
  });

  it('w repozytorium są grafiki wszystkich 64 kart', () => {
    const files = Object.keys(import.meta.glob('../../public/cards/*/*.svg'));
    const decks = ['altenburg', 'french'];
    const cards = ['c', 's', 'h', 'd'].flatMap((s) => ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'].map((r) => `${s}-${r}`));
    const expected = decks.flatMap((d) => cards.map((c) => `../../public/cards/${d}/${c}.svg`));
    expect(files.sort()).toEqual(expected.sort());
    expect(cardImageUrl('h-10', 'french')).toBe('cards/french/h-10.svg');
  });
});
