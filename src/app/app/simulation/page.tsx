
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSimulationStore } from "@/store/simulationStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, Info, Construction, Zap, PackageOpen, Users, DollarSign, Brain, MinusCircle, PlusCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEFAULT_ENGINEER_SALARY = 5000; 

export default function SimulationPage() {
  const router = useRouter();
  const {
    isInitialized,
    resources,
    financials,
    simulationMonth,
    setMarketingSpend,
    setRndSpend,
    adjustTeamMemberCount,
  } = useSimulationStore();

  const [localMarketingSpend, setLocalMarketingSpend] = useState(resources.marketingSpend);
  const [localRndSpend, setLocalRndSpend] = useState(resources.rndSpend);

  useEffect(() => {
     if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  useEffect(() => {
    if (isInitialized) {
      setLocalMarketingSpend(resources.marketingSpend);
      setLocalRndSpend(resources.rndSpend);
    } else {
      setLocalMarketingSpend(0); // Default if not initialized
      setLocalRndSpend(0);
    }
  }, [resources.marketingSpend, resources.rndSpend, isInitialized]);

  const handleMarketingSpendChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setLocalMarketingSpend(isNaN(value) ? 0 : value);
  };
   const applyMarketingSpend = () => {
    if(isInitialized) setMarketingSpend(localMarketingSpend);
  };


  const handleRndSpendChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setLocalRndSpend(isNaN(value) ? 0 : value);
  };
  const applyRndSpend = () => {
    if(isInitialized) setRndSpend(localRndSpend);
  };


  const getTeamMemberCount = (role: string): number => {
    if(!isInitialized) return 0;
    const member = resources.team.find(m => m.role === role);
    return member ? member.count : 0;
  };

  const getTeamMemberSalary = (role: string): number => {
    if(!isInitialized) return 0;
    const member = resources.team.find(m => m.role === role);
    return member ? member.salary : 0;
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
          <Zap className="h-8 w-8 text-accent" />
          Decision Controls
        </h1>
        <p className="text-muted-foreground">
          Manage your startup's resources and make strategic decisions for your digital twin. Advance months on the Dashboard to see their impact.
        </p>
      </header>

      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Setup Simulation" page to initialize your digital twin before interacting with decision controls.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}
      
       {financials.cashOnHand <= 0 && isInitialized && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Game Over - Out of Cash!</AlertTitle>
          <AlertDescription>
            Your startup has run out of cash. Decision controls are disabled. Reset the simulation from the dashboard to try again.
          </AlertDescription>
        </Alert>
      )}


      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <PackageOpen className="h-6 w-6 text-primary" /> Your Business Digital Twin
              </CardTitle>
              <CardDescription>
                This space will dynamically render your simulated business environment in future updates. For now, make decisions below and see outcomes on your Dashboard after advancing months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex flex-col items-center justify-center text-muted-foreground p-8">
                <Construction className="h-16 w-16 mb-4 text-accent" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Dynamic Visualization Under Development</h3>
                <p className="text-center">
                  Interactive visualizations of your digital twin's market, operations, and finances are being built.
                </p>
                <p className="text-xs text-center mt-1">
                  Current key metrics are available on the Dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <SlidersHorizontal className="h-6 w-6 text-accent" />
              <CardTitle className="font-headline">Monthly Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="marketing-spend" className="flex items-center gap-2"><DollarSign className="h-4 w-4"/>Monthly Marketing Spend</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="marketing-spend"
                    type="number"
                    value={localMarketingSpend}
                    onChange={handleMarketingSpendChange}
                    onBlur={applyMarketingSpend}
                    min="0"
                    disabled={!isInitialized || financials.cashOnHand <= 0}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Current: ${isInitialized ? resources.marketingSpend.toLocaleString() : "N/A"}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rnd-spend" className="flex items-center gap-2"><Brain className="h-4 w-4"/>Monthly R&amp;D Spend</Label>
                 <div className="flex items-center gap-2">
                  <Input
                    id="rnd-spend"
                    type="number"
                    value={localRndSpend}
                    onChange={handleRndSpendChange}
                    onBlur={applyRndSpend}
                    min="0"
                    disabled={!isInitialized || financials.cashOnHand <= 0}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Current: ${isInitialized ? resources.rndSpend.toLocaleString() : "N/A"}</p>
              </div>
              
              <Separator />

              <div className="space-y-4">
                <Label className="flex items-center gap-2"><Users className="h-4 w-4"/>Team Management</Label>
                <div className="space-y-3">
                  {/* Engineer Management Example */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Engineers: {getTeamMemberCount("Engineer")}</p>
                      <p className="text-xs text-muted-foreground">Salary: ${DEFAULT_ENGINEER_SALARY.toLocaleString()}/mo each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustTeamMemberCount("Engineer", -1)}
                        disabled={!isInitialized || getTeamMemberCount("Engineer") === 0 || financials.cashOnHand <= 0}
                        aria-label="Reduce engineers"
                      >
                        <MinusCircle className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustTeamMemberCount("Engineer", 1, DEFAULT_ENGINEER_SALARY)}
                        disabled={!isInitialized || financials.cashOnHand <= 0}
                        aria-label="Hire engineer"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  {/* Add more roles here as needed */}
                   <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Founders: {getTeamMemberCount("Founder")}</p>
                      <p className="text-xs text-muted-foreground">Salary: ${getTeamMemberSalary("Founder").toLocaleString()}/mo each</p>
                    </div>
                    {/* Typically founders are not hired/fired this way in early simulation, but count is shown */}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-md border border-secondary mt-4">
                <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-secondary-foreground">
                  Make your monthly strategic adjustments here. Then, go to the <strong>Dashboard</strong> and click "Simulate Next Month" to see their impact.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
