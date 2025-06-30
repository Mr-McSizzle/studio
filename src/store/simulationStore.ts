
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DigitalTwinState, Reward, AIInitialConditions, RevenueDataPoint, UserDataPoint, SimulateMonthInput, SimulateMonthOutput, HistoricalDataPoint, ExpenseBreakdownDataPoint, TeamMember, ExpenseBreakdown, SimulationSnapshot, Mission, StructuredKeyEvent, KeyEventCategory, KeyEventImpact, GeneratedMission, FounderArchetype, ActiveSurpriseEvent, SurpriseEventHistoryItem, SurpriseEventOptionOutcome } from '@/types/simulation';
import type { PromptStartupOutput } from '@/ai/flows/prompt-startup';
import { simulateMonth as simulateMonthFlow } from '@/ai/flows/simulate-month-flow';
import { generateDynamicMissions, type GenerateDynamicMissionsInput } from '@/ai/flows/generate-dynamic-missions-flow';
import { useAiMentorStore, EVE_MAIN_CHAT_CONTEXT_ID } from './aiMentorStore';

const MOCK_PRICE_PER_USER_PER_MONTH_DEFAULT = 10;
const MOCK_SALARY_PER_FOUNDER = 0;
const MOCK_SALARY_PER_EMPLOYEE = 4000;
const MOCK_OTHER_OPERATIONAL_COSTS_FALLBACK = 1500;
const DEFAULT_ENGINEER_SALARY = 5000;
const DEFAULT_MARKETING_SPEND = 500;
const DEFAULT_RND_SPEND = 500;


const getCurrencySymbol = (code?: string): string => {
  if (!code) return "$";
  const map: Record<string, string> = { USD: "$", EUR: "€", JPY: "¥", GBP: "£", CAD: "C$", AUD: "A$" };
  return map[code.toUpperCase()] || code;
};

const createStructuredEvent = (
  month: number,
  description: string,
  category: KeyEventCategory,
  impact: KeyEventImpact
): StructuredKeyEvent => ({
  id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  timestamp: new Date().toISOString(),
  month,
  description,
  category,
  impact,
});

const onboardingMissions: Mission[] = [
  {
    id: "onboarding-1",
    title: "Explore Your Dashboard",
    description: "Visit the Dashboard to get an overview of your startup's initial state: financials, user metrics, and startup score.",
    rewardText: "+2 Startup Score, Quick Tip from EVE",
    isCompleted: false,
    difficulty: "easy",
  },
  {
    id: "onboarding-2",
    title: "Meet Your AI Team",
    description: "Navigate to the 'AI Agent Team' page. These AI specialists are here to help you. Click on one to see their profile.",
    rewardText: "+3 Startup Score",
    isCompleted: false,
    difficulty: "easy",
  },
  {
    id: "onboarding-3",
    title: "Consult EVE, Your Hive Mind",
    description: "Go to the 'Hive Mind Assistant' page and ask EVE her first question. Try 'What should be my first focus?' or 'Tell me about my initial burn rate.'",
    rewardText: "+5 Startup Score, Unlock 'Market Analysis Basics' Tip",
    isCompleted: false,
    difficulty: "easy",
  },
  {
    id: "onboarding-4",
    title: "Adjust Your First Decision",
    description: "Go to 'Decision Controls'. Try slightly increasing your marketing spend or R&D spend. These changes take effect next month.",
    rewardText: "+3 Startup Score",
    isCompleted: false,
    difficulty: "easy",
  },
  {
    id: "onboarding-5",
    title: "Simulate Your First Month",
    description: "Return to the Dashboard and click 'Simulate Next Month' to see the impact of your initial setup and any decisions made.",
    rewardText: "+5 Startup Score, First Month Milestone Badge",
    isCompleted: false,
    difficulty: "medium",
  },
];

export interface EarnedBadge {
  questId: string;
  name: string;
  description: string;
  icon?: string;
  dateEarned: string;
}


const initialBaseState: Omit<DigitalTwinState, 'missions' | 'rewards' | 'keyEvents' | 'historicalRevenue' | 'historicalUserGrowth' | 'historicalBurnRate' | 'historicalNetProfitLoss' | 'historicalExpenseBreakdown' | 'currentAiReasoning' | 'sandboxState' | 'isSandboxing' | 'sandboxRelativeMonth' | 'historicalCAC' | 'historicalChurnRate' | 'historicalProductProgress' | 'historicalInvestorSentiment' | 'earnedBadges' | 'selectedArchetype' | 'activeSurpriseEvent' | 'surpriseEventHistory' | 'activeScenarios' | 'activeMonthlySummary'> = {
  simulationMonth: 0,
  companyName: "Your New Venture",
  financials: {
    revenue: 0,
    expenses: MOCK_OTHER_OPERATIONAL_COSTS_FALLBACK + DEFAULT_MARKETING_SPEND + DEFAULT_RND_SPEND,
    profit: -(MOCK_OTHER_OPERATIONAL_COSTS_FALLBACK + DEFAULT_MARKETING_SPEND + DEFAULT_RND_SPEND),
    burnRate: MOCK_OTHER_OPERATIONAL_COSTS_FALLBACK + DEFAULT_MARKETING_SPEND + DEFAULT_RND_SPEND,
    cashOnHand: 0,
    fundingRaised: 0,
    currencyCode: "USD",
    currencySymbol: "$",
  },
  userMetrics: {
    activeUsers: 0,
    newUserAcquisitionRate: 0,
    customerAcquisitionCost: 20,
    churnRate: 0.05,
    monthlyRecurringRevenue: 0,
  },
  product: {
    name: "Unnamed Product/Service",
    stage: 'idea',
    features: ["Core Concept"],
    developmentProgress: 0,
    pricePerUser: MOCK_PRICE_PER_USER_PER_MONTH_DEFAULT,
  },
  resources: {
    initialBudget: 0,
    marketingSpend: DEFAULT_MARKETING_SPEND,
    rndSpend: DEFAULT_RND_SPEND,
    team: [{ role: 'Founder', count: 1, salary: MOCK_SALARY_PER_FOUNDER }],
  },
  market: {
    targetMarketDescription: "Not yet defined.",
    marketSize: 100000,
    competitionLevel: 'moderate',
  },
  startupScore: 10,
  investorSentiment: 50,
  isInitialized: false,
  initialGoals: [],
};


const getInitialState = (): DigitalTwinState & { savedSimulations: SimulationSnapshot[] } => ({
  ...initialBaseState,
  selectedArchetype: undefined,
  keyEvents: [createStructuredEvent(0, "Simulation not yet initialized. Set up your venture to begin!", "System", "Neutral")],
  rewards: [],
  earnedBadges: [],
  suggestedChallenges: [],
  historicalInvestorSentiment: [],
  historicalRevenue: [],
  historicalUserGrowth: [],
  historicalBurnRate: [],
  historicalNetProfitLoss: [],
  historicalExpenseBreakdown: [],
  historicalCAC: [],
  historicalChurnRate: [],
  historicalProductProgress: [],
  missions: [...onboardingMissions],
  currentAiReasoning: "AI log awaiting initialization.",
  sandboxState: null,
  isSandboxing: false,
  sandboxRelativeMonth: 0,
  savedSimulations: [],
  activeSurpriseEvent: null,
  surpriseEventHistory: [],
  activeScenarios: [],
  activeMonthlySummary: null,
});

interface SimulationActions {
  initializeSimulation: (aiOutput: PromptStartupOutput, userStartupName: string, userTargetMarket: string, userBudget: string, userCurrencyCode: string, selectedArchetype?: FounderArchetype) => void;
  advanceMonth: () => Promise<void>;
  resetSimulation: () => void;
  setMarketingSpend: (amount: number) => void;
  setRndSpend: (amount: number) => void;
  setPricePerUser: (price: number) => void;
  adjustTeamMemberCount: (roleToAdjust: string, change: number, salaryPerMember?: number) => void;
  setMissions: (generatedMissionsFromAI: GeneratedMission[]) => void;
  toggleMissionCompletion: (missionId: string) => void;
  awardQuestBadge: (badgeName: string, badgeDescription: string, questId: string, icon?: string) => void;
  startSandboxExperiment: () => void;
  setSandboxMarketingSpend: (amount: number) => void;
  setSandboxRndSpend: (amount: number) => void;
  setSandboxPricePerUser: (price: number) => void;
  adjustSandboxTeamMemberCount: (roleToAdjust: string, change: number, salaryPerMember?: number) => void;
  simulateMonthInSandbox: () => Promise<void>;
  discardSandboxExperiment: () => void;
  applySandboxDecisionsToMain: () => void;
  saveCurrentSimulation: (name: string) => DigitalTwinState | null;
  loadSimulation: (snapshotId: string) => DigitalTwinState | null;
  deleteSavedSimulation: (snapshotId: string) => void;
  triggerSurpriseEvent: () => void;
  resolveSurpriseEvent: (outcome: 'accepted' | 'rejected') => void;
  addScenario: (scenario: string) => void;
  removeScenario: (scenario: string) => void;
  acknowledgeMonthlySummary: () => void;
}

const parseMonetaryValue = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleanedValue = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanedValue) || 0;
  }
  return 0;
};

const extractActiveSimState = (state: DigitalTwinState & { savedSimulations: SimulationSnapshot[] }): DigitalTwinState => {
  return {
    simulationMonth: state.simulationMonth,
    companyName: state.companyName,
    financials: state.financials,
    userMetrics: state.userMetrics,
    product: state.product,
    resources: state.resources,
    market: state.market,
    startupScore: state.startupScore,
    investorSentiment: state.investorSentiment,
    keyEvents: state.keyEvents,
    rewards: state.rewards,
    earnedBadges: state.earnedBadges, 
    initialGoals: state.initialGoals,
    missions: state.missions,
    suggestedChallenges: state.suggestedChallenges,
    isInitialized: state.isInitialized,
    currentAiReasoning: state.currentAiReasoning,
    selectedArchetype: state.selectedArchetype,
    historicalInvestorSentiment: state.historicalInvestorSentiment,
    historicalRevenue: state.historicalRevenue,
    historicalUserGrowth: state.historicalUserGrowth,
    historicalBurnRate: state.historicalBurnRate,
    historicalNetProfitLoss: state.historicalNetProfitLoss,
    historicalExpenseBreakdown: state.historicalExpenseBreakdown,
    historicalCAC: state.historicalCAC,
    historicalChurnRate: state.historicalChurnRate,
    historicalProductProgress: state.historicalProductProgress,
    sandboxState: state.sandboxState,
    isSandboxing: state.isSandboxing,
    sandboxRelativeMonth: state.sandboxRelativeMonth,
    activeSurpriseEvent: state.activeSurpriseEvent,
    surpriseEventHistory: state.surpriseEventHistory,
    activeScenarios: state.activeScenarios,
    activeMonthlySummary: state.activeMonthlySummary,
  };
};

const predefinedSurpriseEvents: Omit<ActiveSurpriseEvent, 'monthTriggered'>[] = [
  {
    id: 'event_angel_investor',
    type: 'angel_investor',
    title: 'Unexpected Investor Interest!',
    description: 'An angel investor, impressed by your recent progress, has offered a seed investment! This will provide a significant cash injection, but they will take a small percentage of equity.',
    options: {
      accept: { label: 'Accept Investment', description: 'Gain a large cash boost, but give up some equity.' },
      reject: { label: 'Decline Offer', description: 'Maintain full ownership but forgo the extra capital.' },
    },
    effects: {
      accept: { cashOnHand: 250000, startupScore: 10 },
      reject: { startupScore: -2 },
    },
  },
  {
    id: 'event_dev_rage_quit',
    type: 'dev_rage_quit',
    title: 'Critical Developer Resigns!',
    description: 'A key developer has abruptly quit after a disagreement over product direction! This will significantly slow your development progress for the next few months unless you can quickly hire a replacement.',
    options: {
      accept: { label: 'Acknowledge Setback', description: 'Your development progress will be halved for the next 2 months.' },
      reject: { label: 'Offer Counter-Offer', description: 'Attempt to keep them by offering a large, immediate bonus, depleting cash.' },
    },
    effects: {
      accept: { productDevelopmentModifier: -0.5, startupScore: -5 },
      reject: { cashOnHand: -20000, startupScore: 2 },
    },
  },
];


export const useSimulationStore = create<DigitalTwinState & { savedSimulations: SimulationSnapshot[] } & SimulationActions>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      initializeSimulation: (aiOutput, userStartupName, userTargetMarket, userBudget, userCurrencyCode, selectedArchetype) => {
        let parsedConditions: AIInitialConditions = {};
        try {
          if (!aiOutput || !aiOutput.initialConditions || typeof aiOutput.initialConditions !== 'string') {
            throw new Error("AI output for initialConditions is missing or not a string.");
          }
          parsedConditions = JSON.parse(aiOutput.initialConditions);
        } catch (e) {
          console.error("Failed to parse AI initialConditions JSON. This is a critical error for simulation setup.");
          const errorDetails = e instanceof Error ? e.message : String(e);
          console.error("Error details:", errorDetails);
          console.error("Problematic AI JSON string was:", aiOutput.initialConditions); 

          const errorMessage = `AI returned malformed data for initial setup. Details: ${errorDetails}. Cannot initialize simulation.`;
          set(state => ({
            ...state,
            keyEvents: [createStructuredEvent(0, errorMessage, "System", "Negative")],
            isInitialized: false,
            currentAiReasoning: "Fatal Error: AI provided unusable data for startup initialization. Please try setting up again.",
          }));
          throw new Error(errorMessage);
        }

        const finalCurrencyCode = (parsedConditions.financials?.currencyCode || userCurrencyCode || "USD").toUpperCase();
        const finalCurrencySymbol = getCurrencySymbol(finalCurrencyCode);

        const initialBudgetNum = parseMonetaryValue(parsedConditions.resources?.initialFunding || parsedConditions.financials?.startingCash || userBudget);

        const initialTeamFromAI: TeamMember[] = [];
        if (parsedConditions.resources?.coreTeam) {
          if (Array.isArray(parsedConditions.resources.coreTeam)) {
            initialTeamFromAI.push(...parsedConditions.resources.coreTeam.map((member: any) => ({
                role: member.role || 'Team Member',
                count: member.count || 1,
                salary: parseMonetaryValue(member.salary) || ( (member.role || '').toLowerCase() === 'founder' ? MOCK_SALARY_PER_FOUNDER : MOCK_SALARY_PER_EMPLOYEE)
            })));
          } else if (typeof parsedConditions.resources.coreTeam === 'string' && parsedConditions.resources.coreTeam.toLowerCase().includes('founder')) {
             initialTeamFromAI.push({ role: 'Founder', count: 1, salary: MOCK_SALARY_PER_FOUNDER });
          }
        }

        let finalInitialTeam: TeamMember[] = [];
        const founderInAI = initialTeamFromAI.find(tm => tm.role.toLowerCase() === 'founder');
        if (founderInAI) {
            finalInitialTeam = initialTeamFromAI;
        } else {
            finalInitialTeam = [{ role: 'Founder', count: 1, salary: MOCK_SALARY_PER_FOUNDER }, ...initialTeamFromAI];
        }

        const initialMarketingSpend = parseMonetaryValue(parsedConditions.resources?.marketingSpend) || DEFAULT_MARKETING_SPEND;
        const initialRndSpend = parseMonetaryValue(parsedConditions.resources?.rndSpend) || DEFAULT_RND_SPEND;
        const initialSalaries = finalInitialTeam.reduce((acc, tm) => acc + (tm.count * tm.salary), 0);
        const initialPricePerUser = parseMonetaryValue(parsedConditions.productService?.pricePerUser) || MOCK_PRICE_PER_USER_PER_MONTH_DEFAULT;

        let finalInitialExpenses: number;
        let finalInitialBurnRate: number;
        let initialExpenseBreakdownM0: ExpenseBreakdown;

        const aiEstimatedBurnRate = parseMonetaryValue(parsedConditions.financials?.estimatedInitialMonthlyBurnRate);

        if (aiEstimatedBurnRate > 0) {
          finalInitialBurnRate = aiEstimatedBurnRate;
          finalInitialExpenses = aiEstimatedBurnRate;
           const operationalForM0 = Math.max(0, finalInitialExpenses - (initialSalaries + initialMarketingSpend + initialRndSpend));
          initialExpenseBreakdownM0 = {
            salaries: initialSalaries,
            marketing: initialMarketingSpend,
            rnd: initialRndSpend,
            operational: operationalForM0,
          };
        } else {
          const calculatedOperationalFallback = MOCK_OTHER_OPERATIONAL_COSTS_FALLBACK;
          finalInitialExpenses = initialSalaries + initialMarketingSpend + initialRndSpend + calculatedOperationalFallback;
          finalInitialBurnRate = finalInitialExpenses > 0 ? finalInitialExpenses : calculatedOperationalFallback; 
          initialExpenseBreakdownM0 = {
            salaries: initialSalaries,
            marketing: initialMarketingSpend,
            rnd: initialRndSpend,
            operational: calculatedOperationalFallback,
          };
        }


        const rawGoals = parsedConditions.initialGoals;
        let processedInitialGoals: string[] = [];
        if (Array.isArray(rawGoals)) {
          processedInitialGoals = rawGoals.filter((g): g is string => typeof g === 'string');
        } else if (typeof rawGoals === 'string' && rawGoals.trim() !== '') {
          processedInitialGoals = [rawGoals];
        }

        let processedSuggestedChallenges: string[] = [];
        if (aiOutput.suggestedChallenges) {
            try {
                const parsedChallenges = JSON.parse(aiOutput.suggestedChallenges);
                if (Array.isArray(parsedChallenges)) {
                    processedSuggestedChallenges = parsedChallenges.filter((c): c is string => typeof c === 'string');
                } else if (typeof parsedChallenges === 'string') {
                    processedSuggestedChallenges = [parsedChallenges];
                }
            } catch (e) {
                console.error("Failed to parse AI suggestedChallenges JSON:", e);
                processedSuggestedChallenges = ["AI suggested challenges were malformed."];
            }
        }

        const aiProductStageRaw = parsedConditions.productService?.initialDevelopmentStage?.toLowerCase();
        let finalProductStage: DigitalTwinState['product']['stage'] = 'idea';
        const validStages: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];

        if (aiProductStageRaw) {
          if (validStages.includes(aiProductStageRaw as DigitalTwinState['product']['stage'])) {
            finalProductStage = aiProductStageRaw as DigitalTwinState['product']['stage'];
          } else if (aiProductStageRaw === 'concept') {
            finalProductStage = 'idea';
          } else {
            console.warn(`Unrecognized product stage from AI: "${aiProductStageRaw}" during initialization. Defaulting to "idea".`);
            finalProductStage = 'idea';
          }
        }


        set(state => ({
          ...getInitialState(),
          companyName: userStartupName || parsedConditions.companyName || "AI Suggested Venture",
          selectedArchetype: selectedArchetype,
          market: {
            ...initialBaseState.market,
            targetMarketDescription: userTargetMarket || parsedConditions.market?.targetMarketDescription || "Not specified",
            marketSize: parseMonetaryValue(parsedConditions.market?.estimatedSize) || initialBaseState.market.marketSize,
          },
          resources: {
            ...initialBaseState.resources,
            initialBudget: initialBudgetNum,
            team: finalInitialTeam,
            marketingSpend: initialMarketingSpend,
            rndSpend: initialRndSpend,
          },
          product: {
            ...initialBaseState.product,
            name: parsedConditions.productService?.name || `${userStartupName} Product`,
            stage: finalProductStage,
            features: parsedConditions.productService?.features || ["Core Concept"],
            pricePerUser: initialPricePerUser,
            developmentProgress: 0,
          },
          financials: {
            ...initialBaseState.financials,
            cashOnHand: parseMonetaryValue(parsedConditions.financials?.startingCash) || initialBudgetNum,
            fundingRaised: parseMonetaryValue(parsedConditions.financials?.startingCash) || initialBudgetNum,
            expenses: finalInitialExpenses,
            profit: 0 - finalInitialExpenses, 
            burnRate: finalInitialBurnRate,
            currencyCode: finalCurrencyCode,
            currencySymbol: finalCurrencySymbol,
          },
          initialGoals: processedInitialGoals,
          suggestedChallenges: processedSuggestedChallenges,
          keyEvents: [createStructuredEvent(0, `Simulation initialized for ${parsedConditions.companyName || userStartupName} with budget ${finalCurrencySymbol}${initialBudgetNum.toLocaleString()}. Target: ${userTargetMarket || 'Not specified'}. Initial Burn: ${finalCurrencySymbol}${finalInitialBurnRate.toLocaleString()}/month. Archetype: ${selectedArchetype || 'Not Chosen'}`, "System", "Positive")],
          isInitialized: true,
          simulationMonth: 0,
          startupScore: 10,
          investorSentiment: 50,
          historicalInvestorSentiment: [{ month: 'M0', value: 50, desktop: 50 }],
          activeScenarios: [],
          savedSimulations: state.savedSimulations, 
        }));
      },

      setMarketingSpend: (amount: number) => set(state => {
        if (!state.isInitialized || amount < 0) return state;
        return { 
          ...state,
          resources: { ...state.resources, marketingSpend: amount } 
        };
      }),

      setRndSpend: (amount: number) => set(state => {
        if (!state.isInitialized || amount < 0) return state;
        return { 
          ...state,
          resources: { ...state.resources, rndSpend: amount } 
        };
      }),

      setPricePerUser: (price: number) => set(state => {
        if (!state.isInitialized || price < 0) return state;
        return { 
          ...state,
          product: { ...state.product, pricePerUser: price } 
        };
      }),

      adjustTeamMemberCount: (roleToAdjust: string, change: number, salaryPerMember?: number) => set(state => {
        if (!state.isInitialized) return state;
        const team = state.resources.team.map(member => ({ ...member }));
        const roleIndex = team.findIndex(member => member.role === roleToAdjust);

        if (roleIndex > -1) {
          const newCount = Math.max(0, team[roleIndex].count + change);
           if (team[roleIndex].role.toLowerCase() === 'founder' && newCount === 0 && change < 0) {
            return state; 
          }
          team[roleIndex] = { ...team[roleIndex], count: newCount };
          if (newCount === 0 && team[roleIndex].role.toLowerCase() !== 'founder') {
            team.splice(roleIndex, 1);
          }
        } else if (change > 0) {
          team.push({ role: roleToAdjust, count: change, salary: salaryPerMember || (roleToAdjust.toLowerCase() === 'founder' ? MOCK_SALARY_PER_FOUNDER : DEFAULT_ENGINEER_SALARY) });
        }
        return { 
          ...state,
          resources: { ...state.resources, team } 
        };
      }),

      setMissions: (generatedMissionsFromAI: GeneratedMission[]) => set(state => {
        const newMissions: Mission[] = generatedMissionsFromAI.map(genMission => ({
          ...genMission,
          id: `mission-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          isCompleted: false,
        }));
        return { ...state, missions: newMissions };
      }),
      
      toggleMissionCompletion: (missionId: string) => {
        set(state => {
            const newMissions = state.missions.map(mission => {
                if (mission.id === missionId) {
                    return { ...mission, isCompleted: !mission.isCompleted };
                }
                return mission;
            });
            return { ...state, missions: newMissions };
        });
      },

      awardQuestBadge: (badgeName: string, badgeDescription: string, questId: string, icon?: string) => {
        set(state => {
          const newBadge: EarnedBadge = {
            questId,
            name: badgeName,
            description: badgeDescription,
            icon: icon || 'Award',
            dateEarned: new Date().toISOString(),
          };
          if (state.earnedBadges.some(b => b.questId === questId)) {
            return state;
          }
          return {
            ...state,
            earnedBadges: [...state.earnedBadges, newBadge],
            keyEvents: [...state.keyEvents, createStructuredEvent(state.simulationMonth, `Achievement Unlocked: ${badgeName}! (${badgeDescription})`, "General", "Positive")]
          };
        });
      },

      advanceMonth: async () => {
        const currentState = get();
        if (!currentState.isInitialized || currentState.financials.cashOnHand <= 0) {
          set({ currentAiReasoning: "Cannot advance month: Simulation not initialized or out of cash."});
          return;
        }

        set({ currentAiReasoning: "Hive Mind is simulating month... Processing inputs and predicting outcomes..."});

        let currentProductStageForAI = currentState.product.stage;
        const validStages: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
        if (!validStages.includes(currentProductStageForAI)) {
            if (String(currentProductStageForAI).toLowerCase() === 'concept') {
                currentProductStageForAI = 'idea';
            } else {
                console.warn(`Invalid product stage "${currentProductStageForAI}" detected before AI call in advanceMonth. Defaulting to "idea".`);
                currentProductStageForAI = 'idea';
            }
        }

        const simulateMonthInput: SimulateMonthInput = {
          currentSimulationMonth: currentState.simulationMonth,
          companyName: currentState.companyName,
          financials: {
            cashOnHand: currentState.financials.cashOnHand,
            currentRevenue: currentState.financials.revenue, 
            currentExpenses: currentState.financials.expenses, 
            currencyCode: currentState.financials.currencyCode,
            currencySymbol: currentState.financials.currencySymbol,
          },
          userMetrics: {
            activeUsers: currentState.userMetrics.activeUsers,
            churnRate: currentState.userMetrics.churnRate,
          },
          product: {
            stage: currentProductStageForAI,
            developmentProgress: currentState.product.developmentProgress,
            pricePerUser: currentState.product.pricePerUser,
          },
          resources: {
            marketingSpend: currentState.resources.marketingSpend,
            rndSpend: currentState.resources.rndSpend,
            team: currentState.resources.team,
          },
          market: {
            competitionLevel: currentState.market.competitionLevel,
            targetMarketDescription: currentState.market.targetMarketDescription,
          },
          currentStartupScore: currentState.startupScore,
          currentInvestorSentiment: currentState.investorSentiment,
          activeScenarios: currentState.activeScenarios,
        };

        try {
            const aiOutput: SimulateMonthOutput = await simulateMonthFlow(simulateMonthInput);

            let newState: DigitalTwinState = JSON.parse(JSON.stringify(extractActiveSimState(currentState))); 
            const newKeyEvents: StructuredKeyEvent[] = [];

            newState.simulationMonth = aiOutput.simulatedMonthNumber;
            newState.financials.revenue = aiOutput.calculatedRevenue;
            newState.financials.expenses = aiOutput.calculatedExpenses;
            newState.financials.profit = newState.financials.revenue - newState.financials.expenses;
            newState.financials.cashOnHand = currentState.financials.cashOnHand + newState.financials.profit; 
            const currentMonthBurnRate = Math.max(0, newState.financials.expenses - newState.financials.revenue);
            newState.financials.burnRate = currentMonthBurnRate;

            newState.userMetrics.activeUsers = aiOutput.updatedActiveUsers;
            newState.userMetrics.newUserAcquisitionRate = aiOutput.newUserAcquisition;
            newState.userMetrics.monthlyRecurringRevenue = aiOutput.updatedActiveUsers * newState.product.pricePerUser;
            
            const currentMonthCAC = aiOutput.newUserAcquisition > 0 ? currentState.resources.marketingSpend / aiOutput.newUserAcquisition : currentState.userMetrics.customerAcquisitionCost;
            newState.userMetrics.customerAcquisitionCost = currentMonthCAC; 


            newState.product.developmentProgress = currentState.product.developmentProgress + aiOutput.productDevelopmentDelta; 

            if (aiOutput.newProductStage && aiOutput.newProductStage !== newState.product.stage) {
              newState.product.stage = aiOutput.newProductStage;
              newState.product.developmentProgress = 0; 
              newKeyEvents.push(createStructuredEvent(newState.simulationMonth, `Product advanced to ${newState.product.stage} stage!`, "Product", "Positive"));
            } else if (newState.product.developmentProgress >= 100 && newState.product.stage !== 'mature') {
                const stagesList: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
                const currentStageIndex = stagesList.indexOf(newState.product.stage);
                if (currentStageIndex < stagesList.length - 1) {
                  newState.product.stage = stagesList[currentStageIndex + 1];
                  newState.product.developmentProgress = newState.product.developmentProgress % 100; 
                  newKeyEvents.push(createStructuredEvent(newState.simulationMonth, `Product advanced to ${newState.product.stage} stage! (Progress Milestone)`, "Product", "Positive"));
                } else { 
                    newState.product.stage = 'mature';
                    newState.product.developmentProgress = 100; 
                     newKeyEvents.push(createStructuredEvent(newState.simulationMonth, `Product reached maturity! (Progress Milestone)`, "Product", "Positive"));
                }
            }
            newState.product.developmentProgress = Math.min(100, Math.max(0,newState.product.developmentProgress));

            aiOutput.keyEventsGenerated.forEach(event => {
              newKeyEvents.push(createStructuredEvent(newState.simulationMonth, event.description, event.category, event.impact));
            });
            newKeyEvents.push(createStructuredEvent(newState.simulationMonth, `Month ${newState.simulationMonth} (AI Sim): Revenue ${newState.financials.currencySymbol}${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash ${newState.financials.currencySymbol}${newState.financials.cashOnHand.toLocaleString()}, Burn ${newState.financials.currencySymbol}${currentMonthBurnRate.toLocaleString()}, Profit ${newState.financials.currencySymbol}${newState.financials.profit.toLocaleString()}`, "System", "Neutral"));

            newState.startupScore = Math.max(0, Math.min(100, newState.startupScore + aiOutput.startupScoreAdjustment));
            newState.investorSentiment = Math.max(0, Math.min(100, newState.investorSentiment + aiOutput.investorSentimentAdjustment));
            if (newState.financials.cashOnHand <= 0 && currentState.financials.cashOnHand > 0) { 
                newKeyEvents.push(createStructuredEvent(newState.simulationMonth, `Critical: Ran out of cash! Simulation unstable.`, "Financial", "Negative"));
            }
            
            let currentRewards = [...currentState.rewards];
            if (aiOutput.rewardsGranted && aiOutput.rewardsGranted.length > 0) {
              const newRewardsFromAI: Reward[] = aiOutput.rewardsGranted.map(rewardBase => ({
                ...rewardBase,
                id: `reward-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                dateEarned: new Date().toISOString(),
              }));
              currentRewards.push(...newRewardsFromAI);
              newRewardsFromAI.forEach(nr => newKeyEvents.push(createStructuredEvent(newState.simulationMonth, `Reward Earned: ${nr.name} - ${nr.description}`, "General", "Positive")));
            }
            newState.rewards = currentRewards;

            // Generate new missions for the upcoming month
            const missionInput: GenerateDynamicMissionsInput = {
              simulationStateJSON: JSON.stringify(newState),
              recentEvents: newKeyEvents.slice(-3).map(e => e.description),
              currentGoals: newState.initialGoals,
            };
            const missionResult = await generateDynamicMissions(missionInput);
            const newMissions: Mission[] = missionResult.generatedMissions.map(genMission => ({
              ...genMission,
              id: `mission-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              isCompleted: false,
            }));
            newState.missions = newMissions;
            newKeyEvents.push(createStructuredEvent(newState.simulationMonth, `EVE has assigned new monthly objectives. Check the Todo List.`, "System", "Neutral"));
            
            newState.keyEvents = [...currentState.keyEvents, ...newKeyEvents.filter(e => !currentState.keyEvents.find(se => se.id === e.id))];


            const monthLabel = `M${newState.simulationMonth}`;
            newState.historicalInvestorSentiment.push({ month: monthLabel, value: newState.investorSentiment, desktop: newState.investorSentiment });
            newState.historicalRevenue.push({ month: monthLabel, revenue: newState.financials.revenue, desktop: newState.financials.revenue });
            newState.historicalUserGrowth.push({ month: monthLabel, users: newState.userMetrics.activeUsers, desktop: newState.userMetrics.activeUsers });
            newState.historicalBurnRate.push({ month: monthLabel, value: currentMonthBurnRate, desktop: currentMonthBurnRate });
            newState.historicalNetProfitLoss.push({ month: monthLabel, value: newState.financials.profit, desktop: newState.financials.profit });
            newState.historicalCAC.push({ month: monthLabel, value: currentMonthCAC, desktop: currentMonthCAC });
            newState.historicalChurnRate.push({ month: monthLabel, value: newState.userMetrics.churnRate * 100, desktop: newState.userMetrics.churnRate * 100 });
            newState.historicalProductProgress.push({ month: monthLabel, value: newState.product.developmentProgress, desktop: newState.product.developmentProgress });

            if (newState.historicalInvestorSentiment.length > 12) newState.historicalInvestorSentiment.shift();
            if (newState.historicalRevenue.length > 12) newState.historicalRevenue.shift();
            if (newState.historicalUserGrowth.length > 12) newState.historicalUserGrowth.shift();
            if (newState.historicalBurnRate.length > 12) newState.historicalBurnRate.shift();
            if (newState.historicalNetProfitLoss.length > 12) newState.historicalNetProfitLoss.shift();
            if (newState.historicalCAC.length > 12) newState.historicalCAC.shift();
            if (newState.historicalChurnRate.length > 12) newState.historicalChurnRate.shift();
            if (newState.historicalProductProgress.length > 12) newState.historicalProductProgress.shift();

            if (aiOutput.expenseBreakdown) {
                const newExpenseBreakdownData: ExpenseBreakdownDataPoint = { month: monthLabel, ...aiOutput.expenseBreakdown };
                newState.historicalExpenseBreakdown.push(newExpenseBreakdownData);
                if (newState.historicalExpenseBreakdown.length > 12) newState.historicalExpenseBreakdown.shift();
            } else {
                console.warn("AI did not provide expense breakdown for month " + newState.simulationMonth + ". This should not happen.");
            }
            
            newState.currentAiReasoning = aiOutput.aiReasoning || "AI completed simulation. Reasoning not explicitly provided.";
            
            // Build and trigger the monthly summary
            const summaryTitle = `Month ${newState.simulationMonth} Debrief`;
            let summaryDescription = `Cash is now **${newState.financials.currencySymbol}${newState.financials.cashOnHand.toLocaleString()}**, and active users are at **${newState.userMetrics.activeUsers.toLocaleString()}**.\nThis month's net profit/loss was **${newState.financials.currencySymbol}${newState.financials.profit.toLocaleString()}**.`;
            
            if (aiOutput.keyEventsGenerated.length > 0) {
              const firstEvent = aiOutput.keyEventsGenerated[0];
              summaryDescription += `\n\nA notable event was: *"${firstEvent.description.substring(0, 100)}${firstEvent.description.length > 100 ? '...' : ''}"*`;
            }
            
            summaryDescription += "\n\nNew objectives have been assigned. Review them on your Dashboard or Todo List.";
            
            if (newState.financials.cashOnHand < newState.financials.burnRate * 2 && newState.financials.burnRate > 0) {
              summaryDescription += "\n\n**Warning:** Our cash reserves are critically low.";
            }

            newState.activeMonthlySummary = {
              title: summaryTitle,
              description: summaryDescription,
            };
            
            set(newState);

            if (Math.random() < 0.75) { 
              get().triggerSurpriseEvent();
            }

        } catch (error) {
          console.error("Error during AI month simulation:", error);
          const targetMonth = get().simulationMonth + 1;
          let userFriendlyMessage = `AI simulation for month ${targetMonth} failed.`;
          let reasoningMessage = `AI simulation for month ${targetMonth} encountered an error.`;

          if (error instanceof Error) {
            const errorMessageLower = error.message.toLowerCase();
            if (errorMessageLower.includes("503") ||
                errorMessageLower.includes("service unavailable") ||
                errorMessageLower.includes("googlegenerativeai error") ||
                errorMessageLower.includes("visibility check was unavailable") ||
                errorMessageLower.includes("resource has been exhausted") ||
                errorMessageLower.includes("model_error") ||
                errorMessageLower.includes("api key not valid")) {
              userFriendlyMessage = `The AI simulation service is temporarily unavailable or experiencing high load (may be Error 503, resource exhaustion, or API key issue). Please try advancing the month again shortly or check configuration.`;
              reasoningMessage = `AI service unavailable. Please try again. Details: ${error.message}`;
            } else {
              userFriendlyMessage += ` Details: ${error.message}`;
              reasoningMessage += ` Details: ${error.message}`;
            }
          } else {
            userFriendlyMessage += ` An unknown error occurred.`;
            reasoningMessage += ` An unknown error occurred.`;
          }

          set(state => ({
            ...state,
            keyEvents: [...state.keyEvents, createStructuredEvent(targetMonth, userFriendlyMessage, "System", "Negative")],
            currentAiReasoning: reasoningMessage
          }));
        }
      },

      resetSimulation: () => {
        set(state => ({
            ...getInitialState(),
            keyEvents: [createStructuredEvent(0, "Simulation reset. Please initialize a new venture.", "System", "Neutral")],
            currentAiReasoning: "Simulation reset. AI log cleared.",
            sandboxState: null,
            isSandboxing: false,
            sandboxRelativeMonth: 0,
            savedSimulations: [], 
            earnedBadges: [], 
            activeScenarios: [],
        }));
      },

      startSandboxExperiment: () => set(state => {
        if (!state.isInitialized) return state;
        const activeSimState = extractActiveSimState(state);
        const sandboxCopy = JSON.parse(JSON.stringify(activeSimState)) as DigitalTwinState;
        
        sandboxCopy.historicalInvestorSentiment = [];
        sandboxCopy.historicalRevenue = [];
        sandboxCopy.historicalUserGrowth = [];
        sandboxCopy.historicalBurnRate = [];
        sandboxCopy.historicalNetProfitLoss = [];
        sandboxCopy.historicalExpenseBreakdown = [];
        sandboxCopy.historicalCAC = [];
        sandboxCopy.historicalChurnRate = [];
        sandboxCopy.historicalProductProgress = [];
        sandboxCopy.keyEvents = [createStructuredEvent(state.simulationMonth, `Sandbox started from main sim month ${state.simulationMonth}. Initial state copied.`, "System", "Neutral")];
        sandboxCopy.rewards = []; 
        sandboxCopy.earnedBadges = []; 
        sandboxCopy.missions = []; 
        sandboxCopy.simulationMonth = state.simulationMonth; 
        sandboxCopy.activeScenarios = [];
        
        return {
          ...state,
          sandboxState: sandboxCopy,
          isSandboxing: true,
          sandboxRelativeMonth: 0, 
          currentAiReasoning: (state.currentAiReasoning || "") + `\nSandbox experiment started. Copied state from main simulation month ${state.simulationMonth}.`,
        };
      }),

      setSandboxMarketingSpend: (amount: number) => set(state => {
        if (!state.isSandboxing || !state.sandboxState || amount < 0) return state;
        return {
          ...state,
          sandboxState: {
            ...state.sandboxState,
            resources: { ...state.sandboxState.resources, marketingSpend: amount },
          },
        };
      }),
      setSandboxRndSpend: (amount: number) => set(state => {
        if (!state.isSandboxing || !state.sandboxState || amount < 0) return state;
        return {
          ...state,
          sandboxState: {
            ...state.sandboxState,
            resources: { ...state.sandboxState.resources, rndSpend: amount },
          },
        };
      }),
      setSandboxPricePerUser: (price: number) => set(state => {
        if (!state.isSandboxing || !state.sandboxState || price < 0) return state;
        return {
          ...state,
          sandboxState: {
            ...state.sandboxState,
            product: { ...state.sandboxState.product, pricePerUser: price },
          },
        };
      }),
      adjustSandboxTeamMemberCount: (roleToAdjust: string, change: number, salaryPerMember?: number) => set(state => {
        if (!state.isSandboxing || !state.sandboxState) return state;
        const team = state.sandboxState.resources.team.map(member => ({ ...member }));
        const roleIndex = team.findIndex(member => member.role === roleToAdjust);

        if (roleIndex > -1) {
          const newCount = Math.max(0, team[roleIndex].count + change);
          if (team[roleIndex].role.toLowerCase() === 'founder' && newCount === 0 && change < 0) return {...state};
          team[roleIndex] = { ...team[roleIndex], count: newCount };
          if (newCount === 0 && team[roleIndex].role.toLowerCase() !== 'founder') team.splice(roleIndex, 1);
        } else if (change > 0) {
          team.push({ role: roleToAdjust, count: change, salary: salaryPerMember || (roleToAdjust.toLowerCase() === 'founder' ? MOCK_SALARY_PER_FOUNDER : DEFAULT_ENGINEER_SALARY) });
        }
        return {
          ...state,
          sandboxState: {
            ...state.sandboxState,
            resources: { ...state.sandboxState.resources, team },
          },
        };
      }),

      simulateMonthInSandbox: async () => {
        const currentFullState = get();
        if (!currentFullState.isSandboxing || !currentFullState.sandboxState || currentFullState.sandboxState.financials.cashOnHand <= 0) {
          set(state => ({ 
            ...state, 
            currentAiReasoning: (state.currentAiReasoning || "") + (state.sandboxState ? (state.sandboxState.currentAiReasoning || "") + "\nCannot simulate sandbox month: Sandbox not active or out of cash." : "Cannot simulate sandbox month.")
          }));
          return;
        }

        set(state => ({
          ...state,
          sandboxState: state.sandboxState ? {
            ...state.sandboxState,
            currentAiReasoning: `Hive Mind is simulating sandbox month ${currentFullState.sandboxRelativeMonth + 1}...`,
          } : null,
        }));
        
        const sandbox = currentFullState.sandboxState;

        let sandboxProductStageForAI = sandbox.product.stage;
        const validStages: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
         if (!validStages.includes(sandboxProductStageForAI)) {
            if (String(sandboxProductStageForAI).toLowerCase() === 'concept') {
                sandboxProductStageForAI = 'idea';
            } else {
                sandboxProductStageForAI = 'idea';
            }
        }

        const simulateMonthInput: SimulateMonthInput = {
          currentSimulationMonth: currentFullState.sandboxRelativeMonth, 
          companyName: sandbox.companyName,
          financials: {
            cashOnHand: sandbox.financials.cashOnHand,
            currentRevenue: sandbox.financials.revenue,
            currentExpenses: sandbox.financials.expenses,
            currencyCode: sandbox.financials.currencyCode,
            currencySymbol: sandbox.financials.currencySymbol,
          },
          userMetrics: {
            activeUsers: sandbox.userMetrics.activeUsers,
            churnRate: sandbox.userMetrics.churnRate,
          },
          product: {
            stage: sandboxProductStageForAI,
            developmentProgress: sandbox.product.developmentProgress,
            pricePerUser: sandbox.product.pricePerUser,
          },
          resources: {
            marketingSpend: sandbox.resources.marketingSpend,
            rndSpend: sandbox.resources.rndSpend,
            team: sandbox.resources.team,
          },
          market: {
            competitionLevel: sandbox.market.competitionLevel,
            targetMarketDescription: sandbox.market.targetMarketDescription,
          },
          currentStartupScore: sandbox.startupScore,
          currentInvestorSentiment: sandbox.investorSentiment,
          activeScenarios: sandbox.activeScenarios,
        };

        try {
          const aiOutput: SimulateMonthOutput = await simulateMonthFlow(simulateMonthInput);

          set(state => {
            if (!state.isSandboxing || !state.sandboxState) return state;
            const newSandboxState: DigitalTwinState = JSON.parse(JSON.stringify(state.sandboxState));
            const newSandboxKeyEvents: StructuredKeyEvent[] = [];

            const simulatedSandboxDisplayMonth = state.sandboxRelativeMonth + 1;

            newSandboxState.financials.revenue = aiOutput.calculatedRevenue;
            newSandboxState.financials.expenses = aiOutput.calculatedExpenses;
            newSandboxState.financials.profit = newSandboxState.financials.revenue - newSandboxState.financials.expenses;
            newSandboxState.financials.cashOnHand = state.sandboxState.financials.cashOnHand + newSandboxState.financials.profit;
            const currentMonthBurnRate = Math.max(0, newSandboxState.financials.expenses - newSandboxState.financials.revenue);
            newSandboxState.financials.burnRate = currentMonthBurnRate;

            newSandboxState.userMetrics.activeUsers = aiOutput.updatedActiveUsers;
            newSandboxState.userMetrics.newUserAcquisitionRate = aiOutput.newUserAcquisition;
            newSandboxState.userMetrics.monthlyRecurringRevenue = aiOutput.updatedActiveUsers * newSandboxState.product.pricePerUser;

            newSandboxState.product.developmentProgress = state.sandboxState.product.developmentProgress + aiOutput.productDevelopmentDelta;
            if (aiOutput.newProductStage && aiOutput.newProductStage !== newSandboxState.product.stage) {
              newSandboxState.product.stage = aiOutput.newProductStage;
              newSandboxState.product.developmentProgress = 0;
              newSandboxKeyEvents.push(createStructuredEvent(simulatedSandboxDisplayMonth, `(Sandbox) Product advanced to ${newSandboxState.product.stage} stage!`, "Product", "Positive"));
            } else if (newSandboxState.product.developmentProgress >= 100 && newSandboxState.product.stage !== 'mature') {
                 const stagesList: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
                const currentStageIndex = stagesList.indexOf(newSandboxState.product.stage);
                if (currentStageIndex < stagesList.length - 1) {
                  newSandboxState.product.stage = stagesList[currentStageIndex + 1];
                  newSandboxState.product.developmentProgress %= 100;
                  newSandboxKeyEvents.push(createStructuredEvent(simulatedSandboxDisplayMonth, `(Sandbox) Product advanced to ${newSandboxState.product.stage} stage!`, "Product", "Positive"));
                } else {
                    newSandboxState.product.stage = 'mature';
                    newSandboxState.product.developmentProgress = 100;
                    newSandboxKeyEvents.push(createStructuredEvent(simulatedSandboxDisplayMonth, `(Sandbox) Product reached maturity!`, "Product", "Positive"));
                }
            }
             newSandboxState.product.developmentProgress = Math.min(100, Math.max(0,newSandboxState.product.developmentProgress));


            aiOutput.keyEventsGenerated.forEach(event => newSandboxKeyEvents.push(createStructuredEvent(simulatedSandboxDisplayMonth, `(Sandbox) ${event.description}`, event.category, event.impact)));
            newSandboxKeyEvents.push(createStructuredEvent(simulatedSandboxDisplayMonth, `(Sandbox M${simulatedSandboxDisplayMonth} Sim): Revenue ${newSandboxState.financials.currencySymbol}${newSandboxState.financials.revenue.toLocaleString()}, Users ${newSandboxState.userMetrics.activeUsers.toLocaleString()}, Cash ${newSandboxState.financials.currencySymbol}${newSandboxState.financials.cashOnHand.toLocaleString()}`, "System", "Neutral"));
            
            newSandboxState.startupScore = Math.max(0, Math.min(100, newSandboxState.startupScore + aiOutput.startupScoreAdjustment));
            newSandboxState.investorSentiment = Math.max(0, Math.min(100, newSandboxState.investorSentiment + aiOutput.investorSentimentAdjustment));
             if (newSandboxState.financials.cashOnHand <= 0 && state.sandboxState.financials.cashOnHand > 0) {
                newSandboxKeyEvents.push(createStructuredEvent(simulatedSandboxDisplayMonth, `(Sandbox) Critical: Ran out of cash!`, "Financial", "Negative"));
            }
            
            newSandboxState.keyEvents = [...state.sandboxState.keyEvents, ...newSandboxKeyEvents];

            const sandboxMonthLabel = `SB M${simulatedSandboxDisplayMonth}`;
            newSandboxState.historicalInvestorSentiment.push({ month: sandboxMonthLabel, value: newSandboxState.investorSentiment, desktop: newSandboxState.investorSentiment });
            newSandboxState.historicalRevenue.push({ month: sandboxMonthLabel, revenue: newSandboxState.financials.revenue, desktop: newSandboxState.financials.revenue });
            newSandboxState.historicalUserGrowth.push({ month: sandboxMonthLabel, users: newSandboxState.userMetrics.activeUsers, desktop: newSandboxState.userMetrics.activeUsers });
             if (newSandboxState.historicalInvestorSentiment.length > 6) newSandboxState.historicalInvestorSentiment.shift(); 
             if (newSandboxState.historicalRevenue.length > 6) newSandboxState.historicalRevenue.shift(); 
             if (newSandboxState.historicalUserGrowth.length > 6) newSandboxState.historicalUserGrowth.shift();


            newSandboxState.currentAiReasoning = aiOutput.aiReasoning || `AI completed sandbox month ${simulatedSandboxDisplayMonth}. Reasoning not provided.`;
            
            return { 
                ...state,
                sandboxState: newSandboxState, 
                sandboxRelativeMonth: simulatedSandboxDisplayMonth, 
                currentAiReasoning: (state.currentAiReasoning || "") + `\n[Sandbox M${simulatedSandboxDisplayMonth} Log]: ${newSandboxState.currentAiReasoning}` 
            };
          });
        } catch (error) {
            console.error("Error during AI sandbox month simulation:", error);
             let userFriendlyMessage = `AI simulation for sandbox month failed.`;
             if (error instanceof Error) userFriendlyMessage += ` Details: ${error.message}`;
            set(state => ({
                ...state,
                sandboxState: state.sandboxState ? {
                    ...state.sandboxState,
                    keyEvents: [...state.sandboxState.keyEvents, createStructuredEvent(state.sandboxRelativeMonth +1, userFriendlyMessage, "System", "Negative")],
                    currentAiReasoning: `Error in sandbox simulation: ${error instanceof Error ? error.message : "Unknown error"}`,
                } : null,
                 currentAiReasoning: (state.currentAiReasoning || "") + `\n[Sandbox Error]: ${error instanceof Error ? error.message : "Unknown error"}`
            }));
        }
      },

      discardSandboxExperiment: () => set(state => ({
        ...state,
        sandboxState: null,
        isSandboxing: false,
        sandboxRelativeMonth: 0,
        currentAiReasoning: (state.currentAiReasoning || "") + "\nSandbox experiment discarded.",
        keyEvents: [...state.keyEvents, createStructuredEvent(state.simulationMonth, "Sandbox experiment discarded.", "System", "Neutral")]
      })),
      
      applySandboxDecisionsToMain: () => set(state => {
        if (!state.isSandboxing || !state.sandboxState) {
          console.warn("Cannot apply sandbox: No active sandbox experiment.");
          return {
            ...state,
            currentAiReasoning: (state.currentAiReasoning || "") + "\nAttempted to apply sandbox decisions, but no active sandbox experiment found.",
          };
        }
      
        const updatedMainState: DigitalTwinState = JSON.parse(JSON.stringify(extractActiveSimState(state)));
        const sandboxDecisionState = state.sandboxState;
      
        updatedMainState.resources.marketingSpend = sandboxDecisionState.resources.marketingSpend;
        updatedMainState.resources.rndSpend = sandboxDecisionState.resources.rndSpend;
        updatedMainState.product.pricePerUser = sandboxDecisionState.product.pricePerUser;
        updatedMainState.resources.team = JSON.parse(JSON.stringify(sandboxDecisionState.resources.team)); 
      
        updatedMainState.product.stage = sandboxDecisionState.product.stage;
        updatedMainState.product.developmentProgress = sandboxDecisionState.product.developmentProgress;
        updatedMainState.product.name = sandboxDecisionState.product.name;
        updatedMainState.product.features = JSON.parse(JSON.stringify(sandboxDecisionState.product.features));
      
        updatedMainState.keyEvents = [
          ...state.keyEvents, 
          createStructuredEvent(state.simulationMonth, `Decisions and product state from a sandbox experiment (which ran for ${state.sandboxRelativeMonth} month(s)) applied to the main simulation.`, "System", "Positive")
        ];
      
        updatedMainState.currentAiReasoning = (state.currentAiReasoning || "") + 
          `\n[Main Sim Update]: Adopted decisions (marketing, R&D, price, team, product dev) from the recent sandbox experiment. The main simulation will now proceed with these settings.`;
      
        return {
          ...state, 
          simulationMonth: updatedMainState.simulationMonth,
          companyName: updatedMainState.companyName,
          financials: updatedMainState.financials,
          userMetrics: updatedMainState.userMetrics,
          product: updatedMainState.product,
          resources: updatedMainState.resources,
          market: updatedMainState.market,
          startupScore: updatedMainState.startupScore,
          investorSentiment: updatedMainState.investorSentiment,
          selectedArchetype: updatedMainState.selectedArchetype,
          keyEvents: updatedMainState.keyEvents,
          rewards: updatedMainState.rewards,
          earnedBadges: updatedMainState.earnedBadges, 
          initialGoals: updatedMainState.initialGoals,
          missions: updatedMainState.missions,
          suggestedChallenges: updatedMainState.suggestedChallenges,
          isInitialized: updatedMainState.isInitialized,
          currentAiReasoning: updatedMainState.currentAiReasoning,
          historicalInvestorSentiment: updatedMainState.historicalInvestorSentiment,
          historicalRevenue: updatedMainState.historicalRevenue,
          historicalUserGrowth: updatedMainState.historicalUserGrowth,
          historicalBurnRate: updatedMainState.historicalBurnRate,
          historicalNetProfitLoss: updatedMainState.historicalNetProfitLoss,
          historicalExpenseBreakdown: updatedMainState.historicalExpenseBreakdown,
          historicalCAC: updatedMainState.historicalCAC,
          historicalChurnRate: updatedMainState.historicalChurnRate,
          historicalProductProgress: updatedMainState.historicalProductProgress,
          isSandboxing: false,
          sandboxState: null,
          sandboxRelativeMonth: 0,
        };
      }),
      

      saveCurrentSimulation: (name: string) => {
        const currentFullState = get();
        if (!currentFullState.isInitialized) {
          console.warn("Cannot save: Simulation not initialized.");
          return null;
        }
        const stateToSave = JSON.parse(JSON.stringify(extractActiveSimState(currentFullState)));
        stateToSave.sandboxState = null;
        stateToSave.isSandboxing = false;
        stateToSave.sandboxRelativeMonth = 0;

        const newSnapshot: SimulationSnapshot = {
          id: `snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: name || `Snapshot ${new Date().toLocaleString()}`,
          createdAt: new Date().toISOString(),
          simulationState: stateToSave,
        };
        set(state => ({
          ...state,
          savedSimulations: [...state.savedSimulations, newSnapshot],
        }));
        return stateToSave; 
      },

      loadSimulation: (snapshotId: string) => {
        const currentFullState = get();
        const snapshotToLoad = currentFullState.savedSimulations.find(s => s.id === snapshotId);
      
        if (!snapshotToLoad) {
          console.warn(`Snapshot with ID ${snapshotId} not found.`);
          return null;
        }
      
        const loadedSimState = JSON.parse(JSON.stringify(snapshotToLoad.simulationState));
        
        const newStateFromSnapshot = {
          ...loadedSimState,
          sandboxState: null,
          isSandboxing: false,
          sandboxRelativeMonth: 0,
          savedSimulations: currentFullState.savedSimulations, 
          keyEvents: [...loadedSimState.keyEvents, createStructuredEvent(loadedSimState.simulationMonth, `Simulation loaded from snapshot: ${snapshotToLoad.name}`, "System", "Positive")],
          currentAiReasoning: `Simulation state loaded from snapshot: "${snapshotToLoad.name}". Main simulation month is now ${loadedSimState.simulationMonth}.`,
          missions: Array.isArray(loadedSimState.missions) && loadedSimState.missions.length > 0 ? loadedSimState.missions : [...onboardingMissions],
          earnedBadges: Array.isArray(loadedSimState.earnedBadges) ? loadedSimState.earnedBadges : [], 
          selectedArchetype: loadedSimState.selectedArchetype || undefined,
          activeScenarios: loadedSimState.activeScenarios || [],
        };
        
        set(newStateFromSnapshot);
        return loadedSimState; 
      },

      deleteSavedSimulation: (snapshotId: string) => {
        set(state => ({
          ...state,
          savedSimulations: state.savedSimulations.filter(s => s.id !== snapshotId),
        }));
      },

      triggerSurpriseEvent: () => set(state => {
        if (state.activeSurpriseEvent || state.activeMonthlySummary) return state;

        const historicEventIds = new Set(state.surpriseEventHistory.map(h => h.eventId));
        const availableEvents = predefinedSurpriseEvents.filter(event => !historicEventIds.has(event.id));

        if (availableEvents.length === 0) {
          console.log("No new surprise events available to trigger.");
          return state;
        }

        const eventIndex = Math.floor(Math.random() * availableEvents.length);
        const selectedEvent = {
            ...availableEvents[eventIndex],
            monthTriggered: state.simulationMonth,
        };

        return {
            ...state,
            activeSurpriseEvent: selectedEvent,
            keyEvents: [...state.keyEvents, createStructuredEvent(state.simulationMonth, `Surprise Event: ${selectedEvent.title}`, 'General', 'Neutral')]
        };
      }),

      resolveSurpriseEvent: (outcome: 'accepted' | 'rejected') => set(state => {
        const { activeSurpriseEvent } = state;
        if (!activeSurpriseEvent) return state;

        const historyItem: SurpriseEventHistoryItem = {
            eventId: activeSurpriseEvent.id,
            eventType: activeSurpriseEvent.type,
            monthOccurred: activeSurpriseEvent.monthTriggered,
            outcome: outcome,
            timestamp: new Date().toISOString(),
        };

        const effectsToApply = activeSurpriseEvent.effects?.[outcome];
        let updatedFinancials = { ...state.financials };
        let updatedStartupScore = state.startupScore;
        let eventResolutionLog = `Resolved '${activeSurpriseEvent.title}' by choosing to '${outcome}'.`;
        const effectSummaries: string[] = [];

        if (effectsToApply) {
          if (typeof effectsToApply.cashOnHand === 'number') {
            updatedFinancials.cashOnHand += effectsToApply.cashOnHand;
            effectSummaries.push(`Cash changed by ${updatedFinancials.currencySymbol}${effectsToApply.cashOnHand.toLocaleString()}.`);
          }
          if (typeof effectsToApply.startupScore === 'number') {
            updatedStartupScore += effectsToApply.startupScore;
            effectSummaries.push(`Startup score changed by ${effectsToApply.startupScore}.`);
          }
          if (effectsToApply.productDevelopmentModifier) {
             effectSummaries.push(`Product development modifier of ${effectsToApply.productDevelopmentModifier} applied (conceptual effect).`);
          }
        }
        
        if (effectSummaries.length > 0) {
          eventResolutionLog += ` Effects: ${effectSummaries.join(' ')}`;
        }

        const impactForLog = outcome === 'accepted' ? (activeSurpriseEvent.effects?.accept.startupScore ?? 0) >= 0 ? 'Positive' : 'Negative' : (activeSurpriseEvent.effects?.reject.startupScore ?? 0) >= 0 ? 'Neutral' : 'Negative';

        return {
            ...state,
            financials: updatedFinancials,
            startupScore: Math.max(0, Math.min(100, updatedStartupScore)),
            activeSurpriseEvent: null,
            surpriseEventHistory: [...state.surpriseEventHistory, historyItem],
            keyEvents: [...state.keyEvents, createStructuredEvent(state.simulationMonth, eventResolutionLog, 'General', impactForLog)]
        };
      }),
      
      addScenario: (scenario) => set((state) => {
        if (!state.activeScenarios.includes(scenario)) {
          return { activeScenarios: [...state.activeScenarios, scenario] };
        }
        return state;
      }),

      removeScenario: (scenario) => set((state) => ({
        activeScenarios: state.activeScenarios.filter(s => s !== scenario),
      })),

      acknowledgeMonthlySummary: () => set({ activeMonthlySummary: null }),

    }),
    {
      name: 'inceptico-simulation-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedStateUnknown, currentState) => {
        const persistedState = persistedStateUnknown as DigitalTwinState & { savedSimulations: SimulationSnapshot[] };
        let mergedState = { ...currentState, ...persistedState };

        const defaultStateArrays = getInitialState();

        mergedState.initialGoals = Array.isArray(mergedState.initialGoals) ? mergedState.initialGoals : defaultStateArrays.initialGoals;
        mergedState.suggestedChallenges = Array.isArray(mergedState.suggestedChallenges) ? mergedState.suggestedChallenges : defaultStateArrays.suggestedChallenges;
        mergedState.historicalInvestorSentiment = Array.isArray(mergedState.historicalInvestorSentiment) ? mergedState.historicalInvestorSentiment : defaultStateArrays.historicalInvestorSentiment;
        mergedState.historicalRevenue = Array.isArray(mergedState.historicalRevenue) ? mergedState.historicalRevenue : defaultStateArrays.historicalRevenue;
        mergedState.historicalUserGrowth = Array.isArray(mergedState.historicalUserGrowth) ? mergedState.historicalUserGrowth : defaultStateArrays.historicalUserGrowth;
        mergedState.historicalBurnRate = Array.isArray(mergedState.historicalBurnRate) ? mergedState.historicalBurnRate : defaultStateArrays.historicalBurnRate;
        mergedState.historicalNetProfitLoss = Array.isArray(mergedState.historicalNetProfitLoss) ? mergedState.historicalNetProfitLoss : defaultStateArrays.historicalNetProfitLoss;
        mergedState.historicalExpenseBreakdown = Array.isArray(mergedState.historicalExpenseBreakdown) ? mergedState.historicalExpenseBreakdown : defaultStateArrays.historicalExpenseBreakdown;
        mergedState.historicalCAC = Array.isArray(mergedState.historicalCAC) ? mergedState.historicalCAC : defaultStateArrays.historicalCAC;
        mergedState.historicalChurnRate = Array.isArray(mergedState.historicalChurnRate) ? mergedState.historicalChurnRate : defaultStateArrays.historicalChurnRate;
        mergedState.historicalProductProgress = Array.isArray(mergedState.historicalProductProgress) ? mergedState.historicalProductProgress : defaultStateArrays.historicalProductProgress;
        
        mergedState.keyEvents = Array.isArray(mergedState.keyEvents) 
        ? mergedState.keyEvents.map(event => 
            typeof event === 'string' 
            ? createStructuredEvent(mergedState.simulationMonth || 0, event, "General", "Neutral") 
            : event
          ) 
        : defaultStateArrays.keyEvents;


        mergedState.rewards = Array.isArray(mergedState.rewards) ? mergedState.rewards : defaultStateArrays.rewards;
        mergedState.earnedBadges = Array.isArray(mergedState.earnedBadges) ? mergedState.earnedBadges : []; 
        mergedState.savedSimulations = Array.isArray(mergedState.savedSimulations) ? mergedState.savedSimulations : defaultStateArrays.savedSimulations;
        
        mergedState.missions = Array.isArray(mergedState.missions) && mergedState.missions.length > 0 
                                ? mergedState.missions 
                                : [...onboardingMissions];
        
        mergedState.selectedArchetype = mergedState.selectedArchetype || undefined;


        if (!mergedState.financials || !mergedState.financials.currencyCode) {
            mergedState.financials = {
                ...initialBaseState.financials,
                ...(mergedState.financials || {}), 
                currencyCode: (mergedState.financials?.currencyCode || initialBaseState.financials.currencyCode),
                currencySymbol: getCurrencySymbol(mergedState.financials?.currencyCode || initialBaseState.financials.currencyCode),
            };
        } else if (!mergedState.financials.currencySymbol) { 
             mergedState.financials.currencySymbol = getCurrencySymbol(mergedState.financials.currencyCode);
        }

        if (!mergedState.product || typeof mergedState.product.pricePerUser !== 'number') {
            mergedState.product = {
                ...initialBaseState.product,
                ...(mergedState.product || {}),
                pricePerUser: (mergedState.product && typeof mergedState.product.pricePerUser === 'number') ? mergedState.product.pricePerUser : initialBaseState.product.pricePerUser,
            };
        }

        if (mergedState.product) {
            const validStages: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
            let currentStage = mergedState.product.stage;
            if (!validStages.includes(currentStage)) {
                if (String(currentStage).toLowerCase() === 'concept') { 
                    currentStage = 'idea';
                } else {
                    console.warn(`Invalid product stage "${currentStage}" during merge. Defaulting to "idea".`);
                    currentStage = 'idea';
                }
            }
            mergedState.product.stage = currentStage;
             mergedState.product.features = Array.isArray(mergedState.product.features) ? mergedState.product.features : defaultStateArrays.product.features;
        } else {
             mergedState.product = { ...initialBaseState.product }; 
        }

        mergedState.resources = {
            ...initialBaseState.resources,
            ...(mergedState.resources || {}),
            team: Array.isArray(mergedState.resources?.team) ? mergedState.resources.team : defaultStateArrays.resources.team,
        };


        if (typeof mergedState.currentAiReasoning === 'undefined') {
          mergedState.currentAiReasoning = defaultStateArrays.currentAiReasoning;
        }
        
        if (typeof mergedState.isSandboxing === 'undefined') {
            mergedState.isSandboxing = defaultStateArrays.isSandboxing;
        }
        if (typeof mergedState.sandboxState === 'undefined') { 
            mergedState.sandboxState = defaultStateArrays.sandboxState;
        }
         if (typeof mergedState.sandboxRelativeMonth === 'undefined') {
            mergedState.sandboxRelativeMonth = defaultStateArrays.sandboxRelativeMonth;
        }
        
        if (mergedState.sandboxState) { 
           mergedState.sandboxState.keyEvents = Array.isArray(mergedState.sandboxState.keyEvents) 
            ? mergedState.sandboxState.keyEvents.map(event => 
                typeof event === 'string' 
                ? createStructuredEvent(mergedState.sandboxState?.simulationMonth || 0, event, "General", "Neutral") 
                : event
              )
            : [];
            mergedState.sandboxState.historicalRevenue = Array.isArray(mergedState.sandboxState.historicalRevenue) ? mergedState.sandboxState.historicalRevenue : [];
            mergedState.sandboxState.historicalUserGrowth = Array.isArray(mergedState.sandboxState.historicalUserGrowth) ? mergedState.sandboxState.historicalUserGrowth : [];
            mergedState.sandboxState.historicalCAC = Array.isArray(mergedState.sandboxState.historicalCAC) ? mergedState.sandboxState.historicalCAC : [];
            mergedState.sandboxState.historicalChurnRate = Array.isArray(mergedState.sandboxState.historicalChurnRate) ? mergedState.sandboxState.historicalChurnRate : [];
            mergedState.sandboxState.historicalProductProgress = Array.isArray(mergedState.sandboxState.historicalProductProgress) ? mergedState.sandboxState.historicalProductProgress : [];
            mergedState.sandboxState.historicalInvestorSentiment = Array.isArray(mergedState.sandboxState.historicalInvestorSentiment) ? mergedState.sandboxState.historicalInvestorSentiment : [];
            mergedState.sandboxState.earnedBadges = Array.isArray(mergedState.sandboxState.earnedBadges) ? mergedState.sandboxState.earnedBadges : []; 
        }

        // Merge surprise event data
        mergedState.activeSurpriseEvent = mergedState.activeSurpriseEvent || null;
        mergedState.surpriseEventHistory = Array.isArray(mergedState.surpriseEventHistory) ? mergedState.surpriseEventHistory : [];
        mergedState.activeScenarios = Array.isArray(mergedState.activeScenarios) ? mergedState.activeScenarios : [];
        mergedState.activeMonthlySummary = mergedState.activeMonthlySummary || null;

        return mergedState as DigitalTwinState & { savedSimulations: SimulationSnapshot[] };
      },
    }
  )
);
