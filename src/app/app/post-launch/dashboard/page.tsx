
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ChevronsRight, Loader2, RefreshCcw, TrendingUp, DollarSign, Users, Percent, CheckCircle, Scaling, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { CohortAnalysisChart } from "@/components/dashboard/CohortAnalysisChart";
import { HexPuzzleBoard } from "@/components/dashboard/HexPuzzleBoard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";


export default function PostLaunchDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isInitialized,
    simulationMonth,
    financials,
    userMetrics,
    missions,
    historicalRevenue,
    historicalUserGrowth,
    historicalCAC,
    historicalChurnRate,
    toggleMissionCompletion,
    advanceMonth,
    resetSimulation,
  } = useSimulationStore();
  
  const [isSimulating, setIsSimulating] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      router.replace('/app/post-launch/setup');
    }
  }, [isInitialized, router]);

  const areTasksComplete = missions.length > 0 && missions.every(task => task.isCompleted);
  const isGameOver = isInitialized && financials.cashOnHand <= 0;

  const revenueGrowth = useMemo(() => {
    if (historicalRevenue.length < 2) return null;
    const currentMonthRevenue = historicalRevenue[historicalRevenue.length - 1].revenue;
    const previousMonthRevenue = historicalRevenue[historicalRevenue.length - 2].revenue;
    if (previousMonthRevenue === 0) return { percentage: currentMonthRevenue > 0 ? "Infinite" : "0.0", isPositive: currentMonthRevenue > 0 };
    const growth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    return { percentage: growth.toFixed(1), isPositive: growth >= 0 };
  }, [historicalRevenue]);

  const ltvToCacData = useMemo(() => {
    const ratioData: { month: string, value: number, desktop: number }[] = [];
    const historicalDataMap = new Map<string, any>();

    historicalRevenue.forEach(d => {
      if (!historicalDataMap.has(d.month)) historicalDataMap.set(d.month, {});
      historicalDataMap.get(d.month).revenue = d.revenue;
    });
    historicalUserGrowth.forEach(d => {
      if (!historicalDataMap.has(d.month)) historicalDataMap.set(d.month, {});
      historicalDataMap.get(d.month).users = d.users;
    });
    historicalCAC.forEach(d => {
      if (!historicalDataMap.has(d.month)) historicalDataMap.set(d.month, {});
      historicalDataMap.get(d.month).cac = d.value;
    });
    historicalChurnRate.forEach(d => {
      if (!historicalDataMap.has(d.month)) historicalDataMap.set(d.month, {});
      historicalDataMap.get(d.month).churn = d.value / 100; // Convert from % to decimal
    });

    for (const [month, data] of historicalDataMap.entries()) {
      if (data.revenue !== undefined && data.users > 0 && data.churn > 0 && data.cac > 0) {
        const arpu = data.revenue / data.users;
        const ltv = arpu / data.churn;
        const ratio = ltv / data.cac;
        ratioData.push({ month, value: parseFloat(ratio.toFixed(2)), desktop: parseFloat(ratio.toFixed(2)) });
      }
    }

    return ratioData;
  }, [historicalRevenue, historicalUserGrowth, historicalCAC, historicalChurnRate]);


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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 my-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Net Profit</CardTitle>
            <DollarSign className={cn("h-4 w-4 text-muted-foreground", financials.profit >= 0 ? "text-green-500" : "text-destructive")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", financials.profit >= 0 ? "text-green-500" : "text-destructive")}>
              {financials.profit >= 0 ? '+' : ''}{financials.currencySymbol}{financials.profit.toLocaleString()}
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
              {((1 - userMetrics.churnRate) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{(userMetrics.churnRate * 100).toFixed(1)}% churn rate</p>
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
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV : CAC Ratio</CardTitle>
            <Scaling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ltvToCacData.length > 0 ? `${ltvToCacData[ltvToCacData.length - 1].value}:1` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Customer Lifetime Value to Acquisition Cost</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" /> EVE's Quarterly Objectives & Hive Puzzle
            </CardTitle>
            <CardDescription>
              Complete these quarterly objectives to advance the simulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <ScrollArea className="h-64 pr-3">
                  <ul className="space-y-3">
                  {missions.map((mission) => (
                      <li key={mission.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                        <Checkbox
                          id={`dash-mission-${mission.id}`}
                          checked={mission.isCompleted}
                          onCheckedChange={() => toggleMissionCompletion(mission.id)}
                          className="mt-1 shrink-0 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground focus-visible:ring-accent"
                          aria-labelledby={`dash-mission-label-${mission.id}`}
                        />
                        <div>
                          <label htmlFor={`dash-mission-${mission.id}`} className={cn("text-sm font-medium cursor-pointer", mission.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground')}>
                            {mission.title}
                          </label>
                          <p className="text-xs text-muted-foreground">{mission.difficulty ? `(${mission.difficulty})` : ''}</p>
                        </div>
                      </li>
                  ))}
                  </ul>
              </ScrollArea>
              <Button variant="outline" className="w-full" onClick={() => router.push('/app/post-launch/todo')}>
                View Full Quest Log
              </Button>
            </div>
             <div className="flex items-center justify-center pt-2">
              <HexPuzzleBoard missions={missions} />
            </div>
          </CardContent>
        </Card>

        <PerformanceChart
          title="LTV to CAC Ratio"
          description="Tracking the ratio of customer lifetime value to acquisition cost. A ratio > 3 is healthy."
          dataKey="value"
          data={ltvToCacData}
        />
        <CohortAnalysisChart />
      </div>
    </div>
  );
}
