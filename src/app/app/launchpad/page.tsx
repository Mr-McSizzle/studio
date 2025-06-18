
"use client"

import dynamic from "next/dynamic"
import { Suspense, useMemo, useRef } from "react"
import Link from "next/link"
// Removed R3F/Drei imports from here
import { User, Settings, Swords, Trophy, ChevronRight } from "lucide-react"
// Removed THREE imports from here

// Define GalaxyCanvas and its sub-components first, including their R3F/Drei imports
const GalaxyCanvasContent = () => {
  // Moved R3F/Drei imports inside this component or a component it uses
  const { Canvas, useFrame } = require("@react-three/fiber");
  const { Stars, OrbitControls, Float, MeshDistortMaterial, Environment } = require("@react-three/drei");
  const THREE_NAMESPACE = require("three");


  function GalaxyCore() {
    const meshRef = useRef<THREE.Mesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    const uniforms = useMemo(
      () => ({
        time: { value: 0 },
        colorA: { value: new THREE_NAMESPACE.Color("#1a0b2e") },
        colorB: { value: new THREE_NAMESPACE.Color("#16213e") },
      }),
      [],
    )

    useFrame((state: any) => {
      if (materialRef.current) {
        materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.1
      }
      if (meshRef.current) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.05
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
      }
    })

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
    )
  }

  function NebulaCloud({ position }: { position: [number, number, number] }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state: any) => {
      if (meshRef.current) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.02
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
      }
    })

    return (
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} position={position}>
          <sphereGeometry args={[8, 32, 32]} />
          <MeshDistortMaterial
            color="#2d1b69"
            attach="material"
            distort={0.6}
            speed={1}
            roughness={0.8}
            transparent
            opacity={0.15}
          />
        </mesh>
      </Float>
    )
  }

  function StarField() {
    return (
      <>
        <Stars radius={300} depth={100} count={25000} factor={6} saturation={0} fade speed={0.5} />
        <Stars radius={150} depth={50} count={8000} factor={3} saturation={0} fade speed={0.3} />
      </>
    )
  }

  function FloatingDust() {
    const points = useMemo(() => {
      const temp = []
      for (let i = 0; i < 2000; i++) {
        temp.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200)
      }
      return new Float32Array(temp)
    }, [])

    return (
      // @ts-ignore
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={points} count={points.length / 3} itemSize={3} />
        </bufferGeometry>
        {/* @ts-ignore */}
        <pointsMaterial size={0.5} color="#6366f1" transparent opacity={0.6} />
      </points>
    )
  }

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


const GalaxyCanvas = dynamic(() => Promise.resolve(GalaxyCanvasContent), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center bg-slate-950"><p className="text-white text-lg">Loading Galaxy...</p></div>,
});


export default function LaunchpadPage() {
  const navigationItems = [
    {
      title: "Founder Profile",
      description: "Craft your cosmic identity",
      icon: User,
      href: "/app/profile",
    },
    {
      title: "Setup Simulation",
      description: "Design your universe",
      icon: Settings,
      href: "/app/setup",
    },
    {
      title: "Clash of Sims",
      description: "Battle across dimensions (Coming Soon)",
      icon: Swords,
      href: "/app/launchpad", // Placeholder, links back to itself
    },
    {
      title: "Milestones & Score",
      description: "Unlock cosmic rewards",
      icon: Trophy,
      href: "/app/gamification",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden font-inter">
      <div className="absolute inset-0 z-0">
        <GalaxyCanvas />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-indigo-950/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-transparent to-indigo-950/20 z-10" />

      <div className="relative z-20 min-h-screen flex flex-col">
        <header className="p-6 pt-16 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-1 h-10 bg-gradient-to-b from-transparent via-indigo-400/60 to-transparent mr-6" />
              <h1 className="text-6xl md:text-7xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-200 tracking-[-0.03em] leading-[0.9]">
                ForgeSim Launchpad
              </h1>
              <div className="w-1 h-10 bg-gradient-to-b from-transparent via-purple-400/60 to-transparent ml-6" />
            </div>
            <p className="text-lg md:text-xl text-slate-300/90 font-normal max-w-2xl mx-auto leading-relaxed tracking-[0.01em]">
              Gateway to your ForgeSim experience. Choose your path.
            </p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              return (
                <Link href={item.href} key={item.title}>
                  <div className="group relative">
                    <div className="relative backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 transition-all duration-700 hover:scale-[1.02] hover:border-white/[0.15] hover:bg-white/[0.04] cursor-pointer overflow-hidden group-hover:shadow-xl group-hover:shadow-indigo-500/[0.05]">
                      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
                      <div className="relative z-10 text-center">
                        <div className="mb-6 flex justify-center">
                          <div className="w-20 h-20 relative group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Icon className="w-10 h-10 text-slate-200/90 group-hover:text-white transition-colors duration-500" />
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xl md:text-2xl font-medium text-white/95 mb-3 tracking-[-0.01em]">
                          {item.title}
                        </h3>
                        <p className="text-slate-300/80 text-base mb-6 leading-relaxed tracking-[0.005em]">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-center text-slate-400/80 group-hover:text-slate-200 transition-all duration-500">
                          <span className="mr-3 font-normal tracking-[0.1em] text-xs uppercase">Enter</span>
                          <div className="backdrop-blur-sm bg-white/[0.04] border border-white/[0.08] rounded-full p-1.5">
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </main>

        <footer className="p-6 pb-12 text-center text-xs text-slate-400/70 uppercase tracking-[0.08em]">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400/80 rounded-full animate-pulse shadow-md shadow-emerald-400/30" />
              System Online
            </div>
            <div className="w-px h-4 bg-slate-600/50" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400/80 rounded-full animate-pulse shadow-md shadow-indigo-400/30" />
              Ready
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
