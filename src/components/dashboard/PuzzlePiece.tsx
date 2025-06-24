
"use client";

import React, { useEffect, useState }  from 'react';
import { motion } from 'framer-motion';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import type { DashboardMilestone } from '@/types/simulation';
import { Lock, CheckCircle } from 'lucide-react';

interface PuzzlePieceProps {
  milestone: DashboardMilestone;
  className?: string;
}

const puzzleVariants = {
  initial: { scale: 1, y: 0, boxShadow: "0 1px 3px hsla(var(--card-foreground)/0.1)" },
  hover: {
    scale: 1.08,
    y: -5,
    boxShadow: "0 10px 20px hsla(var(--accent)/0.25), 0 6px 6px hsla(var(--accent)/0.15)",
    transition: { type: "spring", stiffness: 300, damping: 15 }
  },
  locked: { scale: 1, opacity: 0.65, filter: "grayscale(80%)" },
  unlockedEntryStart: { scale: 0.6, opacity: 0, filter: "blur(4px)", y: 15 },
  unlockedAnimated: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    boxShadow: [
      "0 0 0px 0px hsla(var(--accent)/0)",
      "0 0 12px 6px hsla(var(--accent)/0.35)",
      "0 0 6px 3px hsla(var(--accent)/0.2)",
      "0 1px 3px hsla(var(--card-foreground)/0.1)"
    ],
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 12,
      duration: 0.6,
      boxShadow: { 
        duration: 0.6, 
        times: [0, 0.4, 0.8, 1], 
        ease: "easeInOut",
      },
    }
  },
  unlockedStatic: { scale: 1, opacity: 1, filter: "blur(0px)", y: 0, boxShadow: "0 1px 3px hsla(var(--card-foreground)/0.1)" }
};

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({ milestone, className }) => {
  const IconComponent = milestone.icon || (milestone.isUnlocked ? CheckCircle : Lock);
  const iconColor = milestone.isUnlocked ? 'text-green-500' : 'text-muted-foreground/50';
  const borderColor = milestone.isUnlocked ? 'border-green-500/60' : 'border-dashed border-border/60';
  const bgColor = milestone.isUnlocked ? 'bg-green-500/10' : 'bg-muted/20';
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);

  useEffect(() => {
    setInitialRenderComplete(true);
  }, []);

  const getInitialVariantState = () => {
    return milestone.isUnlocked ? "unlockedStatic" : "locked"; 
  };

  const getAnimateVariantState = () => {
    if (!initialRenderComplete) {
        return milestone.isUnlocked ? "unlockedStatic" : "locked";
    }
    return milestone.isUnlocked ? "unlockedAnimated" : "locked";
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "relative flex flex-col items-center justify-center p-3 aspect-square rounded-lg border transition-colors duration-300 ease-in-out cursor-pointer",
              borderColor,
              bgColor,
              milestone.isUnlocked ? "shadow-md" : "opacity-70",
              className
            )}
            style={{
              clipPath: 'polygon(0% 25%, 25% 25%, 25% 0%, 75% 0%, 75% 25%, 100% 25%, 100% 75%, 75% 75%, 75% 100%, 25% 100%, 25% 75%, 0% 75%)',
            }}
            variants={puzzleVariants}
            initial={getInitialVariantState()} 
            animate={getAnimateVariantState()} 
            whileHover={milestone.isUnlocked ? "hover" : undefined}
          >
            <IconComponent className={cn("w-5 h-5 sm:w-6 sm:h-6 mb-1", iconColor)} />
            {milestone.isUnlocked && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background shadow-sm" />
            )}
            {!milestone.isUnlocked && (
              <div className="absolute inset-0 bg-background/20 backdrop-blur-xs rounded-md" style={{ clipPath: 'inherit' }} />
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover text-popover-foreground shadow-lg border-accent/50">
          <p className="font-semibold">{milestone.name}</p>
          {milestone.description && <p className="text-xs text-muted-foreground">{milestone.description}</p>}
          <p className="text-xs mt-1">{milestone.isUnlocked ? "Status: Unlocked & Secured" : "Status: Locked / Encrypted"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
