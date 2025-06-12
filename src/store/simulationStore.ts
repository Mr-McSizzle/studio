
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DigitalTwinState, Reward, AIInitialConditions, RevenueDataPoint, UserDataPoint, SimulateMonthInput, SimulateMonthOutput, HistoricalDataPoint, ExpenseBreakdownDataPoint, TeamMember } from '@/types/simulation';
import type { PromptStartupOutput } from '@/ai/flows/prompt-startup';
import { simulateMonth as simulateMonthFlow } from '@/ai/flows/simulate-month-flow';

const MOCK_PRICE_PER_USER_PER_MONTH_DEFAULT = 10;
const MOCK_SALARY_PER_FOUNDER = 0;
const MOCK_SALARY_PER_EMPLOYEE = 4000;
const MOCK_OTHER_OPERATIONAL_COSTS = 1500;
const DEFAULT_ENGINEER_SALARY = 5000;
const DEFAULT_MARKETING_SPEND = 500;
const DEFAULT_RND_SPEND = 500;


const getCurrencySymbol = (code?: string): string => {
  if (!code) return "$";
  const map: Record<string, string> = { USD: "$", EUR: "€", JPY: "¥", GBP: "£", CAD: "C$", AUD: "A$" };
  return map[code.toUpperCase()] || code;
};

const initialBaseState: Omit<DigitalTwinState, 'rewards' | 'keyEvents' | 'historicalRevenue' | 'historicalUserGrowth' | 'suggestedChallenges' | 'historicalBurnRate' | 'historicalNetProfitLoss' | 'historicalExpenseBreakdown'> = {
  simulationMonth: 0,
  companyName: "Your New Venture",
  financials: {
    revenue: 0,
    expenses: MOCK_OTHER_OPERATIONAL_COSTS + DEFAULT_MARKETING_SPEND + DEFAULT_RND_SPEND,
    profit: -(MOCK_OTHER_OPERATIONAL_COSTS + DEFAULT_MARKETING_SPEND + DEFAULT_RND_SPEND),
    burnRate: MOCK_OTHER_OPERATIONAL_COSTS + DEFAULT_MARKETING_SPEND + DEFAULT_RND_SPEND,
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
  keyEvents: ["Simulation not yet initialized."],
  rewards: [],
  suggestedChallenges: [],
  historicalRevenue: [],
  historicalUserGrowth: [],
  historicalBurnRate: [],
  historicalNetProfitLoss: [],
  historicalExpenseBreakdown: [],
});

interface SimulationActions {
  initializeSimulation: (aiOutput: PromptStartupOutput, userStartupName: string, userTargetMarket: string, userBudget: string, userCurrencyCode: string) => void;
  advanceMonth: () => Promise<void>;
  resetSimulation: () => void;
  setMarketingSpend: (amount: number) => void;
  setRndSpend: (amount: number) => void;
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
          parsedConditions = JSON.parse(aiOutput.initialConditions);
        } catch (e) {
          console.error("Failed to parse AI initialConditions JSON:", e);
          set(state => ({
            ...state,
            keyEvents: [...state.keyEvents, `Error: AI failed to provide valid initial conditions JSON. Details: ${e instanceof Error ? e.message : String(e)}. Using defaults.`],
            isInitialized: false,
          }));
          return;
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

        const aiEstimatedBurnRate = parseMonetaryValue(parsedConditions.financials?.estimatedInitialMonthlyBurnRate);

        if (aiEstimatedBurnRate > 0) {
          finalInitialBurnRate = aiEstimatedBurnRate;
          finalInitialExpenses = aiEstimatedBurnRate;
        } else {
          finalInitialExpenses = initialSalaries + initialMarketingSpend + initialRndSpend + MOCK_OTHER_OPERATIONAL_COSTS;
          finalInitialBurnRate = finalInitialExpenses > 0 ? finalInitialExpenses : MOCK_OTHER_OPERATIONAL_COSTS;
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
            finalProductStage = 'idea'; // Default for unrecognized
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
            profit: 0 - finalInitialExpenses,
            burnRate: finalInitialBurnRate,
            currencyCode: finalCurrencyCode,
            currencySymbol: finalCurrencySymbol,
          },
          initialGoals: processedInitialGoals,
          suggestedChallenges: processedSuggestedChallenges,
          keyEvents: [`Simulation initialized for ${parsedConditions.companyName || userStartupName} with budget ${finalCurrencySymbol}${initialBudgetNum.toLocaleString()}. Target: ${userTargetMarket || 'Not specified'}. Initial Burn: ${finalCurrencySymbol}${finalInitialBurnRate.toLocaleString()}/month.`],
          rewards: [],
          historicalRevenue: [],
          historicalUserGrowth: [],
          historicalBurnRate: [{ month: "M0", value: finalInitialBurnRate, desktop: finalInitialBurnRate }],
          historicalNetProfitLoss: [{ month: "M0", value: (0 - finalInitialExpenses), desktop: (0 - finalInitialExpenses) }],
          historicalExpenseBreakdown: [{ month: "M0", salaries: initialSalaries, marketing: initialMarketingSpend, rnd: initialRndSpend, operational: MOCK_OTHER_OPERATIONAL_COSTS }],
          isInitialized: true,
          simulationMonth: 0,
          startupScore: 10,
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
        if (!currentState.isInitialized || currentState.financials.cashOnHand <= 0) return;

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
            let newState: DigitalTwinState = JSON.parse(JSON.stringify(state));

            newState.simulationMonth = aiOutput.simulatedMonthNumber;

            newState.financials.revenue = aiOutput.calculatedRevenue;
            newState.financials.expenses = aiOutput.calculatedExpenses;
            newState.financials.profit = aiOutput.profitOrLoss;
            newState.financials.cashOnHand = aiOutput.updatedCashOnHand;

            const currentBurnRate = Math.max(0, aiOutput.calculatedExpenses - aiOutput.calculatedRevenue);
            newState.financials.burnRate = currentBurnRate;

            newState.userMetrics.activeUsers = aiOutput.updatedActiveUsers;
            newState.userMetrics.newUserAcquisitionRate = aiOutput.newUserAcquisition;
            newState.userMetrics.monthlyRecurringRevenue = aiOutput.updatedActiveUsers * newState.product.pricePerUser;

            newState.product.developmentProgress = state.product.developmentProgress + aiOutput.productDevelopmentDelta;

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
            newState.product.developmentProgress = Math.min(100, newState.product.developmentProgress);


            aiOutput.keyEventsGenerated.forEach(event => newState.keyEvents.push(event));
            newState.keyEvents.push(`Month ${newState.simulationMonth} (AI Sim): Revenue ${newState.financials.currencySymbol}${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash ${newState.financials.currencySymbol}${newState.financials.cashOnHand.toLocaleString()}, Burn ${newState.financials.currencySymbol}${currentBurnRate.toLocaleString()}`);


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

            const newBurnRateData: HistoricalDataPoint = { month: `M${newState.simulationMonth}`, value: currentBurnRate, desktop: currentBurnRate };
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
                console.warn("AI did not provide expense breakdown for month " + newState.simulationMonth);
                const placeholderSalaries = newState.resources.team.reduce((acc, member) => acc + (member.count * member.salary), 0);
                const placeholderOperational = Math.max(0, newState.financials.expenses - (placeholderSalaries + newState.resources.marketingSpend + newState.resources.rndSpend));
                const placeholderBreakdown: ExpenseBreakdownDataPoint = {
                    month: `M${newState.simulationMonth}`,
                    salaries: placeholderSalaries,
                    marketing: newState.resources.marketingSpend,
                    rnd: newState.resources.rndSpend,
                    operational: placeholderOperational
                };
                newState.historicalExpenseBreakdown.push(placeholderBreakdown);
                if (newState.historicalExpenseBreakdown.length > 12) newState.historicalExpenseBreakdown.shift();
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

            return newState;
          });

        } catch (error) {
          console.error("Error during AI month simulation:", error);
          // Use get() to access the most current state for the month number, as 'currentState' might be stale here.
          const targetMonth = get().simulationMonth + 1;
          let userFriendlyMessage = `AI simulation for month ${targetMonth} failed.`;

          if (error instanceof Error) {
            if (error.message.includes("503 Service Unavailable") || 
                error.message.includes("GoogleGenerativeAI Error") ||
                error.message.toLowerCase().includes("service unavailable")) {
              userFriendlyMessage = `The AI simulation service is temporarily unavailable (may be Error 503). Please try advancing the month again shortly.`;
            } else {
              userFriendlyMessage += ` Details: ${error.message}`;
            }
          } else {
            userFriendlyMessage += ` An unknown error occurred.`;
          }

          set(state => ({
            ...state,
            keyEvents: [...state.keyEvents, userFriendlyMessage]
          }));
        }
      },

      resetSimulation: () => {
        set(state => ({
            ...getInitialState(),
            keyEvents: ["Simulation reset. Please initialize a new venture."],
        }));
      }
    }),
    {
      name: 'simulation-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedStateUnknown, currentState) => {
        let mergedState = { ...currentState, ...(persistedStateUnknown as object) as Partial<DigitalTwinState> };

        mergedState.initialGoals = Array.isArray(mergedState.initialGoals) ? mergedState.initialGoals : [];
        mergedState.suggestedChallenges = Array.isArray(mergedState.suggestedChallenges) ? mergedState.suggestedChallenges : [];
        mergedState.historicalRevenue = Array.isArray(mergedState.historicalRevenue) ? mergedState.historicalRevenue : [];
        mergedState.historicalUserGrowth = Array.isArray(mergedState.historicalUserGrowth) ? mergedState.historicalUserGrowth : [];
        mergedState.historicalBurnRate = Array.isArray(mergedState.historicalBurnRate) ? mergedState.historicalBurnRate : [];
        mergedState.historicalNetProfitLoss = Array.isArray(mergedState.historicalNetProfitLoss) ? mergedState.historicalNetProfitLoss : [];
        mergedState.historicalExpenseBreakdown = Array.isArray(mergedState.historicalExpenseBreakdown) ? mergedState.historicalExpenseBreakdown : [];
        mergedState.keyEvents = Array.isArray(mergedState.keyEvents) ? mergedState.keyEvents : ["Simulation state rehydrated."];
        mergedState.rewards = Array.isArray(mergedState.rewards) ? mergedState.rewards : [];

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
        } else {
             mergedState.product = { ...initialBaseState.product };
        }

        return mergedState as DigitalTwinState;
      },
    }
  )
);
