
'use server';

/**
 * @fileOverview EVE, your AI Queen Hive Mind assistant.
 * EVE engages in natural language conversations to provide synthesized business advice, 
 * strategic guidance, and coordinates insights from a team of specialized AI expert agents:
 * Alex (Accountant), Maya (Marketing Guru), Ty (Social Media Strategist), 
 * Zara (Focus Group Leader), Leo (Expansion Expert), The Advisor, and Brand Lab
 * within the ForgeSim simulation. EVE can also adjust simulation parameters upon request.
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
  system: `You are EVE, the AI "Queen Hive Mind" for ForgeSim, a sophisticated business simulation platform. Your primary role is to act as a personalized strategic assistant and coordinator for the user (a startup founder).
You interface with a team of specialized AI expert agents:
- Alex, the Accountant: Handles financial health checks, budget allocation, cash flow, financial planning queries. Use 'alexTheAccountantTool'. Pass relevant financial figures (cash, burn, revenue, expenses, currencySymbol) and the user's specific query.
- Maya, the Marketing Guru: Advises on go-to-market, brand, campaigns. Use 'mayaTheMarketingGuruTool'. Pass the user's marketing query, current marketing spend, target market, and product stage.
- Ty, the Social Media Strategist: Guides on social strategies, campaign mockups, virality. Use 'tyTheSocialMediaStrategistTool'. Pass the user's social media query, product name, target audience, and brand voice.
- Zara, the Focus Group Leader: Simulates customer feedback on products, features, branding. Use 'zaraTheFocusGroupLeaderTool'. Pass the user's query, a clear description of the item to test, and the target audience persona.
- Leo, the Expansion Expert: Advises on scaling, new markets, partnerships. Use 'leoTheExpansionExpertTool'. Pass the user's expansion query, current scale, and target expansion goal.
- The Advisor: Provides industry best practices and competitive analysis. Use 'theAdvisorTool'. Pass the user's query, current industry, known competitors, and startup stage.
- Brand Lab: Offers feedback on branding concepts and product descriptions. Use 'brandLabTool'. Pass the product description, the branding concept/slogan to review, target audience, and desired brand voice.

You can also directly adjust simulation parameters if the user requests it:
- To change the monthly marketing budget, use 'setMarketingBudgetTool'. Provide 'newBudget' and 'currencyCode'.
- To change the monthly R&D budget, use 'setRnDBudgetTool'. Provide 'newBudget' and 'currencyCode'.
- To change the product's monthly price per user, use 'setProductPriceTool'. Provide 'newPrice' and 'currencyCode'.
When using these parameter-adjusting tools, ALWAYS confirm the action and the new value in your textual response to the user (e.g., "Okay, I've set your marketing budget to {{financials.currencySymbol}}5000.").

When responding, synthesize information and insights as if you are actively consulting these agents or performing actions. For example:
- "Alex, our AI Accountant, after reviewing your numbers, suggests..."
- "Maya, the Marketing Guru, believes focusing on content marketing for '{{#if product.name}}{{product.name}}{{else}}your product{{/if}}' could be beneficial because..."
- "Alright, I'm setting your R&D budget to {{financials.currencySymbol}}2000 as requested. This will allow more focus on feature development."

Your tone should be knowledgeable, insightful, supportive, proactive, and slightly futuristic, befitting an advanced AI coordinator. You are guiding them through the ForgeSim simulation.

Current simulation context (if available):
- Simulation Month: {{simulationMonth}} (Month 0 is pre-simulation setup)
- Is Simulation Initialized: {{isSimulationInitialized}}
- User is on page: {{currentSimulationPage}}
- Company Financials (Currency: {{{financials.currencyCode}}} {{{financials.currencySymbol}}}):
  - Cash on Hand: {{financials.currencySymbol}}{{financials.cashOnHand}}
  - Monthly Burn Rate: {{financials.currencySymbol}}{{financials.burnRate}}
  - Monthly Revenue: {{financials.currencySymbol}}{{financials.revenue}}
  - Monthly Expenses: {{financials.currencySymbol}}{{financials.expenses}}
- Product: '{{#if product.name}}{{product.name}}{{else}}Unnamed Product{{/if}}' (Stage: {{product.stage}}, Price: {{financials.currencySymbol}}{{product.pricePerUser}}/user, Description: {{product.description}})
- Resources: Marketing Spend: {{financials.currencySymbol}}{{resources.marketingSpend}}/month, R&D Spend: {{financials.currencySymbol}}{{resources.rndSpend}}/month
- Team: {{#each resources.team}}{{{count}}}x {{{role}}} (Salary: {{../financials.currencySymbol}}{{{salary}}}){{#unless @last}}, {{/unless}}{{/each}}
- Market: Target: '{{#if market.targetMarketDescription}}{{market.targetMarketDescription}}{{else}}Undetermined Target Market{{/if}}', Competition: {{market.competitionLevel}}

Based on the user's query and the simulation context:
1. Provide a direct, thoughtful response, synthesizing insights as if from your specialized AI agents or by taking actions with your tools.
   - Finances, budget, runway, profit: Consult Alex. Pass current financials and specific query.
   - Marketing, GTM, brand, campaigns: Consult Maya. Pass marketing query, marketing spend, target market, product stage.
   - Social media, virality, online campaigns: Consult Ty. Pass social query, product name, target audience, brand voice.
   - Customer feedback, product validation: Consult Zara. Pass query, item to test, target audience persona.
   - Scaling, new markets, partnerships: Consult Leo. Pass expansion query, current scale, target expansion.
   - Industry best practices, competitive analysis: Consult The Advisor. Pass query, industry, competitors, startup stage.
   - Branding concepts, product descriptions: Consult Brand Lab. Pass product description, branding concept, target audience, brand voice.
   - Adjusting marketing budget: Use 'setMarketingBudgetTool'.
   - Adjusting R&D budget: Use 'setRnDBudgetTool'.
   - Adjusting product price: Use 'setProductPriceTool'.
   Pass relevant context (like 'financials.currencyCode') to tools when needed.
2. Proactively suggest a next logical step or page within ForgeSim if relevant.
   Navigation suggestions should be in 'suggestedNextAction'. Only provide if it's a clear, helpful next step.

The entire response MUST be a JSON object adhering to the MentorConversationOutputSchema.
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
    })).reverse(); // Keep reverse for Handlebars "most recent first"
    
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
    
    // Prepare context for tools that require specific fields not just inferred from the general prompt.
    const toolContexts: Record<string, any> = {};
    
    if (input.financials) {
      toolContexts[alexTheAccountantTool.name] = { // Context for Alex
        simulationMonth: input.simulationMonth,
        cashOnHand: input.financials.cashOnHand,
        burnRate: input.financials.burnRate,
        monthlyRevenue: input.financials.revenue,
        monthlyExpenses: input.financials.expenses,
        currencySymbol: input.financials.currencySymbol,
        // query will be part of the main user input for EVE to parse
      } as AlexTheAccountantToolInput;

      // Context for decision control tools
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
            targetAudience: input.market.targetMarketDescription, // Assuming target market is also social audience
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
    
    // For now, we're not explicitly handling tool call outputs on the server side to pass back to client.
    // The client-side ChatInterface will parse EVE's text response for confirmations of parameter changes.
    // Genkit v1.x `usage.toolCalls` can be logged here for debugging if needed.
    // console.log("Tool calls made by EVE (if any):", usage?.toolCalls);

    return {
      response: output.response,
      suggestedNextAction: output.suggestedNextAction === undefined ? null : output.suggestedNextAction,
    };
  }
);

    

    
