
"use client";

import { useState } from "react";
import { getStrategyRecommendations, type StrategyRecommendationsInput } from "@/ai/flows/strategy-recommendations";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/strategy/recommendation-card";
import { Loader2, AlertTriangle, Lightbulb, Brain } from "lucide-react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function StrategyPage() {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentSimState = useSimulationStore(state => state);
  const isInitialized = useSimulationStore(state => state.isInitialized);

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    if (!isInitialized || !currentSimState) {
      setError("No live simulation data available for analysis. Please initialize your digital twin simulation on the 'Setup Simulation' page and advance a few months to generate data.");
      toast({
        title: "Simulation Data Missing",
        description: "Cannot generate recommendations without active simulation data from your digital twin.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Create a serializable version of the state for the AI flow
    // Exclude functions like advanceMonth, initializeSimulation etc.
    const serializableSimState = {
      simulationMonth: currentSimState.simulationMonth,
      companyName: currentSimState.companyName,
      financials: currentSimState.financials,
      userMetrics: currentSimState.userMetrics,
      product: currentSimState.product,
      resources: currentSimState.resources,
      market: currentSimState.market,
      startupScore: currentSimState.startupScore,
      keyEvents: currentSimState.keyEvents.slice(-5), // Send last 5 events
      missions: currentSimState.missions.map(m => ({ title: m.title, isCompleted: m.isCompleted, description: m.description })), // Simplified missions
      suggestedChallenges: currentSimState.suggestedChallenges,
    };


    try {
      const input: StrategyRecommendationsInput = {
        simulationData: JSON.stringify(serializableSimState, null, 2),
      };
      const result = await getStrategyRecommendations(input);
      setRecommendations(result.recommendations);
      toast({
        title: "Strategic Insights Generated",
        description: "Predictive analytics and recommendations for your digital twin are ready.",
      });
    } catch (err) {
      console.error("Error generating recommendations:", err);
      let errorMessage = "Failed to generate strategic recommendations. The AI may be unavailable or the simulation data is not in the expected format. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-accent"/>
            Predictive Analytics & Strategy
        </h1>
        <p className="text-muted-foreground">
          Leverage AI to analyze your digital twin's performance, predict outcomes, identify risks, and receive actionable strategic recommendations.
        </p>
      </header>

      {!isInitialized && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Setup Simulation" page to initialize your digital twin before generating strategic recommendations.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>AI-Powered Strategic Analysis</CardTitle>
          <CardDescription>
            Request an AI analysis of your current simulation state. The AI will provide insights on potential risks, opportunities, and strategic adjustments. Ensure your simulation is initialized and has progressed for meaningful analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button
            onClick={handleGenerateRecommendations}
            disabled={isLoading || !isInitialized}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
            >
            {isLoading ? (
                <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Digital Twin...
                </>
            ) : (
                "Generate AI Strategic Insights"
            )}
            </Button>
        </CardContent>
      </Card>
      

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations && (
        <div className="space-y-6">
          <RecommendationCard
            title="Strategic Insights & Predictions"
            recommendation={recommendations}
          />
        </div>
      )}

      {!isLoading && !recommendations && !error && isInitialized && (
         <Card className="shadow-lg text-center py-12 border-dashed">
          <CardContent>
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Click the button above to generate strategic recommendations based on your digital twin's current simulation data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
