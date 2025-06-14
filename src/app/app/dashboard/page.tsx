
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, TrendingUp, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, TrendingDown, PiggyBank, Brain, Loader2, Activity } from "lucide-react";
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
                Please go to the "Setup Simulation" page to initialize your digital twin. Redirecting...
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLowCash = isInitialized && financials.cashOnHand > 0 && financials.burnRate > 0 && financials.cashOnHand < (2 * financials.burnRate);


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Setup Simulation" page to initialize your digital twin before viewing the dashboard.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
                <Zap className="h-8 w-8 text-accent" />
                {isInitialized ? companyName : "ForgeSim"} - Digital Twin
            </h1>
            <p className="text-muted-foreground">
             Month: {isInitialized ? simulationMonth : "N/A"} | Currency: {isInitialized ? financials.currencyCode : "N/A"}
            </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAdvanceMonth} 
            className="bg-accent hover:bg-accent/90 text-accent-foreground" 
            size="lg"
            disabled={!isInitialized || financials.cashOnHand <= 0 || (currentAiReasoning || "").includes("simulating month...")}
          >
              { (currentAiReasoning || "").includes("simulating month...") ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronsRight className="mr-2 h-5 w-5"/> }
              { (currentAiReasoning || "").includes("simulating month...") ? "Simulating..." : "Simulate Next Month" }
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg" title="Reset Simulation">
              <RefreshCcw className="h-5 w-5"/>
          </Button>
        </div>
      </header>
      
      {financials.cashOnHand <= 0 && isInitialized && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Game Over - Out of Cash!</AlertTitle>
          <AlertDescription>
            Your startup has run out of cash. Key actions are disabled. Reset the simulation to try again or analyze what went wrong.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isInitialized ? `${currencySymbol}${financials.revenue.toLocaleString()}` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              MRR: {isInitialized ? `${currencySymbol}${userMetrics.monthlyRecurringRevenue.toLocaleString()}` : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Users className="h-5 w-5 text-accent" />
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
          </CardContent>
        </Card>
        <Card className={cn("shadow-lg", isLowCash && "border-yellow-500/70")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash on Hand
            </CardTitle>
            <div className="flex items-center gap-1">
              {isLowCash && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
              <PiggyBank className="h-5 w-5 text-accent" />
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
              {isLowCash && <span className="text-yellow-600 font-semibold ml-1">(Low Runway!)</span>}
            </p>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Startup Score
            </CardTitle>
            <BarChartBig className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{isInitialized ? startupScore : "0"}/100</div>
            <p className="text-xs text-muted-foreground">
              Overall health & progress
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary"/> Hive Mind: Simulation Log
            </CardTitle>
            <CardDescription>AI's real-time notes on the simulation process for month {simulationMonth}.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[60px]">
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
      </div>


      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 mt-8">
        <PerformanceChart title="Simulated Monthly Revenue" description={`Revenue trends in ${currencySymbol} (${financials.currencyCode})`} dataKey="revenue" data={isInitialized ? historicalRevenue : []} />
        <PerformanceChart title="Simulated User Growth" description="User acquisition trends." dataKey="users" data={isInitialized ? historicalUserGrowth : []} />
        <PerformanceChart title="Monthly Burn Rate" description={`Cash burned per month in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalBurnRate : []} />
        <PerformanceChart title="Monthly Net Profit/Loss" description={`Net financial result in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalNetProfitLoss : []} />
        <PerformanceChart title="Customer Acquisition Cost (CAC)" description={`Avg. cost to acquire a new user in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalCAC : []} />
        <PerformanceChart title="Monthly Churn Rate (%)" description="Percentage of users lost per month." dataKey="value" data={isInitialized ? historicalChurnRate : []} />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 mt-8"> 
        <PerformanceChart title={`Product: ${product.name} (${product.stage})`} description="Development progress towards next stage (0-100%)." dataKey="value" data={isInitialized ? historicalProductProgress : []} />
      </div>
      
      <div className="mt-8">
         <ExpenseBreakdownChart data={isInitialized ? historicalExpenseBreakdown : []} currencySymbol={currencySymbol} />
      </div>
      
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-6 w-6 text-primary"/>Key Simulation Events</CardTitle>
           <CardDescription>Chronological log of major occurrences in your simulation. (Newest first)</CardDescription>
        </CardHeader>
        <CardContent>
          {isInitialized && keyEvents.length > 0 ? (
            <ScrollArea className="h-60">
              <ul className="text-sm space-y-1 text-muted-foreground">
                {keyEvents.slice().reverse().map((event: StructuredKeyEvent) => (
                  <li key={event.id} className="border-b border-border/50 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0">
                    {/* M{event.month}: [{event.category} - {event.impact}] {event.description} */}
                    <span className="font-semibold text-foreground/80">M{event.month}: </span>{event.description}
                    {/* Add badges for category/impact here later if desired */}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">{isInitialized ? "No key events recorded yet." : "Initialize simulation to see events."}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

