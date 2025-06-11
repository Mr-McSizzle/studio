
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gift, Star, Info } from "lucide-react";

export interface Reward {
  id: string;
  name: string;
  description: string;
  dateEarned: string;
}

interface RewardsCardProps {
  rewards: Reward[];
}

export function RewardsCard({ rewards }: RewardsCardProps) {
  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Gift className="h-6 w-6 text-accent" />
            <CardTitle className="font-headline">Earned Rewards</CardTitle>
        </div>
        <CardDescription>Achievements and perks unlocked on your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          {rewards.length > 0 ? (
            <ul className="space-y-3">
              {rewards.map((reward) => (
                <li key={reward.id} className="flex items-center gap-3 p-3 border border-border rounded-md bg-muted/30">
                  <Star className="h-5 w-5 text-accent fill-accent shrink-0" />
                  <div className="flex-grow">
                    <h4 className="font-medium text-foreground">{reward.name}</h4>
                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Earned: {reward.dateEarned}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-4">
              <Info className="h-10 w-10 mb-2" />
              <p>No rewards earned yet.</p>
              <p className="text-xs">Complete missions and achieve milestones to earn rewards.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
