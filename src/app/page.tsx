
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Brain, Target, ShieldCheck, Users, TrendingUpIcon, Briefcase, Network, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-background to-card p-6 overflow-x-hidden">
      <header className="text-center my-12 sm:my-16 animate-fadeIn">
        <ForgeSimLogo className="h-24 w-24 sm:h-28 sm:w-28 mx-auto mb-6 text-primary animate-subtle-pulse" />
        <h1 className="text-5xl sm:text-6xl font-headline font-bold mb-4 text-glow-gold">
          Welcome to ForgeSim
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          An innovative AI-powered platform to simulate business operations, empowering startups to test, refine, and perfect their strategies in a risk-free digital twin environment.
        </p>
      </header>

      <main className="w-full max-w-6xl space-y-20">
        <section id="how-it-works" className="text-center">
          <h2 className="text-4xl font-headline font-semibold mb-10 text-foreground">How ForgeSim Empowers You</h2>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            <InfoCard
              icon={<Zap className="h-10 w-10 text-accent" />}
              title="1. Pre-Launch Simulation"
              description="Input your business plan, target market, and budget. Our specialized AI agents simulate your launch, providing predictive insights and strategic recommendations for your digital twin."
            />
            <InfoCard
              icon={<Brain className="h-10 w-10 text-accent" />}
              title="2. Hive Mind Guidance"
              description="Interact with your personalized AI assistant, the 'Queen Hive Mind,' which synthesizes insights from all expert agents, offering tailored advice and strategic coordination."
            />
            <InfoCard
              icon={<ShieldCheck className="h-10 w-10 text-accent" />}
              title="3. Dynamic Risk & Scenario Analysis"
              description="Continuously test 'what-if' scenarios (market shifts, competitor actions) within your digital twin to identify potential risks and develop proactive mitigation strategies."
            />
          </div>
        </section>

        <section id="key-features">
          <h2 className="text-4xl font-headline font-semibold mb-10 text-foreground text-center">Core Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureItem icon={<Target className="text-primary h-8 w-8"/>} title="Business Digital Twin" description="A comprehensive virtual replica of your business for iterative strategy testing, operational refinement, and risk-free experimentation." />
            <FeatureItem icon={<Users className="text-primary h-8 w-8"/>} title="AI-Powered Expert Agents" description="Access a suite of AI agents (finance, marketing, operations, etc.) providing domain-specific insights and performing simulated actions." />
            <FeatureItem icon={<Network className="text-primary h-8 w-8"/>} title="Personalized Hive Mind Assistant" description="A dedicated AI coordinator ensuring seamless communication, synthesizing complex information, and delivering tailored strategic advice for your simulation." />
            <FeatureItem icon={<TrendingUpIcon className="text-primary h-8 w-8"/>} title="Predictive Analytics & Scenario Simulation" description="Advanced algorithms simulate diverse business scenarios, predict potential outcomes, and identify emerging risks and opportunities." />
             <FeatureItem icon={<Briefcase className="text-primary h-8 w-8"/>} title="Post-Launch & Growth Support" description="Continue to model future scenarios, predict outcomes of strategic pivots, and receive ongoing actionable insights as your simulated business evolves." />
          </div>
        </section>
        
        <section id="benefits" className="text-left">
          <h2 className="text-4xl font-headline font-semibold mb-10 text-foreground text-center">Key Benefits</h2>
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitItem text="Reduce Risk through pre-emptive simulation and strategy validation." />
            <BenefitItem text="Improve Decision-Making with AI-driven predictive analytics and expert guidance." />
            <BenefitItem text="Accelerate Learning by understanding the impact of different strategies quickly." />
            <BenefitItem text="Cost-Effective Experimentation for innovative ideas without real-world financial burden." />
            <BenefitItem text="Enhance Strategic Planning by developing robust and resilient business plans." />
            <BenefitItem text="Achieve Full Potential by making complex decisions more accessible and data-driven." />
          </ul>
        </section>


        <section className="text-center my-16">
          <Button 
            asChild 
            size="lg" 
            className="w-full max-w-sm bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6 rounded-lg shadow-gold-glow-md transition-all duration-300 hover:scale-105 hover:shadow-gold-glow-lg focus:ring-4 focus:ring-accent/70 animate-glow"
          >
            <Link href="/app">
              <LogIn className="mr-3 h-6 w-6" />
              Start Your Simulation
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-6">
            Ready to forge your startup&apos;s future? Click above to begin.
          </p>
        </section>
      </main>

      <footer className="mt-24 pb-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} ForgeSim. Revolutionizing startup strategy through AI simulation.</p>
      </footer>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-md shadow-card-deep hover:shadow-gold-glow-md transition-all duration-300 ease-in-out text-left group card-glow-hover transform hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4 pb-3">
        <div className="flex-shrink-0 mt-1 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">{icon}</div>
        <CardTitle className="text-2xl font-semibold text-foreground group-hover:text-glow-gold transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
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
    <Card className="bg-card/70 backdrop-blur-sm p-6 shadow-card-deep hover:shadow-gold-glow-sm transition-all duration-300 ease-in-out group card-glow-hover transform hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-glow-gold transition-colors">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <Card className="bg-card/60 p-4 shadow-md card-glow-hover">
      <li className="flex items-center">
        <ShieldCheck className="h-6 w-6 text-accent mr-3 shrink-0" />
        <span className="text-muted-foreground">{text}</span>
      </li>
    </Card>
  );
}
