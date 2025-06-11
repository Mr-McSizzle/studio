
export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  burnRate: number;
  cashOnHand: number;
  fundingRaised: number;
  estimatedMonthlyBurnRate?: number; // From AI prompt
}

export interface UserMetrics {
  activeUsers: number;
  newUserAcquisitionRate: number; // e.g., users per month
  customerAcquisitionCost: number;
  churnRate: number; // percentage
  monthlyRecurringRevenue: number;
}

export interface ProductDetails {
  name: string;
  stage: 'idea' | 'prototype' | 'mvp' | 'growth' | 'mature';
  features: string[];
  developmentProgress: number; // 0-100
  initialDevelopmentStage?: string; // From AI prompt
}

export interface TeamMember {
  role: string;
  count: number;
  salary: number; // Assuming monthly salary for simulation calculations
}

export interface Resources {
  initialBudget: number;
  marketingSpend: number; // monthly
  rndSpend: number; // monthly
  team: TeamMember[];
  initialTeamSetup?: string | TeamMember[]; // From AI prompt, could be descriptive or structured
  initialIpOrAssets?: string; // From AI prompt
}

export interface MarketConditions {
  targetMarketDescription: string;
  marketSize: number; // Estimated size
  competitionLevel: 'low' | 'moderate' | 'high';
  marketGrowthRate?: number; // From AI prompt
  keySegments?: string[]; // From AI prompt
}

// For chart data
export interface MonthlyDataPoint {
  month: string; // e.g., "M1", "M2" or "Jan", "Feb"
  value: number; 
  desktop?: number; // for recharts compatibility if needed
}
export interface RevenueDataPoint {
  month: string;
  revenue: number;
  desktop?: number;
}
export interface UserDataPoint {
  month: string;
  users: number;
  desktop?: number;
}


export interface DigitalTwinState {
  simulationMonth: number;
  companyName: string;
  financials: FinancialMetrics;
  userMetrics: UserMetrics;
  product: ProductDetails;
  resources: Resources;
  market: MarketConditions;
  startupScore: number;
  keyEvents: string[];
  missions: Mission[];
  rewards: Reward[];
  initialGoals?: string[]; // From AI prompt
  suggestedChallenges?: string[]; // From AI prompt from the setup flow
  isInitialized: boolean; // Flag to check if simulation has been set up

  // Historical data for charts
  historicalRevenue: RevenueDataPoint[];
  historicalUserGrowth: UserDataPoint[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  rewardText: string;
  criteria: (state: DigitalTwinState) => boolean;
  onComplete?: (state: DigitalTwinState) => DigitalTwinState;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  dateEarned: string; // ISO date string
}

// Structure expected from the AI's initialConditions JSON string
export interface AIInitialConditions {
  market?: {
    estimatedSize?: number;
    growthRate?: number;
    keySegments?: string[] | string;
  };
  resources?: {
    initialFunding?: number | string; // Can be string like "$50,000"
    coreTeam?: string | TeamMember[]; // Can be descriptive string or array
    initialIpOrAssets?: string;
  };
  productService?: { // Note: key might differ slightly, be flexible
    initialDevelopmentStage?: string;
    name?: string;
  };
  financials?: {
    startingCash?: number | string; // Can be string
    estimatedInitialMonthlyBurnRate?: number | string; // Can be string
  };
  initialGoals?: string[];
  companyName?: string; // AI might suggest a name
}
