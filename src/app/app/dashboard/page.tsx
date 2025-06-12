
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, TrendingUp, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, TrendingDown, PiggyBank } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const router = useRouter();
  const {
    companyName,
    simulationMonth,
    financials,
    userMetrics,
    startupScore,
    keyEvents,
    isInitialized,
    historicalRevenue,
    historicalUserGrowth,
    historicalBurnRate,
    historicalNetProfitLoss,
    historicalExpenseBreakdown,
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
            disabled={!isInitialized || financials.cashOnHand <= 0}
          >
              Simulate Next Month <ChevronsRight className="ml-2 h-5 w-5"/>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-2xl font-bold text-foreground">
              {isInitialized ? userMetrics.activeUsers.toLocaleString() : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              New this month: {isInitialized ? userMetrics.newUserAcquisitionRate.toLocaleString() : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash on Hand
            </CardTitle>
            <PiggyBank className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financials.cashOnHand < 0 && isInitialized ? 'text-destructive' : 'text-foreground'}`}>
               {isInitialized ? `${currencySymbol}${financials.cashOnHand.toLocaleString()}` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly Burn: {isInitialized ? `${currencySymbol}${financials.burnRate.toLocaleString()}` : "N/A"}
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
              Based on simulation progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <PerformanceChart title="Simulated Monthly Revenue" description={`Tracking revenue trends in ${currencySymbol} (${financials.currencyCode})`} dataKey="revenue" data={isInitialized ? historicalRevenue : []} />
        <PerformanceChart title="Simulated User Growth" description="Tracking user acquisition in your digital twin." dataKey="users" data={isInitialized ? historicalUserGrowth : []} />
        <PerformanceChart title="Monthly Burn Rate" description={`Cash burned per month in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalBurnRate : []} />
        <PerformanceChart title="Monthly Net Profit/Loss" description={`Net financial result per month in ${currencySymbol}`} dataKey="value" data={isInitialized ? historicalNetProfitLoss : []} />
      </div>
      
      <div className="mt-8">
         <ExpenseBreakdownChart data={isInitialized ? historicalExpenseBreakdown : []} currencySymbol={currencySymbol} />
      </div>
      
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Key Simulation Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isInitialized && keyEvents.length > 0 ? (
            <ul className="max-h-48 overflow-y-auto text-sm space-y-1 text-muted-foreground">
              {keyEvents.slice().reverse().map((event, index) => (
                <li key={index} className="border-b border-border/50 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0">{event}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{isInitialized ? "No key events recorded yet." : "Initialize simulation to see events."}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
