// src/play/GamePage.tsx
import { useState } from 'react';
import { DEFAULT_OPTIONS, currentDealNo, dealerOf, seatOf, type GameOptions } from '../game';
import { getBrowserStorage } from '../state/storage';
import { GameTable } from './GameTable';
import { ScoreTable } from './ScoreTable';
import { useGameSeries } from './useGameSeries';

interface Props {
  /** undefined = localStorage przeglądarki; null = brak pamięci (testy). */
  storage?: Storage | null;
  /** Opóźnienie ruchów botów (ms); w testach 0. */
  delayMs?: number;
  /** Źródło ziarna nowej serii (testy). */
  seedSource?: () => number;
}

export function GamePage({ storage, delayMs, seedSource }: Props) {
  const [store] = useState<Storage | null>(() => (storage === undefined ? getBrowserStorage() : storage));
  const game = useGameSeries(store, seedSource);
  const { series } = game;

  const confirmNewSeries = () => {
    if (window.confirm('Zakończyć serię i zacząć nową? Tabela wyników zostanie usunięta.')) game.reset();
  };

  return (
    <div className="game-page">
      <h1>Gra z botami</h1>
      {game.notice === 'corrupted' && (
        <div className="notice" role="alert">
          <p>Zapisana seria była uszkodzona i została usunięta.</p>
          <button type="button" className="button" onClick={game.dismissNotice}>
            Zamknij
          </button>
        </div>
      )}
      {!series && <StartScreen onStart={game.start} />}
      {series?.current && (
        <GameTable
          key={currentDealNo(series)}
          deal={series.current}
          dealNo={currentDealNo(series)}
          dealer={dealerOf(currentDealNo(series))}
          you={seatOf(0, dealerOf(currentDealNo(series)))}
          onAction={game.act}
          onNextDeal={game.nextDeal}
          onShowTable={game.finishDeal}
          delayMs={delayMs}
        />
      )}
      {series?.current && (
        <div className="lesson__actions">
          <button type="button" className="button" onClick={confirmNewSeries}>
            Nowa seria
          </button>
        </div>
      )}
      {series && !series.current && (
        <section className="game-page__score">
          <ScoreTable series={series} />
          <div className="lesson__actions">
            <button type="button" className="button button--primary" onClick={game.nextDeal}>
              {series.rows.length === 0 ? 'Pierwsze rozdanie' : 'Następne rozdanie'}
            </button>
            <button type="button" className="button button--danger" onClick={confirmNewSeries}>
              Nowa seria
            </button>
          </div>
          <p className="hint">
            Zasady serii: kontra i re — {series.options.kontra ? 'tak' : 'nie'}, ramsz po pasach — {series.options.ramsch ? 'tak' : 'nie'}.
          </p>
        </section>
      )}
    </div>
  );
}

function StartScreen({ onStart }: { onStart: (options: GameOptions) => void }) {
  const [options, setOptions] = useState<GameOptions>(DEFAULT_OPTIONS);
  return (
    <section className="game-start">
      <p>
        Trening przy stole z dwoma botami: licytacja, skat, zgłoszenie gry, kontra i rozgrywka. Wyniki zapisują się w tabeli serii (punkty
        Seegera-Fabiana).
      </p>
      <fieldset className="settings__group">
        <legend>Zasady spoza ISkO</legend>
        <label className="settings__option">
          <input type="checkbox" checked={options.kontra} onChange={(e) => setOptions((o) => ({ ...o, kontra: e.target.checked }))} />
          Kontra i re
        </label>
        <label className="settings__option">
          <input type="checkbox" checked={options.ramsch} onChange={(e) => setOptions((o) => ({ ...o, ramsch: e.target.checked }))} />
          Ramsz, gdy wszyscy spasują
        </label>
      </fieldset>
      <button type="button" className="button button--primary" onClick={() => onStart(options)}>
        Zacznij grę
      </button>
    </section>
  );
}
