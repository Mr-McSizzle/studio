
"use client";

import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Beaker, Info, AlertTriangle, Sparkles, Loader2, FileText, DollarSign, Users, BarChart3, ListChecks, Edit3, TestTube2, MinusCircle, PlusCircle, PackageOpen, Brain, Zap, SlidersHorizontal, Trash2, Briefcase, Lightbulb, XCircle, Save, ListRestart, HistoryIcon, CheckCircle, HelpCircle, Bot, Trophy, GitCommitVertical } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeCustomScenario, type AnalyzeCustomScenarioInput } from "@/ai/flows/analyze-custom-scenario-flow";
import { suggestScenarios, type SuggestScenariosInput, type SuggestedScenario } from "@/ai/flows/suggest-scenarios-flow";
import { analyzeSillyIdea, type AnalyzeSillyIdeaInput, type AnalyzeSillyIdeaOutput } from "@/ai/flows/analyze-silly-idea-flow";
import { submitToReddit, type SubmitToRedditInput, type SubmitToRedditOutput } from "@/ai/flows/submit-to-reddit-flow";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getAgentProfileById } from "@/lib/agentsData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";


interface PredefinedScenarioOption {
  id: string;
  label: string;
  description: string;
}

const predefinedScenarioOptions: PredefinedScenarioOption[] = [
  { id: "eco_downturn", label: "Economic Downturn", description: "A moderate economic downturn begins, reducing overall consumer spending and business investment by 15-20% for the next 3-6 months. Investor confidence also wanes." },
  { id: "viral_growth", label: "Viral Growth Spike", description: "Your product unexpectedly goes viral, leading to a 300% surge in organic user interest and sign-ups over the next month. Your current infrastructure and support systems are heavily strained." },
  { id: "competitor_disruption", label: "Competitor Disruption", description: "A major, well-funded competitor launches a very similar product with a 25% lower price point and a large marketing budget." },
  { id: "supplier_hike", label: "Key Supplier Price Hike", description: "Your primary supplier for a critical component increases their prices by 40% effective immediately, impacting your cost of goods sold." },
  { id: "positive_pr", label: "Unexpected Positive PR", description: "A highly influential tech publication/blogger gives your product a glowing review, leading to a significant but temporary boost in credibility and organic traffic." },
  { id: "key_employee_loss", label: "Key Employee Departure", description: "A critical senior engineer/developer unexpectedly resigns, potentially delaying product development by 2-3 months unless a replacement is found quickly."}
];

const DEFAULT_SENIOR_ENGINEER_SALARY_SANDBOX = 7500;
const DEFAULT_JUNIOR_ENGINEER_SALARY_SANDBOX = 4000;
const DEFAULT_MARKETER_SALARY_SANDBOX = 4500;
const DEFAULT_SALESPERSON_SALARY_SANDBOX = 4000;


const MAX_ANALYSIS_RESULTS = 3;

interface AnalyzedScenario {
  id: string;
  scenarioDescription: string;
  analysisText: string;
  analysisType: 'qualitative' | 'quantitative_forecast';
}


const StrategicAnalysisTab = () => {
    const simState = useSimulationStore();
    const { toast } = useToast();
    const [customScenarioDescription, setCustomScenarioDescription] = useState("");
    const [selectedPredefinedScenarioId, setSelectedPredefinedScenarioId] = useState<string | undefined>(undefined);
    const [analysisResults, setAnalysisResults] = useState<AnalyzedScenario[]>([]);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [currentAnalysisType, setCurrentAnalysisType] = useState<'qualitative' | 'quantitative_forecast' | null>(null);
    const [aiSuggestedScenarios, setAiSuggestedScenarios] = useState<SuggestedScenario[] | null>(null);
    const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
    const [aiSuggestionsError, setAiSuggestionsError] = useState<string | null>(null);

    const activeScenarioDescription = useMemo(() => {
        if (customScenarioDescription.trim()) return customScenarioDescription;
        const selectedScenario = predefinedScenarioOptions.find(s => s.id === selectedPredefinedScenarioId);
        return selectedScenario?.description || "";
    }, [customScenarioDescription, selectedPredefinedScenarioId]);

    const handlePredefinedScenarioChange = (scenarioId: string) => {
        setSelectedPredefinedScenarioId(scenarioId);
        setCustomScenarioDescription(""); 
    };

    const handleCustomScenarioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setCustomScenarioDescription(e.target.value);
        if (e.target.value.trim() && selectedPredefinedScenarioId) {
            setSelectedPredefinedScenarioId(undefined); 
        }
    };
    
    const getSerializableSimulationState = () => {
        const stateToSerialize = simState.isSandboxing && simState.sandboxState ? simState.sandboxState : simState;
        return {
            simulationMonth: stateToSerialize.simulationMonth, companyName: stateToSerialize.companyName, financials: stateToSerialize.financials, userMetrics: stateToSerialize.userMetrics, product: stateToSerialize.product, resources: stateToSerialize.resources, market: stateToSerialize.market, startupScore: stateToSerialize.startupScore, keyEvents: stateToSerialize.keyEvents.slice(-5), rewards: stateToSerialize.rewards, initialGoals: stateToSerialize.initialGoals, missions: stateToSerialize.missions, suggestedChallenges: stateToSerialize.suggestedChallenges, isInitialized: stateToSerialize.isInitialized,
        };
    };

    const processScenarioAnalysis = async (type: 'qualitative' | 'quantitative_forecast') => {
        if (!activeScenarioDescription.trim()) {
            toast({ title: "Scenario Required", description: "Please describe a scenario, select a pre-defined one, or generate AI suggestions.", variant: "destructive" });
            return;
        }
        const baseSimState = simState.isSandboxing && simState.sandboxState ? simState.sandboxState : simState;
        if (!baseSimState.isInitialized) {
            toast({ title: "Simulation Not Ready", description: `Please initialize your ${simState.isSandboxing ? 'sandbox' : 'main'} simulation before analyzing scenarios.`, variant: "destructive"});
            return;
        }

        setIsLoadingAnalysis(true);
        setAnalysisError(null);
        setCurrentAnalysisType(type);

        let scenarioToAnalyze = activeScenarioDescription;
        if (type === 'quantitative_forecast') {
        scenarioToAnalyze = `Focus your analysis on predicting the *quantitative* impact of the following scenario over the next 1-2 simulated months on key metrics such as Cash on Hand, Active Users, Monthly Revenue, and Startup Score. Provide estimated percentage changes or absolute value changes where possible. Also, briefly explain the main drivers for these quantitative changes. Scenario: ${activeScenarioDescription}`;
        }

        try {
            const input: AnalyzeCustomScenarioInput = {
                simulationStateJSON: JSON.stringify(getSerializableSimulationState()),
                customScenarioDescription: scenarioToAnalyze,
            };
            const result = await analyzeCustomScenario(input);
            
            setAnalysisResults(prevResults => {
                const newResult: AnalyzedScenario = { id: `analysis-${Date.now()}`, scenarioDescription: activeScenarioDescription, analysisText: result.analysisText, analysisType: type, };
                return [newResult, ...prevResults].slice(0, MAX_ANALYSIS_RESULTS);
            });

            toast({ title: `Scenario ${type === 'qualitative' ? 'Analysis' : 'Forecast'} Complete`, description: "AI insights are ready below."});
        } catch (err) {
            console.error(`Error analyzing custom scenario (${type}):`, err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setAnalysisError(`Failed to analyze scenario: ${errorMessage}`);
            toast({ title: `${type === 'qualitative' ? 'Analysis' : 'Forecast'} Error`, description: `Could not complete analysis. ${errorMessage}`, variant: "destructive"});
        } finally {
            setIsLoadingAnalysis(false);
            setCurrentAnalysisType(null);
        }
    };
    
    const handleGenerateAiScenarios = async () => {
        const baseSimState = simState.isSandboxing && simState.sandboxState ? simState.sandboxState : simState;
        if (!baseSimState.isInitialized) {
            toast({ title: "Simulation Not Ready", description: `Please initialize your ${simState.isSandboxing ? 'sandbox' : 'main'} simulation to get AI scenario suggestions.`, variant: "destructive"});
            return;
        }
        setIsLoadingAiSuggestions(true);
        setAiSuggestedScenarios(null);
        setAiSuggestionsError(null);
        try {
            const input: SuggestScenariosInput = { simulationStateJSON: JSON.stringify(getSerializableSimulationState()), };
            const result = await suggestScenarios(input);
            setAiSuggestedScenarios(result.suggestedScenarios);
            toast({ title: "AI Scenario Ideas Generated!", description: "Check the suggestions below."});
        } catch (err) {
            console.error("Error generating AI scenario suggestions:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setAiSuggestionsError(`Failed to get AI suggestions: ${errorMessage}`);
            toast({ title: "Suggestion Error", description: `Could not get AI suggestions. ${errorMessage}`, variant: "destructive"});
        } finally {
            setIsLoadingAiSuggestions(false);
        }
    };

    const handleSelectAiSuggestedScenario = (scenario: SuggestedScenario) => {
        setCustomScenarioDescription(scenario.description);
        setSelectedPredefinedScenarioId(undefined); 
        setAiSuggestedScenarios(null); 
    };

    const clearAllAnalyses = () => {
        setAnalysisResults([]);
        toast({ title: "Analyses Cleared", description: "Previous scenario analyses have been removed." });
    };

    const removeAnalysisResult = (idToRemove: string) => {
        setAnalysisResults(prevResults => prevResults.filter(result => result.id !== idToRemove));
    };

    const currentContextState = simState.isSandboxing && simState.sandboxState ? simState.sandboxState : simState;

    return (
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl text-accent">
                        <Sparkles className="h-7 w-7" /> AI Strategic "What-If" Analysis
                    </CardTitle>
                    <CardDescription>
                        Select a pre-defined scenario, generate AI ideas, or describe your own hypothetical situation. The AI will provide analysis based on your {simState.isSandboxing ? "current SANDBOX's" : "MAIN simulation's"} state.
                        {simState.isSandboxing && <span className="block mt-1 font-semibold text-primary"> (Analysis will use current Sandbox state)</span>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <Label htmlFor="predefined-scenario" className="text-base font-medium flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-muted-foreground"/> Select Pre-defined Scenario:
                            </Label>
                            <Select value={selectedPredefinedScenarioId} onValueChange={handlePredefinedScenarioChange} disabled={!currentContextState.isInitialized || isLoadingAnalysis || isLoadingAiSuggestions}>
                                <SelectTrigger id="predefined-scenario" className="mt-2"><SelectValue placeholder="Choose a scenario..." /></SelectTrigger>
                                <SelectContent>
                                    {predefinedScenarioOptions.map(scenario => <SelectItem key={scenario.id} value={scenario.id}>{scenario.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {selectedPredefinedScenarioId && <p className="text-xs text-muted-foreground mt-1.5 pl-1">Selected: {predefinedScenarioOptions.find(s => s.id === selectedPredefinedScenarioId)?.description}</p>}
                        </div>
                        <Button onClick={handleGenerateAiScenarios} variant="outline" className="w-full md:w-auto" disabled={!currentContextState.isInitialized || isLoadingAiSuggestions || isLoadingAnalysis}>
                            {isLoadingAiSuggestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4"/>}
                            Get AI Scenario Ideas
                        </Button>
                    </div>
                    {aiSuggestionsError && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Suggestion Error</AlertTitle><AlertDescription>{aiSuggestionsError}</AlertDescription></Alert>}
                    {aiSuggestedScenarios && aiSuggestedScenarios.length > 0 && (
                        <Card className="bg-muted/50 p-4">
                            <CardDescription className="mb-2 text-sm">Click an AI-suggested scenario to use it:</CardDescription>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {aiSuggestedScenarios.map(scenario => (
                                    <Button key={scenario.id} variant="outline" size="sm" onClick={() => handleSelectAiSuggestedScenario(scenario)} className="text-left justify-start h-auto py-2">
                                        <Sparkles className="h-4 w-4 mr-2 text-accent shrink-0"/>
                                        <div>
                                            <p className="font-medium">{scenario.label}</p>
                                            <p className="text-xs text-muted-foreground whitespace-normal">{scenario.description.substring(0,70)}...</p>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    )}
                    <div>
                        <Label htmlFor="custom-scenario-description" className="text-base font-medium flex items-center gap-2">
                            <Edit3 className="h-5 w-5 text-muted-foreground"/> Or Describe Your Custom Scenario:
                        </Label>
                        <Textarea id="custom-scenario-description" value={customScenarioDescription} onChange={handleCustomScenarioChange} placeholder="e.g., What if our main supplier increases costs by 25% next quarter? (This will override pre-defined selection)" rows={3} className="mt-2" disabled={!currentContextState.isInitialized || isLoadingAnalysis || isLoadingAiSuggestions} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={() => processScenarioAnalysis('qualitative')} disabled={!currentContextState.isInitialized || isLoadingAnalysis || !activeScenarioDescription.trim() || isLoadingAiSuggestions} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-1">
                            {isLoadingAnalysis && currentAnalysisType === 'qualitative' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Brain className="mr-2 h-4 w-4"/> Analyze Scenario (Qualitative)</>}
                        </Button>
                        <Button onClick={() => processScenarioAnalysis('quantitative_forecast')} disabled={!currentContextState.isInitialized || isLoadingAnalysis || !activeScenarioDescription.trim() || isLoadingAiSuggestions} className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1">
                            {isLoadingAnalysis && currentAnalysisType === 'quantitative_forecast' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Forecasting...</> : <><BarChart3 className="mr-2 h-4 w-4"/> Forecast Quantitative Impact</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {analysisResults.length > 0 && (
                <Card className="shadow-xl border-accent/30">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle className="text-xl text-accent flex items-center gap-2"><Beaker className="h-5 w-5"/> Scenario Analysis History (Last {MAX_ANALYSIS_RESULTS})</CardTitle>
                            <CardDescription>Compare outcomes from different 'what-if' explorations.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={clearAllAnalyses} disabled={isLoadingAnalysis}><Trash2 className="mr-2 h-4 w-4" /> Clear All Analyses</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysisResults.map((result) => (
                            <Card key={result.id} className="shadow-md bg-card/70">
                                <CardHeader className="pb-3 pt-4 flex flex-row justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-primary">{result.analysisType === 'qualitative' ? "Qualitative Analysis" : "Quantitative Forecast"}</CardTitle>
                                        <CardDescription className="text-xs mt-1">Scenario: "{result.scenarioDescription.length > 100 ? result.scenarioDescription.substring(0,97) + "..." : result.scenarioDescription}"</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeAnalysisResult(result.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><XCircle className="h-4 w-4"/><span className="sr-only">Remove this analysis</span></Button>
                                </CardHeader>
                                <CardContent><ScrollArea className="max-h-[250px] pr-3 text-sm"><div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: result.analysisText.replace(/\n\n/g, '<br /><br />').replace(/\n/g, '<br />') }}></div></ScrollArea></CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}
            {analysisError && !isLoadingAnalysis && <Alert variant="destructive" className="mb-6"><AlertTriangle className="h-4 w-4" /><AlertTitle>Last Analysis Failed</AlertTitle><AlertDescription>{analysisError}</AlertDescription></Alert>}
        </div>
    );
};


const AbsurdityArenaTab = () => {
    const { toast } = useToast();
    const simState = useSimulationStore();
    const [sillyIdeaDescription, setSillyIdeaDescription] = useState("");
    const [joyMetric, setJoyMetric] = useState("Maximum Confusion");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeSillyIdeaOutput | null>(null);
    const [isSubmittingToReddit, setIsSubmittingToReddit] = useState(false);
    const [redditSubmissionResult, setRedditSubmissionResult] = useState<SubmitToRedditOutput | null>(null);

    const handleAnalyze = async (e: FormEvent) => {
        e.preventDefault();
        if (!sillyIdeaDescription.trim()) {
            toast({ title: "An Idea, Please!", description: "You must provide a silly idea to analyze.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setRedditSubmissionResult(null);

        try {
            const input: AnalyzeSillyIdeaInput = { sillyIdeaDescription, joyMetric };
            const result = await analyzeSillyIdea(input);
            setAnalysisResult(result);
            toast({ title: "Silly Idea Analyzed!", description: "The AI agents have weighed in on your glorious impracticality." });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to analyze idea: ${errorMessage}`);
            toast({ title: "Analysis Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitToReddit = async () => {
        if (!analysisResult || !sillyIdeaDescription) return;

        setIsSubmittingToReddit(true);
        setRedditSubmissionResult(null);
        try {
            const input: SubmitToRedditInput = {
                sillyIdeaTitle: sillyIdeaDescription.substring(0, 50),
                sillyIdeaDescription,
                ...analysisResult
            };
            const result = await submitToReddit(input);
            setRedditSubmissionResult(result);
            toast({
                title: "Submission Simulated!",
                description: result.success ? "Your idea has been 'posted' to Reddit for eternal glory." : "Submission failed.",
                variant: result.success ? "default" : "destructive",
            });
        } catch(err) {
             const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
             toast({ title: "Submission Error", description: errorMessage, variant: "destructive" });
        } finally {
            setIsSubmittingToReddit(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-lg border-purple-500/30">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-3 text-xl text-purple-400"><HelpCircle className="h-7 w-7" />The Absurdity Arena</CardTitle>
                            <CardDescription>Inspired by the Reddit x Bolt Developer Platform Challenge. Pitch your wackiest, weirdest, and most gloriously impractical ideas for AI analysis.</CardDescription>
                        </div>
                        <img src="https://www.redditinc.com/assets/images/site/reddit-logo.png" alt="Reddit Logo" className="h-8 w-auto" />
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <div>
                            <Label htmlFor="silly-idea" className="font-semibold">Your Gloriously Impractical Idea</Label>
                            <Textarea id="silly-idea" value={sillyIdeaDescription} onChange={e => setSillyIdeaDescription(e.target.value)} placeholder="e.g., A SaaS platform where every button click makes a different cat sound." rows={3} disabled={isLoading} />
                        </div>
                        <div>
                             <Label htmlFor="joy-metric" className="font-semibold">Optimize for...</Label>
                             <Select value={joyMetric} onValueChange={setJoyMetric} disabled={isLoading}>
                                <SelectTrigger id="joy-metric"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maximum Confusion">Maximum Confusion</SelectItem>
                                    <SelectItem value="Unpredictable Laughter">Unpredictable Laughter</SelectItem>
                                    <SelectItem value="Pure Whimsy">Pure Whimsy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading || !sillyIdeaDescription.trim()}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                            {isLoading ? "Analyzing Absurdity..." : "Analyze Idea"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Analysis Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

            {analysisResult && (
                 <Card className="shadow-xl border-purple-500/50 animate-fadeInUp">
                    <CardHeader>
                        <CardTitle className="text-purple-400">AI Absurdity Analysis</CardTitle>
                        <CardDescription>The results are in...</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <Card className="p-3 bg-muted/50"><CardDescription>Whimsy Score</CardDescription><p className="text-3xl font-bold text-primary">{analysisResult.whimsyScore}/10</p></Card>
                            <Card className="p-3 bg-muted/50"><CardDescription>Virality Potential</CardDescription><p className="text-lg font-semibold text-primary truncate">{analysisResult.viralityPotential}</p></Card>
                            <Card className="p-3 bg-muted/50"><CardDescription>Joy : Effort Ratio</CardDescription><p className="text-lg font-semibold text-primary truncate">{analysisResult.joyToEffortRatio}</p></Card>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Bot className="h-4 w-4"/>Agent Banter</h4>
                            <div className="space-y-2">
                                {analysisResult.agentBanter.map((banter, index) => {
                                    const agentProfile = getAgentProfileById(banter.agentId);
                                    return (
                                        <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-md text-sm">
                                            {agentProfile ? <Avatar className="h-6 w-6 border"><AvatarImage src={agentProfile.avatarUrl} /><AvatarFallback>{agentProfile.shortName.charAt(0)}</AvatarFallback></Avatar> : <Bot className="h-6 w-6 text-muted-foreground"/>}
                                            <p><strong className="text-foreground">{banter.agentName}:</strong> <span className="text-muted-foreground">"{banter.comment}"</span></p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <Separator />
                        <div className="text-center space-y-3">
                             <Button onClick={handleSubmitToReddit} disabled={isSubmittingToReddit} className="bg-orange-500 hover:bg-orange-600 text-white">
                                {isSubmittingToReddit ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trophy className="mr-2 h-4 w-4"/>}
                                Submit to Reddit for Eternal Glory
                            </Button>
                             {redditSubmissionResult && (
                                <Alert variant={redditSubmissionResult.success ? "default" : "destructive"} className="text-left">
                                  <GitCommitVertical className="h-4 w-4" />
                                  <AlertTitle>{redditSubmissionResult.success ? "Submission Simulated!" : "Submission Failed"}</AlertTitle>
                                  <AlertDescription>
                                    {redditSubmissionResult.message}
                                    {redditSubmissionResult.postUrl && (
                                      <a href={redditSubmissionResult.postUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-400 hover:underline mt-1 break-all">
                                        View simulated post: {redditSubmissionResult.postUrl}
                                      </a>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              )}
                        </div>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
};


export default function InnovationLabPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const simState = useSimulationStore();
  const { toast } = useToast();

  const [isLoadingSnapshotAction, setIsLoadingSnapshotAction] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [isLoadingSandboxSim, setIsLoadingSandboxSim] = useState(false);
  const [isLoadingApplySandbox, setIsLoadingApplySandbox] = useState(false);
  const [sandboxMarketingSpend, setSandboxLocalMarketingSpend] = useState(0);
  const [sandboxRndSpend, setSandboxLocalRndSpend] = useState(0);
  const [sandboxPricePerUser, setSandboxLocalPricePerUser] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (simState.isSandboxing && simState.sandboxState) {
      setSandboxLocalMarketingSpend(simState.sandboxState.resources.marketingSpend);
      setSandboxLocalRndSpend(simState.sandboxState.resources.rndSpend);
      setSandboxLocalPricePerUser(simState.sandboxState.product.pricePerUser);
    } else {
      setSandboxLocalMarketingSpend(simState.resources.marketingSpend);
      setSandboxLocalRndSpend(simState.resources.rndSpend);
      setSandboxLocalPricePerUser(simState.product.pricePerUser);
    }
  }, [simState.isSandboxing, simState.sandboxState, simState.resources.marketingSpend, simState.resources.rndSpend, simState.product.pricePerUser]);

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
    toast({ title: "Sandbox Month Simulated", description: `Results for Sandbox Relative Month ${simState.sandboxRelativeMonth} are in.` });
  };
  
  const handleDiscardSandbox = () => {
    simState.discardSandboxExperiment();
    toast({ title: "Sandbox Discarded", description: "Returned to main simulation context." });
  };

  const handleApplySandbox = async () => {
    setIsLoadingApplySandbox(true);
    simState.applySandboxDecisionsToMain();
    toast({ title: "Sandbox Decisions Applied!", description: "Decision levers from sandbox have been applied to your main simulation. Sandbox discarded." });
    setIsLoadingApplySandbox(false);
  };
  
  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) { toast({ title: "Snapshot Name Required", description: "Please enter a name for your simulation snapshot.", variant: "destructive" }); return; }
    if (simState.isSandboxing) { toast({ title: "Cannot Save in Sandbox", description: "Please exit sandbox mode to save the main simulation state.", variant: "destructive" }); return; }
    setIsLoadingSnapshotAction(true);
    const savedState = simState.saveCurrentSimulation(snapshotName);
    if (savedState) {
      toast({ title: "Simulation Snapshot Saved!", description: `State "${snapshotName}" (Month ${savedState.simulationMonth}) has been saved.` });
      setSnapshotName("");
    } else {
      toast({ title: "Save Failed", description: "Could not save snapshot. Ensure simulation is initialized.", variant: "destructive" });
    }
    setIsLoadingSnapshotAction(false);
  };

  const handleLoadSnapshot = (snapshotId: string) => {
    setIsLoadingSnapshotAction(true);
    const loadedState = simState.loadSimulation(snapshotId);
    if (loadedState) {
      toast({ title: "Simulation Loaded", description: `Loaded snapshot "${loadedState.companyName}" (Month ${loadedState.simulationMonth}). Redirecting to dashboard.` });
      router.push('/app/dashboard'); 
    } else {
      toast({ title: "Load Failed", description: "Could not load the selected snapshot.", variant: "destructive" });
    }
    setIsLoadingSnapshotAction(false);
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    setIsLoadingSnapshotAction(true);
    simState.deleteSavedSimulation(snapshotId);
    toast({ title: "Snapshot Deleted", description: "The simulation snapshot has been removed." });
    setIsLoadingSnapshotAction(false);
  };

  if (!isAuthenticated) return <div className="flex flex-col items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-2">Redirecting to login...</p></div>;
  
  const currentContextState = simState.isSandboxing && simState.sandboxState ? simState.sandboxState : simState;
  const currencySymbol = currentContextState.financials?.currencySymbol || "$";
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
                <h1 className="text-3xl font-headline text-foreground">Inceptico Innovation Lab</h1>
                <p className="text-muted-foreground">Experiment with 'what-if' scenarios, sandbox decisions, and get AI-driven insights on both serious and silly ideas.</p>
            </div>
        </div>
      </header>
      
      {!simState.isInitialized && <Alert variant="default" className="bg-secondary/30 border-secondary"><Info className="h-4 w-4" /><AlertTitle>Main Simulation Not Yet Initialized</AlertTitle><AlertDescription>To use the Innovation Lab, please initialize your main simulation first.<Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm" variant="outline">Setup Your Simulation</Button></AlertDescription></Alert>}

      <Card className="shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-3"><FileText className="h-6 w-6 text-primary"/>{simState.isSandboxing ? "Sandbox Simulation Snapshot" : "Main Simulation Snapshot"}</CardTitle><CardDescription>A brief overview of your {simState.isSandboxing ? "current sandbox experiment" : "active digital twin"}.</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div><strong>Company:</strong> <span className="text-muted-foreground">{currentContextState.isInitialized ? currentContextState.companyName : "N/A"}</span></div>
            <div><strong>Month:</strong> <span className="text-muted-foreground">{currentContextState.isInitialized ? (simState.isSandboxing ? `Sandbox M${simState.sandboxRelativeMonth} (Main M${currentContextState.simulationMonth})` : `Main M${simState.simulationMonth}`) : "N/A"}</span></div>
            <div><DollarSign className="inline h-4 w-4 mr-1"/><strong>Cash:</strong> <span className="text-muted-foreground">{currentContextState.isInitialized ? `${currencySymbol}${currentContextState.financials.cashOnHand.toLocaleString()}` : "N/A"}</span></div>
            <div><Users className="inline h-4 w-4 mr-1"/><strong>Users:</strong> <span className="text-muted-foreground">{currentContextState.isInitialized ? currentContextState.userMetrics.activeUsers.toLocaleString() : "N/A"}</span></div>
            <div><BarChart3 className="inline h-4 w-4 mr-1"/><strong>Score:</strong> <span className="text-muted-foreground">{currentContextState.isInitialized ? currentContextState.startupScore : "N/A"}/100</span></div>
            <div><strong>Product Stage:</strong> <span className="text-muted-foreground">{currentContextState.isInitialized ? currentContextState.product.stage : "N/A"}</span></div>
        </CardContent>
      </Card>
      
      <Separator />

      <Tabs defaultValue="strategic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="strategic">Strategic Analysis</TabsTrigger>
            <TabsTrigger value="absurd">Absurdity Arena</TabsTrigger>
        </TabsList>
        <TabsContent value="strategic" className="mt-6">
            <StrategicAnalysisTab />
        </TabsContent>
        <TabsContent value="absurd" className="mt-6">
            <AbsurdityArenaTab />
        </TabsContent>
      </Tabs>
      
      <Separator />

      <Card className="shadow-xl border-blue-500/30" id="save-load-section">
        <CardHeader><CardTitle className="flex items-center gap-3 text-xl text-blue-500"><HistoryIcon className="h-7 w-7" /> Simulation Snapshots &amp; Versioning</CardTitle><CardDescription>Save your main simulation's progress at key milestones or load a previously saved state to explore different paths. Snapshots are of the main simulation, not sandbox experiments.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow"><Label htmlFor="snapshot-name" className="text-base font-medium">Snapshot Name</Label><Input id="snapshot-name" value={snapshotName} onChange={(e) => setSnapshotName(e.target.value)} placeholder="e.g., Pre-Seed Funding Round, MVP Launch State" className="mt-1" disabled={!simState.isInitialized || simState.isSandboxing || isLoadingSnapshotAction} /></div>
                <Button onClick={handleSaveSnapshot} disabled={!simState.isInitialized || simState.isSandboxing || !snapshotName.trim() || isLoadingSnapshotAction} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">{isLoadingSnapshotAction ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Save className="mr-2 h-5 w-5"/>} Save Current Simulation</Button>
            </div>
            {simState.isSandboxing && <Alert variant="default" className="bg-yellow-500/10 border-yellow-500/50 text-yellow-700"><Info className="h-4 w-4 text-yellow-600" /><AlertTitle>Snapshot Info</AlertTitle><AlertDescription>Saving is disabled while in Sandbox mode. Exit sandbox to save the main simulation.</AlertDescription></Alert>}
            <div>
                <h4 className="text-lg font-medium mb-2">Saved Snapshots:</h4>
                {simState.savedSimulations.length === 0 ? <p className="text-muted-foreground">No snapshots saved yet.</p> : (
                <ScrollArea className="max-h-[300px] pr-2">
                    <ul className="space-y-3">{simState.savedSimulations.map((snapshot) => (
                        <li key={snapshot.id} className="p-3 border rounded-md bg-card/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div><p className="font-semibold text-foreground">{snapshot.name}</p><p className="text-xs text-muted-foreground">Saved: {new Date(snapshot.createdAt).toLocaleString()} | Sim Month: {snapshot.simulationState.simulationMonth}</p></div>
                            <div className="flex gap-2 mt-2 sm:mt-0 shrink-0">
                                <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" size="sm" disabled={isLoadingSnapshotAction} className="border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700"><ListRestart className="mr-2 h-4 w-4"/> Load</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Load Snapshot?</AlertDialogTitle><AlertDialogDescription>This will replace your current main simulation state with "{snapshot.name}". Are you sure?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isLoadingSnapshotAction}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleLoadSnapshot(snapshot.id)} disabled={isLoadingSnapshotAction} className="bg-green-600 hover:bg-green-700">{isLoadingSnapshotAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Load Snapshot"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={isLoadingSnapshotAction} className="bg-red-600/10 border-red-600 text-red-700 hover:bg-red-600/20 hover:text-red-800"><Trash2 className="mr-2 h-4 w-4"/> Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Snapshot?</AlertDialogTitle><AlertDialogDescription>Permanently delete "{snapshot.name}"? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isLoadingSnapshotAction}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSnapshot(snapshot.id)} disabled={isLoadingSnapshotAction} className="bg-destructive hover:bg-destructive/90">{isLoadingSnapshotAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                            </div>
                        </li>))}
                    </ul>
                </ScrollArea>
                )}
            </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-xl border-primary/30" id="sandbox-section">
        <CardHeader><CardTitle className="flex items-center gap-3 text-xl text-primary"><PackageOpen className="h-7 w-7" /> Decision Lever Sandbox</CardTitle><CardDescription>Test decisions in an isolated environment. Changes here DO NOT affect your main simulation unless explicitly applied.</CardDescription></CardHeader>
        <CardContent>{!simState.isSandboxing ? (
            <Button onClick={handleStartSandbox} disabled={!simState.isInitialized || isLoadingSnapshotAction} size="lg" className="w-full sm:w-auto"><TestTube2 className="mr-2 h-5 w-5" /> Start Sandbox Experiment</Button>
            ) : (
            <div className="space-y-6">
              <Alert variant="default" className="bg-primary/10 border-primary/50 text-primary-foreground"><TestTube2 className="h-5 w-5 text-primary" /><AlertTitle className="text-primary font-semibold">Sandbox Mode Active</AlertTitle><AlertDescription className="text-primary/90">You are currently experimenting. Sandbox Relative Month: {simState.sandboxRelativeMonth} (Main Sim Origin Month: {simState.sandboxState?.simulationMonth})</AlertDescription></Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card><CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><SlidersHorizontal className="h-5 w-5"/>Sandbox Decision Levers</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     <div><Label htmlFor="sandbox-marketing-spend" className="text-xs">Marketing Spend ({currencySymbol})</Label><Input id="sandbox-marketing-spend" type="number" value={sandboxMarketingSpend} onChange={(e) => setSandboxLocalMarketingSpend(parseInt(e.target.value) || 0)} onBlur={() => simState.setSandboxMarketingSpend(sandboxMarketingSpend)} /></div>
                    <div><Label htmlFor="sandbox-rnd-spend" className="text-xs">R&D Spend ({currencySymbol})</Label><Input id="sandbox-rnd-spend" type="number" value={sandboxRndSpend} onChange={(e) => setSandboxLocalRndSpend(parseInt(e.target.value) || 0)} onBlur={() => simState.setSandboxRndSpend(sandboxRndSpend)} /></div>
                    <div><Label htmlFor="sandbox-price" className="text-xs">Price Per User ({currencySymbol})</Label><Input id="sandbox-price" type="number" value={sandboxPricePerUser} onChange={(e) => setSandboxLocalPricePerUser(parseFloat(e.target.value) || 0)} onBlur={() => simState.setSandboxPricePerUser(sandboxPricePerUser)} /></div>
                    <Separator />
                    <div className="space-y-1"><Label className="text-xs font-medium">Team Composition (Sandbox)</Label><p className="text-xs text-muted-foreground">Adjust your team for this experiment.</p></div>
                    <div className="space-y-2"><Label className="text-xs flex items-center gap-1"><Briefcase className="h-3 w-3"/>Senior Engineers ({getSandboxTeamMemberCount("Engineer - Senior")})</Label><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Engineer - Senior", -1)} disabled={getSandboxTeamMemberCount("Engineer - Senior") === 0 || isLoadingSandboxSim || isLoadingApplySandbox} className="h-8 w-8"><MinusCircle className="h-4 w-4"/></Button><Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Engineer - Senior", 1, DEFAULT_SENIOR_ENGINEER_SALARY_SANDBOX)} disabled={isLoadingSandboxSim || isLoadingApplySandbox} className="h-8 w-8"><PlusCircle className="h-4 w-4"/></Button></div></div>
                    <div className="space-y-2"><Label className="text-xs flex items-center gap-1"><Briefcase className="h-3 w-3"/>Junior Engineers ({getSandboxTeamMemberCount("Engineer - Junior")})</Label><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Engineer - Junior", -1)} disabled={getSandboxTeamMemberCount("Engineer - Junior") === 0 || isLoadingSandboxSim || isLoadingApplySandbox} className="h-8 w-8"><MinusCircle className="h-4 w-4"/></Button><Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Engineer - Junior", 1, DEFAULT_JUNIOR_ENGINEER_SALARY_SANDBOX)} disabled={isLoadingSandboxSim || isLoadingApplySandbox} className="h-8 w-8"><PlusCircle className="h-4 w-4"/></Button></div></div>
                    <div className="space-y-2"><Label className="text-xs flex items-center gap-1"><Briefcase className="h-3 w-3"/>Marketers ({getSandboxTeamMemberCount("Marketer")})</Label><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Marketer", -1)} disabled={getSandboxTeamMemberCount("Marketer") === 0 || isLoadingSandboxSim || isLoadingApplySandbox} className="h-8 w-8"><MinusCircle className="h-4 w-4"/></Button><Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Marketer", 1, DEFAULT_MARKETER_SALARY_SANDBOX)} disabled={isLoadingSandboxSim || isLoadingApplySandbox} className="h-8 w-8"><PlusCircle className="h-4 w-4"/></Button></div></div>
                    <div className="space-y-2"><Label className="text-xs flex items-center gap-1"><Briefcase className="h-3 w-3"/>Salespersons ({getSandboxTeamMemberCount("Salesperson")})</Label><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Salesperson", -1)} disabled={getSandboxTeamMemberCount("Salesperson") === 0 || isLoadingSandboxSim || isLoadingApplySandbox} className="h-8 w-8"><MinusCircle className="h-4 w-4"/></Button><Button variant="outline" size="icon" onClick={() => simState.adjustSandboxTeamMemberCount("Salesperson", 1, DEFAULT_SALESPERSON_SALARY_SANDBOX)} disabled={isLoadingSandboxSim || isLoadingApplySandbox} className="h-8 w-8"><PlusCircle className="h-4 w-4"/></Button></div></div>
                  </CardContent>
                </Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5"/>Sandbox State</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Sandbox Relative Month:</strong> {simState.sandboxRelativeMonth}</p>
                        <p><strong>Cash:</strong> {currencySymbol}{simState.sandboxState?.financials.cashOnHand.toLocaleString()}</p>
                        <p><strong>Users:</strong> {simState.sandboxState?.userMetrics.activeUsers.toLocaleString()}</p>
                        <p><strong>Revenue:</strong> {currencySymbol}{simState.sandboxState?.financials.revenue.toLocaleString()}</p>
                        <p><strong>Burn Rate:</strong> {currencySymbol}{simState.sandboxState?.financials.burnRate.toLocaleString()}</p>
                         <p className="text-xs text-muted-foreground mt-2">Startup scores and full history are only tracked in the main simulation.</p>
                         <ScrollArea className="h-24 mt-2 border p-2 rounded-md text-xs"><p className="font-semibold mb-1">Sandbox AI Log:</p><pre className="whitespace-pre-wrap">{simState.sandboxState?.currentAiReasoning || "Log empty."}</pre></ScrollArea>
                    </CardContent>
                </Card>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSimulateSandboxMonth} disabled={isLoadingSandboxSim || (simState.sandboxState?.financials?.cashOnHand ?? 0) <= 0 || isLoadingApplySandbox} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">{isLoadingSandboxSim ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Zap className="mr-2 h-5 w-5"/>}Simulate 1 Month in Sandbox</Button>
                <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" className="flex-1 border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700" disabled={isLoadingSandboxSim || isLoadingApplySandbox || simState.sandboxRelativeMonth === 0}><CheckCircle className="mr-2 h-5 w-5"/> Apply Decisions to Main Sim</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Apply Sandbox Decisions?</AlertDialogTitle><AlertDialogDescription>This will copy the current decision lever settings from this sandbox to your main simulation. The main simulation's financial metrics and history will NOT be overwritten. The sandbox experiment will then be discarded.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isLoadingApplySandbox}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleApplySandbox} disabled={isLoadingApplySandbox} className="bg-green-600 hover:bg-green-700">{isLoadingApplySandbox ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Apply & Exit Sandbox"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                <Button onClick={handleDiscardSandbox} variant="outline" className="flex-1" disabled={isLoadingSandboxSim || isLoadingApplySandbox}><Trash2 className="mr-2 h-5 w-5"/> Discard Sandbox & Exit</Button>
              </div>
               {(simState.sandboxState?.financials?.cashOnHand ?? 0) <= 0 && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4"/><AlertTitle>Sandbox Out of Cash!</AlertTitle><AlertDescription>This sandbox experiment has run out of funds. Adjust levers or discard.</AlertDescription></Alert>)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
