
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StageUnlockAnimationOverlayProps {
  isOpen: boolean;
  title: string;
  message: string;
  onComplete: () => void;
}

const animationConfig = {
  overlayFadeInDuration: 0.5,
  rippleDelayIncrement: 0.15,
  rippleDuration: 1.2,
  numRipples: 5,
  particleBurstDelay: 0.8,
  particleDuration: 1.5,
  numParticles: 30,
  avatarDelay: 1.8,
  avatarDuration: 0.7,
  textDelay: 2.3,
  textDuration: 0.6,
  totalDurationBeforeAutoClose: 6000, 
};

export const StageUnlockAnimationOverlay: React.FC<StageUnlockAnimationOverlayProps> = ({
  isOpen,
  title,
  message,
  onComplete,
}) => {
  const [showElements, setShowElements] = useState({
    ripples: false,
    particles: false,
    avatar: false,
    text: false,
    button: false,
  });

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    if (isOpen) {
      timers.push(setTimeout(() => setShowElements(prev => ({ ...prev, ripples: true })), animationConfig.overlayFadeInDuration * 500));
      timers.push(setTimeout(() => setShowElements(prev => ({ ...prev, particles: true })), animationConfig.particleBurstDelay * 1000));
      timers.push(setTimeout(() => setShowElements(prev => ({ ...prev, avatar: true })), animationConfig.avatarDelay * 1000));
      timers.push(setTimeout(() => setShowElements(prev => ({ ...prev, text: true })), animationConfig.textDelay * 1000));
      timers.push(setTimeout(() => setShowElements(prev => ({ ...prev, button: true })), (animationConfig.textDelay + animationConfig.textDuration) * 1000));
      timers.push(setTimeout(onComplete, animationConfig.totalDurationBeforeAutoClose));
    } else {
        setShowElements({ ripples: false, particles: false, avatar: false, text: false, button: false });
    }

    return () => timers.forEach(clearTimeout);
  }, [isOpen, onComplete]);


  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: animationConfig.overlayFadeInDuration }}
                className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md overflow-hidden"
                aria-modal="true"
                role="dialog"
                aria-labelledby="unlock-animation-title"
            >
            {/* Honeycomb Ripples */}
            {showElements.ripples && (
                <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: animationConfig.numRipples }).map((_, i) => (
                    <motion.div
                    key={`ripple-${i}`}
                    className="absolute border-2 border-accent/70"
                    style={{
                        width: 50,
                        height: 50,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{
                        scale: [1, 2, 4, 8, 16 + i * 4], // Progressively larger scales
                        opacity: [0.8, 0.6, 0.4, 0.2, 0],
                    }}
                    transition={{
                        duration: animationConfig.rippleDuration + i * 0.1,
                        delay: i * animationConfig.rippleDelayIncrement,
                        ease: "easeOut",
                    }}
                    />
                ))}
                </div>
            )}

            {/* Particle Burst */}
            {showElements.particles && (
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                {Array.from({ length: animationConfig.numParticles }).map((_, i) => {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * 100 + 50; // Spread
                    const initialX = Math.cos(angle) * radius;
                    const initialY = Math.sin(angle) * radius;
                    const finalY = -200 - Math.random() * 100; // Move upwards

                    return (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute bg-accent/80 rounded-full"
                        style={{
                        width: Math.random() * 6 + 3, // Size 3px to 9px
                        height: Math.random() * 6 + 3,
                        left: `calc(50% + ${initialX}px)`,
                        top: `calc(50% + ${initialY}px)`,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', // Hexagonal particles
                        }}
                        initial={{ opacity: 0.9, scale: 0.5, y: 0 }}
                        animate={{
                        y: finalY,
                        opacity: 0,
                        scale: Math.random() * 0.5 + 0.2,
                        }}
                        transition={{
                        duration: animationConfig.particleDuration + Math.random() * 0.5,
                        delay: Math.random() * 0.5, // Staggered start
                        ease: "easeOut",
                        }}
                    />
                    );
                })}
                </div>
            )}

            {/* Hive Mind Avatar */}
            {showElements.avatar && (
                <motion.div
                className="relative z-10 mb-6"
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: animationConfig.avatarDuration, ease: "backOut" }}
                >
                <Image
                    src="/new-assets/custom_eve_avatar.png"
                    alt="Hive Mind Avatar"
                    width={120}
                    height={120}
                    className="rounded-full shadow-2xl border-4 border-accent/50 filter drop-shadow-[0_0_15px_hsl(var(--accent)/0.7)] animate-subtle-pulse"
                    data-ai-hint="bee queen"
                />
                </motion.div>
            )}

            {/* Dynamic Text */}
            {showElements.text && (
                <motion.div
                className="relative z-10 text-center px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationConfig.textDuration, ease: "easeOut" }}
                >
                <h2 id="unlock-animation-title" className="text-3xl md:text-4xl font-headline text-primary text-glow-primary mb-2">
                    {title}
                </h2>
                <p className="text-lg md:text-xl text-foreground max-w-md mx-auto">
                    <Sparkles className="inline-block h-5 w-5 text-accent mr-2" />
                    {message}
                </p>
                </motion.div>
            )}
            
            {showElements.button && (
                <motion.div
                className="relative z-10 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Button
                        onClick={onComplete}
                        className="px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg shadow-lg hover:bg-accent/90 transition-colors transform hover:scale-105 flex items-center gap-2 text-lg"
                    >
                        <CheckCircle className="h-6 w-6"/>
                        Continue Your Ascent
                    </Button>
                </motion.div>
            )}
            </motion.div>
        )}
    </AnimatePresence>
  );
};
