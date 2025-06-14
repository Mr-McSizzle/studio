
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DigitalTwinState, Reward, AIInitialConditions, RevenueDataPoint, UserDataPoint, SimulateMonthInput, SimulateMonthOutput, HistoricalDataPoint, ExpenseBreakdownDataPoint, TeamMember, ExpenseBreakdown, SimulationSnapshot } from '@/types/simulation';
import type { PromptStartupOutput } from '@/ai/flows/prompt-startup';
import { simulateMonth as simulateMonthFlow } from '@/ai/flows/simulate-month-flow';

const MOCK_PRICE_PER_USER_PER_MONTH_DEFAULT = 10;
const MOCK_SALARY_PER_FOUNDER = 0;
const MOCK_SALARY_PER_EMPLOYEE = 4000;
const MOCK_OTHER_OPERATIONAL_COSTS_FALLBACK = 1500; // Fallback only
const DEFAULT_ENGINEER_SALARY = 5000;
const DEFAULT_MARKETING_SPEND = 500;
const DEFAULT_RND_SPEND = 500;


const getCurrencySymbol = (code?: string): string => {
  if (!code) return "$";
  const map: Record<string, string> = { USD: "$", EUR: "€", JPY: "¥", GBP: "£", CAD: "C$", AUD: "A$" };
  return map[code.toUpperCase()] || code;
};

const initialBaseState: Omit<DigitalTwinState, 'rewards' | 'keyEvents' | 'historicalRevenue' | 'historicalUserGrowth' | 'suggestedChallenges' | 'historicalBurnRate' | 'historicalNetProfitLoss' | 'historicalExpenseBreakdown' | 'currentAiReasoning' | 'sandboxState' | 'isSandboxing' | 'sandboxRelativeMonth'> = {
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
  isInitialized: false,
  initialGoals: [],
};


const getInitialState = (): DigitalTwinState & { savedSimulations: SimulationSnapshot[] } => ({
  ...initialBaseState,
  keyEvents: ["Simulation not yet initialized. Set up your venture to begin!"],
  rewards: [],
  suggestedChallenges: [],
  historicalRevenue: [],
  historicalUserGrowth: [],
  historicalBurnRate: [],
  historicalNetProfitLoss: [],
  historicalExpenseBreakdown: [],
  currentAiReasoning: "AI log awaiting initialization.",
  sandboxState: null,
  isSandboxing: false,
  sandboxRelativeMonth: 0,
  savedSimulations: [],
});

interface SimulationActions {
  initializeSimulation: (aiOutput: PromptStartupOutput, userStartupName: string, userTargetMarket: string, userBudget: string, userCurrencyCode: string) => void;
  advanceMonth: () => Promise<void>;
  resetSimulation: () => void;
  setMarketingSpend: (amount: number) => void;
  setRndSpend: (amount: number) => void;
  setPricePerUser: (price: number) => void;
  adjustTeamMemberCount: (roleToAdjust: string, change: number, salaryPerMember?: number) => void;
  // Sandbox actions
  startSandboxExperiment: () => void;
  setSandboxMarketingSpend: (amount: number) => void;
  setSandboxRndSpend: (amount: number) => void;
  setSandboxPricePerUser: (price: number) => void;
  adjustSandboxTeamMemberCount: (roleToAdjust: string, change: number, salaryPerMember?: number) => void;
  simulateMonthInSandbox: () => Promise<void>;
  discardSandboxExperiment: () => void;
  applySandboxDecisionsToMain: () => void; // New action
  // Snapshot actions
  saveCurrentSimulation: (name: string) => DigitalTwinState | null;
  loadSimulation: (snapshotId: string) => DigitalTwinState | null;
  deleteSavedSimulation: (snapshotId: string) => void;
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
  // Helper to get all fields of DigitalTwinState from the full store state
  // Explicitly list all properties of DigitalTwinState to ensure we get a clean object
  // without 'savedSimulations' or actions.
  return {
    simulationMonth: state.simulationMonth,
    companyName: state.companyName,
    financials: state.financials,
    userMetrics: state.userMetrics,
    product: state.product,
    resources: state.resources,
    market: state.market,
    startupScore: state.startupScore,
    keyEvents: state.keyEvents,
    rewards: state.rewards,
    initialGoals: state.initialGoals,
    missions: state.missions,
    suggestedChallenges: state.suggestedChallenges,
    isInitialized: state.isInitialized,
    currentAiReasoning: state.currentAiReasoning,
    historicalRevenue: state.historicalRevenue,
    historicalUserGrowth: state.historicalUserGrowth,
    historicalBurnRate: state.historicalBurnRate,
    historicalNetProfitLoss: state.historicalNetProfitLoss,
    historicalExpenseBreakdown: state.historicalExpenseBreakdown,
    sandboxState: state.sandboxState, // This will be null when saving main, or current sandbox if copying
    isSandboxing: state.isSandboxing,
    sandboxRelativeMonth: state.sandboxRelativeMonth,
  };
};


export const useSimulationStore = create<DigitalTwinState & { savedSimulations: SimulationSnapshot[] } & SimulationActions>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      initializeSimulation: (aiOutput, userStartupName, userTargetMarket, userBudget, userCurrencyCode) => {
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
            keyEvents: [...state.keyEvents, errorMessage],
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
          ...initialBaseState,
          companyName: parsedConditions.companyName || userStartupName || "AI Suggested Venture",
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
          keyEvents: [`Simulation initialized for ${parsedConditions.companyName || userStartupName} with budget ${finalCurrencySymbol}${initialBudgetNum.toLocaleString()}. Target: ${userTargetMarket || 'Not specified'}. Initial Burn: ${finalCurrencySymbol}${finalInitialBurnRate.toLocaleString()}/month.`],
          rewards: [],
          historicalRevenue: [{ month: "M0", revenue: 0, desktop: 0 }],
          historicalUserGrowth: [{ month: "M0", users: 0, desktop: 0 }],
          historicalBurnRate: [{ month: "M0", value: finalInitialBurnRate, desktop: finalInitialBurnRate }],
          historicalNetProfitLoss: [{ month: "M0", value: (0 - finalInitialExpenses), desktop: (0 - finalInitialExpenses) }],
          historicalExpenseBreakdown: [{ month: "M0", ...initialExpenseBreakdownM0 }],
          isInitialized: true,
          simulationMonth: 0,
          startupScore: 10,
          currentAiReasoning: "Digital twin initialized. Ready for first simulation month.",
          sandboxState: null,
          isSandboxing: false,
          sandboxRelativeMonth: 0,
          savedSimulations: state.savedSimulations, // Preserve existing snapshots
        }));
      },

      setMarketingSpend: (amount: number) => set(state => {
        if (!state.isInitialized || amount < 0) return state;
        return { resources: { ...state.resources, marketingSpend: amount } };
      }),

      setRndSpend: (amount: number) => set(state => {
        if (!state.isInitialized || amount < 0) return state;
        return { resources: { ...state.resources, rndSpend: amount } };
      }),

      setPricePerUser: (price: number) => set(state => {
        if (!state.isInitialized || price < 0) return state;
        return { product: { ...state.product, pricePerUser: price } };
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
        return { resources: { ...state.resources, team } };
      }),

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
        };

        try {
          const aiOutput: SimulateMonthOutput = await simulateMonthFlow(simulateMonthInput);

          set(state => {
            // Create a mutable copy of the current active simulation state
            let newState: DigitalTwinState = JSON.parse(JSON.stringify(extractActiveSimState(state))); 

            newState.simulationMonth = aiOutput.simulatedMonthNumber;
            newState.financials.revenue = aiOutput.calculatedRevenue;
            newState.financials.expenses = aiOutput.calculatedExpenses;
            newState.financials.profit = newState.financials.revenue - newState.financials.expenses;
            newState.financials.cashOnHand = state.financials.cashOnHand + newState.financials.profit; // cashOnHand update from ORIGINAL state.financials.cashOnHand
            const currentMonthBurnRate = Math.max(0, newState.financials.expenses - newState.financials.revenue);
            newState.financials.burnRate = currentMonthBurnRate;

            newState.userMetrics.activeUsers = aiOutput.updatedActiveUsers;
            newState.userMetrics.newUserAcquisitionRate = aiOutput.newUserAcquisition;
            newState.userMetrics.monthlyRecurringRevenue = aiOutput.updatedActiveUsers * newState.product.pricePerUser;

            newState.product.developmentProgress = state.product.developmentProgress + aiOutput.productDevelopmentDelta; // progress update from ORIGINAL state.product.developmentProgress

            if (aiOutput.newProductStage && aiOutput.newProductStage !== newState.product.stage) {
              newState.product.stage = aiOutput.newProductStage;
              newState.product.developmentProgress = 0; 
              newState.keyEvents.push(`Product advanced to ${newState.product.stage} stage!`);
            } else if (newState.product.developmentProgress >= 100 && newState.product.stage !== 'mature') {
                const stagesList: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
                const currentStageIndex = stagesList.indexOf(newState.product.stage);
                if (currentStageIndex < stagesList.length - 1) {
                  newState.product.stage = stagesList[currentStageIndex + 1];
                  newState.product.developmentProgress = newState.product.developmentProgress % 100; 
                  newState.keyEvents.push(`Product advanced to ${newState.product.stage} stage! (Progress Milestone)`);
                } else { 
                    newState.product.stage = 'mature';
                    newState.product.developmentProgress = 100; 
                    newState.keyEvents.push(`Product reached maturity! (Progress Milestone)`);
                }
            }
            newState.product.developmentProgress = Math.min(100, Math.max(0,newState.product.developmentProgress));

            aiOutput.keyEventsGenerated.forEach(event => newState.keyEvents.push(event));
            newState.keyEvents.push(`Month ${newState.simulationMonth} (AI Sim): Revenue ${newState.financials.currencySymbol}${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash ${newState.financials.currencySymbol}${newState.financials.cashOnHand.toLocaleString()}, Burn ${newState.financials.currencySymbol}${currentMonthBurnRate.toLocaleString()}, Profit ${newState.financials.currencySymbol}${newState.financials.profit.toLocaleString()}`);

            newState.startupScore = Math.max(0, Math.min(100, newState.startupScore + aiOutput.startupScoreAdjustment));
            if (newState.financials.cashOnHand <= 0 && state.financials.cashOnHand > 0) { 
                newState.keyEvents.push(`Critical: Ran out of cash! Simulation unstable.`);
            }

            const newRevenueData: RevenueDataPoint = { month: `M${newState.simulationMonth}`, revenue: newState.financials.revenue, desktop: newState.financials.revenue };
            newState.historicalRevenue.push(newRevenueData);
            if (newState.historicalRevenue.length > 12) newState.historicalRevenue.shift();

            const newUserGrowthData: UserDataPoint = { month: `M${newState.simulationMonth}`, users: newState.userMetrics.activeUsers, desktop: newState.userMetrics.activeUsers };
            newState.historicalUserGrowth.push(newUserGrowthData);
            if (newState.historicalUserGrowth.length > 12) newState.historicalUserGrowth.shift();

            const newBurnRateData: HistoricalDataPoint = { month: `M${newState.simulationMonth}`, value: currentMonthBurnRate, desktop: currentMonthBurnRate };
            newState.historicalBurnRate.push(newBurnRateData);
            if (newState.historicalBurnRate.length > 12) newState.historicalBurnRate.shift();

            const newNetProfitLossData: HistoricalDataPoint = { month: `M${newState.simulationMonth}`, value: newState.financials.profit, desktop: newState.financials.profit };
            newState.historicalNetProfitLoss.push(newNetProfitLossData);
            if (newState.historicalNetProfitLoss.length > 12) newState.historicalNetProfitLoss.shift();

            if (aiOutput.expenseBreakdown) {
                const newExpenseBreakdownData: ExpenseBreakdownDataPoint = { month: `M${newState.simulationMonth}`, ...aiOutput.expenseBreakdown };
                newState.historicalExpenseBreakdown.push(newExpenseBreakdownData);
                if (newState.historicalExpenseBreakdown.length > 12) newState.historicalExpenseBreakdown.shift();
            } else {
                console.warn("AI did not provide expense breakdown for month " + newState.simulationMonth + ". This should not happen.");
            }

            if (aiOutput.rewardsGranted && aiOutput.rewardsGranted.length > 0) {
              const newRewards: Reward[] = aiOutput.rewardsGranted.map(rewardBase => ({
                ...rewardBase,
                id: `reward-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                dateEarned: new Date().toISOString(),
              }));
              newState.rewards.push(...newRewards);
              newRewards.forEach(nr => newState.keyEvents.push(`Reward Earned: ${nr.name} - ${nr.description}`));
            }

            newState.currentAiReasoning = aiOutput.aiReasoning || "AI completed simulation. Reasoning not explicitly provided.";
            
            // Merge newState back into the overall store state, preserving savedSimulations
            return { ...state, ...newState };
          });

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
            keyEvents: [...state.keyEvents, userFriendlyMessage],
            currentAiReasoning: reasoningMessage
          }));
        }
      },

      resetSimulation: () => {
        set(state => ({
            ...getInitialState(), 
            keyEvents: ["Simulation reset. Please initialize a new venture."],
            currentAiReasoning: "Simulation reset. AI log cleared.",
            sandboxState: null,
            isSandboxing: false,
            sandboxRelativeMonth: 0,
            savedSimulations: [], // Clear saved simulations on full reset too
        }));
      },

      // Sandbox actions
      startSandboxExperiment: () => set(state => {
        if (!state.isInitialized) return state;
        const activeSimState = extractActiveSimState(state);
        const sandboxCopy = JSON.parse(JSON.stringify(activeSimState)) as DigitalTwinState;
        
        // Reset mutable parts for a clean sandbox start based on current main sim conditions
        sandboxCopy.historicalRevenue = [];
        sandboxCopy.historicalUserGrowth = [];
        sandboxCopy.historicalBurnRate = [];
        sandboxCopy.historicalNetProfitLoss = [];
        sandboxCopy.historicalExpenseBreakdown = [];
        sandboxCopy.keyEvents = [`Sandbox started from main sim month ${state.simulationMonth}. Initial state copied.`];
        sandboxCopy.rewards = []; 
        sandboxCopy.simulationMonth = state.simulationMonth; // Sandbox starts at the same "logical" month as main
        
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
          currentSimulationMonth: currentFullState.sandboxRelativeMonth, // Use relative month for AI
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
        };

        try {
          const aiOutput: SimulateMonthOutput = await simulateMonthFlow(simulateMonthInput);

          set(state => {
            if (!state.isSandboxing || !state.sandboxState) return state;
            // Create a mutable copy of the current sandbox state
            const newSandboxState: DigitalTwinState = JSON.parse(JSON.stringify(state.sandboxState));

            // Important: Sandbox month is relative. Main simulation month is preserved in newSandboxState.simulationMonth
            // This means newSandboxState.simulationMonth refers to the main sim month *from which this sandbox originated*.
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
              newSandboxState.keyEvents.push(`(Sandbox M${simulatedSandboxDisplayMonth}) Product advanced to ${newSandboxState.product.stage} stage!`);
            } else if (newSandboxState.product.developmentProgress >= 100 && newSandboxState.product.stage !== 'mature') {
                 const stagesList: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
                const currentStageIndex = stagesList.indexOf(newSandboxState.product.stage);
                if (currentStageIndex < stagesList.length - 1) {
                  newSandboxState.product.stage = stagesList[currentStageIndex + 1];
                  newSandboxState.product.developmentProgress %= 100;
                  newSandboxState.keyEvents.push(`(Sandbox M${simulatedSandboxDisplayMonth}) Product advanced to ${newSandboxState.product.stage} stage!`);
                } else {
                    newSandboxState.product.stage = 'mature';
                    newSandboxState.product.developmentProgress = 100;
                     newSandboxState.keyEvents.push(`(Sandbox M${simulatedSandboxDisplayMonth}) Product reached maturity!`);
                }
            }
             newSandboxState.product.developmentProgress = Math.min(100, Math.max(0,newSandboxState.product.developmentProgress));


            aiOutput.keyEventsGenerated.forEach(event => newSandboxState.keyEvents.push(`(Sandbox M${simulatedSandboxDisplayMonth}) ${event}`));
            newSandboxState.keyEvents.push(`(Sandbox M${simulatedSandboxDisplayMonth} Sim): Revenue ${newSandboxState.financials.currencySymbol}${newSandboxState.financials.revenue.toLocaleString()}, Users ${newSandboxState.userMetrics.activeUsers.toLocaleString()}, Cash ${newSandboxState.financials.currencySymbol}${newSandboxState.financials.cashOnHand.toLocaleString()}`);
            
            newSandboxState.startupScore = Math.max(0, Math.min(100, newSandboxState.startupScore + aiOutput.startupScoreAdjustment));
             if (newSandboxState.financials.cashOnHand <= 0 && state.sandboxState.financials.cashOnHand > 0) {
                newSandboxState.keyEvents.push(`(Sandbox) Critical: Ran out of cash!`);
            }

            newSandboxState.historicalRevenue.push({ month: `SB M${simulatedSandboxDisplayMonth}`, revenue: newSandboxState.financials.revenue, desktop: newSandboxState.financials.revenue });
            newSandboxState.historicalUserGrowth.push({ month: `SB M${simulatedSandboxDisplayMonth}`, users: newSandboxState.userMetrics.activeUsers, desktop: newSandboxState.userMetrics.activeUsers });
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
                    keyEvents: [...state.sandboxState.keyEvents, userFriendlyMessage],
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
      })),
      
      applySandboxDecisionsToMain: () => set(state => {
        if (!state.isSandboxing || !state.sandboxState) {
          console.warn("Cannot apply sandbox: No active sandbox experiment.");
          // Potentially add a key event or AI reasoning update here too
          return {
            ...state,
            currentAiReasoning: (state.currentAiReasoning || "") + "\nAttempted to apply sandbox decisions, but no active sandbox experiment found.",
          };
        }
      
        // Create a mutable deep copy of the main simulation state properties
        // Ensure we are not directly mutating 'state' but a copy that will form the new state
        const updatedMainState: DigitalTwinState = JSON.parse(JSON.stringify(extractActiveSimState(state)));
        const sandboxDecisionState = state.sandboxState;
      
        // Apply the decision levers and product state from the sandbox to the main simulation
        updatedMainState.resources.marketingSpend = sandboxDecisionState.resources.marketingSpend;
        updatedMainState.resources.rndSpend = sandboxDecisionState.resources.rndSpend;
        updatedMainState.product.pricePerUser = sandboxDecisionState.product.pricePerUser;
        updatedMainState.resources.team = JSON.parse(JSON.stringify(sandboxDecisionState.resources.team)); // Deep copy team
      
        updatedMainState.product.stage = sandboxDecisionState.product.stage;
        updatedMainState.product.developmentProgress = sandboxDecisionState.product.developmentProgress;
        updatedMainState.product.name = sandboxDecisionState.product.name;
        updatedMainState.product.features = JSON.parse(JSON.stringify(sandboxDecisionState.product.features));
      
        // Preserve existing key events and add a new one
        updatedMainState.keyEvents = [
          ...state.keyEvents, // Use key events from the original main state
          `Decisions and product state from a sandbox experiment (which ran for ${state.sandboxRelativeMonth} month(s)) applied to the main simulation.`
        ];
      
        updatedMainState.currentAiReasoning = (state.currentAiReasoning || "") + 
          `\n[Main Sim Update]: Adopted decisions (marketing, R&D, price, team, product dev) from the recent sandbox experiment. The main simulation will now proceed with these settings.`;
      
        // Return the new state, which includes the updated main simulation parts and resets sandbox
        return {
          ...state, // Spread original state to keep `savedSimulations` and other top-level parts
          // Overwrite the active simulation properties with updatedMainState
          simulationMonth: updatedMainState.simulationMonth,
          companyName: updatedMainState.companyName,
          financials: updatedMainState.financials,
          userMetrics: updatedMainState.userMetrics,
          product: updatedMainState.product,
          resources: updatedMainState.resources,
          market: updatedMainState.market,
          startupScore: updatedMainState.startupScore,
          keyEvents: updatedMainState.keyEvents,
          rewards: updatedMainState.rewards,
          initialGoals: updatedMainState.initialGoals,
          missions: updatedMainState.missions,
          suggestedChallenges: updatedMainState.suggestedChallenges,
          isInitialized: updatedMainState.isInitialized,
          currentAiReasoning: updatedMainState.currentAiReasoning,
          historicalRevenue: updatedMainState.historicalRevenue,
          historicalUserGrowth: updatedMainState.historicalUserGrowth,
          historicalBurnRate: updatedMainState.historicalBurnRate,
          historicalNetProfitLoss: updatedMainState.historicalNetProfitLoss,
          historicalExpenseBreakdown: updatedMainState.historicalExpenseBreakdown,
          
          // Reset sandbox state
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
        // Use extractActiveSimState to get a clean copy of the active simulation for saving
        const stateToSave = JSON.parse(JSON.stringify(extractActiveSimState(currentFullState)));
        // Nullify sandbox parts in the saved state, as snapshots are of the main sim
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
          // Spread all properties from the loaded simulation state
          ...loadedSimState,
          // Reset sandbox attributes explicitly after spreading
          sandboxState: null,
          isSandboxing: false,
          sandboxRelativeMonth: 0,
          // Preserve the list of saved simulations from the current store state
          savedSimulations: currentFullState.savedSimulations,
          // Add a key event for loading
          keyEvents: [...loadedSimState.keyEvents, `Simulation loaded from snapshot: ${snapshotToLoad.name}`],
          currentAiReasoning: `Simulation state loaded from snapshot: "${snapshotToLoad.name}". Main simulation month is now ${loadedSimState.simulationMonth}.`,
        };
        
        set(newStateFromSnapshot);
        return loadedSimState; // Return the DigitalTwinState part of the snapshot
      },

      deleteSavedSimulation: (snapshotId: string) => {
        set(state => ({
          ...state,
          savedSimulations: state.savedSimulations.filter(s => s.id !== snapshotId),
        }));
      },

    }),
    {
      name: 'simulation-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedStateUnknown, currentState) => {
        const persistedState = persistedStateUnknown as DigitalTwinState & { savedSimulations: SimulationSnapshot[] };
        let mergedState = { ...currentState, ...persistedState };

        // Ensure all array and object fields are properly initialized if they are missing from persistedState
        // or to maintain their structure from the initial state definition if not present.
        const defaultStateArrays = getInitialState();

        mergedState.initialGoals = Array.isArray(mergedState.initialGoals) ? mergedState.initialGoals : defaultStateArrays.initialGoals;
        mergedState.suggestedChallenges = Array.isArray(mergedState.suggestedChallenges) ? mergedState.suggestedChallenges : defaultStateArrays.suggestedChallenges;
        mergedState.historicalRevenue = Array.isArray(mergedState.historicalRevenue) ? mergedState.historicalRevenue : defaultStateArrays.historicalRevenue;
        mergedState.historicalUserGrowth = Array.isArray(mergedState.historicalUserGrowth) ? mergedState.historicalUserGrowth : defaultStateArrays.historicalUserGrowth;
        mergedState.historicalBurnRate = Array.isArray(mergedState.historicalBurnRate) ? mergedState.historicalBurnRate : defaultStateArrays.historicalBurnRate;
        mergedState.historicalNetProfitLoss = Array.isArray(mergedState.historicalNetProfitLoss) ? mergedState.historicalNetProfitLoss : defaultStateArrays.historicalNetProfitLoss;
        mergedState.historicalExpenseBreakdown = Array.isArray(mergedState.historicalExpenseBreakdown) ? mergedState.historicalExpenseBreakdown : defaultStateArrays.historicalExpenseBreakdown;
        mergedState.keyEvents = Array.isArray(mergedState.keyEvents) ? mergedState.keyEvents : defaultStateArrays.keyEvents;
        mergedState.rewards = Array.isArray(mergedState.rewards) ? mergedState.rewards : defaultStateArrays.rewards;
        mergedState.savedSimulations = Array.isArray(mergedState.savedSimulations) ? mergedState.savedSimulations : defaultStateArrays.savedSimulations;
        mergedState.missions = Array.isArray(mergedState.missions) ? mergedState.missions : defaultStateArrays.missions;


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
        if (typeof mergedState.sandboxState === 'undefined') { // Check for undefined specifically
            mergedState.sandboxState = defaultStateArrays.sandboxState;
        }
         if (typeof mergedState.sandboxRelativeMonth === 'undefined') {
            mergedState.sandboxRelativeMonth = defaultStateArrays.sandboxRelativeMonth;
        }
        
        if (mergedState.sandboxState) { // If sandboxState exists, ensure its arrays are also initialized
            mergedState.sandboxState.keyEvents = Array.isArray(mergedState.sandboxState.keyEvents) ? mergedState.sandboxState.keyEvents : [];
            mergedState.sandboxState.historicalRevenue = Array.isArray(mergedState.sandboxState.historicalRevenue) ? mergedState.sandboxState.historicalRevenue : [];
            mergedState.sandboxState.historicalUserGrowth = Array.isArray(mergedState.sandboxState.historicalUserGrowth) ? mergedState.sandboxState.historicalUserGrowth : [];
            // Ensure all other fields of sandboxState are correctly typed and structured as per DigitalTwinState
        }

        return mergedState as DigitalTwinState & { savedSimulations: SimulationSnapshot[] };
      },
    }
  )
);

