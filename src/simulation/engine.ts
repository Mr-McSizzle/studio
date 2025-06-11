
// This file can be used for more complex, pure simulation logic functions
// that might be called by the Zustand store actions, or for defining constants.
// For now, most of the core logic has been moved into the Zustand store (src/store/simulationStore.ts)
// to keep state and its manipulation closely tied.

import type { DigitalTwinState, AIInitialConditions } from '@/types/simulation';

// This initial state is now primarily managed within the Zustand store.
// It's kept here as a reference or for utility functions if needed.
export const initialReferenceDigitalTwinState: Omit<DigitalTwinState, 'missions' | 'rewards' | 'keyEvents' | 'historicalRevenue' | 'historicalUserGrowth' | 'suggestedChallenges' | 'isInitialized'> = {
  simulationMonth: 0,
  companyName: "Your New Venture",
  financials: {
    revenue: 0,
    expenses: 5000,
    profit: -5000,
    burnRate: 5000,
    cashOnHand: 50000,
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
    marketingSpend: 1000,
    rndSpend: 1000,
    team: [{ role: 'Founder', count: 1, salary: 0 }],
  },
  market: {
    targetMarketDescription: "Not yet defined.",
    marketSize: 100000,
    competitionLevel: 'moderate',
  },
  startupScore: 10,
  initialGoals: [],
};


/**
 * Placeholder or utility function to help adapt AI prompt output.
 * The primary logic for this is now within the Zustand store's
 * initializeSimulation action.
 */
export function adaptAIOutputToState(
  aiOutput: AIInitialConditions,
  currentPartialState: Partial<DigitalTwinState>
): Partial<DigitalTwinState> {
  const adaptedState: Partial<DigitalTwinState> = { ...currentPartialState };

  if (aiOutput.companyName) {
    adaptedState.companyName = aiOutput.companyName;
  }

  if (aiOutput.market) {
    adaptedState.market = {
      ...initialReferenceDigitalTwinState.market, // Start with defaults
      ...adaptedState.market, // Apply any existing adaptations
      marketSize: aiOutput.market.estimatedSize || initialReferenceDigitalTwinState.market.marketSize,
      marketGrowthRate: aiOutput.market.growthRate,
      keySegments: typeof aiOutput.market.keySegments === 'string' ? [aiOutput.market.keySegments] : aiOutput.market.keySegments,
    };
  }

  // ... and so on for other fields like resources, product, financials
  // This function can be expanded if complex adaptation logic is needed outside the store.

  return adaptedState;
}

// Any other complex simulation helper functions could go here.
// For example, detailed market simulation, competitor actions, etc.
// These would be pure functions taking state and parameters, returning new state aspects.
