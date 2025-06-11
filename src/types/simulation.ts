
import {z} from 'genkit';

export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  burnRate: number;
  cashOnHand: number;
  fundingRaised: number;
  estimatedMonthlyBurnRate?: number; // From AI prompt
  currencyCode: string; // e.g., "USD", "EUR"
  currencySymbol: string; // e.g., "$", "€"
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
  initialGoals: string[];
  suggestedChallenges: string[];
  isInitialized: boolean;

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

export interface AIInitialConditions {
  market?: {
    estimatedSize?: number;
    growthRate?: number;
    keySegments?: string[] | string;
  };
  resources?: {
    initialFunding?: number | string;
    coreTeam?: string | TeamMember[];
    initialIpOrAssets?: string;
    marketingSpend?: number | string;
    rndSpend?: number | string;
  };
  productService?: {
    initialDevelopmentStage?: string;
    name?: string;
  };
  financials?: {
    startingCash?: number | string;
    estimatedInitialMonthlyBurnRate?: number | string;
    currencyCode?: string; // AI can suggest or confirm
  };
  initialGoals?: string[] | string;
  companyName?: string;
}

export const AccountantToolInputZodSchema = z.object({
  simulationMonth: z.number().optional().describe("The current month of the simulation."),
  cashOnHand: z.number().optional().describe("Current cash on hand for the startup."),
  burnRate: z.number().optional().describe("Current monthly burn rate."),
  monthlyRevenue: z.number().optional().describe("Current monthly revenue."),
  monthlyExpenses: z.number().optional().describe("Current monthly expenses."),
  currencySymbol: z.string().optional().describe("The currency symbol for financial figures (e.g., $)."),
});
export type AccountantToolInput = z.infer<typeof AccountantToolInputZodSchema>;

export const AccountantToolOutputZodSchema = z.object({
  summary: z.string().describe("A brief financial health check or insight from the AI accountant, using the provided currency symbol."),
});
export type AccountantToolOutput = z.infer<typeof AccountantToolOutputZodSchema>;
