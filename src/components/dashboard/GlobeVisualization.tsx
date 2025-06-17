"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp } from "lucide-react";
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';

// Earth component with glowing effect
function Earth({ globeTexture, bumpTexture, specularTexture }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const glowRef = useRef();
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0007;
    }
  });

  return (
    <group>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial 
          color={new THREE.Color(0x1a237e)} 
          transparent={true} 
          opacity={0.15} 
          side={THREE.BackSide} 
        />
      </mesh>
      
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={globeTexture}
          bumpMap={bumpTexture}
          bumpScale={0.05}
          specularMap={specularTexture}
          specular={new THREE.Color(0x333333)}
          shininess={5}
        />
      </mesh>
      
      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.03, 32, 32]} />
        <meshPhongMaterial 
          map={useTexture('/textures/earth_clouds.png')}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      
      {/* Data points */}
      {[...Array(20)].map((_, i) => {
        // Generate random positions on the sphere
        const phi = Math.acos(-1 + (2 * i) / 20);
        const theta = Math.sqrt(20 * Math.PI) * phi;
        
        const x = 2 * Math.sin(phi) * Math.cos(theta);
        const y = 2 * Math.sin(phi) * Math.sin(theta);
        const z = 2 * Math.cos(phi);
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshBasicMaterial color={i % 2 === 0 ? 0xffcc00 : 0x00ccff} />
          </mesh>
        );
      })}
    </group>
  );
}

// Connection lines between data points
function ConnectionLines() {
  const linesRef = useRef();
  
  useEffect(() => {
    if (linesRef.current) {
      const positions = [];
      const colors = [];
      
      // Create 15 random connections
      for (let i = 0; i < 15; i++) {
        // Start point
        const startPhi = Math.random() * Math.PI;
        const startTheta = Math.random() * Math.PI * 2;
        
        const startX = 2 * Math.sin(startPhi) * Math.cos(startTheta);
        const startY = 2 * Math.sin(startPhi) * Math.sin(startTheta);
        const startZ = 2 * Math.cos(startPhi);
        
        // End point
        const endPhi = Math.random() * Math.PI;
        const endTheta = Math.random() * Math.PI * 2;
        
        const endX = 2 * Math.sin(endPhi) * Math.cos(endTheta);
        const endY = 2 * Math.sin(endPhi) * Math.sin(endTheta);
        const endZ = 2 * Math.cos(endPhi);
        
        // Add to positions
        positions.push(startX, startY, startZ);
        positions.push(endX, endY, endZ);
        
        // Add colors
        const color = new THREE.Color(i % 2 === 0 ? 0xffcc00 : 0x00ccff);
        colors.push(color.r, color.g, color.b);
        colors.push(color.r, color.g, color.b);
      }
      
      const geometry = linesRef.current.geometry;
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }
  }, []);
  
  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial vertexColors={true} transparent={true} opacity={0.3} />
    </lineSegments>
  );
}

// Orbiting particles
function OrbitingParticles() {
  const particlesRef = useRef();
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const time = clock.getElapsedTime();
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const i3 = i / 3;
        const radius = 2.5 + Math.sin(i3) * 0.3;
        const speed = 0.2 + Math.random() * 0.1;
        
        positions[i] = radius * Math.cos(time * speed + i3);
        positions[i + 1] = 0.2 * Math.sin(time * 0.2 + i3);
        positions[i + 2] = radius * Math.sin(time * speed + i3);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  useEffect(() => {
    if (particlesRef.current) {
      const positions = [];
      const colors = [];
      const sizes = [];
      
      // Create particles
      for (let i = 0; i < 100; i++) {
        positions.push(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        );
        
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.7, 0.5);
        colors.push(color.r, color.g, color.b);
        
        sizes.push(Math.random() * 2);
      }
      
      const geometry = particlesRef.current.geometry;
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    }
  }, []);
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial 
        size={0.05} 
        vertexColors={true} 
        transparent={true}
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Scene setup
function Scene() {
  const { camera } = useThree();
  
  // Load textures
  const globeTexture = useTexture('/textures/earth_nightmap.jpg');
  const bumpTexture = useTexture('/textures/earth_bumpmap.jpg');
  const specularTexture = useTexture('/textures/earth_specular.jpg');
  
  useEffect(() => {
    camera.position.z = 5;
  }, [camera]);
  
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <Earth 
        globeTexture={globeTexture}
        bumpTexture={bumpTexture}
        specularTexture={specularTexture}
      />
      <ConnectionLines />
      <OrbitingParticles />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.3}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function GlobeVisualization() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading textures
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative w-full h-full aspect-square max-w-[600px] mx-auto">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-subtle-pulse"></div>
      <div className="absolute inset-0 bg-accent/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      
      {/* 3D Globe */}
      <div className="relative w-full h-full rounded-full overflow-hidden border border-accent/20 shadow-accent-glow-lg">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#040420]">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Canvas>
            <Scene />
          </Canvas>
        )}
      </div>
      
      {/* Overlay stats - matching the reference image */}
      <div className="absolute bottom-[15%] left-[10%] bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-accent/30">
        <div className="text-xs text-accent font-mono">PARCELS IN THE WAY</div>
        <div className="text-lg font-bold">24/75</div>
        <div className="text-xs text-green-400 flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          +15% vs last month
        </div>
      </div>
      
      <div className="absolute top-[15%] right-[10%] bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-primary/30">
        <div className="text-xs text-primary font-mono">TOTAL ORDERS</div>
        <div className="text-lg font-bold">2.4k+</div>
        <div className="flex items-center mt-1">
          <div className="h-1 flex-grow bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full w-[62%] bg-green-500 rounded-full"></div>
          </div>
          <span className="text-xs text-green-400 ml-2">62%</span>
        </div>
      </div>
      
      {/* Bottom right circular stats like in reference */}
      <div className="absolute bottom-[15%] right-[10%] flex items-center gap-3">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsla(var(--border)/0.3)" strokeWidth="2"></circle>
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsla(var(--accent)/0.8)" strokeWidth="2" strokeDasharray="100" strokeDashoffset="25"></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">75%</div>
        </div>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsla(var(--border)/0.3)" strokeWidth="2"></circle>
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsla(var(--muted-foreground)/0.5)" strokeWidth="2" strokeDasharray="100" strokeDashoffset="75"></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">25%</div>
        </div>
      </div>
      
      {/* Search bar like in reference */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-md border border-border/50 flex items-center px-2 py-1 w-[180px]">
        <Search className="h-3.5 w-3.5 text-muted-foreground mr-2" />
        <div className="text-xs text-muted-foreground">Search</div>
      </div>
      
      {/* Status indicators like in reference */}
      <div className="absolute top-[5%] right-[5%] flex items-center gap-2">
        <div className="bg-blue-500 rounded-md p-1.5">
          <div className="h-3.5 w-3.5 text-white"></div>
        </div>
        <div className="bg-muted/30 rounded-md p-1.5 flex items-center gap-1">
          <div className="h-2 w-2 bg-accent rounded-full"></div>
          <span className="text-xs text-white">10</span>
        </div>
      </div>
      
      {/* Left side metrics like in reference */}
      <div className="absolute left-[5%] top-[40%] space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-md">
            <div className="h-4 w-4"></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">On the way</div>
            <div className="text-sm font-bold">18.7k</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-500 p-1.5 rounded-md">
            <div className="h-4 w-4"></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Delivered</div>
            <div className="text-sm font-bold">52.4k+</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 p-1.5 rounded-md">
            <div className="h-4 w-4"></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Waiting</div>
            <div className="text-sm font-bold">8.3k+</div>
          </div>
        </div>
      </div>
    </div>
  );
}