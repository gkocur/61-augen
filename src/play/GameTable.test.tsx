// src/play/GameTable.test.tsx
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { applyGameAction, botAction, gameActor, startGameDeal, type GameDeal } from '../game';
import { renderWithProviders } from '../test/render';
import { GameTable } from './GameTable';

/** Rozgrywa rozdanie ruchami bota za wszystkich, aż warunek będzie spełniony. */
function advanceUntil(seed: number, stop: (d: GameDeal) => boolean): GameDeal | null {
  let deal = startGameDeal(seed, { kontra: true, ramsch: true });
  for (let i = 0; i < 200 && !stop(deal); i++) {
    const actor = gameActor(deal);
    if (actor === null) return null;
    deal = applyGameAction(deal, actor, botAction(deal, actor));
  }
  return stop(deal) ? deal : null;
}

function renderTable(deal: GameDeal) {
  renderWithProviders(
    <GameTable deal={deal} dealNo={1} dealer={2} you={0} onAction={vi.fn()} onNextDeal={vi.fn()} onShowTable={vi.fn()} delayMs={10_000} />,
  );
}

describe('stół gry', () => {
  it('po wczytaniu zapisu w trakcie rozgrywki nie pokazuje starej lewy', () => {
    const deal = advanceUntil(1, (d) => (d.play?.tricks.length ?? 0) === 3 && d.play!.trick.length === 1)!;
    expect(deal).not.toBeNull();
    renderTable(deal);
    expect(screen.queryByText(/Bierzesz|bierze:/)).not.toBeInTheDocument();
  });

  it('gdy bot wyrzuca do skata, twoje karty zostają na stole', () => {
    let deal: GameDeal | null = null;
    for (let seed = 1; seed < 50 && !deal; seed++) deal = advanceUntil(seed, (d) => d.phase === 'discard' && d.declarer !== 0);
    expect(deal).not.toBeNull();
    renderTable(deal!);
    expect(screen.getByRole('list', { name: 'Twoje karty' })).toBeInTheDocument();
  });

  it('w fazie kontry dymki z licytacji znikają', () => {
    let deal: GameDeal | null = null;
    for (let seed = 1; seed < 50 && !deal; seed++) deal = advanceUntil(seed, (d) => d.phase === 'kontra' && d.declarer !== 0);
    expect(deal).not.toBeNull();
    renderTable(deal!);
    expect(document.querySelectorAll('.opponent__speech')).toHaveLength(0);
    expect(screen.queryByText(/Twoja odpowiedź/)).not.toBeInTheDocument();
  });
});
