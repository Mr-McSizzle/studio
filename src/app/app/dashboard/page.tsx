
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DollarSign, Users, TrendingUp, TrendingDown, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, PiggyBank, Brain, Loader2, Activity, Map, Target, Shield, BookOpen, Server, Rocket, Megaphone, PackageCheck, Flag, CheckCircle, LockIcon, Eye
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StructuredKeyEvent } from "@/types/simulation";
import { StageUnlockAnimationOverlay } from "@/components/dashboard/StageUnlockAnimationOverlay";

const MAX_SIMULATION_MONTHS = 24; 

const STAGE_UNLOCK_THRESHOLDS: Record<number, {id: string, name: string}> = {
    3: {id: "early_growth_unlocked", name: "Early Growth Phase"},
    6: {id: "expansion_phase_unlocked", name: "Expansion Phase"},
    10: {id: "market_leader_unlocked", name: "Market Leadership"},
    15: {id: "dominance_achieved", name: "Market Dominance"},
  };


export default function DashboardPage() {
  const router = useRouter();
  const {
    companyName, simulationMonth, financials, userMetrics, product, startupScore,
    keyEvents, isInitialized, currentAiReasoning, historicalRevenue, historicalUserGrowth,
    historicalBurnRate, historicalNetProfitLoss, historicalExpenseBreakdown, historicalCAC,
    historicalChurnRate, historicalProductProgress, advanceMonth, resetSimulation,
  } = useSimulationStore();

  const currencySymbol = financials.currencySymbol || "$";
  const [prevSimulationMonth, setPrevSimulationMonth] = useState<number | null>(null);
  const [unlockedStageForAnimation, setUnlockedStageForAnimation] = useState<string | null>(null);
  const [currentUnlockedStageName, setCurrentUnlockedStageName] = useState<string>("New Stage");


  useEffect(() => {
    if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
      router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  useEffect(() => {
    if (isInitialized && prevSimulationMonth !== null && simulationMonth > prevSimulationMonth) {
      let newlyUnlockedStage: {id: string, name: string} | null = null;
      // Iterate through sorted keys to find the highest threshold met
      const sortedThresholds = Object.keys(STAGE_UNLOCK_THRESHOLDS).map(Number).sort((a,b) => a-b);
      for (const threshold of sortedThresholds) {
        if (simulationMonth >= threshold && prevSimulationMonth < threshold) {
            newlyUnlockedStage = STAGE_UNLOCK_THRESHOLDS[threshold];
          // Do not break; allow to find the highest threshold met if multiple are crossed in one jump (unlikely but possible)
        }
      }

      if (newlyUnlockedStage) {
        setUnlockedStageForAnimation(newlyUnlockedStage.id);
        setCurrentUnlockedStageName(newlyUnlockedStage.name);
      }
    }
    if (isInitialized) {
      setPrevSimulationMonth(simulationMonth);
    }
  }, [simulationMonth, isInitialized, prevSimulationMonth]);

  const handleAnimationComplete = () => setUnlockedStageForAnimation(null);
  const handleAdvanceMonth = () => { if (isInitialized && financials.cashOnHand > 0) advanceMonth(); };
  const handleReset = () => { resetSimulation(); router.push('/app/setup'); };

  if (typeof simulationMonth === 'number' && simulationMonth === 0 && !isInitialized) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>Redirecting to setup...</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLowCash = isInitialized && financials.cashOnHand > 0 && financials.burnRate > 0 && financials.cashOnHand < (2 * financials.burnRate);
  const isGameOver = financials.cashOnHand <= 0 && isInitialized;
  const overallProgress = Math.min(100, (simulationMonth / MAX_SIMULATION_MONTHS) * 100);

  return (
    <>
      {unlockedStageForAnimation && isInitialized && (
        <StageUnlockAnimationOverlay
          stageId={unlockedStageForAnimation}
          stageName={currentUnlockedStageName}
          onComplete={handleAnimationComplete}
        />
      )}
      <div className={cn("container mx-auto py-8 px-4 md:px-0 space-y-8", unlockedStageForAnimation && "blur-md pointer-events-none")}>
        {!isInitialized && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Simulation Offline</AlertTitle>
            <AlertDescription>Initialize your Digital Twin via the Setup page. <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button></AlertDescription>
          </Alert>
        )}

        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-headline text-foreground">
              {isInitialized ? companyName : "ForgeSim"} Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Month: {isInitialized ? simulationMonth : "0"} / {MAX_SIMULATION_MONTHS} | Currency: {isInitialized ? financials.currencyCode : "N/A"}
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={handleAdvanceMonth}
              className="flex-1 md:flex-none bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
              disabled={!isInitialized || isGameOver || (currentAiReasoning || "").includes("simulating month...") || !!unlockedStageForAnimation}
            >
              {(currentAiReasoning || "").includes("simulating month...") ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronsRight className="mr-2 h-5 w-5"/>}
              {(currentAiReasoning || "").includes("simulating month...") ? "Simulating..." : "Simulate Next Month"}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" title="Reset Simulation" disabled={!!unlockedStageForAnimation}>
              <RefreshCcw className="h-5 w-5"/>
              <span className="ml-2 hidden sm:inline">Reset Sim</span>
            </Button>
          </div>
        </header>

        {isGameOver && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-6 w-6" />
            <AlertTitle className="text-xl font-bold">Game Over - Out of Cash!</AlertTitle>
            <AlertDescription className="text-base mt-1">
              Your startup has run out of cash ({currencySymbol}{financials.cashOnHand.toLocaleString()}).
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary"/> Overall Simulation Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-2.5" indicatorClassName="bg-primary"/>
            <p className="text-xs text-muted-foreground mt-1 text-right">{simulationMonth} of {MAX_SIMULATION_MONTHS} Months Simulated ({overallProgress.toFixed(0)}%)</p>
          </CardContent>
        </Card>


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cash on Hand</CardTitle>
                <PiggyBank className={cn("h-5 w-5", isLowCash && !isGameOver ? "text-yellow-400" : isGameOver ? "text-destructive" : "text-emerald-400")} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", isLowCash && !isGameOver ? "text-yellow-500" : isGameOver ? "text-destructive" : "text-foreground")}>{currencySymbol}{financials.cashOnHand.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Burn: {currencySymbol}{financials.burnRate.toLocaleString()}/mo {isLowCash && !isGameOver ? '(LOW!)' : ''}</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{currencySymbol}{financials.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">MRR: {currencySymbol}{userMetrics.monthlyRecurringRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{userMetrics.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">New: {userMetrics.newUserAcquisitionRate.toLocaleString()}/mo</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Startup Score</CardTitle>
                <BarChartBig className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{startupScore}/100</div>
                <p className="text-xs text-muted-foreground">{startupScore > 75 ? "Excellent!" : startupScore > 50 ? "Promising" : "Needs Work"}</p>
              </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/> AI Log</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[100px] bg-muted/50 p-3 rounded-md">
                {currentAiReasoning && currentAiReasoning.includes("simulating month...") ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> <p className="text-sm">{currentAiReasoning}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentAiReasoning || "AI log is idle."}</p>
                )}
              </CardContent>
            </Card>
             <Card className="lg:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> Key Events</CardTitle>
              </CardHeader>
              <CardContent className="bg-muted/50 p-3 rounded-md">
                {isInitialized && keyEvents.length > 0 ? (
                  <ScrollArea className="h-40">
                    <ul className="text-sm space-y-1.5 text-muted-foreground">
                      {keyEvents.slice().reverse().map((event: StructuredKeyEvent) => (
                        <li key={event.id} className="border-b border-border/30 pb-1.5 mb-1.5 last:border-b-0 last:pb-0 last:mb-0 flex gap-2 items-start">
                          {event.impact === "Positive" && <TrendingUp className="h-4 w-4 text-green-500 shrink-0 mt-0.5"/>}
                          {event.impact === "Negative" && <TrendingDown className="h-4 w-4 text-red-500 shrink-0 mt-0.5"/>}
                          {event.impact === "Neutral" && <Activity className="h-4 w-4 text-blue-500 shrink-0 mt-0.5"/>}
                          <span><span className="font-semibold text-foreground/80">M{event.month} [{event.category}]:</span> {event.description}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground h-40 flex items-center justify-center">{isInitialized ? "No key events logged yet." : "Initialize simulation to see events."}</p>
                )}
              </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <PerformanceChart title={`Revenue (${currencySymbol})`} description="Monthly revenue trends." dataKey="revenue" data={isInitialized ? historicalRevenue : []} />
            <PerformanceChart title="User Growth" description="Active user base evolution." dataKey="users" data={isInitialized ? historicalUserGrowth : []} />
        </div>
         <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <PerformanceChart title={`Burn Rate (${currencySymbol})`} description="Cash consumed monthly over revenue." dataKey="value" data={isInitialized ? historicalBurnRate : []} />
            <PerformanceChart title={`Net Profit/Loss (${currencySymbol})`} description="Monthly financial result." dataKey="value" data={isInitialized ? historicalNetProfitLoss : []} />
         </div>
         <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <PerformanceChart title={`CAC (${currencySymbol})`} description="Avg. cost per new user." dataKey="value" data={isInitialized ? historicalCAC : []} />
            <PerformanceChart title="Churn Rate (%)" description="Users lost per month." dataKey="value" data={isInitialized ? historicalChurnRate : []} />
            <PerformanceChart title={`${product.name} (${product.stage}) Dev. Progress`} description="Progress towards next product stage (0-100%)." dataKey="value" data={isInitialized ? historicalProductProgress : []} />
          </div>
          <div>
            <ExpenseBreakdownChart data={isInitialized ? historicalExpenseBreakdown : []} currencySymbol={currencySymbol} />
          </div>
      </div>
    </>
  );
}

    