
"use client";
import { useEffect, useState } from "react"; // Added useState for prevSimulationMonth
import { useRouter } from "next/navigation";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, TrendingUp, TrendingDown, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, PiggyBank, Brain, Loader2, Activity, Map, Target, Shield, BookOpen, Server, Rocket, Megaphone, PackageCheck, Flag, CheckCircle, LockIcon, Eye } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StructuredKeyEvent } from "@/types/simulation";
import { StageUnlockAnimationOverlay } from "@/components/dashboard/StageUnlockAnimationOverlay"; // New import

interface MetricPanelProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  iconColorClass?: string;
  trendIcon?: React.ElementType;
  trendColorClass?: string;
  cardClass?: string;
}

const MetricPanel: React.FC<MetricPanelProps> = ({ title, value, subtext, icon: Icon, iconColorClass = "text-accent", trendIcon: TrendIcon, trendColorClass, cardClass }) => {
  return (
    <Card className={cn("shadow-xl border-border/50 bg-card/70 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-200 card-glow-hover-accent", cardClass)}>
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
};

const simulationStages = [
  { id: 'foundation', title: 'Phase I: Foundation & Validation', icon: Rocket, unlockMonth: 0, focus: "Initial setup, validating your core idea, and early market research. Lay the groundwork for success.", milestones: ["First 10 Users", "$1k Initial Revenue"] },
  { id: 'fortification', title: 'Phase II: Risk Fortification & PMF', icon: Shield, unlockMonth: 3, focus: "Stabilizing operations, mitigating early risks, and intensely focusing on achieving Product-Market Fit.", milestones: ["Sustainable Burn Rate", "Positive User Feedback Loop"] },
  { id: 'offensive', title: 'Phase III: Market Offensive & Scaling', icon: Megaphone, unlockMonth: 6, focus: "Aggressively scaling user acquisition, building brand presence, and expanding your market reach.", milestones: ["1000 Active Users", "Consistent Month-over-Month Growth"] },
  { id: 'dominion', title: 'Phase IV: Strategic Dominion & Profitability', icon: PackageCheck, unlockMonth: 10, focus: "Optimizing for profitability, exploring new revenue streams, and establishing sustainable market leadership.", milestones: ["Achieve Profitability", "Launch Major New Feature/Product Line"] },
];

interface StageCardProps {
  title: string;
  icon: React.ElementType;
  focus: string;
  milestones: string[];
  status: "locked" | "current" | "completed";
  currentMonthInPhase: number;
  totalMonthsInPhase: number;
}

const StageCard: React.FC<StageCardProps> = ({ title, icon: Icon, focus, milestones, status, currentMonthInPhase, totalMonthsInPhase }) => {
  const progress = totalMonthsInPhase > 0 ? (currentMonthInPhase / totalMonthsInPhase) * 100 : 0;
  return (
    <Card className={cn(
      "shadow-lg border-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1",
      status === "locked" && "bg-muted/30 border-border/30 opacity-60",
      status === "current" && "bg-primary/10 border-primary ring-2 ring-primary shadow-primary-glow-sm",
      status === "completed" && "bg-green-500/10 border-green-500/50 opacity-80"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={cn("h-7 w-7", 
                status === "current" ? "text-primary" : 
                status === "completed" ? "text-green-500" :
                "text-muted-foreground"
            )} />
            <CardTitle className={cn("font-headline text-lg",
                status === "current" ? "text-primary" : 
                status === "completed" ? "text-green-600" :
                "text-foreground/80"
            )}>{title}</CardTitle>
          </div>
          {status === "locked" && <LockIcon className="h-5 w-5 text-muted-foreground" />}
          {status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "current" && <Eye className="h-5 w-5 text-primary animate-pulse" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{focus}</p>
        <div>
          <h4 className="text-xs font-semibold text-foreground/90 mb-1">Key Milestones for this Phase:</h4>
          <ul className="space-y-0.5">
            {milestones.map(milestone => (
              <li key={milestone} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flag className="h-3 w-3 text-accent/80 shrink-0" />
                {milestone}
              </li>
            ))}
          </ul>
        </div>
        {status === "current" && (
          <div>
            <p className="text-xs text-primary font-medium mb-0.5">Phase Progress: {currentMonthInPhase} / {totalMonthsInPhase} Months</p>
            <Progress value={progress} className="h-2" indicatorClassName="bg-primary"/>
          </div>
        )}
         {status === "locked" && <p className="text-xs text-center text-muted-foreground/70 py-2">Unlock by progressing the simulation.</p>}
         {status === "completed" && <p className="text-xs text-center text-green-600/80 font-semibold py-2">Phase Objectives Achieved!</p>}
      </CardContent>
    </Card>
  );
};


export default function DashboardPage() {
  const router = useRouter();
  const {
    companyName,
    simulationMonth,
    financials,
    userMetrics,
    product,
    startupScore,
    keyEvents,
    isInitialized,
    currentAiReasoning, 
    historicalRevenue,
    historicalUserGrowth,
    historicalBurnRate,
    historicalNetProfitLoss,
    historicalExpenseBreakdown,
    historicalCAC,
    historicalChurnRate,
    historicalProductProgress,
    advanceMonth,
    resetSimulation,
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
      const newlyUnlockedStage = simulationStages.find(
        stage => simulationMonth >= stage.unlockMonth && prevSimulationMonth < stage.unlockMonth
      );
      if (newlyUnlockedStage) {
        setUnlockedStageForAnimation(newlyUnlockedStage.id);
        // Log the unlock for debugging or analytics
        console.log(`Stage Unlocked for Animation: ${newlyUnlockedStage.title} (ID: ${newlyUnlockedStage.id}) at month ${simulationMonth}`);
      }
    }
    // Always update prevSimulationMonth after checks, or on first load if simulation is initialized
    if (isInitialized) {
      setPrevSimulationMonth(simulationMonth);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationMonth, isInitialized]); // prevSimulationMonth removed from deps to avoid re-triggering on its own update

  const handleAnimationComplete = () => {
    setUnlockedStageForAnimation(null);
  };

  const handleAdvanceMonth = () => {
    if (isInitialized && financials.cashOnHand > 0) {
      advanceMonth();
    }
  };

  const handleReset = () => {
    resetSimulation();
    router.push('/app/setup');
  };

  if (typeof simulationMonth === 'number' && simulationMonth === 0 && !isInitialized) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Simulation Not Initialized</AlertTitle>
            <AlertDescription>
                Please go to the "Setup Simulation" page to initialize your digital twin. Redirecting...
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLowCash = isInitialized && financials.cashOnHand > 0 && financials.burnRate > 0 && financials.cashOnHand < (2 * financials.burnRate);
  const isGameOver = financials.cashOnHand <= 0 && isInitialized;

  const maxLevels = 10; 
  const monthsPerLevel = 3; 
  const currentLevel = isInitialized ? Math.min(maxLevels, Math.floor(simulationMonth / monthsPerLevel) + 1) : 1;
  const progressToNextLevel = isInitialized ? (simulationMonth % monthsPerLevel) / monthsPerLevel * 100 : 0;
  const xpTowardsNextLevel = isInitialized ? (simulationMonth % monthsPerLevel) : 0;

  return (
    <>
    {unlockedStageForAnimation && isInitialized && (
        <StageUnlockAnimationOverlay
          stageId={unlockedStageForAnimation}
          stageName={simulationStages.find(s => s.id === unlockedStageForAnimation)?.title || "New Stage"}
          onComplete={handleAnimationComplete}
        />
      )}
    <div className={cn("container mx-auto py-8 px-4 md:px-0 space-y-8", unlockedStageForAnimation && "blur-sm pointer-events-none")}>
      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Setup Simulation" page to initialize your digital twin.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}

      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
            <Map className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-4xl font-headline text-foreground text-glow-primary">
                    {isInitialized ? companyName : "ForgeSim"} - Founder's Command Center
                </h1>
                <p className="text-lg text-muted-foreground">
                Mission Month: {isInitialized ? simulationMonth : "N/A"} | Intel Currency: {isInitialized ? financials.currencyCode : "N/A"}
                </p>
            </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleAdvanceMonth} 
            className="bg-gradient-to-r from-accent to-yellow-400 hover:from-accent/90 hover:to-yellow-500 text-accent-foreground shadow-lg hover:shadow-accent-glow-sm transition-all duration-200 transform hover:scale-105" 
            size="lg"
            disabled={!isInitialized || isGameOver || (currentAiReasoning || "").includes("simulating month...") || !!unlockedStageForAnimation}
          >
              { (currentAiReasoning || "").includes("simulating month...") ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronsRight className="mr-2 h-5 w-5"/> }
              { (currentAiReasoning || "").includes("simulating month...") ? "Processing Turn..." : "Advance Mission Month" }
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg" title="Reset Simulation & Start New Campaign" className="border-primary text-primary hover:bg-primary/10 hover:text-primary" disabled={!!unlockedStageForAnimation}>
              <RefreshCcw className="h-5 w-5"/>
              <span className="ml-2">New Campaign</span>
          </Button>
        </div>
      </header>
      
      {isGameOver && (
         <Alert variant="destructive" className="mb-6 border-2 border-destructive/80 bg-destructive/20 text-destructive-foreground p-6">
          <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
          <AlertTitle className="text-xl font-bold">Mission Failed - Critical Resource Depletion!</AlertTitle>
          <AlertDescription className="text-base mt-1">
            Your startup has exhausted its cash reserves. Command functions are offline. Initiate a 'New Campaign' to strategize anew.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-xl border-primary/20 bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <Target className="h-6 w-6" /> Founder Progress & Acumen
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Startup Score (XP)</p>
            <p className="text-4xl font-bold text-foreground text-glow-accent">{isInitialized ? startupScore : "0"}<span className="text-lg text-muted-foreground">/100</span></p>
            <Progress value={isInitialized ? startupScore : 0} className="mt-1 h-3" indicatorClassName={cn(startupScore < 30 && isInitialized ? "bg-red-500" : startupScore < 60 && isInitialized ? "bg-yellow-500" : "bg-green-500")} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Simulation Level</p>
            <p className="text-4xl font-bold text-foreground">{currentLevel}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Progress to Next Level ({xpTowardsNextLevel}/{monthsPerLevel} months)</p>
            <Progress value={progressToNextLevel} className="mt-1 h-3" indicatorClassName="bg-accent" />
            {currentLevel < maxLevels && <p className="text-xs text-muted-foreground mt-0.5">Reach Month {(currentLevel * monthsPerLevel)} for Level {currentLevel + 1}</p>}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-headline text-foreground flex items-center gap-2"><Zap className="h-6 w-6 text-accent"/>Simulation Journey Phases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {simulationStages.map((stage, index) => {
            const nextUnlockMonth = simulationStages[index + 1]?.unlockMonth || Infinity;
            const status = simulationMonth >= stage.unlockMonth && simulationMonth < nextUnlockMonth
              ? "current"
              : simulationMonth >= nextUnlockMonth || (simulationMonth >= stage.unlockMonth && index === simulationStages.length -1)
              ? "completed"
              : "locked";
            
            const currentMonthInThisPhase = status === "current" ? (simulationMonth - stage.unlockMonth +1) : status === "completed" ? (nextUnlockMonth - stage.unlockMonth) : 0;
            const totalMonthsForThisPhase = status !== "locked" ? (nextUnlockMonth - stage.unlockMonth) : (simulationStages[index+1]?.unlockMonth || (stage.unlockMonth + monthsPerLevel)) - stage.unlockMonth;

            return (
              <StageCard
                key={stage.id}
                title={stage.title}
                icon={stage.icon}
                focus={stage.focus}
                milestones={stage.milestones}
                status={status}
                currentMonthInPhase={Math.max(0,currentMonthInThisPhase)}
                totalMonthsInPhase={Math.max(1,totalMonthsForThisPhase)}
              />
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <MetricPanel 
            title="Treasury Reserves" 
            value={isInitialized ? `${currencySymbol}${financials.cashOnHand.toLocaleString()}` : "N/A"}
            subtext={`Monthly Burn: ${isInitialized ? `${currencySymbol}${financials.burnRate.toLocaleString()}` : "N/A"}${isLowCash && !isGameOver ? ' (LOW RUNWAY!)' : ''}`}
            icon={PiggyBank}
            iconColorClass={isLowCash && !isGameOver ? "text-yellow-400" : isGameOver ? "text-destructive" : "text-accent"}
            cardClass={isLowCash && !isGameOver ? "border-yellow-400/70" : isGameOver ? "border-destructive/70" : "border-teal-500/30"}
            />
            <MetricPanel 
            title="Monthly Revenue Flow" 
            value={isInitialized ? `${currencySymbol}${financials.revenue.toLocaleString()}` : "N/A"}
            subtext={`MRR: ${isInitialized ? `${currencySymbol}${userMetrics.monthlyRecurringRevenue.toLocaleString()}` : "N/A"}`}
            icon={DollarSign}
            cardClass="border-green-500/30"
            />
            <MetricPanel 
            title="Active User Base" 
            value={isInitialized ? userMetrics.activeUsers.toLocaleString() : "N/A"}
            subtext={`New this month: ${isInitialized ? userMetrics.newUserAcquisitionRate.toLocaleString() : "N/A"}`}
            icon={Users}
            trendIcon={isInitialized && userMetrics.newUserAcquisitionRate < 0 ? TrendingDown : undefined}
            trendColorClass={isInitialized && userMetrics.newUserAcquisitionRate < 0 ? "text-destructive" : undefined}
            cardClass="border-blue-500/30"
            />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-border/40 bg-card/60">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-lg">
                <Server className="h-5 w-5 text-primary"/> Hive Mind: Comms Log
                </CardTitle>
                <CardDescription>AI's real-time notes on the simulation process for month {simulationMonth}.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[80px] bg-background/30 p-3 rounded-md">
                {currentAiReasoning && currentAiReasoning.includes("simulating month...") ? (
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <p className="text-sm">{currentAiReasoning}</p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentAiReasoning || "AI log is empty."}</p>
                )}
            </CardContent>
            </Card>
            <Card className="shadow-lg border-border/40 bg-card/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-headline"><BookOpen className="h-5 w-5 text-primary"/>Event Chronicle</CardTitle>
                <CardDescription>Key occurrences in your simulation journey. (Newest first)</CardDescription>
            </CardHeader>
            <CardContent className="bg-background/30 p-3 rounded-md">
                {isInitialized && keyEvents.length > 0 ? (
                <ScrollArea className="h-32">
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
                <p className="text-sm text-muted-foreground h-32 flex items-center justify-center">{isInitialized ? "No key events recorded yet." : "Initialize simulation to see events."}</p>
                )}
            </CardContent>
            </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-headline text-foreground flex items-center gap-2"><BarChartBig className="h-6 w-6 text-accent"/>Strategic Intel & Reports</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <PerformanceChart title="Simulated Monthly Revenue" description={`Revenue trends in ${currencySymbol} (${financials.currencyCode})`} dataKey="revenue" data={isInitialized ? historicalRevenue : []} />
          <PerformanceChart title="Simulated User Growth" description="User acquisition trends." dataKey="users" data={isInitialized ? historicalUserGrowth : []} />
          <PerformanceChart title="Monthly Burn Rate" description={`Cash burned per month in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalBurnRate : []} />
          <PerformanceChart title="Monthly Net Profit/Loss" description={`Net financial result in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalNetProfitLoss : []} />
          <PerformanceChart title="Customer Acquisition Cost (CAC)" description={`Avg. cost to acquire a new user in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalCAC : []} />
          <PerformanceChart title="Monthly Churn Rate (%)" description="Percentage of users lost per month." dataKey="value" data={isInitialized ? historicalChurnRate : []} />
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1"> 
          <PerformanceChart title={`Product: ${product.name} (${product.stage})`} description="Development progress towards next stage (0-100%)." dataKey="value" data={isInitialized ? historicalProductProgress : []} />
        </div>
        <div>
          <ExpenseBreakdownChart data={isInitialized ? historicalExpenseBreakdown : []} currencySymbol={currencySymbol} />
        </div>
      </section>
    </div>
    </>
  );
}
