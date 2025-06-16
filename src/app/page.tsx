// src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { ArrowRight, PlayCircle, Zap, Brain, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper component for animated text lines (optional, for more dynamic entrances)
const AnimatedTextLine = ({ text, delay, className }: { text: string, delay: string, className?: string }) => (
  <div className="overflow-hidden">
    <p className={cn("animate-fadeInUp", `animation-delay-[${delay}]`, className)} style={{ animationFillMode: 'forwards' }}>{text}</p>
  </div>
);

export default function EditorialHomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body overflow-x-hidden">
      <main className="flex-grow">
        {/* --- Hero Section --- */}
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center p-4 md:p-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/new-assets/homepage-hero.png"
              alt="ForgeSim Hero - Symbolic representation of creation and strategy"
              layout="fill"
              objectFit="cover"
              quality={85}
              className="opacity-20 md:opacity-30 saturate-[0.8]"
              data-ai-hint="symbolic art dragon hands"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div> {/* Gradient overlay */}
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="animate-fadeInUp animation-delay-[0.2s]">
                <ForgeSimLogo className="h-20 w-20 md:h-24 md:w-24 text-primary mb-4 filter drop-shadow-[0_3px_15px_hsl(var(--primary)/0.4)]" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-tight">
              <AnimatedTextLine text="FORGE" delay="0.4s" className="text-foreground filter drop-shadow-[0_2px_8px_hsl(var(--background)/0.5)]" />
              <AnimatedTextLine text="YOUR" delay="0.6s" className="text-primary text-glow-primary filter drop-shadow-[0_2px_8px_hsl(var(--background)/0.5)]" />
              <AnimatedTextLine text="LEGACY" delay="0.8s" className="text-foreground filter drop-shadow-[0_2px_8px_hsl(var(--background)/0.5)]" />
            </h1>
            <p className="mt-4 md:mt-6 max-w-xl text-lg md:text-xl text-muted-foreground font-medium animate-fadeInUp animation-delay-[1s]" style={{animationFillMode: 'forwards'}}>
              The crucible of strategy awaits. Architect your digital twin, command AI agents, and master the art of business in a dynamic simulation.
            </p>
            <div className="animate-fadeInUp animation-delay-[1.2s]" style={{animationFillMode: 'forwards'}}>
                <Button
                asChild
                size="lg"
                className="mt-8 md:mt-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-lg py-3.5 px-10 rounded-md shadow-xl hover:shadow-accent-glow-md transition-all duration-300 transform hover:scale-105 group"
                >
                <Link href="/app">
                    <PlayCircle className="mr-2.5 h-6 w-6" /> Enter the Forge
                </Link>
                </Button>
            </div>
          </div>
        </section>

        {/* --- Feature Section 1: Dynamic Simulation Core --- */}
        <section className="py-16 md:py-24 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className={cn("relative aspect-[4/3] md:aspect-video rounded-lg overflow-hidden shadow-2xl animate-fadeInUp animation-delay-[0.2s]")} style={{animationFillMode: 'forwards'}}>
                <Image
                  src="/new-assets/homepage-feature1.png"
                  alt="AI Hive Mind guiding strategic decisions"
                  layout="fill"
                  objectFit="cover"
                  quality={80}
                  data-ai-hint="symbolic detail dragon"
                />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent opacity-75"></div>
              </div>
              <div className={cn("animate-fadeInUp animation-delay-[0.4s] md:order-first text-left")} style={{animationFillMode: 'forwards'}}>
                <Zap className="h-12 w-12 text-accent mb-4" />
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-5 text-glow-primary leading-tight">Dynamic Simulation Core</h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Witness your strategies unfold in a living digital replica of your business. Test theories, navigate market shifts, and understand the true impact of every decision.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  ForgeSim’s advanced algorithms model complex interactions, offering a risk-free environment to experiment and iterate towards perfection.
                </p>
                 <Button variant="link" asChild className="mt-6 text-accent hover:text-accent/80 px-0 group text-md font-semibold">
                  <Link href="/app/simulation">Explore Decision Levers <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"/> </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Feature Section 2: AI Hive Mind Guidance --- */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className={cn("animate-fadeInUp animation-delay-[0.2s] text-left")} style={{animationFillMode: 'forwards'}}>
                <Brain className="h-12 w-12 text-accent mb-4" />
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-5 text-glow-primary leading-tight">AI Hive Mind Guidance</h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Command EVE, your central AI strategist, and her cohort of specialized agents. Receive personalized advice, predictive analytics, and actionable insights tailored to your simulation.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From financial forecasting with Alex to marketing mastery with Maya, your AI team is ready to amplify your strategic capabilities.
                </p>
                 <Button variant="link" asChild className="mt-6 text-accent hover:text-accent/80 px-0 group text-md font-semibold">
                  <Link href="/app/mentor">Consult EVE Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"/> </Link>
                </Button>
              </div>
              <div className={cn("relative aspect-[4/3] md:aspect-video rounded-lg overflow-hidden shadow-2xl animate-fadeInUp animation-delay-[0.4s]")} style={{animationFillMode: 'forwards'}}>
                <Image
                  src="/new-assets/homepage-feature2.png"
                  alt="Strategic analytics and predictive insights"
                  layout="fill"
                  objectFit="cover"
                  quality={80}
                  data-ai-hint="symbolic detail ornament"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent opacity-75"></div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Core Benefits/Systems --- */}
         <section className="py-16 md:py-24 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center">
            <div className={cn("animate-fadeInUp animation-delay-[0.1s]")} style={{animationFillMode: 'forwards'}}>
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-12 md:mb-16 text-glow-primary">
                Unlock Strategic Mastery
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {[
                { title: "Risk-Free Experimentation", icon: <Zap className="w-10 h-10 text-accent" />, delay: "0.2s", description: "Test bold ideas without real-world consequences. Iterate on strategies in a safe, dynamic sandbox." },
                { title: "Accelerated Learning Cycles", icon: <TrendingUp className="w-10 h-10 text-accent" />, delay: "0.3s", description: "Rapidly understand market dynamics and the cause-and-effect of your strategic choices." },
                { title: "AI-Powered Foresight", icon: <Brain className="w-10 h-10 text-accent" />, delay: "0.4s", description: "Leverage predictive analytics and expert AI agent insights to anticipate challenges and seize opportunities." },
              ].map(item => (
                <div key={item.title} className={cn("p-8 bg-card rounded-xl shadow-xl animate-fadeInUp", `animation-delay-[${item.delay}]`)} style={{animationFillMode: 'forwards'}}>
                  <div className="flex justify-center mb-5">{item.icon}</div>
                  <h3 className="text-2xl font-headline font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="relative z-10 text-center py-10 md:py-16 border-t border-border bg-background/90 backdrop-blur-sm">
        <div className={cn("animate-fadeInUp animation-delay-[0.2s]")} style={{animationFillMode: 'forwards'}}>
          <ForgeSimLogo className="h-14 w-14 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} ForgeSim Dynamics. All Rights Reserved.</p>
          <p className="text-xs text-muted-foreground/70 mt-1.5">Simulation Protocol vXI. Where Visionaries Become Victors.</p>
          <div className="mt-6">
            <Button variant="link" asChild className="text-accent hover:text-accent/80 text-md font-semibold">
              <Link href="/login">Access Simulation Terminal</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
