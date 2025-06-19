"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE_NAMESPACE from "three";

function GalaxyCore() {
  const meshRef = useRef<THREE_NAMESPACE.Mesh>(null!);
  const materialRef = useRef<THREE_NAMESPACE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      colorA: { value: new THREE_NAMESPACE.Color("#1a0b2e") },
      colorB: { value: new THREE_NAMESPACE.Color("#16213e") },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.1;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -50]}>
      <sphereGeometry args={[25, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec3 colorA;
          uniform vec3 colorB;
          varying vec2 vUv;
          
          void main() {
            vec2 uv = vUv;
            float noise = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time) * 0.5 + 0.5;
            vec3 color = mix(colorA, colorB, noise);
            gl_FragColor = vec4(color, 0.3);
          }
        `}
        transparent
        side={THREE_NAMESPACE.DoubleSide}
      />
    </mesh>
  );
}

function NebulaCloud({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE_NAMESPACE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[8, 32, 32]} />
        <MeshDistortMaterial
          color="#2d1b69"
          distort={0.6}
          speed={1}
          roughness={0.8}
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}

function StarField() {
  return (
    <>
      <Stars radius={300} depth={100} count={25000} factor={6} saturation={0} fade speed={0.5} />
      <Stars radius={150} depth={50} count={8000} factor={3} saturation={0} fade speed={0.3}/>
    </>
  );
}

function FloatingDust() {
  const points = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 2000; i++) {
      temp.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    }
    return new Float32Array(temp);
  }, []);

  return (
    // @ts-ignore The points element is valid in R3F
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={points} count={points.length / 3} itemSize={3} />
      </bufferGeometry>
       {/* @ts-ignore The pointsMaterial element is valid in R3F */}
      <pointsMaterial size={0.5} color="#6366f1" transparent opacity={0.6} />
    </points>
  );
}

export const GalaxyCanvas: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
      <Suspense fallback={null}>
        <StarField />
        <GalaxyCore />
        <NebulaCloud position={[-30, 15, -60]} />
        <NebulaCloud position={[25, -20, -80]} />
        <NebulaCloud position={[10, 30, -70]} />
        <FloatingDust />
        <Environment preset="night" />
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={0.8} color="#4338ca" />
        <pointLight position={[50, 50, -50]} intensity={0.3} color="#7c3aed" />
        <pointLight position={[-50, -50, -50]} intensity={0.3} color="#1e40af" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.1}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.2}
        />
      </Suspense>
    </Canvas>
  );
};
