
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MilestonePuzzle } from "@/components/dashboard/MilestonePuzzle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ChevronsRight, Loader2, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PostLaunchDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isInitialized,
    simulationMonth,
    financials,
    missions,
    toggleMissionCompletion,
    advanceMonth,
    resetSimulation,
  } = useSimulationStore();
  
  const [isSimulating, setIsSimulating] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      router.replace('/app/setup');
    }
  }, [isInitialized, router]);

  const areTasksComplete = missions.length > 0 && missions.every(task => task.isCompleted);
  const isGameOver = isInitialized && financials.cashOnHand <= 0;

  const handleSimulateQuarter = async () => {
    setIsSimulating(true);
    toast({ title: "Simulating Quarter...", description: "Advancing simulation by 3 months. Please wait." });
    
    for (let i = 0; i < 3; i++) {
      if (useSimulationStore.getState().financials.cashOnHand > 0) {
        await advanceMonth();
      } else {
        toast({ title: "Simulation Halted", description: "Ran out of cash during the quarter.", variant: "destructive"});
        break;
      }
    }
    
    toast({ title: "Quarter Complete!", description: `Advanced to Month ${useSimulationStore.getState().simulationMonth}. New objectives have been generated.` });
    setIsSimulating(false);
  };
  
  if (!isInitialized) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Redirecting to the setup page...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-headline text-foreground">Post-Launch Dashboard: Q{Math.floor(simulationMonth / 3) + 1}</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSimulateQuarter}
            disabled={isSimulating || !areTasksComplete || isGameOver}
            className="bg-primary hover:bg-primary/90"
          >
            {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronsRight className="mr-2 h-4 w-4" />}
            Simulate Next Quarter
          </Button>
          <Button onClick={resetSimulation} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset Simulation
          </Button>
        </div>
      </header>

      {isGameOver && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Game Over - Funding Depleted!</AlertTitle>
            <AlertDescription>
              Your startup has run out of cash. You can reset the simulation to try again.
            </AlertDescription>
          </Alert>
        )}
      {!areTasksComplete && !isGameOver && (
        <Alert>
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            Complete all quarterly objectives on the puzzle board below to simulate the next quarter.
          </AlertDescription>
        </Alert>
      )}


      <div className="space-y-8 mt-6">
        <MilestonePuzzle
          missions={missions}
          onMissionToggle={toggleMissionCompletion}
          title={`Quarter ${Math.floor(simulationMonth / 3) + 1} Objectives`}
          puzzleId={`post_launch_q${Math.floor(simulationMonth / 3) + 1}`}
          onPuzzleComplete={() => toast({ title: "Quarter Complete!", description: "You've met all objectives for this quarter. Ready to simulate the next one!"})}
        />
        {/* Placeholder for post-launch specific charts and metrics */}
        <Card>
            <CardHeader>
                <CardTitle>Post-Launch Analytics</CardTitle>
                <CardDescription>Advanced metrics like LTV:CAC, Cohort Analysis, and more will be displayed here.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground p-12">
                <p>(Advanced Post-Launch Charts Coming Soon)</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
