import type { DeckKind } from '../glossary';

export interface DeckCredit {
  deck: DeckKind;
  name: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  changes: string;
}

export const DECK_CREDITS: readonly DeckCredit[] = [
  {
    deck: 'altenburg',
    name: 'Talia Altenburg (wzór saksoński z programu XSkat)',
    author: 'Gunter Gerhardt (XSkat, xskat.de); wersja SVG: Mfrasca',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    source: 'https://commons.wikimedia.org/wiki/Category:German_Skat_cards_(SVG_set_by_Mfrasca)',
    changes: 'Rysunki bez zmian; zmieniono tylko nazwy plików.',
  },
  {
    deck: 'french',
    name: 'Talia francuska',
    author: 'Adrian Kennard (TheRealRevK)',
    license: 'CC0 1.0 (domena publiczna)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://commons.wikimedia.org/wiki/Category:SVG_playing_cards_6',
    changes: 'Rysunki bez zmian; zmieniono tylko nazwy plików.',
  },
];
