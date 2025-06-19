import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, Target, ShieldCheck, Users, TrendingUpIcon, Briefcase, Network, LogIn, ChevronRight, Sparkles, Rocket, Trophy } from 'lucide-react';

// NEXUS inspired animated background elements
const NexusBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-background opacity-80" />
    <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl animate-pulse animation-delay-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-3xl animate-pulse animation-delay-[1s]" />
    <div
      className="absolute top-[10%] left-[15%] w-4 h-4 border border-primary/30 rotate-45 animate-spin"
      style={{ animationDuration: "20s" }}
    />
    <div className="absolute top-[30%] right-[20%] w-6 h-6 border border-accent/30 animate-bounce animation-delay-[0.5s]" />
    <div className="absolute bottom-[25%] left-[30%] w-3 h-3 bg-primary/20 rotate-45 animate-pulse animation-delay-[1.5s]" />
    <div className="absolute bottom-[15%] right-[10%] w-8 h-8 border-2 border-accent/20 rounded-full animate-pulse animation-delay-[2s]" />
  </div>
);


export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-6 overflow-x-hidden">
      <NexusBackground />
      <div className="relative z-10 w-full"> {/* Content wrapper */}
        <header className="text-center my-16 sm:my-24 animate-fadeInUp">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-accent to-yellow-400 shadow-lg mx-auto mb-8 w-32 h-32 sm:w-36 sm:h-36">
            <ForgeSimLogo className="h-full w-full text-black" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-headline font-extrabold mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Forge Your Reality
            </span>
            <span className="block text-foreground/90 mt-2">with ForgeSim</span>
          </h1>
          <div className="flex justify-center gap-2 mb-6">
            <Badge variant="xp" className="text-sm px-4 py-1">
              <Zap className="h-4 w-4 mr-1" />
              Gamified Experience
            </Badge>
            <Badge variant="level" className="text-sm px-4 py-1">
              <Brain className="h-4 w-4 mr-1" />
              AI-Powered
            </Badge>
          </div>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the future of business strategy with ForgeSim: AI-powered digital twins for risk-free innovation and growth.
          </p>
        </header>

        <main className="w-full max-w-7xl mx-auto space-y-24 sm:space-y-32">
          <section id="how-it-works" className="text-center animate-fadeInUp animation-delay-[0.2s]">
            <h2 className="text-4xl font-headline font-bold mb-12 text-glow-primary">How ForgeSim Empowers You</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              <InfoCard
                icon={<Rocket className="h-10 w-10 text-accent" />}
                title="1. Digital Twin Creation"
                description="Instantly generate a dynamic virtual replica of your business concept. Input your vision, and let our AI construct your initial simulation."
                animationDelay="0.3s"
                xpReward={50}
              />
              <InfoCard
                icon={<Brain className="h-10 w-10 text-accent" />}
                title="2. Hive Mind Guidance"
                description="Engage with the AI Hive Mind, your central strategist, coordinating insights from specialized AI agents for bespoke advice."
                animationDelay="0.5s"
                xpReward={25}
              />
              <InfoCard
                icon={<Trophy className="h-10 w-10 text-accent" />}
                title="3. Level Up Your Startup"
                description="Complete quests, earn achievements, and watch your startup score rise as you make strategic decisions in a gamified environment."
                animationDelay="0.7s"
                xpReward={100}
              />
            </div>
          </section>

          <section id="key-features" className="animate-fadeInUp animation-delay-[0.4s]">
            <h2 className="text-4xl font-headline font-bold mb-12 text-glow-accent text-center">Core Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <FeatureItem icon={<Target className="text-primary h-7 w-7"/>} title="Business Digital Twin" description="A comprehensive virtual replica for iterative strategy testing and operational refinement." />
              <FeatureItem icon={<Users className="text-primary h-7 w-7"/>} title="AI Expert Agents" description="A suite of specialized AI agents providing domain-specific insights and performing simulated actions." />
              <FeatureItem icon={<Network className="text-primary h-7 w-7"/>} title="Personalized Hive Mind" description="Your AI coordinator, synthesizing complex information and delivering tailored strategic advice." />
              <FeatureItem icon={<TrendingUpIcon className="text-primary h-7 w-7"/>} title="Predictive Analytics" description="Advanced algorithms simulate diverse business scenarios and predict potential outcomes." />
              <FeatureItem icon={<Briefcase className="text-primary h-7 w-7"/>} title="Strategic Decision Engine" description="Make choices on resource allocation, marketing, R&D, and team structure, then see the impact." />
              <FeatureItem icon={<Sparkles className="text-primary h-7 w-7"/>} title="Achievement System" description="Earn XP, complete quests, and unlock rewards as you progress through your startup journey." />
            </div>
          </section>
          
          <section id="benefits" className="text-left animate-fadeInUp animation-delay-[0.6s]">
            <h2 className="text-4xl font-headline font-bold mb-12 text-glow-primary text-center">Key Benefits</h2>
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BenefitItem text="Reduce Risk through pre-emptive simulation and strategy validation." xp={15} />
              <BenefitItem text="Improve Decision-Making with AI-driven predictive analytics." xp={20} />
              <BenefitItem text="Accelerate Learning by understanding the impact of strategies quickly." xp={25} />
              <BenefitItem text="Cost-Effective Experimentation for innovative ideas without real-world burden." xp={15} />
              <BenefitItem text="Enhance Strategic Planning with robust, data-backed business plans." xp={30} />
              <BenefitItem text="Unlock Full Potential by making complex decisions accessible and insightful." xp={50} />
            </ul>
          </section>

          <section className="text-center my-20 sm:my-24 animate-fadeInUp animation-delay-[0.8s]">
            <Button 
              asChild 
              size="lg" 
              className="w-full max-w-md bg-gradient-to-r from-accent to-yellow-400 hover:from-accent/90 hover:to-yellow-400/90 text-black font-bold text-xl py-7 rounded-lg shadow-lg hover:shadow-accent-glow-md transition-all duration-300 hover:scale-105"
            >
              <Link href="/launchpad">
                <LogIn className="mr-3 h-6 w-6" />
                Enter Launchpad
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-8 flex items-center justify-center gap-1">
              <Zap className="h-4 w-4 text-accent" />
              Ready to forge your startup's future? Dive into the simulation.
            </p>
          </section>
        </main>

        <footer className="mt-24 pb-12 text-center text-muted-foreground text-sm animate-fadeInUp animation-delay-[1s]">
          <p>&copy; {new Date().getFullYear()} ForgeSim.AI. Revolutionizing Business Strategy.</p>
        </footer>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  animationDelay?: string;
  xpReward?: number;
}

function InfoCard({ icon, title, description, animationDelay, xpReward }: InfoCardProps) {
  return (
    <Card 
      className="bg-gradient-to-br from-card via-card/90 to-accent/10 border-accent/30 shadow-lg p-6 text-left group card-glow-hover-accent transform hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
      style={{ animationDelay: animationDelay || '0s' }}
    >
      <CardHeader className="flex flex-row items-start gap-4 pb-4 p-0">
        <div className="flex-shrink-0 mt-1 p-3 bg-gradient-to-br from-accent to-yellow-400 rounded-lg shadow-md group-hover:shadow-accent-glow-sm transition-all duration-300">
          {icon}
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground group-hover:text-glow-accent transition-colors duration-300">
          {title}
          {xpReward && (
            <Badge variant="xp" className="ml-2 text-xs">
              +{xpReward} XP
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground p-0">
        {description}
      </CardContent>
    </Card>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <Card className="bg-gradient-to-br from-card via-card/90 to-primary/10 border-primary/30 p-6 shadow-lg hover:shadow-primary-glow-sm transition-all duration-300 ease-in-out group card-glow-hover-primary transform hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-primary to-red-400 rounded-lg shadow-md group-hover:shadow-primary-glow-sm transition-all duration-300">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-glow-primary transition-colors duration-300">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </Card>
  );
}

interface BenefitItemProps {
  text: string;
  xp?: number;
}

function BenefitItem({ text, xp }: BenefitItemProps) {
  return (
    <Card className="bg-gradient-to-br from-card via-card/90 to-accent/5 border-accent/20 p-4 shadow-md hover:shadow-accent-glow-sm transition-all duration-300 card-glow-hover-accent">
      <li className="flex items-center justify-between">
        <div className="flex items-center">
          <ChevronRight className="h-6 w-6 text-accent mr-2 shrink-0" />
          <span className="text-muted-foreground text-sm">{text}</span>
        </div>
        {xp && (
          <Badge variant="xp" className="text-xs">
            +{xp} XP
          </Badge>
        )}
      </li>
    </Card>
  );
}