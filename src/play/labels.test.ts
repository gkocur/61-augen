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
