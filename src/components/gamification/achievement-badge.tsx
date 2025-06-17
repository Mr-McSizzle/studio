"use client";

import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Zap, Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon?: "trophy" | "star" | "target" | "zap" | "crown" | "medal";
  rarity?: "common" | "rare" | "epic" | "legendary";
  unlocked?: boolean;
  className?: string;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  crown: Crown,
  medal: Medal,
};

const rarityStyles = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-500",
};

export function AchievementBadge({
  title,
  description,
  icon = "trophy",
  rarity = "common",
  unlocked = false,
  className
}: AchievementBadgeProps) {
  const IconComponent = iconMap[icon];
  
  return (
    <div className={cn(
      "relative p-3 rounded-lg border transition-all duration-300",
      unlocked 
        ? `bg-gradient-to-br ${rarityStyles[rarity]} text-white shadow-lg hover:scale-105 cursor-pointer`
        : "bg-muted/50 border-muted text-muted-foreground opacity-60",
      className
    )}>
      {unlocked && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-1">
        <IconComponent className={cn(
          "h-4 w-4",
          unlocked ? "text-white" : "text-muted-foreground"
        )} />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      
      <p className="text-xs opacity-90">{description}</p>
      
      {unlocked && (
        <Badge variant="achievement" className="mt-2 text-xs">
          {rarity.toUpperCase()}
        </Badge>
      )}
    </div>
  );
}