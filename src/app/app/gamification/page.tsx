
"use client";
import { useState, useEffect } from "react";
import { ScoreDisplay } from "@/components/gamification/score-display";
import { MissionsCard, type Mission } from "@/components/gamification/missions-card";
import { RewardsCard, type Reward } from "@/components/gamification/rewards-card";
import { Trophy } from "lucide-react";

const initialMissions: Mission[] = [];
const initialRewards: Reward[] = [];

export default function GamificationPage() {
  const [score, setScore] = useState(0);
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [scoreTrend, setScoreTrend] = useState<"up" | "down" | "neutral">("neutral");

  useEffect(() => {
    // In a real application, this data would be dynamically updated
    // based on the user's progress and achievements within the ForgeSim simulation.
    // For example:
    // const simulationState = getSimulationGamificationState(); // Fictional function
    // setScore(simulationState.score);
    // setScoreTrend(simulationState.scoreTrend);
    // setMissions(simulationState.activeMissions);
    // setRewards(simulationState.earnedRewards);
  }, []);


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
            <Trophy className="h-8 w-8 text-accent" />
            Simulation Milestones & Rewards
        </h1>
        <p className="text-muted-foreground">
          Track your progress within the ForgeSim simulation. Complete strategic missions and earn rewards to boost your digital twin's startup score and unlock advantages.
        </p>
      </header>

      <div className="mb-8">
        <ScoreDisplay score={score} trend={scoreTrend} />
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <MissionsCard missions={missions} />
        <RewardsCard rewards={rewards} />
      </div>
    </div>
  );
}
