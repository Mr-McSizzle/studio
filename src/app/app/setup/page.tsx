
"use client";

import { useState } from "react";
import { promptStartup, type PromptStartupInput, type PromptStartupOutput } from "@/ai/flows/prompt-startup";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle, Lightbulb, Rocket } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function SetupSimulationPage() {
  const [startupPrompt, setStartupPrompt] = useState("");
  const [simulationOutput, setSimulationOutput] = useState<PromptStartupOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your startup idea.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSimulationOutput(null);

    try {
      const input: PromptStartupInput = { prompt: startupPrompt };
      const result = await promptStartup(input);
      setSimulationOutput(result);
      toast({
        title: "Simulation Initialized!",
        description: "Initial conditions and challenges have been generated.",
      });
    } catch (err) {
      console.error("Error initializing startup:", err);
      let errorMessage = "Failed to initialize simulation. Please try again.";
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

  const prettyPrintJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString; // Return original if parsing fails
    }
  };

  const parseChallenges = (challengesString: string): string[] => {
    try {
      const parsed = JSON.parse(challengesString);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed;
      }
      return ["Invalid challenges format."];
    } catch (e) {
      return ["Error parsing challenges."];
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
          <Rocket className="h-8 w-8 text-accent" />
          Setup Your Simulation
        </h1>
        <p className="text-muted-foreground">
          Describe your startup idea, and we'll generate the initial scenario for your simulation.
        </p>
      </header>

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Describe Your Startup</CardTitle>
          <CardDescription>
            Provide a detailed description of your business concept, target market, and unique selling propositions.
            The more detail you provide, the better the simulation setup will be.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="startup-prompt" className="text-sm font-medium mb-2 block">Your Startup Idea</Label>
              <Textarea
                id="startup-prompt"
                value={startupPrompt}
                onChange={(e) => setStartupPrompt(e.target.value)}
                placeholder="e.g., A SaaS platform for small businesses to manage their social media presence, with AI-powered content suggestions..."
                rows={6}
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !startupPrompt.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Scenario...
                </>
              ) : (
                "Initialize Simulation"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Generating Scenario</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {simulationOutput && (
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Initial Conditions</CardTitle>
              <CardDescription>This JSON outlines the starting state of your simulated startup.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {prettyPrintJson(simulationOutput.initialConditions)}
              </pre>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Suggested Challenges</CardTitle>
              <CardDescription>Potential hurdles your startup might encounter.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 bg-muted p-4 rounded-md text-sm">
                {parseChallenges(simulationOutput.suggestedChallenges).map((challenge, index) => (
                  <li key={index}>{challenge}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && !simulationOutput && !error && (
         <Card className="shadow-lg text-center py-12 border-dashed">
          <CardContent>
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Enter your startup idea above and click "Initialize Simulation" to see the generated scenario.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
