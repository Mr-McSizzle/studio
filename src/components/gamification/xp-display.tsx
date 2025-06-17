"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Star, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPDisplayProps {
  currentXP: number;
  level: number;
  xpToNextLevel: number;
  totalXPForNextLevel: number;
  className?: string;
  showAnimation?: boolean;
}

export function XPDisplay({ 
  currentXP, 
  level, 
  xpToNextLevel, 
  totalXPForNextLevel, 
  className,
  showAnimation = false 
}: XPDisplayProps) {
  const [animatedXP, setAnimatedXP] = useState(currentXP);
  const progressPercentage = ((totalXPForNextLevel - xpToNextLevel) / totalXPForNextLevel) * 100;

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setAnimatedXP(currentXP), 100);
      return () => clearTimeout(timer);
    }
  }, [currentXP, showAnimation]);

  return (
    <Card className={cn("bg-gradient-to-br from-card via-card/90 to-accent/10 border-accent/30 shadow-accent-glow-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-accent to-yellow-400">
              <Zap className="h-4 w-4 text-black" />
            </div>
            <div>
              <Badge variant="level" className="text-xs">
                Level {level}
              </Badge>
            </div>
          </div>
          <Badge variant="xp" className="text-sm font-bold">
            {animatedXP.toLocaleString()} XP
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to Level {level + 1}</span>
            <span>{xpToNextLevel} XP needed</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3" 
            indicatorClassName="bg-gradient-to-r from-accent to-yellow-400"
            animated={showAnimation}
          />
        </div>
      </CardContent>
    </Card>
  );
}