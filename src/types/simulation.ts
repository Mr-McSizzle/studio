
export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  burnRate: number;
  cashOnHand: number;
  fundingRaised: number;
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
}

export interface TeamMember {
  role: string;
  count: number;
  salary: number;
}

export interface Resources {
  initialBudget: number;
  marketingSpend: number; // monthly
  rndSpend: number; // monthly
  team: TeamMember[];
}

export interface MarketConditions {
  targetMarketDescription: string;
  marketSize: number;
  competitionLevel: 'low' | 'moderate' | 'high';
}

export interface DigitalTwinState {
  simulationMonth: number; // 0 for initial setup, 1 for first month, etc.
  companyName: string;
  financials: FinancialMetrics;
  userMetrics: UserMetrics;
  product: ProductDetails;
  resources: Resources;
  market: MarketConditions;
  startupScore: number;
  keyEvents: string[]; // Log of significant events
  missions: Mission[];
  rewards: Reward[];
}

// Re-using Mission and Reward types for consistency if possible
export interface Mission {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  rewardText: string; // Text description of reward
  criteria: (state: DigitalTwinState) => boolean; // Function to check if mission is complete
  onComplete?: (state: DigitalTwinState) => DigitalTwinState; // Optional: Function to apply reward
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  dateEarned: string; // ISO date string
}
