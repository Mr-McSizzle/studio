
'use server';

/**
 * @fileOverview An AI agent that serves as a mentor and engages in natural language conversations
 * to provide business advice and guidance within the simulation.
 *
 * - mentorConversation - A function that handles the conversation with the AI mentor.
 * - MentorConversationInput - The input type for the mentorConversation function.
 * - MentorConversationOutput - The return type for the mentorConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MentorConversationInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to the AI mentor.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The conversation history between the user and the AI mentor.'),
});

export type MentorConversationInput = z.infer<typeof MentorConversationInputSchema>;

const MentorConversationOutputSchema = z.object({
  response: z.string().describe('The AI mentor response to the user input.'),
});

export type MentorConversationOutput = z.infer<typeof MentorConversationOutputSchema>;

export async function mentorConversation(input: MentorConversationInput): Promise<MentorConversationOutput> {
  return mentorConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentorConversationPrompt',
  input: {
    schema: MentorConversationInputSchema.extend({ // Extend schema for internal processing
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        isUser: z.boolean().optional(), // Add isUser for template logic
      })).optional(),
    }),
  },
  output: {
    schema: MentorConversationOutputSchema,
  },
  prompt: `You are an AI business mentor within a business simulation. Your goal is to provide advice and guidance to the user based on their input and the current state of the simulation.

  The user is seeking your advice. Use the conversation history to provide tailored and helpful responses.

  Current User Input: {{{userInput}}}

  {{#if conversationHistory}}
  Conversation History:
  {{#each conversationHistory}}
  {{#if isUser}}
  User: {{{content}}}
  {{else}}
  Mentor: {{{content}}}
  {{/if}}
  {{/each}}
  {{/if}}

  Provide your response as the AI mentor:
  {{output}}
  `,
});

const mentorConversationFlow = ai.defineFlow(
  {
    name: 'mentorConversationFlow',
    inputSchema: MentorConversationInputSchema,
    outputSchema: MentorConversationOutputSchema,
  },
  async (input: MentorConversationInput) => {
    const processedInput = {
      ...input,
      conversationHistory: input.conversationHistory?.map(msg => ({
        ...msg,
        isUser: msg.role === 'user',
      })),
    };
    const {output} = await prompt(processedInput);

    return {
      response: output!.response,
    };
  }
);
