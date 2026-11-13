// src/three/CardMesh.tsx — bryła karty: awers, rewers i złota obwódka zaznaczenia
import { useMemo } from 'react';
import * as THREE from 'three';
import type { CardId } from '../engine';
import type { DeckKind } from '../glossary';
import { backTexture, faceTexture } from './cardTextures';
import { CARD_RATIO } from './layoutMath';

function roundedCard(width: number, height: number, radius: number): THREE.ShapeGeometry {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ShapeGeometry(shape, 6);
  // ShapeGeometry daje UV we współrzędnych kształtu — przeliczamy na 0…1.
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - x) / width, (uv.getY(i) - y) / height);
  return geometry;
}

// Karta o szerokości 1; rozmiar nadaje skala grupy.
const FRONT = roundedCard(1, CARD_RATIO, 0.07);
const BACK = roundedCard(1, CARD_RATIO, 0.07).rotateY(Math.PI);
const OUTLINE = roundedCard(1.07, CARD_RATIO + 0.07, 0.1);
const GOLD = new THREE.MeshBasicMaterial({ color: '#f0bb4a', side: THREE.DoubleSide });

interface Props {
  card: CardId;
  deck: DeckKind;
  dimmed?: boolean;
  selected?: boolean;
  castShadow?: boolean;
}

export function CardMesh({ card, deck, dimmed = false, selected = false, castShadow = true }: Props) {
  const face = useMemo(() => faceTexture(card, deck), [card, deck]);
  const back = useMemo(() => backTexture(), []);
  return (
    <>
      <mesh geometry={FRONT} position-z={0.004} castShadow={castShadow} receiveShadow>
        <meshStandardMaterial
          map={face}
          emissiveMap={face}
          emissive="#ffffff"
          emissiveIntensity={dimmed ? 0.06 : 0.22}
          color={dimmed ? '#6f6a63' : '#ffffff'}
          roughness={0.5}
        />
      </mesh>
      <mesh geometry={BACK} position-z={-0.004} castShadow={castShadow} receiveShadow>
        <meshStandardMaterial map={back} emissiveMap={back} emissive="#ffffff" emissiveIntensity={0.12} roughness={0.55} />
      </mesh>
      <mesh geometry={OUTLINE} material={GOLD} visible={selected} />
    </>
  );
}
