
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Beaker, Info, AlertTriangle, Sparkles, Loader2, FileText, DollarSign, Users, BarChart3, ListChecks, Edit3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeCustomScenario, type AnalyzeCustomScenarioInput } from "@/ai/flows/analyze-custom-scenario-flow";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PredefinedScenario {
  id: string;
  label: string;
  description: string;
}

const predefinedScenarios: PredefinedScenario[] = [
  { id: "eco_downturn", label: "Economic Downturn", description: "A moderate economic downturn begins, reducing overall consumer spending and business investment by 15-20% for the next 3-6 months. Investor confidence also wanes." },
  { id: "viral_growth", label: "Viral Growth Spike", description: "Your product unexpectedly goes viral, leading to a 300% surge in organic user interest and sign-ups over the next month. Your current infrastructure and support systems are heavily strained." },
  { id: "competitor_disruption", label: "Competitor Disruption", description: "A major, well-funded competitor launches a very similar product with a 25% lower price point and a large marketing budget." },
  { id: "supplier_hike", label: "Key Supplier Price Hike", description: "Your primary supplier for a critical component increases their prices by 40% effective immediately, impacting your cost of goods sold." },
  { id: "positive_pr", label: "Unexpected Positive PR", description: "A highly influential tech publication/blogger gives your product a glowing review, leading to a significant but temporary boost in credibility and organic traffic." },
  { id: "key_employee_loss", label: "Key Employee Departure", description: "A critical senior engineer/developer unexpectedly resigns, potentially delaying product development by 2-3 months unless a replacement is found quickly."}
];


export default function InnovationLabPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const simState = useSimulationStore();
  const { toast } = useToast();

  const [customScenarioDescription, setCustomScenarioDescription] = useState("");
  const [selectedPredefinedScenarioId, setSelectedPredefinedScenarioId] = useState<string | undefined>(undefined);
  
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'qualitative' | 'quantitative_forecast' | null>(null);


  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const activeScenarioDescription = useMemo(() => {
    if (customScenarioDescription.trim()) {
      return customScenarioDescription;
    }
    const selectedScenario = predefinedScenarios.find(s => s.id === selectedPredefinedScenarioId);
    return selectedScenario?.description || "";
  }, [customScenarioDescription, selectedPredefinedScenarioId]);

  const handlePredefinedScenarioChange = (scenarioId: string) => {
    setSelectedPredefinedScenarioId(scenarioId);
    // Optionally clear custom description if a predefined one is selected
    // setCustomScenarioDescription(""); 
  };

  const processScenarioAnalysis = async (type: 'qualitative' | 'quantitative_forecast') => {
    if (!activeScenarioDescription.trim()) {
      toast({ title: "Scenario Required", description: "Please describe a scenario or select a pre-defined one.", variant: "destructive" });
      return;
    }
    if (!simState.isInitialized) {
        toast({ title: "Simulation Not Ready", description: "Please initialize your simulation before analyzing scenarios.", variant: "destructive"});
        return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    setAnalysisType(type);

    let scenarioToAnalyze = activeScenarioDescription;
    if (type === 'quantitative_forecast') {
      scenarioToAnalyze = `Focus your analysis on predicting the *quantitative* impact of the following scenario over the next 1-2 simulated months on key metrics such as Cash on Hand, Active Users, Monthly Revenue, and Startup Score. Provide estimated percentage changes or absolute value changes where possible. Also, briefly explain the main drivers for these quantitative changes. Scenario: ${activeScenarioDescription}`;
    }

    try {
      const serializableState = {
        simulationMonth: simState.simulationMonth,
        companyName: simState.companyName,
        financials: simState.financials,
        userMetrics: simState.userMetrics,
        product: simState.product,
        resources: simState.resources,
        market: simState.market,
        startupScore: simState.startupScore,
        keyEvents: simState.keyEvents.slice(-5),
        rewards: simState.rewards,
        initialGoals: simState.initialGoals,
        suggestedChallenges: simState.suggestedChallenges,
        isInitialized: simState.isInitialized,
      };

      const input: AnalyzeCustomScenarioInput = {
        simulationStateJSON: JSON.stringify(serializableState),
        customScenarioDescription: scenarioToAnalyze,
      };
      const result = await analyzeCustomScenario(input);
      setAnalysisResult(result.analysisText);
      toast({ title: `Scenario ${type === 'qualitative' ? 'Analysis' : 'Forecast'} Complete`, description: "AI insights are ready below."});
    } catch (err) {
      console.error(`Error analyzing custom scenario (${type}):`, err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setAnalysisError(`Failed to analyze scenario: ${errorMessage}`);
      toast({ title: `${type === 'qualitative' ? 'Analysis' : 'Forecast'} Error`, description: `Could not complete analysis. ${errorMessage}`, variant: "destructive"});
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
            Select a pre-defined scenario or describe your own hypothetical situation. The AI will analyze its potential impact on your current simulation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="predefined-scenario" className="text-base font-medium flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-muted-foreground"/> Select Pre-defined Scenario (Optional):
            </Label>
            <Select
              value={selectedPredefinedScenarioId}
              onValueChange={handlePredefinedScenarioChange}
              disabled={!simState.isInitialized || isLoadingAnalysis}
            >
              <SelectTrigger id="predefined-scenario" className="mt-2">
                <SelectValue placeholder="Choose a scenario..." />
              </SelectTrigger>
              <SelectContent>
                {predefinedScenarios.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label htmlFor="custom-scenario-description" className="text-base font-medium flex items-center gap-2">
             <Edit3 className="h-5 w-5 text-muted-foreground"/> Or Describe Your Custom Scenario:
            </Label>
            <Textarea
              id="custom-scenario-description"
              value={customScenarioDescription}
              onChange={(e) => {
                setCustomScenarioDescription(e.target.value);
                if (e.target.value.trim() && selectedPredefinedScenarioId) {
                  // If user types in custom, clear predefined selection to avoid confusion
                  setSelectedPredefinedScenarioId(undefined);
                }
              }}
              placeholder="e.g., What if our main supplier increases costs by 25% next quarter? (This will override pre-defined selection)"
              rows={3}
              className="mt-2"
              disabled={!simState.isInitialized || isLoadingAnalysis}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => processScenarioAnalysis('qualitative')} 
              disabled={!simState.isInitialized || isLoadingAnalysis || !activeScenarioDescription.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
            >
              {isLoadingAnalysis && analysisType === 'qualitative' ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing... </>
              ) : ( "Analyze Scenario (Qualitative)" )}
            </Button>
            <Button 
              onClick={() => processScenarioAnalysis('quantitative_forecast')} 
              disabled={!simState.isInitialized || isLoadingAnalysis || !activeScenarioDescription.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1"
            >
              {isLoadingAnalysis && analysisType === 'quantitative_forecast' ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Forecasting... </>
              ) : ( "Forecast Quantitative Impact" )}
            </Button>
          </div>
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
            <CardTitle className="text-xl text-primary flex items-center gap-2">
                <Beaker className="h-5 w-5"/>
                AI Scenario {analysisType === 'quantitative_forecast' ? 'Quantitative Forecast' : 'Analysis'}:
            </CardTitle>
            <CardDescription>Insights based on scenario: "{activeScenarioDescription.length > 100 ? activeScenarioDescription.substring(0,97) + "..." : activeScenarioDescription}"</CardDescription>
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
    
