// src/play/Controls.test.tsx
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { applyGameAction, startGameDeal, type GameDeal } from '../game';
import { renderWithProviders } from '../test/render';
import { DeclareControls } from './Controls';

/** Ręka (miejsce 0) wygrywa licytację za 24 i podnosi skat. */
function declarerAt24(): GameDeal {
  const steps = [
    [1, { type: 'bid', value: 24 }],
    [0, { type: 'hold' }],
    [1, { type: 'pass' }],
    [2, { type: 'pass' }],
    [0, { type: 'takeSkat' }],
  ] as const;
  let deal = steps.reduce((d, [seat, action]) => applyGameAction(d, seat, action), startGameDeal(3, { kontra: true, ramsch: true }));
  const [a, b] = deal.hands[0];
  deal = applyGameAction(deal, 0, { type: 'discard', cards: [a, b] });
  return deal;
}

describe('zgłoszenie gry', () => {
  it('null poniżej stawki: tylko null otwarty (46)', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderWithProviders(<DeclareControls deal={declarerAt24()} you={0} onAction={onAction} />);
    expect(screen.getByText('Stawka: 24. Jaką grę zgłaszasz?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Null' }));
    const announce = screen.getByRole('radiogroup', { name: 'Zapowiedź' });
    expect(within(announce).getByRole('radio', { name: 'Bez zapowiedzi' })).toBeDisabled();
    expect(within(announce).getByRole('radio', { name: 'Gra otwarta' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Zgłoś grę' }));
    expect(onAction).toHaveBeenCalledWith({ type: 'declare', game: { kind: 'null' }, announce: 'ouvert' });
  });

  it('bez gry z ręki: kolor bez zapowiedzi', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderWithProviders(<DeclareControls deal={declarerAt24()} you={0} onAction={onAction} />);
    expect(screen.getByRole('button', { name: 'Zgłoś grę' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Żołądź' }));
    expect(screen.queryByRole('radiogroup', { name: 'Zapowiedź' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Zgłoś grę' }));
    expect(onAction).toHaveBeenCalledWith({ type: 'declare', game: { kind: 'suit', trump: 'c' }, announce: 'none' });
  });
});
