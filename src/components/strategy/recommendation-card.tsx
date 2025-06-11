import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface RecommendationCardProps {
  title: string;
  recommendation: string;
}

export function RecommendationCard({ title, recommendation }: RecommendationCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Lightbulb className="h-6 w-6 text-accent" />
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">{recommendation}</p>
      </CardContent>
    </Card>
  );
}
