
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DollarSign, Users, TrendingUp, TrendingDown, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, PiggyBank, Brain, Loader2, Activity, Map, Target, Shield, BookOpen, Server, Rocket, Megaphone, PackageCheck, Flag, CheckCircle, LockIcon, Eye, Briefcase // Added Briefcase
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StructuredKeyEvent } from "@/types/simulation";
import { StageUnlockAnimationOverlay } from "@/components/dashboard/StageUnlockAnimationOverlay";

interface MetricPanelProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  iconColorClass?: string;
  trendIcon?: React.ElementType;
  trendColorClass?: string;
  cardClass?: string;
  tooltipText?: string;
}

const MetricPanel: React.FC<MetricPanelProps> = ({ title, value, subtext, icon: Icon, iconColorClass = "text-accent", trendIcon: TrendIcon, trendColorClass, cardClass, tooltipText }) => {
  const content = (
    <Card className={cn("shadow-xl border-border/50 bg-card/70 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-200 card-glow-hover-accent h-full", cardClass)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-accent-foreground transition-colors">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", iconColorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground flex items-center">
          {value}
          {TrendIcon && <TrendIcon className={cn("h-5 w-5 ml-2", trendColorClass)} />}
        </div>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );

  if (tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-center">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  return content;
};

const MAX_SIMULATION_MONTHS = 24; // Example total duration for the full simulation journey

const simulationPhases = [
  { id: 'foundation', title: 'Phase I: Genesis Engine', shortTitle: 'Genesis', icon: Rocket, unlockMonth: 0, focus: "Ignite your core concept, validate market resonance, and lay the digital bedrock for your empire.", milestones: ["First 10 Users", "$1k Initial Revenue"], color: "text-sky-400", ringColor: "ring-sky-400/70", shadowColor: "shadow-sky-400/30" },
  { id: 'fortification', title: 'Phase II: Aegis Protocol', shortTitle: 'Aegis', icon: Shield, unlockMonth: 3, focus: "Stabilize core operations, reinforce against early threats, and achieve undeniable Product-Market Fit.", milestones: ["Sustainable Burn Rate", "Positive User Feedback Loop"], color: "text-amber-400", ringColor: "ring-amber-400/70", shadowColor: "shadow-amber-400/30" },
  { id: 'offensive', title: 'Phase III: Vanguard Expansion', shortTitle: 'Vanguard', icon: Megaphone, unlockMonth: 6, focus: "Launch aggressive market penetration, amplify brand presence, and conquer new user territories.", milestones: ["1000 Active Users", "Consistent MoM Growth"], color: "text-rose-400", ringColor: "ring-rose-400/70", shadowColor: "shadow-rose-400/30" },
  { id: 'dominion', title: 'Phase IV: Sovereign Protocol', shortTitle: 'Sovereign', icon: PackageCheck, unlockMonth: 10, focus: "Optimize for enduring profitability, explore new strategic revenue streams, and establish market dominion.", milestones: ["Achieve Profitability", "Launch Major New Feature/Product Line"], color: "text-emerald-400", ringColor: "ring-emerald-400/70", shadowColor: "shadow-emerald-400/30" },
];

interface PhaseCardProps {
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  focus: string;
  milestones: string[];
  status: "locked" | "current" | "completed";
  currentMonthInPhase: number;
  totalMonthsInPhase: number;
  color: string;
  ringColor: string;
  shadowColor: string;
  onClick?: () => void;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ title, shortTitle, icon: Icon, focus, milestones, status, currentMonthInPhase, totalMonthsInPhase, color, ringColor, shadowColor, onClick }) => {
  const progress = totalMonthsInPhase > 0 ? Math.min(100, (currentMonthInPhase / totalMonthsInPhase) * 100) : (status === "completed" ? 100 : 0);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "h-full shadow-xl border-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 relative overflow-hidden group",
        status === "locked" && "bg-card/30 border-border/20 backdrop-blur-sm opacity-60 cursor-not-allowed",
        status === "current" && `bg-card/80 border-transparent ${ringColor} ring-2 ${shadowColor} shadow-lg`,
        status === "completed" && `bg-card/50 border-emerald-500/30 opacity-80`
      )}
    >
      <div className={cn("absolute -top-1 -right-1 p-1.5 rounded-bl-lg text-xs font-bold z-10",
         status === "current" && "bg-accent text-accent-foreground",
         status === "locked" && "bg-muted text-muted-foreground",
         status === "completed" && "bg-emerald-600 text-emerald-50"
      )}>
        {status === "current" ? "ACTIVE" : status === "locked" ? "LOCKED" : "COMPLETE"}
      </div>

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-md",
              status === "current" ? "bg-accent/20" : status === "completed" ? "bg-emerald-500/20" : "bg-muted/50"
            )}>
              <Icon className={cn("h-7 w-7", status === "current" ? color : status === "completed" ? "text-emerald-500" : "text-muted-foreground/70")} />
            </div>
            <CardTitle className={cn("font-headline text-xl", status === "current" ? color : status === "completed" ? "text-emerald-600" : "text-foreground/80")}>
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        <p className="text-sm text-muted-foreground leading-relaxed min-h-[3.5rem]">{focus}</p>
        <div>
          <h4 className="text-xs font-semibold text-foreground/90 mb-1.5">Key Objectives:</h4>
          <ul className="space-y-1">
            {milestones.map(milestone => (
              <li key={milestone} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flag className={cn("h-3.5 w-3.5 shrink-0", status === "current" ? color : status === "completed" ? "text-emerald-500/80" : "text-muted-foreground/60")} />
                {milestone}
              </li>
            ))}
          </ul>
        </div>
        {(status === "current" || status === "completed") && (
          <div className="pt-2">
            <p className={cn("text-xs font-medium mb-0.5", status === "current" ? color : "text-emerald-600")}>
              Phase Progress: {status === "completed" ? totalMonthsInPhase : currentMonthInPhase} / {totalMonthsInPhase} Months
            </p>
            <Progress value={progress} className="h-2.5" indicatorClassName={cn(status === "current" ? "bg-gradient-to-r from-accent/70 to-accent" : "bg-emerald-500")} />
          </div>
        )}
      </CardContent>
      {status === "locked" && <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-20 flex items-center justify-center"><LockIcon className="h-10 w-10 text-foreground/50"/></div>}
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

  useEffect(() => {
    if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
      router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  useEffect(() => {
    if (isInitialized && prevSimulationMonth !== null && simulationMonth > prevSimulationMonth) {
      const newlyUnlockedStage = simulationPhases.find(
        stage => simulationMonth >= stage.unlockMonth && (prevSimulationMonth === null || prevSimulationMonth < stage.unlockMonth)
      );
      if (newlyUnlockedStage && newlyUnlockedStage.id !== simulationPhases[0].id) { // Don't animate for the first phase
        setUnlockedStageForAnimation(newlyUnlockedStage.id);
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
          stageName={simulationPhases.find(s => s.id === unlockedStageForAnimation)?.title || "New Stage"}
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
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-16 w-16 border-2 border-primary shadow-primary-glow-sm cursor-help">
                  <AvatarImage src="/new-assets/eve-avatar.png" alt="EVE AI Avatar" data-ai-hint="bee queen"/>
                  <AvatarFallback><Brain className="h-8 w-8 text-primary"/></AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-sm max-w-xs">EVE, your AI Hive Mind. Monitoring all simulation parameters.</p>
                <p className="text-xs text-muted-foreground mt-1">Current Status: {isGameOver ? "Critical Alert!" : isLowCash ? "Low Cash Warning" : "Nominal"}</p>
              </TooltipContent>
            </Tooltip>
            <div>
              <h1 className="text-4xl font-headline text-foreground text-glow-primary">
                {isInitialized ? companyName : "ForgeSim"} - Command Center
              </h1>
              <p className="text-lg text-muted-foreground">
                Mission Clock: Month {isInitialized ? simulationMonth : "0"} / {MAX_SIMULATION_MONTHS} | Intel Currency: {isInitialized ? financials.currencyCode : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={handleAdvanceMonth}
              className="flex-1 md:flex-none bg-gradient-to-r from-accent to-yellow-400 hover:from-accent/90 hover:to-yellow-500 text-accent-foreground shadow-lg hover:shadow-accent-glow-sm transition-all duration-200 transform hover:scale-105"
              size="lg"
              disabled={!isInitialized || isGameOver || (currentAiReasoning || "").includes("simulating month...") || !!unlockedStageForAnimation}
            >
              {(currentAiReasoning || "").includes("simulating month...") ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronsRight className="mr-2 h-5 w-5"/>}
              {(currentAiReasoning || "").includes("simulating month...") ? "Processing Turn..." : "Launch Next Month"}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" title="Reset Simulation & Start New Campaign" className="border-primary text-primary hover:bg-primary/10 hover:text-primary" disabled={!!unlockedStageForAnimation}>
              <RefreshCcw className="h-5 w-5"/>
              <span className="ml-2 hidden sm:inline">New Campaign</span>
            </Button>
          </div>
        </header>

        {isGameOver && (
          <Alert variant="destructive" className="mb-6 border-2 border-destructive/80 bg-destructive/20 text-destructive-foreground p-6 shadow-lg">
            <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
            <AlertTitle className="text-xl font-bold">MISSION FAILURE - CRITICAL RESOURCE DEPLETION!</AlertTitle>
            <AlertDescription className="text-base mt-1">
              Your startup has exhausted its cash reserves ({currencySymbol}{financials.cashOnHand.toLocaleString()}). Command functions are offline. Initiate a 'New Campaign' to strategize anew.
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-primary/20 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
              <Map className="h-6 w-6" /> Overall Simulation Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-3.5" indicatorClassName="bg-gradient-to-r from-primary via-accent to-yellow-400"/>
            <p className="text-xs text-muted-foreground mt-1 text-right">{simulationMonth} of {MAX_SIMULATION_MONTHS} Months Simulated ({overallProgress.toFixed(0)}%)</p>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-2xl font-headline text-foreground flex items-center gap-2"><Zap className="h-6 w-6 text-accent"/>Startup Journey Phases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {simulationPhases.map((phase, index) => {
              const nextUnlockMonth = simulationPhases[index + 1]?.unlockMonth || MAX_SIMULATION_MONTHS + 1; // Ensure last phase can complete
              const status = simulationMonth >= phase.unlockMonth && simulationMonth < nextUnlockMonth
                ? "current"
                : simulationMonth >= nextUnlockMonth
                ? "completed"
                : "locked";
              const currentMonthInThisPhase = status === "current" ? (simulationMonth - phase.unlockMonth + 1) : status === "completed" ? (nextUnlockMonth - phase.unlockMonth) : 0;
              const totalMonthsForThisPhase = status !== "locked" ? (nextUnlockMonth - phase.unlockMonth) : (simulationPhases[index+1]?.unlockMonth || (phase.unlockMonth + 3)) - phase.unlockMonth; // Default 3 months for locked phases

              return (
                <PhaseCard
                  key={phase.id}
                  {...phase}
                  status={status}
                  currentMonthInPhase={Math.max(0, currentMonthInThisPhase)}
                  totalMonthsInPhase={Math.max(1, totalMonthsForThisPhase)}
                  onClick={() => console.log(`Clicked phase: ${phase.title}`)} // Placeholder for potential future interaction
                />
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <MetricPanel title="Treasury Reserves" value={`${currencySymbol}${financials.cashOnHand.toLocaleString()}`}
              subtext={`Burn: ${currencySymbol}${financials.burnRate.toLocaleString()}/mo${isLowCash && !isGameOver ? ' (LOW RUNWAY!)' : ''}`}
              icon={PiggyBank} iconColorClass={isLowCash && !isGameOver ? "text-yellow-400" : isGameOver ? "text-destructive" : "text-emerald-400"}
              cardClass={isLowCash && !isGameOver ? "border-yellow-400/70 shadow-yellow-500/20" : isGameOver ? "border-destructive/70 shadow-destructive/20" : "border-emerald-500/30"}
              tooltipText={`Current cash available. Burn rate is how much you're spending over revenue monthly.`}
            />
            <MetricPanel title="Monthly Revenue Flow" value={`${currencySymbol}${financials.revenue.toLocaleString()}`}
              subtext={`MRR: ${currencySymbol}${userMetrics.monthlyRecurringRevenue.toLocaleString()}`} icon={DollarSign} iconColorClass="text-green-400" cardClass="border-green-500/30"
              tooltipText="Total income generated this month. MRR is Monthly Recurring Revenue."
            />
             <MetricPanel title="Active User Base" value={userMetrics.activeUsers.toLocaleString()}
              subtext={`New this month: ${userMetrics.newUserAcquisitionRate.toLocaleString()}`} icon={Users} iconColorClass="text-blue-400"
              trendIcon={userMetrics.newUserAcquisitionRate < 0 ? TrendingDown : (userMetrics.newUserAcquisitionRate > 0 ? TrendingUp : undefined)}
              trendColorClass={userMetrics.newUserAcquisitionRate < 0 ? "text-destructive" : (userMetrics.newUserAcquisitionRate > 0 ? "text-green-500" : undefined)} cardClass="border-blue-500/30"
              tooltipText="Total active users of your product/service."
            />
            <MetricPanel title="Founder Acumen" value={`${startupScore}/100`}
              subtext={startupScore > 75 ? "Visionary Leader" : startupScore > 50 ? "Strategic Thinker" : "Aspiring Founder"} icon={BarChartBig} iconColorClass="text-purple-400" cardClass="border-purple-500/30"
              tooltipText="Your Startup Score reflects overall performance and strategic decisions."
            />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-border/40 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-lg"><Server className="h-5 w-5 text-primary"/> Hive Mind Log</CardTitle>
                <CardDescription>EVE's real-time notes on simulation processes for month {simulationMonth}.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[120px] bg-background/40 p-3 rounded-md shadow-inner-soft-gold">
                {currentAiReasoning && currentAiReasoning.includes("simulating month...") ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> <p className="text-sm">{currentAiReasoning}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentAiReasoning || "AI log is idle."}</p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-lg border-border/40 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-headline"><BookOpen className="h-5 w-5 text-primary"/>Event Chronicle</CardTitle>
                <CardDescription>Key occurrences impacting your startup. (Newest first)</CardDescription>
              </CardHeader>
              <CardContent className="bg-background/40 p-3 rounded-md shadow-inner-soft-gold">
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
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-headline text-foreground flex items-center gap-2"><BarChartBig className="h-6 w-6 text-accent"/>Strategic Intel & Reports</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <PerformanceChart title={`Revenue (${currencySymbol})`} description="Monthly revenue trends." dataKey="revenue" data={isInitialized ? historicalRevenue : []} />
            <PerformanceChart title="User Growth" description="Active user base evolution." dataKey="users" data={isInitialized ? historicalUserGrowth : []} />
            <PerformanceChart title={`Burn Rate (${currencySymbol})`} description="Cash consumed monthly over revenue." dataKey="value" data={isInitialized ? historicalBurnRate : []} />
            <PerformanceChart title={`Net Profit/Loss (${currencySymbol})`} description="Monthly financial result." dataKey="value" data={isInitialized ? historicalNetProfitLoss : []} />
            <PerformanceChart title={`CAC (${currencySymbol})`} description="Avg. cost per new user." dataKey="value" data={isInitialized ? historicalCAC : []} />
            <PerformanceChart title="Churn Rate (%)" description="Users lost per month." dataKey="value" data={isInitialized ? historicalChurnRate : []} />
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            <PerformanceChart title={`${product.name} (${product.stage}) Dev. Progress`} description="Progress towards next product stage (0-100%)." dataKey="value" data={isInitialized ? historicalProductProgress : []} />
          </div>
          <div>
            <ExpenseBreakdownChart data={isInitialized ? historicalExpenseBreakdown : []} currencySymbol={currencySymbol} />
          </div>
        </section>
      </div>
    </>
  );
}

      