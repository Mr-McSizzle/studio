
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScoreDisplay } from "@/components/gamification/score-display";
import { MissionsCard, type Mission } from "@/components/gamification/missions-card";
import { RewardsCard, type Reward } from "@/components/gamification/rewards-card";
import { useSimulationStore } from "@/store/simulationStore";
import { Trophy, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";


export default function GamificationPage() {
  const router = useRouter();
  const { startupScore, missions, rewards, isInitialized, financials, simulationMonth } = useSimulationStore();
  
  useEffect(() => {
     if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  // Basic trend calculation (can be improved)
  const scoreTrend = startupScore > (useSimulationStore.getState().startupScore - 1) ? "up" : startupScore < (useSimulationStore.getState().startupScore -1 ) ? "down" : "neutral";


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
            Simulation Milestones & Rewards
        </h1>
        <p className="text-muted-foreground">
          Track your progress within the ForgeSim simulation. Complete strategic missions and earn rewards to boost your digital twin's startup score and unlock advantages.
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
            Mission progress and rewards are paused as the simulation is unstable. Reset the simulation from the dashboard to try again.
          </AlertDescription>
        </Alert>
      )}


      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <MissionsCard missions={isInitialized ? missions : []} />
        <RewardsCard rewards={isInitialized ? rewards : []} />
      </div>
    </div>
  );
}
