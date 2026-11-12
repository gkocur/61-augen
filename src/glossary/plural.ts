// src/glossary/plural.ts
/** Forma rzeczownika po liczebniku: 1 → M, 2–4 (bez 12–14) → Mlm, reszta → Dlm. */
export function countCase(n: number): 'M' | 'Mlm' | 'Dlm' {
  if (n === 1) return 'M';
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'Mlm';
  return 'Dlm';
}

/** Dla zwykłych słów spoza słownika, np. pluralPl(5, ['karta', 'karty', 'kart']). */
export function pluralPl(n: number, [one, few, many]: [string, string, string]): string {
  const c = countCase(n);
  return c === 'M' ? one : c === 'Mlm' ? few : many;
}
