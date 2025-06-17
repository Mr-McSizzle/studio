
import {z} from 'genkit';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  agentContextId?: string; // ID to scope messages to a specific agent chat or main EVE chat
}

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


export const RewardSchema = z.object({
  name: z.string().describe("The name or title of the reward."),
  description: z.string().describe("A brief description of what the reward signifies or provides."),
});
export type Reward = z.infer<typeof RewardSchema> & {
  id: string;
  dateEarned: string; // ISO date string
};

// This is the schema for AI output for a single mission
export const GeneratedMissionSchema = z.object({
  title: z.string().describe("The main title or objective of the mission."),
  description: z.string().describe("A brief explanation of what needs to be done."),
  rewardText: z.string().describe("Textual description of the reward upon completion (e.g., '+10 Score, Unlock Feature X')."),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe("Optional difficulty rating."),
});
export type GeneratedMission = z.infer<typeof GeneratedMissionSchema>;


// This is the type stored in the client-side simulation store
export interface Mission extends GeneratedMission {
  id: string;
  isCompleted: boolean;
}


export const KeyEventCategoryEnum = z.enum(['Financial', 'Product', 'Market', 'Team', 'User', 'System', 'General']);
export type KeyEventCategory = z.infer<typeof KeyEventCategoryEnum>;

export const KeyEventImpactEnum = z.enum(['Positive', 'Negative', 'Neutral']);
export type KeyEventImpact = z.infer<typeof KeyEventImpactEnum>;

export interface StructuredKeyEvent {
  id: string;
  timestamp: string; // ISO date string
  month: number; // Simulation month this event pertains to
  description: string;
  category: KeyEventCategory;
  impact: KeyEventImpact;
}

// Interface for earned badges, now part of DigitalTwinState
export interface EarnedBadge {
  questId: string; // To link to the completed quest
  name: string;
  description: string;
  icon?: string; // Lucide icon name or path
  dateEarned: string; // ISO date string
}

// Founder Archetype
export const FounderArchetypeEnum = z.enum(['innovator', 'scaler', 'community_builder']);
export type FounderArchetype = z.infer<typeof FounderArchetypeEnum>;


export interface DigitalTwinState {
  simulationMonth: number;
  companyName: string;
  financials: FinancialMetrics;
  userMetrics: UserMetrics;
  product: ProductDetails;
  resources: Resources;
  market: MarketConditions;
  startupScore: number;
  keyEvents: StructuredKeyEvent[];
  rewards: Reward[];
  earnedBadges: EarnedBadge[]; // Added for quest completion badges
  initialGoals: string[];
  missions: Mission[];
  suggestedChallenges: string[];
  isInitialized: boolean;
  currentAiReasoning: string | null;
  selectedArchetype?: FounderArchetype; // Added founder archetype

  historicalRevenue: RevenueDataPoint[];
  historicalUserGrowth: UserDataPoint[];
  historicalBurnRate: HistoricalDataPoint[];
  historicalNetProfitLoss: HistoricalDataPoint[];
  historicalExpenseBreakdown: ExpenseBreakdownDataPoint[];
  historicalCAC: HistoricalDataPoint[];
  historicalChurnRate: HistoricalDataPoint[];
  historicalProductProgress: HistoricalDataPoint[];

  sandboxState: DigitalTwinState | null;
  isSandboxing: boolean;
  sandboxRelativeMonth: number;
}

export interface AIInitialConditions {
  market?: {
    estimatedSize?: number;
    growthRate?: number;
    keySegments?: string[] | string;
    targetMarketDescription?: string;
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
    features?: string[];
  };
  financials?: {
    startingCash?: number | string;
    estimatedInitialMonthlyBurnRate?: number | string;
    currencyCode?: string;
  };
  initialGoals?: string[] | string;
  companyName?: string;
}

// AI Agent Profile
export interface AIAgentProfile {
  id: string;
  name: string;
  shortName: string;
  title: string;
  icon: ComponentType<LucideProps>;
  iconColorClass: string;
  gradientFromClass: string;
  gradientToClass: string;
  description: string;
  specialties: string[];
  actionText: string;
  actionLink?: string;
}

// Snapshot type for saving simulation states
export interface SimulationSnapshot {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  simulationState: DigitalTwinState; // The actual state snapshot
}


// Alex the Accountant Tool
export const AlexTheAccountantToolInputSchema = z.object({
  simulationMonth: z.number().optional().describe("The current month of the simulation."),
  cashOnHand: z.number().optional().describe("Current cash on hand for the startup."),
  burnRate: z.number().optional().describe("Current monthly burn rate."),
  monthlyRevenue: z.number().optional().describe("Current monthly revenue."),
  monthlyExpenses: z.number().optional().describe("Current monthly expenses."),
  currencySymbol: z.string().optional().default("$").describe("The currency symbol for financial figures (e.g., $)."),
  query: z.string().optional().describe("A specific financial query for Alex if the context is not fully covered by standard fields, e.g., 'advice on budget allocation for Q2', 'what's our current runway?'.")
});
export type AlexTheAccountantToolInput = z.infer<typeof AlexTheAccountantToolInputSchema>;

export const AlexTheAccountantToolOutputSchema = z.object({
  summary: z.string().describe("A brief financial health check, insight, or response to a query from Alex the Accountant, using the provided currency symbol."),
});
export type AlexTheAccountantToolOutput = z.infer<typeof AlexTheAccountantToolOutputSchema>;

// Maya the Marketing Guru Tool
export const MayaTheMarketingGuruToolInputSchema = z.object({
  query: z.string().describe("Specific question, topic, or context for Maya the Marketing Guru to provide advice on (e.g., 'How to improve user acquisition?', 'Critique my current marketing spend given product stage X and target market Y', 'Suggest some campaign ideas for a new feature launch'). EVE should synthesize relevant details from the conversation into this query."),
  currentMarketingSpend: z.number().optional().describe("Current monthly marketing spend for context."),
  targetMarketDescription: z.string().optional().describe("Description of the target market."),
  productStage: z.string().optional().describe("Current stage of the product (e.g., 'idea', 'mvp', 'growth').")
});
export type MayaTheMarketingGuruToolInput = z.infer<typeof MayaTheMarketingGuruToolInputSchema>;

export const MayaTheMarketingGuruToolOutputSchema = z.object({
  advice: z.string().describe("Targeted marketing advice or strategy suggestions from Maya the Marketing Guru."),
});
export type MayaTheMarketingGuruToolOutput = z.infer<typeof MayaTheMarketingGuruToolOutputSchema>;

// Ty the Social Media Strategist Tool
export const TyTheSocialMediaStrategistToolInputSchema = z.object({
  query: z.string().describe("Specific question or topic for Ty the Social Media Strategist, e.g., 'Suggest organic social media strategies for a B2B SaaS product', 'Draft a mockup campaign for our summer sale', 'Predict virality for a campaign targeting Gen Z on TikTok for an eco-friendly brand.'"),
  productName: z.string().optional().describe("Name of the product/service."),
  targetAudience: z.string().optional().describe("Description of the target audience for social media."),
  brandVoice: z.string().optional().describe("Brief description of the brand's voice/style (e.g., playful, professional, edgy).")
});
export type TyTheSocialMediaStrategistToolInput = z.infer<typeof TyTheSocialMediaStrategistToolInputSchema>;

export const TyTheSocialMediaStrategistToolOutputSchema = z.object({
  advice: z.string().describe("Social media strategy advice, campaign mockups, or virality predictions from Ty."),
});
export type TyTheSocialMediaStrategistToolOutput = z.infer<typeof TyTheSocialMediaStrategistToolOutputSchema>;

// Zara the Focus Group Leader Tool
export const ZaraTheFocusGroupLeaderToolInputSchema = z.object({
  query: z.string().describe("Specific product, feature, branding concept, or marketing message to get simulated customer feedback on. E.g., 'How would early-adopter tech enthusiasts react to this new pricing model?' or 'Simulate focus group feedback on our new logo design for a luxury brand.'"),
  itemToTest: z.string().describe("Clear description of the item/concept Zara should run a simulated focus group on (e.g., 'Our new subscription pricing tiers', 'The proposed logo design for Project X', 'The main feature of our upcoming MVP: AI-powered scheduling')."),
  targetAudiencePersona: z.string().optional().describe("Detailed persona of the target customer for the focus group simulation (e.g., 'Busy professionals aged 30-45 who value convenience', 'Students interested in sustainable products').")
});
export type ZaraTheFocusGroupLeaderToolInput = z.infer<typeof ZaraTheFocusGroupLeaderToolInputSchema>;

export const ZaraTheFocusGroupLeaderToolOutputSchema = z.object({
  feedbackSummary: z.string().describe("A summary of simulated customer feedback, including positive points, concerns, and suggestions from Zara's focus group."),
});
export type ZaraTheFocusGroupLeaderToolOutput = z.infer<typeof ZaraTheFocusGroupLeaderToolOutputSchema>;

// Leo the Expansion Expert Tool
export const LeoTheExpansionExpertToolInputSchema = z.object({
  query: z.string().describe("Specific question, topic, or context for Leo the Expansion Expert (e.g., 'Feasibility of expanding to the European market?', 'Risks of international expansion with our current product?','Advice on scaling operations for 10x user growth.', 'Should we consider a partnership with Company Y?'). EVE should synthesize relevant details into this query."),
  currentScale: z.string().optional().describe("Current operational scale or user base (e.g., '1000 active users', 'small team of 5')."),
  targetExpansion: z.string().optional().describe("Desired expansion goal (e.g., 'new geography: Europe', 'new market segment: enterprise clients', '10x user growth in 12 months').")
});
export type LeoTheExpansionExpertToolInput = z.infer<typeof LeoTheExpansionExpertToolInputSchema>;

export const LeoTheExpansionExpertToolOutputSchema = z.object({
  advice: z.string().describe("Advice on market expansion, scaling strategies, risk assessment for new markets, or internationalization from Leo the Expansion Expert."),
});
export type LeoTheExpansionExpertToolOutput = z.infer<typeof LeoTheExpansionExpertToolOutputSchema>;

// The Advisor Tool
export const TheAdvisorToolInputSchema = z.object({
    query: z.string().describe("The user's specific query about industry best practices, competitive landscape, or strategic positioning. E.g., 'What are key best practices for SaaS startups in their first year?', 'How do we position ourselves against Competitor X?', 'Analyze the competitive landscape for AI-powered productivity tools.'"),
    currentIndustry: z.string().optional().describe("The startup's industry or niche (e.g., 'B2B SaaS for small businesses', 'EdTech for K-12')."),
    competitors: z.array(z.string()).optional().describe("A list of known competitors' names."),
    startupStage: z.string().optional().describe("The current stage of the startup (e.g., 'Idea', 'Pre-launch', 'Growth', 'Seed Stage')."),
});
export type TheAdvisorToolInput = z.infer<typeof TheAdvisorToolInputSchema>;

export const TheAdvisorToolOutputSchema = z.object({
    advice: z.string().describe("Strategic advice from The Advisor, covering best practices, competitive insights, or strategic positioning recommendations."),
});
export type TheAdvisorToolOutput = z.infer<typeof TheAdvisorToolOutputSchema>;

// Brand Lab Tool
export const BrandLabToolInputSchema = z.object({
    productDescription: z.string().describe("A description of the product or service being analyzed for branding."),
    brandingConcept: z.string().describe("The branding concept, slogan, visual identity elements, or general brand idea to be reviewed. E.g., 'A minimalist and modern brand identity', 'Slogan: Innovate Smarter, Not Harder', 'Logo concept using a stylized gear and brain icon.'"),
    targetAudience: z.string().optional().describe("The primary target audience for the brand (e.g., 'Tech-savvy millennials', 'Small business owners in creative industries')."),
    brandVoice: z.string().optional().describe("The desired brand voice or tone (e.g., 'innovative and disruptive', 'friendly and approachable', 'authoritative and expert')."),
});
export type BrandLabToolInput = z.infer<typeof BrandLabToolInputSchema>;

export const BrandLabToolOutputSchema = z.object({
    feedback: z.string().describe("Constructive feedback from the Brand Lab on the provided branding concept, its alignment with the product and target audience, and suggestions for improvement."),
});
export type BrandLabToolOutput = z.infer<typeof BrandLabToolOutputSchema>;


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
  currentSimulationMonth: z.number().describe("The current month number of the simulation (e.g., month 1, month 2). For sandbox, this is the relative month *within* the sandbox."),
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

const AIKeyEventSchema = z.object({
  description: z.string().describe("A concise description of the event. Do NOT include impact text like '(Positive)' here; use the 'impact' field instead."),
  category: KeyEventCategoryEnum.describe("The most relevant category for this event (e.g., Financial, Product, Market, Team, User, General)."),
  impact: KeyEventImpactEnum.describe("The overall impact of the event (Positive, Negative, or Neutral).")
});

// Define ExpenseBreakdownSchema before it's used
export const ExpenseBreakdownSchema = z.object({
  salaries: z.number().describe("Total salary expenses for the month."),
  marketing: z.number().describe("Total marketing expenses for the month."),
  rnd: z.number().describe("Total R&D expenses for the month."),
  operational: z.number().describe("Other operational expenses for the month."),
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
  keyEventsGenerated: z.array(AIKeyEventSchema).length(2).describe("An array of exactly two significant, context-aware events that occurred during the month. Each event must be an object with 'description', 'category', and 'impact' fields."),
  rewardsGranted: z.array(RewardSchema).optional().describe("List of rewards granted this month if a significant milestone was achieved. These rewards should be thematic to the achievement."),
  startupScoreAdjustment: z.number().int().describe("An integer representing the change to the startup score based on this month's performance, achievements, and rewards."),
  aiReasoning: z.string().optional().describe("A brief, 1-2 sentence explanation from the AI about its key considerations or calculations for this month's simulation outcomes, especially if they were influenced by nuanced logic or dynamic events."),
});
export type SimulateMonthOutput = z.infer<typeof SimulateMonthOutputSchema>;

// Analyze Custom Scenario Flow Schemas
export const AnalyzeCustomScenarioInputSchema = z.object({
  simulationStateJSON: z.string().describe("The full current DigitalTwinState of the simulation, serialized as a JSON string."),
  customScenarioDescription: z.string().describe("A user-defined 'what-if' scenario description (e.g., 'What if a major competitor launches a similar product with 20% lower pricing?')."),
});
export type AnalyzeCustomScenarioInput = z.infer<typeof AnalyzeCustomScenarioInputSchema>;

export const AnalyzeCustomScenarioOutputSchema = z.object({
  analysisText: z.string().describe("The AI's textual analysis of the custom scenario, outlining potential impacts, affected metrics, opportunities/risks, and strategic considerations."),
});
export type AnalyzeCustomScenarioOutput = z.infer<typeof AnalyzeCustomScenarioOutputSchema>;

// Suggest Scenarios Flow Schemas
export const SuggestScenariosInputSchema = z.object({
  simulationStateJSON: z.string().describe("The full current DigitalTwinState of the simulation, serialized as a JSON string."),
});
export type SuggestScenariosInput = z.infer<typeof SuggestScenariosInputSchema>;

export const SuggestedScenarioSchema = z.object({
  id: z.string().describe("A unique identifier for the scenario suggestion (e.g., 'market_downturn_q1')."),
  label: z.string().describe("A short, user-friendly label for the scenario (e.g., 'Sudden Market Downturn')."),
  description: z.string().describe("The detailed description of the suggested what-if scenario."),
});
export type SuggestedScenario = z.infer<typeof SuggestedScenarioSchema>;

export const SuggestScenariosOutputSchema = z.object({
  suggestedScenarios: z.array(SuggestedScenarioSchema).min(2).max(4).describe("An array of 2 to 4 plausible and insightful 'what-if' scenarios tailored to the current simulation state."),
});
export type SuggestScenariosOutput = z.infer<typeof SuggestScenariosOutputSchema>;


// --- Decision Control Tools ---
// SetMarketingBudgetTool
export const SetMarketingBudgetToolInputSchema = z.object({
  newBudget: z.number().describe("The new monthly marketing budget to set."),
  currencyCode: z.string().optional().describe("The currency code for the budget, e.g., USD.")
});
export type SetMarketingBudgetToolInput = z.infer<typeof SetMarketingBudgetToolInputSchema>;

export const SetMarketingBudgetToolOutputSchema = z.object({
  success: z.boolean().describe("Whether the budget adjustment was acknowledged by the tool."),
  message: z.string().describe("A confirmation message, e.g., 'Marketing budget acknowledged to be set to $5000 USD.'"),
  newBudget: z.number().describe("The acknowledged new budget."),
  currencyCode: z.string().optional().describe("The currency code.")
});
export type SetMarketingBudgetToolOutput = z.infer<typeof SetMarketingBudgetToolOutputSchema>;

// SetRnDBudgetTool
export const SetRnDBudgetToolInputSchema = z.object({
  newBudget: z.number().describe("The new monthly R&D budget to set."),
  currencyCode: z.string().optional().describe("The currency code for the budget, e.g., USD.")
});
export type SetRnDBudgetToolInput = z.infer<typeof SetRnDBudgetToolInputSchema>;

export const SetRnDBudgetToolOutputSchema = z.object({
  success: z.boolean().describe("Whether the R&D budget adjustment was acknowledged by the tool."),
  message: z.string().describe("A confirmation message, e.g., 'R&D budget acknowledged to be set to $3000 USD.'"),
  newBudget: z.number().describe("The acknowledged new budget."),
  currencyCode: z.string().optional().describe("The currency code.")
});
export type SetRnDBudgetToolOutput = z.infer<typeof SetRnDBudgetToolOutputSchema>;

// SetProductPriceTool
export const SetProductPriceToolInputSchema = z.object({
  newPrice: z.number().describe("The new monthly price per user for the product."),
  currencyCode: z.string().optional().describe("The currency code for the price, e.g., USD.")
});
export type SetProductPriceToolInput = z.infer<typeof SetProductPriceToolInputSchema>;

export const SetProductPriceToolOutputSchema = z.object({
  success: z.boolean().describe("Whether the product price adjustment was acknowledged by the tool."),
  message: z.string().describe("A confirmation message, e.g., 'Product price acknowledged to be set to $12.99 USD.'"),
  newPrice: z.number().describe("The acknowledged new price."),
  currencyCode: z.string().optional().describe("The currency code.")
});
export type SetProductPriceToolOutput = z.infer<typeof SetProductPriceToolOutputSchema>;


// DEPRECATED AccountantTool Schemas - Replaced by AlexTheAccountantTool
export const AccountantToolInputZodSchema = z.object({}).optional();
export type AccountantToolInput = z.infer<typeof AccountantToolInputZodSchema>;
export const AccountantToolOutputZodSchema = z.object({}).optional();
export type AccountantToolOutput = z.infer<typeof AccountantToolOutputZodSchema>;

// -- New Schemas for Startup Setup Enhancements & New Insight Flows --

// Suggest Names Flow
export const SuggestNamesInputSchema = z.object({
  businessIdea: z.string().describe("A brief description of the business idea or core concept."),
  keywords: z.array(z.string()).optional().describe("Optional keywords related to the business, industry, or brand values."),
});
export type SuggestNamesInput = z.infer<typeof SuggestNamesInputSchema>;

export const SuggestNamesOutputSchema = z.object({
  suggestedCompanyNames: z.array(z.string()).describe("A list of 3-5 suggested company names."),
  suggestedProductNames: z.array(z.string()).describe("A list of 3-5 suggested product/service names based on the idea."),
});
export type SuggestNamesOutput = z.infer<typeof SuggestNamesOutputSchema>;

// Generate Dynamic Missions Flow
export const GenerateDynamicMissionsInputSchema = z.object({
  simulationStateJSON: z.string().describe("The full current DigitalTwinState of the simulation, serialized as a JSON string."),
  recentEvents: z.array(z.string()).optional().describe("A summary of the last few significant events in the simulation (e.g., descriptions from StructuredKeyEvents)."),
  currentGoals: z.array(z.string()).optional().describe("User's stated or AI-derived current strategic goals (e.g., from initial setup or strategic recommendations)."),
});
export type GenerateDynamicMissionsInput = z.infer<typeof GenerateDynamicMissionsInputSchema>;

export const MissionSchema = z.object({
  title: z.string().describe("The main title or objective of the mission."),
  description: z.string().describe("A brief explanation of what needs to be done."),
  rewardText: z.string().describe("Textual description of the reward upon completion (e.g., '+10 Score, Unlock Feature X')."),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe("Optional difficulty rating."),
});

export const GenerateDynamicMissionsOutputSchema = z.object({
  generatedMissions: z.array(MissionSchema).describe("An array of 2-3 dynamically generated missions relevant to the current simulation state."),
});
export type GenerateDynamicMissionsOutput = z.infer<typeof GenerateDynamicMissionsOutputSchema>;

// Detailed Financial Analysis Flow
export const DetailedFinancialAnalysisInputSchema = z.object({
  simulationStateJSON: z.string().describe("The full current DigitalTwinState of the simulation, serialized as a JSON string."),
  userQuery: z.string().optional().describe("Specific financial aspect the user wants to analyze (e.g., 'Analyze our profitability trends', 'Assess investment readiness based on Q2 performance')."),
  analysisPeriodMonths: z.number().optional().default(3).describe("Number of recent simulation months to focus the analysis on."),
});
export type DetailedFinancialAnalysisInput = z.infer<typeof DetailedFinancialAnalysisInputSchema>;

export const FinancialRatioSchema = z.object({
  name: z.string().describe("Name of the financial ratio (e.g., 'Gross Profit Margin', 'Current Ratio')."),
  value: z.string().describe("Calculated value of the ratio (can be percentage or number)."),
  interpretation: z.string().describe("Brief interpretation of this ratio in the context of the startup."),
});

export const DetailedFinancialAnalysisOutputSchema = z.object({
  analysisSummary: z.string().describe("Overall summary of the financial health and performance."),
  keyObservations: z.array(z.string()).describe("List of important observations from the financial data."),
  calculatedRatios: z.array(FinancialRatioSchema).optional().describe("Key financial ratios calculated and interpreted."),
  recommendations: z.array(z.string()).optional().describe("Actionable financial recommendations."),
  investmentReadiness: z.string().optional().describe("Assessment of investment readiness if queried."),
});
export type DetailedFinancialAnalysisOutput = z.infer<typeof DetailedFinancialAnalysisOutputSchema>;

// Competitor Analysis Flow
export const CompetitorInfoSchema = z.object({
  name: z.string().describe("Name of the competitor."),
  strengths: z.array(z.string()).optional().describe("Known strengths of the competitor."),
  weaknesses: z.array(z.string()).optional().describe("Known weaknesses of the competitor."),
  productOffering: z.string().optional().describe("Brief description of the competitor's main product/service."),
});

export const CompetitorAnalysisInputSchema = z.object({
  simulationStateJSON: z.string().describe("The full current DigitalTwinState of the user's simulation, serialized as a JSON string."),
  competitorsToAnalyze: z.array(CompetitorInfoSchema).min(1).describe("Information about one or more competitors the user wants analyzed."),
  marketDescription: z.string().optional().describe("User's description of the target market."),
});
export type CompetitorAnalysisInput = z.infer<typeof CompetitorAnalysisInputSchema>;

export const SingleCompetitorAnalysisSchema = z.object({
  competitorName: z.string(),
  aiAssessedStrengths: z.array(z.string()).describe("AI's assessment of the competitor's strengths."),
  aiAssessedWeaknesses: z.array(z.string()).describe("AI's assessment of the competitor's weaknesses."),
  potentialThreatsToUser: z.array(z.string()).describe("How this competitor might pose a threat to the user's startup."),
  potentialOpportunitiesForUser: z.array(z.string()).describe("Opportunities for the user's startup in relation to this competitor."),
  strategicConsiderations: z.string().describe("Overall strategic considerations for the user regarding this competitor."),
});

export const CompetitorAnalysisOutputSchema = z.object({
  overallMarketPerspective: z.string().describe("AI's brief overview of the competitive landscape based on the provided info."),
  detailedAnalyses: z.array(SingleCompetitorAnalysisSchema).describe("Individual analysis for each competitor provided."),
  strategicRecommendations: z.array(z.string()).describe("High-level strategic recommendations for the user's startup to navigate the competitive environment."),
});
export type CompetitorAnalysisOutput = z.infer<typeof CompetitorAnalysisOutputSchema>;
