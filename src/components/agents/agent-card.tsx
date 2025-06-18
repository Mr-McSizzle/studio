
"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { AIAgentProfile } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: AIAgentProfile;
}

export function AgentCard({ agent }: AgentCardProps) {
  const IconComponent = agent.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="flex flex-col h-full shadow-lg bg-card/80 backdrop-blur-sm border border-border hover:border-primary/70 transition-all duration-300 card-glow-hover-primary group">
            <CardHeader className="items-center text-center pt-6 pb-3">
              <Avatar className={cn("h-24 w-24 rounded-md mb-3 border-2", agent.avatarUrl ? "border-accent/50" : agent.gradientFromClass, "shadow-lg group-hover:shadow-accent-glow-sm transition-shadow")}>
                {agent.avatarUrl ? (
                  <AvatarImage src={agent.avatarUrl} alt={`${agent.name} Avatar`} className="object-cover rounded-md" />
                ) : (
                  <div className={cn("w-full h-full flex items-center justify-center rounded-md bg-gradient-to-br", agent.gradientFromClass, agent.gradientToClass)}>
                    <IconComponent className={cn("h-12 w-12", agent.iconColorClass === 'text-primary-foreground' || agent.iconColorClass === 'text-accent-foreground' ? agent.iconColorClass : 'text-card-foreground opacity-90')} />
                  </div>
                )}
                <AvatarFallback className={cn("rounded-md flex items-center justify-center bg-gradient-to-br", agent.gradientFromClass, agent.gradientToClass)}>
                   <IconComponent className={cn("h-12 w-12", agent.iconColorClass === 'text-primary-foreground' || agent.iconColorClass === 'text-accent-foreground' ? agent.iconColorClass : 'text-card-foreground opacity-90')} />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl font-headline text-foreground">{agent.name}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">{agent.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col pt-2 pb-5 px-5">
              <div className="text-center mb-auto">
                 {/* Description can be moved to tooltip to save space if cards are too tall */}
              </div>
              <Button 
                  asChild 
                  className={cn(
                      "w-full mt-auto bg-gradient-to-r text-sm py-3 text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:brightness-110 transform hover:scale-[1.02]",
                      agent.gradientFromClass,
                      agent.gradientToClass,
                      "group-hover:opacity-100 opacity-90" 
                  )}
              >
                <Link href={agent.actionLink || '/app/mentor'}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with {agent.shortName}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="start" 
          className="bg-card/50 backdrop-blur-lg border-accent/50 shadow-xl p-4 max-w-xs space-y-2 animate-tooltip-slide-in"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-2 rounded-md bg-gradient-to-br", agent.gradientFromClass, agent.gradientToClass)}>
                <IconComponent className={cn("h-6 w-6", agent.iconColorClass === 'text-primary-foreground' || agent.iconColorClass === 'text-accent-foreground' ? agent.iconColorClass : 'text-card-foreground opacity-90')} />
            </div>
            <div>
                <p className="font-bold text-lg text-foreground">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.title}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-accent"/>Specialties:</h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-accent/10 border-accent/30 text-accent-foreground/80 hover:bg-accent/20">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
