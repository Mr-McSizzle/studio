
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mission } from '@/types/simulation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface HexPuzzlePieceProps {
  mission: Mission;
  style: React.CSSProperties; // For absolute positioning from the board
}

const pieceVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: Math.random() * 0.4, // Stagger entry for a pleasing effect
    },
  },
};

export const HexPuzzlePiece: React.FC<HexPuzzlePieceProps> = ({ mission, style }) => {
  // This component only renders if the mission is completed,
  // controlled by the parent board component.
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            style={style}
            className="absolute group"
            variants={pieceVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.1, zIndex: 10, transition: { type: 'spring', stiffness: 300 } }}
          >
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br from-primary/60 to-accent/50 border-2 border-accent/60 shadow-lg shadow-accent/20 cursor-pointer",
                "transition-all duration-300 group-hover:shadow-accent-glow-md group-hover:border-accent"
              )}
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-2">
                <Puzzle className="w-1/2 h-1/2 text-primary-foreground/80 group-hover:text-primary-foreground transition-colors" />
              </div>
               <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100" />
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover/80 backdrop-blur-md border-accent/50 shadow-xl max-w-xs">
          <p className="font-bold text-base text-popover-foreground">{mission.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
          <Badge variant="outline" className="mt-2 border-green-500/50 text-green-400 bg-green-500/10">
            Objective Complete
          </Badge>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
