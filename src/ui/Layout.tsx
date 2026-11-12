// src/ui/Layout.tsx
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext';

const NOTICE_TEXT = {
  unavailable: 'Ta przeglądarka nie pozwala zapisać postępu (np. tryb prywatny). Po zamknięciu strony postęp zostanie utracony.',
  corrupted: 'Zapisany postęp był uszkodzony i został wyzerowany.',
} as const;

export function Layout({ children }: { children: ReactNode }) {
  const { notice, dismissNotice } = useAppState();
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-header__brand">
          Trener skata
        </Link>
        <nav className="app-header__nav">
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
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <Link to="/o-kartach">O kartach i licencjach</Link>
      </footer>
    </div>
  );
}
