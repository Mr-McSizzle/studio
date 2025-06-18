
"use client";

import { useState, useEffect } from 'react';

interface MiniChartBarStyles {
  height: string;
  animationDelay: string;
}

export function MiniChartBars() {
  const [barStyles, setBarStyles] = useState<MiniChartBarStyles[]>([]);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    const generateStyles = () => {
      const newStyles: MiniChartBarStyles[] = [];
      for (let i = 0; i < 12; i++) {
        newStyles.push({
          height: `${15 + Math.random() * 30}px`,
          animationDelay: `${i * 0.1}s`,
        });
      }
      setBarStyles(newStyles);
    };
    generateStyles();
  }, []); // Empty dependency array ensures this runs once on mount

  if (barStyles.length === 0) {
    // Render a consistent placeholder on the server and initial client render
    return (
      <div className="flex items-end space-x-1 h-12">
        {[...Array(12)].map((_, i) => (
          <div
            key={`placeholder-bar-${i}`}
            className="flex-1 bg-gradient-to-t from-amber-600/30 to-yellow-500/30 rounded-sm opacity-40"
            style={{ height: '25px' }} // Default, consistent height
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end space-x-1 h-12">
      {barStyles.map((style, i) => (
        <div
          key={`bar-${i}`}
          className="flex-1 bg-gradient-to-t from-amber-600 to-yellow-500 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          style={{
            height: style.height,
            animationDelay: style.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
