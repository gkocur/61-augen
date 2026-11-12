// src/glossary/text.ts
import { isCardId, isSuit } from '../engine';
import { CARD_CASES, cardName, suitName, type CardCase } from './cardNames';
import { TERMS, formVariants, formsFor } from './terms';
import { CASES, type CaseKey, type TextContext } from './types';

const ALT = /\{([^{}|]*)\|([^{}|]*)\}/g;
const TOKEN = /\[\[([^[\]]+)\]\]/g;

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isCaseKey = (s: string): s is CaseKey => (CASES as readonly string[]).includes(s);
const isCardCase = (s: string): s is CardCase => (CARD_CASES as readonly string[]).includes(s);
const hasTerm = (key: string) => Object.hasOwn(TERMS, key);

interface ParsedToken {
  key: string;
  arg: string | undefined;
  /** Przypadek nazwy karty (tylko dla `card`). */
  cardCase: string | undefined;
  capital: boolean;
  extra: boolean;
}

function parseToken(raw: string): ParsedToken {
  const [head = '', arg, ...rest] = raw.split(':');
  const key = lowerFirst(head);
  const allowsCase = key === 'card';
  return {
    key,
    arg,
    cardCase: allowsCase ? rest[0] : undefined,
    capital: head !== key,
    extra: rest.length > (allowsCase ? 1 : 0),
  };
}

function lookup(token: ParsedToken, ctx: TextContext): string | null {
  const { key, arg, cardCase } = token;
  if (key === 'card') {
    if (arg === undefined || !isCardId(arg)) return null;
    const c = cardCase ?? 'M';
    return isCardCase(c) ? cardName(arg, ctx, c) : null;
  }
  if (key === 'suit') return arg !== undefined && isSuit(arg) ? suitName(arg, ctx) : null;
  if (!hasTerm(key)) return null;
  const term = TERMS[key];
  const caseKey = arg ?? 'M';
  const word = isCaseKey(caseKey) ? formsFor(term, ctx)[caseKey] : undefined;
  return word ?? formsFor(term, { ...ctx, register: 'official' }).M;
}

function resolveToken(raw: string, ctx: TextContext): string {
  const token = parseToken(raw);
  const word = token.extra ? null : lookup(token, ctx);
  if (word === null) return `[[${raw}]]`;
  return token.capital ? upperFirst(word) : word;
}

export function resolveText(text: string, ctx: TextContext): string {
  const chosen = text.replace(ALT, (_match, official: string, colloquial: string) =>
    ctx.register === 'official' ? official : colloquial,
  );
  return chosen.replace(TOKEN, (_match, raw: string) => resolveToken(raw, ctx));
}

function checkToken(raw: string): string | null {
  const { key, arg, cardCase, extra } = parseToken(raw);
  if (extra) return `Zły token: ${raw}`;
  if (key === 'card') {
    if (arg === undefined || !isCardId(arg)) return `Nieznana karta: ${arg ?? ''}`;
    return cardCase === undefined || isCardCase(cardCase) ? null : `Nieznana forma karty: ${cardCase}`;
  }
  if (key === 'suit') return arg !== undefined && isSuit(arg) ? null : `Nieznany kolor: ${arg ?? ''}`;
  if (!hasTerm(key)) return `Nieznany termin: ${key}`;
  const caseKey = arg ?? 'M';
  if (!isCaseKey(caseKey)) return `Nieznana forma: ${caseKey}`;
  const missing = formVariants(TERMS[key]).some((forms) => forms[caseKey] === undefined);
  return missing ? `Brak formy ${caseKey} dla terminu ${key}` : null;
}

/** Lista problemów z tokenami i składnią w tekście (pusta = OK). */
export function findTextIssues(text: string): string[] {
  const issues: string[] = [];
  const withoutAlts = text.replace(ALT, (match, official: string, colloquial: string) => {
    if (official.trim() === '' || colloquial.trim() === '') issues.push(`Pusta alternatywa: ${match}`);
    return ' ';
  });
  if (/[{}|]/.test(withoutAlts)) issues.push('Niedomknięta alternatywa');
  for (const match of text.matchAll(TOKEN)) {
    const issue = checkToken(match[1]);
    if (issue) issues.push(issue);
  }
  const withoutTokens = text.replace(TOKEN, '');
  if (withoutTokens.includes('[[') || withoutTokens.includes(']]')) issues.push('Niedomknięty token');
  return issues;
}
