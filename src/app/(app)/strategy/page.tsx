"use client";

import { useState } from "react";
import { getStrategyRecommendations } from "@/ai/flows/strategy-recommendations";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/strategy/recommendation-card";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Dummy simulation data
const dummySimulationData = {
  companyName: "ForgeSim Innovations",
  currentQuarter: "Q3 2024",
  financials: {
    revenue: 45231,
    expenses: 50462,
    profit: -5231,
    burnRate: 5231,
    cashOnHand: 150000,
  },
  metrics: {
    activeUsers: 2350,
    userGrowthRate: 0.25, // 25% month-over-month
    customerAcquisitionCost: 15,
    churnRate: 0.05, // 5%
  },
  product: {
    developmentStage: "MVP v2",
    featuresReleased: ["Core Platform", "User Profiles", "Basic Analytics"],
    upcomingFeatures: ["Advanced Analytics", "Team Collaboration"],
  },
  market: {
    targetSegment: "Early-stage tech startups",
    marketSize: 1000000, // Potential customers
    competitorActivity: "Moderate",
  },
  recentEvents: [
    "Launched marketing campaign targeting SaaS companies.",
    "Received positive feedback on new UI/UX.",
    "Key competitor raised a new funding round.",
  ],
};

export default function StrategyPage() {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const result = await getStrategyRecommendations({
        simulationData: JSON.stringify(dummySimulationData, null, 2),
      });
      setRecommendations(result.recommendations);
      toast({
        title: "Recommendations Generated",
        description: "Strategic insights are ready for review.",
      });
    } catch (err) {
      console.error("Error generating recommendations:", err);
      setError("Failed to generate recommendations. Please try again.");
      toast({
        title: "Error",
        description: "Could not generate strategic recommendations.",
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
          Leverage AI to get actionable strategies based on your simulation data.
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
          {/* Could potentially parse recommendations if it's structured JSON and create multiple cards */}
        </div>
      )}

      {!isLoading && !recommendations && !error && (
         <Card className="shadow-lg text-center py-12">
          <CardContent>
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Click the button above to generate strategic recommendations based on your current (simulated) startup data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
