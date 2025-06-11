
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DigitalTwinState, Mission, Reward, AIInitialConditions, RevenueDataPoint, UserDataPoint, TeamMember } from '@/types/simulation';
import type { PromptStartupOutput } from '@/ai/flows/prompt-startup';

const MOCK_PRICE_PER_USER_PER_MONTH = 10;
const MOCK_NEW_USERS_PER_MARKETING_DOLLAR = 0.1;
const MOCK_SALARY_PER_FOUNDER = 0;
const MOCK_SALARY_PER_EMPLOYEE = 4000;
const MOCK_OTHER_OPERATIONAL_COSTS = 1500;
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
    customerAcquisitionCost: 20,
    churnRate: 0.05,
    monthlyRecurringRevenue: 0,
  },
  product: {
    name: "Unnamed Product/Service",
    stage: 'idea',
    features: ["Core Concept"],
    developmentProgress: 0,
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
  initialGoals: [],
  isInitialized: false,
};

// Define exampleMissions with functions criteria and onComplete
// This will be the source of truth for mission logic
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
  missions: exampleMissions.map(m => ({...m, isCompleted: false})), // Ensure functions are copied
  rewards: [],
  initialGoals: [],
  suggestedChallenges: [],
  historicalRevenue: [],
  historicalUserGrowth: [],
});

interface SimulationActions {
  initializeSimulation: (aiOutput: PromptStartupOutput, userStartupName: string, userTargetMarket: string, userBudget: string, userCurrencyCode: string) => void;
  advanceMonth: () => void;
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
            console.warn("AI provided coreTeam as a string, using default founder setup:", parsedConditions.resources.coreTeam);
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

        const rawGoals = parsedConditions.initialGoals;
        let processedInitialGoals: string[] = [];
        if (Array.isArray(rawGoals)) {
          processedInitialGoals = rawGoals.filter((g): g is string => typeof g === 'string');
        } else if (typeof rawGoals === 'string' && rawGoals.trim() !== '') {
          processedInitialGoals = [rawGoals];
        } else {
          processedInitialGoals = []; // Ensure it's always an array
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
            stage: (parsedConditions.productService?.initialDevelopmentStage?.toLowerCase() as DigitalTwinState['product']['stage']) || 'idea',
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
          keyEvents: [`Simulation initialized for ${parsedConditions.companyName || userStartupName} with budget ${finalCurrencySymbol}${initialBudgetNum.toLocaleString()}. Target: ${userTargetMarket}. AI Challenges: ${processedSuggestedChallenges.join(', ') || 'None'}`],
          missions: exampleMissions.map(m => ({...m, isCompleted: false})), // Fresh missions with functions
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
            console.warn("Cannot remove all founders.");
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

      advanceMonth: () => set(state => {
        if (!state.isInitialized || state.financials.cashOnHand <= 0) return state; 

        // Create a deep copy of the current state for modification
        const newState: DigitalTwinState = JSON.parse(JSON.stringify(state));
        
        // Re-attach mission functions to newState.missions because JSON.parse(JSON.stringify(state)) strips them
        newState.missions = state.missions.map(persistedMission => {
            const example = exampleMissions.find(em => em.id === persistedMission.id);
            return example ? { ...example, isCompleted: persistedMission.isCompleted } : persistedMission;
        }) as Mission[];


        newState.simulationMonth = state.simulationMonth + 1;

        const newUsersFromMarketing = Math.floor(newState.resources.marketingSpend * MOCK_NEW_USERS_PER_MARKETING_DOLLAR);
        const churnedUsers = Math.floor(newState.userMetrics.activeUsers * newState.userMetrics.churnRate);
        newState.userMetrics.activeUsers = Math.max(0, newState.userMetrics.activeUsers + newUsersFromMarketing - churnedUsers);
        newState.userMetrics.newUserAcquisitionRate = newUsersFromMarketing;

        newState.userMetrics.monthlyRecurringRevenue = newState.userMetrics.activeUsers * MOCK_PRICE_PER_USER_PER_MONTH;
        newState.financials.revenue = newState.userMetrics.monthlyRecurringRevenue;

        let monthlySalaries = 0;
        newState.resources.team.forEach(tm => {
          monthlySalaries += tm.count * tm.salary;
        });
        newState.financials.expenses = monthlySalaries + newState.resources.marketingSpend + newState.resources.rndSpend + MOCK_OTHER_OPERATIONAL_COSTS;
        
        newState.financials.profit = newState.financials.revenue - newState.financials.expenses;
        newState.financials.cashOnHand += newState.financials.profit;
        newState.financials.burnRate = newState.financials.expenses > newState.financials.revenue ? newState.financials.expenses - newState.financials.revenue : 0;

        if (newState.product.stage !== 'mature') {
          newState.product.developmentProgress += Math.floor(newState.resources.rndSpend / 500); 
          if (newState.product.developmentProgress >= 100) {
            newState.product.developmentProgress = 0; 
            const stages: DigitalTwinState['product']['stage'][] = ['idea', 'prototype', 'mvp', 'growth', 'mature'];
            const currentStageIndex = stages.indexOf(newState.product.stage);
            if (currentStageIndex < stages.length - 1) {
              newState.product.stage = stages[currentStageIndex + 1];
              newState.keyEvents.push(`Product advanced to ${newState.product.stage} stage!`);
            } else {
              newState.product.stage = 'mature';
               newState.keyEvents.push(`Product has reached maturity!`);
            }
          }
        }
        
        const previousProfit = state.financials.profit; 
        if (newState.financials.profit > 0 && newState.financials.profit > (previousProfit || 0)) newState.startupScore += 2;
        else if (newState.financials.profit < 0 && newState.financials.cashOnHand > 0) newState.startupScore -=1;

        const previousNewUserRate = state.userMetrics.newUserAcquisitionRate;
        if (newUsersFromMarketing > (previousNewUserRate || 0) && newUsersFromMarketing > 0) newState.startupScore += 1;
        
        if (newState.financials.cashOnHand <= 0 && state.financials.cashOnHand > 0) { 
          newState.startupScore = Math.max(0, newState.startupScore - 20); 
          newState.keyEvents.push(`Critical: Ran out of cash! Simulation unstable. All values in ${newState.financials.currencySymbol}.`);
        }
        newState.startupScore = Math.max(0, Math.min(100, newState.startupScore));


        newState.keyEvents.push(`Month ${newState.simulationMonth}: Revenue ${newState.financials.currencySymbol}${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash ${newState.financials.currencySymbol}${newState.financials.cashOnHand.toLocaleString()}`);
        
        const newRevenueData: RevenueDataPoint = { month: `M${newState.simulationMonth}`, revenue: newState.financials.revenue, desktop: newState.financials.revenue };
        newState.historicalRevenue.push(newRevenueData);
        if (newState.historicalRevenue.length > 12) newState.historicalRevenue.shift();


        const newUserGrowthData: UserDataPoint = { month: `M${newState.simulationMonth}`, users: newState.userMetrics.activeUsers, desktop: newState.userMetrics.activeUsers };
        newState.historicalUserGrowth.push(newUserGrowthData);
        if (newState.historicalUserGrowth.length > 12) newState.historicalUserGrowth.shift();
        
        // Process missions
        const originalMissionsFromState = newState.missions; // These now have functions attached
        const updatedMissions = originalMissionsFromState.map(mission => {
          let missionCopy = {...mission}; // Create a mutable copy for this iteration
          if (!missionCopy.isCompleted && missionCopy.criteria && typeof missionCopy.criteria === 'function' && missionCopy.criteria(newState)) {
            if (missionCopy.onComplete && typeof missionCopy.onComplete === 'function') {
              const stateAfterMissionCompletion = missionCopy.onComplete(newState);
              
              // Update critical parts of newState directly from mission's onComplete logic
              newState.startupScore = stateAfterMissionCompletion.startupScore;
              newState.financials.cashOnHand = stateAfterMissionCompletion.financials.cashOnHand;
              // Rewards are appended within onComplete, so ensure newState.rewards is correctly updated
              // This assumes onComplete correctly returns the entire rewards array
              newState.rewards = stateAfterMissionCompletion.rewards.map(r => ({...r})); 
            }
            newState.keyEvents.push(`Mission Completed: ${missionCopy.title}! Reward: ${missionCopy.rewardText}`);
            missionCopy.isCompleted = true; // Mark this copy as completed
          }
          return missionCopy; // Return the (potentially) updated mission copy
        });
        newState.missions = updatedMissions; // Assign the array of updated mission copies back to newState

        return newState;
      }),

      resetSimulation: () => {
        set(state => ({
            ...getInitialState(), 
            missions: exampleMissions.map(m => ({...m, isCompleted: false})), // Ensure fresh missions with functions
            keyEvents: ["Simulation reset. Please initialize a new venture."],
        }));
      }
    }),
    {
      name: 'simulation-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedStateUnknown, currentState) => {
        // Default merge behavior for most of the state
        // Ensures that properties from persistedState override currentState if they exist
        let mergedState = { ...currentState, ...(persistedStateUnknown as object) as Partial<DigitalTwinState> };

        // Custom merge for missions to re-attach functions
        const persistedState = persistedStateUnknown as Partial<DigitalTwinState>;

        if (persistedState && Array.isArray(persistedState.missions)) {
          mergedState.missions = exampleMissions.map(em => {
            const pMission = persistedState.missions?.find(pm => pm.id === em.id);
            return {
              ...em, // Get functions and default texts from exampleMissions (title, desc, rewardText, criteria, onComplete)
              isCompleted: pMission ? pMission.isCompleted : false, // Override isCompleted from persisted data
            };
          });
        } else {
          // If no persisted missions or malformed, use fresh ones from exampleMissions
          mergedState.missions = exampleMissions.map(em => ({ ...em, isCompleted: false }));
        }
        
        // Ensure initialGoals and suggestedChallenges are always arrays after rehydration
        mergedState.initialGoals = Array.isArray(mergedState.initialGoals) ? mergedState.initialGoals : [];
        mergedState.suggestedChallenges = Array.isArray(mergedState.suggestedChallenges) ? mergedState.suggestedChallenges : [];
        
        // Ensure historical data are arrays
        mergedState.historicalRevenue = Array.isArray(mergedState.historicalRevenue) ? mergedState.historicalRevenue : [];
        mergedState.historicalUserGrowth = Array.isArray(mergedState.historicalUserGrowth) ? mergedState.historicalUserGrowth : [];
        mergedState.keyEvents = Array.isArray(mergedState.keyEvents) ? mergedState.keyEvents : ["Simulation state rehydrated."];
        mergedState.rewards = Array.isArray(mergedState.rewards) ? mergedState.rewards : [];


        // Ensure financials always has currencyCode and currencySymbol
        if (!mergedState.financials || !mergedState.financials.currencyCode) {
            mergedState.financials = {
                ...initialBaseState.financials, // Fallback to defaults
                ...(mergedState.financials || {}), // Apply any persisted financial details
                currencyCode: (mergedState.financials?.currencyCode || initialBaseState.financials.currencyCode),
                currencySymbol: getCurrencySymbol(mergedState.financials?.currencyCode || initialBaseState.financials.currencyCode),
            };
        } else if (!mergedState.financials.currencySymbol) {
             mergedState.financials.currencySymbol = getCurrencySymbol(mergedState.financials.currencyCode);
        }


        return mergedState as DigitalTwinState; // Return type is just the state, not actions
      },
    }
  )
);

    