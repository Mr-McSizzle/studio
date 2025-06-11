
'use server';

/**
 * @fileOverview An AI agent that serves as the "Queen Hive Mind" assistant, 
 * engaging in natural language conversations to provide synthesized business advice, 
 * strategic guidance, and coordinate insights within the ForgeSim simulation.
 * It can also suggest next steps for navigation.
 *
 * - mentorConversation - A function that handles the conversation with the AI Hive Mind.
 * - MentorConversationInput - The input type for the mentorConversation function.
 * - MentorConversationOutput - The return type for the mentorConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// Removed direct Handlebars import as custom helpers are not used directly in template anymore

const MentorConversationInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to the AI Hive Mind assistant.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The conversation history between the user and the AI Hive Mind assistant. Includes user messages and previous Hive Mind responses.'),
  // Optional: Pass simplified simulation state for context if needed for better navigation suggestions
  // currentSimulationMonth: z.number().optional().describe("Current month in the simulation."),
  // isSimulationInitialized: z.boolean().optional().describe("Whether the simulation has been set up.")
});

export type MentorConversationInput = z.infer<typeof MentorConversationInputSchema>;

const SuggestedNextActionSchema = z.object({
  page: z.string().describe("The recommended page URL to navigate to (e.g., '/app/dashboard')."),
  label: z.string().describe("The text for the button/link for this action (e.g., 'Go to Dashboard')."),
});

const MentorConversationOutputSchema = z.object({
  response: z.string().describe('The AI Hive Mind assistant\'s response to the user input.'),
  suggestedNextAction: SuggestedNextActionSchema.optional().describe("A suggested next action or page for the user to navigate to."),
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
  prompt: `You are the AI "Queen Hive Mind" for ForgeSim, a sophisticated business simulation platform. Your primary role is to act as a personalized strategic assistant to the user (a startup founder).
You synthesize information, coordinate insights (as if from various specialized AI expert agents like finance, marketing, operations), and provide clear, actionable advice.
Your tone should be knowledgeable, insightful, supportive, and slightly futuristic, befitting an advanced AI.
You are not just a chatbot; you are a core part of their strategic toolkit within the simulation.

Analyze the user's input in the context of an ongoing business simulation. Consider their goals, challenges, and the data they might be referencing (even if implicitly).
Use the conversation history to maintain context and provide coherent, evolving advice.

Based on the user's query and the simulation context (if provided or implied):
1. Provide a direct, thoughtful response to the user.
2. If appropriate, suggest a next logical step or page within the ForgeSim app that would be helpful for the user. For example:
   - If they just completed setup, suggest going to the dashboard: { "page": "/app/dashboard", "label": "View Your Dashboard" }
   - If they ask about making decisions, suggest the simulation controls: { "page": "/app/simulation", "label": "Adjust Simulation Controls" }
   - If they ask for an analysis, suggest the strategy page: { "page": "/app/strategy", "label": "Get Strategic Analysis" }
   - If they seem lost, you could suggest checking their milestones: { "page": "/app/gamification", "label": "Check Milestones" }
   Only provide a 'suggestedNextAction' if it's a clear and relevant next step. Do not force it.

Current User Input: {{{userInput}}}

{{#if processedConversationHistory}}
Conversation History:
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
Example for suggesting next action:
{
  "response": "Based on your query about improving user numbers, I recommend analyzing your current strategy. You can do this on the Strategy & Analytics page.",
  "suggestedNextAction": {
    "page": "/app/strategy",
    "label": "Analyze Strategy"
  }
}
Example without suggesting next action:
{
  "response": "That's an interesting idea for a feature. Let's consider how it might impact your development timeline and R&D budget in the simulation."
}

{{output}}
  `,
});

const mentorConversationFlow = ai.defineFlow(
  {
    name: 'hiveMindConversationFlow',
    inputSchema: MentorConversationInputSchema,
    outputSchema: MentorConversationOutputSchema,
  },
  async (input: MentorConversationInput) => {
    const processedHistory = input.conversationHistory?.map(msg => ({
      ...msg,
      isUser: msg.role === 'user',
    }));

    const flowInput = {
      userInput: input.userInput,
      processedConversationHistory: processedHistory,
      // You could pass simplified simulation state here if the AI needs it for better navigation suggestions
      // currentSimulationMonth: useSimulationStore.getState().simulationMonth, // Example - careful with direct store access in server flows
      // isSimulationInitialized: useSimulationStore.getState().isInitialized,
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
