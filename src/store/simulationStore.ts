
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DigitalTwinState, Reward, AIInitialConditions, RevenueDataPoint, UserDataPoint, SimulateMonthInput, SimulateMonthOutput, HistoricalDataPoint, ExpenseBreakdownDataPoint, TeamMember, ExpenseBreakdown } from '@/types/simulation';
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

const initialBaseState: Omit<DigitalTwinState, 'rewards' | 'keyEvents' | 'historicalRevenue' | 'historicalUserGrowth' | 'suggestedChallenges' | 'historicalBurnRate' | 'historicalNetProfitLoss' | 'historicalExpenseBreakdown' | 'currentAiReasoning'> = {
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


const getInitialState = (): DigitalTwinState => ({
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
});

interface SimulationActions {
  initializeSimulation: (aiOutput: PromptStartupOutput, userStartupName: string, userTargetMarket: string, userBudget: string, userCurrencyCode: string) => void;
  advanceMonth: () => Promise<void>;
  resetSimulation: () => void;
  setMarketingSpend: (amount: number) => void;
  setRndSpend: (amount: number) => void;
  setPricePerUser: (price: number) => void;
  adjustTeamMemberCount: (roleToAdjust: string, change: number, salaryPerMember?: number) => void;
}

const parseMonetaryValue = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleanedValue = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanedValue) || 0;
  }
  return 0;
};


export const useSimulationStore = create<DigitalTwinState & SimulationActions>()(
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
          console.error("Problematic AI JSON string was:", aiOutput.initialConditions); // Log the string

          const errorMessage = `AI returned malformed data for initial setup. Details: ${errorDetails}. Cannot initialize simulation.`;
          set(state => ({
            ...state,
            keyEvents: [...state.keyEvents, errorMessage],
            isInitialized: false,
            currentAiReasoning: "Fatal Error: AI provided unusable data for startup initialization. Please try setting up again.",
          }));
          // Re-throw the error so it's caught by the handleSubmit on the setup page
          // and the user sees the error there, preventing a redirect to a broken dashboard.
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
          finalInitialBurnRate = finalInitialExpenses > 0 ? finalInitialExpenses : calculatedOperationalFallback; // Burn rate is expenses if revenue is 0
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
            pricePerUser: initialPricePerUser,
            developmentProgress: 0,
          },
          financials: {
            ...initialBaseState.financials,
            cashOnHand: parseMonetaryValue(parsedConditions.financials?.startingCash) || initialBudgetNum,
            fundingRaised: parseMonetaryValue(parsedConditions.financials?.startingCash) || initialBudgetNum,
            expenses: finalInitialExpenses,
            profit: 0 - finalInitialExpenses, // Profit at M0 is negative expenses (assuming 0 revenue)
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
            return state; // Prevent removing the last founder
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
            currentRevenue: currentState.financials.revenue, // Last month's revenue becomes current for AI context
            currentExpenses: currentState.financials.expenses, // Last month's expenses for context
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
            let newState: DigitalTwinState = JSON.parse(JSON.stringify(state)); // Deep clone

            newState.simulationMonth = aiOutput.simulatedMonthNumber;

            // Update state with AI's direct outputs (which are now internally consistent due to AI flow recalculations)
            newState.financials.revenue = aiOutput.calculatedRevenue;
            newState.financials.expenses = aiOutput.calculatedExpenses;

            // CRUCIAL: Recalculate profit in the store based on these authoritative figures
            newState.financials.profit = newState.financials.revenue - newState.financials.expenses;

            // Update cashOnHand based on THIS month's store-calculated profit/loss
            newState.financials.cashOnHand = state.financials.cashOnHand + newState.financials.profit;

            // Recalculate burnRate based on THIS month's store figures
            const currentMonthBurnRate = Math.max(0, newState.financials.expenses - newState.financials.revenue);
            newState.financials.burnRate = currentMonthBurnRate;


            newState.userMetrics.activeUsers = aiOutput.updatedActiveUsers;
            newState.userMetrics.newUserAcquisitionRate = aiOutput.newUserAcquisition;
            newState.userMetrics.monthlyRecurringRevenue = aiOutput.updatedActiveUsers * newState.product.pricePerUser;

            newState.product.developmentProgress = state.product.developmentProgress + aiOutput.productDevelopmentDelta;

            if (aiOutput.newProductStage && aiOutput.newProductStage !== newState.product.stage) {
              newState.product.stage = aiOutput.newProductStage;
              newState.product.developmentProgress = 0; // Reset progress on new stage
              newState.keyEvents.push(`Product advanced to ${newState.product.stage} stage!`);
            } else if (newState.product.developmentProgress >= 100 && newState.product.stage !== 'mature') {
                // Handle stage advancement if AI didn't explicitly set newProductStage but progress hit 100
                const stagesList: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
                const currentStageIndex = stagesList.indexOf(newState.product.stage);
                if (currentStageIndex < stagesList.length - 1) {
                  newState.product.stage = stagesList[currentStageIndex + 1];
                  newState.product.developmentProgress = newState.product.developmentProgress % 100; // Keep remainder
                  newState.keyEvents.push(`Product advanced to ${newState.product.stage} stage! (Progress Milestone)`);
                } else { // Reached 'mature'
                    newState.product.stage = 'mature';
                    newState.product.developmentProgress = 100; // Cap at 100 for mature
                    newState.keyEvents.push(`Product reached maturity! (Progress Milestone)`);
                }
            }
            newState.product.developmentProgress = Math.min(100, Math.max(0,newState.product.developmentProgress));


            aiOutput.keyEventsGenerated.forEach(event => newState.keyEvents.push(event));
            newState.keyEvents.push(`Month ${newState.simulationMonth} (AI Sim): Revenue ${newState.financials.currencySymbol}${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash ${newState.financials.currencySymbol}${newState.financials.cashOnHand.toLocaleString()}, Burn ${newState.financials.currencySymbol}${currentMonthBurnRate.toLocaleString()}, Profit ${newState.financials.currencySymbol}${newState.financials.profit.toLocaleString()}`);


            newState.startupScore = Math.max(0, Math.min(100, newState.startupScore + aiOutput.startupScoreAdjustment));
            if (newState.financials.cashOnHand <= 0 && state.financials.cashOnHand > 0) { // Check if just ran out
                newState.keyEvents.push(`Critical: Ran out of cash! Simulation unstable.`);
            }

            // Update historical data
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

            return newState;
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
        }));
      }
    }),
    {
      name: 'simulation-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedStateUnknown, currentState) => {
        let mergedState = { ...currentState, ...(persistedStateUnknown as object) as Partial<DigitalTwinState> };

        // Ensure arrays are arrays
        mergedState.initialGoals = Array.isArray(mergedState.initialGoals) ? mergedState.initialGoals : [];
        mergedState.suggestedChallenges = Array.isArray(mergedState.suggestedChallenges) ? mergedState.suggestedChallenges : [];
        mergedState.historicalRevenue = Array.isArray(mergedState.historicalRevenue) ? mergedState.historicalRevenue : [];
        mergedState.historicalUserGrowth = Array.isArray(mergedState.historicalUserGrowth) ? mergedState.historicalUserGrowth : [];
        mergedState.historicalBurnRate = Array.isArray(mergedState.historicalBurnRate) ? mergedState.historicalBurnRate : [];
        mergedState.historicalNetProfitLoss = Array.isArray(mergedState.historicalNetProfitLoss) ? mergedState.historicalNetProfitLoss : [];
        mergedState.historicalExpenseBreakdown = Array.isArray(mergedState.historicalExpenseBreakdown) ? mergedState.historicalExpenseBreakdown : [];
        mergedState.keyEvents = Array.isArray(mergedState.keyEvents) ? mergedState.keyEvents : ["Simulation state rehydrated."];
        mergedState.rewards = Array.isArray(mergedState.rewards) ? mergedState.rewards : [];

        // Ensure currencyCode and currencySymbol are always present
        if (!mergedState.financials || !mergedState.financials.currencyCode) {
            mergedState.financials = {
                ...initialBaseState.financials,
                ...(mergedState.financials || {}), // Spread potentially partial persisted financials
                currencyCode: (mergedState.financials?.currencyCode || initialBaseState.financials.currencyCode),
                currencySymbol: getCurrencySymbol(mergedState.financials?.currencyCode || initialBaseState.financials.currencyCode),
            };
        } else if (!mergedState.financials.currencySymbol) { // If code exists but symbol is missing
             mergedState.financials.currencySymbol = getCurrencySymbol(mergedState.financials.currencyCode);
        }

        // Ensure product.pricePerUser is a number
        if (!mergedState.product || typeof mergedState.product.pricePerUser !== 'number') {
            mergedState.product = {
                ...initialBaseState.product,
                ...(mergedState.product || {}),
                pricePerUser: (mergedState.product && typeof mergedState.product.pricePerUser === 'number') ? mergedState.product.pricePerUser : initialBaseState.product.pricePerUser,
            };
        }

        // Ensure product.stage is valid
        if (mergedState.product) {
            const validStages: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
            let currentStage = mergedState.product.stage;
            if (!validStages.includes(currentStage)) {
                if (String(currentStage).toLowerCase() === 'concept') { // Map 'concept' during rehydration too
                    currentStage = 'idea';
                } else {
                    console.warn(`Invalid product stage "${currentStage}" during merge. Defaulting to "idea".`);
                    currentStage = 'idea';
                }
            }
            mergedState.product.stage = currentStage;
        } else {
             mergedState.product = { ...initialBaseState.product }; // If no product object, set to default
        }

        // Initialize currentAiReasoning if not present in persisted state
        if (typeof mergedState.currentAiReasoning === 'undefined') {
          mergedState.currentAiReasoning = "AI log rehydrated. Ready for simulation.";
        }


        return mergedState as DigitalTwinState;
      },
    }
  )
);
