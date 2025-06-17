import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChartBig, TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  trend?: "up" | "down" | "neutral";
}

export function ScoreDisplay({ score, maxScore = 100, trend = "neutral" }: ScoreDisplayProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  let progressIndicatorClass = "bg-gradient-to-r from-primary to-red-400"; // Default
  if (percentage > 75) {
    progressIndicatorClass = "bg-gradient-to-r from-green-400 to-green-600";
  } else if (percentage > 40) {
    progressIndicatorClass = "bg-gradient-to-r from-yellow-400 to-yellow-600";
  } else if (score > 0) { // Only show red if score is > 0 but low
    progressIndicatorClass = "bg-gradient-to-r from-red-400 to-red-600";
  }

  const getRankTitle = () => {
    if (percentage > 80) return "Legendary";
    if (percentage > 60) return "Master";
    if (percentage > 40) return "Adept";
    if (percentage > 20) return "Novice";
    return "Beginner";
  };

  return (
    <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-lg hover:shadow-primary-glow-sm transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-primary to-red-400 shadow-sm">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Startup Score</span>
          </div>
          <Badge variant="level" className="text-sm">
            {getRankTitle()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="text-3xl font-bold text-foreground">{score}</div>
          <span className="text-lg text-muted-foreground">/ {maxScore}</span>
          {TrendIcon && <TrendIcon className={cn("h-5 w-5", trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "")} />}
        </div>
        
        <Progress 
          value={percentage} 
          className="h-3"
          indicatorClassName={progressIndicatorClass}
          showPercentage={true}
        />
        
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <BarChartBig className="h-3 w-3" />
          {trend === "up" ? "Trending upwards!" : trend === "down" ? "Needs attention" : "Score updates based on simulation progress"}
        </p>
      </CardContent>
    </Card>
  );
}