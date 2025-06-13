
'use server';

/**
 * @fileOverview EVE, your AI Queen Hive Mind assistant.
 * EVE engages in natural language conversations to provide synthesized business advice, 
 * strategic guidance, and coordinates insights from a team of specialized AI expert agents:
 * Alex (Accountant), Maya (Marketing Guru), Ty (Social Media Strategist), 
 * Zara (Focus Group Leader), Leo (Expansion Expert), The Advisor, and Brand Lab
 * within the ForgeSim simulation.
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

import type { AlexTheAccountantToolInput } from '@/types/simulation'; 

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
  currentSimulationPage: z.string().optional().describe("The current page the user is on in the ForgeSim app, e.g., '/app/dashboard'. Used for context-aware navigation suggestions."),
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
  ],
  input: {
    schema: PromptInputSchemaWithProcessedHistory,
  },
  output: { 
    schema: MentorConversationOutputSchema,
  },
  system: `You are EVE, the AI "Queen Hive Mind" for ForgeSim, a sophisticated business simulation platform. Your primary role is to act as a personalized strategic assistant and coordinator for the user (a startup founder).
You interface with a team of specialized AI expert agents:
- Alex, the Accountant: Handles budget, cash flow, financial planning. Use 'alexTheAccountantTool'.
- Maya, the Marketing Guru: Advises on go-to-market, brand, campaigns. Use 'mayaTheMarketingGuruTool'.
- Ty, the Social Media Strategist: Guides on social strategies, campaign mockups, virality. Use 'tyTheSocialMediaStrategistTool'.
- Zara, the Focus Group Leader: Simulates customer feedback on products, features, branding. Use 'zaraTheFocusGroupLeaderTool'.
- Leo, the Expansion Expert: Advises on scaling, new markets, partnerships. Use 'leoTheExpansionExpertTool'.
- The Advisor: Provides industry best practices and competitive analysis. Use 'theAdvisorTool'.
- Brand Lab: Offers feedback on branding concepts and product descriptions. Use 'brandLabTool'.

When responding, synthesize information and insights as if you are actively consulting these agents. For example:
- "Alex, our AI Accountant, after reviewing your numbers, suggests..."
- "Maya, the Marketing Guru, believes focusing on content marketing for '{{#if product.name}}{{product.name}}{{else}}your product{{/if}}' could be beneficial because..."
- "Ty, our Social Media Strategist, mocked up a campaign targeting '{{#if market.targetMarketDescription}}{{market.targetMarketDescription}}{{else}}your audience{{/if}}'..."
- "Zara ran a simulated focus group on your new feature, and the feedback suggests..."
- "Leo, our Expansion Expert, notes that scaling to enter the '{{#if market.targetMarketDescription}}{{market.targetMarketDescription}}{{else}}target market{{/if}}' requires..."
- "The Advisor highlighted that in the '{{#if market.targetMarketDescription}}{{market.targetMarketDescription}}{{else}}current market{{/if}}', a key best practice is..."
- "The Brand Lab reviewed your concept for '{{#if product.name}}{{product.name}}{{else}}your product{{/if}}' and feels..."

Your tone should be knowledgeable, insightful, supportive, proactive, and slightly futuristic, befitting an advanced AI coordinator. You are guiding them through the ForgeSim simulation.

Current simulation context (if available):
- Simulation Month: {{simulationMonth}} (Month 0 is pre-simulation setup)
- Is Simulation Initialized: {{isSimulationInitialized}}
- User is on page: {{currentSimulationPage}}
- Company Financials (Currency: {{financials.currencyCode}} {{financials.currencySymbol}}):
  - Cash on Hand: {{financials.currencySymbol}}{{financials.cashOnHand}}
  - Monthly Burn Rate: {{financials.currencySymbol}}{{financials.burnRate}}
  - Monthly Revenue: {{financials.currencySymbol}}{{financials.revenue}}
  - Monthly Expenses: {{financials.currencySymbol}}{{financials.expenses}}
- Product: '{{#if product.name}}{{product.name}}{{else}}Unnamed Product{{/if}}' (Stage: {{product.stage}}, Price: {{financials.currencySymbol}}{{product.pricePerUser}}/user)
- Resources: Marketing Spend: {{financials.currencySymbol}}{{resources.marketingSpend}}/month, R&D Spend: {{financials.currencySymbol}}{{resources.rndSpend}}/month
- Team: {{#each resources.team}}{{{count}}}x {{{role}}} (Salary: {{../financials.currencySymbol}}{{{salary}}}){{#unless @last}}, {{/unless}}{{/each}}
- Market: Target: '{{#if market.targetMarketDescription}}{{market.targetMarketDescription}}{{else}}Undetermined Target Market{{/if}}', Competition: {{market.competitionLevel}}

Based on the user's query and the simulation context:
1. Provide a direct, thoughtful response, synthesizing insights as if from your specialized AI agents.
   - Finances, budget, runway, profit: Consult Alex. Pass key financials and query.
   - Marketing, GTM, brand, campaigns: Consult Maya. Pass product/market context, marketing spend.
   - Social media, virality, online campaigns: Consult Ty. Pass product/brand info, target audience.
   - Customer feedback, product validation: Consult Zara. Specify item to test, target persona.
   - Scaling, new markets, partnerships: Consult Leo. Provide current scale, expansion goals.
   - Industry best practices, competitive analysis: Consult The Advisor. Provide industry, competitors.
   - Branding concepts, product descriptions: Consult Brand Lab. Provide concept, product info.
2. Proactively suggest a next logical step or page within ForgeSim if relevant.
   Navigation suggestions should be in 'suggestedNextAction'. Only provide if it's a clear, helpful next step.

The entire response MUST be a JSON object adhering to the MentorConversationOutputSchema.
Include 'response' and optionally 'suggestedNextAction'. If 'suggestedNextAction' is not relevant, it must be null or omitted.
Ensure the 'response' field contains your complete textual answer.
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
      currentSimulationPage: input.currentSimulationPage,
      isSimulationInitialized: input.isSimulationInitialized,
    };
    
    // Prepare specific input for AlexTheAccountantTool if financials are available
    const alexToolInputContext: AlexTheAccountantToolInput | undefined = input.financials ? {
        simulationMonth: input.simulationMonth,
        cashOnHand: input.financials.cashOnHand,
        burnRate: input.financials.burnRate,
        monthlyRevenue: input.financials.revenue,
        monthlyExpenses: input.financials.expenses,
        currencySymbol: input.financials.currencySymbol,
        // EVE will formulate Alex's 'query' field based on the main userInput and context.
    } : undefined;

    const toolContexts: Record<string, any> = {};
    if (alexToolInputContext) {
      toolContexts[alexTheAccountantTool.name] = alexToolInputContext;
    }
    // For other tools (Maya, Ty, Zara, Leo, TheAdvisor, BrandLab), 
    // the LLM will pick relevant fields from the main `flowInputForPrompt` based on their inputSchema.
    // E.g., if Maya's tool needs 'targetMarketDescription', the LLM can pick `flowInputForPrompt.market.targetMarketDescription`.
    // If TheAdvisorTool needs `currentIndustry`, EVE will need to infer this from the conversation or `market.targetMarketDescription`.

    const {output} = await prompt(flowInputForPrompt, {toolInput: toolContexts});

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

    

    