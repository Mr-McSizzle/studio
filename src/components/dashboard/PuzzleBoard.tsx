
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const PuzzleSlot: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "aspect-[3/4] bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center shadow-inner",
        "hover:border-primary/50 transition-colors duration-200",
        className
      )}
      aria-hidden="true"
    >
      {/* You can add a subtle icon or text here if needed later */}
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
