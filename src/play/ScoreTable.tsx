// src/play/ScoreTable.tsx
import { totals, type PlayerId, type Series } from '../game';
import { useText } from '../state/AppStateContext';
import { PLAYER_NAME, gameShortName, signed } from './labels';

const PLAYERS: PlayerId[] = [0, 1, 2];

/** Tabela serii: punkty Seegera-Fabiana (w ramszu — wynik ramsza). */
export function ScoreTable({ series }: { series: Series }) {
  const t = useText();
  const sum = totals(series);
  if (series.rows.length === 0) return <p>Nie ma jeszcze zakończonych rozdań.</p>;
  return (
    <div className="score-table__wrap">
      <table className="score-table">
        <caption>Tabela wyników</caption>
        <thead>
          <tr>
            <th scope="col">Nr</th>
            <th scope="col">Gra</th>
            {PLAYERS.map((p) => (
              <th key={p} scope="col">
                {PLAYER_NAME[p]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.rows.map((row) => {
            const r = row.result;
            const what =
              r.kind === 'game'
                ? `${gameShortName(r.declaration.game, t)} (${PLAYER_NAME[row.declarer!]}) ${signed(r.settlement.score)}`
                : r.kind === 'ramsch'
                  ? t('[[Ramsz]]')
                  : 'Pas';
            return (
              <tr key={row.dealNo}>
                <th scope="row">{row.dealNo}</th>
                <td>
                  {what}
                  {row.undo && <span className="score-table__undo"> (z cofaniem)</span>}
                </td>
                {PLAYERS.map((p) => (
                  <td key={p}>{signed(row.points[p])}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}>
              Suma
            </th>
            {PLAYERS.map((p) => (
              <td key={p}>{signed(sum[p])}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
