// src/ui/GlossaryPage.tsx
import { Link } from 'react-router-dom';
import { SUITS } from '../engine';
import { TERMS, formsFor, suitName, type TextContext } from '../glossary';
import { useTextContext } from '../state/AppStateContext';

export function GlossaryPage() {
  const ctx = useTextContext();
  const other: TextContext = { ...ctx, register: ctx.register === 'official' ? 'colloquial' : 'official' };
  const otherLabel = other.register === 'official' ? 'Oficjalnie' : 'Potocznie';
  const rows = Object.entries(TERMS)
    .map(([key, term]) => ({ key, main: formsFor(term, ctx).M, alt: formsFor(term, other).M }))
    .sort((a, b) => a.main.localeCompare(b.main, 'pl'));

  return (
    <div className="glossary">
      <h1>Słowniczek</h1>
      <p>
        Terminy w wybranym języku ({ctx.register === 'official' ? 'oficjalnym' : 'potocznym'}), obok drugi wariant.
        Język i talię zmienisz w <Link to="/ustawienia">ustawieniach</Link>.
      </p>
      <table className="glossary__table">
        <thead>
          <tr>
            <th>Termin</th>
            <th>{otherLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.main}</td>
              <td>{row.alt === row.main ? '—' : row.alt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Kolory</h2>
      <table className="glossary__table">
        <thead>
          <tr>
            <th>Kolor</th>
            <th>{otherLabel}</th>
          </tr>
        </thead>
        <tbody>
          {SUITS.map((suit) => (
            <tr key={suit}>
              <td>{suitName(suit, ctx)}</td>
              <td>{suitName(suit, other) === suitName(suit, ctx) ? '—' : suitName(suit, other)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
