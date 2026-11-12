import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { AppRoutes } from './App';

describe('strona „O kartach”', () => {
  it('stopka prowadzi do strony z atrybucją obu talii', () => {
    renderWithProviders(<AppRoutes />);
    expect(screen.getByRole('link', { name: 'O kartach i licencjach' })).toHaveAttribute('href', '/o-kartach');
  });

  it('podaje autora, licencję i źródło każdej talii', () => {
    renderWithProviders(<AppRoutes />, { route: '/o-kartach' });
    expect(screen.getByRole('heading', { name: 'O kartach' })).toBeInTheDocument();
    expect(screen.getByText(/Gunter Gerhardt/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CC BY-SA 3.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/3.0/');
    expect(screen.getByText(/Adrian Kennard/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Źródło w Wikimedia Commons' })).toHaveLength(2);
  });
});
