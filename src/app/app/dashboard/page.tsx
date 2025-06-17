"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, TrendingUp, BarChartBig, Zap, ChevronsRight, RefreshCcw, AlertTriangle, TrendingDown, PiggyBank, Brain, Loader2, Activity, Globe, Target, Flame, Sparkles, Shield, Rocket, Info, Search } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StructuredKeyEvent } from "@/types/simulation";

// 3D Globe Component
const Globe3D = () => {
  return (
    <div className="relative w-full h-full aspect-square max-w-[600px] mx-auto">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-subtle-pulse"></div>
      <div className="absolute inset-0 bg-accent/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      
      {/* Globe container with 3D-like styling */}
      <div className="relative w-full h-full rounded-full overflow-hidden border border-accent/20 shadow-accent-glow-lg">
        {/* Base globe gradient - deep blue like the reference */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#040420] via-[#0a1035] to-[#040420]"></div>
        
        {/* Globe grid lines - horizontal */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={`h-${i}`} 
            className="absolute w-full h-[1px] bg-accent/10"
            style={{ 
              top: `${10 + i * 7}%`, 
              transform: `rotateX(${70 - i * 12}deg)`,
              opacity: i > 3 && i < 9 ? 0.15 : 0.05
            }}
          ></div>
        ))}
        
        {/* Globe grid lines - vertical */}
        {[...Array(18)].map((_, i) => (
          <div 
            key={`v-${i}`} 
            className="absolute h-full w-[1px] bg-accent/10"
            style={{ 
              left: `${5.5 * i}%`, 
              transform: `rotateY(${i * 20}deg)`,
              opacity: i > 4 && i < 14 ? 0.15 : 0.05
            }}
          ></div>
        ))}
        
        {/* North America */}
        <div className="absolute top-[25%] left-[20%] w-[25%] h-[15%] bg-accent/30 rounded-full blur-md"></div>
        
        {/* South America */}
        <div className="absolute top-[45%] left-[30%] w-[15%] h-[15%] bg-accent/25 rounded-full blur-md"></div>
        
        {/* Europe */}
        <div className="absolute top-[28%] left-[45%] w-[12%] h-[8%] bg-primary/30 rounded-full blur-md"></div>
        
        {/* Africa */}
        <div className="absolute top-[40%] left-[48%] w-[18%] h-[18%] bg-accent/20 rounded-full blur-md"></div>
        
        {/* Asia */}
        <div className="absolute top-[30%] left-[60%] w-[22%] h-[20%] bg-primary/25 rounded-full blur-md"></div>
        
        {/* Australia */}
        <div className="absolute top-[55%] left-[75%] w-[12%] h-[10%] bg-accent/20 rounded-full blur-md"></div>
        
        {/* Data points/nodes - more of them, like in the reference */}
        {[...Array(24)].map((_, i) => (
          <div 
            key={`node-${i}`} 
            className={`absolute w-${i % 3 === 0 ? 2 : 1.5} h-${i % 3 === 0 ? 2 : 1.5} rounded-full ${i % 3 === 0 ? 'bg-accent' : 'bg-primary/80'} animate-pulse`}
            style={{ 
              top: `${15 + Math.random() * 70}%`, 
              left: `${15 + Math.random() * 70}%`,
              animationDelay: `${i * 0.2}s`,
              zIndex: 5
            }}
          ></div>
        ))}
        
        {/* Connection lines between nodes - more complex network */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M30,30 Q50,50 70,40" stroke="hsla(var(--accent)/0.3)" fill="none" strokeWidth="0.2" />
          <path d="M25,60 Q40,50 60,70" stroke="hsla(var(--primary)/0.3)" fill="none" strokeWidth="0.2" />
          <path d="M70,30 Q50,40 40,60" stroke="hsla(var(--accent)/0.2)" fill="none" strokeWidth="0.2" />
          <path d="M20,40 Q30,30 50,20" stroke="hsla(var(--primary)/0.2)" fill="none" strokeWidth="0.2" />
          <path d="M80,50 Q60,60 40,70" stroke="hsla(var(--accent)/0.25)" fill="none" strokeWidth="0.2" />
          <path d="M65,25 Q75,45 85,65" stroke="hsla(var(--primary)/0.2)" fill="none" strokeWidth="0.2" />
          <path d="M15,45 Q25,65 45,75" stroke="hsla(var(--accent)/0.15)" fill="none" strokeWidth="0.2" />
        </svg>
        
        {/* Highlight/glow effect on top */}
        <div className="absolute top-0 left-[10%] w-[80%] h-[30%] bg-gradient-to-b from-accent/10 to-transparent rounded-full blur-lg"></div>
        
        {/* Central pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
      </div>
      
      {/* Data flow animations around the globe */}
      <div className="absolute top-0 left-0 w-full h-full">
        {[...Array(8)].map((_, i) => (
          <div 
            key={`flow-${i}`} 
            className={`absolute w-1 h-1 ${i % 2 === 0 ? 'bg-accent' : 'bg-primary/80'} rounded-full animate-orbit`}
            style={{ 
              animationDuration: `${15 + i * 3}s`, 
              animationDelay: `${i * 1.5}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Overlay stats - matching the reference image */}
      <div className="absolute bottom-[15%] left-[10%] bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-accent/30">
        <div className="text-xs text-accent font-mono">PARCELS IN THE WAY</div>
        <div className="text-lg font-bold">24/75</div>
        <div className="text-xs text-green-400 flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          +15% vs last month
        </div>
      </div>
      
      <div className="absolute top-[15%] right-[10%] bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-primary/30">
        <div className="text-xs text-primary font-mono">TOTAL ORDERS</div>
        <div className="text-lg font-bold">2.4k+</div>
        <div className="flex items-center mt-1">
          <div className="h-1 flex-grow bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full w-[62%] bg-green-500 rounded-full"></div>
          </div>
          <span className="text-xs text-green-400 ml-2">62%</span>
        </div>
      </div>
      
      {/* Bottom right circular stats like in reference */}
      <div className="absolute bottom-[15%] right-[10%] flex items-center gap-3">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsla(var(--border)/0.3)" strokeWidth="2"></circle>
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsla(var(--accent)/0.8)" strokeWidth="2" strokeDasharray="100" strokeDashoffset="25"></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">75%</div>
        </div>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsla(var(--border)/0.3)" strokeWidth="2"></circle>
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsla(var(--muted-foreground)/0.5)" strokeWidth="2" strokeDasharray="100" strokeDashoffset="75"></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">25%</div>
        </div>
      </div>
      
      {/* Search bar like in reference */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-md border border-border/50 flex items-center px-2 py-1 w-[180px]">
        <Search className="h-3.5 w-3.5 text-muted-foreground mr-2" />
        <div className="text-xs text-muted-foreground">Search</div>
      </div>
      
      {/* Status indicators like in reference */}
      <div className="absolute top-[5%] right-[5%] flex items-center gap-2">
        <div className="bg-blue-500 rounded-md p-1.5">
          <div className="h-3.5 w-3.5 text-white"></div>
        </div>
        <div className="bg-muted/30 rounded-md p-1.5 flex items-center gap-1">
          <div className="h-2 w-2 bg-accent rounded-full"></div>
          <span className="text-xs text-white">10</span>
        </div>
      </div>
      
      {/* Left side metrics like in reference */}
      <div className="absolute left-[5%] top-[40%] space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-md">
            <div className="h-4 w-4"></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">On the way</div>
            <div className="text-sm font-bold">18.7k</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-500 p-1.5 rounded-md">
            <div className="h-4 w-4"></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Delivered</div>
            <div className="text-sm font-bold">52.4k+</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 p-1.5 rounded-md">
            <div className="h-4 w-4"></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Waiting</div>
            <div className="text-sm font-bold">8.3k+</div>
          </div>
        </div>
      </div>
    </div>
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
    resources,
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

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showXpGain, setShowXpGain] = useState(false);

  const currencySymbol = financials.currencySymbol || "$"; 

  useEffect(() => {
    if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  const handleAdvanceMonth = () => {
    if (isInitialized && financials.cashOnHand > 0) {
      advanceMonth();
      // Show XP gain animation
      setShowXpGain(true);
      setTimeout(() => setShowXpGain(false), 2000);
      
      // Show level up animation if appropriate (e.g., every 3 months)
      if ((simulationMonth + 1) % 3 === 0) {
        setTimeout(() => {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 3000);
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    resetSimulation();
    router.push('/app/setup');
  };

  if (typeof simulationMonth === 'number' && simulationMonth === 0 && !isInitialized) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Mission Not Started</AlertTitle>
            <AlertDescription>
                Please go to the Launch Pad to initialize your digital twin. Redirecting...
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLowCash = isInitialized && financials.cashOnHand > 0 && financials.burnRate > 0 && financials.cashOnHand < (2 * financials.burnRate);
  const healthScore = Math.min(100, Math.max(0, (financials.cashOnHand / (financials.burnRate * 3)) * 100));

  // Calculate level based on startup score
  const level = Math.max(1, Math.floor(startupScore / 10));
  const xpProgress = (startupScore % 10) * 10; // Convert to percentage

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">
      {!isInitialized && (
        <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Mission Not Started</AlertTitle>
          <AlertDescription>
            Please go to the Launch Pad to initialize your digital twin before accessing the command center.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2 game-button" size="sm">Go to Launch Pad</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-accent/20 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-yellow-400 shadow-lg animate-subtle-pulse">
                  <Globe className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h1 className="text-4xl font-headline font-bold text-foreground">
                    {isInitialized ? companyName : "ForgeSim"} 
                    <span className="text-glow-accent"> Command Center</span>
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="level" className="text-sm">
                      <Rocket className="h-3 w-3 mr-1" />
                      Month {isInitialized ? simulationMonth : "N/A"}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <DollarSign className="h-3 w-3 mr-1" />
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
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3 text-primary" />
                      Startup Health
                    </span>
                    <span className="font-medium">{Math.round(healthScore)}%</span>
                  </div>
                  <Progress 
                    value={healthScore} 
                    className="h-3"
                    indicatorClassName={cn(
                      "bg-gradient-to-r",
                      healthScore > 70 ? "from-green-400 to-green-600" :
                      healthScore > 40 ? "from-yellow-400 to-yellow-600" : "from-red-400 to-red-600"
                    )}
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleAdvanceMonth} 
                className="game-button text-black font-bold shadow-lg hover:shadow-accent-glow-sm transition-all duration-200" 
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

      {/* Level and XP Display */}
      {isInitialized && (
        <div className="relative">
          <Card className="game-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-accent to-yellow-400 shadow-lg">
                    <Sparkles className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Founder Level {level}</h3>
                    <div className="text-xs text-muted-foreground">
                      {level < 3 ? "Novice Entrepreneur" : 
                       level < 6 ? "Emerging Visionary" : 
                       level < 9 ? "Seasoned Innovator" : "Legendary Founder"}
                    </div>
                  </div>
                </div>
                <Badge variant="xp" className="text-sm">
                  {startupScore} Startup Points
                </Badge>
              </div>
              
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress to Level {level + 1}</span>
                  <span>{10 - (startupScore % 10)} points needed</span>
                </div>
                <Progress 
                  value={xpProgress} 
                  className="h-2.5"
                  indicatorClassName="bg-gradient-to-r from-accent to-yellow-400"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* XP Gain Animation */}
          {showXpGain && (
            <div className="absolute top-0 right-4 animate-ping-once">
              <Badge variant="xp" className="text-sm font-bold">
                +10 XP
              </Badge>
            </div>
          )}
          
          {/* Level Up Animation */}
          {showLevelUp && (
            <div className="absolute top-0 left-0 right-0 flex justify-center animate-level-up">
              <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-lg shadow-lg">
                <span className="text-white font-bold">🎉 LEVEL UP! 🎉</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard Content with 3D Globe */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Key Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="game-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-green-600">
                <DollarSign className="h-4 w-4 text-white" />
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

          <Card className="game-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600">
                <Users className="h-4 w-4 text-white" />
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

          <Card className={cn("game-card", 
            isLowCash ? "border-yellow-500/30" : "border-purple-500/20"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cash Reserves
              </CardTitle>
              <div className={cn("p-2 rounded-lg", 
                isLowCash 
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600" 
                  : "bg-gradient-to-br from-purple-400 to-purple-600"
              )}>
                <PiggyBank className="h-4 w-4 text-white" />
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

          <Card className="game-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Startup Score
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-yellow-400">
                <BarChartBig className="h-4 w-4 text-black" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{isInitialized ? startupScore : "0"}/100</div>
              <div className="mt-2">
                <Progress 
                  value={isInitialized ? startupScore : 0} 
                  className="h-2.5"
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

        {/* Center Column - 3D Globe */}
        <div className="lg:col-span-1">
          <Card className="game-card h-full flex flex-col bg-[#040420] border-accent/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">Map</div>
                  <div className="text-xs text-muted-foreground">/</div>
                  <div className="text-xs text-muted-foreground">Departments</div>
                  <div className="text-xs text-muted-foreground">/</div>
                  <div className="text-xs text-accent">Status</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Income: {currencySymbol}42,475
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Expenses: {currencySymbol}27,983
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-0 relative">
              <Globe3D />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Reasoning and Product */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Reasoning Card */}
          <Card className="game-card">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-red-400">
                  <Brain className="h-5 w-5 text-white"/>
                </div>
                Hive Mind Intelligence
              </CardTitle>
              <CardDescription>AI's real-time analysis and reasoning for month {simulationMonth}.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[80px] relative overflow-hidden">
              {/* Animated background for AI section */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-background-pan opacity-30" />
              
              {currentAiReasoning && currentAiReasoning.includes("simulating month...") ? (
                  <div className="flex items-center gap-3 text-muted-foreground relative z-10">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-sm">{currentAiReasoning}</p>
                  </div>
              ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed relative z-10">
                    {currentAiReasoning || "AI intelligence is monitoring your simulation. Advance a month to see strategic insights."}
                  </p>
              )}
            </CardContent>
          </Card>

          {/* Quantity Card - like in reference */}
          <Card className="game-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Quantity</CardTitle>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Average by category
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-32">
                <div className="h-[39.7%] w-12 bg-blue-500 rounded-t-md"></div>
                <div className="h-[25.3%] w-12 bg-green-500 rounded-t-md"></div>
                <div className="h-[44.5%] w-12 bg-purple-500 rounded-t-md"></div>
                <div className="h-[17.4%] w-12 bg-yellow-500 rounded-t-md"></div>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-2">
                <div className="text-xs text-center text-muted-foreground">39.7%</div>
                <div className="text-xs text-center text-muted-foreground">25.3%</div>
                <div className="text-xs text-center text-muted-foreground">44.5%</div>
                <div className="text-xs text-center text-muted-foreground">17.4%</div>
              </div>
              
              {/* Status indicators like in reference */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">On the way</span>
                  </div>
                  <span>1hr 24 min</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">Loading</span>
                  </div>
                  <span>1hr 35 min</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-muted-foreground">Unloading</span>
                  </div>
                  <span>2hr 17 min</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-muted-foreground">Waiting</span>
                  </div>
                  <span>1hr 24 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Bottom Section - Stats and Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - PARCELS Stats */}
        <Card className="game-card">
          <CardHeader>
            <CardTitle className="text-lg uppercase font-bold">PARCELS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground">Monthly</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">32,540</div>
                  <Badge variant="success" className="text-xs">+40%</Badge>
                </div>
                <div className="text-xs text-muted-foreground">Compared to 23,145 last month</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Yearly</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">1,387,456</div>
                  <Badge variant="success" className="text-xs">+12%</Badge>
                </div>
                <div className="text-xs text-muted-foreground">Compared to 1,235,678 last year</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right Column - Events Timeline */}
        <Card className="game-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-yellow-400">
                <Activity className="h-5 w-5 text-black"/>
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
                    <li key={event.id} className="relative p-4 rounded-lg bg-gradient-to-r from-background to-accent/5 border border-accent/10 hover:border-accent/30 transition-all duration-200 hover:shadow-accent-glow-sm">
                      {/* Event connector line */}
                      {index < keyEvents.length - 1 && (
                        <div className="absolute left-4 top-[calc(100%+1px)] w-0.5 h-3 bg-gradient-to-b from-accent/30 to-transparent"></div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          event.impact === 'Positive' ? "bg-gradient-to-br from-green-400 to-green-600" :
                          event.impact === 'Negative' ? "bg-gradient-to-br from-red-400 to-red-600" : 
                          "bg-gradient-to-br from-yellow-400 to-yellow-600"
                        )}>
                          {event.impact === 'Positive' ? 
                            <Zap className="h-4 w-4 text-white" /> : 
                            event.impact === 'Negative' ? 
                            <AlertTriangle className="h-4 w-4 text-white" /> : 
                            <Info className="h-4 w-4 text-white" />
                          }
                        </div>
                        
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
                            
                            {event.impact === 'Positive' && (
                              <Badge variant="xp" className="text-xs ml-auto">
                                +5 XP
                              </Badge>
                            )}
                          </div>
                          <p className="text-foreground/90">{event.description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
                <p>{isInitialized ? "No mission events recorded yet." : "Initialize simulation to see your startup's journey."}</p>
                <p className="text-xs mt-2">Advance months to create your story</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}