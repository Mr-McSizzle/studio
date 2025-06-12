
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
  pricePerUser: number; // Monthly price per user
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

// Generic data point for simple charts
export interface HistoricalDataPoint {
  month: string; // e.g., "M1", "M2"
  value: number;
  desktop?: number; // for recharts compatibility
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

export interface ExpenseBreakdown {
  salaries: number;
  marketing: number;
  rnd: number;
  operational: number; // Other costs
}

export type ExpenseBreakdownDataPoint = ExpenseBreakdown & {
  month: string; // e.g., "M1", "M2"
};


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
  rewards: Reward[];
  initialGoals: string[];
  suggestedChallenges: string[];
  isInitialized: boolean;

  historicalRevenue: RevenueDataPoint[];
  historicalUserGrowth: UserDataPoint[];
  historicalBurnRate: HistoricalDataPoint[];
  historicalNetProfitLoss: HistoricalDataPoint[];
  historicalExpenseBreakdown: ExpenseBreakdownDataPoint[];
}

export const RewardSchema = z.object({
  name: z.string().describe("The name or title of the reward."),
  description: z.string().describe("A brief description of what the reward signifies or provides."),
});
export type Reward = z.infer<typeof RewardSchema> & {
  id: string;
  dateEarned: string; // ISO date string
};


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
    pricePerUser?: number | string;
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


// Schemas for the AI-driven simulation month advancement
const SimulateMonthFinancialsInputSchema = z.object({
  cashOnHand: z.number(),
  currentRevenue: z.number(),
  currentExpenses: z.number(),
  currencyCode: z.string(),
  currencySymbol: z.string(),
});

const SimulateMonthUserMetricsInputSchema = z.object({
  activeUsers: z.number(),
  churnRate: z.number(), // e.g. 0.05 for 5%
});

const SimulateMonthProductInputSchema = z.object({
  stage: z.enum(['idea', 'prototype', 'mvp', 'growth', 'mature']),
  developmentProgress: z.number(), // 0-100
  pricePerUser: z.number(),
});

const SimulateMonthResourcesInputSchema = z.object({
  marketingSpend: z.number(),
  rndSpend: z.number(),
  team: z.array(z.object({
    role: z.string(),
    count: z.number(),
    salary: z.number(),
  })),
});

export const SimulateMonthInputSchema = z.object({
  currentSimulationMonth: z.number().describe("The current month number of the simulation (e.g., month 1, month 2)."),
  companyName: z.string().describe("The name of the company being simulated."),
  financials: SimulateMonthFinancialsInputSchema.describe("Current financial state."),
  userMetrics: SimulateMonthUserMetricsInputSchema.describe("Current user metrics."),
  product: SimulateMonthProductInputSchema.describe("Current product state."),
  resources: SimulateMonthResourcesInputSchema.describe("Current resource allocation."),
  market: z.object({
    competitionLevel: z.enum(['low', 'moderate', 'high']),
    targetMarketDescription: z.string(),
  }).describe("Current market conditions."),
  currentStartupScore: z.number().describe("The current startup score before this month's simulation."),
});
export type SimulateMonthInput = z.infer<typeof SimulateMonthInputSchema>;

const ExpenseBreakdownSchema = z.object({
  salaries: z.number().describe("Total salaries expense for the month."),
  marketing: z.number().describe("Total marketing spend for the month."),
  rnd: z.number().describe("Total R&D spend for the month."),
  operational: z.number().describe("Other operational costs for the month (rent, utilities, software, etc.)."),
});

export const SimulateMonthOutputSchema = z.object({
  simulatedMonthNumber: z.number().describe("The month number that was just simulated (should be currentSimulationMonth + 1)."),
  calculatedRevenue: z.number().describe("Total revenue generated in this simulated month."),
  calculatedExpenses: z.number().describe("Total expenses incurred in this simulated month. This MUST be the sum of the components in expenseBreakdown."),
  expenseBreakdown: ExpenseBreakdownSchema.describe("A breakdown of the total calculated expenses into key categories."),
  profitOrLoss: z.number().describe("Net profit or loss for this month (Revenue - Expenses)."),
  updatedCashOnHand: z.number().describe("Cash on hand at the end of this simulated month."),
  updatedActiveUsers: z.number().describe("Total active users at the end of this simulated month."),
  newUserAcquisition: z.number().describe("Number of new users acquired during this month."),
  productDevelopmentDelta: z.number().describe("The percentage points by which product development progressed this month (e.g., 10 for 10% progress). This will be added to existing progress."),
  newProductStage: z.enum(['idea', 'prototype', 'mvp', 'growth', 'mature']).optional().describe("If the product advanced to a new stage this month, specify the new stage. Otherwise, omit this field."),
  keyEventsGenerated: z.array(z.string()).length(2).describe("An array of exactly two significant, plausible events (positive, negative, or neutral) that occurred during the month. These events can include notable achievements or milestones. Each event is a short descriptive string. E.g., ['Unexpected server outage caused downtime.', 'Positive review in a major tech blog.']"),
  rewardsGranted: z.array(RewardSchema).optional().describe("List of rewards granted this month if a significant milestone was achieved. These rewards should be thematic to the achievement."),
  startupScoreAdjustment: z.number().int().describe("An integer representing the change to the startup score based on this month's performance, achievements, and rewards."),
});
export type SimulateMonthOutput = z.infer<typeof SimulateMonthOutputSchema>;
