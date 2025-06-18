
"use client";

import { useState, useEffect } from 'react';

interface ParticleStyle {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
  boxShadow: string;
  colorClass: string;
}

interface FloatingParticlesProps {
  particleColors?: string[]; // e.g., ["bg-sky-400", "bg-blue-500", "bg-slate-400"]
}

export function FloatingParticles({ particleColors }: FloatingParticlesProps) {
  const [particles, setParticles] = useState<ParticleStyle[]>([]);
  
  const defaultColors = ["bg-sky-400", "bg-blue-500", "bg-slate-300", "bg-sky-600", "bg-blue-400"];
  const currentColors = particleColors && particleColors.length > 0 ? particleColors : defaultColors;


  useEffect(() => {
    const generateParticleStyles = () => {
      const newParticles: ParticleStyle[] = [];
      for (let i = 0; i < 40; i++) {
        const colorClass = currentColors[i % currentColors.length];
        newParticles.push({
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
          boxShadow: `0 0 ${4 + Math.random() * 8}px currentColor`,
          colorClass: colorClass,
        });
      }
      setParticles(newParticles);
    };

    generateParticleStyles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  if (particles.length === 0) {
    return null; 
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((style, i) => (
        <div
          key={i}
          className="absolute animate-pulse" // Using Tailwind 'animate-pulse' which uses opacity
          style={{
            left: style.left,
            top: style.top,
            animationDelay: style.animationDelay,
            animationDuration: style.animationDuration,
          }}
        >
          <div
            className={`w-1 h-1 rounded-full ${style.colorClass}`}
            style={{ boxShadow: style.boxShadow }}
          />
        </div>
      ))}
    </div>
  );
}
