// src/app/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { ArrowRight, PlayCircle, Brain, PackageOpen, ShieldCheck, TrendingUpIcon, Users, Zap, Aperture, Gem, Cog } from 'lucide-react'; // Added Aperture, Gem, Cog
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

const InteractiveLuxuryBackground = () => {
  const [isClient, setIsClient] = useState(false);
  const [shapeStyles, setShapeStyles] = useState<React.CSSProperties[]>([]);
  const [particleStyles, setParticleStyles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    setIsClient(true);

    const generateShapeStyles = () =>
      Array.from({ length: 10 }).map(() => {
        const size = Math.random() * 80 + 40; // 40px to 120px
        const duration = Math.random() * 10 + 20; // 20s to 30s
        const delay = Math.random() * -5; // -5s to 0s
        const initialRotateX = Math.random() * 360;
        const initialRotateY = Math.random() * 360;
        const initialTranslateZ = Math.random() * 200 - 100; // -100px to 100px
        const opacity = Math.random() * 0.2 + 0.1; // 0.1 to 0.3

        return {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `translateZ(${initialTranslateZ}px) rotateX(${initialRotateX}deg) rotateY(${initialRotateY}deg)`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          opacity: opacity,
          '--start-z': `${initialTranslateZ}px`,
          '--start-rotateX': `${initialRotateX}deg`,
          '--start-rotateY': `${initialRotateY}deg`,
          '--start-opacity': opacity,
           boxShadow: `0 0 ${size / 5}px hsla(var(--${['primary', 'accent', 'secondary'][Math.floor(Math.random()*3)]}), 0.5)`, // Dynamic shadow based on color
        } as React.CSSProperties;
      });

    const generateParticleStyles = () =>
      Array.from({ length: 40 }).map(() => {
        const size = Math.random() * 2 + 1; // 1px to 3px
        const duration = Math.random() * 5 + 3; // 3s to 8s
        const delay = Math.random() * -5;
        const initialOpacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8

        return {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          opacity: initialOpacity,
          '--start-opacity': initialOpacity,
          boxShadow: `0 0 6px 1px hsl(var(--accent)/0.7)`,
        } as React.CSSProperties;
      });

      setShapeStyles(generateShapeStyles());
      setParticleStyles(generateParticleStyles());
  }, []);


  if (!isClient) {
    // Render a simpler background or nothing during SSR / pre-hydration
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10">
          <Aperture className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] text-primary/5 opacity-20 animate-spin-slowest pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10 perspective-1000">
      {/* Static very subtle background element */}
      <Aperture className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] text-primary/5 opacity-20 animate-spin-slowest pointer-events-none" />

      {/* Floating 3D Shapes */}
      {shapeStyles.map((style, i) => {
        const colorClass = ['bg-accent/30', 'bg-primary/20', 'bg-secondary/20'][i % 3];
        const shapeClass = i % 2 === 0 ? 'rounded-lg' : 'rounded-full';
        return (
          <div
            key={`shape-${i}`}
            className={cn(
              'absolute opacity-30 animate-float-rotate-3d',
              colorClass,
              shapeClass
            )}
            style={style}
          />
        );
      })}

      {/* Sparkling Gold Particles */}
      {particleStyles.map((style, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full bg-accent animate-sparkle"
          style={style}
        />
      ))}
    </div>
  );
};


interface FeatureCard3DProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  animationDelay: string;
}

const FeatureCard3D: React.FC<FeatureCard3DProps> = ({ title, description, icon, animationDelay }) => {
  return (
    <div className={cn(
      "group relative bg-card/50 backdrop-blur-md border border-primary/20 rounded-xl p-6 md:p-8 shadow-card-deep transform-style-preserve-3d transition-all duration-300 hover:shadow-primary-glow-md animate-fadeInUp",
      animationDelay
    )}>
      <div className="relative z-10 transition-transform duration-300 group-hover:rotate-y-10 group-hover:rotate-x-5 group-hover:scale-105">
        <div className="absolute -top-5 -left-5 w-16 h-16 bg-gradient-to-br from-accent to-yellow-400 rounded-full flex items-center justify-center text-accent-foreground shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
        </div>
        <Cog className="absolute -top-2 -right-2 w-8 h-8 text-secondary/30 animate-spin-slow opacity-50 group-hover:opacity-75 transition-opacity" />
        <h3 className="mt-12 text-2xl md:text-3xl font-headline font-bold mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-300 to-yellow-500">{title}</span>
        </h3>
        <p className="text-muted-foreground/80 text-sm leading-relaxed">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 shadow-inner-soft-gold" />
    </div>
  );
};

interface ExperienceItemProps {
  title: string;
  icon: React.ReactNode;
  animationDelay: string;
}
const ExperienceItem: React.FC<ExperienceItemProps> = ({ title, icon, animationDelay }) => (
  <div className={cn("flex flex-col items-center text-center animate-fadeInUp", animationDelay)}>
    <div className="p-3 mb-2 rounded-full bg-accent/10 border border-accent/30 text-accent shadow-inner-soft-gold">
      {icon}
    </div>
    <h4 className="text-md font-semibold text-foreground">{title}</h4>
  </div>
);


export default function LuxuryPlayfulHomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <InteractiveLuxuryBackground />

      <main className="relative z-10 flex-grow">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
          <div className="animate-fadeInUp animation-delay-[0.1s]">
            <ForgeSimLogo className="h-28 w-28 md:h-36 md:w-36 text-primary mx-auto mb-6 filter drop-shadow-[0_5px_25px_hsl(var(--primary)/0.5)] animate-subtle-pulse" />
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight mb-3 md:mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-300 to-yellow-500 filter drop-shadow-[0_2px_15px_hsl(var(--accent)/0.6)]">
                Forge Sim
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-headline text-primary max-w-2xl mx-auto mb-10 leading-tight text-glow-primary">
              Elevate Your Strategy. Master Your Market.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-accent via-yellow-400 to-yellow-600 hover:saturate-150 text-accent-foreground text-lg md:text-xl py-4 px-10 rounded-lg shadow-xl hover:shadow-accent-glow-md transition-all duration-300 transform hover:scale-105 group"
            >
              <Link href="/app">
                <Zap className="mr-2 h-6 w-6" /> Launch Digital Twin
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Showcase with 3D Cards */}
        <section className="py-16 md:py-24 bg-background/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-center text-primary mb-12 md:mb-20 animate-fadeInUp animation-delay-[0.2s] text-glow-primary">
              Craft Your Legacy
            </h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
              <FeatureCard3D
                title="Dynamic Simulation Core"
                description="Experience a living digital twin of your business. Test strategies, navigate market shifts, and witness the true impact of your decisions in real-time."
                icon={<PackageOpen className="w-8 h-8" />}
                animationDelay="animation-delay-[0.4s]"
              />
              <div className="md:mt-10"> {/* Staggering for visual interest */}
                <FeatureCard3D
                  title="AI Hive Mind Guidance"
                  description="Leverage EVE, your central AI strategist, and her cohort of specialized AI agents. Receive personalized advice and actionable insights."
                  icon={<Brain className="w-8 h-8" />}
                  animationDelay="animation-delay-[0.6s]"
                />
              </div>
              <FeatureCard3D
                title="Predictive & Strategic Analytics"
                description="Uncover hidden opportunities and mitigate risks with AI-powered predictive analytics. Forge resilient strategies for sustainable growth."
                icon={<TrendingUpIcon className="w-8 h-8" />}
                animationDelay="animation-delay-[0.8s]"
              />
            </div>
          </div>
        </section>

        {/* The ForgeSim Experience */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-center text-accent mb-12 md:mb-16 animate-fadeInUp animation-delay-[0.2s] text-glow-accent">
              The ForgeSim Experience
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 max-w-4xl mx-auto">
              <ExperienceItem title="Risk-Free Experimentation" icon={<ShieldCheck className="w-7 h-7"/>} animationDelay="animation-delay-[0.4s]" />
              <ExperienceItem title="Accelerated Learning" icon={<Zap className="w-7 h-7"/>} animationDelay="animation-delay-[0.5s]" />
              <ExperienceItem title="Data-Driven Decisions" icon={<Gem className="w-7 h-7"/>}  animationDelay="animation-delay-[0.6s]" />
              <ExperienceItem title="Strategic Mastery" icon={<Users className="w-7 h-7"/>}  animationDelay="animation-delay-[0.7s]" />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 text-center py-8 md:py-12 border-t border-border bg-background/80 backdrop-blur-sm">
        <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} ForgeSim Dynamics. All Rights Reserved.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Simulation Protocol vX.1 Gamma. Your Ambition. Our Crucible.</p>
        <div className="mt-4">
          <Button variant="link" asChild className="text-accent hover:text-accent/80 text-sm">
            <Link href="/login">Access Terminal</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}

