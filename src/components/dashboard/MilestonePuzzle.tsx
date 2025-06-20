
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed useRouter as redirect is now handled by parent
import { PuzzlePiece } from './PuzzlePiece';
import type { DashboardMilestone } from '@/types/simulation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, X, CloudDownload } from 'lucide-react'; // Removed Database, CloudUpload
import { cn } from '@/lib/utils';

interface MilestonePuzzleProps {
  milestones: DashboardMilestone[];
  onMilestonesChange: (updatedMilestones: DashboardMilestone[]) => void;
  title?: string;
  puzzleId: string;
  userId: string;
  onPuzzleComplete?: (puzzleId: string) => void;
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
    x: Math.random() * 40 - 20,
    y: Math.random() * 40 - 20,
  }),
  animate: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, Math.random() * 1 + 0.5, 0], // Increased particle scale range
    x: Math.random() * 250 - 125, // Wider particle spread
    y: Math.random() * 250 - 125,
    transition: {
      duration: Math.random() * 2 + 1.5,
      delay: Math.random() * 1,
      ease: "easeOut",
    },
  }),
};

// Placeholder Firestore interaction functions
const savePuzzleProgressToFirestore = async (userId: string, puzzleId: string, filledSlots: number[]): Promise<void> => {
  if (!userId || !puzzleId) {
    console.error("Firestore Save: userId or puzzleId is missing.");
    return;
  }
  console.log(`[Firestore Placeholder] Saving puzzle progress for user ${userId}, puzzle ${puzzleId}:`, filledSlots);
  // Example Firestore call (replace with actual implementation using your `db` instance)
  // import { doc, setDoc } from "firebase/firestore";
  // import { db } from '@/lib/firebase'; // Assuming db is exported
  // const puzzleDocRef = doc(db, "users", userId, "puzzles", puzzleId);
  // try {
  //   await setDoc(puzzleDocRef, { filledSlots, lastUpdated: new Date().toISOString() }, { merge: true });
  //   console.log(`[Firestore Placeholder] Progress for puzzle ${puzzleId} saved.`);
  // } catch (error) {
  //   console.error(`[Firestore Placeholder] Error saving puzzle ${puzzleId}:`, error);
  //   throw error;
  // }
};

const loadPuzzleProgressFromFirestore = async (userId: string, puzzleId: string): Promise<number[] | null> => {
  if (!userId || !puzzleId) {
    console.error("Firestore Load: userId or puzzleId is missing.");
    return null;
  }
  console.log(`[Firestore Placeholder] Loading puzzle progress for user ${userId}, puzzle ${puzzleId}`);
  // Example Firestore call (replace with actual implementation using your `db` instance)
  // import { doc, getDoc } from "firebase/firestore";
  // import { db } from '@/lib/firebase'; // Assuming db is exported
  // const puzzleDocRef = doc(db, "users", userId, "puzzles", puzzleId);
  // try {
  //   const docSnap = await getDoc(puzzleDocRef);
  //   if (docSnap.exists()) {
  //     const data = docSnap.data();
  //     console.log(`[Firestore Placeholder] Progress for puzzle ${puzzleId} loaded:`, data.filledSlots);
  //     return data.filledSlots as number[];
  //   } else {
  //     console.log(`[Firestore Placeholder] No progress found for puzzle ${puzzleId}.`);
  //     return null;
  //   }
  // } catch (error) {
  //   console.error(`[Firestore Placeholder] Error loading puzzle ${puzzleId}:`, error);
  //   return null;
  // }
  return Array(6).fill(0) as number[]; // Demo: Return 6 empty slots if no data
};


export const MilestonePuzzle: React.FC<MilestonePuzzleProps> = ({
  milestones,
  onMilestonesChange,
  title,
  puzzleId,
  userId,
  onPuzzleComplete
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const unlockedCount = useMemo(() => milestones.filter(m => m.isUnlocked).length, [milestones]);
  const totalCount = milestones.length;
  const allUnlocked = totalCount > 0 && unlockedCount === totalCount;

  const convertMilestonesToBinaryArray = useCallback(() => {
    return milestones.map(m => m.isUnlocked ? 1 : 0);
  }, [milestones]);

  useEffect(() => {
    if (userId && puzzleId && milestones.length > 0) {
      const binaryProgress = convertMilestonesToBinaryArray();
      savePuzzleProgressToFirestore(userId, puzzleId, binaryProgress)
        .catch(err => console.error("Failed to save puzzle progress from effect:", err));
    }
  }, [milestones, userId, puzzleId, convertMilestonesToBinaryArray]);

  useEffect(() => {
    if (allUnlocked && !hasCelebrated) {
      setShowCelebration(true);
      setHasCelebrated(true);
      if (onPuzzleComplete) {
        onPuzzleComplete(puzzleId);
      }
      // Automatic redirect removed, parent (dashboard) will handle post-completion actions
    }
  }, [allUnlocked, hasCelebrated, onPuzzleComplete, puzzleId]);

  useEffect(() => {
    if (!allUnlocked && hasCelebrated) {
      setHasCelebrated(false);
    }
  }, [allUnlocked, hasCelebrated]);

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  const handleLoadProgress = async () => {
    if (!userId || !puzzleId) return;
    setIsLoadingProgress(true);
    try {
      const loadedSlots = await loadPuzzleProgressFromFirestore(userId, puzzleId);
      if (loadedSlots) {
        const updatedMilestones = milestones.map((m, index) => ({
          ...m,
          isUnlocked: loadedSlots[index] === 1,
        }));
        onMilestonesChange(updatedMilestones);
      }
    } catch (error) {
      console.error("Error in handleLoadProgress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-card">
      <div className="flex justify-between items-center mb-2">
        {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
        <Button onClick={handleLoadProgress} variant="outline" size="sm" disabled={isLoadingProgress || !userId || !puzzleId}>
          {isLoadingProgress ? <CloudDownload className="mr-2 h-4 w-4 animate-pulse" /> : <CloudDownload className="mr-2 h-4 w-4" />}
           Load Progress (Mock)
        </Button>
      </div>
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
            onClick={handleCloseCelebration}
          >
            <motion.div
              className="relative p-6 md:p-8 bg-gradient-to-br from-primary to-blue-700 text-primary-foreground rounded-xl shadow-2xl w-full max-w-md mx-4 text-center overflow-hidden"
              variants={celebrationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute bg-yellow-400 rounded-full"
                    style={{
                        width: Math.random() * 12 + 6, // particles size
                        height: Math.random() * 12 + 6,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                    variants={particleVariants}
                    initial="initial"
                    animate="animate"
                    custom={i}
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
                <CheckCircle className="h-20 w-20 text-green-300 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold mb-3 text-glow-accent">
                  {title ? `${title} Complete!` : "Objective Set Achieved!"}
                </h2>
                <p className="text-lg mb-6 opacity-90">
                  Excellent work, Founder! All milestones in this set are secured.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
