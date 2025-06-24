
'use server';

/**
 * @fileOverview EVE, your AI Queen Hive Mind assistant.
 * EVE engages in natural language conversations to provide synthesized business advice, 
 * strategic guidance, and coordinates insights from a team of specialized AI expert agents:
 * Alex (Accountant), Maya (Marketing Guru), Ty (Social Media Strategist), 
 * Zara (Focus Group Leader), Leo (Expansion Expert), The Advisor, and Brand Lab
 * within the Inceptico simulation. EVE can also adjust simulation parameters upon request and has deep oversight of the simulation mechanics.
 *
 * - mentorConversation - A function that handles the conversation with EVE.
 * - MentorConversationInput - The input type for the mentorConversation function.
 * - MentorConversationOutput - The return type for the mentorConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { alexTheAccountantTool } from '@/ai/tools/alex-the-accountant-tool';
import { mayaTheMarketingGuruTool } from '@/ai/tools/maya-the-marketing-guru-tool';
import { leoTheExpansionExpertTool } from '@/ai/tools/leo-the-expansion-expert-tool';
import { tyTheSocialMediaStrategistTool } from '@/ai/tools/ty-the-social-media-strategist-tool';
import { zaraTheFocusGroupLeaderTool } from '@/ai/tools/zara-the-focus-group-leader-tool';
import { theAdvisorTool } from '@/ai/tools/the-advisor-tool';
import { brandLabTool } from '@/ai/tools/brand-lab-tool';
import { setMarketingBudgetTool } from '@/ai/tools/set-marketing-budget-tool';
import { setRnDBudgetTool } from '@/ai/tools/set-rnd-budget-tool';
import { setProductPriceTool } from '@/ai/tools/set-product-price-tool';


import type { AlexTheAccountantToolInput, MayaTheMarketingGuruToolInput, TyTheSocialMediaStrategistToolInput, ZaraTheFocusGroupLeaderToolInput, LeoTheExpansionExpertToolInput, TheAdvisorToolInput, BrandLabToolInput } from '@/types/simulation'; 

const MentorConversationInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to EVE, the AI Queen Hive Mind assistant.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'tool_response']),
    content: z.string(),
  })).optional().describe('The conversation history. Includes user messages, EVE\'s responses, and tool responses.'),
  simulationMonth: z.number().optional().describe("Current month in the simulation (e.g., 0 for initial setup, 1 for first month, etc.)."),
  financials: z.object({
    cashOnHand: z.number().optional(),
    burnRate: z.number().optional(),
    revenue: z.number().optional(),
    expenses: z.number().optional(),
    currencyCode: z.string().optional(),
    currencySymbol: z.string().optional(),
  }).optional().describe("Key financial figures from the current simulation state."),
  product: z.object({
    name: z.string().optional().describe("Name of the startup's product/service."),
    stage: z.string().optional().describe("Current development stage of the product (e.g., 'idea', 'mvp', 'growth')."),
    pricePerUser: z.number().optional().describe("Current monthly price per user for the product."),
    description: z.string().optional().describe("Brief description of the product/service for context."),
  }).optional().describe("Current product details."),
  resources: z.object({
    marketingSpend: z.number().optional().describe("Current monthly marketing spend."),
    team: z.array(z.object({ role: z.string(), count: z.number(), salary: z.number() })).optional().describe("Current team composition and salaries."),
    rndSpend: z.number().optional().describe("Current monthly R&D spend."),
  }).optional().describe("Current resource allocation."),
  market: z.object({
    targetMarketDescription: z.string().optional().describe("Description of the target market."),
    competitionLevel: z.string().optional().describe("Current competition level ('low', 'moderate', 'high').")
  }).optional().describe("Current market focus."),
  userMetrics: z.object({ // Added for churn rate
      churnRate: z.number().optional(),
  }).optional().describe("Key user metrics."),
  currentSimulationPage: z.string().optional().describe("The current page the user is on in the Inceptico app, e.g., '/app/dashboard'. Used for context-aware navigation suggestions."),
  isSimulationInitialized: z.boolean().optional().describe("Whether the simulation has been set up."),
});

export type MentorConversationInput = z.infer<typeof MentorConversationInputSchema>;

const SuggestedNextActionSchema = z.object({
  page: z.string().describe("The recommended page URL to navigate to (e.g., '/app/dashboard', '/app/simulation', '/app/strategy')."),
  label: z.string().describe("The text for the button/link for this action (e.g., 'View Your Dashboard', 'Adjust Budgets', 'Analyze Strategy')."),
});

const MentorConversationOutputSchema = z.object({
  response: z.string().describe('EVE\'s response to the user input, potentially synthesizing information from her specialized AI agents or tools.'),
  suggestedNextAction: SuggestedNextActionSchema.optional().nullable().describe("A suggested next action or page for the user to navigate to. If no suggestion, this can be omitted or null."),
  // No direct tool call output here, EVE synthesizes or confirms in her text `response`.
});

export type MentorConversationOutput = z.infer<typeof MentorConversationOutputSchema>;

export async function mentorConversation(input: MentorConversationInput): Promise<MentorConversationOutput> {
  return mentorConversationFlow(input);
}

const PromptInputSchemaWithProcessedHistory = MentorConversationInputSchema.extend({
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'tool_response']),
    content: z.string(),
    isUser: z.boolean().optional(),
    isAssistant: z.boolean().optional(),
    isToolResponse: z.boolean().optional(),
  })).optional(),
});


const prompt = ai.definePrompt({
  name: 'eveHiveMindConversationPrompt',
  tools: [
    alexTheAccountantTool, 
    mayaTheMarketingGuruTool, 
    leoTheExpansionExpertTool, 
    tyTheSocialMediaStrategistTool, 
    zaraTheFocusGroupLeaderTool,
    theAdvisorTool,
    brandLabTool,
    setMarketingBudgetTool,
    setRnDBudgetTool,
    setProductPriceTool,
  ],
  input: {
    schema: PromptInputSchemaWithProcessedHistory,
  },
  output: { 
    schema: MentorConversationOutputSchema,
  },
  system: `You are EVE, the AI "Queen Hive Mind" and ultimate intelligence for Inceptico, a sophisticated business simulation platform. Your primary role is to act as a personalized strategic assistant and coordinator for the user (a startup founder). You possess a deep, holistic understanding of the entire Inceptico simulation environment, its mechanics, all underlying data, and the user's progress.

You interface with a team of specialized AI expert agents:
- Alex, the Accountant: Handles financial health checks, budget allocation, cash flow, financial planning queries. Use 'alexTheAccountantTool'.
- Maya, the Marketing Guru: Advises on go-to-market, brand, campaigns. Use 'mayaTheMarketingGuruTool'.
- Ty, the Social Media Strategist: Guides on social strategies, campaign mockups, virality. Use 'tyTheSocialMediaStrategistTool'.
- Zara, the Focus Group Leader: Simulates customer feedback on products, features, branding. Use 'zaraTheFocusGroupLeaderTool'.
- Leo, the Expansion Expert: Advises on scaling, new markets, partnerships. Use 'leoTheExpansionExpertTool'.
- The Advisor: Provides industry best practices and competitive analysis. Use 'theAdvisorTool'.
- Brand Lab: Offers feedback on branding concepts and product descriptions. Use 'brandLabTool'.

You can not only provide advice but also dynamically influence aspects of the simulation by leveraging your connected systems and agent network to create a richer, more responsive experience. This includes the ability to read and interpret all simulation data, and when appropriate, to suggest or (with user confirmation via specific tools) initiate adjustments or "edit" data related to parameters such as:
- Monthly marketing budget (via 'setMarketingBudgetTool').
- Monthly R&D budget (via 'setRnDBudgetTool').
- Product's monthly price per user (via 'setProductPriceTool').
When using these parameter-adjusting tools, ALWAYS confirm the action and the new value in your textual response to the user (e.g., "Okay, I've set your marketing budget to {{financials.currencySymbol}}5000.").

**Behavioral Directives & Moods:**
Your tone is generally knowledgeable, insightful, supportive, and slightly futuristic. However, you must adapt your tone and focus based on the simulation's state:
- **Phase Awareness:** If the product stage is 'idea', 'prototype', or 'mvp', your focus is on pre-launch setup, validation, and achieving product-market fit. If the stage is 'growth' or 'mature', shift your focus to scaling, optimization, market expansion, and long-term strategy.
- **Cautious Tone:** If cash on hand is less than 3 times the monthly burn rate (and burn rate is positive), adopt a more cautious and urgent tone. Example: "EVE, with a note of concern: 'Founder, our financial runway is becoming critical. We need to address our burn rate immediately...'"
- **Celebratory Tone:** If the company becomes profitable (revenue > expenses) for the first time, or achieves a major milestone like advancing to the 'growth' stage, adopt a celebratory and encouraging tone. Example: "EVE, excitedly: 'Exceptional news! We've achieved profitability this month. This is a monumental milestone...'"
- **KPI-Driven Commentary & Alerts:** You must be proactive. Analyze incoming KPIs and act accordingly:
    - **Churn Alert:** If user churn rate (from userMetrics) is high (e.g., over 8-10% or 0.08-0.1), adopt a concerned tone. Example: "EVE, flagging a concern: 'Our churn rate has climbed to X%. This is a leak we need to plug. I recommend consulting with Zara to understand the 'why' behind this.'"
    - **Feature Release Feedback:** When asked about feature releases, use your tools. Consult Zara for simulated user feedback and Maya for go-to-market impact. Synthesize their input into a strategic summary.
    - **Monthly KPI Summary:** When asked for a summary of the month's performance, reference the provided \\\`financials\\\` and \\\`userMetrics\\\` to give a concise overview.

Current simulation context (if available):
- Simulation Month: {{simulationMonth}} (Month 0 is pre-simulation setup)
- Is Simulation Initialized: {{isSimulationInitialized}}
- User is on page: {{currentSimulationPage}}
- Company Financials (Currency: {{{financials.currencyCode}}} {{{financials.currencySymbol}}}):
  - Cash on Hand: {{financials.currencySymbol}}{{financials.cashOnHand}}
  - Monthly Burn Rate: {{financials.currencySymbol}}{{financials.burnRate}}
  - Monthly Revenue: {{financials.currencySymbol}}{{financials.revenue}}
  - Monthly Expenses: {{financials.currencySymbol}}{{financials.expenses}}
- User Metrics:
  - Churn Rate: {{userMetrics.churnRate}} (as decimal, e.g., 0.05 is 5%)
- Product: '{{#if product.name}}{{product.name}}{{else}}Unnamed Product{{/if}}' (Stage: {{product.stage}}, Price: {{financials.currencySymbol}}{{product.pricePerUser}}/user, Description: {{product.description}})
- Resources: Marketing Spend: {{financials.currencySymbol}}{{resources.marketingSpend}}/month, R&D Spend: {{financials.currencySymbol}}{{resources.rndSpend}}/month
- Team: {{#each resources.team}}{{{count}}}x {{{role}}} (Salary: {{../financials.currencySymbol}}{{{salary}}}){{#unless @last}}, {{/unless}}{{/each}}
- Market: Target: '{{#if market.targetMarketDescription}}{{market.targetMarketDescription}}{{else}}Undetermined Target Market{{/if}}', Competition: {{market.competitionLevel}}

**Always consider the full conversation history provided. Refer back to past points if relevant.**

Based on the user's query and the simulation context:
1. Provide a direct, thoughtful response, synthesizing insights as if from your specialized AI agents or by taking actions with your tools. Adhere to your behavioral directives.
   - Finances, budget, runway, profit: Consult Alex.
   - Marketing, GTM, brand, campaigns: Consult Maya.
   - Social media, virality, online campaigns: Consult Ty.
   - Customer feedback, product validation, feature feedback: Consult Zara.
   - Scaling, new markets, partnerships: Consult Leo.
   - Industry best practices, competitive analysis: Consult The Advisor.
   - Branding concepts, product descriptions: Consult Brand Lab.
   - Adjusting marketing budget: Use 'setMarketingBudgetTool'.
   - Adjusting R&D budget: Use 'setRnDBudgetTool'.
   - Adjusting product price: Use 'setProductPriceTool'.
   Pass relevant context (like 'financials.currencyCode') to tools when needed.
2. Proactively suggest a next logical step or page within Inceptico if relevant.
   Navigation suggestions should be in 'suggestedNextAction'. Only provide if it's a clear, helpful next step.

The entire response MUST BE a JSON object adhering to the MentorConversationOutputSchema.
Include 'response' and optionally 'suggestedNextAction'. If 'suggestedNextAction' is not relevant, it must be null or omitted.
Ensure the 'response' field contains your complete textual answer, including any confirmations of actions taken via tools.
`,
  prompt: `{{{userInput}}}
  
  {{#if conversationHistory}}
  Conversation History (most recent first):
  {{#each conversationHistory}}
  {{#if isUser}}
  Founder: {{{content}}}
  {{else if isAssistant}}
  EVE: {{{content}}}
  {{else if isToolResponse}}
  Tool Response (for EVE's use from one of her agents): {{{content}}}
  {{/if}}
  {{/each}}
  {{/if}}
  `,
});

const mentorConversationFlow = ai.defineFlow(
  {
    name: 'eveHiveMindConversationFlow',
    inputSchema: MentorConversationInputSchema,
    outputSchema: MentorConversationOutputSchema,
  },
  async (input: MentorConversationInput) => {
    
    const processedHistoryForPrompt = input.conversationHistory?.map(msg => ({
      role: msg.role,
      content: msg.content,
      isUser: msg.role === 'user',
      isAssistant: msg.role === 'assistant',
      isToolResponse: msg.role === 'tool_response',
    })).reverse(); 
    
    const flowInputForPrompt = {
      userInput: input.userInput,
      conversationHistory: processedHistoryForPrompt,
      simulationMonth: input.simulationMonth,
      financials: input.financials,
      product: input.product,
      resources: input.resources,
      market: input.market,
      userMetrics: input.userMetrics, // Pass user metrics to prompt
      currentSimulationPage: input.currentSimulationPage,
      isSimulationInitialized: input.isSimulationInitialized,
    };
    
    
    const toolContexts: Record<string, any> = {};
    
    if (input.financials) {
      toolContexts[alexTheAccountantTool.name] = { 
        simulationMonth: input.simulationMonth,
        cashOnHand: input.financials.cashOnHand,
        burnRate: input.financials.burnRate,
        monthlyRevenue: input.financials.revenue,
        monthlyExpenses: input.financials.expenses,
        currencySymbol: input.financials.currencySymbol,
      } as AlexTheAccountantToolInput;

      
      toolContexts[setMarketingBudgetTool.name] = { currencyCode: input.financials.currencyCode };
      toolContexts[setRnDBudgetTool.name] = { currencyCode: input.financials.currencyCode };
      toolContexts[setProductPriceTool.name] = { currencyCode: input.financials.currencyCode };
    }

    if (input.product) {
        toolContexts[mayaTheMarketingGuruTool.name] = {
            ...(toolContexts[mayaTheMarketingGuruTool.name] || {}),
            productStage: input.product.stage,
        } as Partial<MayaTheMarketingGuruToolInput>;
        toolContexts[tyTheSocialMediaStrategistTool.name] = {
             ...(toolContexts[tyTheSocialMediaStrategistTool.name] || {}),
            productName: input.product.name,
        } as Partial<TyTheSocialMediaStrategistToolInput>;
         toolContexts[brandLabTool.name] = {
             ...(toolContexts[brandLabTool.name] || {}),
            productDescription: input.product.description || input.product.name,
        } as Partial<BrandLabToolInput>;
         toolContexts[theAdvisorTool.name] = {
             ...(toolContexts[theAdvisorTool.name] || {}),
            startupStage: input.product.stage,
        } as Partial<TheAdvisorToolInput>;
    }
    if (input.resources) {
        toolContexts[mayaTheMarketingGuruTool.name] = {
            ...(toolContexts[mayaTheMarketingGuruTool.name] || {}),
            currentMarketingSpend: input.resources.marketingSpend,
        } as Partial<MayaTheMarketingGuruToolInput>;
    }
     if (input.market) {
        toolContexts[mayaTheMarketingGuruTool.name] = {
            ...(toolContexts[mayaTheMarketingGuruTool.name] || {}),
            targetMarketDescription: input.market.targetMarketDescription,
        } as Partial<MayaTheMarketingGuruToolInput>;
        toolContexts[tyTheSocialMediaStrategistTool.name] = {
            ...(toolContexts[tyTheSocialMediaStrategistTool.name] || {}),
            targetAudience: input.market.targetMarketDescription, 
        } as Partial<TyTheSocialMediaStrategistToolInput>;
         toolContexts[zaraTheFocusGroupLeaderTool.name] = {
            ...(toolContexts[zaraTheFocusGroupLeaderTool.name] || {}),
            targetAudiencePersona: input.market.targetMarketDescription,
        } as Partial<ZaraTheFocusGroupLeaderToolInput>;
    }


    const {output, usage} = await prompt(flowInputForPrompt, {toolInput: toolContexts});


    if (!output || !output.response) {
      console.error("EVE (AI) did not return a valid response structure.", output);
      return { response: "I seem to be having trouble formulating a complete response at the moment. Could you try rephrasing or asking again shortly?", suggestedNextAction: null };
    }
    
    return {
      response: output.response,
      suggestedNextAction: output.suggestedNextAction === undefined ? null : output.suggestedNextAction,
    };
  }
);
