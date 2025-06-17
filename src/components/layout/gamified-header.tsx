"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bell, Settings, Crown, Flame, Zap, Trophy, Star, Target } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useGuidanceStore } from "@/store/guidanceStore";
import Link from "next/link";

export function GamifiedHeader() {
  const { startupScore, isInitialized, simulationMonth } = useSimulationStore();
  const { insightXp } = useGuidanceStore();
  const [streak, setStreak] = useState(7); // Mock streak data
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Calculate level based on XP (simple formula)
  const level = Math.floor(insightXp / 100) + 1;
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpToNextLevel = xpForNextLevel - insightXp;
  const xpProgress = ((insightXp - xpForCurrentLevel) / 100) * 100;

  // Mock notifications
  const notifications = [
    { id: 1, title: "New Quest Available", description: "Check the Achievement Hub for a new quest!" },
    { id: 2, title: "Milestone Reached", description: "You've reached 100 active users!" },
  ];

  return (
    <div className="bg-gradient-to-r from-background via-primary/5 to-background border-b border-accent/20 py-2 px-4 sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - XP and Level */}
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-card to-accent/10 border border-accent/30 rounded-lg p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-accent to-yellow-400 shadow-sm">
                <Zap className="h-3.5 w-3.5 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">Level {level}</span>
                  <Badge variant="xp" className="text-xs">
                    {insightXp} XP
                  </Badge>
                </div>
                <Progress 
                  value={xpProgress} 
                  className="h-1.5 w-24 mt-1"
                  indicatorClassName="bg-gradient-to-r from-accent to-yellow-400"
                />
              </div>
            </div>
          </div>
          
          {isInitialized && (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-card to-primary/10 border border-primary/30 rounded-lg p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-primary to-red-400 shadow-sm">
                    <Trophy className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium">Score</span>
                    <Badge variant="level" className="text-xs">
                      {startupScore}/100
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-card to-purple-500/10 border border-purple-500/30 rounded-lg p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
                    <Target className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium">Month</span>
                    <Badge variant="achievement" className="text-xs">
                      {simulationMonth}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Streak and notifications */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-card to-orange-500/10 border border-orange-500/30 rounded-lg p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-orange-400 to-red-400 shadow-sm">
                <Flame className="h-3.5 w-3.5 text-white" />
              </div>
              <Badge variant="warning" className="text-xs">
                {streak} day streak
              </Badge>
            </div>
          </div>
          
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/10" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-accent/20 rounded-lg shadow-lg p-2 z-50">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                  <h4 className="font-medium text-sm">Notifications</h4>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
                {notifications.map(notification => (
                  <div key={notification.id} className="p-2 hover:bg-accent/10 rounded-md cursor-pointer mb-1">
                    <div className="text-xs font-medium">{notification.title}</div>
                    <div className="text-xs text-muted-foreground">{notification.description}</div>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-border text-center">
                  <Link href="/app/gamification" className="text-xs text-accent hover:text-accent/80">
                    View All
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}