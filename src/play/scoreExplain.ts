// src/play/scoreExplain.ts
import { GRAND_BASE, SUIT_BASE, matadors, nullValue, type CardId } from '../engine';
import type { GameResult } from '../game';
import { countCase } from '../glossary';
import { signed } from './labels';

type GameOutcome = Extract<GameResult, { kind: 'game' }>;

const pts = (n: number) => `${n} [[oczko:${countCase(n)}]]`;

/**
 * Kolejne kroki wyliczenia wyniku rozgrywającego — od wartości bazowej do zapisu Seegera-Fabiana.
 * Zwraca teksty z tokenami słowniczka (do przepuszczenia przez `t`).
 * `declarerCards` — karty rozgrywającego razem ze skatem (do matadorów).
 */
export function scoreSteps(result: GameOutcome, declarerCards: readonly CardId[]): string[] {
  const { declaration: d, settlement: s, bid, doubling } = result;
  const steps: string[] = [];
  let value: number;

  if (d.game.kind === 'null') {
    value = nullValue(d);
    const extras = [...(d.announce === 'ouvert' ? ['[[otwarta]]'] : []), ...(d.hand ? ['[[reka]]'] : [])];
    steps.push(`[[Null]]${extras.length ? ` (${extras.join(', ')})` : ''} ma stałą wartość ${value} — bez mnożnika.`);
  } else if (d.game.kind === 'ramsch') {
    return [];
  } else {
    const base = d.game.kind === 'grand' ? GRAND_BASE : SUIT_BASE[d.game.trump];
    steps.push(`Wartość bazowa: ${d.game.kind === 'grand' ? '[[grand]]' : `[[suit:${d.game.trump}]]`} = ${base}.`);

    const m = matadors(declarerCards, d.game);
    const announcedSchneider = d.announce !== 'none';
    const announcedSchwarz = d.announce === 'schwarz' || d.announce === 'ouvert';
    const parts: [number, string][] = [
      [m.count, `${m.with ? '[[mit]]' : '[[ohne]]'} ${m.count}`],
      [1, 'gra'],
    ];
    if (d.hand) parts.push([1, '[[reka]]']);
    if (s.schneider || announcedSchneider) parts.push([1, '[[krawiec]]']);
    if (announcedSchneider) parts.push([1, 'zapowiedź [[krawiec:D]]']);
    if (s.schwarz || announcedSchwarz) parts.push([1, '[[czarny]]']);
    if (announcedSchwarz) parts.push([1, 'zapowiedź [[czarny:D]]']);
    if (d.announce === 'ouvert') parts.push([1, '[[otwarta]]']);
    const multiplier = parts.reduce((sum, [n]) => sum + n, 0);
    steps.push(
      `[[Matador:Mlm]] liczysz z kart [[rozgrywajacy:D]] razem ze [[skat:N]]. Mnożnik: ${parts
        .map(([n, label]) => `${n} (${label})`)
        .join(' + ')} = ${multiplier}.`,
    );
    value = base * multiplier;
    steps.push(`Wartość gry: ${base} × ${multiplier} = ${value}.`);

    if (s.overbid) {
      const raised = base * Math.ceil(bid / base);
      steps.push(
        `[[Przelicytowanie]]: wartość ${value} jest niższa od stawki ${bid}, więc gra jest przegrana. Liczy się najmniejsza wielokrotność wartości bazowej, która sięga stawki: ${base} × ${raised / base} = ${raised}.`,
      );
      value = raised;
    }
  }

  if (doubling) {
    const factor = doubling === 'kontra' ? 2 : 4;
    steps.push(`${doubling === 'kontra' ? 'Kontra' : 'Kontra i re'}: wartość × ${factor} = ${value * factor}.`);
    value *= factor;
  }

  steps.push(`${outcomeReason(result)} ${s.won ? `Wynik: ${signed(s.value)}.` : `Przegrana liczy się podwójnie: −2 × ${s.value} = ${signed(s.score)}.`}`);

  steps.push(
    s.won
      ? `Zapis Seegera-Fabiana: za wygraną +50, czyli ${s.value} + 50 = ${signed(s.value + 50)} dla [[rozgrywajacy:D]].`
      : `Zapis Seegera-Fabiana: za przegraną −50, czyli ${signed(s.score)} − 50 = ${signed(s.score - 50)} dla [[rozgrywajacy:D]], a każdy z [[obronca:Dlm]] dostaje +40.`,
  );
  return steps;
}

/** Dlaczego gra jest wygrana albo przegrana. */
function outcomeReason({ declaration: d, outcome, settlement: s }: GameOutcome): string {
  if (d.game.kind === 'null') {
    return s.won
      ? 'Gra wygrana: [[rozgrywajacy]] nie wziął {żadnej lewy|żadnego sztycha}.'
      : 'Gra przegrana: [[rozgrywajacy]] wziął [[lewa:B]].';
  }
  const p = outcome.declarerPoints;
  if (s.won) {
    if (d.announce === 'schwarz' || d.announce === 'ouvert') return 'Gra wygrana: [[rozgrywajacy]] wziął wszystkie [[lewa:Blm]], jak zapowiedział.';
    if (d.announce === 'schneider') return `Gra wygrana: [[rozgrywajacy]] ma ${pts(p)} — zapowiedział [[krawiec:B]], a potrzeba co najmniej 90.`;
    return `Gra wygrana: [[rozgrywajacy]] ma ${pts(p)} (potrzeba co najmniej 61).`;
  }
  if (s.overbid) return `Gra przegrana przez [[przelicytowanie]] — ${pts(p)} [[rozgrywajacy:D]] nic tu nie zmienia.`;
  if (p < 61) return `Gra przegrana: [[rozgrywajacy]] ma ${pts(p)}, a potrzeba co najmniej 61.`;
  if (d.announce === 'schneider') return `Gra przegrana: [[rozgrywajacy]] zapowiedział [[krawiec:B]], a ma tylko ${pts(p)} (potrzeba 90).`;
  return 'Gra przegrana: [[rozgrywajacy]] zapowiedział [[czarny:B]], a nie wziął wszystkich [[lewa:Dlm]].';
}
