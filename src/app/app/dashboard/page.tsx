
"use client";
import { useState, useEffect } from "react";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, BarChartBig, Zap } from "lucide-react";

const initialRevenueData: { month: string; revenue: number; desktop: number }[] = [];
const initialUserGrowthData: { month: string; users: number; desktop: number }[] = [];

export default function DashboardPage() {
  const [totalRevenue, setTotalRevenue] = useState<string | number>("N/A");
  const [activeUsers, setActiveUsers] = useState<string | number>("N/A");
  const [burnRate, setBurnRate] = useState<string | number>("N/A");
  const [startupScore, setStartupScore] = useState<string>("N/A");
  const [revenueData, setRevenueData] = useState(initialRevenueData);
  const [userGrowthData, setUserGrowthData] = useState(initialUserGrowthData);

  useEffect(() => {
    // In a real application, this data would be fetched from the live simulation state
    // or updated via events from the simulation engine.
    // For example:
    // const simulationState = getSimulationState(); // Fictional function
    // setTotalRevenue(simulationState.financials.totalRevenue);
    // setActiveUsers(simulationState.metrics.activeUsers);
    // setBurnRate(simulationState.financials.burnRate);
    // setStartupScore(`${simulationState.gamification.score}/100`);
    // setRevenueData(formatChartData(simulationState.historicalData.revenue));
    // setUserGrowthData(formatChartData(simulationState.historicalData.userGrowth));
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
            <Zap className="h-8 w-8 text-accent" />
            Digital Twin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your startup's performance within the ForgeSim simulation. All data reflects the current state of your digital twin.
        </p>
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
              {typeof totalRevenue === 'number' ? `$${totalRevenue.toLocaleString()}` : totalRevenue}
            </div>
            <p className="text-xs text-muted-foreground">
              Updates from simulation
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
              {typeof activeUsers === 'number' ? `+${activeUsers.toLocaleString()}` : activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Updates from simulation
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Burn Rate (Simulated)
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
               {typeof burnRate === 'number' ? `$${burnRate.toLocaleString()}` : burnRate}
            </div>
            <p className="text-xs text-muted-foreground">
              Updates from simulation
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
            <div className="text-2xl font-bold text-foreground">{startupScore}</div>
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
    </div>
  );
}
