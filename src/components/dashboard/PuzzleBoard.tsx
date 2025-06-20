
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const PuzzleSlot: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "aspect-[3/4] bg-muted/20 border border-border/50 rounded-lg flex items-center justify-center shadow-inner",
        "shadow-md shadow-primary/10", // Soft default glow
        "hover:border-primary/60 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 ease-in-out transform hover:scale-105", // Enhanced hover
        className
      )}
      aria-hidden="true"
    >
      {/* Placeholder for future puzzle piece content */}
    </div>
  );
};

export const PuzzleBoard: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 p-3 bg-card/50 rounded-lg shadow-md">
      {Array.from({ length: 6 }).map((_, index) => (
        <PuzzleSlot key={`slot-${index}`} />
      ))}
    </div>
  );
};
