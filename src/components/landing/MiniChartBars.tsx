
"use client";

import { useState, useEffect } from 'react';

interface MiniChartBarStyles {
  height: string;
  animationDelay: string;
}

interface MiniChartBarsProps {
  barColors?: string[]; // e.g., ["from-sky-600 to-blue-500", "from-blue-700 to-sky-600"]
}

export function MiniChartBars({ barColors }: MiniChartBarsProps) {
  const [barStyles, setBarStyles] = useState<MiniChartBarStyles[]>([]);

  const defaultBarColors = ["from-sky-600 to-blue-500", "from-blue-500 to-sky-400", "from-sky-500 to-blue-400"];
  const currentBarColors = barColors && barColors.length > 0 ? barColors : defaultBarColors;


  useEffect(() => {
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
  }, []); 

  if (barStyles.length === 0) {
    return (
      <div className="flex items-end space-x-1 h-12">
        {[...Array(12)].map((_, i) => (
          <div
            key={`placeholder-bar-${i}`}
            className={`flex-1 bg-gradient-to-t ${currentBarColors[i % currentBarColors.length]}/30 rounded-sm opacity-40`}
            style={{ height: '25px' }} 
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
          className={`flex-1 bg-gradient-to-t ${currentBarColors[i % currentBarColors.length]} rounded-sm opacity-70 hover:opacity-100 transition-opacity`}
          style={{
            height: style.height,
            animationDelay: style.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
