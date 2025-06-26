
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SlidersHorizontal, Users, PiggyBank, TrendingUp, Shield, Lightbulb } from "lucide-react";
import { agentsList } from "@/lib/agentsData";
import { useToast } from "@/hooks/use-toast";

export default function PostLaunchControlsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isInitialized, financials } = useSimulationStore();
  const [strategy, setStrategy] = useState("growth");
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [innovationRisk, setInnovationRisk] = useState([75]);

  const handleApplyForFunding = () => {
    toast({
      title: "Funding Round Initiated (Conceptual)",
      description: "In a full simulation, this would trigger a series of events related to investor meetings and due diligence.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
          <SlidersHorizontal className="h-8 w-8 text-accent" />
          Decision Control Room
        </h1>
        <p className="text-muted-foreground">
          Make high-level strategic decisions for your post-launch company. Changes here have significant, long-term impacts.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Strategic Pivot */}
        <Card className="shadow-lg xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Strategic Focus</CardTitle>
            <CardDescription>Direct your company's primary objective. This choice influences AI recommendations and simulation event weighting.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={strategy} onValueChange={setStrategy} className="space-y-3">
              <Label htmlFor="growth" className="flex items-center gap-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/10 cursor-pointer">
                <RadioGroupItem value="growth" id="growth" />
                <div>
                  <p className="font-semibold">Aggressive Growth</p>
                  <p className="text-xs text-muted-foreground">Prioritize user acquisition and market share expansion, even at the cost of short-term profitability.</p>
                </div>
              </Label>
              <Label htmlFor="profitability" className="flex items-center gap-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/10 cursor-pointer">
                <RadioGroupItem value="profitability" id="profitability" />
                <div>
                  <p className="font-semibold">Profitability & Efficiency</p>
                  <p className="text-xs text-muted-foreground">Focus on optimizing operations, increasing margins, and achieving sustainable profits.</p>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Capital & Funding */}
        <Card className="shadow-lg xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5 text-primary" />Capital & Funding</CardTitle>
            <CardDescription>Manage your company's financial runway and pursue investment opportunities.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full text-center p-10">
            <h3 className="text-4xl font-bold text-foreground">{financials.currencySymbol}{financials.cashOnHand.toLocaleString()}</h3>
            <p className="text-muted-foreground mb-6">Current Cash on Hand</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">Initiate Series A Funding Round</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-400" />EVE's Strategic Warning</AlertDialogTitle>
                  <AlertDialogDescription>
                    Initiating a funding round is a major commitment. It will consume significant founder time for the next 2-3 simulation months, potentially slowing product development. Success is not guaranteed and depends on your current metrics. Are you sure you wish to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApplyForFunding}>Yes, Seek Funding</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* AI Agent Management */}
        <Card className="shadow-lg xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />AI Agent Oversight</CardTitle>
            <CardDescription>Activate or deactivate specialized AI agents to align with your strategic focus. (Conceptual)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {agentsList.filter(a => a.id !== 'eve-hive-mind').map(agent => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <Label htmlFor={`agent-${agent.id}`} className="flex flex-col">
                  <span className="font-semibold">{agent.shortName}</span>
                  <span className="text-xs text-muted-foreground">{agent.title.replace('AI ', '')}</span>
                </Label>
                <Switch id={`agent-${agent.id}`} defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risk Calibration */}
        <Card className="shadow-lg xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Risk Calibration</CardTitle>
            <CardDescription>Adjust your company's tolerance for risk. This will influence the types of random events and opportunities presented in the simulation.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8 pt-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="market-risk">Market Risk Tolerance</Label>
                <span className="text-sm font-medium">{riskTolerance[0]}%</span>
              </div>
              <Slider id="market-risk" value={riskTolerance} onValueChange={setRiskTolerance} max={100} step={1} />
              <p className="text-xs text-muted-foreground mt-2">Higher tolerance may lead to more volatile market events but with greater potential upside.</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="innovation-risk">Innovation Risk Appetite</Label>
                <span className="text-sm font-medium">{innovationRisk[0]}%</span>
              </div>
              <Slider id="innovation-risk" value={innovationRisk} onValueChange={setInnovationRisk} max={100} step={1} />
              <p className="text-xs text-muted-foreground mt-2">Higher appetite increases chances for R&D breakthroughs but also for costly setbacks.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
