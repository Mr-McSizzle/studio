
'use server';

/**
 * @fileOverview An AI agent that serves as the "Queen Hive Mind" assistant, 
 * engaging in natural language conversations to provide synthesized business advice, 
 * strategic guidance, and coordinate insights within the ForgeSim simulation.
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
    role: z.enum(['user', 'assistant']), // 'assistant' refers to the Hive Mind's previous responses
    content: z.string(),
  })).optional().describe('The conversation history between the user and the AI Hive Mind assistant. Includes user messages and previous Hive Mind responses.'),
});

export type MentorConversationInput = z.infer<typeof MentorConversationInputSchema>;

const MentorConversationOutputSchema = z.object({
  response: z.string().describe('The AI Hive Mind assistant\'s response to the user input.'),
});

export type MentorConversationOutput = z.infer<typeof MentorConversationOutputSchema>;

export async function mentorConversation(input: MentorConversationInput): Promise<MentorConversationOutput> {
  return mentorConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hiveMindConversationPrompt',
  input: {
    schema: MentorConversationInputSchema.extend({ 
      // Internal schema extension for template logic
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

Provide your response as the AI Hive Mind. Your response should be thoughtful and directly address the user's query, offering guidance, asking clarifying questions if needed, or suggesting areas to explore within their simulation.
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
    // Process conversation history for the template
    const processedHistory = input.conversationHistory?.map(msg => ({
      ...msg,
      isUser: msg.role === 'user',
    }));

    const flowInput = {
      userInput: input.userInput,
      processedConversationHistory: processedHistory,
    };
    
    const {output} = await prompt(flowInput);

    if (!output || !output.response) {
      console.error("Hive Mind AI did not return a valid response structure.", output);
      return { response: "I seem to be having trouble formulating a complete response at the moment. Could you try rephrasing or asking again shortly?" };
    }

    return {
      response: output.response,
    };
  }
);
