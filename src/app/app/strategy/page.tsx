
"use client";

import { useState } from "react";
import { getStrategyRecommendations, type StrategyRecommendationsInput } from "@/ai/flows/strategy-recommendations";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/strategy/recommendation-card";
import { Loader2, AlertTriangle, Lightbulb } from "lucide-react"; // Added Lightbulb
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// No dummy simulation data here. It should come from app state or services.

export default function StrategyPage() {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // This function would ideally get simulationData from your application's state
  // For now, it's a placeholder. You'll need to integrate this with your actual simulation data source.
  const getCurrentSimulationData = (): object | null => {
    // Placeholder: In a real app, this would retrieve current simulation data
    // from a state management store (e.g., Zustand, Redux, Context API)
    // or a service that holds the simulation state.
    // console.log("Attempting to get current simulation data (placeholder).");
    // Example: return mySimulationStore.getState().currentData;
    return null; // Return null if no data is available
  };


  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const currentSimData = getCurrentSimulationData();

    if (!currentSimData) {
      setError("No simulation data available to generate recommendations. Please run a simulation first.");
      toast({
        title: "Missing Data",
        description: "No simulation data found. Please ensure your simulation has data.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const input: StrategyRecommendationsInput = {
        simulationData: JSON.stringify(currentSimData, null, 2),
      };
      const result = await getStrategyRecommendations(input);
      setRecommendations(result.recommendations);
      toast({
        title: "Recommendations Generated",
        description: "Strategic insights are ready for review.",
      });
    } catch (err) {
      console.error("Error generating recommendations:", err);
      let errorMessage = "Failed to generate recommendations. Please try again.";
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
        <h1 className="text-3xl font-headline text-foreground">Strategic Recommendations</h1>
        <p className="text-muted-foreground">
          Leverage AI to get actionable strategies based on your live simulation data.
        </p>
      </header>

      <div className="mb-8">
        <Button
          onClick={handleGenerateRecommendations}
          disabled={isLoading}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate AI Recommendations"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations && (
        <div className="space-y-6">
          <RecommendationCard
            title="AI-Powered Strategy Insights"
            recommendation={recommendations}
          />
        </div>
      )}

      {!isLoading && !recommendations && !error && (
         <Card className="shadow-lg text-center py-12">
          <CardContent>
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Click the button above to generate strategic recommendations based on your current simulation data.
            </p>
             <p className="text-xs text-muted-foreground mt-2">
              Ensure your simulation has progressed to provide data for analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
