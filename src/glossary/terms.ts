// src/glossary/terms.ts
// DANE DO WERYFIKACJI przez autora kursu — patrz specyfikacja, sekcja 8.
// Formy dodajemy tylko wtedy, gdy są używane w treści (test treści wyłapie braki).
import type { DeckKind, Forms, RegisterForms, Term, TextContext } from './types';

const same = (forms: Forms): RegisterForms => ({ official: forms, colloquial: forms });
const plain = (forms: RegisterForms): Term => ({ kind: 'plain', forms });
const byDeck = (decks: Record<DeckKind, RegisterForms>): Term => ({ kind: 'deck', byDeck: decks });

export const TERMS: Record<string, Term> = {
  lewa: plain({
    official: {
      M: 'lewa', g: 'f', D: 'lewy', C: 'lewie', B: 'lewę', N: 'lewą', Ms: 'lewie',
      Mlm: 'lewy', Dlm: 'lew', Clm: 'lewom', Blm: 'lewy', Nlm: 'lewami', Mslm: 'lewach',
    },
    colloquial: {
      M: 'sztych', g: 'm', D: 'sztycha', C: 'sztychowi', B: 'sztycha', N: 'sztychem', Ms: 'sztychu',
      Mlm: 'sztychy', Dlm: 'sztychów', Clm: 'sztychom', Blm: 'sztychy', Nlm: 'sztychami', Mslm: 'sztychach',
    },
  }),
  atu: plain({
    official: { M: 'atu', g: 'n', D: 'atu', B: 'atu', Mlm: 'atuty', Dlm: 'atutów', Blm: 'atuty', Nlm: 'atutami' },
    colloquial: { M: 'trumf', g: 'm', D: 'trumfa', B: 'trumfa', Mlm: 'trumfy', Dlm: 'trumfów', Blm: 'trumfy', Nlm: 'trumfami' },
  }),
  rozgrywajacy: plain({
    official: {
      M: 'rozgrywający', g: 'm', D: 'rozgrywającego', C: 'rozgrywającemu', B: 'rozgrywającego',
      N: 'rozgrywającym', Ms: 'rozgrywającym',
    },
    colloquial: { M: 'szpiler', g: 'm', D: 'szpilera', C: 'szpilerowi', B: 'szpilera', N: 'szpilerem', Ms: 'szpilerze' },
  }),
  obronca: plain({
    official: {
      M: 'obrońca', g: 'm', D: 'obrońcy', C: 'obrońcy', B: 'obrońcę', N: 'obrońcą',
      Mlm: 'obrońcy', Dlm: 'obrońców', Clm: 'obrońcom', Blm: 'obrońców', Nlm: 'obrońcami',
    },
    colloquial: {
      M: 'przeciwnik', g: 'm', D: 'przeciwnika', C: 'przeciwnikowi', B: 'przeciwnika', N: 'przeciwnikiem',
      Mlm: 'przeciwnicy', Dlm: 'przeciwników', Clm: 'przeciwnikom', Blm: 'przeciwników', Nlm: 'przeciwnikami',
    },
  }),
  przodek: plain({
    official: { M: 'przodek', g: 'm', D: 'przodka', C: 'przodkowi', B: 'przodka', N: 'przodkiem', Ms: 'przodku' },
    colloquial: { M: 'forhand', g: 'm', D: 'forhandu', C: 'forhandowi', B: 'forhand', N: 'forhandem', Ms: 'forhandzie' },
  }),
  srodek: plain({
    official: { M: 'środek', g: 'm', D: 'środka', C: 'środkowi', B: 'środek', N: 'środkiem', Ms: 'środku' },
    colloquial: { M: 'mitelhand', g: 'm', D: 'mitelhandu', C: 'mitelhandowi', B: 'mitelhand', N: 'mitelhandem', Ms: 'mitelhandzie' },
  }),
  zadek: plain({
    official: { M: 'zadek', g: 'm', D: 'zadka', C: 'zadkowi', B: 'zadek', N: 'zadkiem', Ms: 'zadku' },
    colloquial: { M: 'hinterhand', g: 'm', D: 'hinterhandu', C: 'hinterhandowi', B: 'hinterhand', N: 'hinterhandem', Ms: 'hinterhandzie' },
  }),
  oczko: plain({
    official: { M: 'oczko', g: 'n', D: 'oczka', B: 'oczko', Mlm: 'oczka', Dlm: 'oczek', Blm: 'oczka', Nlm: 'oczkami', Mslm: 'oczkach' },
    colloquial: { M: 'auga', g: 'f', D: 'augi', B: 'augę', Mlm: 'augi', Dlm: 'aug', Blm: 'augi', Nlm: 'augami', Mslm: 'augach' },
  }),
  skat: plain(same({ M: 'skat', g: 'm', D: 'skata', C: 'skatowi', B: 'skat', N: 'skatem', Ms: 'skacie' })),
  licytacja: plain({
    official: { M: 'licytacja', g: 'f', D: 'licytacji', B: 'licytację', N: 'licytacją', Ms: 'licytacji' },
    colloquial: { M: 'reizowanie', g: 'n', D: 'reizowania', B: 'reizowanie', N: 'reizowaniem', Ms: 'reizowaniu' },
  }),
  graKolorowa: plain({
    official: { M: 'gra kolorowa', g: 'f', D: 'gry kolorowej', B: 'grę kolorową', N: 'grą kolorową', Ms: 'grze kolorowej' },
    colloquial: { M: 'farbszpil', g: 'm', D: 'farbszpila', B: 'farbszpila', N: 'farbszpilem', Ms: 'farbszpilu' },
  }),
  grand: plain(same({ M: 'grand', g: 'm', D: 'granda', B: 'granda', N: 'grandem', Ms: 'grandzie' })),
  null: plain({
    official: { M: 'null', g: 'm', D: 'nulla', B: 'nulla', N: 'nullem', Ms: 'nullu', Mlm: 'nulle' },
    colloquial: { M: 'nul', g: 'm', D: 'nula', B: 'nula', N: 'nulem', Ms: 'nulu', Mlm: 'nule' },
  }),

  // Rangi kart (używane też do nazw kart — muszą mieć rodzaj `g`).
  siodemka: plain(same({ M: 'siódemka', g: 'f', Mlm: 'siódemki', Dlm: 'siódemek' })),
  osemka: plain(same({ M: 'ósemka', g: 'f', Mlm: 'ósemki', Dlm: 'ósemek' })),
  dziewiatka: plain(same({ M: 'dziewiątka', g: 'f', Mlm: 'dziewiątki', Dlm: 'dziewiątek' })),
  dziesiatka: plain(same({ M: 'dziesiątka', g: 'f', D: 'dziesiątki', B: 'dziesiątkę', N: 'dziesiątką', Mlm: 'dziesiątki', Dlm: 'dziesiątek' })),
  walet: byDeck({
    altenburg: {
      official: { M: 'niżnik', g: 'm', D: 'niżnika', B: 'niżnika', N: 'niżnikiem', Mlm: 'niżniki', Dlm: 'niżników', Blm: 'niżniki', Nlm: 'niżnikami' },
      colloquial: { M: 'uner', g: 'm', D: 'unera', B: 'unera', N: 'unerem', Mlm: 'unery', Dlm: 'unerów', Blm: 'unery', Nlm: 'unerami' },
    },
    french: {
      official: { M: 'walet', g: 'm', D: 'waleta', B: 'waleta', N: 'waletem', Mlm: 'walety', Dlm: 'waletów', Blm: 'walety', Nlm: 'waletami' },
      colloquial: { M: 'jopek', g: 'm', D: 'jopka', B: 'jopka', N: 'jopkiem', Mlm: 'jopki', Dlm: 'jopków', Blm: 'jopki', Nlm: 'jopkami' },
    },
  }),
  dama: byDeck({
    altenburg: {
      official: { M: 'wyżnik', g: 'm', D: 'wyżnika', B: 'wyżnika', N: 'wyżnikiem', Mlm: 'wyżniki', Dlm: 'wyżników' },
      colloquial: { M: 'ober', g: 'm', D: 'obera', B: 'obera', N: 'oberem', Mlm: 'obery', Dlm: 'oberów' },
    },
    french: same({ M: 'dama', g: 'f', D: 'damy', B: 'damę', N: 'damą', Mlm: 'damy', Dlm: 'dam' }),
  }),
  krol: plain(same({ M: 'król', g: 'm', D: 'króla', B: 'króla', N: 'królem', Mlm: 'króle', Dlm: 'królów' })),
  as: byDeck({
    altenburg: {
      official: { M: 'as', g: 'm', D: 'asa', B: 'asa', N: 'asem', Mlm: 'asy', Dlm: 'asów' },
      colloquial: { M: 'daus', g: 'm', D: 'dausa', B: 'dausa', N: 'dausem', Mlm: 'dausy', Dlm: 'dausów' },
    },
    french: same({ M: 'as', g: 'm', D: 'asa', B: 'asa', N: 'asem', Mlm: 'asy', Dlm: 'asów' }),
  }),
};

export function formsFor(term: Term, ctx: TextContext): Forms {
  const registers = term.kind === 'plain' ? term.forms : term.byDeck[ctx.deck];
  return registers[ctx.register];
}

/** Wszystkie warianty form (2 dla terminów zwykłych, 4 dla zależnych od talii). */
export function formVariants(term: Term): Forms[] {
  const registerSets = term.kind === 'plain' ? [term.forms] : [term.byDeck.altenburg, term.byDeck.french];
  return registerSets.flatMap((r) => [r.official, r.colloquial]);
}
