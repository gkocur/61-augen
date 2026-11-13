// src/three/TableScene.tsx — stół do szkata w 3D: sukno, lampa, kufle i karty lecące między miejscami
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { CardId } from '../engine';
import type { DeckKind } from '../glossary';
import { CardMesh } from './CardMesh';
import { feltTexture, onTextureUpdate } from './cardTextures';
import { computeLayout, type Pose, type TableLayout } from './layout';
import { FOV } from './layoutMath';
import type { SceneCard, Side } from './sceneCards';

export interface TableSceneProps {
  cards: SceneCard[];
  deck: DeckKind;
  selected?: readonly CardId[];
  dimmed?: (card: CardId) => boolean;
  /** Klik w kartę z ręki gracza; brak = ręka nieaktywna. */
  onCardClick?: (card: CardId) => void;
  /** Czyj ruch — podświetla miejsce na stole. */
  activeSide?: Side | null;
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function TableScene(props: TableSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} frameloop="demand" camera={{ fov: FOV, near: 0.1, far: 60 }} gl={{ antialias: true }}>
      <World {...props} />
    </Canvas>
  );
}

function World({ cards, deck, selected = [], dimmed, onCardClick, activeSide = null }: TableSceneProps) {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const layout = useMemo(() => computeLayout(size.width / Math.max(1, size.height)), [size.width, size.height]);

  useLayoutEffect(() => {
    camera.position.copy(layout.camPos);
    camera.quaternion.copy(layout.camQuat);
    camera.updateMatrixWorld();
    invalidate();
  }, [camera, layout, invalidate]);

  useEffect(() => onTextureUpdate(() => invalidate()), [invalidate]);

  return (
    <>
      <color attach="background" args={['#0c0a08']} />
      <fog attach="fog" args={['#0c0a08', 14, 30]} />
      <ambientLight intensity={0.55} color="#ffe9c9" />
      <spotLight
        position={[0.6, 9, 0.5]}
        angle={0.62}
        penumbra={0.9}
        intensity={520}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[layout.camPos.x, layout.camPos.y, layout.camPos.z]} intensity={0.9} color="#fff4e2" />
      <Table />
      {layout.mugs.map((p, i) => (
        <Mug key={i} position={p} turn={i === 0 ? 0.6 : 2.4} />
      ))}
      {activeSide && <TurnRing position={layout.trickSlot[activeSide]} />}
      {cards.map((card, index) => (
        <FlyingCard
          key={card.id}
          card={card}
          index={index}
          deck={deck}
          layout={layout}
          selected={selected.includes(card.id)}
          dimmed={card.place.zone === 'hand' && (dimmed?.(card.id) ?? false)}
          onClick={card.place.zone === 'hand' ? onCardClick : undefined}
        />
      ))}
    </>
  );
}

interface FlyingCardProps {
  card: SceneCard;
  index: number;
  deck: DeckKind;
  layout: TableLayout;
  selected: boolean;
  dimmed: boolean;
  onClick?: (card: CardId) => void;
}

/** Karta, która płynnie przelatuje do swojego aktualnego miejsca (ręka → stół → stos). */
function FlyingCard({ card, index, deck, layout, selected, dimmed, onClick }: FlyingCardProps) {
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const invalidate = useThree((s) => s.invalidate);
  const interactive = onClick !== undefined;
  const target: Pose = layout.pose(card.id, card.place, selected ? 'selected' : hover && interactive ? 'hover' : 'none');
  const targetRef = useRef(target);
  targetRef.current = target;
  // Logiczna pozycja (bez łuku lotu) i opóźnienie startu przy rozdawaniu.
  const current = useRef<THREE.Vector3 | null>(null);
  const wait = useRef(0.15 + index * 0.035);

  useLayoutEffect(() => {
    const g = group.current!;
    if (reducedMotion()) {
      current.current = target.pos.clone();
      g.position.copy(target.pos);
      g.quaternion.copy(target.quat);
      g.scale.setScalar(target.scale);
    } else {
      current.current = layout.deck.pos.clone();
      g.position.copy(layout.deck.pos);
      g.quaternion.copy(layout.deck.quat);
      g.scale.setScalar(layout.deck.scale);
    }
    // Tylko przy pierwszym pokazaniu karty.
  }, []);

  useEffect(() => {
    invalidate();
  });

  useEffect(() => {
    if (!hover) return;
    document.body.style.cursor = interactive ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hover, interactive]);

  useFrame((state, rawDelta) => {
    const g = group.current;
    const cur = current.current;
    if (!g || !cur) return;
    const delta = Math.min(rawDelta, 0.05);
    if (wait.current > 0) {
      wait.current -= delta;
      state.invalidate();
      return;
    }
    const t = targetRef.current;
    const k = reducedMotion() ? 1 : 1 - Math.exp(-delta * 9);
    cur.lerp(t.pos, k);
    g.quaternion.slerp(t.quat, k);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, t.scale, k));
    const left = cur.distanceTo(t.pos);
    g.position.copy(cur);
    // Łuk lotu: im dalej do celu, tym wyżej nad stołem.
    g.position.y += Math.min(0.5, left * 0.22);
    if (left > 0.002 || g.quaternion.angleTo(t.quat) > 0.004 || Math.abs(g.scale.x - t.scale) > 0.002) state.invalidate();
    else {
      cur.copy(t.pos);
      g.position.copy(t.pos);
      g.quaternion.copy(t.quat);
      g.scale.setScalar(t.scale);
    }
  });

  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();
  return (
    <group
      ref={group}
      onClick={
        interactive
          ? (e) => {
              stop(e);
              onClick(card.id);
            }
          : undefined
      }
      onPointerOver={
        interactive
          ? (e) => {
              stop(e);
              setHover(true);
            }
          : undefined
      }
      onPointerOut={interactive ? () => setHover(false) : undefined}
    >
      <CardMesh card={card.id} deck={deck} dimmed={dimmed} selected={selected} castShadow={card.place.zone !== 'hand'} />
    </group>
  );
}

const TABLE_R = 5.4;

function Table() {
  const felt = useMemo(() => feltTexture(), []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[TABLE_R, 96]} />
        <meshStandardMaterial color="#1f6846" map={felt} roughness={1} />
      </mesh>
      {/* Dębowa rama i blat pod suknem */}
      <mesh rotation-x={Math.PI / 2} position-y={0.03} castShadow receiveShadow>
        <torusGeometry args={[TABLE_R + 0.16, 0.2, 20, 128]} />
        <meshStandardMaterial color="#5b3620" roughness={0.42} metalness={0.05} />
      </mesh>
      <mesh position-y={-0.3}>
        <cylinderGeometry args={[TABLE_R + 0.3, TABLE_R + 0.1, 0.5, 96]} />
        <meshStandardMaterial color="#3a2114" roughness={0.6} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-4}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#120d0a" roughness={1} />
      </mesh>
    </group>
  );
}

/** Kufel piwa z pianą — z prostych brył. */
function Mug({ position, turn }: { position: THREE.Vector3; turn: number }) {
  return (
    <group position={position} rotation-y={turn} scale={0.9}>
      <mesh position-y={0.36} castShadow>
        <cylinderGeometry args={[0.27, 0.25, 0.68, 32]} />
        <meshStandardMaterial color="#d08a1c" emissive="#7a4706" emissiveIntensity={0.55} roughness={0.25} />
      </mesh>
      <mesh position-y={0.76} castShadow>
        <cylinderGeometry args={[0.29, 0.275, 0.14, 32]} />
        <meshStandardMaterial color="#fff6e3" roughness={0.95} />
      </mesh>
      <mesh position-y={0.4}>
        <cylinderGeometry args={[0.31, 0.29, 0.8, 32, 1, true]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.16} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0.31, 0.4, 0]} rotation-z={-Math.PI / 2} castShadow>
        <torusGeometry args={[0.19, 0.04, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#f1ead9" transparent opacity={0.55} roughness={0.1} />
      </mesh>
    </group>
  );
}

/** Mosiężny krąg w miejscu, gdzie gracz na ruchu położy kartę. */
function TurnRing({ position }: { position: THREE.Vector3 }) {
  return (
    <mesh position={[position.x, 0.006, position.z]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.5, 0.56, 64]} />
      <meshBasicMaterial color="#f0bb4a" transparent opacity={0.75} />
    </mesh>
  );
}
