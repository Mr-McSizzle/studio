
import type { DigitalTwinState, FinancialMetrics, UserMetrics, ProductDetails, Resources, MarketConditions } from '@/types/simulation';

export const initialDigitalTwinState: DigitalTwinState = {
  simulationMonth: 0,
  companyName: "Your New Venture",
  financials: {
    revenue: 0,
    expenses: 5000, // Basic operational costs
    profit: -5000,
    burnRate: 5000,
    cashOnHand: 50000, // From initial budget
    fundingRaised: 50000,
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
    developmentProgress: 10,
  },
  resources: {
    initialBudget: 50000,
    marketingSpend: 1000, // Default starting marketing spend
    rndSpend: 1000,      // Default starting R&D spend
    team: [{ role: 'Founder', count: 1, salary: 0 }],
  },
  market: {
    targetMarketDescription: "Not yet defined.",
    marketSize: 100000,
    competitionLevel: 'moderate',
  },
  startupScore: 10,
  keyEvents: ["Simulation initialized."],
  missions: [],
  rewards: [],
};

const MOCK_PRICE_PER_USER_PER_MONTH = 10;
const MOCK_NEW_USERS_PER_MARKETING_DOLLAR = 0.1; // Highly simplified
const MOCK_SALARY_PER_TEAM_MEMBER = 3000; // Simplified

export function advanceMonth(currentState: DigitalTwinState): DigitalTwinState {
  const newState = JSON.parse(JSON.stringify(currentState)) as DigitalTwinState; // Deep copy

  newState.simulationMonth += 1;

  // 1. User Acquisition (very basic)
  const newUsersFromMarketing = Math.floor(newState.resources.marketingSpend * MOCK_NEW_USERS_PER_MARKETING_DOLLAR);
  const churnedUsers = Math.floor(newState.userMetrics.activeUsers * newState.userMetrics.churnRate);
  newState.userMetrics.activeUsers += newUsersFromMarketing - churnedUsers;
  if (newState.userMetrics.activeUsers < 0) newState.userMetrics.activeUsers = 0;
  newState.userMetrics.newUserAcquisitionRate = newUsersFromMarketing; // For this month

  // 2. Revenue
  newState.userMetrics.monthlyRecurringRevenue = newState.userMetrics.activeUsers * MOCK_PRICE_PER_USER_PER_MONTH;
  newState.financials.revenue = newState.userMetrics.monthlyRecurringRevenue; // For this month

  // 3. Expenses
  let monthlySalaries = 0;
  newState.resources.team.forEach(tm => {
    monthlySalaries += tm.count * tm.salary;
  });
  // Add other fixed costs if any, marketing, R&D
  const otherOperationalCosts = 2000; // e.g. rent, utilities, software
  newState.financials.expenses = monthlySalaries + newState.resources.marketingSpend + newState.resources.rndSpend + otherOperationalCosts;
  
  // 4. Financials update
  newState.financials.profit = newState.financials.revenue - newState.financials.expenses;
  newState.financials.cashOnHand += newState.financials.profit;
  newState.financials.burnRate = newState.financials.expenses > newState.financials.revenue ? newState.financials.expenses - newState.financials.revenue : 0;

  // 5. Product Development (simple progress)
  if (newState.product.stage !== 'mature') {
    newState.product.developmentProgress += Math.floor(newState.resources.rndSpend / 500); // 5% progress per 500 spend
    if (newState.product.developmentProgress >= 100) {
      newState.product.developmentProgress = 100;
      // Potentially advance product stage here based on logic
      if (newState.product.stage === 'idea') newState.product.stage = 'prototype';
      else if (newState.product.stage === 'prototype') newState.product.stage = 'mvp';
      // etc.
      newState.keyEvents.push(`Product reached 100% progress for ${newState.product.stage} stage.`);
    }
  }
  
  // 6. Startup Score (very basic placeholder)
  if (newState.financials.profit > 0) newState.startupScore += 2;
  if (newUsersFromMarketing > 10) newState.startupScore += 1;
  if (newState.financials.cashOnHand <= 0) {
    newState.startupScore -=10;
    newState.keyEvents.push("Ran out of cash! Game Over (simulated).");
     // Potentially end simulation here
  }


  newState.keyEvents.push(`Advanced to month ${newState.simulationMonth}. Revenue: $${newState.financials.revenue}, Users: ${newState.userMetrics.activeUsers}`);

  return newState;
}

// Placeholder for when user inputs their startup details
export function initializeFromPrompt(companyName: string, initialBudget: number, targetMarket: string): DigitalTwinState {
  const initialState = JSON.parse(JSON.stringify(initialDigitalTwinState)) as DigitalTwinState;
  initialState.companyName = companyName;
  initialState.resources.initialBudget = initialBudget;
  initialState.financials.cashOnHand = initialBudget;
  initialState.financials.fundingRaised = initialBudget;
  initialState.market.targetMarketDescription = targetMarket;
  initialState.keyEvents = [`${companyName} simulation initialized with budget $${initialBudget} targeting ${targetMarket}.`];
  return initialState;
}
