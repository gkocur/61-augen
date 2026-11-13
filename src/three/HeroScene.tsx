// src/three/HeroScene.tsx — cztery walety (najstarsze atuty w szkacie) w świetle lampy
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CardId } from '../engine';
import type { DeckKind } from '../glossary';
import { CardMesh } from './CardMesh';
import { onTextureUpdate } from './cardTextures';

// Kolejność starszeństwa waletów: trefl, pik, kier, karo.
const JACKS: CardId[] = ['c-J', 's-J', 'h-J', 'd-J'];

export default function HeroScene({ deck }: { deck: DeckKind }) {
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return (
    <Canvas dpr={[1, 2]} frameloop={still ? 'demand' : 'always'} camera={{ fov: 32, position: [0, 0.15, 6.4] }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} color="#ffe9c9" />
      <spotLight position={[0, 5, 4]} angle={0.7} penumbra={1} intensity={160} color="#ffd9a0" />
      <pointLight position={[-4, -1, 2]} intensity={18} color="#3f74c4" />
      <Jacks deck={deck} still={still} />
    </Canvas>
  );
}

function Jacks({ deck, still }: { deck: DeckKind; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const cards = useRef<(THREE.Group | null)[]>([]);
  const invalidate = useThree((s) => s.invalidate);
  const width = useThree((s) => s.viewport.width);
  useEffect(() => onTextureUpdate(() => invalidate()), [invalidate]);

  // Wachlarz mieści się w kadrze także na wąskim telefonie.
  const fit = Math.min(1, width / 4.6);

  useFrame(({ clock, pointer }) => {
    if (still) return;
    const t = clock.elapsedTime;
    const g = group.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.35, 0.05);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.18, 0.05);
    }
    cards.current.forEach((card, i) => {
      if (!card) return;
      card.position.y = Math.sin(t * 0.8 + i * 1.1) * 0.05 - Math.abs(i - 1.5) * 0.09;
      card.rotation.y = Math.sin(t * 0.5 + i * 0.9) * 0.16 + (i - 1.5) * -0.12;
    });
  });

  return (
    <group ref={group} scale={fit}>
      {JACKS.map((card, i) => (
        <group
          key={card}
          ref={(el) => {
            cards.current[i] = el;
          }}
          position={[(i - 1.5) * 0.92, -Math.abs(i - 1.5) * 0.09, i * 0.06]}
          rotation={[0, (i - 1.5) * -0.12, (i - 1.5) * -0.13]}
          scale={1.25}
        >
          <CardMesh card={card} deck={deck} castShadow={false} />
        </group>
      ))}
    </group>
  );
}
