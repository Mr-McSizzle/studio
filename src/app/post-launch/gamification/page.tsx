
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreDisplay } from "@/components/gamification/score-display";
import { RewardsCard } from "@/components/gamification/rewards-card";
import { useSimulationStore } from "@/store/simulationStore";
import type { Mission, GenerateDynamicMissionsInput } from "@/types/simulation";
import { generateDynamicMissions } from "@/ai/flows/generate-dynamic-missions-flow";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, AlertTriangle, ListChecks, Sparkles, Info, Loader2, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function PostLaunchGamificationPage() {
  const router = useRouter();
  const { 
    startupScore, 
    rewards, 
    keyEvents, 
    missions,
    setMissions,
    isInitialized, 
    financials, 
    simulationMonth,
    companyName, userMetrics, product, resources, market, initialGoals, suggestedChallenges,
  } = useSimulationStore();
  const { toast } = useToast();
  const [isLoadingMissions, setIsLoadingMissions] = useState(false);
  
  useEffect(() => {
     if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  const scoreTrend = startupScore > (useSimulationStore.getState().startupScore - 1) ? "up" : startupScore < (useSimulationStore.getState().startupScore -1 ) ? "down" : "neutral";

  const handleGenerateMissions = async () => {
    if (!isInitialized) {
        toast({ title: "Simulation Not Ready", description: "Initialize your simulation to generate missions.", variant: "destructive"});
        return;
    }
    setIsLoadingMissions(true);
    try {
        const simStateForAI = {
            simulationMonth, companyName, financials, userMetrics, product, resources, market, startupScore,
            keyEvents: keyEvents.slice(-5).map(e => e.description),
            rewards, initialGoals, missions, suggestedChallenges, isInitialized,
            currentAiReasoning: null,
            historicalRevenue: [], historicalUserGrowth: [], historicalBurnRate: [], historicalNetProfitLoss: [],
            historicalExpenseBreakdown: [], historicalCAC: [], historicalChurnRate: [], historicalProductProgress: [],
            sandboxState: null, isSandboxing: false, sandboxRelativeMonth: 0,
        };

        const input: GenerateDynamicMissionsInput = {
            simulationStateJSON: JSON.stringify(simStateForAI),
            recentEvents: keyEvents.slice(-3).map(e => e.description),
            currentGoals: initialGoals,
        };
        const result = await generateDynamicMissions(input);
        setMissions(result.generatedMissions);
        toast({ title: "New Missions Generated!", description: "The AI has suggested new objectives."});
    } catch (error) {
        console.error("Error generating dynamic missions:", error);
        toast({ title: "Mission Generation Failed", description: "Could not get new missions from AI.", variant: "destructive"});
    } finally {
        setIsLoadingMissions(false);
    }
  };

  const achievements = keyEvents
    .filter(event => 
        event.category === "Product" || event.category === "Financial" ||
        (event.category === "General" && event.impact === "Positive") ||
        event.description.toLowerCase().includes("milestone") || 
        event.description.toLowerCase().includes("achieved") || 
        event.description.toLowerCase().includes("unlocked") ||
        event.description.toLowerCase().includes("reward earned:") ||
        event.description.toLowerCase().includes("product advanced to")
    )
    .slice(-10) 
    .reverse();

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
       {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Setup Simulation" page to initialize your digital twin before viewing gamification progress.
             <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
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
        <ScoreDisplay score={isInitialized ? startupScore : 0} trend={isInitialized ? scoreTrend : "neutral"} />
      </div>
      
      {financials.cashOnHand <= 0 && isInitialized && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Game Over - Out of Cash!</AlertTitle>
          <AlertDescription>
            Achievements and rewards are paused as the simulation is unstable. Reset the simulation from the dashboard to try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg h-full">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-accent" />
                    <CardTitle className="font-headline">Key Events & Milestones</CardTitle>
                </div>
                <CardDescription>Recent notable occurrences and achievements from your simulation journey.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[250px]">
                {isInitialized && achievements.length > 0 ? (
                    <ul className="space-y-2">
                    {achievements.map((event, index) => (
                        <li key={event.id || index} className="flex items-start gap-3 p-2 text-sm border-b border-border/50 last:border-b-0">
                            <Sparkles className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                            <span className="text-muted-foreground"><span className="font-semibold text-foreground/80">M{event.month}:</span> [{event.category}] {event.description}</span>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-4">
                        <ListChecks className="h-10 w-10 mb-2" />
                        <p>No significant events or milestones recorded yet.</p>
                        <p className="text-xs">Advance the simulation to see achievements here.</p>
                    </div>
                )}
                </ScrollArea>
            </CardContent>
        </Card>
        <RewardsCard rewards={isInitialized ? rewards : []} />
      </div>
    </div>
  );
}
