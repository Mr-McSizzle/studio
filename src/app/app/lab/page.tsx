
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Beaker, Info, AlertTriangle, Sparkles, Loader2, FileText, DollarSign, Users, BarChart3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeCustomScenario, type AnalyzeCustomScenarioInput } from "@/ai/flows/analyze-custom-scenario-flow";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function InnovationLabPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const simState = useSimulationStore();
  const { toast } = useToast();

  const [customScenario, setCustomScenario] = useState("");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleAnalyzeScenario = async () => {
    if (!customScenario.trim()) {
      toast({ title: "Scenario Required", description: "Please describe a scenario to analyze.", variant: "destructive" });
      return;
    }
    if (!simState.isInitialized) {
        toast({ title: "Simulation Not Ready", description: "Please initialize your simulation before analyzing scenarios.", variant: "destructive"});
        return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      // Exclude functions from the state before serializing
      const serializableState = {
        simulationMonth: simState.simulationMonth,
        companyName: simState.companyName,
        financials: simState.financials,
        userMetrics: simState.userMetrics,
        product: simState.product,
        resources: simState.resources,
        market: simState.market,
        startupScore: simState.startupScore,
        keyEvents: simState.keyEvents.slice(-5), // last 5 events for brevity
        rewards: simState.rewards,
        initialGoals: simState.initialGoals,
        suggestedChallenges: simState.suggestedChallenges,
        isInitialized: simState.isInitialized,
        // Do not include currentAiReasoning or historical data if too large or complex
        // Also, do not include functions like advanceMonth, resetSimulation, etc.
      };

      const input: AnalyzeCustomScenarioInput = {
        simulationStateJSON: JSON.stringify(serializableState),
        customScenarioDescription: customScenario,
      };
      const result = await analyzeCustomScenario(input);
      setAnalysisResult(result.analysisText);
      toast({ title: "Scenario Analysis Complete", description: "AI insights are ready below."});
    } catch (err) {
      console.error("Error analyzing custom scenario:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setAnalysisError(`Failed to analyze scenario: ${errorMessage}`);
      toast({ title: "Analysis Error", description: `Could not complete analysis. ${errorMessage}`, variant: "destructive"});
    } finally {
      setIsLoadingAnalysis(false);
    }
  };


  if (!isAuthenticated) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Redirecting to login...</p>
       </div>
    );
  }

  const currencySymbol = simState.financials?.currencySymbol || "$";

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">
      <header>
        <div className="flex items-center gap-4">
            <Beaker className="h-10 w-10 text-accent" />
            <div>
                <h1 className="text-3xl font-headline text-foreground">
                    Innovation Lab & Scenario Analysis
                </h1>
                <p className="text-muted-foreground">Experiment with 'what-if' scenarios and get AI-driven insights.</p>
            </div>
        </div>
      </header>
      
       {!simState.isInitialized && (
        <Alert variant="default" className="bg-secondary/30 border-secondary">
          <Info className="h-4 w-4" />
          <AlertTitle>Simulation Not Yet Initialized</AlertTitle>
          <AlertDescription>
            To use the scenario analysis tool, please initialize your simulation first.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm" variant="outline">Setup Your Simulation</Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-3"><FileText className="h-6 w-6 text-primary"/>Current Simulation Snapshot</CardTitle>
            <CardDescription>A brief overview of your active digital twin. Full details on the Dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div><strong>Company:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.companyName : "N/A"}</span></div>
            <div><strong>Month:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.simulationMonth : "N/A"}</span></div>
            <div><DollarSign className="inline h-4 w-4 mr-1"/><strong>Cash:</strong> <span className="text-muted-foreground">{simState.isInitialized ? `${currencySymbol}${simState.financials.cashOnHand.toLocaleString()}` : "N/A"}</span></div>
            <div><Users className="inline h-4 w-4 mr-1"/><strong>Users:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.userMetrics.activeUsers.toLocaleString() : "N/A"}</span></div>
            <div><BarChart3 className="inline h-4 w-4 mr-1"/><strong>Score:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.startupScore : "N/A"}/100</span></div>
            <div><strong>Product Stage:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.product.stage : "N/A"}</span></div>
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-accent" />
            Experimental "What-If" Scenario Analysis
          </CardTitle>
          <CardDescription>
            Describe a hypothetical scenario (e.g., "a key competitor lowers prices by 30%", "a new technology emerges making our core product obsolete", "we receive unexpected positive PR"). The AI will analyze its potential impact on your current simulation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-scenario" className="text-base font-medium">Describe Your Scenario:</Label>
            <Textarea
              id="custom-scenario"
              value={customScenario}
              onChange={(e) => setCustomScenario(e.target.value)}
              placeholder="e.g., What if our main supplier increases costs by 25% next quarter?"
              rows={4}
              className="mt-2"
              disabled={!simState.isInitialized || isLoadingAnalysis}
            />
          </div>
          <Button 
            onClick={handleAnalyzeScenario} 
            disabled={!simState.isInitialized || isLoadingAnalysis || !customScenario.trim()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoadingAnalysis ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Scenario...
              </>
            ) : (
              "Analyze Scenario with AI"
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}

      {analysisResult && !isLoadingAnalysis && (
        <Card className="shadow-xl border-primary/50">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2"><Beaker className="h-5 w-5"/>AI Scenario Analysis:</CardTitle>
            <CardDescription>Insights based on your scenario: "{customScenario.length > 100 ? customScenario.substring(0,97) + "..." : customScenario}"</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px] pr-3">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}></div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    
