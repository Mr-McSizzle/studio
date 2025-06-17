"use client";

import { useState, useEffect } from "react";
import { XPDisplay } from "@/components/gamification/xp-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Crown, Flame } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useGuidanceStore } from "@/store/guidanceStore";

export function GamifiedHeader() {
  const { startupScore, isInitialized } = useSimulationStore();
  const { insightXp } = useGuidanceStore();
  const [streak, setStreak] = useState(7); // Mock streak data
  
  // Calculate level based on XP (simple formula)
  const level = Math.floor(insightXp / 100) + 1;
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpToNextLevel = xpForNextLevel - insightXp;

  return (
    <div className="bg-gradient-to-r from-background via-primary/5 to-background border-b border-accent/20 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - XP and Level */}
        <div className="flex items-center gap-4">
          <XPDisplay
            currentXP={insightXp}
            level={level}
            xpToNextLevel={xpToNextLevel}
            totalXPForNextLevel={100}
            className="min-w-[280px]"
          />
          
          {isInitialized && (
            <div className="flex items-center gap-2">
              <Badge variant="level" className="text-sm">
                <Crown className="h-3 w-3 mr-1" />
                Startup Score: {startupScore}
              </Badge>
            </div>
          )}
        </div>

        {/* Right side - Streak and notifications */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <Badge variant="warning" className="text-xs">
              {streak} day streak
            </Badge>
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}