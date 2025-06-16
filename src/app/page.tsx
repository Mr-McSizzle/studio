
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Brain, Target, ShieldCheck, Users, TrendingUpIcon, Briefcase, Network, LogIn, ChevronRight, PlayCircle, Command, Microscope, Building2 } from 'lucide-react';

// Enhanced NEXUS inspired animated background elements
const GameNexusBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5 opacity-70" />
    {/* Large, slow-moving nebula-like elements */}
    <div
      className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[100px] animate-pulse"
      style={{ animationDuration: '15s', animationDelay: '0s' }}
    />
    <div
      className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-accent/10 rounded-full blur-[100px] animate-pulse"
      style={{ animationDuration: '18s', animationDelay: '2s' }}
    />
    {/* Subtle, fast-moving particles or streaks */}
    {[...Array(15)].map((_, i) => (
      <div
        key={`particle-${i}`}
        className="absolute w-1 h-1 bg-foreground/30 rounded-full animate-fadeInUp"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${2 + Math.random() * 3}s`,
          animationDelay: `${Math.random() * 5}s`,
          animationIterationCount: 'infinite',
          opacity: Math.random() * 0.5 + 0.1,
        }}
      />
    ))}
     {/* Geometric accents */}
    <div
      className="absolute top-[10%] right-[5%] w-12 h-12 border-2 border-primary/20 rotate-[30deg] animate-spin-slow opacity-50"
      style={{ animationDuration: "40s" }}
    />
    <div
      className="absolute bottom-[15%] left-[10%] w-16 h-16 border-2 border-accent/20 rounded-full animate-subtle-pulse opacity-40"
       style={{ animationDuration: "8s" }}
    />
  </div>
);


export default function GameHomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-6 overflow-x-hidden">
      <GameNexusBackground />
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen"> {/* Content wrapper */}
        
        <header className="text-center pt-16 pb-12 sm:pt-24 sm:pb-16 animate-fadeInUp animation-delay-[0.1s]">
          <ForgeSimLogo className="h-32 w-32 sm:h-40 sm:w-40 mx-auto mb-10 text-primary filter drop-shadow-[0_0_15px_hsl(var(--primary)/0.7)] animate-subtle-pulse" style={{animationDuration: '3s'}} />
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-headline font-black mb-6 leading-tight uppercase tracking-wider">
            <span className="block text-glow-primary">
              FORGE
            </span>
            <span className="block text-glow-accent mt-1">
              YOUR EMPIRE
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Enter the ultimate business simulation. Strategize, innovate, and lead your AI-powered venture to market dominance.
          </p>
        </header>

        <main className="w-full max-w-5xl mx-auto space-y-20 sm:space-y-28">
          <section className="text-center animate-fadeInUp animation-delay-[0.3s]">
            <Button 
              asChild 
              size="lg" 
              className="w-full max-w-xs sm:max-w-sm bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-xl sm:text-2xl py-7 sm:py-8 rounded-lg shadow-accent-glow-md transition-all duration-300 hover:scale-105 hover:shadow-accent-glow-lg focus:ring-4 focus:ring-accent/70 animate-subtle-pulse"
              style={{animationDuration: '2s'}}
            >
              <Link href="/app">
                <PlayCircle className="mr-3 h-7 w-7 sm:h-8 sm:w-8" />
                ENTER THE FORGE
              </Link>
            </Button>
             <p className="text-sm text-muted-foreground mt-6">
              Your journey to entrepreneurial mastery begins now.
            </p>
          </section>

          <section id="gameplay-pillars" className="animate-fadeInUp animation-delay-[0.5s]">
            <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-12 text-glow-accent text-center uppercase tracking-wide">Core Directives</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              <DirectiveCard
                icon={<Command className="h-12 w-12 text-primary" />}
                title="Strategic Command"
                description="Design your business blueprint. Set resource allocations, define market strategies, and make critical operational decisions."
                animationDelay="0.6s"
              />
              <DirectiveCard
                icon={<Users className="h-12 w-12 text-primary" />}
                title="AI Cohort Nexus"
                description="Assemble and consult your team of specialized AI Agents. Leverage their expertise in finance, marketing, R&D, and more."
                animationDelay="0.8s"
              />
              <DirectiveCard
                icon={<Microscope className="h-12 w-12 text-primary" />}
                title="Simulation Crucible"
                description="Test hypotheses, explore 'what-if' scenarios, and adapt to dynamic market events in a risk-free digital twin environment."
                animationDelay="1.0s"
              />
            </div>
          </section>
          
          <section id="features-overview" className="animate-fadeInUp animation-delay-[0.7s]">
             <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-12 text-glow-primary text-center uppercase tracking-wide">ForgeSim Systems</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <SystemFeatureItem icon={<Building2 className="text-accent h-6 w-6"/>} title="Digital Twin Construction" description="AI generates a dynamic model of your venture based on your unique inputs." />
              <SystemFeatureItem icon={<Brain className="text-accent h-6 w-6"/>} title="Hive Mind Intelligence" description="Central AI coordinator (EVE) synthesizes agent insights for personalized guidance." />
              <SystemFeatureItem icon={<TrendingUpIcon className="text-accent h-6 w-6"/>} title="Predictive Analytics Engine" description="Foresee potential outcomes and identify risks with advanced AI modeling." />
              <SystemFeatureItem icon={<ShieldCheck className="text-accent h-6 w-6"/>} title="Risk Assessment Lab" description="Explore 'what-if' scenarios and stress-test your strategies without real-world consequence." />
            </div>
          </section>


          <section className="text-center my-20 sm:my-24 animate-fadeInUp animation-delay-[0.9s]">
             <h3 className="text-2xl font-headline text-muted-foreground mb-6">
                Are you ready to lead?
            </h3>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="w-full max-w-xs sm:max-w-sm border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg sm:text-xl py-6 sm:py-7 rounded-lg shadow-md hover:shadow-accent-glow-sm transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-accent/70"
            >
              <Link href="/login">
                <LogIn className="mr-3 h-6 w-6 sm:h-7 sm:w-7" />
                Access Your Terminal
              </Link>
            </Button>
          </section>
        </main>

        <footer className="mt-24 pb-12 text-center text-muted-foreground/70 text-xs animate-fadeInUp animation-delay-[1.2s]">
          <p>&copy; {new Date().getFullYear()} ForgeSim.AI Dynamics. Simulation Protocol Initialized.</p>
        </footer>
      </div>
    </div>
  );
}

interface DirectiveCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  animationDelay?: string;
}

function DirectiveCard({ icon, title, description, animationDelay }: DirectiveCardProps) {
  return (
    <Card 
      className="bg-card/60 backdrop-blur-md shadow-card-deep p-6 text-center group card-glow-hover-primary transform hover:-translate-y-1 animate-fadeInUp border border-transparent hover:border-primary/50"
      style={{ animationDelay: animationDelay || '0s' }}
    >
      <CardHeader className="flex flex-col items-center justify-center pb-4 p-0">
        <div className="mb-5 p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">{icon}</div>
        <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground group-hover:text-glow-primary transition-colors duration-300 uppercase tracking-normal">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground p-0 text-sm sm:text-base">
        {description}
      </CardContent>
    </Card>
  );
}

interface SystemFeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SystemFeatureItem({ icon, title, description }: SystemFeatureItemProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm p-5 rounded-lg shadow-sm hover:shadow-primary-glow-sm transition-all duration-300 ease-in-out group card-glow-hover-accent transform hover:-translate-y-0.5 border border-transparent hover:border-accent/40">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 p-2.5 bg-accent/10 rounded-md group-hover:bg-accent/20 transition-colors duration-300">{icon}</div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 group-hover:text-glow-accent transition-colors duration-300">{title}</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
