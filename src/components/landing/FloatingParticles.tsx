
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

export function FloatingParticles() {
  const [particles, setParticles] = useState<ParticleStyle[]>([]);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    const generateParticleStyles = () => {
      const newParticles: ParticleStyle[] = [];
      for (let i = 0; i < 40; i++) {
        const colorClass =
          i % 4 === 0
            ? "bg-yellow-400"
            : i % 4 === 1
            ? "bg-amber-500"
            : i % 4 === 2
            ? "bg-red-400"
            : "bg-yellow-600";
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
  }, []); // Empty dependency array ensures this runs once on mount

  if (particles.length === 0) {
    // Render nothing on the server and on initial client render before useEffect runs
    return null; 
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((style, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
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
