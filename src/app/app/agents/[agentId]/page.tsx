
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInterface } from "@/components/mentor/chat-interface";
import { getAgentProfileById, agentsList } from "@/lib/agentsData"; // Assuming agentsList is also exported for fallback
import type { AIAgentProfile } from "@/types/simulation";
import { Loader2, AlertTriangle } from "lucide-react";

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = typeof params.agentId === 'string' ? params.agentId : undefined;
  let agentProfile: AIAgentProfile | undefined = undefined;

  if (agentId) {
    agentProfile = getAgentProfileById(agentId);
  }
  
  useEffect(() => {
    if (agentId && !agentProfile) {
      // Agent ID provided but not found, redirect to main agents page or show error
      console.warn(`Agent profile for ID "${agentId}" not found. Redirecting.`);
      router.replace('/app/agents');
    }
  }, [agentId, agentProfile, router]);

  if (!agentId) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p>Loading agent information...</p>
      </div>
    );
  }

  if (!agentProfile) {
    // This should ideally be caught by useEffect, but as a fallback
    return (
      <div className="container mx-auto py-8 px-4 md:px-0 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
        <p className="text-destructive">Agent not found. You may be redirected.</p>
      </div>
    );
  }
  
  const IconComponent = agentProfile.icon;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${agentProfile.gradientFromClass} ${agentProfile.gradientToClass} shadow-lg`}>
          <IconComponent className={`h-10 w-10 ${agentProfile.iconColorClass}`} />
        </div>
        <div>
          <h1 className="text-3xl font-headline text-foreground">
            Chat with {agentProfile.name}
          </h1>
          <p className="text-muted-foreground">
            {agentProfile.title}. Ask questions related to their specialties. EVE will help facilitate.
          </p>
        </div>
      </header>
      <ChatInterface focusedAgentId={agentProfile.id} focusedAgentName={agentProfile.name} />
    </div>
  );
}

    
    
