
import { create } from 'zustand';
import type { DigitalTwinState, Mission, Reward, AIInitialConditions, RevenueDataPoint, UserDataPoint } from '@/types/simulation';
import type { PromptStartupOutput } from '@/ai/flows/prompt-startup';

const MOCK_PRICE_PER_USER_PER_MONTH = 10;
const MOCK_NEW_USERS_PER_MARKETING_DOLLAR = 0.1;
const MOCK_SALARY_PER_FOUNDER = 0; // Founders often don't take salaries initially
const MOCK_SALARY_PER_EMPLOYEE = 4000; // Simplified average
const MOCK_OTHER_OPERATIONAL_COSTS = 1500; // Rent, utilities, software etc.

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
  initialGoals: [],
  isInitialized: false,
};

const getInitialState = (): DigitalTwinState => ({
  ...initialBaseState,
  keyEvents: ["Simulation not yet initialized."],
  missions: [],
  rewards: [],
  suggestedChallenges: [],
  historicalRevenue: [],
  historicalUserGrowth: [],
});

interface SimulationActions {
  initializeSimulation: (aiOutput: PromptStartupOutput, userStartupName: string, userTargetMarket: string, userBudget: string) => void;
  advanceMonth: () => void;
  resetSimulation: () => void;
  // TODO: Add actions for updating marketingSpend, rndSpend, hiring, etc.
}

// Helper to parse monetary values like "$50,000" or "50k"
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


export const useSimulationStore = create<DigitalTwinState & SimulationActions>((set, get) => ({
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
        isInitialized: false, // Mark as not truly initialized
      }));
      return; // Exit if parsing fails
    }

    const initialBudget = parseMonetaryValue(parsedConditions.resources?.initialFunding || userBudget);

    set(state => ({
      ...initialBaseState, // Reset to base then apply new values
      companyName: parsedConditions.companyName || userStartupName || "AI Suggested Venture",
      market: {
        ...initialBaseState.market,
        targetMarketDescription: userTargetMarket,
        marketSize: parsedConditions.market?.estimatedSize || initialBaseState.market.marketSize,
        marketGrowthRate: parsedConditions.market?.growthRate,
        keySegments: typeof parsedConditions.market?.keySegments === 'string' ? [parsedConditions.market.keySegments] : parsedConditions.market?.keySegments,
      },
      resources: {
        ...initialBaseState.resources,
        initialBudget: initialBudget,
        team: typeof parsedConditions.resources?.coreTeam === 'string' ? [{ role: 'Founder', count: 1, salary: MOCK_SALARY_PER_FOUNDER }] : (parsedConditions.resources?.coreTeam || initialBaseState.resources.team),
        initialIpOrAssets: parsedConditions.resources?.initialIpOrAssets,
      },
      product: {
        ...initialBaseState.product,
        name: parsedConditions.productService?.name || `${userStartupName} Product`,
        stage: (parsedConditions.productService?.initialDevelopmentStage?.toLowerCase() as DigitalTwinState['product']['stage']) || 'idea',
      },
      financials: {
        ...initialBaseState.financials,
        cashOnHand: parseMonetaryValue(parsedConditions.financials?.startingCash) || initialBudget,
        fundingRaised: parseMonetaryValue(parsedConditions.financials?.startingCash) || initialBudget,
        estimatedMonthlyBurnRate: parseMonetaryValue(parsedConditions.financials?.estimatedInitialMonthlyBurnRate),
        // Initial expenses might be based on estimated burn rate if available
        expenses: parseMonetaryValue(parsedConditions.financials?.estimatedInitialMonthlyBurnRate) || initialBaseState.financials.expenses,
        profit: -(parseMonetaryValue(parsedConditions.financials?.estimatedInitialMonthlyBurnRate) || initialBaseState.financials.expenses),

      },
      initialGoals: parsedConditions.initialGoals || [],
      suggestedChallenges: aiOutput.suggestedChallenges ? JSON.parse(aiOutput.suggestedChallenges) : [],
      keyEvents: [`Simulation initialized for ${parsedConditions.companyName || userStartupName} with budget $${initialBudget}. Target: ${userTargetMarket}. AI Challenges: ${aiOutput.suggestedChallenges ? JSON.parse(aiOutput.suggestedChallenges).join(', ') : 'None'}`],
      missions: [], // Reset missions
      rewards: [], // Reset rewards
      historicalRevenue: [],
      historicalUserGrowth: [],
      isInitialized: true,
      simulationMonth: 0, // Explicitly reset month
      startupScore: 10, // Reset score
    }));
  },

  advanceMonth: () => set(state => {
    if (!state.isInitialized) return state; // Don't advance if not initialized

    const newState = JSON.parse(JSON.stringify(state)) as DigitalTwinState; // Deep copy for safety

    newState.simulationMonth += 1;

    // 1. User Acquisition
    const newUsersFromMarketing = Math.floor(newState.resources.marketingSpend * MOCK_NEW_USERS_PER_MARKETING_DOLLAR);
    const churnedUsers = Math.floor(newState.userMetrics.activeUsers * newState.userMetrics.churnRate);
    newState.userMetrics.activeUsers = Math.max(0, newState.userMetrics.activeUsers + newUsersFromMarketing - churnedUsers);
    newState.userMetrics.newUserAcquisitionRate = newUsersFromMarketing;

    // 2. Revenue
    newState.userMetrics.monthlyRecurringRevenue = newState.userMetrics.activeUsers * MOCK_PRICE_PER_USER_PER_MONTH;
    newState.financials.revenue = newState.userMetrics.monthlyRecurringRevenue;

    // 3. Expenses
    let monthlySalaries = 0;
    newState.resources.team.forEach(tm => {
      monthlySalaries += tm.count * (tm.salary || (tm.role.toLowerCase() === 'founder' ? MOCK_SALARY_PER_FOUNDER : MOCK_SALARY_PER_EMPLOYEE));
    });
    newState.financials.expenses = monthlySalaries + newState.resources.marketingSpend + newState.resources.rndSpend + MOCK_OTHER_OPERATIONAL_COSTS;
    
    // 4. Financials update
    newState.financials.profit = newState.financials.revenue - newState.financials.expenses;
    newState.financials.cashOnHand += newState.financials.profit;
    newState.financials.burnRate = newState.financials.expenses > newState.financials.revenue ? newState.financials.expenses - newState.financials.revenue : 0;

    // 5. Product Development
    if (newState.product.stage !== 'mature') {
      newState.product.developmentProgress += Math.floor(newState.resources.rndSpend / 500); // Simplified: 2% progress per 100 spend (assuming 500 gives 1 unit of progress that is 1%)
      if (newState.product.developmentProgress >= 100) {
        newState.product.developmentProgress = 0; // Reset for next stage
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
    
    // 6. Startup Score (very basic placeholder)
    if (newState.financials.profit > 0 && newState.financials.profit > (state.financials.profit || 0)) newState.startupScore += 2;
    else if (newState.financials.profit < 0 && newState.financials.cashOnHand > 0) newState.startupScore -=1;

    if (newUsersFromMarketing > (state.userMetrics.newUserAcquisitionRate || 0) && newUsersFromMarketing > 0) newState.startupScore += 1;
    
    if (newState.financials.cashOnHand <= 0 && state.financials.cashOnHand > 0) { // Only trigger if it just ran out
      newState.startupScore = Math.max(0, newState.startupScore - 20); // Severe penalty
      newState.keyEvents.push("Critical: Ran out of cash! Simulation unstable.");
      // Consider disabling further advancement or specific features
    }
    newState.startupScore = Math.max(0, Math.min(100, newState.startupScore));


    newState.keyEvents.push(`Month ${newState.simulationMonth}: Revenue $${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash $${newState.financials.cashOnHand.toLocaleString()}`);
    
    // Update historical data
    const newRevenueData: RevenueDataPoint = { month: `M${newState.simulationMonth}`, revenue: newState.financials.revenue, desktop: newState.financials.revenue };
    newState.historicalRevenue = [...state.historicalRevenue, newRevenueData].slice(-12); // Keep last 12 months

    const newUserGrowthData: UserDataPoint = { month: `M${newState.simulationMonth}`, users: newState.userMetrics.activeUsers, desktop: newState.userMetrics.activeUsers };
    newState.historicalUserGrowth = [...state.historicalUserGrowth, newUserGrowthData].slice(-12);


    // Check missions
    const updatedMissions = newState.missions.map(mission => {
      if (!mission.isCompleted && mission.criteria(newState)) {
        const missionCompletedState = mission.onComplete ? mission.onComplete(newState) : newState;
        newState.keyEvents.push(`Mission Completed: ${mission.title}! Reward: ${mission.rewardText}`);
        return { ...mission, isCompleted: true };
      }
      return mission;
    });
    newState.missions = updatedMissions;


    return newState;
  }),

  resetSimulation: () => set(getInitialState()),
}));

// Example Missions (can be expanded and moved to a dedicated file)
const exampleMissions: Mission[] = [
  {
    id: "reach-100-users",
    title: "Acquire First 100 Users",
    description: "Reach 100 active users for your product.",
    rewardText: "+5 Startup Score, Small Marketing Budget Boost",
    isCompleted: false,
    criteria: (state) => state.userMetrics.activeUsers >= 100,
    onComplete: (state) => {
      state.startupScore = Math.min(100, state.startupScore + 5);
      state.financials.cashOnHand += 1000; // Marketing boost
      state.rewards.push({ id: 'reward-100-users', name: '100 User Milestone', description: 'Achieved 100 active users.', dateEarned: new Date().toISOString() });
      return state;
    }
  },
  {
    id: "first-profit",
    title: "Achieve First Profitable Month",
    description: "Have a month where revenue exceeds expenses.",
    rewardText: "+10 Startup Score",
    isCompleted: false,
    criteria: (state) => state.financials.profit > 0,
    onComplete: (state) => {
      state.startupScore = Math.min(100, state.startupScore + 10);
      state.rewards.push({ id: 'reward-first-profit', name: 'First Profit!', description: 'Recorded a profitable month.', dateEarned: new Date().toISOString() });
      return state;
    }
  }
];

// Initialize store with example missions (can be done after AI init too)
useSimulationStore.setState(state => ({
  ...state,
  missions: exampleMissions
}));
