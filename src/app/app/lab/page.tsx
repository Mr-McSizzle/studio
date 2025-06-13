
"use client";

import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Beaker, Info, AlertTriangle, Sparkles, Loader2, FileText, DollarSign, Users, BarChart3, ListChecks, Edit3, TestTube2, MinusCircle, PlusCircle, PackageOpen, Brain, Zap, SlidersHorizontal, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeCustomScenario, type AnalyzeCustomScenarioInput } from "@/ai/flows/analyze-custom-scenario-flow";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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

const DEFAULT_ENGINEER_SALARY_SANDBOX = 5000;


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

  const [isLoadingSandboxSim, setIsLoadingSandboxSim] = useState(false);

  // Local state for sandbox decision levers
  const [sandboxMarketingSpend, setSandboxLocalMarketingSpend] = useState(0);
  const [sandboxRndSpend, setSandboxLocalRndSpend] = useState(0);
  const [sandboxPricePerUser, setSandboxLocalPricePerUser] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Sync local sandbox lever states when sandboxState changes
  useEffect(() => {
    if (simState.isSandboxing && simState.sandboxState) {
      setSandboxLocalMarketingSpend(simState.sandboxState.resources.marketingSpend);
      setSandboxLocalRndSpend(simState.sandboxState.resources.rndSpend);
      setSandboxLocalPricePerUser(simState.sandboxState.product.pricePerUser);
    }
  }, [simState.isSandboxing, simState.sandboxState]);


  const activeScenarioDescription = useMemo(() => {
    if (customScenarioDescription.trim()) {
      return customScenarioDescription;
    }
    const selectedScenario = predefinedScenarios.find(s => s.id === selectedPredefinedScenarioId);
    return selectedScenario?.description || "";
  }, [customScenarioDescription, selectedPredefinedScenarioId]);

  const handlePredefinedScenarioChange = (scenarioId: string) => {
    setSelectedPredefinedScenarioId(scenarioId);
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
        rewards: simState.rewards, // Potentially large, consider omitting or summarizing
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
  
  const handleStartSandbox = () => {
    if (!simState.isInitialized) {
      toast({ title: "Initialize Simulation First", description: "Please set up your main simulation before starting a sandbox.", variant: "destructive" });
      return;
    }
    simState.startSandboxExperiment();
    toast({ title: "Sandbox Mode Activated!", description: "Experiment with decisions without affecting your main simulation." });
  };

  const handleSimulateSandboxMonth = async () => {
    setIsLoadingSandboxSim(true);
    await simState.simulateMonthInSandbox();
    setIsLoadingSandboxSim(false);
    toast({ title: "Sandbox Month Simulated", description: `Results for Sandbox Month ${simState.sandboxRelativeMonth} are in.` });
  };


  if (!isAuthenticated) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Redirecting to login...</p>
       </div>
    );
  }

  const mainSimCurrencySymbol = simState.financials?.currencySymbol || "$";
  const sandboxCurrencySymbol = simState.sandboxState?.financials?.currencySymbol || "$";

  const getSandboxTeamMemberCount = (role: string): number => {
    if(!simState.isSandboxing || !simState.sandboxState) return 0;
    const member = simState.sandboxState.resources.team.find(m => m.role === role);
    return member ? member.count : 0;
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">
      <header>
        <div className="flex items-center gap-4">
            <TestTube2 className="h-10 w-10 text-accent" />
            <div>
                <h1 className="text-3xl font-headline text-foreground">
                    ForgeSim Innovation Lab
                </h1>
                <p className="text-muted-foreground">Experiment with 'what-if' scenarios, sandbox decisions, and get AI-driven insights.</p>
            </div>
        </div>
      </header>
      
       {!simState.isInitialized && (
        <Alert variant="default" className="bg-secondary/30 border-secondary">
          <Info className="h-4 w-4" />
          <AlertTitle>Main Simulation Not Yet Initialized</AlertTitle>
          <AlertDescription>
            To use the Innovation Lab, please initialize your main simulation first.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm" variant="outline">Setup Your Simulation</Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-3"><FileText className="h-6 w-6 text-primary"/>Main Simulation Snapshot</CardTitle>
            <CardDescription>A brief overview of your active digital twin. Full details on the Dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div><strong>Company:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.companyName : "N/A"}</span></div>
            <div><strong>Month:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.simulationMonth : "N/A"}</span></div>
            <div><DollarSign className="inline h-4 w-4 mr-1"/><strong>Cash:</strong> <span className="text-muted-foreground">{simState.isInitialized ? `${mainSimCurrencySymbol}${simState.financials.cashOnHand.toLocaleString()}` : "N/A"}</span></div>
            <div><Users className="inline h-4 w-4 mr-1"/><strong>Users:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.userMetrics.activeUsers.toLocaleString() : "N/A"}</span></div>
            <div><BarChart3 className="inline h-4 w-4 mr-1"/><strong>Score:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.startupScore : "N/A"}/100</span></div>
            <div><strong>Product Stage:</strong> <span className="text-muted-foreground">{simState.isInitialized ? simState.product.stage : "N/A"}</span></div>
        </CardContent>
      </Card>
      
      <Separator />

      {/* Decision Lever Sandbox Section */}
      <Card className="shadow-xl border-primary/30" id="sandbox-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-primary">
            <PackageOpen className="h-7 w-7" /> Decision Lever Sandbox
          </CardTitle>
          <CardDescription>
            Test decisions in an isolated environment. Changes here DO NOT affect your main simulation unless explicitly applied (future feature).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!simState.isSandboxing ? (
            <Button onClick={handleStartSandbox} disabled={!simState.isInitialized} size="lg" className="w-full sm:w-auto">
              <TestTube2 className="mr-2 h-5 w-5" /> Start Sandbox Experiment
            </Button>
          ) : (
            <div className="space-y-6">
              <Alert variant="default" className="bg-primary/10 border-primary/50 text-primary-foreground">
                <TestTube2 className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold">Sandbox Mode Active</AlertTitle>
                <AlertDescription className="text-primary/90">
                  You are currently experimenting in a sandboxed copy of your simulation.
                  Sandbox Relative Month: {simState.sandboxRelativeMonth}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2"><SlidersHorizontal className="h-5 w-5"/>Sandbox Decision Levers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                      <Label htmlFor="sandbox-marketing-spend" className="text-xs">Marketing Spend ({sandboxCurrencySymbol})</Label>
                      <Input id="sandbox-marketing-spend" type="number" value={sandboxMarketingSpend} onChange={(e) => setSandboxLocalMarketingSpend(parseInt(e.target.value) || 0)} onBlur={() => simState.setSandboxMarketingSpend(sandboxMarketingSpend)} />
                    </div>
                    <div>
                      <Label htmlFor="sandbox-rnd-spend" className="text-xs">R&D Spend ({sandboxCurrencySymbol})</Label>
                      <Input id="sandbox-rnd-spend" type="number" value={sandboxRndSpend} onChange={(e) => setSandboxLocalRndSpend(parseInt(e.target.value) || 0)} onBlur={() => simState.setSandboxRndSpend(sandboxRndSpend)} />
                    </div>
                    <div>
                      <Label htmlFor="sandbox-price" className="text-xs">Price Per User ({sandboxCurrencySymbol})</Label>
                      <Input id="sandbox-price" type="number" value={sandboxPricePerUser} onChange={(e) => setSandboxLocalPricePerUser(parseFloat(e.target.value) || 0)} onBlur={() => simState.setSandboxPricePerUser(sandboxPricePerUser)} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Engineers ({getSandboxTeamMemberCount("Engineer")})</Label>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Engineer", -1)} disabled={getSandboxTeamMemberCount("Engineer") === 0}><MinusCircle/></Button>
                             <Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Engineer", 1, DEFAULT_ENGINEER_SALARY_SANDBOX)}><PlusCircle/></Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5"/>Sandbox State</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Sandbox Month:</strong> {simState.sandboxRelativeMonth}</p>
                        <p><strong>Cash:</strong> {sandboxCurrencySymbol}{simState.sandboxState?.financials.cashOnHand.toLocaleString()}</p>
                        <p><strong>Users:</strong> {simState.sandboxState?.userMetrics.activeUsers.toLocaleString()}</p>
                        <p><strong>Revenue:</strong> {sandboxCurrencySymbol}{simState.sandboxState?.financials.revenue.toLocaleString()}</p>
                        <p><strong>Burn Rate:</strong> {sandboxCurrencySymbol}{simState.sandboxState?.financials.burnRate.toLocaleString()}</p>
                         <p className="text-xs text-muted-foreground mt-2">Scores and full history are tracked in the main simulation.</p>
                         <ScrollArea className="h-24 mt-2 border p-2 rounded-md text-xs">
                            <p className="font-semibold mb-1">Sandbox AI Log:</p>
                            <pre className="whitespace-pre-wrap">{simState.sandboxState?.currentAiReasoning || "Log empty."}</pre>
                         </ScrollArea>
                    </CardContent>
                </Card>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSimulateSandboxMonth} disabled={isLoadingSandboxSim || (simState.sandboxState?.financials?.cashOnHand ?? 0) <= 0} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoadingSandboxSim ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Zap className="mr-2 h-5 w-5"/>}
                  Simulate 1 Month in Sandbox
                </Button>
                <Button onClick={simState.discardSandboxExperiment} variant="outline" className="flex-1">
                  <Trash2 className="mr-2 h-5 w-5"/> Discard Sandbox & Exit
                </Button>
              </div>
               {(simState.sandboxState?.financials?.cashOnHand ?? 0) <= 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Sandbox Out of Cash!</AlertTitle>
                    <AlertDescription>This sandbox experiment has run out of funds. Discard to try different parameters.</AlertDescription>
                </Alert>
               )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* What-if Scenario Analysis Section */}
      <Card className="shadow-lg" id="what-if-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-accent">
            <Sparkles className="h-7 w-7" /> AI Strategic "What-If" Analysis
          </CardTitle>
          <CardDescription>
            Select a pre-defined scenario or describe your own hypothetical situation. The AI will provide a qualitative or quantitative forecast based on your main simulation's current state.
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
              disabled={!simState.isInitialized || isLoadingAnalysis || simState.isSandboxing}
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
             {selectedPredefinedScenarioId && (
                <p className="text-xs text-muted-foreground mt-1.5 pl-1">Selected scenario: {predefinedScenarios.find(s => s.id === selectedPredefinedScenarioId)?.description}</p>
            )}
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
                  setSelectedPredefinedScenarioId(undefined);
                }
              }}
              placeholder="e.g., What if our main supplier increases costs by 25% next quarter? (This will override pre-defined selection)"
              rows={3}
              className="mt-2"
              disabled={!simState.isInitialized || isLoadingAnalysis || simState.isSandboxing}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => processScenarioAnalysis('qualitative')} 
              disabled={!simState.isInitialized || isLoadingAnalysis || !activeScenarioDescription.trim() || simState.isSandboxing}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-1"
            >
              {isLoadingAnalysis && analysisType === 'qualitative' ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing... </>
              ) : ( <> <Brain className="mr-2 h-4 w-4"/> Analyze Scenario (Qualitative)</> )}
            </Button>
            <Button 
              onClick={() => processScenarioAnalysis('quantitative_forecast')} 
              disabled={!simState.isInitialized || isLoadingAnalysis || !activeScenarioDescription.trim() || simState.isSandboxing}
              className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1"
            >
              {isLoadingAnalysis && analysisType === 'quantitative_forecast' ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Forecasting... </>
              ) : ( <> <BarChart3 className="mr-2 h-4 w-4"/> Forecast Quantitative Impact</> )}
            </Button>
          </div>
           {simState.isSandboxing && (
            <Alert variant="default" className="bg-primary/10 border-primary/30">
                <Info className="h-4 w-4"/>
                <AlertTitle>Strategic Analysis Disabled</AlertTitle>
                <AlertDescription>Strategic "What-If" analysis is based on your main simulation. Please discard the current sandbox experiment to use this feature.</AlertDescription>
            </Alert>
           )}
        </CardContent>
      </Card>

      {analysisError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Scenario Analysis Error</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}

      {analysisResult && !isLoadingAnalysis && (
        <Card className="shadow-xl border-accent/50">
          <CardHeader>
            <CardTitle className="text-xl text-accent flex items-center gap-2">
                <Beaker className="h-5 w-5"/>
                AI Scenario {analysisType === 'quantitative_forecast' ? 'Quantitative Forecast' : 'Qualitative Analysis'}:
            </CardTitle>
            <CardDescription>Insights based on scenario: "{activeScenarioDescription.length > 100 ? activeScenarioDescription.substring(0,97) + "..." : activeScenarioDescription}"</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px] pr-3">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n\n/g, '<br /><br />').replace(/\n/g, '<br />') }}></div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
    

    