"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreDisplay } from "@/components/gamification/score-display";
import { RewardsCard, type Reward } from "@/components/gamification/rewards-card";
import { QuestCard } from "@/components/gamification/quest-card";
import { AchievementBadge } from "@/components/gamification/achievement-badge";
import { XPDisplay } from "@/components/gamification/xp-display";
import { useSimulationStore } from "@/store/simulationStore";
import { useGuidanceStore } from "@/store/guidanceStore";
import type { Mission, GenerateDynamicMissionsInput } from "@/types/simulation";
import { generateDynamicMissions } from "@/ai/flows/generate-dynamic-missions-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, AlertTriangle, Crown, Sparkles, Info, Loader2, Wand2, Target, Star, Flame, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function GamificationPage() {
  const router = useRouter();
  const { 
    startupScore, 
    rewards, 
    keyEvents, 
    missions,
    setMissions,
    isInitialized, 
    financials, 
    simulationMonth,
    companyName, userMetrics, product, resources, market, initialGoals, suggestedChallenges,
  } = useSimulationStore();
  const { insightXp } = useGuidanceStore();
  const { toast } = useToast();
  const [isLoadingMissions, setIsLoadingMissions] = useState(false);
  
  useEffect(() => {
     if (!isInitialized && typeof simulationMonth === 'number' && simulationMonth === 0) {
        router.replace('/app/setup');
    }
  }, [isInitialized, simulationMonth, router]);

  const scoreTrend = startupScore > 50 ? "up" : startupScore < 30 ? "down" : "neutral";
  
  // Calculate level and XP progress
  const level = Math.floor(insightXp / 100) + 1;
  const xpForNextLevel = level * 100;
  const xpToNextLevel = xpForNextLevel - insightXp;

  const handleGenerateMissions = async () => {
    if (!isInitialized) {
        toast({ title: "Simulation Not Ready", description: "Initialize your simulation to generate quests.", variant: "destructive"});
        return;
    }
    setIsLoadingMissions(true);
    try {
        const simStateForAI = {
            simulationMonth, companyName, financials, userMetrics, product, resources, market, startupScore,
            keyEvents: keyEvents.slice(-5).map(e => e.description),
            rewards, initialGoals, missions, suggestedChallenges, isInitialized,
            currentAiReasoning: null,
            historicalRevenue: [], historicalUserGrowth: [], historicalBurnRate: [], historicalNetProfitLoss: [],
            historicalExpenseBreakdown: [], historicalCAC: [], historicalChurnRate: [], historicalProductProgress: [],
            sandboxState: null, isSandboxing: false, sandboxRelativeMonth: 0,
        };

        const input: GenerateDynamicMissionsInput = {
            simulationStateJSON: JSON.stringify(simStateForAI),
            recentEvents: keyEvents.slice(-3).map(e => e.description),
            currentGoals: initialGoals,
        };
        const result = await generateDynamicMissions(input);
        setMissions(result.generatedMissions);
        toast({ title: "New Quests Generated!", description: "The AI has suggested new objectives."});
    } catch (error) {
        console.error("Error generating dynamic missions:", error);
        toast({ title: "Quest Generation Failed", description: "Could not get new quests from AI.", variant: "destructive"});
    } finally {
        setIsLoadingMissions(false);
    }
  };

  const achievements = keyEvents
    .filter(event => 
        event.category === "Product" || event.category === "Financial" ||
        (event.category === "General" && event.impact === "Positive") ||
        event.description.toLowerCase().includes("milestone") || 
        event.description.toLowerCase().includes("achieved") || 
        event.description.toLowerCase().includes("unlocked") ||
        event.description.toLowerCase().includes("reward earned:") ||
        event.description.toLowerCase().includes("product advanced to")
    )
    .slice(-10) 
    .reverse();

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">
       {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            Please go to the "Launch Pad" to initialize your digital twin before viewing achievements.
             <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Launch Pad</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-primary/5 to-background border border-accent/20 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-accent to-yellow-400 shadow-lg">
              <Trophy className="h-10 w-10 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-headline font-bold text-foreground">
                Achievement Hub
              </h1>
              <p className="text-muted-foreground text-lg">
                Track your progress, complete quests, and unlock achievements in your startup journey.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <XPDisplay
              currentXP={insightXp}
              level={level}
              xpToNextLevel={xpToNextLevel}
              totalXPForNextLevel={100}
            />
            <ScoreDisplay score={isInitialized ? startupScore : 0} trend={isInitialized ? scoreTrend : "neutral"} />
            <Card className="bg-gradient-to-br from-card to-orange-500/5 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Streak</span>
                </div>
                <div className="text-2xl font-bold">7 Days</div>
                <Badge variant="warning" className="mt-2 text-xs">
                  🔥 On Fire!
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {financials.cashOnHand <= 0 && isInitialized && (
         <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>🚨 Game Over - Mission Failed!</AlertTitle>
          <AlertDescription>
            Achievements and rewards are paused as the simulation has ended. Reset the simulation from the command center to try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Quests */}
      <Card className="shadow-lg bg-gradient-to-br from-card to-primary/5 border-primary/20">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Active Quests</CardTitle>
                </div>
                <Button 
                  onClick={handleGenerateMissions} 
                  disabled={isLoadingMissions || !isInitialized} 
                  size="sm" 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                    {isLoadingMissions ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Wand2 className="h-4 w-4 mr-2"/>}
                    {isLoadingMissions ? "Generating..." : "Generate New Quests"}
                </Button>
            </div>
            <CardDescription>Complete these objectives to grow your startup and earn rewards.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isInitialized && missions.length > 0 ? (
                missions.map((mission) => (
                  <QuestCard
                    key={mission.id}
                    title={mission.title}
                    description={mission.description}
                    progress={mission.isCompleted ? 1 : 0}
                    maxProgress={1}
                    reward={mission.rewardText}
                    difficulty={mission.difficulty || "medium"}
                    completed={mission.isCompleted}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{isInitialized ? "No active quests. Click 'Generate New Quests' to get some from the AI." : "Initialize simulation to see quests."}</p>
                </div>
              )}
            </div>
        </CardContent>
      </Card>

      {/* Achievements and Rewards */}
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* Achievements */}
        <Card className="shadow-lg bg-gradient-to-br from-card to-purple-500/5 border-purple-500/20">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Star className="h-5 w-5 text-purple-500" />
                    </div>
                    <CardTitle className="font-headline">Achievements</CardTitle>
                </div>
                <CardDescription>Milestones and accomplishments from your startup journey.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px]">
                {isInitialized && achievements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {achievements.map((event, index) => (
                        <AchievementBadge
                          key={event.id || index}
                          title={`Month ${event.month} Achievement`}
                          description={event.description}
                          icon={event.category === "Financial" ? "crown" : 
                                event.category === "Product" ? "star" : 
                                event.category === "Market" ? "target" : "trophy"}
                          rarity={event.impact === "Positive" ? "legendary" : 
                                 event.impact === "Neutral" ? "rare" : "common"}
                          unlocked={true}
                        />
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Crown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No achievements unlocked yet.</p>
                        <p className="text-xs">Advance the simulation to earn achievements.</p>
                    </div>
                )}
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Rewards */}
        <Card className="shadow-lg bg-gradient-to-br from-card to-yellow-500/5 border-yellow-500/20">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </div>
                    <CardTitle className="font-headline">Rewards Vault</CardTitle>
                </div>
                <CardDescription>Special perks and bonuses you've earned on your journey.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px]">
                {isInitialized && rewards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {rewards.map((reward) => (
                        <Card key={reward.id} className="bg-gradient-to-r from-yellow-500/10 to-accent/10 border-yellow-500/30 p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-accent shadow-lg">
                              <Sparkles className="h-5 w-5 text-black" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{reward.name}</h3>
                              <p className="text-xs text-muted-foreground">{reward.description}</p>
                              <p className="text-xs text-yellow-500/80 mt-1">Earned: {reward.dateEarned}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No rewards earned yet.</p>
                        <p className="text-xs">Complete quests and achieve milestones to earn rewards.</p>
                    </div>
                )}
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}