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
    official: { M: 'atu', g: 'n', D: 'atu', B: 'atu', N: 'atu', Ms: 'atu', Mlm: 'atuty', Dlm: 'atutów', Blm: 'atuty', Nlm: 'atutami' },
    colloquial: { M: 'trumf', g: 'm', D: 'trumfa', B: 'trumfa', N: 'trumfem', Ms: 'trumfie', Mlm: 'trumfy', Dlm: 'trumfów', Blm: 'trumfy', Nlm: 'trumfami' },
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
  // Pozycje: oficjalnie „na ręku / na środkowym ręku / na ostatnim ręku”, potocznie „na przodku / na środku / na zadku”.
  przodek: plain({
    official: { M: 'ręka', g: 'f', D: 'ręki', C: 'ręce', B: 'rękę', N: 'ręką', Ms: 'ręku' },
    colloquial: { M: 'przodek', g: 'm', D: 'przodka', C: 'przodkowi', B: 'przodka', N: 'przodkiem', Ms: 'przodku' },
  }),
  srodek: plain({
    official: { M: 'środkowa ręka', g: 'f', D: 'środkowej ręki', C: 'środkowej ręce', B: 'środkową rękę', N: 'środkową ręką', Ms: 'środkowym ręku' },
    colloquial: { M: 'środek', g: 'm', D: 'środka', C: 'środkowi', B: 'środek', N: 'środkiem', Ms: 'środku' },
  }),
  zadek: plain({
    official: { M: 'ostatnia ręka', g: 'f', D: 'ostatniej ręki', C: 'ostatniej ręce', B: 'ostatnią rękę', N: 'ostatnią ręką', Ms: 'ostatnim ręku' },
    colloquial: { M: 'zadek', g: 'm', D: 'zadka', C: 'zadkowi', B: 'zadek', N: 'zadkiem', Ms: 'zadku' },
  }),
  oczko: plain({
    official: { M: 'oczko', g: 'n', D: 'oczka', B: 'oczko', Mlm: 'oczka', Dlm: 'oczek', Blm: 'oczka', Nlm: 'oczkami', Mslm: 'oczkach' },
    colloquial: { M: 'auga', g: 'f', D: 'augi', B: 'augę', Mlm: 'augi', Dlm: 'aug', Blm: 'augi', Nlm: 'augami', Mslm: 'augach' },
  }),
  skat: plain({
    official: { M: 'skat', g: 'm', D: 'skata', C: 'skatowi', B: 'skat', N: 'skatem', Ms: 'skacie' },
    colloquial: { M: 'szkat', g: 'm', D: 'szkata', C: 'szkatowi', B: 'szkat', N: 'szkatem', Ms: 'szkacie' },
  }),
  licytacja: plain({
    official: { M: 'licytacja', g: 'f', D: 'licytacji', B: 'licytację', N: 'licytacją', Ms: 'licytacji' },
    colloquial: { M: 'rajcowanie', g: 'n', D: 'rajcowania', B: 'rajcowanie', N: 'rajcowaniem', Ms: 'rajcowaniu' },
  }),
  graKolorowa: plain({
    official: { M: 'gra kolorowa', g: 'f', D: 'gry kolorowej', B: 'grę kolorową', N: 'grą kolorową', Ms: 'grze kolorowej' },
    colloquial: { M: 'farbszpil', g: 'm', D: 'farbszpila', B: 'farbszpila', N: 'farbszpilem', Ms: 'farbszpilu' },
  }),
  grand: plain({
    official: { M: 'grand', g: 'm', D: 'granda', B: 'grand', N: 'grandem', Ms: 'grandzie' },
    colloquial: { M: 'grand', g: 'm', D: 'granda', B: 'granda', N: 'grandem', Ms: 'grandzie' },
  }),
  null: plain(same({ M: 'null', g: 'm', D: 'nulla', B: 'null', N: 'nullem', Ms: 'nullu', Mlm: 'nulle' })),

  // Rangi kart (używane też do nazw kart — muszą mieć rodzaj `g`).
  siodemka: plain(same({ M: 'siódemka', g: 'f', D: 'siódemki', C: 'siódemce', B: 'siódemkę', N: 'siódemką', Ms: 'siódemce', Mlm: 'siódemki', Dlm: 'siódemek' })),
  osemka: plain(same({ M: 'ósemka', g: 'f', D: 'ósemki', C: 'ósemce', B: 'ósemkę', N: 'ósemką', Ms: 'ósemce', Mlm: 'ósemki', Dlm: 'ósemek' })),
  dziewiatka: plain(same({ M: 'dziewiątka', g: 'f', D: 'dziewiątki', C: 'dziewiątce', B: 'dziewiątkę', N: 'dziewiątką', Ms: 'dziewiątce', Mlm: 'dziewiątki', Dlm: 'dziewiątek' })),
  dziesiatka: plain(same({ M: 'dziesiątka', g: 'f', D: 'dziesiątki', C: 'dziesiątce', B: 'dziesiątkę', N: 'dziesiątką', Ms: 'dziesiątce', Mlm: 'dziesiątki', Dlm: 'dziesiątek' })),
  walet: byDeck({
    altenburg: {
      official: { M: 'niżnik', g: 'm', D: 'niżnika', B: 'niżnika', N: 'niżnikiem', C: 'niżnikowi', Ms: 'niżniku', Mlm: 'niżniki', Dlm: 'niżników', Blm: 'niżniki', Nlm: 'niżnikami' },
      colloquial: { M: 'unter', g: 'm', D: 'untera', B: 'untera', N: 'unterem', C: 'unterowi', Ms: 'unterze', Mlm: 'untery', Dlm: 'unterów', Blm: 'untery', Nlm: 'unterami' },
    },
    french: {
      official: { M: 'walet', g: 'm', D: 'waleta', B: 'waleta', N: 'waletem', C: 'waletowi', Ms: 'walecie', Mlm: 'walety', Dlm: 'waletów', Blm: 'walety', Nlm: 'waletami' },
      colloquial: { M: 'jopek', g: 'm', D: 'jopka', B: 'jopka', N: 'jopkiem', C: 'jopkowi', Ms: 'jopku', Mlm: 'jopki', Dlm: 'jopków', Blm: 'jopki', Nlm: 'jopkami' },
    },
  }),
  dama: byDeck({
    altenburg: {
      official: { M: 'wyżnik', g: 'm', D: 'wyżnika', B: 'wyżnika', N: 'wyżnikiem', C: 'wyżnikowi', Ms: 'wyżniku', Mlm: 'wyżniki', Dlm: 'wyżników' },
      colloquial: { M: 'ober', g: 'm', D: 'obera', B: 'obera', N: 'oberem', C: 'oberowi', Ms: 'oberze', Mlm: 'obery', Dlm: 'oberów' },
    },
    french: same({ M: 'dama', g: 'f', D: 'damy', B: 'damę', N: 'damą', C: 'damie', Ms: 'damie', Mlm: 'damy', Dlm: 'dam' }),
  }),
  krol: plain(same({ M: 'król', g: 'm', D: 'króla', B: 'króla', N: 'królem', C: 'królowi', Ms: 'królu', Mlm: 'króle', Dlm: 'królów' })),
  as: byDeck({
    altenburg: {
      official: { M: 'tuz', g: 'm', D: 'tuza', B: 'tuza', N: 'tuzem', C: 'tuzowi', Ms: 'tuzie', Mlm: 'tuzy', Dlm: 'tuzów', Blm: 'tuzy', Nlm: 'tuzami' },
      colloquial: { M: 'as', g: 'm', D: 'asa', B: 'asa', N: 'asem', C: 'asowi', Ms: 'asie', Mlm: 'asy', Dlm: 'asów', Blm: 'asy', Nlm: 'asami' },
    },
    french: same({ M: 'as', g: 'm', D: 'asa', B: 'asa', N: 'asem', C: 'asowi', Ms: 'asie', Mlm: 'asy', Dlm: 'asów', Blm: 'asy', Nlm: 'asami' }),
  }),
  // Wycena i licytacja (Plan 3). ⚠ Wersje potoczne do weryfikacji przez autora.
  krawiec: plain({
    official: { M: 'krawiec', g: 'm', D: 'krawca', B: 'krawca', N: 'krawcem', Ms: 'krawcu' },
    colloquial: { M: 'szneider', g: 'm', D: 'szneidra', B: 'szneidra', N: 'szneidrem', Ms: 'szneidrze' },
  }),
  czarny: plain({
    official: { M: 'czarny', g: 'm', D: 'czarnego', B: 'czarnego', N: 'czarnym', Ms: 'czarnym' },
    colloquial: { M: 'szwarc', g: 'm', D: 'szwarca', B: 'szwarca', N: 'szwarcem', Ms: 'szwarcu' },
  }),
  reka: plain({
    official: { M: 'gra z ręki', g: 'f', D: 'gry z ręki', B: 'grę z ręki', N: 'grą z ręki', Ms: 'grze z ręki' },
    colloquial: { M: 'hand', g: 'm', D: 'handa', B: 'handa', N: 'handem', Ms: 'handzie' },
  }),
  otwarta: plain({
    official: { M: 'gra otwarta', g: 'f', D: 'gry otwartej', B: 'grę otwartą', N: 'grą otwartą', Ms: 'grze otwartej' },
    colloquial: { M: 'overt', g: 'm', D: 'overta', B: 'overta', N: 'overtem', Ms: 'overcie' },
  }),
  matador: plain(same({ M: 'matador', g: 'm', D: 'matadora', Mlm: 'matadory', Dlm: 'matadorów', Nlm: 'matadorami' })),
  mit: plain({ official: { M: 'z' }, colloquial: { M: 'mit' } }),
  ohne: plain({ official: { M: 'bez' }, colloquial: { M: 'ohne' } }),
  przelicytowanie: plain({
    official: { M: 'przelicytowanie', g: 'n', D: 'przelicytowania', N: 'przelicytowaniem', Ms: 'przelicytowaniu' },
    colloquial: { M: 'przerajcowanie', g: 'n', D: 'przerajcowania', N: 'przerajcowaniem', Ms: 'przerajcowaniu' },
  }),
  pas: plain(same({ M: 'pas', g: 'm' })),
  szmirowanie: plain({
    official: { M: 'dokładanie', g: 'n', D: 'dokładania', B: 'dokładanie', N: 'dokładaniem', Ms: 'dokładaniu' },
    colloquial: { M: 'szmirowanie', g: 'n', D: 'szmirowania', B: 'szmirowanie', N: 'szmirowaniem', Ms: 'szmirowaniu' },
  }),
  ramsz: plain(same({ M: 'ramsz', g: 'm', D: 'ramsza', B: 'ramsza', N: 'ramszem', Ms: 'ramszu' })),
  jungfrau: plain({
    official: { M: 'dziewica', g: 'f', D: 'dziewicy', B: 'dziewicę', N: 'dziewicą' },
    colloquial: { M: 'jungfrau', g: 'f', D: 'jungfrau', B: 'jungfrau', N: 'jungfrau' },
  }),
  durchmarsch: plain({
    official: { M: 'przemarsz', g: 'm', D: 'przemarszu', B: 'przemarsz', N: 'przemarszem' },
    colloquial: { M: 'durchmarsz', g: 'm', D: 'durchmarszu', B: 'durchmarsz', N: 'durchmarszem' },
  }),
  bock: plain({
    official: { M: 'bock', g: 'm', D: 'bocka', Mlm: 'bocki', Dlm: 'bocków' },
    colloquial: { M: 'bok', g: 'm', D: 'boka', Mlm: 'boki', Dlm: 'boków' },
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
