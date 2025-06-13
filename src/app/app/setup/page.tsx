
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { promptStartup, type PromptStartupInput, type PromptStartupOutput } from "@/ai/flows/prompt-startup";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle, Lightbulb, Rocket, FileText, Activity, Target, DollarSign, TrendingUp, Percent, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function SetupSimulationPage() {
  const [startupName, setStartupName] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [budget, setBudget] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [targetGrowthRate, setTargetGrowthRate] = useState("");
  const [desiredProfitMargin, setDesiredProfitMargin] = useState("");
  const [targetCAC, setTargetCAC] = useState("");

  const [simulationOutput, setSimulationOutput] = useState<PromptStartupOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const initializeSimulationInStore = useSimulationStore(state => state.initializeSimulation);
  const resetSimStore = useSimulationStore(state => state.resetSimulation);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupName.trim() || !targetMarket.trim() || !budget.trim() || !currencyCode.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide your startup name/idea, target market, initial budget, and currency code.",
        variant: "destructive",
      });
      return;
    }
    if (currencyCode.trim().length !== 3) {
      toast({
        title: "Invalid Currency Code",
        description: "Currency code should be 3 letters (e.g., USD, EUR).",
        variant: "destructive",
      });
      return;
    }
    if (targetGrowthRate && isNaN(parseFloat(targetGrowthRate))) {
      toast({ title: "Invalid Input", description: "Target Growth Rate must be a number.", variant: "destructive" }); return;
    }
    if (desiredProfitMargin && isNaN(parseFloat(desiredProfitMargin))) {
      toast({ title: "Invalid Input", description: "Desired Profit Margin must be a number.", variant: "destructive" }); return;
    }
    if (targetCAC && isNaN(parseFloat(targetCAC))) {
      toast({ title: "Invalid Input", description: "Target CAC must be a number.", variant: "destructive" }); return;
    }


    setIsLoading(true);
    setError(null);
    setSimulationOutput(null);
    resetSimStore();

    const fullPromptForAI = `
      Business Plan / Idea: ${startupName}
      Target Market: ${targetMarket}
      Initial Budget: ${budget}
      Preferred Currency: ${currencyCode.toUpperCase()}
      ${targetGrowthRate ? `Target Monthly User Growth Rate: ${targetGrowthRate}%` : ''}
      ${desiredProfitMargin ? `Desired Profit Margin: ${desiredProfitMargin}%` : ''}
      ${targetCAC ? `Target Customer Acquisition Cost (CAC): ${currencyCode.toUpperCase()} ${targetCAC}` : ''}
    `;

    try {
      const input: PromptStartupInput = {
        prompt: fullPromptForAI,
        currencyCode: currencyCode.toUpperCase(),
        targetGrowthRate: targetGrowthRate || undefined,
        desiredProfitMargin: desiredProfitMargin || undefined,
        targetCAC: targetCAC || undefined,
      };
      const result = await promptStartup(input);
      setSimulationOutput(result);

      initializeSimulationInStore(result, startupName, targetMarket, budget, currencyCode.toUpperCase());

      toast({
        title: "Digital Twin Initialized!",
        description: "Your simulation is ready. Redirecting to dashboard...",
      });
      router.push("/app/dashboard");
    } catch (err) {
      console.error("Error initializing startup simulation:", err);
      let userFriendlyMessage = "Failed to initialize simulation. The AI might be unavailable or returned an unexpected response. Please try again.";

      if (err instanceof Error) {
        const errorMessageLower = err.message.toLowerCase();
        if (errorMessageLower.includes("503") ||
            errorMessageLower.includes("service unavailable") ||
            errorMessageLower.includes("googlegenerativeai error") ||
            errorMessageLower.includes("visibility check was unavailable") ||
            errorMessageLower.includes("resource has been exhausted") ||
            errorMessageLower.includes("model_error") ||
            errorMessageLower.includes("api key not valid")) {
          userFriendlyMessage = `The AI simulation service is temporarily unavailable or experiencing high load. This could be due to a 503 error, resource exhaustion, or an API key issue. Please try again shortly or check your AI service configuration. Details: ${err.message}`;
        } else {
          userFriendlyMessage = `Failed to initialize simulation. Details: ${err.message}`;
        }
      } else {
        userFriendlyMessage = `An unknown error occurred during simulation initialization. Please try again.`;
      }

      setError(userFriendlyMessage);
      toast({
        title: "Error Initializing Simulation",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const prettyPrintJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  const parseChallenges = (challengesString: string | undefined): string[] => {
    if (!challengesString) return ["No challenges suggested."];
    try {
      const parsed = JSON.parse(challengesString);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed.length > 0 ? parsed : ["No specific challenges listed by AI."];
      }
      return ["Invalid challenges format: Expected a JSON array of strings."];
    } catch (e) {
      return ["Error parsing challenges: AI response might be malformed."];
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
          <Rocket className="h-8 w-8 text-accent" />
          Initialize Your Digital Twin
        </h1>
        <p className="text-muted-foreground">
          Describe your startup's core concept, target market, initial budget, and preferred currency. ForgeSim's AI will generate the initial scenario. Include specific goals for a more tailored simulation.
        </p>
      </header>

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Define Your Startup Venture</CardTitle>
          <CardDescription>
            Provide details about your business concept. The more specific you are, the more tailored your simulation's starting point will be.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="startup-name" className="text-sm font-medium mb-2 block flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground"/> Startup Name / Business Idea Summary
              </Label>
              <Textarea
                id="startup-name"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="e.g., 'ForgePress' - A SaaS platform for small businesses to manage social media with AI content suggestions..."
                rows={5}
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="target-market" className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground"/> Target Market
              </Label>
              <Input
                id="target-market"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder="e.g., Local coffee shops and independent retailers in urban areas with annual revenue < $500k."
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="budget" className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground"/> Initial Budget (Numerical Value)
                </Label>
                <Input
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., 50000"
                  type="number"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="currency-code" className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground"/> Currency Code (3 Letters)
                </Label>
                <Input
                  id="currency-code"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  placeholder="e.g., USD, EUR, JPY"
                  maxLength={3}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Card className="bg-card/50 border-dashed">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent"/> Define Initial Goals (Optional)</CardTitle>
                <CardDescription>Help the AI tailor the initial simulation challenges and parameters.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="target-growth-rate" className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground"/> Target Monthly User Growth Rate (%)
                  </Label>
                  <Input
                    id="target-growth-rate"
                    value={targetGrowthRate}
                    onChange={(e) => setTargetGrowthRate(e.target.value)}
                    placeholder="e.g., 20 for 20%"
                    type="number"
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="desired-profit-margin" className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground"/> Desired Profit Margin (%)
                  </Label>
                  <Input
                    id="desired-profit-margin"
                    value={desiredProfitMargin}
                    onChange={(e) => setDesiredProfitMargin(e.target.value)}
                    placeholder="e.g., 15 for 15%"
                    type="number"
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="target-cac" className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground"/> Target CAC ({currencyCode || 'USD'})
                  </Label>
                  <Input
                    id="target-cac"
                    value={targetCAC}
                    onChange={(e) => setTargetCAC(e.target.value)}
                    placeholder="e.g., 25"
                    type="number"
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>


            <Button
              type="submit"
              disabled={isLoading || !startupName.trim() || !targetMarket.trim() || !budget.trim() || !currencyCode.trim() || currencyCode.trim().length !== 3}
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Digital Twin...
                </>
              ) : (
                "Initialize Simulation"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Generating Scenario</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {simulationOutput && !isLoading && (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 mt-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Digital Twin: Initial Conditions (AI Generated)</CardTitle>
              <CardDescription>This JSON outlines the AI's suggested starting state for your simulation. This has been used to initialize your digital twin.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                  {prettyPrintJson(simulationOutput.initialConditions)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Potential Early Challenges (AI Suggested)</CardTitle>
              <CardDescription>Foreseen hurdles your digital twin might encounter. These have been noted in your simulation.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                {parseChallenges(simulationOutput.suggestedChallenges).length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2 bg-muted p-4 rounded-md text-sm">
                    {parseChallenges(simulationOutput.suggestedChallenges).map((challenge, index) => (
                      <li key={index} className="leading-relaxed">{challenge}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No specific challenges listed by AI.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && !simulationOutput && !error && (
         <Card className="shadow-lg text-center py-12 border-dashed bg-card/50">
          <CardContent>
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Define your startup venture above and click "Initialize Simulation" to have the AI generate its digital twin parameters and initial challenges.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
