import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartBig, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  trend?: "up" | "down" | "neutral";
}

export function ScoreDisplay({ score, maxScore = 100, trend = "neutral" }: ScoreDisplayProps) {
  const percentage = (score / maxScore) * 100;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

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
          {TrendIcon && <TrendIcon className={cn("h-5 w-5", trend === "up" ? "text-green-500" : "text-red-500")} />}
        </div>
        <Progress value={percentage} className="mt-2 h-3" indicatorClassName={percentage > 75 ? "bg-green-500" : percentage > 40 ? "bg-yellow-500" : "bg-red-500"} />
        <p className="text-xs text-muted-foreground mt-1">
          {trend === "up" ? "Trending upwards!" : trend === "down" ? "Needs attention" : "Stable performance"}
        </p>
      </CardContent>
    </Card>
  );
}

// Helper cn function if not globally available in this context (though it should be via imports)
// Remove if `cn` is already imported from `@/lib/utils` in the consuming file.
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');
