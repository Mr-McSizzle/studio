
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FlaskConical, Info, AlertTriangle, Sparkles, Loader2, DollarSign, Users, Bot, Target, TrendingUp, TrendingDown, GanttChartSquare, Activity, Briefcase, Goal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { simulateFeatureLaunch, type SimulateFeatureLaunchInput, type SimulateFeatureLaunchOutput } from "@/ai/flows/simulate-feature-launch-flow";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAgentProfileById, agentsList } from "@/lib/agentsData";
import { cn } from "@/lib/utils";

const AnalysisLoadingState = () => (
  <div className="text-center p-8 border-dashed border-2 border-primary/30 rounded-lg bg-primary/5 animate-pulse-glow-border min-h-[400px] flex flex-col justify-center" style={{ animationDuration: '3s' }}>
    <div className="relative w-24 h-24 mx-auto mb-6">
        <motion.div
            className="absolute inset-0 bg-primary/20 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
            className="absolute inset-2 border-2 border-accent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <GanttChartSquare className="absolute inset-0 m-auto h-10 w-10 text-primary animate-subtle-pulse" />
    </div>
    <h3 className="text-2xl font-headline text-primary mb-3">Analyzing Proposal...</h3>
    <p className="text-muted-foreground">EVE and her AI agents are entering the digital prototype chamber to simulate your launch.</p>
  </div>
);

interface ResultStatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    description: string;
    valueColor?: string;
    iconColor?: string;
}

const ResultStatCard = ({ icon: Icon, label, value, description, valueColor = "text-foreground", iconColor = "text-primary" }: ResultStatCardProps) => (
    <div className="p-4 rounded-lg bg-muted/50 border border-border/50 flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("h-5 w-5", iconColor)} />
                <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
            </div>
            <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
        </div>
        <p className="text-xs text-muted-foreground/80 mt-1">{description}</p>
    </div>
);

const launchGoalsOptions = [
    { id: 'user_growth', label: 'User Growth' },
    { id: 'retention', label: 'Improve Retention' },
    { id: 'revenue', label: 'Increase Revenue' },
    { id: 'market_share', label: 'Gain Market Share' },
];

export default function InnovationHubPage() {
  const router = useRouter();
  const { isInitialized, ...simState } = useSimulationStore();
  const { toast } = useToast();

  const [featureName, setFeatureName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimulateFeatureLaunchOutput | null>(null);

  const getSerializableSimulationState = () => {
    // Abridged state for the AI
    return {
      simulationMonth: simState.simulationMonth,
      companyName: simState.companyName,
      financials: simState.financials,
      userMetrics: simState.userMetrics,
      product: simState.product,
      market: simState.market,
      startupScore: simState.startupScore,
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!featureName.trim() || !targetAudience.trim() || !estimatedBudget.trim()) {
      toast({ title: "Core Fields Required", description: "Please describe your feature, its audience, and a budget.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const input: SimulateFeatureLaunchInput = {
        simulationStateJSON: JSON.stringify(getSerializableSimulationState()),
        featureName,
        targetAudience,
        estimatedBudget: parseFloat(estimatedBudget) || 0,
        selectedAgentIds,
        launchGoals: selectedGoals as ('user_growth' | 'retention' | 'revenue' | 'market_share')[],
      };
      
      const analysisResults = await simulateFeatureLaunch(input);
      setResults(analysisResults);
      toast({ title: "Analysis Complete", description: "EVE and her team have reviewed your proposal." });

    } catch (err) {
      console.error("Error simulating feature launch:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAgentSelection = (agentId: string) => {
    setSelectedAgentIds(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };
  
  const handleGoalSelection = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
    );
  };

  const getChurnIconAndColor = (churnImpact: number) => {
      if (churnImpact < -0.001) return { Icon: TrendingDown, color: "text-green-500" };
      if (churnImpact > 0.001) return { Icon: TrendingUp, color: "text-destructive" };
      return { Icon: Activity, color: "text-muted-foreground" };
  }

  const { Icon: ChurnIcon, color: churnColor } = getChurnIconAndColor(results?.projections.churnImpact ?? 0);

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-accent" />
          Innovation Hub
        </h1>
        <p className="text-muted-foreground">
          Propose a new feature or product line and let your AI team analyze its potential impact.
        </p>
      </header>
      
      {!isInitialized && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation Not Initialized</AlertTitle>
          <AlertDescription>
            You must have an active simulation to use the Innovation Hub.
            <Button onClick={() => router.push('/app/setup')} className="mt-2 ml-2" size="sm">Go to Setup</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-8 bg-card/80 backdrop-blur-sm card-glow-hover-primary">
            <CardHeader>
              <CardTitle>Proposal Capsule</CardTitle>
              <CardDescription>Define your next big move.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="feature-name">Feature / Product Name</Label>
                  <Input 
                    id="feature-name"
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    placeholder="e.g., AI-Powered Analytics Suite"
                    disabled={isLoading || !isInitialized}
                  />
                </div>
                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Textarea
                    id="target-audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Existing power users, enterprise clients"
                    disabled={isLoading || !isInitialized}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated-budget">Estimated Budget ({simState.financials.currencySymbol})</Label>
                  <Input
                    id="estimated-budget"
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    placeholder="e.g., 50000"
                    disabled={isLoading || !isInitialized}
                  />
                </div>
                
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Goal className="h-4 w-4" /> Strategic Goals</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {launchGoalsOptions.map(goal => (
                             <div key={goal.id} className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                                <Checkbox id={`goal-${goal.id}`} checked={selectedGoals.includes(goal.id)} onCheckedChange={() => handleGoalSelection(goal.id)} />
                                <label htmlFor={`goal-${goal.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{goal.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Consulting AI Agents</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {agentsList.filter(agent => agent.id !== 'eve-hive-mind').map(agent => (
                             <div key={agent.id} className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                                <Checkbox id={`agent-${agent.id}`} checked={selectedAgentIds.includes(agent.id)} onCheckedChange={() => handleAgentSelection(agent.id)} />
                                <label htmlFor={`agent-${agent.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{agent.shortName}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !isInitialized}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isLoading ? "Analyzing..." : "Get AI Analysis"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {error && (
             <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && <AnalysisLoadingState />}

          {!results && !isLoading && !error && (
            <Card className="text-center py-12 border-dashed">
              <CardContent>
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Awaiting Proposal</h3>
                <p className="text-muted-foreground">Fill out the form to get an AI-powered analysis of your feature launch.</p>
              </CardContent>
            </Card>
          )}
          
          <AnimatePresence>
          {results && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-6"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><GanttChartSquare className="h-5 w-5 text-primary"/>Quantitative Projections</CardTitle>
                  <CardDescription>3-month outlook based on the AI simulation.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ResultStatCard icon={Target} label="Market Fit Score" value={`${results.projections.marketFitScore} / 100`} description="How well this feature meets market needs." valueColor="text-primary" />
                  <ResultStatCard icon={ChurnIcon} label="Churn Impact" value={`${(results.projections.churnImpact * 100).toFixed(2)}%`} description="Estimated monthly change in user churn." valueColor={churnColor} iconColor={churnColor}/>
                  <ResultStatCard icon={Users} label="User Adoption" value={`~${results.projections.projectedUserAdoption.toLocaleString()}`} description="Adoption by existing users." />
                  <ResultStatCard icon={Users} label="New Users" value={`~${results.projections.projectedNewUsers.toLocaleString()}`} description="New users attracted by the feature." />
                  <ResultStatCard icon={DollarSign} label="Revenue Impact" value={`+${simState.financials.currencySymbol}${results.projections.projectedRevenueImpact.toLocaleString()}`} description="Est. monthly revenue increase." valueColor="text-green-500" iconColor="text-green-500"/>
                  <ResultStatCard icon={DollarSign} label="Burn Increase" value={`+${simState.financials.currencySymbol}${results.projections.projectedBurnRateChange.toLocaleString()}`} description="Est. monthly burn rate increase." valueColor="text-destructive" iconColor="text-destructive"/>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary"/>Qualitative Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                       <Avatar className="h-7 w-7 border-2 border-accent">
                          <AvatarImage src={getAgentProfileById('eve-hive-mind')?.avatarUrl} />
                          <AvatarFallback>E</AvatarFallback>
                       </Avatar>
                       EVE's Strategic Overview
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">{results.feedback.eveFeedback}</p>
                  </div>
                  <div className="space-y-3">
                    {results.feedback.agentFeedback.map((agentFeedback) => {
                      const agentProfile = getAgentProfileById(agentFeedback.agentId);
                      return (
                        <div key={agentFeedback.agentId}>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Avatar className="h-7 w-7 border-2 border-secondary">
                              <AvatarImage src={agentProfile?.avatarUrl} />
                              <AvatarFallback>{agentProfile?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {agentFeedback.agentName}'s Analysis
                          </h4>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">{agentFeedback.feedback}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
