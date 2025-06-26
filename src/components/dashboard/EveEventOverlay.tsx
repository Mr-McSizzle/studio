
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, Check, X } from 'lucide-react';
import { TavusVideoPlaceholder } from './TavusVideoPlaceholder';

interface EveEventOverlayProps {
  isOpen: boolean;
  title: string;
  description: string;
  acceptOption: {
    label: string;
    description: string;
  };
  rejectOption: {
    label: string;
    description: string;
  };
  onResolve: (outcome: 'accepted' | 'rejected') => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const dialogVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.2,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1], // A nice "elastic" ease
    },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

export const EveEventOverlay: React.FC<EveEventOverlayProps> = ({
  isOpen,
  title,
  description,
  acceptOption,
  rejectOption,
  onResolve,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            variants={dialogVariants}
            className="relative w-full max-w-md mx-4 rounded-xl border border-primary/30 bg-background/70 backdrop-blur-xl shadow-primary-glow-md p-6"
          >
            <div className="mb-4">
              <TavusVideoPlaceholder />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                 <Zap className="h-5 w-5 text-accent" />
                 <h2 className="text-2xl font-headline text-accent">{title}</h2>
              </div>
              <p className="text-base text-muted-foreground mb-6">
                {description}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onResolve('rejected')}
                      variant="outline"
                      className="flex-1 bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20 hover:text-destructive hover:border-destructive/80"
                      aria-label={rejectOption.label}
                    >
                      <X className="mr-2 h-5 w-5" /> {rejectOption.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{rejectOption.description}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onResolve('accepted')}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      aria-label={acceptOption.label}
                    >
                      <Check className="mr-2 h-5 w-5" /> {acceptOption.label}
                    </Button>
                  </TooltipTrigger>
                   <TooltipContent side="bottom">
                    <p>{acceptOption.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
