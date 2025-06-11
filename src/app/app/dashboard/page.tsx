
"use client";
import { useState, useEffect } from "react";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, BarChartBig } from "lucide-react";

// Initialize with empty data or a loading state
const initialRevenueData: { month: string; revenue: number; desktop: number }[] = [];
const initialUserGrowthData: { month: string; users: number; desktop: number }[] = [];

export default function DashboardPage() {
  // In a real app, this data would come from state management or API calls
  const [totalRevenue, setTotalRevenue] = useState<string | number>("N/A");
  const [activeUsers, setActiveUsers] = useState<string | number>("N/A");
  const [burnRate, setBurnRate] = useState<string | number>("N/A");
  const [startupScore, setStartupScore] = useState<string>("N/A");
  const [revenueData, setRevenueData] = useState(initialRevenueData);
  const [userGrowthData, setUserGrowthData] = useState(initialUserGrowthData);

  // Placeholder for fetching/updating data
  useEffect(() => {
    // Example: Fetch data here and update state
    // For now, we'll keep it as N/A or empty
    // setTotalRevenue(45231.89);
    // setActiveUsers(2350);
    // setBurnRate(-5231.40);
    // setStartupScore("78/100");
    // setRevenueData([
    //   { month: "Jan", revenue: 1200, desktop: 1200 }, { month: "Feb", revenue: 1800, desktop: 1800 },
    //   { month: "Mar", revenue: 1500, desktop: 1500 }, { month: "Apr", revenue: 2200, desktop: 2200 },
    //   { month: "May", revenue: 2500, desktop: 2500 }, { month: "Jun", revenue: 3000, desktop: 3000 },
    // ]);
    // setUserGrowthData([
    //   { month: "Jan", users: 50, desktop: 50 }, { month: "Feb", users: 75, desktop: 75 },
    //   { month: "Mar", users: 110, desktop: 110 }, { month: "Apr", users: 150, desktop: 150 },
    //   { month: "May", users: 200, desktop: 200 }, { month: "Jun", users: 270, desktop: 270 },
    // ]);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-headline mb-8 text-foreground">Performance Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {typeof totalRevenue === 'number' ? `$${totalRevenue.toLocaleString()}` : totalRevenue}
            </div>
            <p className="text-xs text-muted-foreground">
              Updates dynamically
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
              {typeof activeUsers === 'number' ? `+${activeUsers.toLocaleString()}` : activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Updates dynamically
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Burn Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
               {typeof burnRate === 'number' ? `$${burnRate.toLocaleString()}` : burnRate}
            </div>
            <p className="text-xs text-muted-foreground">
              Updates dynamically
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
              Updates dynamically
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <PerformanceChart title="Monthly Revenue" description="Tracking revenue over time." dataKey="revenue" data={revenueData} />
        <PerformanceChart title="User Growth" description="Tracking new user acquisition." dataKey="users" data={userGrowthData} />
      </div>
    </div>
  );
}
