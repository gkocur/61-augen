// src/three/cardTextures.ts — tekstury kart: grafiki SVG rysowane na płótnie, rewers i sukno generowane w kodzie
import * as THREE from 'three';
import { rankOf, suitOf, type CardId } from '../engine';
import type { DeckKind } from '../glossary';

const W = 320;
const H = 480;
const SUIT_GLYPH = { c: '♣', s: '♠', h: '♥', d: '♦' } as const;
const SUIT_INK = { c: '#1c1c1c', s: '#1c1c1c', h: '#b3261e', d: '#b3261e' } as const;

const faces = new Map<string, THREE.CanvasTexture>();
const listeners = new Set<() => void>();

/** Scena rejestruje się tu, żeby odświeżyć kadr po wczytaniu grafiki. */
export function onTextureUpdate(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function finish(texture: THREE.CanvasTexture): THREE.CanvasTexture {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function drawPlaceholder(g: CanvasRenderingContext2D, card: CardId) {
  const suit = suitOf(card);
  g.fillStyle = '#fdfbf5';
  g.fillRect(0, 0, W, H);
  g.fillStyle = SUIT_INK[suit];
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '700 120px Georgia, serif';
  g.fillText(rankOf(card), W / 2, H * 0.36);
  g.font = '150px Georgia, serif';
  g.fillText(SUIT_GLYPH[suit], W / 2, H * 0.66);
}

/** Awers karty; od razu zwraca teksturę zastępczą, a po wczytaniu SVG podmienia jej treść. */
export function faceTexture(card: CardId, deck: DeckKind): THREE.CanvasTexture {
  const key = `${deck}/${card}`;
  const cached = faces.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  drawPlaceholder(g, card);
  const texture = finish(new THREE.CanvasTexture(canvas));
  faces.set(key, texture);

  const img = new Image();
  img.onload = () => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, W, H);
    // Jak w widoku 2D: grafika wpisana w kartę 2:3 na białym tle.
    const scale = Math.min(W / img.width, H / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    texture.needsUpdate = true;
    listeners.forEach((fn) => fn());
  };
  img.src = `cards/${deck}/${card}.svg`;
  return texture;
}

let back: THREE.CanvasTexture | null = null;

/** Rewers: granat i złoto (barwy Górnego Śląska), kratka z rombów. */
export function backTexture(): THREE.CanvasTexture {
  if (back) return back;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#f3ead6';
  g.fillRect(0, 0, W, H);
  const m = 18;
  g.fillStyle = '#17366b';
  g.fillRect(m, m, W - 2 * m, H - 2 * m);
  g.save();
  g.beginPath();
  g.rect(m, m, W - 2 * m, H - 2 * m);
  g.clip();
  g.strokeStyle = '#d9a441';
  g.lineWidth = 2.5;
  const step = 40;
  for (let x = -H; x < W + H; x += step) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + H * 0.62, H);
    g.moveTo(x, 0);
    g.lineTo(x - H * 0.62, H);
    g.stroke();
  }
  g.restore();
  g.strokeStyle = '#d9a441';
  g.lineWidth = 5;
  g.strokeRect(m + 8, m + 8, W - 2 * (m + 8), H - 2 * (m + 8));
  // Medalion na środku.
  g.fillStyle = '#17366b';
  g.beginPath();
  g.ellipse(W / 2, H / 2, 62, 62, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.fillStyle = '#d9a441';
  g.font = '700 84px Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('S', W / 2, H / 2 + 4);
  back = finish(new THREE.CanvasTexture(canvas));
  return back;
}

let felt: THREE.CanvasTexture | null = null;

/** Ziarnista faktura sukna. */
export function feltTexture(): THREE.CanvasTexture {
  if (felt) return felt;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d')!;
  const data = g.createImageData(size, size);
  // Stały generator: faktura wygląda tak samo przy każdym uruchomieniu.
  let seed = 61;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 205 + Math.floor(rand() * 50);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  felt = finish(new THREE.CanvasTexture(canvas));
  felt.wrapS = felt.wrapT = THREE.RepeatWrapping;
  felt.repeat.set(10, 10);
  return felt;
}
