
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MilestonePuzzle } from "@/components/dashboard/MilestonePuzzle";
import type { DashboardMilestone } from "@/types/simulation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ChevronsRight, Loader2, RefreshCcw, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const postLaunchMilestones: DashboardMilestone[] = [
  { id: 'q-revenue', name: 'Quarterly Revenue Target', icon: TrendingUp, isUnlocked: false, description: "Achieve quarterly revenue goals." },
  { id: 'q-user-growth', name: 'Quarterly User Growth', icon: TrendingUp, isUnlocked: false, description: "Hit user acquisition targets for the quarter." },
  { id: 'q-feature-ship', name: 'Ship Key Feature', icon: TrendingUp, isUnlocked: false, description: "Successfully launch the next major feature on the roadmap." },
  { id: 'q-churn-reduction', name: 'Reduce Churn Rate', icon: TrendingUp, isUnlocked: false, description: "Implement strategies to lower customer churn." },
  { id: 'q-profitability', name: 'Achieve Profitability', icon: TrendingUp, isUnlocked: false, description: "Make monthly profit positive for at least one month this quarter." },
  { id: 'q-funding-round', name: 'Secure Funding', icon: TrendingUp, isUnlocked: false, description: "Successfully close a new round of funding." },
];

export default function PostLaunchDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isInitialized,
    simulationMonth,
    financials,
    advanceMonth,
    resetSimulation,
  } = useSimulationStore();
  
  const [quarterlyTasks, setQuarterlyTasks] = useState(postLaunchMilestones);
  const [isSimulating, setIsSimulating] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      router.replace('/app/setup');
    }
  }, [isInitialized, router]);

  const areTasksComplete = quarterlyTasks.every(task => task.isUnlocked);
  const isGameOver = isInitialized && financials.cashOnHand <= 0;

  const handleSimulateQuarter = async () => {
    setIsSimulating(true);
    toast({ title: "Simulating Quarter...", description: "Advancing simulation by 3 months. Please wait." });
    // Simulate 3 months for a quarter
    for (let i = 0; i < 3; i++) {
      if (useSimulationStore.getState().financials.cashOnHand > 0) {
        await advanceMonth();
      } else {
        toast({ title: "Simulation Halted", description: "Ran out of cash during the quarter.", variant: "destructive"});
        break;
      }
    }
    toast({ title: "Quarter Complete!", description: `Advanced to Month ${useSimulationStore.getState().simulationMonth}. New objectives are available.` });
    
    // Reset tasks for the new quarter
    setQuarterlyTasks(postLaunchMilestones.map(m => ({ ...m, isUnlocked: false })));
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

      <div className="space-y-8">
        <MilestonePuzzle
          milestones={quarterlyTasks}
          onMilestonesChange={setQuarterlyTasks}
          title={`Quarter ${Math.floor(simulationMonth / 3) + 1} Objectives`}
          puzzleId={`post_launch_q${Math.floor(simulationMonth / 3) + 1}`}
          userId="founder" // Placeholder user ID
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
