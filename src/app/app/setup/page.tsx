
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { promptStartup, type PromptStartupInput, type PromptStartupOutput } from "@/ai/flows/prompt-startup";
import { suggestNames, type SuggestNamesInput, type SuggestNamesOutput } from "@/ai/flows/suggest-names-flow";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle, Lightbulb, Rocket, FileText, Activity, Target, DollarSign, TrendingUp, Percent, Users, MessageSquare, FileSignature, Brain, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CinematicSetupOverlay } from "@/components/setup/CinematicSetupOverlay"; // New Import

const initializationSteps = [
  "Initializing Digital Twin Core...",
  "Calibrating Quantum Entanglement...",
  "Linking Neural Network...",
  "Establishing Hive Mind Connection...",
  "Awakening AI Consciousness...",
];
const eveFinalMessage = "Twin activated. Let’s begin shaping your future.";


export default function SetupSimulationPage() {
  const [startupNameIdea, setStartupNameIdea] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [budget, setBudget] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [targetGrowthRate, setTargetGrowthRate] = useState("");
  const [desiredProfitMargin, setDesiredProfitMargin] = useState("");
  const [targetCAC, setTargetCAC] = useState("");

  const [initialTeamSetupNotes, setInitialTeamSetupNotes] = useState("");
  const [initialProductFeatures, setInitialProductFeatures] = useState("");
  const [initialIP, setInitialIP] = useState("");

  const [simulationOutput, setSimulationOutput] = useState<PromptStartupOutput | null>(null);
  const [isLoadingAiCall, setIsLoadingAiCall] = useState(false); // Renamed from isLoading
  const [error, setError] = useState<string | null>(null);
  const [isSuggestingNames, setIsSuggestingNames] = useState(false);

  // State for cinematic overlay
  const [showCinematicOverlay, setShowCinematicOverlay] = useState(false);
  const [cinematicProgressText, setCinematicProgressText] = useState("");
  const [showEveInOverlay, setShowEveInOverlay] = useState(false);
  const [cinematicStepIndex, setCinematicStepIndex] = useState(0);

  const { toast } = useToast();
  const router = useRouter();
  const initializeSimulationInStore = useSimulationStore(state => state.initializeSimulation);
  const resetSimStore = useSimulationStore(state => state.resetSimulation);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCinematicOverlay && !showEveInOverlay && cinematicStepIndex < initializationSteps.length) {
      setCinematicProgressText(initializationSteps[cinematicStepIndex]);
      timer = setTimeout(() => {
        setCinematicStepIndex(prev => prev + 1);
      }, 2000); // Duration for each text step
    } else if (showCinematicOverlay && !showEveInOverlay && cinematicStepIndex >= initializationSteps.length) {
      // All text steps done, prepare to show EVE
      timer = setTimeout(() => {
        setShowEveInOverlay(true);
        setCinematicProgressText(eveFinalMessage); // This text is now handled by CinematicSetupOverlay via eveMessage
      }, 1000); // Delay before EVE appears
    }
    return () => clearTimeout(timer);
  }, [showCinematicOverlay, cinematicStepIndex, showEveInOverlay]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupNameIdea.trim() || !targetMarket.trim() || !budget.trim() || !currencyCode.trim()) {
      toast({ title: "Input Required", description: "Please provide your startup name/idea, target market, initial budget, and currency code.", variant: "destructive" });
      return;
    }
    // ... (rest of the validation logic) ...

    setIsLoadingAiCall(true);
    setShowCinematicOverlay(true); // Start cinematic overlay
    setCinematicStepIndex(0); // Reset cinematic steps
    setShowEveInOverlay(false);
    setError(null);
    setSimulationOutput(null);
    resetSimStore();

    const fullPromptForAI = `
      Business Plan / Idea: ${startupNameIdea}
      Target Market: ${targetMarket}
      Initial Budget: ${budget}
      Preferred Currency: ${currencyCode.toUpperCase()}
      ${targetGrowthRate ? `Target Monthly User Growth Rate: ${targetGrowthRate}%` : ''}
      ${desiredProfitMargin ? `Desired Profit Margin: ${desiredProfitMargin}%` : ''}
      ${targetCAC ? `Target Customer Acquisition Cost (CAC): ${currencyCode.toUpperCase()} ${targetCAC}` : ''}
      ${initialTeamSetupNotes ? `Initial Team Setup: ${initialTeamSetupNotes}` : ''}
      ${initialProductFeatures ? `Initial Product Features: ${initialProductFeatures}` : ''}
      ${initialIP ? `Initial IP/Assets: ${initialIP}` : ''}
    `;

    try {
      const input: PromptStartupInput = {
        prompt: fullPromptForAI,
        currencyCode: currencyCode.toUpperCase(),
        targetGrowthRate: targetGrowthRate || undefined,
        desiredProfitMargin: desiredProfitMargin || undefined,
        targetCAC: targetCAC || undefined,
        initialTeamSetupNotes: initialTeamSetupNotes.trim() || undefined,
        initialProductFeatures: initialProductFeatures.split(',').map(f => f.trim()).filter(f => f) || undefined,
        initialIP: initialIP.trim() || undefined,
      };
      // Simulate AI call delay for cinematic effect if needed, then actual call
      // For demo, let's assume the cinematic sequence itself takes time
      const result = await promptStartup(input);
      setSimulationOutput(result);
      initializeSimulationInStore(result, startupNameIdea, targetMarket, budget, currencyCode.toUpperCase());

      // Wait a bit after EVE's message before redirecting
      setTimeout(() => {
        toast({ title: "Digital Twin Initialized!", description: "Your simulation is ready. Redirecting to dashboard...", });
        router.push("/app/dashboard");
        setShowCinematicOverlay(false); // Hide overlay before navigation (though unmount will also do it)
      }, 2500); // Delay after EVE's message

    } catch (err) {
      console.error("Error initializing startup simulation:", err);
      // ... (rest of error handling logic) ...
      setShowCinematicOverlay(false); // Hide overlay on error
      setIsLoadingAiCall(false);
      let userFriendlyMessage = "Failed to initialize simulation. The AI might be unavailable or returned an unexpected response. Please try again.";
      if (err instanceof Error) userFriendlyMessage = `Failed to initialize simulation. Details: ${err.message}`;
      setError(userFriendlyMessage);
      toast({ title: "Error Initializing Simulation", description: userFriendlyMessage, variant: "destructive" });
    } 
    // setIsLoadingAiCall(false) is handled by success redirect or error path
  };

  const handleSuggestNames = async () => {
    if (!startupNameIdea.trim()) {
      toast({ title: "Business Idea Needed", description: "Please enter your Startup Name / Business Idea Summary first.", variant: "destructive" });
      return;
    }
    setIsSuggestingNames(true);
    try {
      const input: SuggestNamesInput = { businessIdea: startupNameIdea.trim() };
      const result = await suggestNames(input);
      let message = "AI Name Suggestions:\n";
      if (result.suggestedCompanyNames?.length) message += "\nCompany Names:\n- " + result.suggestedCompanyNames.join("\n- ");
      if (result.suggestedProductNames?.length) message += "\n\nProduct Names:\n- " + result.suggestedProductNames.join("\n- ");
      if (message === "AI Name Suggestions:\n") message = "AI couldn't come up with names. Try rephrasing.";
      toast({ title: "AI Name Ideas!", description: <pre className="whitespace-pre-wrap text-xs">{message}</pre>, duration: 15000 });
    } catch (err) {
      console.error("Error suggesting names:", err);
      toast({ title: "Name Suggestion Failed", description: err instanceof Error ? err.message : "Could not get name suggestions.", variant: "destructive" });
    } finally {
      setIsSuggestingNames(false);
    }
  };

  const prettyPrintJson = (jsonString: string) => {
    try { return JSON.stringify(JSON.parse(jsonString), null, 2); } 
    catch (e) { return jsonString; }
  };

  const parseChallenges = (challengesString: string | undefined): string[] => {
    if (!challengesString) return ["No challenges suggested."];
    try {
      const parsed = JSON.parse(challengesString);
      return Array.isArray(parsed) && parsed.every(item => typeof item === 'string') && parsed.length > 0 ? parsed : ["No specific challenges."];
    } catch (e) { return ["Error parsing challenges."]; }
  };

  return (
    <>
      <CinematicSetupOverlay
        isVisible={showCinematicOverlay}
        currentText={cinematicProgressText}
        isEveVisible={showEveInOverlay}
        eveMessage={eveFinalMessage}
      />
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
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="startup-name-idea" className="text-sm font-medium flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-muted-foreground"/> Startup Name / Business Idea Summary
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSuggestNames}
                    disabled={isLoadingAiCall || isSuggestingNames}
                  >
                    {isSuggestingNames ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4"/>}
                    Need Name Ideas?
                  </Button>
                </div>
                <Textarea
                  id="startup-name-idea"
                  value={startupNameIdea}
                  onChange={(e) => setStartupNameIdea(e.target.value)}
                  placeholder="e.g., 'ForgePress' - A SaaS platform for small businesses to manage social media with AI content suggestions..."
                  rows={3}
                  className="w-full"
                  disabled={isLoadingAiCall}
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
                  disabled={isLoadingAiCall}
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
                    disabled={isLoadingAiCall}
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
                    disabled={isLoadingAiCall}
                  />
                </div>
              </div>
              
              <Separator />
              <p className="text-sm text-muted-foreground">Optional: Provide more details for a richer starting simulation.</p>

              <div>
                <Label htmlFor="initial-team-notes" className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground"/> Initial Team Setup Notes (Optional)
                </Label>
                <Input
                  id="initial-team-notes"
                  value={initialTeamSetupNotes}
                  onChange={(e) => setInitialTeamSetupNotes(e.target.value)}
                  placeholder="e.g., 'Two technical co-founders (0 salary), 1 marketing intern ($1000/mo)'"
                  className="w-full"
                  disabled={isLoadingAiCall}
                />
              </div>
               <div>
                <Label htmlFor="initial-product-features" className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Brain className="h-4 w-4 text-muted-foreground"/> Key Initial Product Features (Comma-separated, Optional)
                </Label>
                <Input
                  id="initial-product-features"
                  value={initialProductFeatures}
                  onChange={(e) => setInitialProductFeatures(e.target.value)}
                  placeholder="e.g., User Authentication, Dashboard Analytics, AI Content Suggestions"
                  className="w-full"
                  disabled={isLoadingAiCall}
                />
              </div>
               <div>
                <Label htmlFor="initial-ip" className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground"/> Initial IP/Assets (Optional)
                </Label>
                <Input
                  id="initial-ip"
                  value={initialIP}
                  onChange={(e) => setInitialIP(e.target.value)}
                  placeholder="e.g., Patented algorithm for X, Exclusive dataset Y"
                  className="w-full"
                  disabled={isLoadingAiCall}
                />
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
                      disabled={isLoadingAiCall}
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
                      disabled={isLoadingAiCall}
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
                      disabled={isLoadingAiCall}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={isLoadingAiCall || !startupNameIdea.trim() || !targetMarket.trim() || !budget.trim() || !currencyCode.trim() || currencyCode.trim().length !== 3}
                className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                size="lg"
              >
                {isLoadingAiCall && !showCinematicOverlay ? ( /* Fallback if cinematic doesn't show for some reason */
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

        {error && !showCinematicOverlay && ( /* Only show error here if cinematic isn't active */
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Generating Scenario</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {simulationOutput && !isLoadingAiCall && !showCinematicOverlay && (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 mt-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Digital Twin: Initial Conditions (AI Generated)</CardTitle>
                <CardDescription>This JSON outlines the AI's suggested starting state. This has been used to initialize your digital twin.</CardDescription>
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
                <CardDescription>Foreseen hurdles. These have been noted in your simulation.</CardDescription>
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

        {!isLoadingAiCall && !simulationOutput && !error && !showCinematicOverlay && (
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
    </>
  );
}

    