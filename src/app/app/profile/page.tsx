
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Settings, History, AlertTriangle } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { isInitialized, simulationMonth } = useSimulationStore();

  useEffect(() => {
    if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
          <User className="h-8 w-8 text-accent" />
          Founder Profile & Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your ForgeSim account and simulation preferences.
        </p>
      </header>

      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Setup Simulation" page to initialize your digital twin before accessing profile features.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and application preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-10">
            <p>(Account settings UI will be here - e.g., change email, password, theme.)</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Simulation History
            </CardTitle>
            <CardDescription>
              Review past simulation runs and their outcomes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-10">
            <p>(List of past simulations and high-level results will be displayed here.)</p>
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ForgeSim Preferences
            </CardTitle>
            <CardDescription>
              Customize your ForgeSim experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-10">
            <p>(Options for AI interaction style, notification settings, etc., will be here.)</p>
          </CardContent>
        </Card>
    </div>
  );
}
