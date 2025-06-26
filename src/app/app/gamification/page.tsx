
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreDisplay } from "@/components/gamification/score-display";
import { RewardsCard, type Reward } from "@/components/gamification/rewards-card";
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


export default function GamificationPage() {
  const router = useRouter();
  const { 
    startupScore, 
    rewards, 
    keyEvents, 
    missions,
    setMissions,
    toggleMissionCompletion,
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
        const simStateForAI = { // Construct the necessary parts of the state for the AI
            simulationMonth, companyName, financials, userMetrics, product, resources, market, startupScore,
            keyEvents: keyEvents.slice(-5).map(e => e.description), // Only recent event descriptions
            rewards, initialGoals, missions, suggestedChallenges, isInitialized,
            // Explicitly exclude fields that are not part of the input schema or are too large/irrelevant
            currentAiReasoning: null, // Not needed for mission generation
            historicalRevenue: [], historicalUserGrowth: [], historicalBurnRate: [], historicalNetProfitLoss: [],
            historicalExpenseBreakdown: [], historicalCAC: [], historicalChurnRate: [], historicalProductProgress: [],
            sandboxState: null, isSandboxing: false, sandboxRelativeMonth: 0,
        };

        const input: GenerateDynamicMissionsInput = {
            simulationStateJSON: JSON.stringify(simStateForAI),
            recentEvents: keyEvents.slice(-3).map(e => e.description), // Last 3 event descriptions
            currentGoals: initialGoals, // Use initial goals for now
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
            Progress & Achievements
        </h1>
        <p className="text-muted-foreground">
          Track your startup score, earned rewards, active missions, and key milestones achieved within the Inceptico AI simulation.
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

      <Card className="shadow-lg mb-8">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ListChecks className="h-6 w-6 text-accent" />
                    <CardTitle className="font-headline">Active Missions</CardTitle>
                </div>
                <Button onClick={handleGenerateMissions} disabled={isLoadingMissions || !isInitialized} size="sm" variant="outline">
                    {isLoadingMissions ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Wand2 className="h-4 w-4 mr-2"/>}
                    {isLoadingMissions ? "Generating..." : "AI: Suggest New Missions"}
                </Button>
            </div>
            <CardDescription>Complete these objectives to grow your startup. Mission completion is currently manual.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[250px]">
            {isInitialized && missions.length > 0 ? (
                <ul className="space-y-4">
                {missions.map((mission) => (
                    <li key={mission.id} className="flex items-start gap-3 p-3 border border-border rounded-md hover:bg-muted/50 transition-colors">
                    <Checkbox 
                        id={`mission-${mission.id}`} 
                        checked={mission.isCompleted} 
                        onCheckedChange={() => toggleMissionCompletion(mission.id)}
                        aria-label={mission.title} 
                        className="mt-1 shrink-0 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground focus-visible:ring-accent"
                    />
                    <div className="flex-grow">
                        <label htmlFor={`mission-${mission.id}`} className={`font-medium ${mission.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {mission.title} {mission.difficulty && <span className="text-xs font-normal bg-muted px-1.5 py-0.5 rounded-sm ml-1 capitalize">{mission.difficulty}</span>}
                        </label>
                        <p className={`text-xs ${mission.isCompleted ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                        {mission.description}
                        </p>
                        {!mission.isCompleted && (
                        <p className="text-xs text-accent font-medium mt-1">Reward: {mission.rewardText}</p>
                        )}
                    </div>
                    </li>
                ))}
                </ul>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-4">
                <Info className="h-10 w-10 mb-2" />
                <p>{isInitialized ? "No active missions. Click 'Suggest New Missions' to get some from the AI." : "Initialize simulation to see missions."}</p>
                </div>
            )}
            </ScrollArea>
        </CardContent>
      </Card>


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
