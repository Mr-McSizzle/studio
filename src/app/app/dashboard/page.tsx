
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
  DollarSign, Users, TrendingUp, TrendingDown, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, PiggyBank, Brain, Loader2, Activity, Map, Target, Shield, BookOpen, Server, Rocket, Megaphone, PackageCheck, Flag, CheckCircle, LockIcon, Eye, Aperture, Layers, Network, Gamepad2, Star // Added Star
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
  unlockMonth: number; 
  totalMonthsInPhase: number; 
  milestones: string[];
  themeColor: string; 
  ringColor: string; // e.g. ring-sky-500
  shadowColor: string; // e.g. shadow-sky-500/60
  bgColor: string; // e.g. bg-sky-500/10
}

const simulationPhases: SimulationPhase[] = [
  { id: "genesis", title: "Genesis Forge", icon: Rocket, description: "Lay the foundation. Define vision, secure resources, prepare for launch.", unlockMonth: 0, totalMonthsInPhase: 3, milestones: ["Initial Setup", "First User", "Prototype Ready"], themeColor: "text-sky-400", ringColor: "ring-sky-500", shadowColor: "shadow-sky-500/50", bgColor: "bg-sky-900/30" },
  { id: "aegis_protocol", title: "Aegis Protocol", icon: Shield, description: "Navigate early risks. Stabilize operations, refine product, build resilience.", unlockMonth: 3, totalMonthsInPhase: 4, milestones: ["Achieve MVP", "Seed Funding", "Positive Cash Flow"], themeColor: "text-amber-400", ringColor: "ring-amber-500", shadowColor: "shadow-amber-500/50", bgColor: "bg-amber-900/30" },
  { id: "vanguard_expansion", title: "Vanguard Expansion", icon: Megaphone, description: "Penetrate market. Scale user acquisition, optimize channels, grow team.", unlockMonth: 7, totalMonthsInPhase: 6, milestones: ["1k Active Users", "Key Partnership", "International Sales"], themeColor: "text-emerald-400", ringColor: "ring-emerald-500", shadowColor: "shadow-emerald-500/50", bgColor: "bg-emerald-900/30" },
  { id: "sovereign_dominion", title: "Sovereign Dominion", icon: Layers, description: "Establish leadership. Innovate, explore new ventures, solidify legacy.", unlockMonth: 13, totalMonthsInPhase: MAX_SIMULATION_MONTHS - 13, milestones: ["Market Leader", "Product Diversification", "Acquisition Target"], themeColor: "text-purple-400", ringColor: "ring-purple-500", shadowColor: "shadow-purple-500/50", bgColor: "bg-purple-900/30" },
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
  const progressPercentage = phase.totalMonthsInPhase > 0 ? (currentMonthInPhase / phase.totalMonthsInPhase) * 100 : (isCompleted ? 100 : 0);

  let cardClasses = "hive-cell relative flex flex-col justify-between p-4 min-h-[260px] transition-all duration-300 ease-in-out transform hover:scale-[1.03] border-2 "; // Reduced min-h slightly
  let glowEffect = "";
  let IconComponent = phase.icon;

  if (isLocked) {
    cardClasses += "bg-card/20 border-border/30 opacity-60 backdrop-blur-sm cursor-not-allowed";
    IconComponent = LockIcon;
  } else if (isCurrent) {
    cardClasses += `${phase.bgColor} ${phase.ringColor.replace('ring-','border-')} animate-pulse-glow-border-alt`;
    glowEffect = `shadow-lg ${phase.shadowColor}`;
  } else { // Completed
    cardClasses += "bg-card/50 border-green-600/50 opacity-80";
    IconComponent = CheckCircle;
  }

  return (
    <div className={cn(cardClasses, glowEffect)} style={{'--glow-color': `hsl(var(--${phase.ringColor.split('-')[1]}))`, '--border-color': `hsl(var(--${phase.ringColor.split('-')[1]}))`, '--border-color-active': `hsl(var(--${phase.ringColor.split('-')[1]}))` } as React.CSSProperties}>
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn("text-lg font-headline leading-tight", isLocked ? "text-muted-foreground/90" : phase.themeColor)}>{phase.title}</h3>
          <IconComponent className={cn("h-6 w-6", isLocked ? "text-muted-foreground/70" : phase.themeColor)} />
        </div>
        <p className={cn("text-xs mb-3 leading-snug", isLocked ? "text-muted-foreground/70" : "text-muted-foreground")}>
          {isLocked ? `Unlocks at Month ${phase.unlockMonth}` : phase.description}
        </p>
        {!isLocked && (
          <div className="mt-auto space-y-1.5">
            <div className="text-xs text-muted-foreground/80">Progress: {currentMonthInPhase} / {phase.totalMonthsInPhase} months</div>
            <Progress value={progressPercentage} className="h-1" indicatorClassName={isCurrent ? phase.themeColor.replace('text-', 'bg-') : 'bg-green-500'}/>
            <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground/70 list-disc list-inside pl-1">
              {phase.milestones.slice(0,2).map(ms => <li key={ms} className="truncate">{ms}</li>)}
            </ul>
          </div>
        )}
      </div>
      {isLocked && <div className="absolute inset-0 bg-black/30 rounded-md flex items-center justify-center"><LockIcon className="h-8 w-8 text-white/60"/></div>}
    </div>
  );
};

const ScoreDisplay = ({ score, maxScore = 100 }: { score: number, maxScore?: number }) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  let progressIndicatorClass = "bg-primary";
  if (percentage > 75) progressIndicatorClass = "bg-green-500";
  else if (percentage > 40) progressIndicatorClass = "bg-yellow-500";
  else if (score > 0) progressIndicatorClass = "bg-red-500";

  return (
    <Card className="shadow-md bg-card/70 backdrop-blur-sm border-transparent">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Founder Acumen</CardTitle>
        <Star className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent className="pb-3 px-4">
        <div className="text-2xl font-bold text-foreground">{score} <span className="text-sm text-muted-foreground">/ {maxScore}</span></div>
        <Progress value={percentage} className="mt-1 h-1.5" indicatorClassName={progressIndicatorClass} />
      </CardContent>
    </Card>
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
    }, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationMonth]);


  return (
    <TooltipProvider>
      {unlockedStageForAnimation && isInitialized && (
        <StageUnlockAnimationOverlay
          stageId={unlockedStageForAnimation}
          stageName={currentUnlockedStageName}
          onComplete={handleAnimationComplete}
        />
      )}
      <div className={cn("container mx-auto py-8 px-4 md:px-0 space-y-6", unlockedStageForAnimation && "blur-md pointer-events-none")}>
        {!isInitialized && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Simulation Offline</AlertTitle>
            <AlertDescription>Initialize your Digital Twin via the Setup page. <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button></AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="relative animate-subtle-pulse-orb cursor-default">
                    <Image
                      src="/new-assets/eve-avatar.png"
                      alt="EVE - AI Hive Mind Assistant"
                      width={64} // Slightly smaller
                      height={64}
                      className="rounded-full border-2 border-accent/60 shadow-accent-glow-md filter drop-shadow-[0_0_10px_hsl(var(--accent)/0.5)]"
                      data-ai-hint="bee queen"
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping-slow opacity-40"></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-popover text-popover-foreground shadow-xl border-accent/50">
                  <p className="text-xs max-w-xs">{currentEveTooltip}</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <h1 className="text-2xl sm:text-3xl font-headline text-foreground">
                  {isInitialized ? companyName : "ForgeSim"} Command Center
                </h1>
                <p className="text-sm text-muted-foreground">Month: {isInitialized ? simulationMonth : "0"} / {MAX_SIMULATION_MONTHS}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mt-3 md:mt-0">
                <ScoreDisplay score={isInitialized ? startupScore : 0} />
                <Button
                    onClick={handleAdvanceMonth}
                    className="bg-gradient-to-r from-accent to-yellow-500 hover:from-accent/90 hover:to-yellow-500/90 text-accent-foreground shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    size="default"
                    disabled={!isInitialized || isGameOver || (currentAiReasoning || "").includes("simulating month...") || !!unlockedStageForAnimation}
                    title="Simulate Next Month"
                >
                    {(currentAiReasoning || "").includes("simulating month...") ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ChevronsRight className="mr-1.5 h-4 w-4"/>}
                    Next Month
                </Button>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleReset} variant="outline" size="icon" title="Reset Simulation" disabled={!!unlockedStageForAnimation} className="border-primary/50 text-primary/80 hover:bg-primary/10 hover:text-primary">
                            <RefreshCcw className="h-4 w-4"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Reset Simulation</p></TooltipContent>
                </Tooltip>
            </div>
        </div>
        
        <Card className="shadow-md border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-3 pb-2 px-3">
            <Progress value={overallProgress} className="h-1.5 rounded-sm" indicatorClassName="bg-gradient-to-r from-primary via-accent to-primary/70 shadow-md shadow-primary/30"/>
             <p className="text-xs text-muted-foreground text-center mt-1">Overall Timeline Progress</p>
          </CardContent>
        </Card>


        {isGameOver && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-6 w-6" />
            <AlertTitle className="text-xl font-bold">Game Over - Out of Cash!</AlertTitle>
            <AlertDescription className="text-base mt-1">
              Your startup has run out of cash ({currencySymbol}{financials.cashOnHand.toLocaleString()}). Consider resetting.
            </AlertDescription>
          </Alert>
        )}
        
        <section>
          <h2 className="text-xl font-headline text-foreground mb-3 flex items-center gap-2"><Gamepad2 className="h-6 w-6 text-accent"/>Simulation Phases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Reduced gap slightly */}
            {simulationPhases.map(phase => (
              <PhaseCard key={phase.id} phase={phase} currentSimMonth={simulationMonth} />
            ))}
          </div>
        </section>


        <section>
          <h2 className="text-xl font-headline text-foreground mb-3 mt-6 flex items-center gap-2"><Network className="h-6 w-6 text-accent"/>Vital Systems Readout</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-md card-glow-hover-accent border-transparent hover:border-accent/60 bg-card/70 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cash on Hand</CardTitle>
                  <PiggyBank className={cn("h-4 w-4", isLowCash && !isGameOver ? "text-yellow-400" : isGameOver ? "text-destructive" : "text-emerald-400")} />
                </CardHeader>
                <CardContent className="pb-3 px-4">
                  <div className={cn("text-xl font-bold", isLowCash && !isGameOver ? "text-yellow-500" : isGameOver ? "text-destructive" : "text-foreground")}>{currencySymbol}{financials.cashOnHand.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Burn: {currencySymbol}{financials.burnRate.toLocaleString()}/mo {isLowCash && !isGameOver ? '(LOW!)' : ''}</p>
                </CardContent>
              </Card>
              <Card className="shadow-md card-glow-hover-accent border-transparent hover:border-accent/60 bg-card/70 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent className="pb-3 px-4">
                  <div className="text-xl font-bold text-foreground">{currencySymbol}{financials.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">MRR: {currencySymbol}{userMetrics.monthlyRecurringRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="shadow-md card-glow-hover-accent border-transparent hover:border-accent/60 bg-card/70 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="pb-3 px-4">
                  <div className="text-xl font-bold text-foreground">{userMetrics.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">New: {userMetrics.newUserAcquisitionRate.toLocaleString()}/mo</p>
                </CardContent>
              </Card>
              <Card className="shadow-md card-glow-hover-accent border-transparent hover:border-accent/60 bg-card/70 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Product: {product.name}</CardTitle>
                  <Aperture className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent className="pb-3 px-4">
                  <div className="text-xl font-bold text-foreground">{product.stage}</div>
                  <p className="text-xs text-muted-foreground">Dev Progress: {product.developmentProgress}%</p>
                </CardContent>
              </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 space-y-6">
             <Card className="shadow-md bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-primary"/> Hive Mind Log</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[80px] bg-muted/40 p-3 rounded-b-md mx-1 mb-1">
                  {currentAiReasoning && currentAiReasoning.includes("simulating month...") ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" /> <p className="text-xs">{currentAiReasoning}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{currentAiReasoning || "AI log is idle."}</p>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-md bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary"/> Event Chronicle</CardTitle>
                </CardHeader>
                <CardContent className="bg-muted/40 p-0 rounded-b-md mx-1 mb-1">
                  {isInitialized && keyEvents.length > 0 ? (
                    <ScrollArea className="h-40">
                      <ul className="text-xs space-y-1 p-3">
                        {keyEvents.slice().reverse().map((event: StructuredKeyEvent) => (
                          <li key={event.id} className="border-b border-border/20 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0 flex gap-1.5 items-start">
                            {event.impact === "Positive" && <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5"/>}
                            {event.impact === "Negative" && <TrendingDown className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5"/>}
                            {event.impact === "Neutral" && <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5"/>}
                            <span className="text-muted-foreground leading-snug"><span className="font-semibold text-foreground/80">M{event.month} [{event.category}]:</span> {event.description}</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  ) : (
                    <p className="text-xs text-muted-foreground h-40 flex items-center justify-center">{isInitialized ? "No key events logged." : "Init sim for events."}</p>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
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
          
      </div>
    </TooltipProvider>
  );
}
