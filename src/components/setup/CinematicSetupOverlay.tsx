
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Settings, Brain, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CinematicSetupOverlayProps {
  isVisible: boolean;
  currentText: string;
  isEveVisible?: boolean;
  eveMessage?: string;
  onComplete?: () => void; // For future use if manual close is needed before redirect
}

const orbVariants = {
  initial: { scale: 0.8, opacity: 0.7 },
  animate: {
    scale: [0.9, 1.05, 0.95, 1.02, 0.9],
    opacity: [0.7, 1, 0.8, 0.95, 0.7],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

const ringVariants = (delay: number) => ({
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.5, 1.2, 2],
    opacity: [0, 0.7, 0.5, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 4 + delay * 0.5,
      repeat: Infinity,
      ease: "linear",
      delay: delay,
      times: [0, 0.4, 0.7, 1]
    },
  },
});

const particleVariants = () => ({
  initial: {
    x: Math.random() * 400 - 200, // Spread particles horizontally
    y: Math.random() * 50 + 200,  // Start from bottom half
    opacity: 0,
    scale: Math.random() * 0.5 + 0.2,
  },
  animate: {
    y: -200 - Math.random() * 100, // Move upwards
    x: Math.random() * 400 - 200, // Slight horizontal drift
    opacity: [0, 0.8, 0.5, 0],
    scale: Math.random() * 0.3 + 0.1,
    transition: {
      duration: Math.random() * 3 + 4, // Random duration 4-7s
      repeat: Infinity,
      delay: Math.random() * 3, // Staggered start
      ease: "linear",
    },
  },
  exit: { opacity: 0, y: -300 }
});


export const CinematicSetupOverlay: React.FC<CinematicSetupOverlayProps> = ({
  isVisible,
  currentText,
  isEveVisible = false,
  eveMessage = "Twin activated. Let’s begin shaping your future.",
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [showEve, setShowEve] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      // Reset when not visible
      setDisplayText("");
      setShowEve(false);
      return;
    }

    if (isEveVisible) {
      // If EVE is meant to be visible, show her and her message directly
      setShowEve(true);
      setDisplayText(eveMessage);
    } else {
      // Otherwise, type out the currentText
      setShowEve(false); // Ensure EVE is hidden if not her turn
      let i = 0;
      setDisplayText(""); // Clear previous text
      const typingInterval = setInterval(() => {
        if (i < currentText.length) {
          setDisplayText((prev) => prev + currentText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50); // Adjust typing speed here
      return () => clearInterval(typingInterval);
    }
  }, [currentText, isVisible, isEveVisible, eveMessage]);


  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm overflow-hidden"
      aria-modal="true"
      role="dialog"
    >
      {/* Animated Backdrop - Flowing Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute bg-accent/30 rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={particleVariants()}
            initial="initial"
            animate="animate"
          />
        ))}
      </div>

      {/* Center-Stage Orb */}
      <motion.div
        className="relative z-10 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary/70 via-accent/60 to-primary/70 rounded-full shadow-epic-depth flex items-center justify-center"
        variants={orbVariants}
        initial="initial"
        animate="animate"
      >
        <Zap className="w-16 h-16 text-accent-foreground opacity-80 filter drop-shadow-[0_0_10px_hsl(var(--accent))]" />
        {/* Rotating Rings/Hexagons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute border-2 border-accent/50 rounded-full"
            style={{
              width: `${120 + i * 40}%`,
              height: `${120 + i * 40}%`,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', // Hexagon shape
            }}
            variants={ringVariants(i * 0.3)}
            initial="initial"
            animate="animate"
          />
        ))}
      </motion.div>

      {/* Progressive Text & Hive Mind */}
      <div className="relative z-10 mt-10 text-center px-6 max-w-lg">
        <AnimatePresence mode="wait">
          {showEve && (
            <motion.div
              key="eve-avatar-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <Image
                src="/new-assets/custom_eve_avatar.png"
                alt="EVE AI Hive Mind"
                width={100}
                height={100}
                className="rounded-full mb-4 shadow-2xl border-2 border-accent/70 filter drop-shadow-[0_0_15px_hsl(var(--accent)/0.7)]"
                data-ai-hint="bee queen"
              />
              <p className="text-xl md:text-2xl font-semibold text-foreground text-glow-accent">
                {/* EVE's message (displayText will hold it) */}
                {displayText}
              </p>
            </motion.div>
          )}
          {!showEve && (
            <motion.p
              key={currentText} // Key change triggers AnimatePresence
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg md:text-xl font-medium text-muted-foreground"
            >
              {/* Progressive initialization text (displayText holds it) */}
              {displayText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};
