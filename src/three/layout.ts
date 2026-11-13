// src/three/layout.ts — kamera i docelowe położenia kart dla danej proporcji kadru
import * as THREE from 'three';
import type { CardId } from '../engine';
import { FOV, HAND_DISTANCE, handMetrics } from './layoutMath';
import type { Place, Side } from './sceneCards';

export interface Pose {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: number;
}

export interface TableLayout {
  camPos: THREE.Vector3;
  camQuat: THREE.Quaternion;
  portrait: boolean;
  /** Miejsce na stole, na które dany gracz kładzie kartę do lewy. */
  trickSlot: Record<Side, THREE.Vector3>;
  /** Miejsca na kufle. */
  mugs: THREE.Vector3[];
  /** Skąd wylatują karty przy rozdaniu. */
  deck: Pose;
  pose: (id: CardId, place: Place, lift: 'none' | 'hover' | 'selected') => Pose;
}

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const FACE_UP = new THREE.Quaternion().setFromAxisAngle(X, -Math.PI / 2);
const FACE_DOWN = new THREE.Quaternion().setFromAxisAngle(X, Math.PI / 2);

/** Stały „losowy” rozrzut z identyfikatora karty, w zakresie −1…1. */
function jitter(id: CardId, salt: number): number {
  let h = salt * 374761393;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 668265263);
  return (((h ^ (h >>> 13)) >>> 0) % 2001) / 1000 - 1;
}

const flat = (base: THREE.Quaternion, spin: number) => new THREE.Quaternion().setFromAxisAngle(Y, spin).multiply(base);

export function computeLayout(aspect: number): TableLayout {
  const portrait = aspect < 0.95;
  // Tyle stołu (w poziomie, od środka) musi się zmieścić w kadrze.
  const halfW = portrait ? 2.15 : 3.5;
  const tanH = Math.tan((FOV * Math.PI) / 360) * aspect;
  const dist = Math.min(15, Math.max(9.2, halfW / tanH));
  const target = new THREE.Vector3(0, 0, portrait ? 0.85 : 1.05);
  const dir = new THREE.Vector3(0, 0.8, portrait ? 0.5 : 0.6).normalize();
  const camPos = target.clone().addScaledVector(dir, dist);
  const camQuat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(camPos, target, Y));

  const hand = handMetrics(aspect);
  const tableW = portrait ? 0.78 : 0.82;
  const oppW = portrait ? 0.52 : 0.66;
  const oppX = portrait ? 1.28 : 2.75;
  const oppZ = portrait ? -2.35 : -1.25;

  const trickSlot: Record<Side, THREE.Vector3> = {
    you: new THREE.Vector3(0, 0, 0.62),
    left: new THREE.Vector3(-0.62, 0, -0.18),
    right: new THREE.Vector3(0.62, 0, -0.18),
  };
  const trickSpin: Record<Side, number> = { you: 0, left: 0.55, right: -0.55 };
  const pile: Record<Side, THREE.Vector3> = portrait
    ? { you: new THREE.Vector3(1.5, 0, 2.3), left: new THREE.Vector3(-1.6, 0, -0.75), right: new THREE.Vector3(1.6, 0, -0.75) }
    : { you: new THREE.Vector3(2.35, 0, 2.05), left: new THREE.Vector3(-3.15, 0, -0.1), right: new THREE.Vector3(3.15, 0, -0.1) };
  const skat = new THREE.Vector3(0, 0, portrait ? -1.45 : -1.55);
  const mugs = portrait
    ? [new THREE.Vector3(1.95, 0, 0.75)]
    : [new THREE.Vector3(-4.15, 0, 0.35), new THREE.Vector3(3.7, 0, -1.75)];

  const pose = (id: CardId, place: Place, lift: 'none' | 'hover' | 'selected'): Pose => {
    switch (place.zone) {
      case 'hand': {
        const n = place.count;
        const mid = (n - 1) / 2;
        const step = n > 1 ? Math.min(hand.w * 0.62, (hand.visW * 0.94 - hand.w) / (n - 1)) : 0;
        const norm = mid > 0 ? (place.index - mid) / mid : 0;
        const fan = Math.min(0.24, 0.03 * n);
        const up = lift === 'selected' ? hand.h * 0.24 : lift === 'hover' ? hand.h * 0.08 : 0;
        const local = new THREE.Vector3(
          (place.index - mid) * step,
          -hand.visH / 2 + hand.h * 0.58 - norm * norm * hand.h * 0.4 * fan + up,
          -HAND_DISTANCE + place.index * 0.006,
        );
        const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, 0, -norm * fan));
        return { pos: local.applyQuaternion(camQuat).add(camPos), quat: camQuat.clone().multiply(rot), scale: hand.w };
      }
      case 'opp': {
        const sign = place.side === 'left' ? -1 : 1;
        const n = place.count;
        const mid = (n - 1) / 2;
        // Prawy wachlarz jest lustrzanym odbiciem lewego.
        const index = place.side === 'left' ? place.index : n - 1 - place.index;
        const norm = mid > 0 ? (index - mid) / mid : 0;
        // Karty stoją w wachlarzu, awersem do właściciela — gracz widzi rewersy.
        const yaw = Math.atan2(sign * 0.5, -0.87);
        const orient = new THREE.Quaternion().setFromAxisAngle(Y, yaw).multiply(new THREE.Quaternion().setFromAxisAngle(X, 0.5));
        const step = Math.min(oppW * 0.3, (oppW * 2.4) / Math.max(1, n - 1));
        const local = new THREE.Vector3(-(index - mid) * step, -norm * norm * oppW * 0.1, index * 0.005);
        return {
          pos: local.applyQuaternion(orient).add(new THREE.Vector3(sign * oppX, oppW * 0.8, oppZ)),
          quat: orient.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), norm * 0.3)),
          scale: oppW,
        };
      }
      case 'trick': {
        const slot = trickSlot[place.side];
        return {
          pos: new THREE.Vector3(slot.x + jitter(id, 1) * 0.04, 0.014 + place.order * 0.008, slot.z + jitter(id, 2) * 0.04),
          quat: flat(FACE_UP, trickSpin[place.side] + jitter(id, 3) * 0.14),
          scale: tableW,
        };
      }
      case 'pile': {
        const p = pile[place.side];
        return {
          pos: new THREE.Vector3(p.x + jitter(id, 4) * 0.05, 0.012 + place.index * 0.007, p.z + jitter(id, 5) * 0.05),
          quat: flat(FACE_DOWN, (place.side === 'you' ? 0.3 : place.side === 'left' ? 1.2 : -1.2) + jitter(id, 6) * 0.22),
          scale: tableW * 0.8,
        };
      }
      case 'skat':
        return {
          pos: new THREE.Vector3(skat.x + (place.index - 0.5) * tableW * 0.62, 0.012 + place.index * 0.008, skat.z + jitter(id, 7) * 0.03),
          quat: flat(place.faceUp ? FACE_UP : FACE_DOWN, (place.index - 0.5) * 0.3),
          scale: tableW * 0.9,
        };
    }
  };

  return {
    camPos,
    camQuat,
    portrait,
    trickSlot,
    mugs,
    deck: { pos: new THREE.Vector3(0, 0.5, -0.4), quat: FACE_DOWN.clone(), scale: tableW },
    pose,
  };
}
