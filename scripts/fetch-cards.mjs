// scripts/fetch-cards.mjs
// Jednorazowe pobranie grafik kart z Wikimedia Commons do public/cards/<talia>/<karta>.svg.
// Uruchom: node scripts/fetch-cards.mjs   (pliki trafiają do repozytorium; skrypt dokumentuje ich pochodzenie)
// Licencje i autorzy: src/cards/deckCredits.ts.
import { mkdir, writeFile } from 'node:fs/promises';

const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Altenburg: „German Skat cards (SVG set by Mfrasca)”, CC BY-SA 3.0.
const GERMAN_SUIT = { c: 'eichel', s: 'blatt', h: 'hart', d: 'schellen' };
const GERMAN_FACES = {
  c: { J: '11 unter', Q: '12 ober', K: '13 konig', A: '01 daus' },
  h: { J: '11 unter', Q: '12 ober', K: '13 konig', A: '01 daus' },
  s: { J: '11 jack', Q: '12 queen', K: '13 king', A: '01 daus' },
  d: { J: '11 jack', Q: '12 queen', K: '13 king', A: '01' },
};
const germanFile = (suit, rank) => {
  const r = { 7: '07', 8: '08', 9: '09', 10: '10' }[rank] ?? GERMAN_FACES[suit][rank];
  return `Playing card-german-${GERMAN_SUIT[suit]}-${r}.svg`;
};

// Francuska: Adrian Kennard („SVG playing cards 6”), CC0.
const frenchFile = (suit, rank) => `${rank}${suit.toUpperCase()}.svg`;

const DECKS = { altenburg: germanFile, french: frenchFile };

async function download(name) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name.replaceAll(' ', '_'))}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'skat-trener-card-fetch/1.0 (static site asset script)' } });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const text = await res.text();
  if (!/<svg[\s>]/.test(text)) throw new Error(`${name}: to nie jest plik SVG`);
  return text;
}

for (const [deck, fileFor] of Object.entries(DECKS)) {
  await mkdir(`public/cards/${deck}`, { recursive: true });
  for (const suit of ['c', 's', 'h', 'd']) {
    for (const rank of RANKS) {
      const name = fileFor(suit, rank);
      const svg = await download(name);
      await writeFile(`public/cards/${deck}/${suit}-${rank}.svg`, svg);
      console.log(`${deck}/${suit}-${rank}.svg  ←  ${name} (${svg.length} B)`);
      await new Promise((r) => setTimeout(r, 200)); // grzecznie wobec serwerów Wikimedia
    }
  }
}
