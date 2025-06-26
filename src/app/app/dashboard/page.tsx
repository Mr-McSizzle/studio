
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, TrendingUp as TrendingUpIcon, BarChartBig, ChevronsRight, RefreshCcw, AlertTriangle, PiggyBank, Activity, Percent, Bot, ListChecks, Target, BrainCircuit, X, Briefcase } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { HexPuzzleBoard } from "@/components/dashboard/HexPuzzleBoard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ChallengeHex } from "@/components/dashboard/ChallengeHex";
import { StageUnlockAnimationOverlay } from "@/components/dashboard/StageUnlockAnimationOverlay";

const challenges = [
  {
    icon: TrendingUpIcon,
    title: "Market Growth",
    description: "Focus on acquiring new users and increasing your market share."
  },
  {
    icon: Target,
    title: "Financial Stability",
    description: "Manage burn rate and work towards profitability to ensure a long runway."
  },
  {
    icon: BrainCircuit,
    title: "Product Innovation",
    description: "Invest in R&D to advance your product to the next stage and unlock new features."
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const {
    isInitialized,
    simulationMonth,
    companyName,
    financials,
    userMetrics,
    startupScore,
    investorSentiment,
    missions,
    toggleMissionCompletion,
    advanceMonth,
    resetSimulation,
    historicalRevenue,
    historicalUserGrowth,
    historicalNetProfitLoss,
    historicalBurnRate,
    historicalCAC,
    historicalChurnRate,
    historicalProductProgress,
    historicalInvestorSentiment,
    historicalExpenseBreakdown,
    activeScenarios,
    removeScenario,
  } = useSimulationStore();
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
      router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  const areMissionsComplete = missions.length > 0 && missions.every(m => m.isCompleted);

  useEffect(() => {
    if (areMissionsComplete && !hasCelebrated) {
      setShowCompletionAnimation(true);
      setHasCelebrated(true);
    }
    // Reset celebration state if missions become incomplete (e.g. after advancing month)
    if (!areMissionsComplete && hasCelebrated) {
      setHasCelebrated(false);
    }
  }, [areMissionsComplete, hasCelebrated]);

  const handleAdvanceMonth = async () => {
    setIsSimulating(true);
    await advanceMonth();
    setIsSimulating(false);
  };

  const currencySymbol = financials?.currencySymbol || "$";
  const isGameOver = isInitialized && financials.cashOnHand <= 0;
  const isLowCash = isInitialized && financials.cashOnHand > 0 && financials.burnRate > 0 && financials.cashOnHand < (2 * financials.burnRate);

  if (!isInitialized) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Redirecting to the setup page to initialize your digital twin...
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <StageUnlockAnimationOverlay
        isOpen={showCompletionAnimation}
        title="Objectives Complete!"
        message="Excellent work, Founder! You've cleared all directives for this period."
        onComplete={() => setShowCompletionAnimation(false)}
      />
      <div className="container mx-auto py-8 px-4 md:px-0">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-headline text-foreground">{companyName} - Month {simulationMonth}</h1>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    onClick={handleAdvanceMonth}
                    disabled={isSimulating || !areMissionsComplete || isGameOver}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronsRight className="mr-2 h-4 w-4" />}
                    Simulate Next Month
                  </Button>
                </div>
              </TooltipTrigger>
              {!areMissionsComplete && isInitialized && !isGameOver && (
                <TooltipContent>
                  <p>Complete all monthly directives to proceed.</p>
                </TooltipContent>
              )}
            </Tooltip>
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
              Your startup has run out of cash. You can reset the simulation to try again with a new strategy.
            </AlertDescription>
          </Alert>
        )}
        
        {!areMissionsComplete && isInitialized && !isGameOver && (
          <Alert variant="default" className="mb-6 bg-secondary/30 border-secondary">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              You have pending objectives for this month. Complete them here or on the "Todo List" page before proceeding.
               <Button onClick={() => router.push('/app/todo')} className="mt-2 ml-2" size="sm" variant="outline">View Full Todo List</Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cash on Hand</CardTitle>
              <PiggyBank className={cn("h-5 w-5", isLowCash && !isGameOver ? "text-yellow-500" : isGameOver ? "text-destructive" : "text-emerald-500")} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", isLowCash && !isGameOver ? "text-yellow-500" : isGameOver ? "text-destructive" : "text-foreground")}>
                {currencySymbol}{financials.cashOnHand.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Burn Rate: {currencySymbol}{financials.burnRate.toLocaleString()}/mo</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
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
              <p className="text-xs text-muted-foreground">New this month: {userMetrics.newUserAcquisitionRate.toLocaleString()}</p>
            </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investor Sentiment</CardTitle>
              <Briefcase className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{investorSentiment}/100</div>
              <p className="text-xs text-muted-foreground">Confidence in future growth</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Startup Score</CardTitle>
              <BarChartBig className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{startupScore}/100</div>
              <p className="text-xs text-muted-foreground">Reflects overall health</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Current Strategic Focus</CardTitle>
              <CardDescription>Key areas of focus derived from your current simulation state.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-center gap-8 py-6">
              {challenges.map((challenge, index) => (
                <ChallengeHex
                  key={challenge.title}
                  icon={challenge.icon}
                  title={challenge.title}
                  description={challenge.description}
                  delay={index}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
                <PerformanceChart title="Monthly Revenue" description="Tracking revenue over the last 12 months." dataKey="revenue" data={historicalRevenue} />
                <PerformanceChart title="User Growth" description="Tracking total active user base over time." dataKey="users" data={historicalUserGrowth} />
                <PerformanceChart title={`Net Profit / Loss (${currencySymbol})`} description="Monthly net income (Revenue - Expenses)." dataKey="value" data={historicalNetProfitLoss} />
                <PerformanceChart title={`Monthly Burn Rate (${currencySymbol})`} description="Cash spent per month after revenue." dataKey="value" data={historicalBurnRate} />
                <ExpenseBreakdownChart data={historicalExpenseBreakdown} currencySymbol={currencySymbol} />
                <PerformanceChart title="Investor Sentiment" description="Tracking investor confidence over time." dataKey="value" data={historicalInvestorSentiment} />
                <PerformanceChart title={`Customer Acquisition Cost (CAC) (${currencySymbol})`} description="Average cost to acquire one new user." dataKey="value" data={historicalCAC} />
                <PerformanceChart title="Monthly Churn Rate (%)" description="Percentage of users lost each month." dataKey="value" data={historicalChurnRate} />
                <PerformanceChart title="Product Development Progress (%)" description="Progress towards the next product stage." dataKey="value" data={historicalProductProgress} />
            </div>

            <div className="lg:col-span-1 space-y-6">
                 <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                        Active Scenarios
                      </CardTitle>
                      <CardDescription>
                        These strategic scenarios are currently influencing your simulation's outcomes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {activeScenarios.length > 0 ? (
                        <ul className="space-y-2">
                          {activeScenarios.map(scenario => (
                            <li key={scenario} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                              <span className="text-sm font-medium">{scenario}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeScenario(scenario)}>
                                <X className="h-4 w-4 text-destructive"/>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">No active scenarios.</p>
                      )}
                    </CardContent>
                  </Card>
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Bot className="h-6 w-6 text-primary"/>EVE's Monthly Directives & Hive Puzzle</CardTitle>
                        <CardDescription>Complete objectives to assemble the Hive's progress puzzle.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ScrollArea className="h-48 pr-3">
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
                        <Separator />
                        <div className="flex items-center justify-center pt-2">
                           <HexPuzzleBoard missions={missions} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
