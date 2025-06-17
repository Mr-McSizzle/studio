
"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  DollarSign, Users, TrendingUp, TrendingDown, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, PiggyBank, Brain, Loader2, Activity, Map, Target, Shield, BookOpen, Server, Rocket, Megaphone, PackageCheck, Flag, CheckCircle, LockIcon, Eye, Aperture, Layers, Network, Gamepad2
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StructuredKeyEvent } from "@/types/simulation";
import { StageUnlockAnimationOverlay } from "@/components/dashboard/StageUnlockAnimationOverlay";

const MAX_SIMULATION_MONTHS = 24;

interface SimulationPhase {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  unlockMonth: number; // Month this phase becomes current
  totalMonthsInPhase: number; // Duration of this phase
  milestones: string[];
  themeColor: string; // e.g., 'text-green-400' or 'border-blue-500'
  glowColor: string; // e.g., 'shadow-green-500/50'
}

const simulationPhases: SimulationPhase[] = [
  { id: "genesis", title: "Genesis Forge", icon: Rocket, description: "Lay the foundation. Define your vision, secure initial resources, and prepare for launch.", unlockMonth: 0, totalMonthsInPhase: 3, milestones: ["Initial Setup Complete", "First User Acquired", "Product Prototype Ready"], themeColor: "text-sky-400", glowColor: "shadow-sky-500/60" },
  { id: "aegis_protocol", title: "Aegis Protocol", icon: Shield, description: "Navigate early risks. Stabilize operations, refine your product based on feedback, and build resilience.", unlockMonth: 3, totalMonthsInPhase: 4, milestones: ["Achieve MVP", "Secure Seed Funding", "Positive Cash Flow Month"], themeColor: "text-amber-400", glowColor: "shadow-amber-500/60" },
  { id: "vanguard_expansion", title: "Vanguard Expansion", icon: Megaphone, description: "Penetrate the market. Scale user acquisition, optimize marketing channels, and grow your team.", unlockMonth: 7, totalMonthsInPhase: 6, milestones: ["1,000 Active Users", "Key Partnership Formed", "International Sales"], themeColor: "text-emerald-400", glowColor: "shadow-emerald-500/60" },
  { id: "sovereign_dominion", title: "Sovereign Dominion", icon: Layers, description: "Establish market leadership. Innovate continuously, explore new ventures, and solidify your legacy.", unlockMonth: 13, totalMonthsInPhase: MAX_SIMULATION_MONTHS - 13, milestones: ["Market Leader Status", "Successful Product Diversification", "Acquisition Target"], themeColor: "text-purple-400", glowColor: "shadow-purple-500/60" },
];


const STAGE_UNLOCK_THRESHOLDS: Record<number, {id: string, name: string}> = {
    3: {id: "aegis_protocol_unlocked", name: "Aegis Protocol"},
    7: {id: "vanguard_expansion_unlocked", name: "Vanguard Expansion"},
    13: {id: "sovereign_dominion_unlocked", name: "Sovereign Dominion"},
  };

const PhaseCard = ({ phase, currentSimMonth }: { phase: SimulationPhase; currentSimMonth: number }) => {
  const isLocked = currentSimMonth < phase.unlockMonth;
  const isCompleted = currentSimMonth >= phase.unlockMonth + phase.totalMonthsInPhase;
  const isCurrent = !isLocked && !isCompleted;

  const currentMonthInPhase = isLocked ? 0 : Math.min(phase.totalMonthsInPhase, Math.max(0, currentSimMonth - phase.unlockMonth));
  const progressPercentage = phase.totalMonthsInPhase > 0 ? (currentMonthInPhase / phase.totalMonthsInPhase) * 100 : 0;

  let cardClasses = "hive-cell relative flex flex-col justify-between p-5 min-h-[280px] transition-all duration-300 ease-in-out transform hover:scale-105 ";
  let glowEffect = "";
  let IconComponent = phase.icon;

  if (isLocked) {
    cardClasses += "bg-card/30 border-border/50 opacity-60 backdrop-blur-sm cursor-not-allowed";
    IconComponent = LockIcon;
  } else if (isCurrent) {
    cardClasses += `bg-card/80 border-2 ${phase.themeColor.replace('text-', 'border-')} animate-pulse-glow-border`;
    glowEffect = `shadow-lg ${phase.glowColor}`;
  } else { // Completed
    cardClasses += "bg-card/60 border-green-500/70 opacity-80";
    IconComponent = CheckCircle;
  }

  return (
    <div className={cn(cardClasses, glowEffect)}>
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn("text-xl font-headline", isLocked ? "text-muted-foreground" : phase.themeColor)}>{phase.title}</h3>
          <IconComponent className={cn("h-7 w-7", isLocked ? "text-muted-foreground/70" : phase.themeColor)} />
        </div>
        <p className={cn("text-xs mb-4 leading-relaxed", isLocked ? "text-muted-foreground/80" : "text-muted-foreground")}>
          {isLocked ? "Unlock by advancing simulation." : phase.description}
        </p>
        {!isLocked && (
          <div className="mt-auto space-y-2">
            <div className="text-xs text-muted-foreground">Progress: {currentMonthInPhase} / {phase.totalMonthsInPhase} months</div>
            <Progress value={progressPercentage} className="h-1.5" indicatorClassName={isCurrent ? phase.themeColor.replace('text-', 'bg-') : 'bg-green-500'}/>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground/80 list-disc list-inside pl-1">
              {phase.milestones.slice(0,2).map(ms => <li key={ms}>{ms}</li>)}
              {phase.milestones.length > 2 && <li>And more...</li>}
            </ul>
          </div>
        )}
      </div>
      {isLocked && <div className="absolute inset-0 bg-black/20 rounded-md flex items-center justify-center"><LockIcon className="h-10 w-10 text-white/50"/></div>}
    </div>
  );
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
      const sortedThresholds = Object.keys(STAGE_UNLOCK_THRESHOLDS).map(Number).sort((a,b) => a-b);
      for (const threshold of sortedThresholds) {
        if (simulationMonth >= threshold && prevSimulationMonth < threshold) {
            newlyUnlockedStage = STAGE_UNLOCK_THRESHOLDS[threshold];
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

  const eveTooltipMessages = [
    "EVE: Monitoring all simulation parameters.",
    `EVE: Current focus on Month ${simulationMonth}. All systems nominal.`,
    "EVE: Strategic phase progression is as expected.",
    "EVE: Analyzing data streams for anomalies or opportunities...",
    "EVE: Your digital twin is evolving. Consider your next move."
  ];
  const [currentEveTooltip, setCurrentEveTooltip] = useState(eveTooltipMessages[0]);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEveTooltip(eveTooltipMessages[Math.floor(Math.random() * eveTooltipMessages.length)]);
    }, 15000); // Change EVE's tip every 15 seconds
    return () => clearInterval(interval);
  }, [eveTooltipMessages]);


  return (
    <TooltipProvider>
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

        {/* Central Intelligence Orb (EVE) */}
        <div className="flex flex-col items-center mb-6 -mt-4">
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <div className="relative animate-subtle-pulse-orb cursor-default">
                <Image
                  src="/new-assets/eve-avatar.png"
                  alt="EVE - AI Hive Mind Assistant"
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-accent/50 shadow-accent-glow-md filter drop-shadow-[0_0_12px_hsl(var(--accent)/0.6)]"
                  data-ai-hint="bee queen"
                />
                <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping-slow opacity-50"></div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-popover text-popover-foreground shadow-xl border-accent/50">
              <p className="text-xs max-w-xs">{currentEveTooltip}</p>
            </TooltipContent>
          </Tooltip>
           <h1 className="text-3xl font-headline text-foreground mt-3">
             {isInitialized ? companyName : "ForgeSim"} Command Center
           </h1>
        </div>
        
        {/* Overall Timeline Progress */}
        <Card className="shadow-lg border-primary/30">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="font-headline text-md flex items-center justify-between gap-2 text-primary/90">
              <span>Overall Simulation Timeline</span>
              <span className="text-sm font-normal text-muted-foreground">Month: {isInitialized ? simulationMonth : "0"} / {MAX_SIMULATION_MONTHS}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <Progress value={overallProgress} className="h-2" indicatorClassName="bg-gradient-to-r from-primary via-accent to-primary"/>
          </CardContent>
        </Card>


        {isGameOver && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-6 w-6" />
            <AlertTitle className="text-xl font-bold">Game Over - Out of Cash!</AlertTitle>
            <AlertDescription className="text-base mt-1">
              Your startup has run out of cash ({currencySymbol}{financials.cashOnHand.toLocaleString()}).
            </AlertDescription>
          </Alert>
        )}
        
        {/* Simulation Phase Modules */}
        <section>
          <h2 className="text-2xl font-headline text-foreground mb-4 flex items-center gap-2"><Gamepad2 className="h-7 w-7 text-accent"/>Simulation Phases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {simulationPhases.map(phase => (
              <PhaseCard key={phase.id} phase={phase} currentSimMonth={simulationMonth} />
            ))}
          </div>
        </section>


        {/* Core Operations Dashboard Section */}
        <section>
          <h2 className="text-2xl font-headline text-foreground mb-4 mt-10 flex items-center gap-2"><Network className="h-7 w-7 text-accent"/>Vital Systems Readout</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-lg card-glow-hover-accent border-transparent hover:border-accent/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cash on Hand</CardTitle>
                  <PiggyBank className={cn("h-5 w-5", isLowCash && !isGameOver ? "text-yellow-400" : isGameOver ? "text-destructive" : "text-emerald-400")} />
                </CardHeader>
                <CardContent>
                  <div className={cn("text-2xl font-bold", isLowCash && !isGameOver ? "text-yellow-500" : isGameOver ? "text-destructive" : "text-foreground")}>{currencySymbol}{financials.cashOnHand.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Burn: {currencySymbol}{financials.burnRate.toLocaleString()}/mo {isLowCash && !isGameOver ? '(LOW!)' : ''}</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg card-glow-hover-accent border-transparent hover:border-accent/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{currencySymbol}{financials.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">MRR: {currencySymbol}{userMetrics.monthlyRecurringRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg card-glow-hover-accent border-transparent hover:border-accent/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{userMetrics.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">New: {userMetrics.newUserAcquisitionRate.toLocaleString()}/mo</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg card-glow-hover-accent border-transparent hover:border-accent/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Startup Acumen</CardTitle>
                  <Aperture className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{startupScore}/100</div>
                  <p className="text-xs text-muted-foreground">{startupScore > 75 ? "Excellent!" : startupScore > 50 ? "Promising" : "Needs Work"}</p>
                </CardContent>
              </Card>
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-grow md:w-1/3 space-y-6">
             <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/> Hive Mind Log</CardTitle>
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
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> Event Chronicle</CardTitle>
                </CardHeader>
                <CardContent className="bg-muted/50 p-3 rounded-md">
                  {isInitialized && keyEvents.length > 0 ? (
                    <ScrollArea className="h-48">
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
            <div className="flex-grow md:w-2/3 space-y-6">
                <PerformanceChart title={`Revenue (${currencySymbol})`} description="Monthly revenue trends." dataKey="revenue" data={isInitialized ? historicalRevenue : []} />
                <PerformanceChart title="User Growth" description="Active user base evolution." dataKey="users" data={isInitialized ? historicalUserGrowth : []} />
            </div>
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
          
          <div className="mt-10 flex gap-4 justify-center md:justify-end">
            <Button
              onClick={handleAdvanceMonth}
              className="flex-1 md:flex-none bg-gradient-to-r from-accent to-yellow-500 hover:from-accent/90 hover:to-yellow-500/90 text-accent-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              size="lg"
              disabled={!isInitialized || isGameOver || (currentAiReasoning || "").includes("simulating month...") || !!unlockedStageForAnimation}
            >
              {(currentAiReasoning || "").includes("simulating month...") ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronsRight className="mr-2 h-5 w-5"/>}
              {(currentAiReasoning || "").includes("simulating month...") ? "Simulating Next Month..." : "Forge Next Month"}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" title="Reset Simulation" disabled={!!unlockedStageForAnimation} className="border-primary/70 text-primary/90 hover:bg-primary/10 hover:text-primary">
              <RefreshCcw className="h-5 w-5"/>
              <span className="ml-2 hidden sm:inline">Reset Simulation</span>
            </Button>
          </div>

      </div>
    </TooltipProvider>
  );
}
