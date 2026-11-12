# Trener skata — Plan 8: ekrany gry z botami

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Cel:** interfejs trybu „gra z botami” na silniku z Planu 7. Obejmuje:
- pozycję „Gra” w menu i trasę `/gra`;
- ekran startowy z zasadami serii;
- stół ze wszystkimi fazami rozdania (licytacja, skat, wyrzucanie, zgłoszenie, kontra/re, rozgrywka, ramsz);
- podsumowanie rozdania i tabelę wyników serii.

Pomoce treningowe (podpowiedź, licznik, cofanie, przegląd) i E2E gry to Plan 9. Spec: `docs/superpowers/specs/2026-11-12-gra-z-botami-design.md` (sekcja 7).

**Architektura:**
- **Nowy katalog `src/play/`:**
  - `useGameSeries` trzyma serię w stanie Reacta i zapisuje ją do pamięci przeglądarki (moduł `game/storage`);
  - `GameTable` pokazuje rozdanie i uruchamia boty z opóźnieniem;
  - `Controls` to paski akcji dla każdej fazy;
  - `DealSummary` i `ScoreTable` pokazują wynik rozdania i tabelę serii;
  - `GamePage` to strona trasy `/gra`.
- **Logika gry:** cała zostaje w `src/game/`. UI tylko woła `applyGameAction` (przez `act`) i `botAction`.
- **Teksty:** przez słownik (tokeny), więc działają w obu rejestrach i dla obu talii.
- **Gracze:** „Ty”, „Bot z lewej”, „Bot z prawej” (`PlayerId` 0, 1, 2). Miejsce w rozdaniu (ręka, środkowa, ostatnia) zmienia się z rozdającym.

**Stos:** React 18, TypeScript 5 (strict), Vitest + RTL + user-event.

**Zweryfikowane przy pisaniu planu:**
- **Kopia repozytorium:** 316 testów przechodzi (301 dotychczasowych i 15 nowych), `tsc`, build i E2E są czyste.
- **Przeglądarka, 375 px:**
  - pełne rozdanie: licytacja (boty pasują, „Gram za 18”), podniesienie skata, wyrzucenie 2 kart, zgłoszenie, rozgrywka, podsumowanie i tabela;
  - drugie rozdanie z twoim pasem i ramszem.
- **Ziarna do testów:** ziarno 3 sprawia, że oba boty pasują, a ty na ręku decydujesz o grze za 18. Przy ziarnie 1 bot na środkowym ręku licytuje.

**Konwencje:** testy pisane w rejestrze oficjalnym (pomocnik `renderWithProviders`). Każdy commit kończy się linią `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

## Struktura plików (Plan 8)

```
src/cards/OpponentView.tsx     ZMIANA: opcjonalne `player` (nazwa gracza) i `speech` (dymek z wypowiedzią)
src/play/labels.ts             NOWY: nazwy graczy, krótkie nazwy gier, wypowiedzi, liczby ze znakiem
src/play/useGameSeries.ts      NOWY: stan serii + zapis
src/play/Controls.tsx          NOWY: licytacja, skat, wyrzucanie, zgłoszenie, kontra/re
src/play/GameTable.tsx         NOWY: stół rozdania, boty z opóźnieniem, ręka
src/play/DealSummary.tsx       NOWY: wynik rozdania
src/play/ScoreTable.tsx        NOWY: tabela serii
src/play/GamePage.tsx          NOWY: strona /gra (start, stół, tabela)
src/ui/App.tsx, src/ui/Layout.tsx  ZMIANA: trasa /gra, „Gra” w menu
src/styles.css                 ZMIANA: style gry
```

---

### Task 1: Etykiety, przeciwnik z dymkiem i stan serii

**Pliki:**
- Utwórz: `src/play/labels.ts`, `src/play/labels.test.ts`, `src/play/useGameSeries.ts`
- Modyfikuj: `src/cards/OpponentView.tsx`, `src/cards/cards.test.tsx`

- [ ] **Step 1: Testy**

Utwórz `src/play/labels.test.ts`:

```ts
// src/play/labels.test.ts
import { describe, expect, it } from 'vitest';
import { resolveText } from '../glossary';
import { gameShortName, signed, speechText } from './labels';

const official = (text: string) => resolveText(text, { deck: 'altenburg', register: 'official' });
const colloquial = (text: string) => resolveText(text, { deck: 'french', register: 'colloquial' });

describe('etykiety gry', () => {
  it('liczba ze znakiem i prawdziwym minusem', () => {
    expect([signed(80), signed(-110), signed(0)]).toEqual(['+80', '−110', '0']);
  });

  it('krótkie nazwy gier z wielką literą', () => {
    expect(gameShortName({ kind: 'suit', trump: 'h' }, official)).toBe('Czerwień');
    expect(gameShortName({ kind: 'suit', trump: 'c' }, colloquial)).toBe('Krojc');
    expect(gameShortName({ kind: 'grand' }, official)).toBe('Grand');
    expect(gameShortName({ kind: 'ramsch' }, official)).toBe('Ramsz');
  });

  it('wypowiedzi w licytacji i przy kontrze', () => {
    expect(speechText({ type: 'bid', value: 20 }, false)).toBe('20');
    expect(speechText({ type: 'hold' }, false)).toBe('tak');
    expect(speechText({ type: 'pass' }, false)).toBe('pas');
    expect(speechText({ type: 'double' }, false)).toBe('kontra');
    expect(speechText({ type: 'double' }, true)).toBe('re');
    expect(speechText({ type: 'noDouble' }, false)).toBe('bez kontry');
    expect(speechText({ type: 'noDouble' }, true)).toBe('bez re');
    expect(speechText({ type: 'takeSkat' }, false)).toBeUndefined();
  });
});
```

W `src/cards/cards.test.tsx` dopisz test (przed testem „przeciwnik: odmiana liczby kart”):

```tsx
  it('przeciwnik: nazwa gracza i dymek z wypowiedzią', () => {
    renderWithProviders(<OpponentView seat={1} cardCount={10} isDeclarer={false} active={false} player="Bot z lewej" speech="pas" />);
    expect(screen.getByRole('img', { name: 'Bot z lewej · Środkowa ręka: 10 kart' })).toBeInTheDocument();
    expect(screen.getByText('pas')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/play src/cards`
Expected: FAIL (brak `./labels`, `OpponentView` nie zna `player`/`speech`).

- [ ] **Step 3: Implementacja**

`src/cards/OpponentView.tsx` (diff):

```diff
diff --git a/src/cards/OpponentView.tsx b/src/cards/OpponentView.tsx
index 940f77a..a5b40b1 100644
--- a/src/cards/OpponentView.tsx
+++ b/src/cards/OpponentView.tsx
@@ -11,11 +11,15 @@ interface Props {
   isDeclarer: boolean;
   /** Ten gracz jest teraz na ruchu. */
   active: boolean;
+  /** Nazwa gracza przed pozycją (np. „Bot z lewej”). */
+  player?: string;
+  /** Ostatnia wypowiedź (np. „18”, „pas”) — pokazywana w dymku. */
+  speech?: string;
 }
 
-export function OpponentView({ seat, cardCount, isDeclarer, active }: Props) {
+export function OpponentView({ seat, cardCount, isDeclarer, active, player, speech }: Props) {
   const t = useText();
-  const name = t(SEAT_LABEL[seat]) + (isDeclarer ? t(' · [[rozgrywajacy]]') : '');
+  const name = (player ? `${player} · ` : '') + t(SEAT_LABEL[seat]) + (isDeclarer ? t(' · [[rozgrywajacy]]') : '');
   const count = `${cardCount} ${pluralPl(cardCount, ['karta', 'karty', 'kart'])}`;
   return (
     <div className={`opponent${active ? ' opponent--active' : ''}`} role="img" aria-label={`${name}: ${count}`}>
@@ -28,6 +32,11 @@ export function OpponentView({ seat, cardCount, isDeclarer, active }: Props) {
         </span>
         <span className="opponent__count">{cardCount}</span>
       </span>
+      {speech && (
+        <span className="opponent__speech" aria-hidden="true">
+          {speech}
+        </span>
+      )}
     </div>
   );
 }
```

Utwórz `src/play/labels.ts`:

```ts
// src/play/labels.ts
import type { GameType } from '../engine';
import type { GameAction, PlayerId } from '../game';

export const PLAYER_NAME: Record<PlayerId, string> = { 0: 'Ty', 1: 'Bot z lewej', 2: 'Bot z prawej' };

/** Liczba ze znakiem: +80, −110, 0. */
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Krótka nazwa gry (tokeny słownika): kolor atu, Grand, Null, Ramsz. */
export function gameShortName(game: GameType, t: (text: string) => string): string {
  switch (game.kind) {
    case 'suit':
      return upperFirst(t(`[[suit:${game.trump}]]`));
    case 'grand':
      return t('[[Grand]]');
    case 'null':
      return t('[[Null]]');
    case 'ramsch':
      return t('[[Ramsz]]');
  }
}

/** Tekst wypowiedzi w dymku przy graczu (licytacja, kontra/re). */
export function speechText(action: GameAction, kontraSaid: boolean): string | undefined {
  switch (action.type) {
    case 'bid':
      return String(action.value);
    case 'hold':
      return 'tak';
    case 'pass':
      return 'pas';
    case 'double':
      return kontraSaid ? 're' : 'kontra';
    case 'noDouble':
      return kontraSaid ? 'bez re' : 'bez kontry';
    default:
      return undefined;
  }
}
```

Utwórz `src/play/useGameSeries.ts`. Hook jest testowany przez stronę w Task 3: każdy błędny albo spóźniony ruch (np. bot po zmianie rozdania) jest pomijany, a seria zapisuje się po każdej zmianie.

```ts
// src/play/useGameSeries.ts
import { useCallback, useEffect, useState } from 'react';
import type { Seat } from '../engine';
import {
  applyGameAction,
  clearSeries,
  finishCurrentDeal,
  loadSeries,
  newSeries,
  saveSeries,
  startNextDeal,
  type GameAction,
  type GameOptions,
  type Series,
} from '../game';

export interface GameSeriesApi {
  series: Series | null;
  notice: 'corrupted' | null;
  dismissNotice: () => void;
  /** Nowa seria z pierwszym rozdaniem. */
  start: (options: GameOptions) => void;
  /** Ruch gracza albo bota w bieżącym rozdaniu (ruch nieaktualny — np. spóźniony bot — jest pomijany). */
  act: (seat: Seat, action: GameAction) => void;
  /** Zapisuje zakończone rozdanie w tabeli i zaczyna następne. */
  nextDeal: () => void;
  /** Zapisuje zakończone rozdanie w tabeli (bez rozpoczynania następnego). */
  finishDeal: () => void;
  /** Kończy serię (zapis usunięty, powrót do ekranu startowego). */
  reset: () => void;
}

const randomSeed = () => Math.floor(Math.random() * 0x100000000);

export function useGameSeries(storage: Storage | null, seedSource: () => number = randomSeed): GameSeriesApi {
  const [initial] = useState(() => loadSeries(storage));
  const [series, setSeries] = useState<Series | null>(initial.series);
  const [notice, setNotice] = useState(initial.notice);

  useEffect(() => {
    if (series) saveSeries(storage, series);
    else clearSeries(storage);
  }, [storage, series]);

  const start = useCallback((options: GameOptions) => setSeries(startNextDeal(newSeries(seedSource(), options))), [seedSource]);

  const act = useCallback((seat: Seat, action: GameAction) => {
    setSeries((s) => {
      if (!s?.current) return s;
      try {
        return { ...s, current: applyGameAction(s.current, seat, action) };
      } catch {
        return s;
      }
    });
  }, []);

  const finishIfDone = (s: Series) => (s.current?.phase === 'done' ? finishCurrentDeal(s) : s);
  const nextDeal = useCallback(() => setSeries((s) => (s ? startNextDeal(finishIfDone(s)) : s)), []);
  const finishDeal = useCallback(() => setSeries((s) => (s ? finishIfDone(s) : s)), []);
  const reset = useCallback(() => setSeries(null), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  return { series, notice, dismissNotice, start, act, nextDeal, finishDeal, reset };
}
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/play src/cards && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/play src/cards
git commit -m "feat(play): etykiety gry, przeciwnik z dymkiem, stan serii

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Paski akcji dla faz rozdania

**Pliki:**
- Utwórz: `src/play/Controls.tsx`, `src/play/Controls.test.tsx`

Pasek zgłoszenia blokuje nulla, gdy jego wartość jest niższa od stawki (ISkO 3.6). Przy stawce 24 zostaje więc tylko null otwarty (46). Zapowiedzi pokazują się tylko przy grze z ręki albo przy nullu (null otwarty).

- [ ] **Step 1: Testy**

Utwórz `src/play/Controls.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/play/Controls.test.tsx`
Expected: FAIL (brak `./Controls`).

- [ ] **Step 3: Implementacja**

Utwórz `src/play/Controls.tsx`:

```tsx
// src/play/Controls.tsx
import { useState } from 'react';
import { PlayingCard } from '../cards/PlayingCard';
import { SUITS, nullValue, sortHand, type Announcement, type CardId, type GameType, type Seat } from '../engine';
import { FIRST_BID, allowedBids, type GameAction, type GameDeal } from '../game';
import { useText } from '../state/AppStateContext';
import { gameShortName } from './labels';

interface ControlsProps {
  deal: GameDeal;
  you: Seat;
  onAction: (action: GameAction) => void;
}

/** Przyciski licytacji: kolejna stawka / „tak” / „pas” (albo „gram za 18” w ostatnim etapie). */
export function BiddingControls({ deal, onAction }: ControlsProps) {
  const a = deal.auction;
  const pass = (
    <button type="button" className="button" onClick={() => onAction({ type: 'pass' })}>
      Pas
    </button>
  );
  if (a.stage === 3) {
    return (
      <div className="game-bar" role="group" aria-label="Licytacja">
        <p className="game-bar__info">Nikt nie licytował. Możesz zagrać za {FIRST_BID} albo spasować.</p>
        <button type="button" className="button button--primary" onClick={() => onAction({ type: 'bid', value: FIRST_BID })}>
          Gram za {FIRST_BID}
        </button>
        {pass}
      </div>
    );
  }
  if (a.turn === 'listener') {
    return (
      <div className="game-bar" role="group" aria-label="Licytacja">
        <button type="button" className="button button--primary" onClick={() => onAction({ type: 'hold' })}>
          Tak ({a.highest})
        </button>
        {pass}
      </div>
    );
  }
  const next = allowedBids(a)[0];
  return (
    <div className="game-bar" role="group" aria-label="Licytacja">
      {next !== undefined && (
        <button type="button" className="button button--primary" onClick={() => onAction({ type: 'bid', value: next })}>
          Mówię {next}
        </button>
      )}
      {pass}
    </div>
  );
}

/** Podniesienie skata albo gra z ręki. */
export function SkatControls({ onAction }: ControlsProps) {
  const t = useText();
  return (
    <div className="game-bar" role="group" aria-label={t('[[Skat]]')}>
      <button type="button" className="button button--primary" onClick={() => onAction({ type: 'takeSkat' })}>
        {t('Podnieś [[skat:B]]')}
      </button>
      <button type="button" className="button" onClick={() => onAction({ type: 'playHand' })}>
        {t('{Graj z ręki|Graj handa}')}
      </button>
    </div>
  );
}

/** Wybór 2 kart z 12 do wyrzucenia do skata. */
export function DiscardControls({ deal, you, onAction }: ControlsProps) {
  const t = useText();
  const [selected, setSelected] = useState<CardId[]>([]);
  const cards = sortHand(deal.hands[you], { kind: 'grand' });
  const toggle = (card: CardId) =>
    setSelected((cur) => (cur.includes(card) ? cur.filter((c) => c !== card) : cur.length < 2 ? [...cur, card] : cur));
  return (
    <div className="game-bar game-bar--column" role="group" aria-label={t('Wyrzucanie do [[skat:D]]')}>
      <p className="game-bar__info">{t('Wybierz 2 karty do [[skat:D]].')}</p>
      <ul className="card-row" aria-label="Twoje karty">
        {cards.map((card) => (
          <li key={card}>
            <PlayingCard card={card} selected={selected.includes(card)} onClick={() => toggle(card)} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="button button--primary"
        disabled={selected.length !== 2}
        onClick={() => selected.length === 2 && onAction({ type: 'discard', cards: [selected[0], selected[1]] })}
      >
        {t('Wyrzuć do [[skat:D]]')}
      </button>
    </div>
  );
}

const GAMES: GameType[] = [...SUITS.map((trump) => ({ kind: 'suit', trump }) as GameType), { kind: 'grand' }, { kind: 'null' }];
const sameGame = (a: GameType, b: GameType) => JSON.stringify(a) === JSON.stringify(b);

/** Zgłoszenie gry: rodzaj gry, a przy grze z ręki także zapowiedź. */
export function DeclareControls({ deal, onAction }: ControlsProps) {
  const t = useText();
  const [game, setGame] = useState<GameType | null>(null);
  const [announce, setAnnounce] = useState<Announcement>('none');
  const bid = deal.bid!;
  const nullAllowed = (a: Announcement) => nullValue({ game: { kind: 'null' }, hand: deal.hand, announce: a }) >= bid;
  const announcements: { value: Announcement; label: string }[] =
    game?.kind === 'null'
      ? [
          { value: 'none', label: 'Bez zapowiedzi' },
          { value: 'ouvert', label: t('[[Otwarta]]') },
        ]
      : [
          { value: 'none', label: 'Bez zapowiedzi' },
          { value: 'schneider', label: t('[[Krawiec]]') },
          { value: 'schwarz', label: t('[[Czarny]]') },
          { value: 'ouvert', label: t('[[Otwarta]]') },
        ];
  const showAnnounce = game !== null && (deal.hand || game.kind === 'null');
  const valid = game !== null && (game.kind !== 'null' || nullAllowed(announce));

  const choose = (g: GameType) => {
    setGame(g);
    if (g.kind === 'null') setAnnounce(nullAllowed('none') ? 'none' : 'ouvert');
    else if (!deal.hand) setAnnounce('none');
    else setAnnounce((a) => a);
  };

  return (
    <div className="game-bar game-bar--column" role="group" aria-label="Zgłoszenie gry">
      <p className="game-bar__info">Stawka: {bid}. Jaką grę zgłaszasz?</p>
      <div className="game-bar__choices">
        {GAMES.map((g) => {
          const disabled = g.kind === 'null' && !nullAllowed('none') && !nullAllowed('ouvert');
          return (
            <button
              key={JSON.stringify(g)}
              type="button"
              className={`option${game && sameGame(game, g) ? ' option--chosen' : ''}`}
              aria-pressed={game !== null && sameGame(game, g)}
              disabled={disabled}
              onClick={() => choose(g)}
            >
              {gameShortName(g, t)}
            </button>
          );
        })}
      </div>
      {showAnnounce && (
        <div className="game-bar__choices" role="radiogroup" aria-label="Zapowiedź">
          {announcements.map((a) => (
            <label key={a.value} className="settings__option">
              <input
                type="radio"
                name="announce"
                checked={announce === a.value}
                disabled={game?.kind === 'null' ? !nullAllowed(a.value) : !deal.hand && a.value !== 'none'}
                onChange={() => setAnnounce(a.value)}
              />
              {a.label}
            </label>
          ))}
        </div>
      )}
      <button
        type="button"
        className="button button--primary"
        disabled={!valid}
        onClick={() => game && onAction({ type: 'declare', game, announce: game.kind === 'null' || deal.hand ? announce : 'none' })}
      >
        Zgłoś grę
      </button>
    </div>
  );
}

/** Kontra (obrońca) albo re (rozgrywający po kontrze). */
export function KontraControls({ deal, you, onAction }: ControlsProps) {
  const isDeclarer = you === deal.declarer;
  return (
    <div className="game-bar" role="group" aria-label="Kontra i re">
      <button type="button" className="button" onClick={() => onAction({ type: 'double' })}>
        {isDeclarer ? 'Re' : 'Kontra'}
      </button>
      <button type="button" className="button button--primary" onClick={() => onAction({ type: 'noDouble' })}>
        {isDeclarer ? 'Bez re' : 'Bez kontry'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Uruchom testy**

Run: `npx vitest run src/play && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/play
git commit -m "feat(play): paski akcji — licytacja, skat, wyrzucanie, zgłoszenie, kontra/re

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Stół, wynik rozdania, tabela serii i strona `/gra`

**Pliki:**
- Utwórz: `src/play/GameTable.tsx`, `src/play/DealSummary.tsx`, `src/play/ScoreTable.tsx`, `src/play/GamePage.tsx`, `src/play/GamePage.test.tsx`
- Modyfikuj: `src/ui/App.tsx`, `src/ui/Layout.tsx`, `src/ui/App.test.tsx`, `src/styles.css`

Zachowanie stołu (wzorowane na mini-rozdaniu z lekcji):
- **Boty:** ruszają po `delayMs`.
- **Zakończona lewa:** jest widoczna przez 1,5 × `delayMs`. W tym czasie nikt nie gra.
- **Zagranie karty:** pierwsze dotknięcie wybiera kartę, drugie ją zagrywa.
- **Niedozwolona karta:** pokazuje podpowiedź.
- **Licytacja i kontra:** przy przeciwnikach w dymkach pokazują się ich wypowiedzi.
- **Koniec rozdania:** podsumowanie, przyciski „Następne rozdanie” i „Tabela wyników” oraz odkryty skat.

- [ ] **Step 1: Testy**

Utwórz `src/play/GamePage.test.tsx`:

```tsx
// src/play/GamePage.test.tsx
import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GAME_STORAGE_KEY } from '../game';
import { renderWithProviders } from '../test/render';
import { createMemoryStorage } from '../test/storage';
import { GamePage } from './GamePage';

/** Ziarno 3: oba boty pasują, a ty (na ręku) decydujesz o grze za 18. Ziarno 1: bot na środkowym ręku licytuje. */
const BOTS_PASS = () => 3;
const BOT_BIDS = () => 1;

function renderGame(seedSource: () => number, storage: Storage = createMemoryStorage()) {
  renderWithProviders(<GamePage storage={storage} delayMs={0} seedSource={seedSource} />);
  return storage;
}

const tick = () => act(() => new Promise<void>((r) => setTimeout(r, 0)));

/** Rozgrywa rozdanie do końca: klika pierwszą dozwoloną kartę, a na kontrę/re odpowiada „bez”. */
async function playOut() {
  for (let i = 0; i < 400; i++) {
    if (screen.queryByRole('region', { name: 'Wynik rozdania' })) return;
    const noDouble = screen.queryByRole('button', { name: /^Bez (kontry|re)$/ });
    if (noDouble) fireEvent.click(noDouble);
    const list = screen.queryByRole('list', { name: 'Twoje karty' });
    const card = list
      ? within(list)
          .queryAllByRole('button')
          .find((b) => !b.hasAttribute('disabled') && b.getAttribute('aria-description') !== 'niedozwolona')
      : undefined;
    if (card) {
      fireEvent.click(card);
      fireEvent.click(card);
    }
    await tick();
  }
  throw new Error('Rozdanie się nie skończyło');
}

afterEach(() => vi.restoreAllMocks());

describe('gra z botami', () => {
  it('ekran startowy: zasady serii i start pierwszego rozdania', async () => {
    const user = userEvent.setup();
    renderGame(BOTS_PASS);
    expect(screen.getByRole('heading', { name: 'Gra z botami' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Kontra i re' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Ramsz, gdy wszyscy spasują' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    expect(screen.getByText(/Rozdanie 1 · Siedzisz na ręku/)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Gram za 18' })).toBeInTheDocument();
    expect(screen.getAllByText('pas')).toHaveLength(2);
    expect(within(screen.getByRole('list', { name: 'Twoje karty' })).getAllByRole('button')).toHaveLength(10);
  });

  it('licytacja: bot mówi stawkę, ty odpowiadasz „tak” albo „pas”', async () => {
    const user = userEvent.setup();
    renderGame(BOT_BIDS);
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    expect(await screen.findByRole('button', { name: 'Tak (18)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pas' })).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('pełne rozdanie: skat, wyrzucenie, zgłoszenie, rozgrywka, wynik i tabela; seria przetrwa odświeżenie', async () => {
    const user = userEvent.setup();
    const storage = renderGame(BOTS_PASS);
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Gram za 18' }));
    await user.click(screen.getByRole('button', { name: 'Podnieś skat' }));
    const discard = screen.getByRole('group', { name: 'Wyrzucanie do skata' });
    const twelve = within(discard).getAllByRole('button').filter((b) => b.classList.contains('card'));
    expect(twelve).toHaveLength(12);
    const wyrzuc = within(discard).getByRole('button', { name: 'Wyrzuć do skata' });
    expect(wyrzuc).toBeDisabled();
    await user.click(twelve[10]);
    await user.click(twelve[11]);
    await user.click(wyrzuc);
    await user.click(screen.getByRole('button', { name: 'Czerwień' }));
    await user.click(screen.getByRole('button', { name: 'Zgłoś grę' }));
    expect(await screen.findByText('Gra kolorowa · atu: czerwień')).toBeInTheDocument();
    await playOut();
    const summary = screen.getByRole('region', { name: 'Wynik rozdania' });
    expect(within(summary).getByText(/Rozgrywający: Ty/)).toBeInTheDocument();
    await user.click(within(summary).getByRole('button', { name: 'Tabela wyników' }));
    const table = screen.getByRole('table', { name: 'Tabela wyników' });
    expect(within(table).getByRole('rowheader', { name: '1' })).toBeInTheDocument();
    expect(within(table).getByText(/Czerwień \(Ty\)/)).toBeInTheDocument();
    expect(storage.getItem(GAME_STORAGE_KEY)).not.toBeNull();

    // „Odświeżenie strony”: nowy komponent z tą samą pamięcią.
    document.body.innerHTML = '';
    renderGame(BOTS_PASS, storage);
    expect(screen.getByRole('table', { name: 'Tabela wyników' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Następne rozdanie' })).toBeInTheDocument();
  });

  it('gra z ręki: zapowiedzi do wyboru', async () => {
    const user = userEvent.setup();
    renderGame(BOTS_PASS);
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Gram za 18' }));
    await user.click(screen.getByRole('button', { name: 'Graj z ręki' }));
    await user.click(screen.getByRole('button', { name: 'Grand' }));
    const announce = screen.getByRole('radiogroup', { name: 'Zapowiedź' });
    await user.click(within(announce).getByRole('radio', { name: 'Krawiec' }));
    await user.click(screen.getByRole('button', { name: 'Zgłoś grę' }));
    expect(await screen.findByText(/stawka 18 .*gra z ręki/)).toBeInTheDocument();
  });

  it('wszyscy pasują: bez ramsza rozdanie przepada', async () => {
    const user = userEvent.setup();
    renderGame(BOTS_PASS);
    await user.click(screen.getByRole('checkbox', { name: 'Ramsz, gdy wszyscy spasują' }));
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Pas' }));
    expect(await screen.findByText('Wszyscy spasowali — rozdanie przepada.')).toBeInTheDocument();
  });

  it('wszyscy pasują: z ramszem gra się ramsza', async () => {
    const user = userEvent.setup();
    renderGame(BOTS_PASS);
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Pas' }));
    expect(await screen.findByText('Ramsz · atu: tylko niżniki')).toBeInTheDocument();
    await playOut();
    expect(within(screen.getByRole('region', { name: 'Wynik rozdania' })).getByText(/każdy grał na siebie/)).toBeInTheDocument();
  });

  it('nowa seria po potwierdzeniu wraca do ekranu startowego', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderGame(BOTS_PASS);
    await user.click(screen.getByRole('checkbox', { name: 'Ramsz, gdy wszyscy spasują' }));
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Pas' }));
    await user.click(await screen.findByRole('button', { name: 'Tabela wyników' }));
    await user.click(screen.getByRole('button', { name: 'Nowa seria' }));
    expect(screen.getByRole('button', { name: 'Zacznij grę' })).toBeInTheDocument();
  });

  it('uszkodzony zapis: komunikat i ekran startowy', () => {
    renderGame(BOTS_PASS, createMemoryStorage({ [GAME_STORAGE_KEY]: '{nie json' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Zapisana seria była uszkodzona');
    expect(screen.getByRole('button', { name: 'Zacznij grę' })).toBeInTheDocument();
  });
});
```

W `src/ui/App.test.tsx`, na początku `describe('aplikacja', () => {`, dopisz:

```tsx
  it('menu prowadzi do gry z botami', () => {
    renderWithProviders(<AppRoutes />);
    expect(screen.getByRole('link', { name: 'Gra' })).toHaveAttribute('href', '/gra');
  });
```

- [ ] **Step 2: Uruchom testy — powinny się nie powieść**

Run: `npx vitest run src/play src/ui/App.test.tsx`
Expected: FAIL (brak `./GamePage` i linku „Gra”).

- [ ] **Step 3: Implementacja**

Utwórz `src/play/GameTable.tsx`:

```tsx
// src/play/GameTable.tsx
import { useEffect, useState } from 'react';
import { CardRow, Hand } from '../cards/Hand';
import { OpponentView } from '../cards/OpponentView';
import { SEAT_AT, TrickView } from '../cards/TrickView';
import { legalMoves, nextSeat, sortHand, type CardId, type GameType, type Seat } from '../engine';
import { GameBanner } from '../exercises/GameBanner';
import { botAction, gameActor, playerAt, type GameAction, type GameDeal, type PlayerId } from '../game';
import { useText } from '../state/AppStateContext';
import { BiddingControls, DeclareControls, DiscardControls, KontraControls, SkatControls } from './Controls';
import { DealSummary } from './DealSummary';
import { PLAYER_NAME, speechText } from './labels';

const ILLEGAL_HINT = 'Tej karty nie możesz teraz zagrać — musisz dołożyć do wyjścia.';
const SORT_BEFORE_DECLARE: GameType = { kind: 'grand' };

interface Props {
  deal: GameDeal;
  dealNo: number;
  dealer: PlayerId;
  you: Seat;
  onAction: (seat: Seat, action: GameAction) => void;
  onNextDeal: () => void;
  onShowTable: () => void;
  /** Opóźnienie ruchu bota w ms (zakończona lewa jest widoczna 1,5× dłużej). W testach 0. */
  delayMs?: number;
}

/** Ostatnia wypowiedź każdego gracza w licytacji i przy kontrze. */
function speeches(deal: GameDeal): Partial<Record<Seat, string>> {
  const out: Partial<Record<Seat, string>> = {};
  let kontraSaid = false;
  for (const { seat, action } of deal.history) {
    const text = speechText(action, kontraSaid);
    if (text !== undefined) out[seat] = text;
    if (action.type === 'double') kontraSaid = true;
  }
  return out;
}

export function GameTable({ deal, dealNo, dealer, you, onAction, onNextDeal, onShowTable, delayMs = 800 }: Props) {
  const t = useText();
  const [seenTricks, setSeenTricks] = useState(0);
  const [selected, setSelected] = useState<CardId | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const play = deal.play;
  const tricksDone = play?.tricks.length ?? 0;
  const showLast = tricksDone > seenTricks;
  const actor = gameActor(deal);
  const botTurn = actor !== null && actor !== you;

  useEffect(() => {
    if (tricksDone <= seenTricks) return;
    const id = setTimeout(() => setSeenTricks(tricksDone), delayMs * 1.5);
    return () => clearTimeout(id);
  }, [tricksDone, seenTricks, delayMs]);

  // Ruch bota po krótkiej przerwie (po zakończonej lewie — dopiero gdy zniknie ze stołu).
  useEffect(() => {
    if (!botTurn || showLast) return;
    const id = setTimeout(() => onAction(actor, botAction(deal, actor)), delayMs);
    return () => clearTimeout(id);
  }, [deal, actor, botTurn, showLast, onAction, delayMs]);

  const act = (action: GameAction) => onAction(you, action);
  const yourTurn = actor === you && !showLast;
  const game = deal.declaration?.game ?? play?.game ?? SORT_BEFORE_DECLARE;
  const handCards = play ? play.hands[you] : deal.hands[you];
  const legal = yourTurn && deal.phase === 'play' && play ? legalMoves(play.hands[you], play.trick, play.game) : [];

  const clickCard = (card: CardId) => {
    if (!yourTurn || deal.phase !== 'play') return;
    if (!legal.includes(card)) {
      setHint(ILLEGAL_HINT);
      setSelected(null);
      return;
    }
    setHint(null);
    if (selected !== card) {
      setSelected(card);
      return;
    }
    setSelected(null);
    act({ type: 'play', card });
  };

  const said = deal.phase === 'bidding' || deal.phase === 'kontra' || deal.phase === 'skat' ? speeches(deal) : {};
  const last = play?.tricks[tricksDone - 1];
  const shown =
    play && play.trick.length === 0 && showLast && last
      ? { cards: last.cards, leader: last.leader }
      : { cards: play?.trick ?? [], leader: play?.leader ?? 0 };
  const name = (seat: Seat) => (seat === you ? 'Ty' : PLAYER_NAME[playerAt(seat, dealer)]);

  let status = '';
  if (showLast && last) status = last.winner === you ? t('Bierzesz [[lewa:B]].') : `${t('[[Lewa:B]] bierze')}: ${name(last.winner)}.`;
  else if (deal.phase === 'done') status = 'Rozdanie zakończone.';
  else if (botTurn) status = `Ruch: ${name(actor)}…`;
  else if (deal.phase === 'play') status = play!.trick.length === 0 ? 'Twój ruch — wychodzisz.' : 'Twój ruch.';
  else status = 'Twój ruch.';

  return (
    <section className="game-table">
      <p className="game-table__head">
        Rozdanie {dealNo} · {t(`Siedzisz na ${SEAT_AT[you]}`)}
        {deal.bid !== null && ` · stawka ${deal.bid}`}
        {deal.doubling && ` · ${deal.doubling}`}
        {deal.hand && t(' · [[reka]]')}
      </p>
      {(deal.declaration || play?.game.kind === 'ramsch') && <GameBanner game={game} />}
      <div className="mini-deal__opponents">
        {[nextSeat(you, 1), nextSeat(you, 2)].map((seat) => (
          <OpponentView
            key={seat}
            seat={seat}
            player={name(seat)}
            cardCount={(play ? play.hands[seat] : deal.hands[seat]).length}
            isDeclarer={seat === deal.declarer}
            active={actor === seat && !showLast}
            speech={said[seat]}
          />
        ))}
      </div>

      {play && deal.phase !== 'done' && <TrickView cards={shown.cards} leader={shown.leader} you={you} emptyText="Stół jest pusty." />}

      <p className="mini-deal__status" aria-live="polite">
        {status}
      </p>
      {said[you] && <p className="game-table__you-said">Twoja odpowiedź: {said[you]}</p>}

      {yourTurn && deal.phase === 'bidding' && <BiddingControls deal={deal} you={you} onAction={act} />}
      {yourTurn && deal.phase === 'skat' && <SkatControls deal={deal} you={you} onAction={act} />}
      {yourTurn && deal.phase === 'discard' && <DiscardControls deal={deal} you={you} onAction={act} />}
      {yourTurn && deal.phase === 'declare' && <DeclareControls deal={deal} you={you} onAction={act} />}
      {yourTurn && deal.phase === 'kontra' && <KontraControls deal={deal} you={you} onAction={act} />}

      {deal.phase === 'done' && <DealSummary deal={deal} dealer={dealer} you={you} onNextDeal={onNextDeal} onShowTable={onShowTable} />}

      {deal.phase !== 'discard' && deal.phase !== 'done' && (
        <>
          <p className="hint hint--warn" role="status">
            {hint}
          </p>
          <Hand
            cards={sortHand(handCards, game)}
            selected={selected}
            isDimmed={yourTurn && deal.phase === 'play' ? (card) => !legal.includes(card) : undefined}
            onCardClick={clickCard}
            disabled={!(yourTurn && deal.phase === 'play')}
          />
        </>
      )}
      {deal.phase === 'done' && play && (
        <figure className="game-table__skat">
          <CardRow cards={deal.skat} />
          <figcaption>{t('[[Skat]]')}</figcaption>
        </figure>
      )}
    </section>
  );
}
```

Utwórz `src/play/DealSummary.tsx`:

```tsx
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
```

Utwórz `src/play/ScoreTable.tsx`:

```tsx
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
```

Utwórz `src/play/GamePage.tsx`:

```tsx
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
```

Trasa, menu i style (diff):

```diff
diff --git a/src/styles.css b/src/styles.css
index 82590d3..a74af97 100644
--- a/src/styles.css
+++ b/src/styles.css
@@ -210,6 +210,34 @@ button.card:focus-visible { outline: 3px solid var(--accent); outline-offset: 2p
 .mini-deal__open { margin: 4px 0 8px; }
 .mini-deal__open-label { text-align: center; color: var(--muted); font-size: 0.85rem; margin: 0; }
 
+/* Gra z botami */
+.game-table__head { color: var(--muted); font-size: 0.9rem; margin: 0 0 8px; }
+.game-table__you-said { text-align: center; color: var(--muted); font-size: 0.9rem; margin: 4px 0 0; }
+.game-table__skat { margin: 12px 0 0; text-align: center; }
+.game-table__skat figcaption { color: var(--muted); font-size: 0.85rem; }
+.opponent { position: relative; }
+.opponent__speech {
+  display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 999px;
+  background: var(--surface); border: 1px solid var(--border); font-weight: 700; font-size: 0.9rem;
+}
+.game-bar { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; margin: 12px 0 0; }
+.game-bar--column { flex-direction: column; align-items: stretch; }
+.game-bar__info { width: 100%; text-align: center; margin: 0; }
+.game-bar__choices { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
+.game-bar__choices .option { min-width: 72px; text-align: center; }
+.option--chosen { border-color: var(--accent); box-shadow: inset 0 0 0 2px var(--accent); }
+.deal-summary { margin-top: 12px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
+.deal-summary h2 { margin: 0 0 8px; font-size: 1.1rem; }
+.deal-summary p { margin: 4px 0; }
+.score-table__wrap { overflow-x: auto; }
+.score-table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: var(--radius); font-size: 0.9rem; }
+.score-table caption { text-align: left; font-weight: 700; padding: 0 0 8px; }
+.score-table th, .score-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: right; }
+.score-table th:nth-child(2), .score-table td:nth-child(2) { text-align: left; }
+.score-table tfoot th, .score-table tfoot td { font-weight: 700; border-bottom: 0; }
+.score-table__undo { color: var(--muted); font-size: 0.8rem; }
+.game-start .button { margin-top: 8px; }
+
 @media (min-width: 600px) {
   /* Na szerokim ekranie większe karty i mniejsze zachodzenie: 10 kart ≈ 6,4 szerokości karty (≈ 610 px). */
   .hand { --card-w: 96px; }
diff --git a/src/ui/App.tsx b/src/ui/App.tsx
index bfda46a..2e7f817 100644
--- a/src/ui/App.tsx
+++ b/src/ui/App.tsx
@@ -9,6 +9,7 @@ import { GlossaryPage } from './GlossaryPage';
 import { Layout } from './Layout';
 import { LessonRoute } from './LessonPage';
 import { NotFound } from './NotFound';
+import { GamePage } from '../play/GamePage';
 import { SettingsPage } from './SettingsPage';
 
 function RouteErrorBoundary({ children }: { children: ReactNode }) {
@@ -26,6 +27,7 @@ export function AppRoutes() {
           <Route path="/ustawienia" element={<SettingsPage />} />
           <Route path="/slowniczek" element={<GlossaryPage />} />
           <Route path="/o-kartach" element={<AboutCardsPage />} />
+          <Route path="/gra" element={<GamePage />} />
           <Route path="*" element={<NotFound />} />
         </Routes>
       </RouteErrorBoundary>
diff --git a/src/ui/Layout.tsx b/src/ui/Layout.tsx
index 7f2de5d..0641423 100644
--- a/src/ui/Layout.tsx
+++ b/src/ui/Layout.tsx
@@ -17,6 +17,7 @@ export function Layout({ children }: { children: ReactNode }) {
           Trener skata
         </Link>
         <nav className="app-header__nav">
+          <NavLink to="/gra">Gra</NavLink>
           <NavLink to="/slowniczek">Słowniczek</NavLink>
           <NavLink to="/ustawienia">Ustawienia</NavLink>
         </nav>
```

- [ ] **Step 4: Uruchom testy**

Run: `npm test -- --run && npm run typecheck && npm run build && npm run e2e`
Expected: PASS (316 testów, 2 testy E2E).

- [ ] **Step 5: Commit**

```bash
git add src/play src/ui src/styles.css
git commit -m "feat(play): stół gry z botami, wynik rozdania, tabela serii i strona /gra

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Specyfikacja i sprawdzenie w przeglądarce

- [ ] **Step 1:** W `docs/superpowers/specs/2026-11-12-gra-z-botami-design.md`, w sekcji „## 11. Decyzje z implementacji”, dopisz:

```markdown
- **Ekrany (Plan 8):** `src/play/`.
  - Licytacja: przycisk z kolejną stawką albo „tak” i „pas”. Skoków stawek w interfejsie nie ma, choć silnik je przyjmuje.
  - Wyrzucanie: 2 karty z 12, jak w lekcji 19.
  - Zgłoszenie: kolory, grand i null. Zapowiedzi tylko przy grze z ręki, a przy nullu — null otwarty. Null poniżej stawki jest zablokowany.
  - Wypowiedzi botów pokazują się w dymkach. Ruch bota następuje co 0,8 s.
  - Po rozdaniu: podsumowanie, odkryty skat i tabela serii.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-11-12-gra-z-botami-design.md
git commit -m "docs: ekrany gry w specyfikacji

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 3 (kontroler):** sprawdzenie w przeglądarce, na telefonie (375 px) i na komputerze:
  - pełne rozdanie;
  - ramsz po pasach;
  - tabela wyników;
  - odświeżenie strony w trakcie rozdania;
  - oba rejestry językowe.

  Przed zmianą ustawień zapisz `localStorage['skat-trener:v1']` i `localStorage['skat-trener:v1:gra']`, a po sprawdzeniu je przywróć.
