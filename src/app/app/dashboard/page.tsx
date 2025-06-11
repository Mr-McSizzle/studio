import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, BarChartBig } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 1200 }, { month: "Feb", revenue: 1800 },
  { month: "Mar", revenue: 1500 }, { month: "Apr", revenue: 2200 },
  { month: "May", revenue: 2500 }, { month: "Jun", revenue: 3000 },
];

const userGrowthData = [
  { month: "Jan", users: 50 }, { month: "Feb", users: 75 },
  { month: "Mar", users: 110 }, { month: "Apr", users: 150 },
  { month: "May", users: 200 }, { month: "Jun", users: 270 },
];


export default function DashboardPage() {
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
            <div className="text-2xl font-bold text-foreground">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
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
            <div className="text-2xl font-bold text-foreground">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
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
            <div className="text-2xl font-bold text-foreground">-$5,231.40</div>
            <p className="text-xs text-muted-foreground">
              -2% from last month
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
            <div className="text-2xl font-bold text-foreground">78/100</div>
            <p className="text-xs text-muted-foreground">
              Trending upwards
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <PerformanceChart title="Monthly Revenue" description="Tracking revenue over the last 6 months." dataKey="revenue" data={revenueData.map(item => ({...item, desktop: item.revenue}))} />
        <PerformanceChart title="User Growth" description="Tracking new user acquisition." dataKey="users" data={userGrowthData.map(item => ({...item, desktop: item.users}))} />
      </div>
    </div>
  );
}
