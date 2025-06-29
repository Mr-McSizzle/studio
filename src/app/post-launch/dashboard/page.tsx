"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MilestonePuzzle } from "@/components/dashboard/MilestonePuzzle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ChevronsRight, Loader2, RefreshCcw, TrendingUp, DollarSign, Users, Percent, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function PostLaunchDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Use state to avoid hydration mismatch
  const [storeState, setStoreState] = useState({
    isInitialized: false,
    simulationMonth: 0,
    financials: { cashOnHand: 0, profit: 0, currencySymbol: "$" },
    userMetrics: { churnRate: 0 },
    missions: [],
    historicalRevenue: []
  });
  
  useEffect(() => {
    setMounted(true);
    
    // Get store state after component mounts
    const simState = useSimulationStore.getState();
    setStoreState({
      isInitialized: simState.isInitialized,
      simulationMonth: simState.simulationMonth,
      financials: simState.financials,
      userMetrics: simState.userMetrics,
      missions: simState.missions,
      historicalRevenue: simState.historicalRevenue
    });
    
    if (!simState.isInitialized) {
      router.replace('/app/post-launch/setup');
    }
  }, [router]);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  const areTasksComplete = storeState.missions.length > 0 && storeState.missions.every(task => task.isCompleted);
  const isGameOver = storeState.isInitialized && storeState.financials.cashOnHand <= 0;

  const revenueGrowth = useMemo(() => {
    if (storeState.historicalRevenue.length < 2) return null;
    const currentMonthRevenue = storeState.historicalRevenue[storeState.historicalRevenue.length - 1].revenue;
    const previousMonthRevenue = storeState.historicalRevenue[storeState.historicalRevenue.length - 2].revenue;
    if (previousMonthRevenue === 0) return { percentage: currentMonthRevenue > 0 ? "Infinite" : "0.0", isPositive: currentMonthRevenue > 0 };
    const growth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    return { percentage: growth.toFixed(1), isPositive: growth >= 0 };
  }, [storeState.historicalRevenue]);

  const handleSimulateQuarter = async () => {
    setIsSimulating(true);
    toast({ title: "Simulating Quarter...", description: "Advancing simulation by 3 months. Please wait." });
    
    const advanceMonth = useSimulationStore.getState().advanceMonth;
    
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
    
    // Update local state after simulation
    const updatedState = useSimulationStore.getState();
    setStoreState({
      isInitialized: updatedState.isInitialized,
      simulationMonth: updatedState.simulationMonth,
      financials: updatedState.financials,
      userMetrics: updatedState.userMetrics,
      missions: updatedState.missions,
      historicalRevenue: updatedState.historicalRevenue
    });
  };
  
  if (!storeState.isInitialized) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Post-Launch Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Redirecting to the post-launch setup page...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-headline text-foreground">Post-Launch Dashboard: Q{Math.floor(storeState.simulationMonth / 3) + 1}</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSimulateQuarter}
            disabled={isSimulating || !areTasksComplete || isGameOver}
            className="bg-primary hover:bg-primary/90"
          >
            {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronsRight className="mr-2 h-4 w-4" />}
            Simulate Next Quarter
          </Button>
          <Button onClick={() => {
            useSimulationStore.getState().resetSimulation();
            setStoreState({
              isInitialized: false,
              simulationMonth: 0,
              financials: { cashOnHand: 0, profit: 0, currencySymbol: "$" },
              userMetrics: { churnRate: 0 },
              missions: [],
              historicalRevenue: []
            });
          }} variant="outline">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 my-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Net Profit</CardTitle>
            <DollarSign className={cn("h-4 w-4 text-muted-foreground", storeState.financials.profit >= 0 ? "text-green-500" : "text-destructive")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", storeState.financials.profit >= 0 ? "text-green-500" : "text-destructive")}>
              {storeState.financials.profit >= 0 ? '+' : ''}{storeState.financials.currencySymbol}{storeState.financials.profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Revenue minus all expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Retention Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((1 - storeState.userMetrics.churnRate) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{(storeState.userMetrics.churnRate * 100).toFixed(1)}% churn rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth (MoM)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", revenueGrowth?.isPositive ? "text-green-500" : "text-destructive")}>
              {revenueGrowth ? `${revenueGrowth.percentage}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Month-over-month change</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Adoption Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">New feature engagement (placeholder)</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8 mt-6">
        <MilestonePuzzle
          missions={storeState.missions}
          onMissionToggle={(id) => {
            const toggleMissionCompletion = useSimulationStore.getState().toggleMissionCompletion;
            toggleMissionCompletion(id);
            
            // Update local state after toggling
            const updatedState = useSimulationStore.getState();
            setStoreState(prev => ({
              ...prev,
              missions: updatedState.missions
            }));
            
            toast({ title: "Mission Status Updated", description: "Your progress has been saved." });
          }}
          title={`Quarter ${Math.floor(storeState.simulationMonth / 3) + 1} Objectives`}
          puzzleId={`post_launch_q${Math.floor(storeState.simulationMonth / 3) + 1}`}
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