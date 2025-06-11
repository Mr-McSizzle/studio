
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartBig, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils"; // Use shared cn

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  trend?: "up" | "down" | "neutral";
}

export function ScoreDisplay({ score, maxScore = 100, trend = "neutral" }: ScoreDisplayProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  let progressIndicatorClass = "bg-primary"; // Default
  if (percentage > 75) {
    progressIndicatorClass = "bg-green-500";
  } else if (percentage > 40) {
    progressIndicatorClass = "bg-yellow-500";
  } else if (score > 0) { // Only show red if score is > 0 but low
    progressIndicatorClass = "bg-red-500";
  }


  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-muted-foreground font-headline">
          Startup Score
        </CardTitle>
        <BarChartBig className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-bold text-foreground">{score}</div>
          <span className="text-lg text-muted-foreground">/ {maxScore}</span>
          {TrendIcon && <TrendIcon className={cn("h-5 w-5", trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "")} />}
        </div>
        <Progress value={percentage} className="mt-2 h-3" indicatorClassName={progressIndicatorClass} />
        <p className="text-xs text-muted-foreground mt-1">
          {trend === "up" ? "Trending upwards!" : trend === "down" ? "Needs attention" : "Score updates based on simulation progress"}
        </p>
      </CardContent>
    </Card>
  );
}
