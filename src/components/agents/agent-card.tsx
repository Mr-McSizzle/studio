
"use client";

import Link from 'next/link';
import type { AIAgentProfile } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: AIAgentProfile;
}

export function AgentCard({ agent }: AgentCardProps) {
  const IconComponent = agent.icon;

  return (
    <Card className="flex flex-col h-full shadow-lg bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 card-glow-hover-primary">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg bg-gradient-to-br", agent.gradientFromClass, agent.gradientToClass)}>
            <IconComponent className={cn("h-8 w-8", agent.iconColorClass === 'text-primary-foreground' || agent.iconColorClass === 'text-accent-foreground' ? agent.iconColorClass : 'text-card-foreground opacity-90')} />
          </div>
          <div>
            <CardTitle className="text-2xl font-headline text-foreground">{agent.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{agent.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-grow">
          {agent.description}
        </p>
        <div className="mb-5">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Specialties:</h4>
          <ul className="space-y-1.5">
            {agent.specialties.map((specialty, index) => (
              <li key={index} className="flex items-center text-xs text-muted-foreground gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {specialty}
              </li>
            ))}
          </ul>
        </div>
        <Button 
            asChild 
            className={cn(
                "w-full mt-auto bg-gradient-to-r text-sm py-3 text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:brightness-110 transform hover:scale-[1.02]",
                agent.gradientFromClass,
                agent.gradientToClass
            )}
        >
          <Link href={agent.actionLink || '/app/mentor'}>
            <MessageSquare className="mr-2 h-4 w-4" />
            {agent.actionText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
