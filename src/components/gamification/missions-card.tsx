import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  reward: string;
}

interface MissionsCardProps {
  missions: Mission[];
}

export function MissionsCard({ missions }: MissionsCardProps) {
  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-accent" />
            <CardTitle className="font-headline">Active Missions</CardTitle>
        </div>
        <CardDescription>Complete these objectives to grow your startup.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <ul className="space-y-4">
            {missions.map((mission) => (
              <li key={mission.id} className="flex items-start gap-3 p-3 border border-border rounded-md hover:bg-muted/50 transition-colors">
                <Checkbox id={`mission-${mission.id}`} checked={mission.isCompleted} aria-label={mission.title} className="mt-1 shrink-0 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground focus-visible:ring-accent" />
                <div className="flex-grow">
                  <label htmlFor={`mission-${mission.id}`} className={`font-medium ${mission.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {mission.title}
                  </label>
                  <p className={`text-xs ${mission.isCompleted ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                    {mission.description}
                  </p>
                  {!mission.isCompleted && (
                    <p className="text-xs text-accent font-medium mt-1">Reward: {mission.reward}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
         {missions.length === 0 && (
          <p className="text-center text-muted-foreground py-4">No active missions. Great job, or check back soon!</p>
        )}
      </CardContent>
    </Card>
  );
}
