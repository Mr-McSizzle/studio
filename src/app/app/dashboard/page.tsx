"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, TrendingUp, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, TrendingDown, PiggyBank, Brain, Loader2, Activity, Crown, Target, Flame } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StructuredKeyEvent } from "@/types/simulation";

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

  useEffect(() => {
    if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

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
                Please go to the "Launch Pad" to initialize your digital twin. Redirecting...
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLowCash = isInitialized && financials.cashOnHand > 0 && financials.burnRate > 0 && financials.cashOnHand < (2 * financials.burnRate);
  const healthScore = Math.min(100, Math.max(0, (financials.cashOnHand / (financials.burnRate * 3)) * 100));

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">
      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Launch Pad" to initialize your digital twin before viewing the command center.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Launch Pad</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-accent/20 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-yellow-400 shadow-lg">
                  <Crown className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h1 className="text-4xl font-headline font-bold text-foreground">
                    {isInitialized ? companyName : "ForgeSim"} Command Center
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="level" className="text-sm">
                      Month {isInitialized ? simulationMonth : "N/A"}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {isInitialized ? financials.currencyCode : "N/A"}
                    </Badge>
                    {isInitialized && (
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Active Simulation</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {isInitialized && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Startup Health</span>
                    <span className="font-medium">{Math.round(healthScore)}%</span>
                  </div>
                  <Progress 
                    value={healthScore} 
                    className="h-3"
                    indicatorClassName={cn(
                      healthScore > 70 ? "bg-green-500" :
                      healthScore > 40 ? "bg-yellow-500" : "bg-red-500"
                    )}
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleAdvanceMonth} 
                className="bg-gradient-to-r from-accent to-yellow-400 hover:from-accent/90 hover:to-yellow-400/90 text-black font-bold shadow-lg hover:shadow-accent-glow-sm transition-all duration-200" 
                size="lg"
                disabled={!isInitialized || financials.cashOnHand <= 0 || (currentAiReasoning || "").includes("simulating month...")}
              >
                { (currentAiReasoning || "").includes("simulating month...") ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronsRight className="mr-2 h-5 w-5"/> }
                { (currentAiReasoning || "").includes("simulating month...") ? "Simulating..." : "Advance Month" }
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg" title="Reset Simulation" className="border-accent/50 hover:bg-accent/10">
                  <RefreshCcw className="h-5 w-5"/>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {financials.cashOnHand <= 0 && isInitialized && (
         <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>🚨 Game Over - Mission Failed!</AlertTitle>
          <AlertDescription>
            Your startup has run out of cash. All systems are offline. Reset the simulation to try again or analyze what went wrong.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-green-500/5 border-green-500/20 shadow-lg hover:shadow-green-500/20 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isInitialized ? `${currencySymbol}${financials.revenue.toLocaleString()}` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              MRR: {isInitialized ? `${currencySymbol}${userMetrics.monthlyRecurringRevenue.toLocaleString()}` : "N/A"}
            </p>
            {isInitialized && financials.revenue > 0 && (
              <Badge variant="success" className="mt-2 text-xs">
                💰 Revenue Active
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-blue-500/5 border-blue-500/20 shadow-lg hover:shadow-blue-500/20 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground flex items-center">
              {isInitialized ? userMetrics.activeUsers.toLocaleString() : "N/A"}
              {isInitialized && userMetrics.newUserAcquisitionRate < 0 && (
                <TrendingDown className="h-5 w-5 text-destructive ml-2" />
              )}
            </div>
            <p className={cn("text-xs text-muted-foreground", isInitialized && userMetrics.newUserAcquisitionRate < 0 && "text-destructive")}>
              New this month: {isInitialized ? userMetrics.newUserAcquisitionRate.toLocaleString() : "N/A"}
            </p>
            {isInitialized && userMetrics.activeUsers > 100 && (
              <Badge variant="info" className="mt-2 text-xs">
                🚀 Growing
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className={cn("bg-gradient-to-br from-card shadow-lg transition-all duration-200", 
          isLowCash ? "to-yellow-500/5 border-yellow-500/30 hover:shadow-yellow-500/20" : "to-purple-500/5 border-purple-500/20 hover:shadow-purple-500/20"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash Reserves
            </CardTitle>
            <div className={cn("p-2 rounded-lg", isLowCash ? "bg-yellow-500/20" : "bg-purple-500/20")}>
              {isLowCash && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
              <PiggyBank className={cn("h-4 w-4", isLowCash ? "text-yellow-500" : "text-purple-500")} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
                "text-2xl font-bold", 
                financials.cashOnHand <= 0 && isInitialized ? 'text-destructive' : 
                isLowCash ? 'text-yellow-500' : 'text-foreground'
            )}>
               {isInitialized ? `${currencySymbol}${financials.cashOnHand.toLocaleString()}` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly Burn: {isInitialized ? `${currencySymbol}${financials.burnRate.toLocaleString()}` : "N/A"}
            </p>
            {isLowCash && (
              <Badge variant="warning" className="mt-2 text-xs">
                ⚠️ Low Runway!
              </Badge>
            )}
          </CardContent>
        </Card>

         <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-lg hover:shadow-accent/20 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Startup Score
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/20">
              <BarChartBig className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{isInitialized ? startupScore : "0"}/100</div>
            <div className="mt-2">
              <Progress 
                value={isInitialized ? startupScore : 0} 
                className="h-2"
                indicatorClassName="bg-gradient-to-r from-accent to-yellow-400"
              />
            </div>
            <Badge variant="xp" className="mt-2 text-xs">
              {isInitialized && startupScore >= 80 ? "🏆 Elite" : 
               isInitialized && startupScore >= 60 ? "⭐ Strong" : 
               isInitialized && startupScore >= 40 ? "📈 Growing" : "🌱 Starting"}
            </Badge>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Reasoning Card */}
      <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="h-5 w-5 text-primary"/>
            </div>
            Hive Mind: Simulation Intelligence
          </CardTitle>
          <CardDescription>AI's real-time analysis and reasoning for month {simulationMonth}.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[80px]">
          {currentAiReasoning && currentAiReasoning.includes("simulating month...") ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm">{currentAiReasoning}</p>
              </div>
          ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {currentAiReasoning || "AI intelligence is monitoring your simulation. Advance a month to see strategic insights."}
              </p>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <PerformanceChart title="Revenue Trajectory" description={`Revenue trends in ${currencySymbol} (${financials.currencyCode})`} dataKey="revenue" data={isInitialized ? historicalRevenue : []} />
        <PerformanceChart title="User Growth" description="User acquisition trends." dataKey="users" data={isInitialized ? historicalUserGrowth : []} />
        <PerformanceChart title="Burn Rate" description={`Cash burned per month in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalBurnRate : []} />
        <PerformanceChart title="Net Profit/Loss" description={`Net financial result in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalNetProfitLoss : []} />
        <PerformanceChart title="Customer Acquisition Cost" description={`Avg. cost to acquire a new user in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalCAC : []} />
        <PerformanceChart title="Churn Rate (%)" description="Percentage of users lost per month." dataKey="value" data={isInitialized ? historicalChurnRate : []} />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1"> 
        <PerformanceChart title={`Product: ${product.name} (${product.stage})`} description="Development progress towards next stage (0-100%)." dataKey="value" data={isInitialized ? historicalProductProgress : []} />
      </div>
      
      <div className="mt-8">
         <ExpenseBreakdownChart data={isInitialized ? historicalExpenseBreakdown : []} currencySymbol={currencySymbol} />
      </div>
      
      {/* Events Timeline */}
      <Card className="shadow-lg bg-gradient-to-br from-card to-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <Activity className="h-5 w-5 text-accent"/>
            </div>
            Mission Timeline
          </CardTitle>
           <CardDescription>Chronicle of major events in your startup journey. (Latest first)</CardDescription>
        </CardHeader>
        <CardContent>
          {isInitialized && keyEvents.length > 0 ? (
            <ScrollArea className="h-60">
              <ul className="text-sm space-y-3">
                {keyEvents.slice().reverse().map((event: StructuredKeyEvent, index) => (
                  <li key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-background to-accent/5 border border-accent/10">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      event.impact === 'Positive' ? "bg-green-500" :
                      event.impact === 'Negative' ? "bg-red-500" : "bg-yellow-500"
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Month {event.month}
                        </Badge>
                        <Badge variant={
                          event.impact === 'Positive' ? 'success' :
                          event.impact === 'Negative' ? 'destructive' : 'warning'
                        } className="text-xs">
                          {event.category}
                        </Badge>
                      </div>
                      <p className="text-foreground/90">{event.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{isInitialized ? "No mission events recorded yet." : "Initialize simulation to see your startup's journey."}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}