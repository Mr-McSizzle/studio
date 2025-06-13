
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Beaker, Construction, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function InnovationLabPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isInitialized: simIsInitialized, simulationMonth } = useSimulationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!simIsInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        // Allow access to lab even if sim not set up, but features might be limited.
    }
  }, [isAuthenticated, simIsInitialized, simulationMonth, router]);


  if (!isAuthenticated) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen">
          <p>Redirecting to login...</p>
       </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-10">
        <div className="flex items-center gap-4">
            <Beaker className="h-10 w-10 text-accent" />
            <div>
                <h1 className="text-3xl font-headline text-foreground">
                    Innovation Lab
                </h1>
                <p className="text-muted-foreground">Experiment with advanced simulation scenarios and decision parameters.</p>
            </div>
        </div>
      </header>
      
       {!simIsInitialized && (
        <Alert variant="default" className="mb-6 bg-secondary/30 border-secondary">
          <Info className="h-4 w-4" />
          <AlertTitle>Simulation Not Yet Initialized</AlertTitle>
          <AlertDescription>
            Some lab features may require an active simulation. You can still explore conceptual tools.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm" variant="outline">Setup Your Simulation</Button>
          </AlertDescription>
        </Alert>
      )}


      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Construction className="h-6 w-6 text-primary" />
              Under Construction
            </CardTitle>
            <CardDescription>
              This Innovation Lab is currently under development.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center py-10">
            <Beaker className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Future home for advanced scenario testing, deep dives into AI agent interactions, and more granular control over simulation variables.
            </p>
            <p className="text-sm text-muted-foreground">
                Check back later for exciting new features!
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              Purpose of the Lab
            </CardTitle>
            <CardDescription>
              What to expect from this space in the future.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The Innovation Lab will be your sandbox for:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Testing specific AI agent capabilities in isolation.</li>
                <li>Running more complex "what-if" scenarios not covered in basic decision controls.</li>
                <li>Exploring the impact of multiple simultaneous strategic shifts.</li>
                <li>Potentially visualizing data flows and AI decision-making processes.</li>
                <li>(PRD Feature) Simulating specific risk scenarios like economic downturns or product backlashes.</li>
            </ul>
             <p className="mt-4">It aims to provide a deeper, more experimental layer to the ForgeSim experience.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    