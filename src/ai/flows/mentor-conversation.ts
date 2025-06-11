
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
import type { AccountantToolInputSchema } from '@/types/simulation'; // For context passing

const MentorConversationInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to the AI Hive Mind assistant.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'tool_response']), // Added tool_response
    content: z.string(),
  })).optional().describe('The conversation history between the user and the AI Hive Mind assistant. Includes user messages, previous Hive Mind responses, and tool responses.'),
  // Contextual information from the simulation store
  simulationMonth: z.number().optional().describe("Current month in the simulation (e.g., 0 for initial setup, 1 for first month, etc.)."),
  financials: z.object({ // Simplified financials for context
    cashOnHand: z.number().optional(),
    burnRate: z.number().optional(),
    revenue: z.number().optional(), // Monthly revenue
    expenses: z.number().optional(), // Monthly expenses
  }).optional().describe("Key financial figures from the current simulation state."),
  currentSimulationPage: z.string().optional().describe("The current page the user is on in the ForgeSim app, e.g., '/app/dashboard'. Used for context-aware navigation suggestions."),
  isSimulationInitialized: z.boolean().optional().describe("Whether the simulation has been set up."),
});

export type MentorConversationInput = z.infer<typeof MentorConversationInputSchema>;

const SuggestedNextActionSchema = z.object({
  page: z.string().describe("The recommended page URL to navigate to (e.g., '/app/dashboard', '/app/simulation/decisions', '/app/strategy/analysis')."),
  label: z.string().describe("The text for the button/link for this action (e.g., 'View Your Dashboard', 'Adjust Budgets', 'Analyze Strategy')."),
});

const MentorConversationOutputSchema = z.object({
  response: z.string().describe('The AI Hive Mind assistant\'s response to the user input, potentially synthesizing information from its specialized AI agents or tools.'),
  suggestedNextAction: SuggestedNextActionSchema.optional().describe("A suggested next action or page for the user to navigate to, based on the conversation or implied needs."),
});

export type MentorConversationOutput = z.infer<typeof MentorConversationOutputSchema>;

export async function mentorConversation(input: MentorConversationInput): Promise<MentorConversationOutput> {
  return mentorConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hiveMindConversationPrompt',
  tools: [aiAccountantTool], // Add tools here
  input: {
    schema: MentorConversationInputSchema.extend({ 
      // processedConversationHistory is for prompt display, not direct AI input schema
    }),
  },
  output: { // Define the expected output structure for the AI
    schema: MentorConversationOutputSchema,
  },
  // System prompt to guide the AI's behavior
  system: `You are the AI "Queen Hive Mind" for ForgeSim, a sophisticated business simulation platform. Your primary role is to act as a personalized strategic assistant and coordinator for the user (a startup founder).
You interface with a team of specialized AI expert agents: an AI Accountant, AI Marketing Guru, AI Social Media Strategist, AI Operations Manager, and an AI Expansion Expert.
When responding, synthesize information and insights as if you are actively consulting these agents. For example:
- "My AI Accountant, after reviewing your numbers, suggests..." (You have access to an 'aiAccountantTool' if needed for financial details.)
- "The AI Marketing Guru believes focusing on content marketing could be beneficial because..."
- "Regarding scaling operations, the AI Operations Manager advises..."
Your tone should be knowledgeable, insightful, supportive, proactive, and slightly futuristic, befitting an advanced AI coordinator.
You are a core part of their strategic toolkit within the ForgeSim simulation, guiding them through its complexities.

Current simulation context (if available):
- Simulation Month: {{simulationMonth}}
- Is Initialized: {{isSimulationInitialized}}
- Current Page: {{currentSimulationPage}}
- Cash on Hand: {{financials.cashOnHand}}
- Burn Rate: {{financials.burnRate}}

Analyze the user's input in the context of an ongoing business simulation. Consider their goals, current situation (implied from conversation or provided context), challenges, and the data they might be referencing. Use the conversation history to maintain context and provide coherent, evolving advice.

Based on the user's query and the simulation context:
1. Provide a direct, thoughtful response, synthesizing insights as if from your specialized AI agents. If the user's query is about finances or accounting, consider using the 'aiAccountantTool' to get specific calculations or summaries.
2. Proactively suggest a next logical step or page within the ForgeSim app if the conversation or user's implied needs strongly indicate it. Your goal is to help the user navigate ForgeSim effectively and make the most of the simulation.
   Navigation suggestions should be in the 'suggestedNextAction' field with 'page' and 'label'.
   Examples for suggestedNextAction:
   - If they just completed setup (simulationMonth is 0 or 1 and isInitialized is true): { "page": "/app/dashboard", "label": "View Your Digital Twin Dashboard" }
   - If they ask about budget decisions or resource allocation and are not on the simulation page: { "page": "/app/simulation", "label": "Adjust Budgets & Resources" }
   - If they ask for strategic analysis or risk assessment: { "page": "/app/strategy", "label": "Get Strategic Analysis" }
   - If they are discussing progress or achievements: { "page": "/app/gamification", "label": "Check Milestones & Score" }
   - If they express uncertainty about what to do next: { "page": "/app/dashboard", "label": "Review Current Status" } or { "page": "/app/mentor", "label": "Continue Chatting" }
   Only provide a 'suggestedNextAction' if it's a clear, relevant, and helpful next step. Do not force it. The label should be concise and action-oriented.

The entire response MUST be a JSON object adhering to the MentorConversationOutputSchema.
Specifically, include 'response' and optionally 'suggestedNextAction'.
Ensure the 'response' field contains your complete textual answer to the user.
Ensure the 'suggestedNextAction' (if provided) has 'page' and 'label'.
`,
  prompt: `{{{userInput}}}
  
  {{#if conversationHistory}}
  Conversation History (most recent first):
  {{#each conversationHistory}}
  {{#if (eq role "user")}}
  Founder: {{{content}}}
  {{else if (eq role "assistant")}}
  Hive Mind: {{{content}}}
  {{else if (eq role "tool_response")}}
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
    
    // Prepare history for the prompt (most recent first)
    const processedHistoryForPrompt = input.conversationHistory?.map(msg => ({
      role: msg.role,
      content: msg.content,
    })).reverse();

    const flowInputForPrompt = {
      userInput: input.userInput,
      conversationHistory: processedHistoryForPrompt, // Pass processed history
      simulationMonth: input.simulationMonth,
      financials: input.financials,
      currentSimulationPage: input.currentSimulationPage,
      isSimulationInitialized: input.isSimulationInitialized,
    };
    
    // Pass the financial context to the aiAccountantTool if it's called
    const toolInput = input.financials ? {
        simulationMonth: input.simulationMonth,
        cashOnHand: input.financials.cashOnHand,
        burnRate: input.financials.burnRate,
        monthlyRevenue: input.financials.revenue,
        monthlyExpenses: input.financials.expenses,
    } as z.infer<typeof AccountantToolInputSchema> : undefined;


    const {output} = await prompt(flowInputForPrompt, {toolInput: toolInput });


    if (!output || !output.response) {
      console.error("Hive Mind AI did not return a valid response structure.", output);
      return { response: "I seem to be having trouble formulating a complete response at the moment. Could you try rephrasing or asking again shortly?" };
    }

    return {
      response: output.response,
      suggestedNextAction: output.suggestedNextAction // This could be undefined if AI doesn't suggest one
    };
  }
);
