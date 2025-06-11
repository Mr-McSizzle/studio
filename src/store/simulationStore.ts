
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DigitalTwinState, Mission, Reward, AIInitialConditions, RevenueDataPoint, UserDataPoint, TeamMember, SimulateMonthInput, SimulateMonthOutput } from '@/types/simulation';
import type { PromptStartupOutput } from '@/ai/flows/prompt-startup';
import { simulateMonth as simulateMonthFlow } from '@/ai/flows/simulate-month-flow'; // Import the AI flow

const MOCK_PRICE_PER_USER_PER_MONTH_DEFAULT = 10; // Will be overridden by AI or stored state
const MOCK_SALARY_PER_FOUNDER = 0;
const MOCK_SALARY_PER_EMPLOYEE = 4000; // Generic, AI can define specific salaries
const MOCK_OTHER_OPERATIONAL_COSTS = 1500; // AI will consider this as a base
const DEFAULT_ENGINEER_SALARY = 5000;

const getCurrencySymbol = (code?: string): string => {
  if (!code) return "$";
  const map: Record<string, string> = { USD: "$", EUR: "€", JPY: "¥", GBP: "£", CAD: "C$", AUD: "A$" };
  return map[code.toUpperCase()] || code;
};

const initialBaseState: Omit<DigitalTwinState, 'missions' | 'rewards' | 'keyEvents' | 'historicalRevenue' | 'historicalUserGrowth' | 'suggestedChallenges'> = {
  simulationMonth: 0,
  companyName: "Your New Venture",
  financials: {
    revenue: 0,
    expenses: MOCK_OTHER_OPERATIONAL_COSTS,
    profit: -MOCK_OTHER_OPERATIONAL_COSTS,
    burnRate: MOCK_OTHER_OPERATIONAL_COSTS,
    cashOnHand: 0,
    fundingRaised: 0,
    currencyCode: "USD",
    currencySymbol: "$",
  },
  userMetrics: {
    activeUsers: 0,
    newUserAcquisitionRate: 0,
    customerAcquisitionCost: 20, // AI can influence this based on market
    churnRate: 0.05, // AI can influence this
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
    marketingSpend: 500,
    rndSpend: 500,
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

const exampleMissions: Omit<Mission, 'isCompleted'>[] = [
  {
    id: "reach-100-users",
    title: "Acquire First 100 Users",
    description: "Reach 100 active users for your product.",
    rewardText: "+5 Startup Score, 1,000 (in simulation currency) Cash Bonus",
    criteria: (currentState) => currentState.userMetrics.activeUsers >= 100,
    onComplete: (currentState) => {
      const returnState: DigitalTwinState = {
        ...currentState,
        startupScore: Math.min(100, currentState.startupScore + 5),
        financials: {
          ...currentState.financials,
          cashOnHand: currentState.financials.cashOnHand + 1000,
        },
        rewards: [
          ...currentState.rewards,
          { id: 'reward-100-users', name: '100 User Milestone', description: 'Achieved 100 active users.', dateEarned: new Date().toISOString() }
        ],
      };
      return returnState;
    }
  },
  {
    id: "first-profit",
    title: "Achieve First Profitable Month",
    description: "Have a month where revenue exceeds expenses.",
    rewardText: "+10 Startup Score",
    criteria: (currentState) => currentState.financials.profit > 0,
    onComplete: (currentState) => {
      const returnState: DigitalTwinState = {
        ...currentState,
        startupScore: Math.min(100, currentState.startupScore + 10),
        rewards: [
          ...currentState.rewards,
          { id: 'reward-first-profit', name: 'First Profit!', description: 'Recorded a profitable month.', dateEarned: new Date().toISOString() }
        ],
      };
      return returnState;
    }
  },
  {
    id: "mvp-launch",
    title: "Launch MVP",
    description: "Reach the MVP product stage.",
    rewardText: "+10 Startup Score, R&D Efficiency Boost (conceptual)",
    criteria: (currentState) => currentState.product.stage === 'mvp',
    onComplete: (currentState) => {
      const returnState: DigitalTwinState = {
        ...currentState,
        startupScore: Math.min(100, currentState.startupScore + 10),
        rewards: [
          ...currentState.rewards,
          { id: 'reward-mvp-launch', name: 'MVP Launched!', description: 'Successfully reached MVP stage.', dateEarned: new Date().toISOString() }
        ],
      };
      return returnState;
    }
  }
];

const getInitialState = (): DigitalTwinState => ({
  ...initialBaseState,
  keyEvents: ["Simulation not yet initialized."],
  missions: exampleMissions.map(m => ({...m, isCompleted: false})),
  rewards: [],
  suggestedChallenges: [],
  historicalRevenue: [],
  historicalUserGrowth: [],
});

interface SimulationActions {
  initializeSimulation: (aiOutput: PromptStartupOutput, userStartupName: string, userTargetMarket: string, userBudget: string, userCurrencyCode: string) => void;
  advanceMonth: () => Promise<void>; // Now async
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
            keyEvents: [...state.keyEvents, "Error: Failed to parse initial conditions from AI. Using defaults."],
            isInitialized: false,
          }));
          return;
        }
        
        const finalCurrencyCode = (parsedConditions.financials?.currencyCode || userCurrencyCode || "USD").toUpperCase();
        const finalCurrencySymbol = getCurrencySymbol(finalCurrencyCode);

        const initialBudgetNum = parseMonetaryValue(parsedConditions.resources?.initialFunding || userBudget);
        const initialTeamFromAI: TeamMember[] = [];

        if (parsedConditions.resources?.coreTeam) {
          if (Array.isArray(parsedConditions.resources.coreTeam)) {
            initialTeamFromAI.push(...parsedConditions.resources.coreTeam.map((member: any) => ({
                role: member.role || 'Team Member',
                count: member.count || 1,
                salary: parseMonetaryValue(member.salary) || ( (member.role || '').toLowerCase() === 'founder' ? MOCK_SALARY_PER_FOUNDER : MOCK_SALARY_PER_EMPLOYEE)
            })));
          } else if (typeof parsedConditions.resources.coreTeam === 'string') {
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
        
        const initialMarketingSpend = parseMonetaryValue(parsedConditions.resources?.marketingSpend) || initialBaseState.resources.marketingSpend;
        const initialRndSpend = parseMonetaryValue(parsedConditions.resources?.rndSpend) || initialBaseState.resources.rndSpend;
        const initialSalaries = finalInitialTeam.reduce((acc, tm) => acc + (tm.count * tm.salary), 0);
        const initialExpenses = initialSalaries + initialMarketingSpend + initialRndSpend + MOCK_OTHER_OPERATIONAL_COSTS;
        const initialPricePerUser = parseMonetaryValue(parsedConditions.productService?.pricePerUser) || MOCK_PRICE_PER_USER_PER_MONTH_DEFAULT;


        const rawGoals = parsedConditions.initialGoals;
        let processedInitialGoals: string[] = [];
        if (Array.isArray(rawGoals)) {
          processedInitialGoals = rawGoals.filter((g): g is string => typeof g === 'string');
        } else if (typeof rawGoals === 'string' && rawGoals.trim() !== '') {
          processedInitialGoals = [rawGoals];
        } else {
          processedInitialGoals = [];
        }
        
        let processedSuggestedChallenges: string[] = [];
        if (aiOutput.suggestedChallenges) {
            try {
                const parsedChallenges = JSON.parse(aiOutput.suggestedChallenges);
                if (Array.isArray(parsedChallenges)) {
                    processedSuggestedChallenges = parsedChallenges.filter((c): c is string => typeof c === 'string');
                } else if (typeof parsedChallenges === 'string') {
                    processedSuggestedChallenges = [parsedChallenges];
                } else {
                  processedSuggestedChallenges = [];
                }
            } catch (e) {
                console.error("Failed to parse AI suggestedChallenges JSON:", e);
                processedSuggestedChallenges = [];
            }
        }
        
        const aiProductStageRaw = parsedConditions.productService?.initialDevelopmentStage?.toLowerCase();
        let finalProductStage: DigitalTwinState['product']['stage'] = 'idea'; // Default to 'idea'

        if (aiProductStageRaw) {
          if (['idea', 'prototype', 'mvp', 'growth', 'mature'].includes(aiProductStageRaw)) {
            finalProductStage = aiProductStageRaw as DigitalTwinState['product']['stage'];
          } else if (aiProductStageRaw === 'concept') {
            finalProductStage = 'idea'; 
          }
        }


        set(state => ({
          ...initialBaseState, 
          companyName: parsedConditions.companyName || userStartupName || "AI Suggested Venture",
          market: {
            ...initialBaseState.market,
            targetMarketDescription: userTargetMarket,
            marketSize: parseMonetaryValue(parsedConditions.market?.estimatedSize) || initialBaseState.market.marketSize,
            marketGrowthRate: parseMonetaryValue(parsedConditions.market?.growthRate),
            keySegments: typeof parsedConditions.market?.keySegments === 'string' ? [parsedConditions.market.keySegments] : (Array.isArray(parsedConditions.market?.keySegments) ? parsedConditions.market.keySegments.filter(s => typeof s === 'string') : undefined),
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
            developmentProgress: parsedConditions.productService?.initialDevelopmentStage === finalProductStage ? 0 : (parsedConditions.productService?.initialDevelopmentStage === 'concept' ? 0 : initialBaseState.product.developmentProgress), // Reset progress if stage changes or is concept
          },
          financials: {
            ...initialBaseState.financials,
            cashOnHand: parseMonetaryValue(parsedConditions.financials?.startingCash) || initialBudgetNum,
            fundingRaised: parseMonetaryValue(parsedConditions.financials?.startingCash) || initialBudgetNum,
            expenses: initialExpenses,
            profit: 0 - initialExpenses,
            burnRate: initialExpenses > 0 ? initialExpenses : 0,
            currencyCode: finalCurrencyCode,
            currencySymbol: finalCurrencySymbol,
          },
          initialGoals: processedInitialGoals,
          suggestedChallenges: processedSuggestedChallenges,
          keyEvents: [`Simulation initialized for ${parsedConditions.companyName || userStartupName} with budget ${finalCurrencySymbol}${initialBudgetNum.toLocaleString()}. Target: ${userTargetMarket}. Product Stage: ${finalProductStage}. AI Challenges: ${processedSuggestedChallenges.join(', ') || 'None'}`],
          missions: exampleMissions.map(m => ({...m, isCompleted: false})), 
          rewards: [],
          historicalRevenue: [],
          historicalUserGrowth: [],
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
                console.warn(`Invalid product stage "${currentProductStageForAI}" detected before AI call. Defaulting to "idea".`);
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
            stage: currentProductStageForAI, // Use the sanitized stage
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
            
            newState.missions = exampleMissions.map(exampleMission => {
                const persistedMission = state.missions.find(pm => pm.id === exampleMission.id);
                return {
                    ...exampleMission,
                    isCompleted: persistedMission ? persistedMission.isCompleted : false,
                };
            });


            newState.simulationMonth = aiOutput.simulatedMonthNumber; 
            
            newState.financials.revenue = aiOutput.calculatedRevenue;
            newState.financials.expenses = aiOutput.calculatedExpenses;
            newState.financials.profit = aiOutput.profitOrLoss;
            newState.financials.cashOnHand = aiOutput.updatedCashOnHand;
            newState.financials.burnRate = aiOutput.calculatedExpenses > aiOutput.calculatedRevenue ? aiOutput.calculatedExpenses - aiOutput.calculatedRevenue : 0;

            newState.userMetrics.activeUsers = aiOutput.updatedActiveUsers;
            newState.userMetrics.newUserAcquisitionRate = aiOutput.newUserAcquisition;
            newState.userMetrics.monthlyRecurringRevenue = aiOutput.updatedActiveUsers * newState.product.pricePerUser; 

            newState.product.developmentProgress += aiOutput.productDevelopmentDelta;
            if (aiOutput.newProductStage) {
              newState.product.stage = aiOutput.newProductStage;
              newState.product.developmentProgress = 0; 
              newState.keyEvents.push(`Product advanced to ${newState.product.stage} stage!`);
            } else if (newState.product.developmentProgress >= 100 && newState.product.stage !== 'mature') {
                const stages: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
                const currentStageIndex = stages.indexOf(newState.product.stage);
                if (currentStageIndex < stages.length - 1) {
                  newState.product.stage = stages[currentStageIndex + 1];
                  newState.product.developmentProgress = 0;
                  newState.keyEvents.push(`Product advanced to ${newState.product.stage} stage! (Progress Milestone)`);
                } else {
                    newState.product.stage = 'mature';
                    newState.keyEvents.push(`Product reached maturity! (Progress Milestone)`);
                }
            }
            newState.product.developmentProgress = Math.min(100, newState.product.developmentProgress);


            aiOutput.keyEventsGenerated.forEach(event => newState.keyEvents.push(event));
            newState.keyEvents.push(`Month ${newState.simulationMonth} (AI Sim): Revenue ${newState.financials.currencySymbol}${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash ${newState.financials.currencySymbol}${newState.financials.cashOnHand.toLocaleString()}`);


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
            
            const originalMissionsFromState = newState.missions; 
            const updatedMissions = originalMissionsFromState.map(mission => {
              let missionCopy = {...mission};
              if (!missionCopy.isCompleted && missionCopy.criteria && typeof missionCopy.criteria === 'function' && missionCopy.criteria(newState)) {
                if (missionCopy.onComplete && typeof missionCopy.onComplete === 'function') {
                  const stateAfterMissionCompletion = missionCopy.onComplete(newState); 
                  newState.startupScore = stateAfterMissionCompletion.startupScore;
                  newState.financials.cashOnHand = stateAfterMissionCompletion.financials.cashOnHand;
                  newState.rewards = stateAfterMissionCompletion.rewards.map(r => ({...r})); 
                }
                newState.keyEvents.push(`Mission Completed: ${missionCopy.title}! Reward: ${missionCopy.rewardText}`);
                missionCopy.isCompleted = true;
              }
              return missionCopy;
            });
            newState.missions = updatedMissions;

            return newState;
          });

        } catch (error) {
          console.error("Error during AI month simulation:", error);
          set(state => ({
            ...state,
            keyEvents: [...state.keyEvents, `Error: AI simulation for month ${state.simulationMonth + 1} failed. Please try again.`]
          }));
        }
      },

      resetSimulation: () => {
        set(state => ({
            ...getInitialState(), 
            missions: exampleMissions.map(m => ({...m, isCompleted: false})),
            keyEvents: ["Simulation reset. Please initialize a new venture."],
        }));
      }
    }),
    {
      name: 'simulation-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedStateUnknown, currentState) => {
        let mergedState = { ...currentState, ...(persistedStateUnknown as object) as Partial<DigitalTwinState> };
        const persistedState = persistedStateUnknown as Partial<DigitalTwinState>;

        if (persistedState && Array.isArray(persistedState.missions)) {
          mergedState.missions = exampleMissions.map(em => {
            const pMission = persistedState.missions?.find(pm => pm.id === em.id);
            return {
              ...em, 
              isCompleted: pMission ? pMission.isCompleted : false, 
            };
          });
        } else {
          mergedState.missions = exampleMissions.map(em => ({ ...em, isCompleted: false }));
        }
        
        mergedState.initialGoals = Array.isArray(mergedState.initialGoals) ? mergedState.initialGoals : [];
        mergedState.suggestedChallenges = Array.isArray(mergedState.suggestedChallenges) ? mergedState.suggestedChallenges : [];
        mergedState.historicalRevenue = Array.isArray(mergedState.historicalRevenue) ? mergedState.historicalRevenue : [];
        mergedState.historicalUserGrowth = Array.isArray(mergedState.historicalUserGrowth) ? mergedState.historicalUserGrowth : [];
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
            if (!validStages.includes(mergedState.product.stage)) {
                if (String(mergedState.product.stage).toLowerCase() === 'concept') {
                    mergedState.product.stage = 'idea';
                } else {
                    console.warn(`Invalid product stage "${mergedState.product.stage}" during merge. Defaulting to "idea".`);
                    mergedState.product.stage = 'idea';
                }
            }
        } else { // If mergedState.product is somehow undefined
             mergedState.product = { ...initialBaseState.product };
        }

        return mergedState as DigitalTwinState;
      },
    }
  )
);
