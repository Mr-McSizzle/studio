
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Brain, Target, ShieldCheck, Users, TrendingUpIcon, Briefcase, Network, LogIn, ChevronRight, PlayCircle, Command, Microscope, Building2, Plus, Divide, Dot } from 'lucide-react';

// Inspired Background Component
const SinnerInspiredBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
    {/* Subtle Noise Texture */}
    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='black'/%3E%3Cpath d='M50 0 L50 100 M0 50 L100 50' stroke-width='1' stroke='white'/%3E%3C/svg%3E\")" }}></div>
    
    {/* Faint large geometric shapes / light glows */}
    <div
      className="absolute top-[5%] left-[10%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-3xl animate-pulse"
      style={{ animationDuration: '20s' }}
    />
    <div
      className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] bg-accent/5 rounded-full blur-3xl animate-pulse"
      style={{ animationDuration: '25s', animationDelay: '3s' }}
    />

    {/* Thin, glowing lines - using pseudo-elements for simplicity */}
    <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-fadeIn animation-delay-500"></div>
    <div className="absolute bottom-1/3 right-0 w-full h-px bg-gradient-to-l from-transparent via-primary/20 to-transparent animate-fadeIn animation-delay-700"></div>
    <div className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent animate-fadeIn animation-delay-1000"></div>

    {/* Scattered small decorative elements (crosses, circles) */}
    {[...Array(10)].map((_, i) => {
      const Icon = Math.random() > 0.66 ? Plus : Math.random() > 0.33 ? Divide : Dot; // More varied icons
      const colorClass = Math.random() > 0.5 ? 'text-primary/40' : 'text-accent/40';
      return (
        <Icon
          key={`deco-${i}`}
          className={`absolute w-3 h-3 ${colorClass} animate-fadeInUp`}
          style={{
            left: `${Math.random() * 95}%`,
            top: `${Math.random() * 95}%`,
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${0.5 + Math.random() * 2}s`,
            animationIterationCount: 'infinite',
            opacity: Math.random() * 0.2 + 0.1,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      );
    })}
  </div>
);


export default function GameHomePageSinner() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-6 overflow-x-hidden">
      <SinnerInspiredBackground />
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen selection:bg-primary selection:text-primary-foreground">
        
        <header className="text-center pt-16 pb-12 sm:pt-24 sm:pb-16 animate-fadeInUp animation-delay-[0.1s] w-full max-w-4xl">
          <div className="relative mb-10 flex justify-center items-center">
            <h1 className="text-[calc(clamp(3rem,18vw,12rem))] font-black text-primary leading-none tracking-tighter uppercase text-glow-primary filter drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">
              FORGE
            </h1>
            {/* Logo can be smaller and off-center or integrated differently */}
            <ForgeSimLogo className="absolute h-16 w-16 sm:h-20 sm:w-20 text-accent opacity-70 -top-4 -right-4 md:top-0 md:right-0 filter drop-shadow-[0_0_8px_hsl(var(--accent)/0.4)]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-semibold text-accent -mt-8 sm:-mt-12 md:-mt-16 mb-8 uppercase tracking-wider text-glow-accent">
            SIMULATION ENGINE
          </h2>
          <p className="text-md sm:text-lg text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            Construct your digital enterprise. Command AI agents. Master strategy in a crucible of innovation and risk.
          </p>
        </header>

        <main className="w-full max-w-5xl mx-auto space-y-16 sm:space-y-24">
          <section className="text-center animate-fadeInUp animation-delay-[0.3s]">
            <Button 
              asChild 
              size="lg" 
              className="w-full max-w-xs sm:max-w-sm bg-primary hover:bg-primary/80 text-primary-foreground text-lg sm:text-xl py-6 sm:py-7 rounded-md shadow-lg hover:shadow-primary-glow-md transition-all duration-300 hover:scale-105 focus:ring-4 focus:ring-primary/70"
            >
              <Link href="/app">
                <PlayCircle className="mr-3 h-6 w-6 sm:h-7 sm:w-7" />
                INITIATE SIMULATION
              </Link>
            </Button>
             <p className="text-xs text-muted-foreground/70 mt-5">
              [ Authentication Required ]
            </p>
          </section>

          {/* Asymmetrical Content Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-start">
            <div className="md:col-span-2 space-y-8 animate-fadeInUp animation-delay-[0.5s]">
              <ContentBlock
                icon={<Command className="h-8 w-8 text-accent" />}
                title="STRATEGIC DIRECTIVES"
                texts={[
                  "Design blueprint: Set resources, market focus, operational parameters.",
                  "Command AI agents: Leverage specialized expertise in finance, R&D, marketing.",
                  "Execute decisions: Witness real-time consequences in your digital twin."
                ]}
              />
            </div>
            <div className="md:col-span-3 space-y-8 animate-fadeInUp animation-delay-[0.7s]">
               <ContentBlock
                icon={<Microscope className="h-8 w-8 text-accent" />}
                title="SIMULATION CRUCIBLE"
                texts={[
                  "Hypothesis testing: Validate strategies in a risk-free environment.",
                  "Scenario analysis: Explore 'what-if' conditions and adapt to dynamic events.",
                  "Adaptive learning: Refine models based on performance and AI feedback."
                ]}
              />
            </div>
          </div>
          
          <section id="features-overview" className="animate-fadeInUp animation-delay-[0.9s]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <SystemFeatureItem icon={<Building2 className="text-primary h-5 w-5"/>} title="Digital Twin Construction" description="AI generates dynamic business model." />
              <SystemFeatureItem icon={<Brain className="text-primary h-5 w-5"/>} title="Hive Mind Intelligence" description="EVE synthesizes agent insights." />
              <SystemFeatureItem icon={<TrendingUpIcon className="text-primary h-5 w-5"/>} title="Predictive Analytics" description="Foresee outcomes & identify risks." />
              <SystemFeatureItem icon={<ShieldCheck className="text-primary h-5 w-5"/>} title="Risk Assessment Lab" description="Stress-test strategies safely." />
            </div>
          </section>

          <section className="text-center my-16 sm:my-20 animate-fadeInUp animation-delay-[1.1s]">
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="w-full max-w-xs sm:max-w-sm border-accent text-accent hover:bg-accent hover:text-accent-foreground text-md sm:text-lg py-5 sm:py-6 rounded-md shadow-sm hover:shadow-accent-glow-sm transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-accent/70"
            >
              <Link href="/login">
                <LogIn className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                ACCESS TERMINAL
              </Link>
            </Button>
          </section>
        </main>

        <footer className="mt-20 pb-10 text-center text-muted-foreground/60 text-xs animate-fadeInUp animation-delay-[1.3s]">
          <p>&copy; {new Date().getFullYear()} ForgeSim AI Dynamics. Simulation Protocol v1.0 Initialized.</p>
          <p>All Rights Reserved. Unauthorized Duplication or Distribution Prohibited.</p>
        </footer>
      </div>
    </div>
  );
}

interface ContentBlockProps {
  icon: React.ReactNode;
  title: string;
  texts: string[];
  className?: string;
}

function ContentBlock({ icon, title, texts, className }: ContentBlockProps) {
  return (
    <div className={`p-6 bg-card/50 backdrop-blur-sm rounded-lg shadow-xl border border-primary/20 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="mr-4 p-2 bg-primary/10 rounded-md">{icon}</div>
        <h3 className="text-xl sm:text-2xl font-headline text-primary uppercase tracking-wide">{title}</h3>
      </div>
      <div className="space-y-2.5 text-sm text-muted-foreground/90">
        {texts.map((text, index) => (
          <p key={index} className="leading-relaxed relative pl-4 before:content-['+'] before:absolute before:left-0 before:top-0 before:text-primary before:font-bold">
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}

interface SystemFeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SystemFeatureItem({ icon, title, description }: SystemFeatureItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-md hover:bg-card/70 transition-colors duration-200">
      <div className="flex-shrink-0 mt-1 text-primary/80">{icon}</div>
      <div>
        <h4 className="text-md sm:text-lg font-semibold text-accent mb-0.5">{title}</h4>
        <p className="text-muted-foreground/80 text-xs sm:text-sm leading-snug">{description}</p>
      </div>
    </div>
  );
}
