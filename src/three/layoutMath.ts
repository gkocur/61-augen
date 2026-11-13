// src/three/layoutMath.ts — wymiary ręki gracza na ekranie (bez three.js, używane też przez HUD)
export const FOV = 40;
/** Odległość ręki gracza od kamery. */
export const HAND_DISTANCE = 4;
export const CARD_RATIO = 1.5;

export interface HandMetrics {
  /** Widoczna wysokość i szerokość kadru w odległości ręki. */
  visH: number;
  visW: number;
  /** Szerokość i wysokość karty w ręce. */
  w: number;
  h: number;
  /** Jaką część wysokości kadru (od dołu) zajmuje ręka. */
  frac: number;
}

export function handMetrics(aspect: number): HandMetrics {
  const visH = 2 * HAND_DISTANCE * Math.tan((FOV * Math.PI) / 360);
  const visW = visH * aspect;
  const w = Math.min(0.5, visW / 4.4);
  const h = w * CARD_RATIO;
  return { visH, visW, w, h, frac: (h * 1.12) / visH };
}

/** Wyłącznie w przeglądarce z WebGL; jsdom i stare przeglądarki dostają widok 2D. */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined' || typeof WebGLRenderingContext === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
