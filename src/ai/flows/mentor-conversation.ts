
'use server';

/**
 * @fileOverview An AI agent that serves as the "Queen Hive Mind" assistant, 
 * engaging in natural language conversations to provide synthesized business advice, 
 * strategic guidance, and coordinate insights from a team of specialized AI expert agents
 * (e.g., AI Accountant, AI Marketing Guru, AI Operations Manager, AI Expansion Expert, AI Social Media Strategist)
 * within the ForgeSim simulation. It can also suggest next steps for navigation and call tools.
 *
 * - mentorConversation - A function that handles the conversation with the AI Hive Mind.
 * - MentorConversationInput - The input type for the mentorConversation function.
 * - MentorConversationOutput - The return type for the mentorConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { aiAccountantTool } from '@/ai/tools/accountant-tool';
import { aiMarketingGuruTool } from '@/ai/tools/marketing-guru-tool';
import { aiOperationsManagerTool } from '@/ai/tools/operations-manager-tool';
import { aiExpansionExpertTool } from '@/ai/tools/expansion-expert-tool';
import type { AccountantToolInput } from '@/types/simulation'; 

const MentorConversationInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to the AI Hive Mind assistant.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'tool_response']),
    content: z.string(),
  })).optional().describe('The conversation history between the user and the AI Hive Mind assistant. Includes user messages, previous Hive Mind responses, and tool responses.'),
  simulationMonth: z.number().optional().describe("Current month in the simulation (e.g., 0 for initial setup, 1 for first month, etc.)."),
  financials: z.object({
    cashOnHand: z.number().optional(),
    burnRate: z.number().optional(),
    revenue: z.number().optional(),
    expenses: z.number().optional(),
    currencyCode: z.string().optional(),
    currencySymbol: z.string().optional(),
  }).optional().describe("Key financial figures from the current simulation state, including currency details."),
  currentSimulationPage: z.string().optional().describe("The current page the user is on in the ForgeSim app, e.g., '/app/dashboard'. Used for context-aware navigation suggestions."),
  isSimulationInitialized: z.boolean().optional().describe("Whether the simulation has been set up."),
  // Contextual data for other tools - the AI will formulate queries based on this and user input.
  product: z.object({
    stage: z.string().optional(), // e.g., 'mvp', 'growth'
    name: z.string().optional(),
  }).optional().describe("Current product details."),
  resources: z.object({
    marketingSpend: z.number().optional(),
    team: z.array(z.object({ role: z.string(), count: z.number() })).optional(),
  }).optional().describe("Current resource allocation."),
  market: z.object({
    targetMarketDescription: z.string().optional(),
  }).optional().describe("Current market focus."),
});

export type MentorConversationInput = z.infer<typeof MentorConversationInputSchema>;

const SuggestedNextActionSchema = z.object({
  page: z.string().describe("The recommended page URL to navigate to (e.g., '/app/dashboard', '/app/simulation', '/app/strategy')."),
  label: z.string().describe("The text for the button/link for this action (e.g., 'View Your Dashboard', 'Adjust Budgets', 'Analyze Strategy')."),
});

const MentorConversationOutputSchema = z.object({
  response: z.string().describe('The AI Hive Mind assistant\'s response to the user input, potentially synthesizing information from its specialized AI agents or tools.'),
  suggestedNextAction: SuggestedNextActionSchema.optional().nullable().describe("A suggested next action or page for the user to navigate to, based on the conversation or implied needs. If no suggestion, this can be omitted or null."),
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
  name: 'hiveMindConversationPrompt',
  tools: [aiAccountantTool, aiMarketingGuruTool, aiOperationsManagerTool, aiExpansionExpertTool],
  input: {
    schema: PromptInputSchemaWithProcessedHistory,
  },
  output: { 
    schema: MentorConversationOutputSchema,
  },
  system: `You are the AI "Queen Hive Mind" for ForgeSim, a sophisticated business simulation platform. Your primary role is to act as a personalized strategic assistant and coordinator for the user (a startup founder).
You interface with a team of specialized AI expert agents: an AI Accountant, AI Marketing Guru, AI Operations Manager, and an AI Expansion Expert.
When responding, synthesize information and insights as if you are actively consulting these agents. For example:
- "My AI Accountant, after reviewing your numbers, suggests..." (You have access to 'aiAccountantTool' for financial details.)
- "The AI Marketing Guru believes focusing on content marketing could be beneficial because..." (Use 'aiMarketingGuruTool' if the user asks about marketing strategy, campaigns, or spend effectiveness.)
- "Regarding scaling operations, the AI Operations Manager advises..." (Use 'aiOperationsManagerTool' for questions on team structure, operational efficiency, or scaling challenges.)
- "The AI Expansion Expert notes that entering the '{{market.targetMarketDescription}}' market requires..." (Use 'aiExpansionExpertTool' if the user discusses new markets, internationalization, or expansion risks.)
Your tone should be knowledgeable, insightful, supportive, proactive, and slightly futuristic, befitting an advanced AI coordinator.
You are a core part of their strategic toolkit within the ForgeSim simulation, guiding them through its complexities.

Current simulation context (if available):
- Simulation Month: {{simulationMonth}}
- Is Simulation Initialized: {{isSimulationInitialized}}
- User is on page: {{currentSimulationPage}}
- Company Financials:
  - Cash on Hand: {{financials.currencySymbol}}{{financials.cashOnHand}} ({{financials.currencyCode}})
  - Monthly Burn Rate: {{financials.currencySymbol}}{{financials.burnRate}} ({{financials.currencyCode}})
  - Monthly Revenue: {{financials.currencySymbol}}{{financials.revenue}} ({{financials.currencyCode}})
  - Monthly Expenses: {{financials.currencySymbol}}{{financials.expenses}} ({{financials.currencyCode}})
- Product Details:
  - Name: {{product.name}}
  - Stage: {{product.stage}}
- Resources:
  - Marketing Spend: {{financials.currencySymbol}}{{resources.marketingSpend}}/month
  - Team: {{#each resources.team}}{{{count}}}x {{{role}}}{{#unless @last}}, {{/unless}}{{/each}}
- Market:
  - Target Market: {{market.targetMarketDescription}}

Analyze the user's input in the context of an ongoing business simulation. Consider their goals, current situation, challenges, and the data they might be referencing. Use the conversation history to maintain context and provide coherent, evolving advice.
When discussing financial figures, always use the provided currency symbol (e.g., {{financials.currencySymbol}}).

Based on the user's query and the simulation context:
1. Provide a direct, thoughtful response, synthesizing insights as if from your specialized AI agents. 
   - If the query is about detailed finances, accounting, runway, or profit margins, consider using the 'aiAccountantTool'. It needs cashOnHand, burnRate, monthlyRevenue, monthlyExpenses, and the currencySymbol.
   - If the query is about marketing strategy, user acquisition, or campaign ideas, use the 'aiMarketingGuruTool'. Formulate a specific query for the tool based on the conversation.
   - If the query is about scaling, team structure, operational efficiency, or hiring, use the 'aiOperationsManagerTool'. Formulate a specific query for the tool.
   - If the query is about entering new markets, international expansion, or assessing expansion risks, use the 'aiExpansionExpertTool'. Formulate a specific query for the tool.
2. Proactively suggest a next logical step or page within the ForgeSim app if the conversation or user's implied needs strongly indicate it. Your goal is to help the user navigate ForgeSim effectively.
   Navigation suggestions should be in the 'suggestedNextAction' field with 'page' and 'label'.
   Only provide a 'suggestedNextAction' if it's a clear, relevant, and helpful next step. Do not force it.

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
  Hive Mind: {{{content}}}
  {{else if isToolResponse}}
  Tool Response (for Hive Mind's use): {{{content}}}
  {{/if}}
  {{/each}}
  {{/if}}
  `,
});

const mentorConversationFlow = ai.defineFlow(
  {
    name: 'hiveMindConversationFlow',
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

    // The entire input object is available to the LLM when it decides to call a tool.
    // The LLM will formulate the specific 'query' for the specialized tools based on this context.
    const flowInputForPrompt = {
      userInput: input.userInput,
      conversationHistory: processedHistoryForPrompt,
      simulationMonth: input.simulationMonth,
      financials: input.financials,
      currentSimulationPage: input.currentSimulationPage,
      isSimulationInitialized: input.isSimulationInitialized,
      product: input.product,
      resources: input.resources,
      market: input.market,
    };
    
    // Only explicitly prepare input for tools that need specific structured data
    // not easily inferable by the LLM from the main input and have a complex input schema.
    // The accountantTool is an example. The new tools with simple { query: string } inputs
    // don't need explicit `toolInput` here, as the LLM forms the query itself.
    const accountantToolInputContext: AccountantToolInput | undefined = input.financials ? {
        simulationMonth: input.simulationMonth,
        cashOnHand: input.financials.cashOnHand,
        burnRate: input.financials.burnRate,
        monthlyRevenue: input.financials.revenue,
        monthlyExpenses: input.financials.expenses,
        currencySymbol: input.financials.currencySymbol,
    } : undefined;

    // Pass the accountant tool's specific input context if financials are available.
    // Other tools will derive their simple 'query' input from the main `flowInputForPrompt` context
    // as decided by the LLM.
    const toolContexts = accountantToolInputContext ? { [aiAccountantTool.name]: accountantToolInputContext } : {};

    const {output} = await prompt(flowInputForPrompt, {toolInput: toolContexts});


    if (!output || !output.response) {
      console.error("Hive Mind AI did not return a valid response structure.", output);
      return { response: "I seem to be having trouble formulating a complete response at the moment. Could you try rephrasing or asking again shortly?", suggestedNextAction: null };
    }
    
    return {
      response: output.response,
      suggestedNextAction: output.suggestedNextAction === undefined ? null : output.suggestedNextAction,
    };
  }
);
