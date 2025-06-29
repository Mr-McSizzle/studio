"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInterface } from "@/components/mentor/chat-interface";
import { getAgentProfileById, agentsList } from "@/lib/agentsData"; 
import type { AIAgentProfile } from "@/types/simulation";
import { Loader2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [agentProfile, setAgentProfile] = useState<AIAgentProfile | undefined>(undefined);
  const agentId = typeof params.agentId === 'string' ? params.agentId : undefined;

  useEffect(() => {
    setMounted(true);
    
    if (agentId) {
      const profile = getAgentProfileById(agentId);
      setAgentProfile(profile);
      
      if (!profile) {
        console.warn(`Agent profile for ID "${agentId}" not found. Redirecting.`);
        router.replace('/app/post-launch/agents');
      }
    }
  }, [agentId, router]);
  
  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p>Loading agent information...</p>
      </div>
    );
  }

  if (!agentId) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p>Loading agent information...</p>
      </div>
    );
  }

  if (!agentProfile) {
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
        <Avatar className="h-16 w-16 rounded-full border-2 border-accent/60 shadow-lg">
          <AvatarImage src={agentProfile.avatarUrl} alt={agentProfile.name} className="rounded-full"/>
          <AvatarFallback className={cn("rounded-full flex items-center justify-center bg-gradient-to-br", agentProfile.gradientFromClass, agentProfile.gradientToClass)}>
            <IconComponent className={cn("h-8 w-8", agentProfile.iconColorClass === 'text-primary-foreground' || agentProfile.iconColorClass === 'text-accent-foreground' ? agentProfile.iconColorClass : 'text-card-foreground opacity-80')} />
          </AvatarFallback>
        </Avatar>
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