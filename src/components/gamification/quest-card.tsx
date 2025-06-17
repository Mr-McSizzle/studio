"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sword, Shield, Zap, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: string;
  completed?: boolean;
  onClaim?: () => void;
  className?: string;
}

const difficultyConfig = {
  easy: { color: "bg-green-500", icon: Shield, label: "Easy" },
  medium: { color: "bg-yellow-500", icon: Sword, label: "Medium" },
  hard: { color: "bg-red-500", icon: Zap, label: "Hard" },
};

export function QuestCard({
  title,
  description,
  progress,
  maxProgress,
  reward,
  difficulty,
  timeLimit,
  completed = false,
  onClaim,
  className
}: QuestCardProps) {
  const diffConfig = difficultyConfig[difficulty];
  const DifficultyIcon = diffConfig.icon;
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      completed 
        ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30" 
        : "bg-gradient-to-br from-card to-accent/5 border-accent/20",
      "hover:scale-[1.02]",
      className
    )}>
      {completed && (
        <div className="absolute top-2 right-2">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-pulse" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", diffConfig.color, "text-white border-0")}>
              <DifficultyIcon className="h-3 w-3 mr-1" />
              {diffConfig.label}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}/{maxProgress}</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
            indicatorClassName={completed ? "bg-green-500" : "bg-accent"}
          />
        </div>

        {timeLimit && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeLimit}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Badge variant="xp" className="text-xs">
            🏆 {reward}
          </Badge>
          
          {completed && onClaim && (
            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
              Claim Reward
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}