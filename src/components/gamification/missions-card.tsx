
// This file is no longer used and can be deleted.
// Keeping it for now to avoid breaking imports if any were missed,
// but it should be removed in a future cleanup.
// The GamificationPage now directly renders missions from the store.

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, Info } from "lucide-react";

export interface Mission {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  reward: string; // This was 'rewardText' in the store, ensure consistency or map
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
          {missions && missions.length > 0 ? (
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
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-4">
              <Info className="h-10 w-10 mb-2" />
              <p>No active missions at the moment.</p>
              <p className="text-xs">Missions will appear here as you progress in the simulation.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

