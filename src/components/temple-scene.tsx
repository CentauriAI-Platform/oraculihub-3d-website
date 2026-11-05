"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, useTexture } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { pathways } from "@/lib/catalog";
const stone = "#252922",
  gold = "#a08450";
function Column({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.25, 0.3, 1.25]} />
        <meshStandardMaterial color={stone} roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <cylinderGeometry args={[0.38, 0.5, 6.1, 24]} />
        <meshStandardMaterial color={stone} roughness={0.83} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.42, 3.3, Math.cos(a) * 0.42]}
          >
            <cylinderGeometry args={[0.055, 0.06, 5.85, 6]} />
            <meshStandardMaterial color="#34382f" roughness={0.9} />
          </mesh>
        );
      })}
      <mesh position={[0, 6.45, 0]}>
        <boxGeometry args={[1.2, 0.35, 1.2]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      <mesh position={[0, 6.2, 0]}>
        <cylinderGeometry args={[0.58, 0.4, 0.2, 16]} />
        <meshStandardMaterial color={gold} metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}
function Brazier({ x, z }: { x: number; z: number }) {
  const flame = useRef<THREE.Mesh>(null),
    light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const f =
      1 +
      Math.sin(clock.elapsedTime * 12 + x) * 0.14 +
      Math.sin(clock.elapsedTime * 19) * 0.08;
    if (flame.current) flame.current.scale.y = f;
    if (light.current) light.current.intensity = 12 * f;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.17, 0.32, 1.3, 10]} />
        <meshStandardMaterial color={gold} metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.48, 0.18, 0.3, 16]} />
        <meshStandardMaterial color="#55412b" metalness={0.8} />
      </mesh>
      <mesh ref={flame} position={[0, 1.8, 0]}>
        <coneGeometry args={[0.18, 0.7, 7]} />
        <meshBasicMaterial color="#ffb752" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshBasicMaterial color="#ffedbd" />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 2, 0]}
        color="#ff9c3e"
        intensity={12}
        distance={9}
        decay={2}
      />
      <Sparkles
        count={16}
        scale={[0.9, 2, 0.9]}
        position={[0, 2.5, 0]}
        size={2}
        speed={0.5}
        color="#ffba64"
      />
    </group>
  );
}
function Door({ side, progress }: { side: number; progress: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current)
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        -side * Math.min(1, Math.max(0, (progress - 0.03) * 2.8)) * 1.55,
        0.08,
      );
  });
  return (
    <group ref={ref} position={[side * 2.1, 0, 4]}>
      <group position={[-side * 1.05, 3.2, 0]}>
        <mesh>
          <boxGeometry args={[2.1, 6.4, 0.22]} />
          <meshStandardMaterial
            color="#252720"
            metalness={0.72}
            roughness={0.4}
          />
        </mesh>
        {[-0.89, 0.89].map((x) => (
          <mesh key={x} position={[x, 0, 0.14]}>
            <boxGeometry args={[0.045, 6.1, 0.06]} />
            <meshStandardMaterial
              color={gold}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
        ))}
        {[-2.98, 2.98].map((y) => (
          <mesh key={y} position={[0, y, 0.14]}>
            <boxGeometry args={[1.83, 0.045, 0.06]} />
            <meshStandardMaterial
              color={gold}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
        ))}
        {[0.65, 1, 1.4].map((r) => (
          <mesh
            key={r}
            position={[side * 1.05, 0, 0.15]}
            rotation={[0, 0, side < 0 ? -Math.PI / 2 : Math.PI / 2]}
          >
            <torusGeometry args={[r, 0.018, 6, 64, Math.PI]} />
            <meshStandardMaterial
              color={gold}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh
            key={i}
            position={[Math.sin(i) * 0.55, Math.cos(i) * 1.8, 0.15]}
            rotation={[0, 0, Math.PI / 4]}
          >
            <boxGeometry args={[0.08, 0.08, 0.04]} />
            <meshStandardMaterial color={gold} metalness={0.8} />
          </mesh>
        ))}
        <mesh position={[side * 0.82, 0, 0.2]}>
          <torusGeometry args={[0.12, 0.022, 7, 20]} />
          <meshStandardMaterial
            color="#d5af69"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

// Original artwork forms sculptural reliefs in real 3D niches; swap this component for GLB assets when commissioned.
function Sculpture({ index, x }: { index: number; x: number }) {
  const p = pathways[index],
    router = useRouter(),
    [hover, setHover] = useState(false),
    texture = useTexture(`/images/${p.id}.webp`);
  return (
    <group
      position={[x, 0.3, -9]}
      onClick={() => {
        document.body.style.cursor = "auto";
        router.push(p.href);
      }}
      onPointerOver={() => {
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
    >
      <mesh position={[0, 2.1, -0.14]}>
        <boxGeometry args={[2.38, 4.3, 0.25]} />
        <meshStandardMaterial color="#151b13" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.1, 0.015]}>
        <planeGeometry args={[2.3, 4.2, 40, 64]} />
        <meshStandardMaterial
          map={texture}
          displacementMap={texture}
          displacementScale={0.08}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={hover ? 0.7 : 0.42}
          roughness={0.95}
        />
      </mesh>
      {[-1.2, 1.2].map((edge) => (
        <mesh key={edge} position={[edge, 2.1, 0.02]}>
          <boxGeometry args={[0.045, 4.4, 0.1]} />
          <meshStandardMaterial
            color={hover ? "#dfbd75" : gold}
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}
      <mesh position={[0, 4.3, 0.02]}>
        <boxGeometry args={[2.45, 0.045, 0.1]} />
        <meshStandardMaterial color={gold} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.13, 0.2]}>
        <boxGeometry args={[2.55, 0.32, 1.15]} />
        <meshStandardMaterial color="#242a1e" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0.2]}>
        <boxGeometry args={[2.63, 0.05, 1.2]} />
        <meshStandardMaterial color={gold} roughness={0.5} metalness={0.7} />
      </mesh>
      <pointLight
        position={[0, 3.7, 1]}
        color={p.color}
        intensity={hover ? 13 : 7}
        distance={5}
      />
    </group>
  );
}
function Temple({ progress }: { progress: number }) {
  useFrame(({ camera }) => {
    const t = Math.max(0, (progress - 0.25) / 0.75);
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      14 - t * 12.5,
      0.055,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      3.15 - t * 0.2,
      0.055,
    );
    camera.lookAt(0, 2.7, -9);
  });
  return (
    <>
      <color attach="background" args={["#080d0b"]} />
      <fog attach="fog" args={["#080d0b", 17, 38]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#b9c8cf", "#695133", 0.65]} />
      <directionalLight position={[0, 9, 7]} intensity={1.7} color="#d7bb8a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -5]}>
        <planeGeometry args={[36, 42]} />
        <meshStandardMaterial
          color="#242b23"
          metalness={0.32}
          roughness={0.4}
        />
      </mesh>
      {[-5.8, -3.5, 3.5, 5.8].map((x) => (
        <Column key={x} x={x} z={4} />
      ))}
      {[-4, 0, 4].flatMap((z) =>
        [-6.5, 6.5].map((x) => <Column key={`${x}-${z}`} x={x} z={z - 7} />),
      )}
      <mesh position={[0, 6.8, 4]}>
        <boxGeometry args={[14, 0.65, 1.6]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      <mesh position={[0, 7.6, 4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1, 1, 14, 3]} />
        <meshStandardMaterial color={stone} />
      </mesh>
      <Door side={-1} progress={progress} />
      <Door side={1} progress={progress} />
      <Brazier x={-2.9} z={5} />
      <Brazier x={2.9} z={5} />
      <Brazier x={-5.5} z={-7} />
      <Brazier x={5.5} z={-7} />
      <Suspense fallback={null}>
        {[-4.2, -1.4, 1.4, 4.2].map((x, i) => (
          <Sculpture index={i} x={x} key={x} />
        ))}
      </Suspense>
      <mesh position={[0, 5.2, -11]}>
        <torusGeometry args={[1.5, 0.018, 6, 100]} />
        <meshStandardMaterial
          emissive="#bd8d40"
          emissiveIntensity={1.3}
          color={gold}
        />
      </mesh>
      <mesh position={[0, 5.2, -11]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.1, 0.012, 5, 4]} />
        <meshStandardMaterial
          color={gold}
          emissive="#8a642b"
          emissiveIntensity={0.8}
        />
      </mesh>
      <Sparkles
        count={85}
        scale={[13, 6, 20]}
        size={1.8}
        speed={0.18}
        color="#c5a76d"
      />
    </>
  );
}
export default function ShrineScene({ progress }: { progress: number }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 3.15, 14], fov: 49 }}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      }}
      aria-label="Interactive three-dimensional shrine with opening doors and four pathway exhibits"
    >
      <Temple progress={progress} />
    </Canvas>
  );
}
