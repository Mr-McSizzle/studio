
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSimulationStore } from "@/store/simulationStore";
import { AgentCard } from "@/components/agents/agent-card";
import { agentsList } from "@/lib/agentsData"; // Import from shared location
import { Users, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AIAgentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isInitialized, simulationMonth } = useSimulationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-10">
        <div className="flex items-center gap-4">
            <Users className="h-10 w-10 text-accent"/>
            <div>
                <h1 className="text-3xl font-headline text-foreground">
                Meet Your AI Agent Team
                </h1>
                <p className="text-muted-foreground">
                Leverage specialized AI expertise to guide your startup's journey in ForgeSim. Click on an agent to start a focused conversation.
                </p>
            </div>
        </div>
      </header>

      {!isInitialized && (
        <Alert variant="default" className="mb-8 bg-secondary/30 border-secondary">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Your AI Agent team is ready! Initialize your main simulation to start collaborating with them effectively.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm" variant="outline">Setup Simulation</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {agentsList.filter(agent => agent.id !== 'eve-hive-mind').map((agent) => ( // Exclude EVE from this list as she has her own main chat
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
