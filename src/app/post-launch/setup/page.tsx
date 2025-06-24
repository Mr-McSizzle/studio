
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSimulationStore } from '@/store/simulationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { CinematicSetupOverlay } from '@/components/setup/CinematicSetupOverlay';
import { 
  Building2, BarChart, Users, Wrench, Lightbulb, AlertTriangle, Loader2, Sparkles, Target, 
  TrendingDown, DollarSign, Scale, BrainCircuit, Wallet
} from 'lucide-react';

const businessModels = ["SaaS", "Marketplace", "D2C", "B2B Services", "Other"];
const teamAreas = ["Product", "Marketing", "Sales", "Support", "Ops", "Finance", "Engineering"];
const initialFeatures = ["User Authentication", "Core Product Offering", "Payment Integration", "Basic Analytics"];
const challenges = [
  { id: 'high_churn', label: 'High Churn', icon: TrendingDown },
  { id: 'poor_retention', label: 'Poor Retention', icon: Users },
  { id: 'high_cac', label: 'High CAC', icon: DollarSign },
  { id: 'revenue_plateau', label: 'Revenue Plateau', icon: BarChart },
  { id: 'scaling_issues', label: 'Scaling Issues', icon: Scale },
  { id: 'burn_rate_anxiety', label: 'Burn Rate Anxiety', icon: Wallet },
  { id: 'product_market_fit', label: 'Product-Market Fit', icon: Target },
];

const initializationSteps = [
  "Calibrating Post-Launch Metrics...",
  "Syncing Digital Twin with Live Data...",
  "Engaging Growth Algorithms...",
  "Evolving Hive Mind Consciousness...",
];
const eveFinalMessage = "Welcome to the post-launch realm. I’ve initialized your business twin. Let’s scale boldly.";


export default function PostLaunchSetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  // We'll create a new action for this in the store
  const initializePostLaunchSimulation = useSimulationStore(state => state.initializeSimulation); // Reusing for simplicity, but logic will differ. A dedicated one is better.
  const resetSimStore = useSimulationStore(state => state.resetSimulation);

  // Form State
  const [businessModel, setBusinessModel] = useState('');
  const [mrr, setMrr] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [activeUsers, setActiveUsers] = useState('');
  const [teamComposition, setTeamComposition] = useState<string[]>([]);
  const [launchedFeatures, setLaunchedFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [strategicGoals, setStrategicGoals] = useState('');
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showCinematicOverlay, setShowCinematicOverlay] = useState(false);
  const [cinematicStepIndex, setCinematicStepIndex] = useState(0);
  const [cinematicProgressText, setCinematicProgressText] = useState("");
  const [showEveInOverlay, setShowEveInOverlay] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCinematicOverlay && !showEveInOverlay && cinematicStepIndex < initializationSteps.length) {
      setCinematicProgressText(initializationSteps[cinematicStepIndex]);
      timer = setTimeout(() => {
        setCinematicStepIndex(prev => prev + 1);
      }, 1500); // Shorter delay for post-launch
    } else if (showCinematicOverlay && !showEveInOverlay && cinematicStepIndex >= initializationSteps.length) {
      timer = setTimeout(() => {
        setShowEveInOverlay(true);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showCinematicOverlay, cinematicStepIndex, showEveInOverlay]);


  const handleAddFeature = () => {
    if (newFeature.trim() && !launchedFeatures.includes(newFeature.trim())) {
      setLaunchedFeatures([...launchedFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setLaunchedFeatures(launchedFeatures.filter(f => f !== featureToRemove));
  };
  
  const handleToggleTeamArea = (area: string) => {
    setTeamComposition(prev => 
      prev.includes(area) ? prev.filter(t => t !== area) : [...prev, area]
    );
  };
  
  const handleToggleChallenge = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) ? prev.filter(c => c !== challengeId) : [...prev, challengeId]
    );
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!businessModel || !mrr || !activeUsers) {
        toast({
            title: "Required Fields Missing",
            description: "Please fill in Business Model, MRR, and Active Users.",
            variant: "destructive"
        });
        return;
    }

    setIsLoading(true);
    setShowCinematicOverlay(true);
    setCinematicStepIndex(0);
    setShowEveInOverlay(false);
    resetSimStore(); // Clear any old state before initializing

    // Mocking Firestore save by preparing data for Zustand store
    const postLaunchData = {
      businessModel,
      mrr: parseFloat(mrr) || 0,
      currency,
      activeUsers: parseInt(activeUsers, 10) || 0,
      teamComposition,
      launchedFeatures,
      strategicGoals,
      selectedChallenges
    };

    // This is a simplified adaptation. A real scenario would use a dedicated AI flow.
    // For now, we'll create a prompt-like structure to pass to the existing initializer.
    const fullPromptForAI = `
      This is a POST-LAUNCH setup.
      Company Name: Evolved Venture
      Business Model: ${postLaunchData.businessModel}
      Current MRR: ${postLaunchData.currency} ${postLaunchData.mrr}
      Active Users: ${postLaunchData.activeUsers}
      Team Areas: ${postLaunchData.teamComposition.join(', ') || 'Not specified'}
      Launched Features: ${postLaunchData.launchedFeatures.join(', ') || 'Core product'}
      Strategic Goals: ${postLaunchData.strategicGoals || 'Scale and optimize.'}
      Current Challenges: ${postLaunchData.selectedChallenges.join(', ')}
    `;

    const mockAiOutput = {
        initialConditions: JSON.stringify({
            companyName: "Evolved Venture",
            market: { targetMarketDescription: `An established ${postLaunchData.businessModel} business.` },
            productService: { name: "Live Product", initialDevelopmentStage: 'growth', features: postLaunchData.launchedFeatures, pricePerUser: postLaunchData.mrr / (postLaunchData.activeUsers || 1) || 25 },
            financials: {
                startingCash: postLaunchData.mrr * 6, // Assume 6 months runway as cash
                estimatedInitialMonthlyBurnRate: postLaunchData.mrr * 0.8, // Assume 80% burn rate
                currencyCode: postLaunchData.currency,
            },
            initialGoals: postLaunchData.strategicGoals ? [postLaunchData.strategicGoals] : [],
        }),
        suggestedChallenges: JSON.stringify(postLaunchData.selectedChallenges.map(c => `Address challenge: ${c}`))
    };

    // We use the existing initializeSimulation function but it will now get post-launch flavored data
    initializePostLaunchSimulation(mockAiOutput, "Evolved Venture", `An established ${postLaunchData.businessModel} business`, String(postLaunchData.mrr * 6), postLaunchData.currency, 'scaler');
    
    // Simulate async operation and cinematic display
    setTimeout(() => {
        toast({
            title: "Digital Twin Evolved!",
            description: "Your post-launch simulation is active. Redirecting to the dashboard...",
        });
        router.push("/app/post-launch/dashboard");
        setShowCinematicOverlay(false);
    }, 4000); // Wait for cinematic sequence
  };

  return (
    <>
    <CinematicSetupOverlay
        isVisible={showCinematicOverlay}
        currentText={cinematicProgressText}
        isEveVisible={showEveInOverlay}
        eveMessage={eveFinalMessage}
    />
    <div className="min-h-screen text-white relative overflow-hidden flex items-center justify-center p-4">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50"
        src="/new-assets/launchpadbg.mp4"
      >
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-slate-950/80 z-10" />

      <div className="relative z-20 w-full max-w-4xl animate-fadeInUp">
        <motion.div 
            className="absolute -top-12 -left-12 opacity-0 md:opacity-100"
            animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src="/new-assets/custom_eve_avatar.png"
            alt="EVE, the AI Hive Mind"
            width={120}
            height={120}
            className="rounded-full filter drop-shadow-[0_0_15px_hsl(var(--accent)/0.5)]"
          />
        </motion.div>
        
        <Card className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-primary-glow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-glow-primary">Post-Launch Setup</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Now that you're live, let's evolve. Input your current startup status to activate real-world digital twin simulations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <Label className="flex items-center gap-2 mb-2"><Building2 className="h-4 w-4" />Business Model</Label>
                        <Select onValueChange={setBusinessModel} value={businessModel} disabled={isLoading}>
                            <SelectTrigger><SelectValue placeholder="Select model..." /></SelectTrigger>
                            <SelectContent>
                                {businessModels.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="flex items-center gap-2 mb-2"><BarChart className="h-4 w-4" />Current Monthly Recurring Revenue (MRR)</Label>
                      <div className="flex">
                         <Select value={currency} onValueChange={setCurrency} disabled={isLoading}>
                            <SelectTrigger className="w-[80px] rounded-r-none border-r-0"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">$</SelectItem>
                                <SelectItem value="EUR">€</SelectItem>
                                <SelectItem value="JPY">¥</SelectItem>
                                <SelectItem value="GBP">£</SelectItem>
                                <SelectItem value="INR">₹</SelectItem>
                            </SelectContent>
                         </Select>
                         <Input type="number" value={mrr} onChange={e => setMrr(e.target.value)} placeholder="5000" className="rounded-l-none" required disabled={isLoading} />
                      </div>
                    </div>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2"><Users className="h-4 w-4" />Active Users</Label>
                  <Input type="number" value={activeUsers} onChange={e => setActiveUsers(e.target.value)} placeholder="1500" required disabled={isLoading} />
                </div>

                <div>
                    <Label className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4" />Team Composition</Label>
                    <div className="flex flex-wrap gap-2">
                        {teamAreas.map(area => (
                            <Button key={area} type="button" variant={teamComposition.includes(area) ? 'default' : 'secondary'} onClick={() => handleToggleTeamArea(area)} className="rounded-full px-3 py-1 h-auto text-xs" disabled={isLoading}>
                                {area}
                            </Button>
                        ))}
                    </div>
                </div>

                 <div>
                    <Label className="flex items-center gap-2 mb-2"><Wrench className="h-4 w-4" />Features Already Launched</Label>
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                        {initialFeatures.map(feature => (
                            <div key={feature} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <Checkbox id={feature} checked={launchedFeatures.includes(feature)} onCheckedChange={(checked) => {
                                    if(checked) setLaunchedFeatures(p => [...p, feature]);
                                    else setLaunchedFeatures(p => p.filter(f => f !== feature));
                                }}/>
                                <label htmlFor={feature} className="text-sm">{feature}</label>
                            </div>
                        ))}
                        </div>
                        <div className="flex gap-2">
                           <Input value={newFeature} onChange={e => setNewFeature(e.target.value)} placeholder="Add custom feature..." className="flex-grow" disabled={isLoading}/>
                           <Button type="button" onClick={handleAddFeature} disabled={isLoading || !newFeature.trim()}>Add</Button>
                        </div>
                         {launchedFeatures.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {launchedFeatures.filter(f => !initialFeatures.includes(f)).map(f => (
                                    <Badge key={f} variant="outline" className="text-primary border-primary/50 bg-primary/10">
                                        {f} <button onClick={() => handleRemoveFeature(f)} className="ml-1.5 opacity-70 hover:opacity-100">&times;</button>
                                    </Badge>
                                ))}
                            </div>
                         )}
                    </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4" />Strategic Goals (Next 6 Months)</Label>
                  <Textarea value={strategicGoals} onChange={e => setStrategicGoals(e.target.value)} placeholder="e.g., Increase user retention by 15%, launch Enterprise pricing tier..." maxLength={300} disabled={isLoading} />
                </div>
                
                 <div>
                    <Label className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" />Current Post-Launch Challenges</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {challenges.map(({ id, label, icon: Icon }) => (
                         <div key={id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                           <Checkbox id={id} checked={selectedChallenges.includes(id)} onCheckedChange={() => handleToggleChallenge(id)} />
                           <label htmlFor={id} className="text-sm flex items-center gap-1.5"><Icon className="h-4 w-4 text-muted-foreground"/>{label}</label>
                         </div>
                      ))}
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <Button type="submit" size="lg" className="w-full md:w-1/2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20" disabled={isLoading}>
                         {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                        Initialize Digital Twin
                    </Button>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
