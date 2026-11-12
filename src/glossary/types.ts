// src/glossary/types.ts
export type Register = 'official' | 'colloquial';
export type DeckKind = 'altenburg' | 'french';

/** M D C B N Ms = przypadki l.p.; z sufiksem „lm” = l.mn. */
export const CASES = ['M', 'D', 'C', 'B', 'N', 'Ms', 'Mlm', 'Dlm', 'Clm', 'Blm', 'Nlm', 'Mslm'] as const;
export type CaseKey = (typeof CASES)[number];

export type Gender = 'm' | 'f' | 'n';

export type Forms = { M: string; g?: Gender } & Partial<Record<Exclude<CaseKey, 'M'>, string>>;

export interface RegisterForms {
  official: Forms;
  colloquial: Forms;
}

export type Term =
  | { kind: 'plain'; forms: RegisterForms }
  | { kind: 'deck'; byDeck: Record<DeckKind, RegisterForms> };

export interface TextContext {
  deck: DeckKind;
  register: Register;
}
