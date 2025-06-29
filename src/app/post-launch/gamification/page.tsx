"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ScoreDisplay } from "@/components/gamification/score-display";
import { RewardsCard } from "@/components/gamification/rewards-card";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Trophy, AlertTriangle, Info, DollarSign, Users, Rocket, Globe, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StructuredKeyEvent } from "@/types/simulation";

const MilestoneItem = ({ event }: { event: StructuredKeyEvent }) => (
  <li className="flex items-start gap-3 p-2 text-sm border-b border-border/50 last:border-b-0">
    <Sparkles className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
    <span className="text-muted-foreground">
      <span className="font-semibold text-foreground/80">M{event.month}:</span> [{event.category}] {event.description}
    </span>
  </li>
);

const MilestoneCard = ({ title, icon: Icon, milestones, emptyText }: { title: string, icon: React.ElementType, milestones: StructuredKeyEvent[], emptyText: string }) => (
  <Card className="shadow-lg h-full">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-accent" />
        <CardTitle className="font-headline">{title}</CardTitle>
      </div>
      <CardDescription>Key achievements in this category.</CardDescription>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[250px]">
        {milestones.length > 0 ? (
          <ul className="space-y-2">
            {milestones.map((event, index) => (
              <MilestoneItem key={event.id || index} event={event} />
            ))}
          </ul>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-4">
            <Info className="h-10 w-10 mb-2" />
            <p>{emptyText}</p>
          </div>
        )}
      </ScrollArea>
    </CardContent>
  </Card>
);

// Import Sparkles component
const Sparkles = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-2.5-8.5-2 2m-9 9-2 2m13-2 2 2m-9-13-2 2" />
  </svg>
);

export default function PostLaunchGamificationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [storeState, setStoreState] = useState({
    startupScore: 0,
    rewards: [],
    keyEvents: [],
    isInitialized: false,
    financials: { cashOnHand: 0 },
    simulationMonth: 0
  });
  
  useEffect(() => {
    setMounted(true);
    
    // Get store state after component mounts
    const state = useSimulationStore.getState();
    setStoreState({
      startupScore: state.startupScore,
      rewards: state.rewards,
      keyEvents: state.keyEvents,
      isInitialized: state.isInitialized,
      financials: state.financials,
      simulationMonth: state.simulationMonth
    });
    
    if (!state.isInitialized) {
      router.replace('/app/post-launch/setup');
    }
  }, [router]);
  
  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading achievements...</p>
      </div>
    );
  }

  const scoreTrend = useMemo(() => {
    // This is now safe to calculate since we're client-side
    const prevScore = useSimulationStore.getState().startupScore - 1;
    return storeState.startupScore > prevScore ? "up" : 
           storeState.startupScore < prevScore ? "down" : "neutral";
  }, [storeState.startupScore]);

  const financialMilestones = useMemo(() => storeState.keyEvents
    .filter(event => 
        (event.category === "Financial" && event.impact === "Positive") ||
        event.description.toLowerCase().includes("revenue target") ||
        event.description.toLowerCase().includes("profitable") ||
        event.description.toLowerCase().includes("funding")
    )
    .slice(-10).reverse(), [storeState.keyEvents]);

  const userMilestones = useMemo(() => storeState.keyEvents
    .filter(event => 
        event.category === "User" ||
        event.description.toLowerCase().includes("user milestone") ||
        event.description.toLowerCase().includes(" mau") // space before to avoid "manual"
    )
    .slice(-10).reverse(), [storeState.keyEvents]);
    
  const productMilestones = useMemo(() => storeState.keyEvents
    .filter(event => 
        event.category === "Product" ||
        event.description.toLowerCase().includes("product advanced to") ||
        event.description.toLowerCase().includes("feature launch") ||
        event.description.toLowerCase().includes("release")
    )
    .slice(-10).reverse(), [storeState.keyEvents]);

  const marketMilestones = useMemo(() => storeState.keyEvents
    .filter(event => 
        event.category === "Market" ||
        event.description.toLowerCase().includes("market expansion") ||
        event.description.toLowerCase().includes("new market")
    )
    .slice(-10).reverse(), [storeState.keyEvents]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
       {!storeState.isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Post-Launch Setup" page to initialize your digital twin.
             <Button onClick={() => router.push('/app/post-launch/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
            <Trophy className="h-8 w-8 text-accent" />
            Growth & Milestones
        </h1>
        <p className="text-muted-foreground">
          Track your Startup Score, earned rewards, and key milestones during your growth phase.
        </p>
      </header>

      <div className="mb-8">
        <ScoreDisplay score={storeState.isInitialized ? storeState.startupScore : 0} trend={scoreTrend} />
      </div>
      
      {storeState.financials.cashOnHand <= 0 && storeState.isInitialized && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Game Over - Out of Cash!</AlertTitle>
          <AlertDescription>
            Achievements and rewards are paused as the simulation is unstable. Reset the simulation from the dashboard to try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <RewardsCard rewards={storeState.isInitialized ? storeState.rewards : []} />
        </div>
        <MilestoneCard 
          title="Financial Milestones" 
          icon={DollarSign} 
          milestones={financialMilestones} 
          emptyText="No major financial milestones achieved yet."
        />
        <MilestoneCard 
          title="User Growth Milestones" 
          icon={Users} 
          milestones={userMilestones}
          emptyText="No significant user growth milestones reached."
        />
        <MilestoneCard 
          title="Product & Release Milestones" 
          icon={Rocket} 
          milestones={productMilestones}
          emptyText="No new product releases or stage advancements recorded."
        />
        <MilestoneCard 
          title="Market Expansion" 
          icon={Globe} 
          milestones={marketMilestones}
          emptyText="No market expansion events have occurred yet."
        />
      </div>
    </div>
  );
}