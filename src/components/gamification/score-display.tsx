
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartBig, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  trend?: "up" | "down" | "neutral";
  title?: string;
  level?: string;
}

export function ScoreDisplay({ score, maxScore = 100, trend = "neutral", title = "Startup Score", level }: ScoreDisplayProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  let progressIndicatorClass = "bg-primary";
  if (percentage > 75) {
    progressIndicatorClass = "bg-green-500";
  } else if (percentage > 40) {
    progressIndicatorClass = "bg-yellow-500";
  } else if (score > 0) {
    progressIndicatorClass = "bg-red-500";
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-muted-foreground font-headline">
          {title}
        </CardTitle>
        <BarChartBig className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-bold text-foreground">{score}</div>
          {level && <span className="text-lg font-semibold text-accent">{level}</span>}
          {!level && <span className="text-lg text-muted-foreground">/ {maxScore}</span>}
          {TrendIcon && <TrendIcon className={cn("h-5 w-5", trend === "up" ? "text-green-500" : "text-red-500")} />}
        </div>
        {!level && <Progress value={percentage} className="mt-2 h-3" indicatorClassName={progressIndicatorClass} />}
        <p className="text-xs text-muted-foreground mt-1">
          {level ? "Overall founder progression score based on achievements and discoveries." : trend === "up" ? "Trending upwards!" : trend === "down" ? "Needs attention" : "Score updates based on simulation progress"}
        </p>
      </CardContent>
    </Card>
  );
}
