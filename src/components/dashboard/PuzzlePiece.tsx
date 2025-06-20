
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
    y: -4,
    boxShadow: "0 10px 20px hsla(var(--accent)/0.3), 0 6px 6px hsla(var(--accent)/0.2)",
    transition: { type: "spring", stiffness: 300, damping: 15 }
  },
  locked: { scale: 1, opacity: 0.7, filter: "grayscale(50%)" },
  // Variant for the state just before unlocking, to animate from
  unlockedEntryStart: { scale: 0.5, opacity: 0, filter: "blur(5px)" },
  // Variant for the final unlocked state, including the glow animation
  unlockedAnimated: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    boxShadow: [ // Animate boxShadow for glow
      "0 0 0px 0px hsla(var(--accent)/0)",
      "0 0 25px 12px hsla(var(--accent)/0.5)", // Peak glow
      "0 0 10px 5px hsla(var(--accent)/0.3)",  // Settle glow
      "0 1px 3px hsla(var(--card-foreground)/0.1)" // Final subtle shadow
    ],
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 12,
      duration: 0.7,
      boxShadow: { // Specific transition for boxShadow
        duration: 0.7,
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut",
      },
    }
  },
  // Variant for already unlocked items (no entry animation)
  unlockedStatic: { scale: 1, opacity: 1, filter: "blur(0px)", boxShadow: "0 1px 3px hsla(var(--card-foreground)/0.1)" }
};

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({ milestone, className }) => {
  const IconComponent = milestone.icon || (milestone.isUnlocked ? CheckCircle : Lock);
  const iconColor = milestone.isUnlocked ? 'text-green-500' : 'text-muted-foreground/60';
  const borderColor = milestone.isUnlocked ? 'border-green-500/50' : 'border-dashed border-border/70';
  const bgColor = milestone.isUnlocked ? 'bg-green-500/10' : 'bg-muted/30';

  const [initialRenderComplete, setInitialRenderComplete] = useState(false);
  const [isCurrentlyUnlocked, setIsCurrentlyUnlocked] = useState(milestone.isUnlocked);

  useEffect(() => {
    setIsCurrentlyUnlocked(milestone.isUnlocked);
    // Ensure initial animation for items that are unlocked on first load but after initial state check.
    // Or, if it transitions from locked to unlocked.
    if (milestone.isUnlocked && !isCurrentlyUnlocked && initialRenderComplete) {
      // This means it just became unlocked
    }
    if (!initialRenderComplete) {
      setInitialRenderComplete(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone.isUnlocked]);


  const getInitialVariantState = () => {
    if (milestone.isUnlocked) {
      // If it was already unlocked (isCurrentlyUnlocked was true on component's previous state), show static.
      // If it just became unlocked (isCurrentlyUnlocked was false, now true), start animation.
      return isCurrentlyUnlocked ? "unlockedStatic" : "unlockedEntryStart";
    }
    return "locked";
  };

  const getAnimateVariantState = () => {
    if (milestone.isUnlocked) {
      return "unlockedAnimated";
    }
    return "locked";
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
            whileHover={milestone.isUnlocked ? "hover" : undefined} // Only allow hover effect if unlocked
          >
            <IconComponent className={cn("w-5 h-5 sm:w-6 sm:h-6 mb-1", iconColor)} />
            {milestone.isUnlocked && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background shadow-sm" />
            )}
            {!milestone.isUnlocked && (
              <div className="absolute inset-0 bg-background/30 backdrop-blur-xs rounded-md" style={{ clipPath: 'inherit' }} />
            )}
          </motion.div>
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

