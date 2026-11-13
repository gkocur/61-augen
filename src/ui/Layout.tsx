// src/ui/Layout.tsx
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext';

const NOTICE_TEXT = {
  unavailable: 'Ta przeglądarka nie pozwala zapisać postępu (np. tryb prywatny). Po zamknięciu strony postęp zostanie utracony.',
  corrupted: 'Zapisany postęp był uszkodzony i został wyzerowany.',
} as const;

export function Layout({ children }: { children: ReactNode }) {
  const { notice, dismissNotice } = useAppState();
  const { pathname } = useLocation();
  // Strona główna i stół do gry zajmują całą szerokość okna.
  const wide = pathname === '/' || pathname === '/gra';
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-header__brand">
          Szkat <span className="app-header__sub">trener</span>
        </Link>
        <nav className="app-header__nav">
          <NavLink to="/gra">Gra</NavLink>
          <NavLink to="/slowniczek">Słowniczek</NavLink>
          <NavLink to="/ustawienia">Ustawienia</NavLink>
        </nav>
      </header>
      {notice && (
        <div className="notice" role="alert">
          <p>{NOTICE_TEXT[notice]}</p>
          <button type="button" className="button" onClick={dismissNotice}>
            Zamknij
          </button>
        </div>
      )}
      <main className={`app-main${wide ? ' app-main--wide' : ''}`}>{children}</main>
      <footer className="app-footer">
        <Link to="/o-kartach">O kartach i licencjach</Link>
      </footer>
    </div>
  );
}
