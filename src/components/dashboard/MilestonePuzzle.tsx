
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PuzzlePiece } from './PuzzlePiece';
import type { DashboardMilestone } from '@/types/simulation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestonePuzzleProps {
  milestones: DashboardMilestone[];
  title?: string;
  puzzleId: string; // Unique ID for this puzzle instance
  onPuzzleComplete?: (puzzleId: string) => void; // Callback when puzzle is completed
}

const celebrationVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20, duration: 0.5 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: -50,
    transition: { duration: 0.3 }
  },
};

const particleVariants = {
  initial: (i: number) => ({
    opacity: 0,
    scale: 0,
    x: Math.random() * 40 - 20, // random spread
    y: Math.random() * 40 - 20,
  }),
  animate: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, Math.random() * 0.8 + 0.3, 0], // random size
    x: Math.random() * 200 - 100, // burst outwards
    y: Math.random() * 200 - 100,
    transition: {
      duration: Math.random() * 1 + 0.8, // random duration
      delay: Math.random() * 0.5 + 0.2, // staggered start
      ease: "easeOut",
    },
  }),
};

export const MilestonePuzzle: React.FC<MilestonePuzzleProps> = ({ milestones, title, puzzleId, onPuzzleComplete }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false); // To prevent re-celebration if milestones change

  const unlockedCount = useMemo(() => milestones.filter(m => m.isUnlocked).length, [milestones]);
  const totalCount = milestones.length;
  const allUnlocked = totalCount > 0 && unlockedCount === totalCount;

  useEffect(() => {
    if (allUnlocked && !hasCelebrated) {
      setShowCelebration(true);
      setHasCelebrated(true);
      if (onPuzzleComplete) {
        onPuzzleComplete(puzzleId);
      }
    }
    if (!allUnlocked && hasCelebrated) { // Reset if milestones become locked again
      setHasCelebrated(false);
    }
  }, [allUnlocked, hasCelebrated, onPuzzleComplete, puzzleId]);

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-card">
      {title && <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>}
      <p className="text-sm text-muted-foreground mb-4">
        {unlockedCount} / {totalCount} Milestones Unlocked
      </p>
      {totalCount > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {milestones.map((milestone) => (
            <PuzzlePiece key={milestone.id} milestone={milestone} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">No milestones defined for this puzzle.</p>
      )}

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseCelebration} // Allow closing by clicking outside
          >
            <motion.div
              className="relative p-6 md:p-8 bg-gradient-to-br from-primary to-blue-700 text-primary-foreground rounded-xl shadow-2xl w-full max-w-md mx-4 text-center overflow-hidden"
              variants={celebrationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              {/* Particle burst container */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute bg-yellow-400 rounded-full"
                    style={{
                        width: Math.random() * 8 + 4, // Size 4px to 12px
                        height: Math.random() * 8 + 4,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)', // Start particles from center
                    }}
                    variants={particleVariants}
                    initial="initial"
                    animate="animate"
                    custom={i} // Pass index for staggered delays if needed in variants
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseCelebration}
                className="absolute top-3 right-3 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20"
                aria-label="Close celebration"
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="relative z-10">
                <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold mb-2 text-glow-accent">Milestones Complete!</h2>
                <p className="text-lg mb-6 opacity-90">
                  Congratulations on unlocking all milestones for "{title || 'this phase'}"!
                </p>
                <Button
                  onClick={handleCloseCelebration}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-3 text-base font-semibold"
                >
                  Continue Journey
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

