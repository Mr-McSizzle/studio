
"use client";

import React from 'react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import type { DashboardMilestone } from '@/types/simulation';
import { Lock, CheckCircle } from 'lucide-react'; // Default icons

interface PuzzlePieceProps {
  milestone: DashboardMilestone;
  className?: string;
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({ milestone, className }) => {
  const IconComponent = milestone.icon || (milestone.isUnlocked ? CheckCircle : Lock);
  const iconColor = milestone.isUnlocked ? 'text-green-500' : 'text-muted-foreground/60';
  const borderColor = milestone.isUnlocked ? 'border-green-500/50' : 'border-dashed border-border/70';
  const bgColor = milestone.isUnlocked ? 'bg-green-500/10' : 'bg-muted/30';

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative flex flex-col items-center justify-center p-3 aspect-square rounded-lg border transition-all duration-300 ease-in-out transform hover:scale-105",
              borderColor,
              bgColor,
              milestone.isUnlocked ? "shadow-md hover:shadow-lg" : "opacity-70 hover:opacity-90",
              className
            )}
            style={{
                // Basic puzzle piece shape (can be improved with ::before/::after or more complex clip-path)
                clipPath: 'polygon(0% 25%, 25% 25%, 25% 0%, 75% 0%, 75% 25%, 100% 25%, 100% 75%, 75% 75%, 75% 100%, 25% 100%, 25% 75%, 0% 75%)',
            }}
          >
            <IconComponent className={cn("w-5 h-5 sm:w-6 sm:h-6 mb-1", iconColor)} />
            {/* <p className={cn("text-xs text-center font-medium truncate w-full", milestone.isUnlocked ? "text-foreground/80" : "text-muted-foreground/70")}>
              {milestone.name.length > 15 ? milestone.name.substring(0,12) + "..." : milestone.name}
            </p> */}
            {milestone.isUnlocked && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background shadow-sm" />
            )}
            {!milestone.isUnlocked && (
                <div className="absolute inset-0 bg-background/30 backdrop-blur-xs rounded-md" style={{
                    clipPath: 'inherit', // Ensure blur respects the puzzle shape
                }}/>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover text-popover-foreground shadow-lg border-accent/50">
          <p className="font-semibold">{milestone.name}</p>
          {milestone.description && <p className="text-xs text-muted-foreground">{milestone.description}</p>}
          <p className="text-xs mt-1">{milestone.isUnlocked ? "Status: Unlocked" : "Status: Locked"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
