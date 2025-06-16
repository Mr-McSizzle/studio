
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { Zap, Brain, ShieldCheck, TrendingUpIcon, PlayCircle, Scroll, Gem, Swords, Cog, Aperture } from 'lucide-react';
import { cn } from '@/lib/utils';

// Background Component for Elden Ring Inspired Aesthetic
const AncientForgeBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-background">
      {/* Base texture - subtle noise or very dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-background to-secondary/10 opacity-70"></div>
      
      {/* Animated Embers/Particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`ember-${i}`}
          className="ember"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${5 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 5}s`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
          }}
        />
      ))}

      {/* Faint, slowly moving dark shapes for depth */}
      <div className="absolute inset-0">
        <div className="fog-layer fog-layer-1"></div>
        <div className="fog-layer fog-layer-2"></div>
      </div>

      {/* Very faint, large geometric/runic symbol in background (optional) */}
      <Aperture className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[80vh] w-[80vh] text-primary/5 opacity-30 animate-spin-slowest blur-sm" />
    </div>
  );
};

interface FeatureTabletProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  animationDelay?: string;
}

const FeatureTablet = ({ icon, title, description, className, animationDelay = '0s' }: FeatureTabletProps) => {
  return (
    <div
      className={cn(
        "group relative p-6 bg-card/60 backdrop-blur-md border border-secondary/50 rounded-lg shadow-epic-depth hover:border-accent/70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-accent-glow-md",
        "animate-fadeInUp",
        className
      )}
      style={{ animationDelay }}
    >
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent/80 rounded-sm flex items-center justify-center shadow-md transform rotate-[-15deg] group-hover:rotate-[-5deg] group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-headline text-accent mb-2 text-glow-accent-subtle">{title}</h3>
      <p className="text-sm text-muted-foreground/80 leading-relaxed">{description}</p>
      <div className="absolute bottom-2 right-2 opacity-20 group-hover:opacity-50 transition-opacity duration-300">
        <Cog className="h-10 w-10 text-primary/30 animate-spin-slow" />
      </div>
    </div>
  );
};


export default function EldenRingInspiredHomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-6 overflow-x-hidden">
      <AncientForgeBackground />
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen selection:bg-primary selection:text-primary-foreground pt-16 pb-8">
        
        <header className="text-center mb-16 md:mb-24 animate-fadeInUp animation-delay-[0.1s]">
          <div className="relative inline-block mb-6 transform hover:scale-105 transition-transform duration-500">
            <ForgeSimLogo className="h-24 w-24 md:h-32 md:w-32 text-primary filter drop-shadow-[0_0_15px_hsl(var(--primary)/0.7)] animate-subtle-pulse animation-duration-[3s]" />
            <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping-slow opacity-50"></div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-300 to-yellow-600 mb-3 tracking-tighter text-chiseled-gold uppercase filter drop-shadow-[0_2px_8px_hsl(var(--accent)/0.5)]">
            ForgeSim
          </h1>
          <h2 className="text-xl sm:text-2xl font-headline text-primary mb-10 tracking-wider text-glow-primary filter drop-shadow-[0_0_5px_hsl(var(--primary)/0.4)]">
            THE ANVIL OF AMBITION
          </h2>
          <p className="text-md sm:text-lg text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Within this digital crucible, strategies are forged in the fires of artificial intelligence. Shape your venture, command AI emissaries, and master the art of enterprise.
          </p>
        </header>

        <main className="w-full max-w-5xl mx-auto space-y-16 sm:space-y-20">
          <section className="text-center animate-fadeInUp animation-delay-[0.4s]">
            <Button 
              asChild 
              size="lg" 
              className="w-full max-w-xs sm:max-w-sm bg-gradient-to-r from-primary to-red-800 hover:from-primary/90 hover:to-red-700 text-primary-foreground text-lg sm:text-xl py-6 sm:py-7 rounded-md shadow-epic-depth hover:shadow-primary-glow-md transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-primary/70 group"
            >
              <Link href="/app">
                <PlayCircle className="mr-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:animate-subtle-pulse" />
                ENTER THE SIMULACRUM
              </Link>
            </Button>
             <p className="text-xs text-muted-foreground/60 mt-5">
              [ Authentication Required to Proceed ]
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-start">
            <FeatureTablet
              icon={<Swords className="h-5 w-5 text-primary/80" />}
              title="Strategic Command"
              description="Design your operational blueprint. Allocate resources, define market focus, and dictate the parameters of your burgeoning empire."
              animationDelay="0.6s"
            />
            <FeatureTablet
              icon={<Brain className="h-5 w-5 text-primary/80" />}
              title="AI Cohort Nexus"
              description="Leverage a pantheon of AI agents, each a specialist in finance, R&D, marketing, and esoteric market divination."
              animationDelay="0.8s"
              className="md:mt-8" // Staggered effect
            />
            <FeatureTablet
              icon={<Gem className="h-5 w-5 text-primary/80" />}
              title="Simulation Crucible"
              description="Witness the real-time ramifications of your edicts. Test hypotheses and adapt to dynamic, AI-driven market events."
              animationDelay="1.0s"
            />
          </div>
          
          <section id="systems-overview" className="py-10 animate-fadeInUp animation-delay-[1.2s]">
            <h3 className="text-center text-3xl font-headline text-accent mb-10 text-glow-accent-subtle">Core Systems Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
              <SystemFeatureItem icon={<Scroll className="text-primary h-6 w-6"/>} title="Digital Twin Genesis" description="AI dynamically constructs your unique business model from foundational inputs." />
              <SystemFeatureItem icon={<ShieldCheck className="text-primary h-6 w-6"/>} title="Risk Forewarning Matrix" description="Stress-test strategies in isolated scenarios without jeopardizing core progress." />
              <SystemFeatureItem icon={<TrendingUpIcon className="text-primary h-6 w-6"/>} title="Predictive Augury" description="AI foresees potential outcomes, highlighting both latent risks and emergent opportunities." />
              <SystemFeatureItem icon={<Aperture className="text-primary h-6 w-6"/>} title="Hive Mind Oracle (EVE)" description="Central AI synthesizes agent insights, offering bespoke strategic counsel." />
            </div>
          </section>

          <section className="text-center my-16 sm:my-20 animate-fadeInUp animation-delay-[1.4s]">
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="w-full max-w-xs sm:max-w-sm border-accent text-accent hover:bg-accent hover:text-accent-foreground text-md sm:text-lg py-5 sm:py-6 rounded-md shadow-sm hover:shadow-accent-glow-md transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-accent/70 group"
            >
              <Link href="/login">
                ACCESS TERMINAL
              </Link>
            </Button>
          </section>
        </main>

        <footer className="mt-20 pb-10 text-center text-muted-foreground/50 text-xs animate-fadeInUp animation-delay-[1.6s]">
          <p>&copy; {new Date().getFullYear()} ForgeSim Arcane Dynamics. Simulacrum Protocol v1.1 Initiated.</p>
          <p>All Rites Reserved. Unauthorized Duplication or Distribution Prohibited under penalty of Arcane Law.</p>
        </footer>
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
    <div className="flex flex-col items-center text-center p-4 rounded-md hover:bg-card/50 transition-colors duration-200 group">
      <div className="p-3 mb-3 rounded-full bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors duration-200">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-accent mb-1 group-hover:text-yellow-400 transition-colors duration-200">{title}</h4>
      <p className="text-muted-foreground/80 text-xs sm:text-sm leading-snug">{description}</p>
    </div>
  );
}
