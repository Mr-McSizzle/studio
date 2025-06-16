
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { Zap, Brain, ShieldCheck, TrendingUpIcon, PlayCircle, Gem, PackageOpen, ArrowRight, Sparkles as SparkleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

// Sub-component for the animated 3D background
const InteractiveLuxuryBackground = () => {
  const numShapes = 10; // Number of floating geometric shapes
  const numParticles = 50; // Number of sparkling particles

  return (
    <div className="absolute inset-0 z-0 overflow-hidden perspective-1000">
      {/* Base Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-secondary/5 opacity-80"></div>

      {/* Floating Geometric Shapes */}
      {[...Array(numShapes)].map((_, i) => {
        const size = Math.random() * 80 + 40; // 40px to 120px
        const duration = Math.random() * 20 + 15; // 15s to 35s
        const delay = Math.random() * 10;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const z = Math.random() * 400 - 200; // -200px to 200px
        const rotateX = Math.random() * 360;
        const rotateY = Math.random() * 360;
        const colorClass = i % 3 === 0 ? 'bg-accent/30' : i % 3 === 1 ? 'bg-primary/20' : 'bg-secondary/20';
        const shapeClass = i % 2 === 0 ? 'rounded-lg' : 'rounded-full';


        return (
          <div
            key={`shape-${i}`}
            className={cn(
              'absolute opacity-30 animate-float-rotate-3d',
              colorClass,
              shapeClass
            )}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${x}%`,
              top: `${y}%`,
              transform: `translateZ(${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`,
              boxShadow: `0 0 ${size / 5}px ${colorClass.replace('/30','/50').replace('/20','/40')}`
            }}
          />
        );
      })}

      {/* Sparkling Particles */}
      {[...Array(numParticles)].map((_, i) => {
        const duration = Math.random() * 5 + 3; // 3s to 8s
        const delay = Math.random() * 5;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 1; // 1px to 3px
        return (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-accent animate-sparkle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${x}%`,
              top: `${y}%`,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`,
              opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
              boxShadow: '0 0 6px 1px hsl(var(--accent)/0.7)'
            }}
          />
        );
      })}
    </div>
  );
};

// Sub-component for feature cards with 3D tilt effect on hover
interface FeatureCard3DProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  animationDelay?: string;
}

const FeatureCard3D = ({ icon, title, description, className, animationDelay = '0s' }: FeatureCard3DProps) => {
  return (
    <div
      className={cn(
        "group relative p-6 bg-card/70 backdrop-blur-md border border-primary/30 rounded-xl shadow-lg transform-style-preserve-3d transition-all duration-300 hover:shadow-accent-glow-md hover:-translate-y-2",
        "animate-fadeInUp",
        className
      )}
      style={{ animationDelay }}
    >
      <div className="transition-transform duration-300 group-hover:rotate-y-10 group-hover:rotate-x-5 group-hover:scale-105">
        <div className="mb-4 inline-flex items-center justify-center p-3 bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/50 rounded-lg shadow-inner-soft-gold">
          {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 text-accent" })}
        </div>
        <h3 className="text-2xl font-headline text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-400 to-amber-300 mb-2 text-glow-accent-subtle">{title}</h3>
        <p className="text-sm text-muted-foreground/90 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};


export default function LuxuryPlayfulHomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-6 overflow-hidden">
      <InteractiveLuxuryBackground />
      
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen selection:bg-primary selection:text-primary-foreground pt-20 pb-12">
        
        <header className="text-center mb-16 md:mb-24 animate-fadeInUp animation-delay-[0.1s] transform-style-preserve-3d">
          <div className="relative inline-block mb-8 transform hover:scale-110 transition-transform duration-500 hover:rotate-y-15 hover:rotate-x-3">
            <ForgeSimLogo className="h-28 w-28 md:h-36 md:w-36 text-primary filter drop-shadow-[0_0_20px_hsl(var(--primary)/0.8)] animate-subtle-pulse animation-duration-[3s]" />
            <div className="absolute inset-0 rounded-full border-2 border-accent/40 animate-ping-slow opacity-60"></div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-accent to-yellow-500 mb-4 tracking-tight filter drop-shadow-[0_3px_15px_hsl(var(--accent)/0.6)] transform hover:scale-105 transition-transform duration-300">
            ForgeSim
          </h1>
          <h2 className="text-xl sm:text-2xl font-headline text-primary mb-10 tracking-wider text-glow-primary filter drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">
            Elevate Your Strategy. Master Your Market.
          </h2>
          <p className="text-md sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Step into a sophisticated digital realm where your entrepreneurial vision takes flight. ForgeSim offers a dynamic, AI-powered environment to test, refine, and perfect your business strategies with unparalleled insight.
          </p>
        </header>

        <main className="w-full max-w-6xl mx-auto space-y-20 sm:space-y-24">
          <section className="text-center animate-fadeInUp animation-delay-[0.4s]">
            <Button 
              asChild 
              size="lg" 
              className="w-full max-w-xs sm:max-w-sm bg-gradient-to-r from-accent to-yellow-600 hover:from-yellow-400 hover:to-accent text-accent-foreground text-lg sm:text-xl py-6 sm:py-7 rounded-lg shadow-lg hover:shadow-accent-glow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
            >
              <Link href="/app">
                <PlayCircle className="mr-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:animate-subtle-pulse" />
                LAUNCH DIGITAL TWIN
              </Link>
            </Button>
             <p className="text-xs text-muted-foreground/70 mt-6">
              [ Authentication Required to Access Simulation Core ]
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start">
            <FeatureCard3D
              icon={<PackageOpen />}
              title="Digital Twin Nexus"
              description="Craft a living replica of your business. Model operations, financials, and market interactions with intricate detail and AI-driven realism."
              animationDelay="0.6s"
            />
            <FeatureCard3D
              icon={<Brain />}
              title="AI Hive Mind Counsel"
              description="Command a suite of specialized AI agents. Receive bespoke strategic advice, market forecasts, and risk assessments from your virtual board of experts."
              animationDelay="0.8s"
              className="md:mt-10" 
            />
            <FeatureCard3D
              icon={<Gem />}
              title="Scenario Alchemy"
              description="Transmute 'what-if' into 'what's next'. Explore limitless strategic possibilities and witness their impact in a dynamic, consequence-aware environment."
              animationDelay="1.0s"
            />
          </div>
          
          <section id="experience-overview" className="py-12 animate-fadeInUp animation-delay-[1.2s]">
            <h3 className="text-center text-4xl font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-rose-500 mb-12 text-glow-primary">The ForgeSim Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              <ExperienceItem icon={<ShieldCheck className="text-accent h-7 w-7"/>} title="Strategic Validation" description="Test bold ideas and refine business models in a risk-free innovation sandbox." />
              <ExperienceItem icon={<TrendingUpIcon className="text-accent h-7 w-7"/>} title="Predictive Foresight" description="Leverage AI analytics to anticipate market shifts and uncover hidden growth vectors." />
              <ExperienceItem icon={<SparkleIcon className="text-accent h-7 w-7"/>} title="Personalized Mentorship" description="Receive tailored guidance from EVE, your central AI coordinator, adapting to your unique journey." />
              <ExperienceItem icon={<Zap className="text-accent h-7 w-7"/>} title="Accelerated Learning" description="Gain months of business experience in days, rapidly iterating towards market mastery." />
            </div>
          </section>

          <section className="text-center my-20 sm:my-24 animate-fadeInUp animation-delay-[1.4s]">
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="w-full max-w-xs sm:max-w-sm border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-md sm:text-lg py-5 sm:py-6 rounded-lg shadow-md hover:shadow-accent-glow-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 focus:ring-4 focus:ring-accent/70 group"
            >
              <Link href="/login">
                <ArrowRight className="mr-2 h-5 w-5"/> Access Your Simulation
              </Link>
            </Button>
          </section>
        </main>

        <footer className="mt-24 pb-10 text-center text-muted-foreground/60 text-xs animate-fadeInUp animation-delay-[1.6s]">
          <p>&copy; {new Date().getFullYear()} ForgeSim Advanced Dynamics Inc. All Rights Reserved.</p>
          <p>Simulation Protocol Gamma-7. Unauthorized access will be met with digital countermeasures.</p>
        </footer>
      </div>
    </div>
  );
}

interface ExperienceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ExperienceItem({ icon, title, description }: ExperienceItemProps) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-card/40 transition-colors duration-200 group">
      <div className="p-3 mb-4 rounded-full bg-primary/10 border border-primary/30 group-hover:border-accent/50 transition-colors duration-200 transform group-hover:scale-110">
        {icon}
      </div>
      <h4 className="text-xl font-semibold text-accent mb-1.5 group-hover:text-yellow-400 transition-colors duration-200">{title}</h4>
      <p className="text-muted-foreground/80 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
    