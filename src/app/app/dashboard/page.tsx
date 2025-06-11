
"use client";
import { useState, useEffect } from "react";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, TrendingUp, BarChartBig, Zap, ChevronsRight } from "lucide-react";
import type { DigitalTwinState } from "@/types/simulation";
import { initialDigitalTwinState, advanceMonth } from "@/simulation/engine"; // Mock engine

const initialRevenueData: { month: string; revenue: number; desktop: number }[] = [];
const initialUserGrowthData: { month: string; users: number; desktop: number }[] = [];

export default function DashboardPage() {
  const [currentSimState, setCurrentSimState] = useState<DigitalTwinState>(initialDigitalTwinState);
  const [revenueData, setRevenueData] = useState(initialRevenueData);
  const [userGrowthData, setUserGrowthData] = useState(initialUserGrowthData);

  const handleAdvanceMonth = () => {
    setCurrentSimState(prevState => {
      const newState = advanceMonth(prevState);
      // Basic historical data tracking for charts - highly simplified
      // In a real app, this would be more robust and potentially stored elsewhere
      setRevenueData(prevChartData => [
        ...prevChartData,
        { month: `M${newState.simulationMonth}`, revenue: newState.financials.revenue, desktop: newState.financials.revenue }
      ].slice(-12)); // Keep last 12 months
      setUserGrowthData(prevChartData => [
        ...prevChartData,
        { month: `M${newState.simulationMonth}`, users: newState.userMetrics.activeUsers, desktop: newState.userMetrics.activeUsers }
      ].slice(-12));
      return newState;
    });
  };
  
  // Effect to update chart data if currentSimState changes from an external source (e.g., after setup)
  // This is more for when the full simulation state management is in place
  useEffect(() => {
    if (currentSimState.simulationMonth === 0 && revenueData.length === 0 && userGrowthData.length === 0) {
      // Initial state, maybe set a baseline if needed or keep empty
    }
    // For now, chart data is updated directly in handleAdvanceMonth
  }, [currentSimState]);


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
                <Zap className="h-8 w-8 text-accent" />
                Digital Twin Dashboard
            </h1>
            <p className="text-muted-foreground">
            Overview of {currentSimState.companyName}'s performance. Month: {currentSimState.simulationMonth}
            </p>
        </div>
        <Button onClick={handleAdvanceMonth} className="bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
            Simulate Next Month <ChevronsRight className="ml-2 h-5 w-5"/>
        </Button>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue (Simulated)
            </CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${currentSimState.financials.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current Month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users (Simulated)
            </CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {currentSimState.userMetrics.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current Total
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash on Hand (Simulated)
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentSimState.financials.cashOnHand < 0 ? 'text-destructive' : 'text-foreground'}`}>
               ${currentSimState.financials.cashOnHand.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Burn Rate: ${currentSimState.financials.burnRate.toLocaleString()}/month
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
            <div className="text-2xl font-bold text-foreground">{currentSimState.startupScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Based on simulation progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <PerformanceChart title="Simulated Monthly Revenue" description="Tracking revenue trends in your digital twin." dataKey="revenue" data={revenueData} />
        <PerformanceChart title="Simulated User Growth" description="Tracking user acquisition in your digital twin." dataKey="users" data={userGrowthData} />
      </div>
      
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Key Simulation Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="max-h-48 overflow-y-auto text-sm space-y-1 text-muted-foreground">
            {currentSimState.keyEvents.slice().reverse().map((event, index) => (
              <li key={index} className="border-b border-border/50 pb-1 mb-1">{event}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
