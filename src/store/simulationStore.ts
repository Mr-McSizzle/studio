
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DigitalTwinState, Mission, Reward, AIInitialConditions, RevenueDataPoint, UserDataPoint, TeamMember } from '@/types/simulation';
import type { PromptStartupOutput } from '@/ai/flows/prompt-startup';

const MOCK_PRICE_PER_USER_PER_MONTH = 10;
const MOCK_NEW_USERS_PER_MARKETING_DOLLAR = 0.1;
const MOCK_SALARY_PER_FOUNDER = 0; // Founders often don't take salaries initially
const MOCK_SALARY_PER_EMPLOYEE = 4000; // Simplified average for non-founders
const MOCK_OTHER_OPERATIONAL_COSTS = 1500; // Rent, utilities, software etc.
const DEFAULT_ENGINEER_SALARY = 5000;

const initialBaseState: Omit<DigitalTwinState, 'missions' | 'rewards' | 'keyEvents' | 'historicalRevenue' | 'historicalUserGrowth' | 'suggestedChallenges'> = {
  simulationMonth: 0,
  companyName: "Your New Venture",
  financials: {
    revenue: 0,
    expenses: MOCK_OTHER_OPERATIONAL_COSTS,
    profit: -MOCK_OTHER_OPERATIONAL_COSTS,
    burnRate: MOCK_OTHER_OPERATIONAL_COSTS,
    cashOnHand: 0, // Will be set by initial budget
    fundingRaised: 0,
  },
  userMetrics: {
    activeUsers: 0,
    newUserAcquisitionRate: 0,
    customerAcquisitionCost: 20, // Example default
    churnRate: 0.05, // Example default 5%
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
    marketingSpend: 500, // Default starting
    rndSpend: 500, // Default starting
    team: [{ role: 'Founder', count: 1, salary: MOCK_SALARY_PER_FOUNDER }],
  },
  market: {
    targetMarketDescription: "Not yet defined.",
    marketSize: 100000, // Example default
    competitionLevel: 'moderate',
  },
  startupScore: 10,
  initialGoals: [], // Now guaranteed to be string[]
  isInitialized: false,
};

// Define exampleMissions before getInitialState
const exampleMissions: Mission[] = [
  {
    id: "reach-100-users",
    title: "Acquire First 100 Users",
    description: "Reach 100 active users for your product.",
    rewardText: "+5 Startup Score, $1,000 Cash Bonus",
    isCompleted: false,
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
    isCompleted: false,
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
    isCompleted: false,
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
  missions: exampleMissions.map(m => ({...m, isCompleted: false})), // Initialize with functions
  rewards: [],
  initialGoals: [], // Now guaranteed to be string[]
  suggestedChallenges: [],
  historicalRevenue: [],
  historicalUserGrowth: [],
});

interface SimulationActions {
  initializeSimulation: (aiOutput: PromptStartupOutput, userStartupName: string, userTargetMarket: string, userBudget: string) => void;
  advanceMonth: () => void;
  resetSimulation: () => void;
  setMarketingSpend: (amount: number) => void;
  setRndSpend: (amount: number) => void;
  adjustTeamMemberCount: (roleToAdjust: string, change: number, salaryPerMember?: number) => void;
}

const parseMonetaryValue = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleanedValue = value.replace(/\$|,/g, '').toLowerCase();
    if (cleanedValue.endsWith('k')) {
      return parseFloat(cleanedValue.replace('k', '')) * 1000;
    }
    return parseFloat(cleanedValue) || 0;
  }
  return 0;
};


export const useSimulationStore = create<DigitalTwinState & SimulationActions>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      initializeSimulation: (aiOutput, userStartupName, userTargetMarket, userBudget) => {
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
            // If it's a string, we might try to parse it or use a default. For now, log and use default.
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
          },
          initialGoals: processedInitialGoals,
          suggestedChallenges: processedSuggestedChallenges,
          keyEvents: [`Simulation initialized for ${parsedConditions.companyName || userStartupName} with budget $${initialBudgetNum.toLocaleString()}. Target: ${userTargetMarket}. AI Challenges: ${processedSuggestedChallenges.join(', ') || 'None'}`],
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

        const newState: DigitalTwinState = {
          ...state,
          simulationMonth: state.simulationMonth + 1,
          financials: { ...state.financials },
          userMetrics: { ...state.userMetrics },
          product: { ...state.product, features: [...state.product.features] },
          resources: { 
            ...state.resources,
            team: state.resources.team.map(member => ({ ...member })),
          },
          market: { ...state.market },
          keyEvents: [...state.keyEvents], 
          historicalRevenue: [...state.historicalRevenue],
          historicalUserGrowth: [...state.historicalUserGrowth],
          rewards: state.rewards.map(reward => ({...reward})),
          missions: state.missions.map(m => ({...m})),
          initialGoals: [...state.initialGoals], // Now safe as state.initialGoals is always string[]
          suggestedChallenges: [...state.suggestedChallenges],  // Assuming this is also always string[]
        };

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
          newState.keyEvents.push("Critical: Ran out of cash! Simulation unstable.");
        }
        newState.startupScore = Math.max(0, Math.min(100, newState.startupScore));


        newState.keyEvents.push(`Month ${newState.simulationMonth}: Revenue $${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash $${newState.financials.cashOnHand.toLocaleString()}`);
        
        const newRevenueData: RevenueDataPoint = { month: `M${newState.simulationMonth}`, revenue: newState.financials.revenue, desktop: newState.financials.revenue };
        newState.historicalRevenue.push(newRevenueData);
        if (newState.historicalRevenue.length > 12) newState.historicalRevenue.shift();


        const newUserGrowthData: UserDataPoint = { month: `M${newState.simulationMonth}`, users: newState.userMetrics.activeUsers, desktop: newState.userMetrics.activeUsers };
        newState.historicalUserGrowth.push(newUserGrowthData);
        if (newState.historicalUserGrowth.length > 12) newState.historicalUserGrowth.shift();
        

        const originalMissions = state.missions; 
        const updatedMissions = originalMissions.map(mission => {
          let missionCopy = { ...mission }; 
          if (!missionCopy.isCompleted && mission.criteria(newState)) { 
            if (missionCopy.onComplete) {
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
      }),

      resetSimulation: () => {
        set(state => ({
            ...getInitialState(),
            missions: exampleMissions.map(m => ({...m, isCompleted: false})),
            keyEvents: ["Simulation reset. Please initialize a new venture."],
        }));
      }
    }),
    {
      name: 'simulation-storage', // Name for localStorage item
      storage: createJSONStorage(() => localStorage),
      // Optional: partialize to only persist certain fields
      // partialize: (state) => ({ ... }), 
    }
  )
);
