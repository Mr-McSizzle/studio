
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ForgeSimLogo } from '@/components/icons/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Brain, Target, ShieldCheck, Users, TrendingUpIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-6">
      <header className="text-center mb-12">
        <ForgeSimLogo className="h-24 w-24 mx-auto mb-6 text-primary" />
        <h1 className="text-5xl sm:text-6xl font-headline font-bold mb-4 text-foreground">
          Welcome to ForgeSim
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Simulate your business, test strategies, and harness AI-powered insights to build, refine, and perfect your startup's journey to success.
        </p>
      </header>

      <main className="w-full max-w-5xl space-y-12">
        <section id="how-it-works" className="text-center">
          <h2 className="text-3xl font-headline font-semibold mb-6 text-foreground">How ForgeSim Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-accent">
                  <Zap className="h-6 w-6" /> Pre-Launch Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Input your business plan, target market, and budget. Our AI agents (e.g., accountant, marketer) simulate your launch, offering predictive insights.
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-accent">
                  <Brain className="h-6 w-6" /> Hive Mind Guidance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Your personalized AI assistant, the "Queen Hive Mind," communicates tailored advice and coordinates insights from various AI expert agents.
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-accent">
                  <ShieldCheck className="h-6 w-6" /> Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Simulate diverse scenarios to identify potential risks and develop proactive mitigation strategies for your startup.
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="key-features" className="text-left">
          <h2 className="text-3xl font-headline font-semibold mb-6 text-foreground text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureItem icon={<Target className="text-primary h-7 w-7"/>} title="Digital Twin Technology" description="A virtual replica of your business for risk-free strategy testing and refinement." />
            <FeatureItem icon={<Users className="text-primary h-7 w-7"/>} title="AI-Powered Expert Agents" description="Access a team of AI agents with specialized expertise (finance, marketing, operations) providing comprehensive support." />
            <FeatureItem icon={<Brain className="text-primary h-7 w-7"/>} title="Personalized Hive Mind Assistant" description="A dedicated AI coordinator ensuring seamless communication and tailored advice, synthesizing insights from all agents." />
            <FeatureItem icon={<TrendingUpIcon className="text-primary h-7 w-7"/>} title="Predictive Analytics & Scenario Simulation" description="Advanced algorithms simulate outcomes, predict market changes, and identify potential risks and opportunities." />
          </div>
        </section>

        <section className="text-center mt-12">
          <Button asChild size="lg" className="w-full max-w-xs bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-4 rounded-lg shadow-lg transition-transform hover:scale-105 focus:ring-4 focus:ring-accent/50">
            <Link href="/app/dashboard">Launch Your Simulation</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Ready to forge your startup's future? Click above to begin.
          </p>
        </section>
      </main>

      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} ForgeSim. Revolutionizing startup strategy through AI simulation.</p>
      </footer>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-sm p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
