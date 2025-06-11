
import { create } from 'zustand';
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
        isInitialized: false,
      }));
      return;
    }

    const initialBudget = parseMonetaryValue(parsedConditions.resources?.initialFunding || userBudget);
    const initialTeam: TeamMember[] = [{ role: 'Founder', count: 1, salary: MOCK_SALARY_PER_FOUNDER }];
    if (parsedConditions.resources?.coreTeam && typeof parsedConditions.resources.coreTeam !== 'string') {
        initialTeam.push(...parsedConditions.resources.coreTeam.map(member => ({...member, salary: member.salary || (member.role.toLowerCase() === 'founder' ? MOCK_SALARY_PER_FOUNDER : MOCK_SALARY_PER_EMPLOYEE) })));
    }


    set(state => ({
      ...initialBaseState,
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
        team: initialTeam,
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
        expenses: parseMonetaryValue(parsedConditions.financials?.estimatedInitialMonthlyBurnRate) || initialBaseState.financials.expenses,
        profit: -(parseMonetaryValue(parsedConditions.financials?.estimatedInitialMonthlyBurnRate) || initialBaseState.financials.expenses),
      },
      initialGoals: parsedConditions.initialGoals || [],
      suggestedChallenges: aiOutput.suggestedChallenges ? JSON.parse(aiOutput.suggestedChallenges) : [],
      keyEvents: [`Simulation initialized for ${parsedConditions.companyName || userStartupName} with budget $${initialBudget}. Target: ${userTargetMarket}. AI Challenges: ${aiOutput.suggestedChallenges ? JSON.parse(aiOutput.suggestedChallenges).join(', ') : 'None'}`],
      missions: exampleMissions.map(m => ({...m, isCompleted: false})), // Reset missions with fresh ones
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
    const team = [...state.resources.team];
    const roleIndex = team.findIndex(member => member.role === roleToAdjust);

    if (roleIndex > -1) {
      const newCount = Math.max(0, team[roleIndex].count + change);
       if (team[roleIndex].role.toLowerCase() === 'founder' && newCount === 0 && change < 0) {
        // Prevent reducing founders to zero if they are the only ones or critical
        // This logic can be more sophisticated. For now, just a simple block for founders.
        console.warn("Cannot remove all founders.");
        return state; // Or adjust to minimum 1 founder
      }
      team[roleIndex] = { ...team[roleIndex], count: newCount };
      if (newCount === 0 && team[roleIndex].role.toLowerCase() !== 'founder') {
        team.splice(roleIndex, 1); // Remove role if count is zero (unless founder)
      }
    } else if (change > 0) { // Add new role type
      team.push({ role: roleToAdjust, count: change, salary: salaryPerMember || (roleToAdjust.toLowerCase() === 'founder' ? MOCK_SALARY_PER_FOUNDER : DEFAULT_ENGINEER_SALARY) });
    }
    return { resources: { ...state.resources, team } };
  }),

  advanceMonth: () => set(state => {
    if (!state.isInitialized || state.financials.cashOnHand <= 0) return state; 

    const newState = JSON.parse(JSON.stringify(state)) as DigitalTwinState; 

    newState.simulationMonth += 1;

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
    
    if (newState.financials.profit > 0 && newState.financials.profit > (state.financials.profit || 0)) newState.startupScore += 2;
    else if (newState.financials.profit < 0 && newState.financials.cashOnHand > 0) newState.startupScore -=1;

    if (newUsersFromMarketing > (state.userMetrics.newUserAcquisitionRate || 0) && newUsersFromMarketing > 0) newState.startupScore += 1;
    
    if (newState.financials.cashOnHand <= 0 && state.financials.cashOnHand > 0) { 
      newState.startupScore = Math.max(0, newState.startupScore - 20); 
      newState.keyEvents.push("Critical: Ran out of cash! Simulation unstable.");
    }
    newState.startupScore = Math.max(0, Math.min(100, newState.startupScore));


    newState.keyEvents.push(`Month ${newState.simulationMonth}: Revenue $${newState.financials.revenue.toLocaleString()}, Users ${newState.userMetrics.activeUsers.toLocaleString()}, Cash $${newState.financials.cashOnHand.toLocaleString()}`);
    
    const newRevenueData: RevenueDataPoint = { month: `M${newState.simulationMonth}`, revenue: newState.financials.revenue, desktop: newState.financials.revenue };
    newState.historicalRevenue = [...state.historicalRevenue, newRevenueData].slice(-12);

    const newUserGrowthData: UserDataPoint = { month: `M${newState.simulationMonth}`, users: newState.userMetrics.activeUsers, desktop: newState.userMetrics.activeUsers };
    newState.historicalUserGrowth = [...state.historicalUserGrowth, newUserGrowthData].slice(-12);

    const updatedMissions = newState.missions.map(mission => {
      if (!mission.isCompleted && mission.criteria(newState)) {
        // Apply onComplete mutations directly to newState
        const preCompletionState = JSON.parse(JSON.stringify(newState)); // For safety if onComplete is complex
        const potentiallyModifiedState = mission.onComplete ? mission.onComplete(preCompletionState) : preCompletionState;
        
        // Merge changes from onComplete back to newState carefully
        newState.startupScore = potentiallyModifiedState.startupScore;
        newState.financials.cashOnHand = potentiallyModifiedState.financials.cashOnHand;
        newState.rewards = potentiallyModifiedState.rewards;
        // Add other fields if onComplete modifies them

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

const exampleMissions: Mission[] = [
  {
    id: "reach-100-users",
    title: "Acquire First 100 Users",
    description: "Reach 100 active users for your product.",
    rewardText: "+5 Startup Score, $1,000 Cash Bonus",
    isCompleted: false,
    criteria: (currentState) => currentState.userMetrics.activeUsers >= 100,
    onComplete: (currentState) => {
      const newState = JSON.parse(JSON.stringify(currentState));
      newState.startupScore = Math.min(100, newState.startupScore + 5);
      newState.financials.cashOnHand += 1000; 
      newState.rewards.push({ id: 'reward-100-users', name: '100 User Milestone', description: 'Achieved 100 active users.', dateEarned: new Date().toISOString() });
      return newState;
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
      const newState = JSON.parse(JSON.stringify(currentState));
      newState.startupScore = Math.min(100, newState.startupScore + 10);
      newState.rewards.push({ id: 'reward-first-profit', name: 'First Profit!', description: 'Recorded a profitable month.', dateEarned: new Date().toISOString() });
      return newState;
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
      const newState = JSON.parse(JSON.stringify(currentState));
      newState.startupScore = Math.min(100, newState.startupScore + 10);
      newState.rewards.push({ id: 'reward-mvp-launch', name: 'MVP Launched!', description: 'Successfully reached MVP stage.', dateEarned: new Date().toISOString() });
      // Conceptual: Could add a flag here that `advanceMonth` uses to make R&D more effective
      return newState;
    }
  }
];

// Initialize store with example missions
// This needs to happen after the store is created.
// It's okay for this to be outside the create call as it's setting initial non-dynamic data.
// Ensure missions are reset properly in initializeSimulation.
// useSimulationStore.setState(state => ({
//   ...state,
//   missions: exampleMissions
// }));
// Moved mission initialization into initializeSimulation for better reset behavior.

