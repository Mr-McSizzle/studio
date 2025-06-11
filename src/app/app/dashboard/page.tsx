
"use client";
import { useEffect } from "react";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, TrendingUp, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
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
    advanceMonth,
    resetSimulation,
  } = useSimulationStore();


  const handleAdvanceMonth = () => {
    if (isInitialized && financials.cashOnHand > 0) { // Prevent advancing if game over or not started
      advanceMonth();
    }
  };

  const handleReset = () => {
    // Could add a confirmation dialog here
    resetSimulation();
    // Potentially navigate to setup page: router.push('/app/setup');
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <CardTitle>Simulation Not Initialized</CardTitle>
          <AlertDescription>
            Please go to the "Setup Simulation" page to initialize your digital twin before viewing the dashboard.
          </AlertDescription>
        </Alert>
      )}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
                <Zap className="h-8 w-8 text-accent" />
                {companyName} - Digital Twin
            </h1>
            <p className="text-muted-foreground">
             Month: {simulationMonth}
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
          <CardTitle>Game Over - Out of Cash!</CardTitle>
          <AlertDescription>
            Your startup has run out of cash. Reset the simulation to try again or analyze what went wrong.
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
              ${financials.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              MRR: ${userMetrics.monthlyRecurringRevenue.toLocaleString()}
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
              {userMetrics.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              New this month: {userMetrics.newUserAcquisitionRate.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash on Hand
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financials.cashOnHand < 0 ? 'text-destructive' : 'text-foreground'}`}>
               ${financials.cashOnHand.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Burn Rate: ${financials.burnRate.toLocaleString()}/month
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
            <div className="text-2xl font-bold text-foreground">{startupScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Based on simulation progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <PerformanceChart title="Simulated Monthly Revenue" description="Tracking revenue trends in your digital twin." dataKey="revenue" data={historicalRevenue} />
        <PerformanceChart title="Simulated User Growth" description="Tracking user acquisition in your digital twin." dataKey="users" data={historicalUserGrowth} />
      </div>
      
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Key Simulation Events</CardTitle>
        </CardHeader>
        <CardContent>
          {keyEvents.length > 0 ? (
            <ul className="max-h-48 overflow-y-auto text-sm space-y-1 text-muted-foreground">
              {keyEvents.slice().reverse().map((event, index) => (
                <li key={index} className="border-b border-border/50 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0">{event}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No key events recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
