
"use client";

import React from 'react';
import type { Mission } from '@/types/simulation';
import { HexPuzzlePiece } from './HexPuzzlePiece';
import { CheckCircle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HexPuzzleBoardProps {
  missions: Mission[];
}

const PIECE_SIZE = 100; // The width of a puzzle piece hexagon
const PIECE_HEIGHT = PIECE_SIZE * (Math.sqrt(3) / 2); // The height of a puzzle piece hexagon

// Pre-calculated positions for up to 7 pieces for a pleasing layout
const calculatePositions = (count: number): React.CSSProperties[] => {
  const center = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  const h_offset = PIECE_SIZE * 0.87; // horizontal offset for surrounding pieces
  const v_offset = PIECE_HEIGHT * 0.5;

  switch (count) {
    case 0:
      return [];
    case 1:
      return [center];
    case 2:
      return [
        { top: '50%', left: `calc(50% - ${PIECE_SIZE * 0.45}px)`, transform: 'translate(-50%, -50%)' },
        { top: '50%', left: `calc(50% + ${PIECE_SIZE * 0.45}px)`, transform: 'translate(-50%, -50%)' },
      ];
    case 3:
      return [
        { top: `calc(50% - ${v_offset / 2}px)`, left: '50%', transform: 'translate(-50%, -50%)' },
        { top: `calc(50% + ${v_offset / 2}px)`, left: `calc(50% - ${h_offset / 2}px)`, transform: 'translate(-50%, -50%)' },
        { top: `calc(50% + ${v_offset / 2}px)`, left: `calc(50% + ${h_offset / 2}px)`, transform: 'translate(-50%, -50%)' },
      ];
    case 4:
       return [
        { top: `calc(50% - ${v_offset}px)`, left: `50%`, transform: 'translate(-50%, -50%)' },
        { top: '50%', left: `calc(50% - ${h_offset}px)`, transform: 'translate(-50%, -50%)' },
        { top: '50%', left: `calc(50% + ${h_offset}px)`, transform: 'translate(-50%, -50%)' },
        { top: `calc(50% + ${v_offset}px)`, left: `50%`, transform: 'translate(-50%, -50%)' },
      ];
    case 5:
    case 6:
    case 7:
    default:
        const radius = PIECE_SIZE * 0.88;
        const positions: React.CSSProperties[] = count % 2 !== 0 ? [center] : [];
        const surroundingCount = count - positions.length;
        const angleStep = 360 / surroundingCount;

        for (let i = 0; i < surroundingCount; i++) {
            const angle = -90 + (i * angleStep);
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            positions.push({
                top: `calc(50% + ${y}px)`,
                left: `calc(50% + ${x}px)`,
                transform: 'translate(-50%, -50%)'
            });
        }
        return positions;
  }
};


export const HexPuzzleBoard: React.FC<HexPuzzleBoardProps> = ({ missions }) => {
  const isComplete = missions.length > 0 && missions.every(m => m.isCompleted);
  const completedMissions = missions.filter(m => m.isCompleted);
  const positions = calculatePositions(missions.length);

  return (
    <div
      className="relative w-full mx-auto aspect-[1.15/1] max-w-md bg-muted/10 border-2 border-dashed border-border/30 transition-colors duration-500"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        ...(isComplete && { borderColor: 'hsl(var(--accent))' })
      }}
    >
        <div className="absolute inset-0 enhanced-hive-grid opacity-20" style={{ animation: 'subtle-grid-pan 45s linear infinite'}}/>

        <AnimatePresence>
            {completedMissions.map((mission, index) => {
                // Find the original index to get the correct position
                const originalIndex = missions.findIndex(m => m.id === mission.id);
                return (
                    <HexPuzzlePiece
                        key={mission.id}
                        mission={mission}
                        style={{
                            width: `${PIECE_SIZE}px`,
                            height: `${PIECE_HEIGHT}px`,
                            ...positions[originalIndex],
                        }}
                    />
                );
            })}
        </AnimatePresence>

        {missions.length > 0 && !isComplete && completedMissions.length === 0 && (
             <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <Lightbulb className="w-10 h-10 text-muted-foreground mb-3"/>
                <p className="text-sm text-muted-foreground">Complete tasks from your Quest Log to assemble the hive.</p>
            </motion.div>
        )}

        {isComplete && (
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-accent/30 via-primary/20 to-accent/30 backdrop-blur-sm"
                style={{ clipPath: 'inherit' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                <CheckCircle className="w-16 h-16 text-green-400 mb-4 filter drop-shadow-[0_0_10px_#22c55e]"/>
                <p className="text-xl font-bold text-foreground text-glow-accent">Month's Objectives Complete!</p>
            </motion.div>
        )}
    </div>
  );
};
