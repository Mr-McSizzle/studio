
'use server';

/**
 * @fileOverview An AI agent that serves as the "Queen Hive Mind" assistant, 
 * engaging in natural language conversations to provide synthesized business advice, 
 * strategic guidance, and coordinate insights from a team of specialized AI expert agents
 * (e.g., AI Accountant, AI Marketing Guru, AI Operations Manager, AI Expansion Expert, AI Social Media Strategist)
 * within the ForgeSim simulation. It can also suggest next steps for navigation.
 *
 * - mentorConversation - A function that handles the conversation with the AI Hive Mind.
 * - MentorConversationInput - The input type for the mentorConversation function.
 * - MentorConversationOutput - The return type for the mentorConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MentorConversationInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to the AI Hive Mind assistant.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The conversation history between the user and the AI Hive Mind assistant. Includes user messages and previous Hive Mind responses.'),
  // currentSimulationPage: z.string().optional().describe("The current page the user is on in the ForgeSim app, e.g., '/app/dashboard'."),
  // isSimulationInitialized: z.boolean().optional().describe("Whether the simulation has been set up."),
  // simulationMonth: z.number().optional().describe("Current month in the simulation.")
});

export type MentorConversationInput = z.infer<typeof MentorConversationInputSchema>;

const SuggestedNextActionSchema = z.object({
  page: z.string().describe("The recommended page URL to navigate to (e.g., '/app/dashboard', '/app/simulation', '/app/strategy')."),
  label: z.string().describe("The text for the button/link for this action (e.g., 'View Your Dashboard', 'Adjust Budgets', 'Analyze Strategy')."),
});

const MentorConversationOutputSchema = z.object({
  response: z.string().describe('The AI Hive Mind assistant\'s response to the user input, potentially synthesizing information from its specialized AI agents.'),
  suggestedNextAction: SuggestedNextActionSchema.optional().describe("A suggested next action or page for the user to navigate to, based on the conversation or implied needs."),
});

export type MentorConversationOutput = z.infer<typeof MentorConversationOutputSchema>;

export async function mentorConversation(input: MentorConversationInput): Promise<MentorConversationOutput> {
  return mentorConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hiveMindConversationPrompt',
  input: {
    schema: MentorConversationInputSchema.extend({ 
      processedConversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        isUser: z.boolean().optional(), 
      })).optional(),
    }),
  },
  output: {
    schema: MentorConversationOutputSchema,
  },
  prompt: `You are the AI "Queen Hive Mind" for ForgeSim, a sophisticated business simulation platform. Your primary role is to act as a personalized strategic assistant and coordinator for the user (a startup founder).
You interface with a team of specialized AI expert agents: an AI Accountant, AI Marketing Guru, AI Social Media Strategist, AI Operations Manager, and an AI Expansion Expert.
Your responses should synthesize information and insights as if you are actively consulting these agents. For example:
- "My AI Accountant has reviewed your burn rate and suggests..."
- "The AI Marketing Guru believes focusing on content marketing could be beneficial because..."
- "Regarding scaling operations, the AI Operations Manager advises..."
Your tone should be knowledgeable, insightful, supportive, proactive, and slightly futuristic, befitting an advanced AI coordinator.
You are a core part of their strategic toolkit within the ForgeSim simulation, guiding them through its complexities.

Analyze the user's input in the context of an ongoing business simulation. Consider their goals, current situation (implied from conversation or any provided context like current page or simulation month), challenges, and the data they might be referencing.
Use the conversation history to maintain context and provide coherent, evolving advice.

Based on the user's query and the simulation context:
1. Provide a direct, thoughtful response, synthesizing insights as if from your specialized AI agents.
2. Proactively suggest a next logical step or page within the ForgeSim app if the conversation or user's implied needs strongly indicate it. Your goal is to help the user navigate ForgeSim effectively and make the most of the simulation.
   Examples for suggestedNextAction:
   - If they just completed setup: { "page": "/app/dashboard", "label": "View Your Dashboard" }
   - If they ask about budget decisions or resource allocation: { "page": "/app/simulation", "label": "Adjust Budgets & Resources" }
   - If they ask for strategic analysis or risk assessment: { "page": "/app/strategy", "label": "Get Strategic Analysis" }
   - If they are discussing progress or achievements: { "page": "/app/gamification", "label": "Check Milestones & Score" }
   - If they express uncertainty about what to do next: { "page": "/app/dashboard", "label": "Review Current Status" } or { "page": "/app/mentor", "label": "Continue Chatting" }
   Only provide a 'suggestedNextAction' if it's a clear, relevant, and helpful next step. Do not force it if the conversation is flowing well without a specific navigational need. The label should be concise and action-oriented.

Current User Input: {{{userInput}}}

{{#if processedConversationHistory}}
Conversation History (most recent first):
{{#each processedConversationHistory}}
{{#if isUser}}
Founder: {{{content}}}
{{else}}
Hive Mind: {{{content}}}
{{/if}}
{{/each}}
{{/if}}

Your response should be formatted as a JSON object adhering to the output schema.
Specifically, include 'response' and optionally 'suggestedNextAction'.
Ensure the 'response' field contains your complete textual answer to the user.
Ensure the 'suggestedNextAction' (if provided) has 'page' and 'label'.
`,
});

const mentorConversationFlow = ai.defineFlow(
  {
    name: 'hiveMindConversationFlow',
    inputSchema: MentorConversationInputSchema,
    outputSchema: MentorConversationOutputSchema,
  },
  async (input: MentorConversationInput) => {
    // Process history to be most recent first for the prompt, and add isUser flag
    const processedHistory = input.conversationHistory?.map(msg => ({
      ...msg,
      isUser: msg.role === 'user',
    })).reverse(); // Reverse to show most recent first in prompt

    const flowInput = {
      userInput: input.userInput,
      processedConversationHistory: processedHistory,
      // Pass context if available from calling UI:
      // currentSimulationPage: input.currentSimulationPage,
      // isSimulationInitialized: input.isSimulationInitialized,
      // simulationMonth: input.simulationMonth,
    };
    
    const {output} = await prompt(flowInput);

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

