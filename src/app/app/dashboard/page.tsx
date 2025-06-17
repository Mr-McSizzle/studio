
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
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
  DollarSign, Users, TrendingUp, TrendingDown, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, PiggyBank, Brain, Loader2, Activity, Map, Target, Shield, BookOpen, Server, Rocket, Megaphone, PackageCheck, Flag, CheckCircle, LockIcon, Eye, Aperture, Layers, Network, Gamepad2, Star, Settings2, Info
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
  ringColor: string;
  shadowColor: string;
  bgColor: string;
  glowColorVar: string; 
}

const simulationPhases: SimulationPhase[] = [
  { id: "genesis", title: "Genesis Forge", icon: Rocket, description: "Foundation & Vision. Secure resources, define your core offering, and prepare for initial market entry.", unlockMonth: 0, totalMonthsInPhase: 3, milestones: ["Initial Setup Complete", "First User Acquired", "Prototype Ready"], themeColor: "text-sky-400", ringColor: "border-sky-500", shadowColor: "shadow-sky-500/60", bgColor: "bg-sky-900/30", glowColorVar: "--sky" },
  { id: "aegis_protocol", title: "Aegis Protocol", icon: Shield, description: "Risk Navigation. Stabilize operations, refine your product-market fit, and build resilience.", unlockMonth: 3, totalMonthsInPhase: 4, milestones: ["Achieve MVP Status", "Secure Seed Funding", "Reach Positive Cash Flow"], themeColor: "text-amber-400", ringColor: "border-amber-500", shadowColor: "shadow-amber-500/60", bgColor: "bg-amber-900/30", glowColorVar: "--amber" },
  { id: "vanguard_expansion", title: "Vanguard Expansion", icon: Megaphone, description: "Market Penetration. Scale user acquisition, optimize channels, and expand your team.", unlockMonth: 7, totalMonthsInPhase: 6, milestones: ["1,000 Active Users", "Key Strategic Partnership", "First International Sale"], themeColor: "text-emerald-400", ringColor: "border-emerald-500", shadowColor: "shadow-emerald-500/60", bgColor: "bg-emerald-900/30", glowColorVar: "--emerald" },
  { id: "sovereign_dominion", title: "Sovereign Dominion", icon: Layers, description: "Market Leadership. Innovate new offerings, explore new ventures, and solidify your industry legacy.", unlockMonth: 13, totalMonthsInPhase: MAX_SIMULATION_MONTHS - 13, milestones: ["Become Market Leader", "Product Line Diversification", "Profitable Acquisition Target"], themeColor: "text-purple-400", ringColor: "border-purple-500", shadowColor: "shadow-purple-500/60", bgColor: "bg-purple-900/30", glowColorVar: "--purple" },
];

const STAGE_UNLOCK_THRESHOLDS: Record<number, {id: string, name: string}> = {
    3: {id: "aegis_protocol_unlocked", name: "Aegis Protocol"},
    7: {id: "vanguard_expansion_unlocked", name: "Vanguard Expansion"},
    13: {id: "sovereign_dominion_unlocked", name: "Sovereign Dominion"},
};

const PhaseCard = ({ phase, currentSimMonth }: { phase: SimulationPhase; currentSimMonth: number }) => {
  const isLocked = currentSimMonth < phase.unlockMonth;
  const isCompleted = currentSimMonth >= phase.unlockMonth + phase.totalMonthsInPhase;
  const isActive = !isLocked && !isCompleted;

  const currentMonthInPhase = isLocked ? 0 : Math.min(phase.totalMonthsInPhase, Math.max(0, currentSimMonth - phase.unlockMonth));
  const progressPercentage = phase.totalMonthsInPhase > 0 ? (currentMonthInPhase / phase.totalMonthsInPhase) * 100 : (isCompleted ? 100 : 0);

  let cardClasses = "hive-cell relative flex flex-col justify-between p-4 min-h-[280px] transition-all duration-300 ease-in-out transform group ";
  let IconComponent = phase.icon;

  cardClasses += " hover:shadow-2xl hover:-translate-y-1 hover:rotate-y-2 hover:rotate-x-1";

  if (isLocked) {
    cardClasses += "bg-card/20 backdrop-blur-xs opacity-60 cursor-not-allowed shadow-inner-soft-dim border-border/30";
    IconComponent = LockIcon;
  } else if (isActive) {
    cardClasses += `${phase.bgColor} ${phase.ringColor} shadow-lg ${phase.shadowColor} animate-pulse-glow-border-alt`;
  } else { 
    cardClasses += "bg-card/50 border-green-600/50 opacity-80 shadow-md";
    IconComponent = CheckCircle;
  }

  return (
    <div
      className={cn(cardClasses, "perspective-1000")}
      style={{
        '--glow-color': `hsl(var(${phase.glowColorVar}))`,
        '--border-color': `hsl(var(${phase.glowColorVar}) / 0.7)`,
        '--border-color-active': `hsl(var(${phase.glowColorVar}))`
      } as React.CSSProperties}
    >
      <div className="transform-style-preserve-3d group-hover:rotate-y-2 group-hover:rotate-x-1 transition-transform duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn("text-lg font-headline leading-tight tracking-tight", isLocked ? "text-muted-foreground/80" : phase.themeColor)}>{phase.title}</h3>
          <IconComponent className={cn("h-7 w-7", isLocked ? "text-muted-foreground/60" : phase.themeColor)} />
        </div>
        <p className={cn("text-xs mb-3 leading-snug min-h-[3em]", isLocked ? "text-muted-foreground/60" : "text-muted-foreground")}>
          {isLocked ? `Unlocks at Month ${phase.unlockMonth}. Hints: ${phase.milestones[0]}, ${phase.milestones[1]}...` : phase.description}
        </p>
        {!isLocked && (
          <div className="mt-auto space-y-2">
            <div className="text-xs text-muted-foreground/80">Progress: {currentMonthInPhase} / {phase.totalMonthsInPhase} months</div>
            <Progress value={progressPercentage} className="h-1.5" indicatorClassName={cn(isActive ? phase.themeColor.replace('text-', 'bg-') : 'bg-green-500', 'shadow-md')} />
            <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground/70 list-disc list-inside pl-1">
              {phase.milestones.slice(0, 2).map(ms => <li key={ms} className="truncate">{ms}</li>)}
            </ul>
          </div>
        )}
      </div>
      {isLocked && <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-md flex items-center justify-center"><LockIcon className="h-10 w-10 text-white/50"/></div>}
      {!isLocked && <div className="absolute inset-0 overflow-hidden rounded-md"><div className="shimmer-effect"></div></div>}
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
        <Star className="h-4 w-4 text-accent animate-subtle-pulse" />
      </CardHeader>
      <CardContent className="pb-3 px-4">
        <div className="text-2xl font-bold text-foreground">{score} <span className="text-sm text-muted-foreground">/ {maxScore}</span></div>
        <Progress value={percentage} className="mt-1 h-1.5 rounded-sm" indicatorClassName={cn(progressIndicatorClass, "shadow-sm")} />
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
  const [eveTooltipMessage, setEveTooltipMessage] = useState("EVE: Monitoring all simulation parameters.");
  const [isSimulating, setIsSimulating] = useState(false);

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
  
  const handleAdvanceMonth = async () => { 
    if (isInitialized && financials.cashOnHand > 0 && !isSimulating) {
      setIsSimulating(true);
      await advanceMonth(); 
      setIsSimulating(false);
    }
  };
  const handleReset = () => { resetSimulation(); router.push('/app/setup'); };

  useEffect(() => {
    const messages = [
      `EVE: Currently in month ${simulationMonth}. Financials: ${currencySymbol}${financials.cashOnHand.toLocaleString()} cash.`,
      `EVE: User base at ${userMetrics.activeUsers.toLocaleString()}. Product '${product.name}' is at ${product.stage} stage.`,
      "EVE: Strategic projections updated. Analyzing next optimal move.",
      "EVE: All systems nominal. Ready for your command.",
      `EVE: Monitoring market conditions for '${market.targetMarketDescription}'. Competition: ${market.competitionLevel}.`
    ];
    if (financials.cashOnHand < financials.burnRate * 2 && financials.cashOnHand > 0) {
      messages.push("EVE: Warning: Cash reserves approaching critical threshold. Recommend strategic review.");
    }
    if (product.developmentProgress > 85 && product.stage !== 'mature') {
      messages.push(`EVE: Product '${product.name}' is ${product.developmentProgress}% complete. Next stage nearing.`);
    }
    const interval = setInterval(() => {
      setEveTooltipMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 10000); 
    return () => clearInterval(interval);
  }, [simulationMonth, financials, userMetrics, product, market, currencySymbol]);


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
    <TooltipProvider>
      {unlockedStageForAnimation && isInitialized && (
        <StageUnlockAnimationOverlay
          stageId={unlockedStageForAnimation}
          stageName={currentUnlockedStageName}
          onComplete={handleAnimationComplete}
        />
      )}
      <div className={cn("dashboard-hub-container relative container mx-auto py-8 px-4 md:px-0 space-y-6 overflow-hidden", unlockedStageForAnimation && "blur-md pointer-events-none")}>
        
        <div className="absolute inset-0 z-[-1] opacity-30 overflow-hidden">
          <div className="neural-grid-bg"></div>
          {Array.from({length: 5}).map((_, i) => (
             <div key={`orbit-line-${i}`} className="orbit-line" style={{ '--orbit-delay': `${i*2}s`, '--orbit-duration': `${10+i*3}s`, '--orbit-size': `${200+i*100}px` } as React.CSSProperties}></div>
          ))}
        </div>

        {!isInitialized && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Simulation Offline</AlertTitle>
            <AlertDescription>Initialize your Digital Twin via the Setup page. <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button></AlertDescription>
          </Alert>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="relative animate-float-pulse cursor-default">
                    <Image
                      src="/new-assets/eve-avatar.png"
                      alt="EVE - AI Hive Mind Assistant"
                      width={72} 
                      height={72}
                      className="rounded-full border-2 border-accent/70 shadow-accent-glow-md filter drop-shadow-[0_0_15px_hsl(var(--accent)/0.6)]"
                      data-ai-hint="bee queen"
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping-slow opacity-50"></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-popover text-popover-foreground shadow-xl border-accent/50 max-w-xs">
                  <p className="text-xs font-medium">{eveTooltipMessage}</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <h1 className="text-2xl sm:text-3xl font-headline text-foreground text-glow-primary">
                  {isInitialized ? companyName : "ForgeSim"} Hive Command
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Overall Progress: Month {isInitialized ? simulationMonth : "0"} / {MAX_SIMULATION_MONTHS}</p>
                <Progress value={overallProgress} className="mt-1.5 h-2 rounded-sm glow-progress-bar" indicatorClassName="bg-gradient-to-r from-primary via-accent to-primary/70 shadow-sm shadow-primary/40"/>
              </div>
            </div>
             <div className="flex items-center gap-2 sm:gap-3 mt-4 md:mt-0">
                <ScoreDisplay score={isInitialized ? startupScore : 0} />
                <Button
                    onClick={handleAdvanceMonth}
                    className={cn(
                        "bg-gradient-to-r from-accent to-yellow-500 hover:from-accent/90 hover:to-yellow-500/90 text-accent-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
                        "active:scale-95 active:shadow-inner-soft-gold", 
                        isSimulating && "animate-subtle-button-pulse"
                    )}
                    size="default"
                    disabled={!isInitialized || isGameOver || isSimulating || !!unlockedStageForAnimation}
                    title="Simulate Next Month"
                >
                    {isSimulating || (currentAiReasoning || "").includes("simulating month...") ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ChevronsRight className="mr-1.5 h-4 w-4"/>}
                    Next Month
                </Button>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleReset} variant="outline" size="icon" title="Reset Simulation" disabled={!!unlockedStageForAnimation} className="border-primary/50 text-primary/80 hover:bg-primary/10 hover:text-primary shadow-sm hover:shadow-md active:scale-95">
                            <RefreshCcw className="h-4 w-4"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Reset Simulation</p></TooltipContent>
                </Tooltip>
            </div>
        </div>

        {isGameOver && (
          <Alert variant="destructive" className="mb-6 shadow-lg">
            <AlertTriangle className="h-6 w-6" />
            <AlertTitle className="text-xl font-bold">Critical Alert: Funding Depleted!</AlertTitle>
            <AlertDescription className="text-base mt-1">
              The startup has exhausted its cash reserves ({currencySymbol}{financials.cashOnHand.toLocaleString()}). Strategic reset required.
            </AlertDescription>
          </Alert>
        )}

        <section className="relative z-10">
          <h2 className="text-xl font-headline text-foreground mb-4 flex items-center gap-2"><Settings2 className="h-6 w-6 text-accent"/>Phase Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"> 
            {simulationPhases.map(phase => (
              <PhaseCard key={phase.id} phase={phase} currentSimMonth={simulationMonth} />
            ))}
          </div>
        </section>

        <section className="relative z-10">
          <h2 className="text-xl font-headline text-foreground mb-3 mt-6 flex items-center gap-2"><Network className="h-6 w-6 text-accent"/>Vital Systems Readout</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-md card-glow-hover-accent border-transparent hover:border-accent/60 bg-card/70 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Treasury</CardTitle>
                  <PiggyBank className={cn("h-4 w-4", isLowCash && !isGameOver ? "text-yellow-400 animate-pulse" : isGameOver ? "text-destructive" : "text-emerald-400")} />
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">Project: {product.name}</CardTitle>
                  <Aperture className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent className="pb-3 px-4">
                  <div className="text-xl font-bold text-foreground">{product.stage}</div>
                  <p className="text-xs text-muted-foreground">Dev Progress: {product.developmentProgress}%</p>
                </CardContent>
              </Card>
          </div>
        </section>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 space-y-6">
             <Card className="shadow-md bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 glowing-title-underline"><Brain className="h-4 w-4 text-primary"/> Hive Mind Comms</CardTitle>
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
                  <CardTitle className="text-base font-semibold flex items-center gap-2 glowing-title-underline"><BookOpen className="h-4 w-4 text-primary"/> Event Chronicle</CardTitle>
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
                <Card className="shadow-md card-glow-hover-accent bg-card/70 backdrop-blur-sm border-transparent">
                  <CardHeader>
                    <CardTitle className="font-headline glowing-title-underline">Revenue ({currencySymbol})</CardTitle>
                    <CardDescription>Monthly revenue trends.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart dataKey="revenue" data={isInitialized ? historicalRevenue : []} />
                  </CardContent>
                </Card>
                <Card className="shadow-md card-glow-hover-accent bg-card/70 backdrop-blur-sm border-transparent">
                  <CardHeader>
                    <CardTitle className="font-headline glowing-title-underline">User Growth</CardTitle>
                    <CardDescription>Active user base evolution.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart dataKey="users" data={isInitialized ? historicalUserGrowth : []} />
                  </CardContent>
                </Card>
            </div>
        </div>

        <div className="relative z-10 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="shadow-md card-glow-hover-accent bg-card/70 backdrop-blur-sm border-transparent">
                <CardHeader>
                    <CardTitle className="font-headline glowing-title-underline">Burn Rate ({currencySymbol})</CardTitle>
                    <CardDescription>Cash consumed monthly over revenue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceChart dataKey="value" data={isInitialized ? historicalBurnRate : []} />
                </CardContent>
            </Card>
             <Card className="shadow-md card-glow-hover-accent bg-card/70 backdrop-blur-sm border-transparent">
                <CardHeader>
                    <CardTitle className="font-headline glowing-title-underline">Net Profit/Loss ({currencySymbol})</CardTitle>
                    <CardDescription>Monthly financial result.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceChart dataKey="value" data={isInitialized ? historicalNetProfitLoss : []} />
                </CardContent>
            </Card>
         </div>
         <div className="relative z-10 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <Card className="shadow-md card-glow-hover-accent bg-card/70 backdrop-blur-sm border-transparent">
                <CardHeader>
                    <CardTitle className="font-headline glowing-title-underline">CAC ({currencySymbol})</CardTitle>
                    <CardDescription>Avg. cost per new user.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceChart dataKey="value" data={isInitialized ? historicalCAC : []} />
                </CardContent>
            </Card>
             <Card className="shadow-md card-glow-hover-accent bg-card/70 backdrop-blur-sm border-transparent">
                <CardHeader>
                    <CardTitle className="font-headline glowing-title-underline">Churn Rate (%)</CardTitle>
                    <CardDescription>Users lost per month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceChart dataKey="value" data={isInitialized ? historicalChurnRate : []} />
                </CardContent>
            </Card>
             <Card className="shadow-md card-glow-hover-accent bg-card/70 backdrop-blur-sm border-transparent">
                <CardHeader>
                    <CardTitle className="font-headline glowing-title-underline">{product.name} Dev. Progress</CardTitle>
                    <CardDescription>Progress towards next product stage (0-100%).</CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceChart dataKey="value" data={isInitialized ? historicalProductProgress : []} />
                </CardContent>
            </Card>
          </div>
          <div className="relative z-10">
            <Card className="shadow-md card-glow-hover-accent bg-card/70 backdrop-blur-sm border-transparent">
                <CardHeader>
                    <CardTitle className="font-headline glowing-title-underline">Monthly Expense Breakdown</CardTitle>
                    <CardDescription>Visualizing how your cash is being spent each month in {currencySymbol}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExpenseBreakdownChart data={isInitialized ? historicalExpenseBreakdown : []} currencySymbol={currencySymbol} />
                </CardContent>
            </Card>
          </div>

      </div>
    </TooltipProvider>
  );
}
