
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { ArrowRight, CheckCircle, Zap, Brain, ShieldCheck, TrendingUpIcon, PlayCircle, Gem, PackageOpen, Sparkles as SparkleIcon, Cog, Aperture } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

// Re-usable Block Component for consistent styling and animation
interface ContentBlockProps {
  children: React.ReactNode;
  className?: string;
  bgImage?: string;
  bgHint?: string;
  fullBleedImage?: boolean;
  animationDelay?: string;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ children, className, bgImage, bgHint, fullBleedImage = false, animationDelay = "animation-delay-[0s]" }) => {
  return (
    <section className={cn(
      "relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden flex items-center justify-center animate-fadeInUp",
      animationDelay,
      className
    )}>
      {bgImage && (
        <Image
          src={bgImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={85}
          className={cn("absolute inset-0 z-0", fullBleedImage ? "" : "opacity-30")}
          data-ai-hint={bgHint || "abstract background"}
          priority={animationDelay === "animation-delay-[0s]" || animationDelay === "animation-delay-[0.1s]"} // Prioritize LCP images
        />
      )}
      <div className={cn("relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center md:text-left", fullBleedImage && "flex flex-col justify-end h-full pb-16 md:pb-24")}>
        {children}
      </div>
    </section>
  );
};

const StatItem: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
  <div className={cn("text-left", className)}>
    <p className="text-sm uppercase tracking-wider font-semibold text-accent">{label}</p>
    <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
  </div>
);


export default function EditorialHomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow">
        {/* Block 1: Hero Title */}
        <ContentBlock
          className="bg-gradient-to-br from-background via-primary/20 to-secondary/10 text-center"
          animationDelay="animation-delay-[0.1s]"
        >
          <div className="max-w-4xl mx-auto">
            <ForgeSimLogo className="h-24 w-24 md:h-32 md:w-32 text-primary mx-auto mb-6 md:mb-8 filter drop-shadow-[0_0_15px_hsl(var(--primary)/0.7)] animate-subtle-pulse" />
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-yellow-400 mb-4 md:mb-6 text-glow-primary filter drop-shadow-[0_2px_10px_hsl(var(--accent)/0.5)]">
              ForgeSim
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl font-headline text-muted-foreground/90 max-w-2xl mx-auto leading-tight">
              Blueprint Your Ambition. Simulate Your Success.
            </p>
          </div>
        </ContentBlock>

        {/* Block 2: Main Visual & Call to Action */}
        <ContentBlock
          bgImage="https://placehold.co/1920x1080.png"
          bgHint="futuristic cityscape digital concept"
          fullBleedImage={true}
          className="items-end text-left"
          animationDelay="animation-delay-[0.4s]"
        >
          <div className="max-w-xl bg-black/60 backdrop-blur-md p-6 md:p-8 rounded-lg shadow-epic-depth">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent mb-4 text-glow-accent">
              Enter The Forge
            </h2>
            <p className="text-base md:text-lg text-foreground/90 mb-6">
              Your digital proving ground awaits. Test strategies, mitigate risks, and master your market in an AI-powered simulation built for founders.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-4 px-8 rounded-md shadow-lg hover:shadow-accent-glow-md transition-all duration-300 transform hover:scale-105 group"
            >
              <Link href="/app">
                Launch Simulation Core <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </ContentBlock>

        {/* Block 3: Key Features / Stats (inspired by "ENGINE..." section) */}
        <ContentBlock className="bg-secondary/10" animationDelay="animation-delay-[0.7s]">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-4 space-y-6">
              <StatItem label="Engine" value="AI Predictive Core" />
              <StatItem label="Guidance System" value="EVE Hive Mind" />
              <StatItem label="Development Stage" value="Alpha Protocol" />
              <StatItem label="Objective" value="Strategic Mastery" />
            </div>
            <div className="md:col-span-8">
              <Image
                src="https://placehold.co/1000x700.png"
                alt="ForgeSim System Schematics"
                width={1000}
                height={700}
                className="rounded-lg shadow-xl object-cover border-2 border-primary/30 card-glow-hover-primary"
                data-ai-hint="holographic interface schematics"
              />
            </div>
          </div>
        </ContentBlock>

        {/* Block 4: Text heavy description & smaller image (inspired by "Lightning McQueen is..." block) */}
         <ContentBlock className="bg-card/40" animationDelay="animation-delay-[1.0s]">
           <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-7 text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">The Digital Twin Advantage</h3>
              <p className="text-muted-foreground/90 leading-relaxed mb-3">
                ForgeSim provides an innovative platform designed to simulate business operations, empowering startups and established businesses to test, refine, and perfect their strategies in a risk-free, dynamic environment.
              </p>
              <p className="text-muted-foreground/90 leading-relaxed mb-6">
                By harnessing the power of AI, ForgeSim provides a "digital twin" for businesses, offering a unique blend of predictive analytics, risk assessment, scenario simulation, and personalized guidance from AI expert agents.
              </p>
              <div className="flex flex-wrap gap-3">
                <FeaturePill icon={<Brain className="h-4 w-4"/>} text="AI-Powered Insights" />
                <FeaturePill icon={<ShieldCheck className="h-4 w-4"/>} text="Risk-Free Experimentation" />
                <FeaturePill icon={<TrendingUpIcon className="h-4 w-4"/>} text="Accelerated Learning Curves" />
              </div>
            </div>
             <div className="md:col-span-5 flex justify-center md:justify-end">
                <Image
                    src="https://placehold.co/600x800.png"
                    alt="ForgeSim AI Mentor Interface Concept"
                    width={500}
                    height={700}
                    className="rounded-lg shadow-xl object-cover border-2 border-accent/30 card-glow-hover-accent max-h-[70vh]"
                    data-ai-hint="futuristic data analysis screen"
                />
            </div>
          </div>
        </ContentBlock>
      </main>

      <footer className="text-center py-8 md:py-12 border-t border-border bg-background">
        <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} ForgeSim Advanced Dynamics. All Rights Reserved.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Simulation Protocol Version 2.7. Engage with caution and ambition.</p>
         <div className="mt-4">
            <Button variant="link" asChild className="text-accent hover:text-accent/80 text-sm">
                <Link href="/login">Access Existing Simulation</Link>
            </Button>
        </div>
      </footer>
    </div>
  );
}

const FeaturePill: React.FC<{icon: React.ReactNode, text: string}> = ({icon, text}) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/30">
    {icon}
    {text}
  </div>
);

