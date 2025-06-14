
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStrategyRecommendations, type StrategyRecommendationsInput } from "@/ai/flows/strategy-recommendations";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/strategy/recommendation-card";
import { Loader2, AlertTriangle, Lightbulb, Brain } from "lucide-react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function StrategyPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentSimState = useSimulationStore(state => state);
  const isInitialized = useSimulationStore(state => state.isInitialized);
  const simulationMonth = useSimulationStore(state => state.simulationMonth); // For redirect check

  useEffect(() => {
     if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    if (!isInitialized || !currentSimState || currentSimState.financials.cashOnHand <=0) {
      let description = "No live simulation data available. Initialize your simulation on the 'Setup Simulation' page and advance a few months.";
      if (currentSimState?.financials.cashOnHand <=0) {
        description = "Cannot generate recommendations as the simulation is in a 'Game Over' state (out of cash). Please reset the simulation.";
      }
      setError(description);
      toast({
        title: "Cannot Generate Recommendations",
        description: description,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    const serializableSimState = {
      simulationMonth: currentSimState.simulationMonth,
      companyName: currentSimState.companyName,
      financials: currentSimState.financials,
      userMetrics: currentSimState.userMetrics,
      product: currentSimState.product,
      resources: currentSimState.resources,
      market: currentSimState.market,
      startupScore: currentSimState.startupScore,
      keyEvents: currentSimState.keyEvents.slice(-5), 
      missions: currentSimState.missions.map(m => ({ title: m.title, isCompleted: m.isCompleted, description: m.description })), 
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
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}
      
      {currentSimState.financials.cashOnHand <= 0 && isInitialized && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Game Over - Out of Cash!</AlertTitle>
          <AlertDescription>
            Strategic analysis is unavailable as the simulation is in a 'Game Over' state. Reset the simulation from the dashboard to try again.
          </AlertDescription>
        </Alert>
      )}


      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>AI-Powered Strategic Analysis</CardTitle>
          <CardDescription>
            Request an AI analysis of your current simulation state. The AI will provide insights on potential risks, opportunities, and strategic adjustments. Ensure your simulation is initialized, has progressed, and is not in a 'Game Over' state for meaningful analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button
            onClick={handleGenerateRecommendations}
            disabled={isLoading || !isInitialized || currentSimState.financials.cashOnHand <= 0}
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

      {isLoading && !recommendations && (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {recommendations && !isLoading && (
        <div className="space-y-6">
          <RecommendationCard
            title="Strategic Insights & Predictions"
            recommendation={recommendations}
          />
        </div>
      )}

      {!isLoading && !recommendations && !error && isInitialized && currentSimState.financials.cashOnHand > 0 && (
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
