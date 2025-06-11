
"use client";

import { useState } from "react";
import { getStrategyRecommendations, type StrategyRecommendationsInput } from "@/ai/flows/strategy-recommendations";
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

  const getCurrentSimulationData = (): object | null => {
    // Placeholder: In a real application, this would retrieve current simulation data
    // from a state management store (e.g., Zustand, Redux, Context API)
    // or a service that holds the live state of the "digital twin".
    // For now, we'll simulate that data might be missing.
    // To test, you could temporarily return a dummy object here:
    // return { exampleMetric: 100, status: "active" }; 
    return null; 
  };


  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const currentSimData = getCurrentSimulationData();

    if (!currentSimData) {
      setError("No live simulation data available for analysis. Please ensure your digital twin simulation is active and has generated data.");
      toast({
        title: "Simulation Data Missing",
        description: "Cannot generate recommendations without active simulation data from your digital twin.",
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
        title: "Strategic Insights Generated",
        description: "Predictive analytics and recommendations for your digital twin are ready.",
      });
    } catch (err) {
      console.error("Error generating recommendations:", err);
      let errorMessage = "Failed to generate strategic recommendations. Please try again.";
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

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>AI-Powered Strategic Analysis</CardTitle>
          <CardDescription>
            Request an AI analysis of your current simulation state. The AI will provide insights on potential risks, opportunities, and strategic adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button
            onClick={handleGenerateRecommendations}
            disabled={isLoading}
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

      {!isLoading && !recommendations && !error && (
         <Card className="shadow-lg text-center py-12 border-dashed">
          <CardContent>
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Click the button above to generate strategic recommendations based on your digital twin's current simulation data.
            </p>
             <p className="text-xs text-muted-foreground mt-2">
              Ensure your simulation has progressed to provide data for analysis. Currently, this requires manual data input for the `getCurrentSimulationData` function.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
