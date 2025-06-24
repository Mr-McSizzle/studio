
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FlaskConical, Info, AlertTriangle, Sparkles, Loader2, DollarSign, Users, BarChart3, Bot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { simulateFeatureLaunch, type SimulateFeatureLaunchInput, type SimulateFeatureLaunchOutput } from "@/ai/flows/simulate-feature-launch-flow";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAgentProfileById } from "@/lib/agentsData";

export default function InnovationHubPage() {
  const router = useRouter();
  const { isInitialized, ...simState } = useSimulationStore();
  const { toast } = useToast();

  const [featureName, setFeatureName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] =useState<string | null>(null);
  const [results, setResults] = useState<SimulateFeatureLaunchOutput | null>(null);

  const getSerializableSimulationState = () => {
    // Abridged state for the AI
    return {
      simulationMonth: simState.simulationMonth,
      companyName: simState.companyName,
      financials: simState.financials,
      userMetrics: simState.userMetrics,
      product: simState.product,
      market: simState.market,
      startupScore: simState.startupScore,
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!featureName.trim() || !targetAudience.trim() || !estimatedBudget.trim()) {
      toast({ title: "All Fields Required", description: "Please describe your feature, its audience, and a budget.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const input: SimulateFeatureLaunchInput = {
        simulationStateJSON: JSON.stringify(getSerializableSimulationState()),
        featureName,
        targetAudience,
        estimatedBudget: parseFloat(estimatedBudget) || 0,
      };
      
      const analysisResults = await simulateFeatureLaunch(input);
      setResults(analysisResults);
      toast({ title: "Analysis Complete", description: "EVE and her team have reviewed your proposal." });

    } catch (err) {
      console.error("Error simulating feature launch:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-accent" />
          Innovation Hub
        </h1>
        <p className="text-muted-foreground">
          Propose a new feature or product line and let your AI team analyze its potential impact.
        </p>
      </header>
      
      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            You must have an active simulation to use the Innovation Hub.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-8">
            <CardHeader>
              <CardTitle>Launch Proposal</CardTitle>
              <CardDescription>Define your next big move.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="feature-name">Feature / Product Name</Label>
                  <Input 
                    id="feature-name"
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    placeholder="e.g., AI-Powered Analytics Suite"
                    disabled={isLoading || !isInitialized}
                  />
                </div>
                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Textarea
                    id="target-audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Existing power users, enterprise clients"
                    disabled={isLoading || !isInitialized}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated-budget">Estimated Budget ({simState.financials.currencySymbol})</Label>
                  <Input
                    id="estimated-budget"
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    placeholder="e.g., 50000"
                    disabled={isLoading || !isInitialized}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !isInitialized}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isLoading ? "Analyzing..." : "Get AI Analysis"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {error && (
             <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!results && !isLoading && (
            <Card className="text-center py-12 border-dashed">
              <CardContent>
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Awaiting Proposal</h3>
                <p className="text-muted-foreground">Fill out the form to get an AI-powered analysis of your feature launch.</p>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card>
                <CardHeader>
                    <CardTitle>AI Analysis in Progress...</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-16 w-16 text-primary animate-spin"/>
                    <p className="mt-4 text-muted-foreground">Your AI team is crunching the numbers...</p>
                </CardContent>
            </Card>
          )}
          
          {results && (
            <>
              <Card className="shadow-lg animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/>Quantitative Projections (3-Month Outlook)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-xs text-muted-foreground">User Adoption (Existing)</p>
                    <p className="text-lg font-bold text-foreground">~{results.projections.projectedUserAdoption.toLocaleString()}</p>
                  </div>
                   <div className="p-3 rounded-md bg-muted">
                    <p className="text-xs text-muted-foreground">New User Attraction</p>
                    <p className="text-lg font-bold text-foreground">~{results.projections.projectedNewUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-xs text-muted-foreground">Monthly Revenue Impact</p>
                    <p className="text-lg font-bold text-green-500">+{simState.financials.currencySymbol}{results.projections.projectedRevenueImpact.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-xs text-muted-foreground">Monthly Burn Increase</p>
                    <p className="text-lg font-bold text-destructive">~{simState.financials.currencySymbol}{results.projections.projectedBurnRateChange.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg animate-fadeIn" style={{animationDelay: '0.2s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary"/>Qualitative Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                       <Avatar className="h-7 w-7 border-2 border-accent">
                          <AvatarImage src={getAgentProfileById('eve-hive-mind')?.avatarUrl} />
                          <AvatarFallback>E</AvatarFallback>
                       </Avatar>
                       EVE's Strategic Overview
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">{results.feedback.eveFeedback}</p>
                  </div>
                  <div className="space-y-3">
                    {results.feedback.agentFeedback.map((agentFeedback) => {
                      const agentProfile = getAgentProfileById(agentFeedback.agentId);
                      return (
                        <div key={agentFeedback.agentId}>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Avatar className="h-7 w-7 border-2 border-secondary">
                              <AvatarImage src={agentProfile?.avatarUrl} />
                              <AvatarFallback>{agentProfile?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {agentFeedback.agentName}'s Analysis
                          </h4>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">{agentFeedback.feedback}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
