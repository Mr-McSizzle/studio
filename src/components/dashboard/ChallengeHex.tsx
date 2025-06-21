
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChallengeHexProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  delay?: number;
}

const hexVariants = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay: 0.2 + delay * 0.15,
    },
  }),
};

export const ChallengeHex: React.FC<ChallengeHexProps> = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="relative w-48 h-52 group cursor-pointer"
            variants={hexVariants}
            initial="initial"
            animate="animate"
            whileHover={{ scale: 1.05, zIndex: 10 }}
            custom={delay}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br from-card to-secondary/50 border border-border transition-all duration-300 ease-in-out group-hover:border-accent group-hover:shadow-accent-glow-md",
                "animate-pulse-glow-border"
              )}
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                animationDuration: '4s', // Slower pulse
                animationDelay: `${delay * 0.5}s`,
              }}
            >
              <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="mb-2 p-3 bg-primary/20 rounded-full animate-float-pulse" style={{ animationDelay: `${delay * 0.3}s` }}>
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-headline text-lg text-foreground">{title}</h4>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover/80 backdrop-blur-md border-accent/50 shadow-xl max-w-xs">
          <p className="font-bold text-base text-popover-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
