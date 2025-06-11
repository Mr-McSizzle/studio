
"use client";
import { useState, useEffect } from "react";
import { ScoreDisplay } from "@/components/gamification/score-display";
import { MissionsCard, type Mission } from "@/components/gamification/missions-card";
import { RewardsCard, type Reward } from "@/components/gamification/rewards-card";

const initialMissions: Mission[] = [];
const initialRewards: Reward[] = [];

export default function GamificationPage() {
  // In a real app, this data would come from state management or API calls
  const [score, setScore] = useState(0);
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [scoreTrend, setScoreTrend] = useState<"up" | "down" | "neutral">("neutral");

  // Placeholder for fetching/updating data
  useEffect(() => {
    // Example: Fetch data here and update state
    // setScore(78);
    // setScoreTrend("up");
    // setMissions([
    //   { id: "1", title: "Achieve $10k MRR", description: "Reach a Monthly Recurring Revenue of $10,000.", isCompleted: true, reward: "+5 Score, $50k Seed Fund Boost" },
    //   { id: "2", title: "Launch MVP", description: "Successfully launch your Minimum Viable Product to the public.", isCompleted: true, reward: "+10 Score, Unlock AI Mentor Pro Tips" },
    //   { id: "3", title: "Secure First 100 Paying Customers", description: "Convert 100 users to paying customers.", isCompleted: false, reward: "+15 Score, Marketing Budget Increase" },
    // ]);
    // setRewards([
    //   { id: "r1", name: "Seed Funding Unlocked", description: "Secured initial seed funding of $50,000.", dateEarned: "2024-07-15" },
    //   { id: "r2", name: "MVP Launch Bonus", description: "Successfully launched MVP, gaining early traction.", dateEarned: "2024-08-01" },
    // ]);
  }, []);


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground">Missions & Rewards</h1>
        <p className="text-muted-foreground">
          Track your progress, complete missions, and earn rewards to boost your startup.
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
