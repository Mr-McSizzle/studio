
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScoreDisplay } from "@/components/gamification/score-display";
import { RewardsCard, type Reward } from "@/components/gamification/rewards-card";
import { useSimulationStore } from "@/store/simulationStore";
import { Trophy, AlertTriangle, ListChecks, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function GamificationPage() {
  const router = useRouter();
  const { startupScore, rewards, keyEvents, isInitialized, financials, simulationMonth } = useSimulationStore();
  
  useEffect(() => {
     if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  // Basic trend calculation (can be improved)
  const scoreTrend = startupScore > (useSimulationStore.getState().startupScore - 1) ? "up" : startupScore < (useSimulationStore.getState().startupScore -1 ) ? "down" : "neutral";

  const achievements = keyEvents
    .filter(event => 
        event.toLowerCase().includes("milestone") || 
        event.toLowerCase().includes("achieved") || 
        event.toLowerCase().includes("unlocked") ||
        event.toLowerCase().includes("reward earned:") ||
        event.toLowerCase().includes("product advanced to")
    )
    .slice(-10) // Show last 10 achievements/key positive events
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
          Track your startup score, earned rewards, and key milestones achieved within the ForgeSim AI simulation.
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
                    <ListChecks className="h-6 w-6 text-accent" />
                    <CardTitle className="font-headline">Key Events & Milestones</CardTitle>
                </div>
                <CardDescription>Notable occurrences and achievements from your simulation journey.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[250px]">
                {isInitialized && achievements.length > 0 ? (
                    <ul className="space-y-2">
                    {achievements.map((event, index) => (
                        <li key={index} className="flex items-start gap-3 p-2 text-sm border-b border-border/50 last:border-b-0">
                            <Sparkles className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                            <span className="text-muted-foreground">{event}</span>
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

