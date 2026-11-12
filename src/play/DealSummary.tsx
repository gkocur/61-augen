// src/play/DealSummary.tsx
import type { Seat } from '../engine';
import { rowPoints, playerAt, type GameDeal, type PlayerId } from '../game';
import { countCase, gameLabel } from '../glossary';
import { useText, useTextContext } from '../state/AppStateContext';
import { PLAYER_NAME, signed } from './labels';

interface Props {
  deal: GameDeal;
  dealer: PlayerId;
  you: Seat;
  onNextDeal: () => void;
  onShowTable: () => void;
}


/** Wynik zakończonego rozdania i punkty graczy. */
export function DealSummary({ deal, dealer, you, onNextDeal, onShowTable }: Props) {
  const t = useText();
  const ctx = useTextContext();
  const result = deal.result!;
  const points = rowPoints(result, dealer);
  const name = (seat: Seat) => (seat === you ? 'Ty' : PLAYER_NAME[playerAt(seat, dealer)]);
  const pts = (n: number) => `${n} ${t(`[[oczko:${countCase(n)}]]`)}`;

  return (
    <section className="deal-summary" aria-label="Wynik rozdania">
      <h2>Wynik rozdania</h2>
      {result.kind === 'passedOut' && <p>Wszyscy spasowali — rozdanie przepada.</p>}
      {result.kind === 'ramsch' && (
        <>
          <p>{t('[[Ramsz]]')}: każdy grał na siebie.</p>
          <ul>
            {([0, 1, 2] as Seat[]).map((seat) => (
              <li key={seat}>
                {name(seat)}: {pts(result.points[seat])}
                {result.result.jungfrau.includes(seat) && ` (${t('[[jungfrau]]')})`}
                {result.result.durchmarsch === seat && ` (${t('[[durchmarsch]]')})`}
              </li>
            ))}
          </ul>
        </>
      )}
      {result.kind === 'game' && (
        <>
          <p>
            {t('[[Rozgrywajacy]]')}: {name(result.declarer)} — {gameLabel(result.declaration.game, ctx)}
            {result.declaration.hand && t(', [[reka]]')}
            {result.doubling && `, ${result.doubling}`}.
          </p>
          <p>
            {result.declaration.game.kind === 'null'
              ? `${t('[[Rozgrywajacy]]')} ${result.settlement.won ? `nie wziął ${t('{żadnej lewy|żadnego sztycha}')}` : `wziął ${t('{lewę|sztycha}')}`}.`
              : `${t('[[Oczko:Mlm]] [[rozgrywajacy:D]]')}: ${result.outcome.declarerPoints}.`}
          </p>
          <p>
            <strong>{result.settlement.won ? 'Gra wygrana' : 'Gra przegrana'}</strong>
            {result.settlement.overbid && t(` (${'[[przelicytowanie]]'})`)} — wartość {result.settlement.value}, wynik{' '}
            {signed(result.settlement.score)}.
          </p>
        </>
      )}
      <p className="deal-summary__points">
        Punkty: {([0, 1, 2] as PlayerId[]).map((p) => `${PLAYER_NAME[p]} ${signed(points[p])}`).join(' · ')}
      </p>
      <div className="lesson__actions">
        <button type="button" className="button button--primary" onClick={onNextDeal}>
          Następne rozdanie
        </button>
        <button type="button" className="button" onClick={onShowTable}>
          Tabela wyników
        </button>
      </div>
    </section>
  );
}
